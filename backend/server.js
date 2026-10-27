require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const { sendBookingConfirmation } = require("./emailService");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken, allowRoles } = require("./auth");
console.log("Auth middleware check:", {
  authenticateToken: typeof authenticateToken,
  allowRoles: typeof allowRoles
});

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const authReady = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from .env");
  }
};

// Create the first Admin account only
app.post("/api/auth/setup-admin", async (req, res) => {
  try {
    authReady();

    const setupKey = process.env.ADMIN_SETUP_KEY;

    if (!setupKey || req.headers["x-setup-key"] !== setupKey) {
      return res.status(403).json({
        message: "Invalid setup key."
      });
    }

    const { fullName, email, password } = req.body;

    if (
      typeof fullName !== "string" || !fullName.trim() ||
      typeof email !== "string" || !email.trim() ||
      typeof password !== "string" || password.length < 12
    ) {
      return res.status(400).json({
        message: "Enter a name, valid email, and password of at least 12 characters."
      });
    }

    const existing = await pool.query(
      "SELECT id FROM users LIMIT 1"
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message: "An account already exists. First Admin setup is closed."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'Admin')`,
      [fullName.trim(), email.trim().toLowerCase(), passwordHash]
    );

    return res.status(201).json({
      message: "First Admin account created. You can now log in."
    });
  } catch (error) {
    console.error("Admin setup error:", error.message);
    return res.status(500).json({
      message: "Unable to create Admin account."
    });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    authReady();

    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Enter your email and password."
      });
    }

    const result = await pool.query(
      `SELECT id, full_name, email, password_hash, role
       FROM users
       WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    const user = result.rows[0];

    if (
      !user ||
      !(await bcrypt.compare(password, user.password_hash))
    ) {
      return res.status(401).json({
        message: "Incorrect email or password."
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Unable to log in."
    });
  }
});

// Check the currently logged-in user
app.get(
  "/api/auth/me",
  authenticateToken,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, full_name, email, role
         FROM users
         WHERE id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          message: "Account not found."
        });
      }

      const user = result.rows[0];

      return res.json({
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      console.error("User check error:", error.message);
      return res.status(500).json({
        message: "Unable to verify account."
      });
    }
  }
);


const vehicleFields = `
  id,
  brand,
  model,
  plate_number AS "plateNumber",
  price_per_day::float AS "pricePerDay",
  status
`;

const customerFields = `
  id,
  full_name AS "fullName",
  phone,
  email,
  address,
  created_at AS "createdAt"
`;

// HOME
app.get("/", (req, res) => {
  res.send("Vehicle Rental API is running!");
});

// ==========================
// VEHICLE ROUTES
// ==========================

// GET all vehicles
app.get("/api/vehicles", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${vehicleFields} FROM vehicles ORDER BY id`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to retrieve vehicles." });
  }
});

// GET one vehicle
app.get("/api/vehicles/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${vehicleFields} FROM vehicles WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to retrieve vehicle." });
  }
});

// ADD vehicle
app.post(
  "/api/vehicles",
  authenticateToken,
  allowRoles("Admin"),
  async (req, res) => {
  const { brand, model, plateNumber, pricePerDay, status } = req.body;

  if (
    typeof brand !== "string" || !brand.trim() ||
    typeof model !== "string" || !model.trim() ||
    typeof plateNumber !== "string" || !plateNumber.trim() ||
    pricePerDay === "" ||
    pricePerDay === undefined ||
    !Number.isFinite(Number(pricePerDay)) ||
    Number(pricePerDay) < 0
  ) {
    return res.status(400).json({
      message: "Enter valid vehicle details and a non-negative price."
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO vehicles
       (brand, model, plate_number, price_per_day, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${vehicleFields}`,
      [
        brand.trim(),
        model.trim(),
        plateNumber.trim(),
        Number(pricePerDay),
        status || "Available"
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "That plate number already exists."
      });
    }

    console.error(error.message);
    res.status(500).json({ message: "Failed to add vehicle." });
  }
});

// UPDATE vehicle
app.put(
  "/api/vehicles/:id",
  authenticateToken,
  allowRoles("Admin"),
  async (req, res) => {
  const { brand, model, plateNumber, pricePerDay, status } = req.body;

  if (
    typeof brand !== "string" || !brand.trim() ||
    typeof model !== "string" || !model.trim() ||
    typeof plateNumber !== "string" || !plateNumber.trim() ||
    pricePerDay === "" ||
    pricePerDay === undefined ||
    !Number.isFinite(Number(pricePerDay)) ||
    Number(pricePerDay) < 0
  ) {
    return res.status(400).json({
      message: "Enter valid vehicle details and a non-negative price."
    });
  }

  try {
    const result = await pool.query(
      `UPDATE vehicles
       SET brand = $1,
           model = $2,
           plate_number = $3,
           price_per_day = $4,
           status = $5
       WHERE id = $6
       RETURNING ${vehicleFields}`,
      [
        brand.trim(),
        model.trim(),
        plateNumber.trim(),
        Number(pricePerDay),
        status || "Available",
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "That plate number already exists."
      });
    }

    console.error(error.message);
    res.status(500).json({ message: "Failed to update vehicle." });
  }
});

 // DELETE vehicle — Admin only
app.delete(
  "/api/vehicles/:id",
  authenticateToken,
  allowRoles("Admin"),
  async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid vehicle ID."
      });
    }

    try {
      const result = await pool.query(
        "DELETE FROM vehicles WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          message: "Vehicle not found."
        });
      }

      res.json({
        message: "Vehicle deleted successfully."
      });
    } catch (error) {
      if (error.code === "23503") {
        return res.status(409).json({
          message: "This vehicle has booking records and cannot be deleted."
        });
      }

      console.error("Delete vehicle error:", error.message);
      res.status(500).json({
        message: "Failed to delete vehicle."
      });
    }
  }
);




// SOFT DELETE customer
app.delete(
  "/api/customers/:id",
  authenticateToken,
  allowRoles("Admin"),
  async (req, res) => {
  console.log("DELETE CUSTOMER ROUTE REACHED!");

  const { id } = req.params;

  try {
    const check = await pool.query(
      `SELECT id, full_name, is_deleted
       FROM customers
       WHERE id = $1`,
      [id]
    );

    console.log("Customer before delete:", check.rows);

    const result = await pool.query(
      `UPDATE customers
       SET is_deleted = TRUE
       WHERE id = $1
         AND is_deleted = FALSE
       RETURNING id`,
      [id]
    );

    console.log("Updated rows:", result.rows);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Customer not found or already deleted."
      });
    }

    res.json({ message: "Customer deleted successfully." });
  } catch (error) {
    console.error("Soft delete error:", error.message);
    res.status(500).json({
      message: "Unable to delete customer."
    });
  }
});


// ==========================
// CUSTOMER ROUTES
// ==========================


 // GET all active customers
app.get(
  "/api/customers",
  authenticateToken,
  allowRoles("Admin"),
  async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${customerFields}
       FROM customers
       WHERE is_deleted = FALSE
       ORDER BY id DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Fetch customers error:", error.message);
    res.status(500).json({
      message: "Failed to retrieve customers."
    });
  }
});

// GET one customer
  

// ADD customer
app.post(
  "/api/customers",
  authenticateToken,
  allowRoles("Admin"),
  async (req, res) => {
  const { fullName, phone, email = "", address = "" } = req.body;

  if (
    typeof fullName !== "string" || !fullName.trim() ||
    typeof phone !== "string" || !phone.trim() ||
    typeof email !== "string" ||
    typeof address !== "string"
  ) {
    return res.status(400).json({
      message: "Enter a valid customer name, phone, email, and address."
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO customers
       (full_name, phone, email, address)
       VALUES ($1, $2, $3, $4)
       RETURNING ${customerFields}`,
      [fullName.trim(), phone.trim(), email.trim(), address.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to add customer." });
  }
});

// UPDATE customer
app.put(
  "/api/customers/:id",
  authenticateToken,
  allowRoles("Admin"),
  async (req, res) => {
  const { fullName, phone, email = "", address = "" } = req.body;

  if (
    typeof fullName !== "string" || !fullName.trim() ||
    typeof phone !== "string" || !phone.trim() ||
    typeof email !== "string" ||
    typeof address !== "string"
  ) {
    return res.status(400).json({
      message: "Enter a valid customer name, phone, email, and address."
    });
  }

  try {
    const result = await pool.query(
      `UPDATE customers
       SET full_name = $1,
           phone = $2,
           email = $3,
           address = $4
       WHERE id = $5
       RETURNING ${customerFields}`,
      [
        fullName.trim(),
        phone.trim(),
        email.trim(),
        address.trim(),
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to update customer." });
  }
});



// GET one customer

  
// CREATE customer

// UPDATE customer
app.put("/api/customers/:id", async (req, res) => {
  const { fullName, phone, email, address } = req.body;

  if (!fullName?.trim() || !phone?.trim()) {
    return res.status(400).json({
      message: "Full name and phone number are required."
    });
  }

  try {
    const result = await pool.query(
      `UPDATE customers
       SET full_name = $1, phone = $2, email = $3, address = $4
       WHERE id = $5
       RETURNING id, full_name AS "fullName",
                 phone, email, address,
                 created_at AS "createdAt"`,
      [
        fullName.trim(),
        phone.trim(),
        email || null,
        address || null,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to update customer." });
  }
});

// DELETE customer

/* ==========================
   BOOKING ROUTES
========================== */

// GET all bookings
app.get(
  "/api/bookings",
  authenticateToken,
  allowRoles("Admin"),
  async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        b.id,
        b.customer_id AS "customerId",
        c.full_name AS "customerName",
        b.vehicle_id AS "vehicleId",
        v.brand,
        v.model,
        v.plate_number AS "plateNumber",
        b.start_date AS "startDate",
        b.end_date AS "endDate",
        b.total_price::float AS "totalPrice",
        b.status,
        b.created_at AS "createdAt"
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to retrieve bookings." });
  }
});


 // CHECK VEHICLE AVAILABILITY FOR SELECTED DATES
app.get("/api/bookings/availability", async (req, res) => {
  const { vehicleId, startDate, endDate } = req.query;

  if (
    !Number.isInteger(Number(vehicleId)) ||
    Number(vehicleId) <= 0 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate || "") ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate || "")
  ) {
    return res.status(400).json({
      message: "Please select a vehicle and valid rental dates."
    });
  }

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start.toISOString().slice(0, 10) !== startDate ||
    end.toISOString().slice(0, 10) !== endDate ||
    end < start
  ) {
    return res.status(400).json({
      message: "Please select valid rental dates."
    });
  }

  try {
    const vehicleResult = await pool.query(
      "SELECT id, status FROM vehicles WHERE id = $1",
      [Number(vehicleId)]
    );

if (vehicleResult.rows[0].status !== "Available") {
  await client.query("ROLLBACK");
  return res.status(409).json({
    message: "This vehicle is currently unavailable."
  });
}

    if (vehicleResult.rows[0].status !== "Available") {
      return res.json({
        available: false,
        message: "This vehicle is currently unavailable."
      });
    }

    const result = await pool.query(
      `SELECT EXISTS (
         SELECT 1
         FROM bookings
         WHERE vehicle_id = $1
           AND status <> 'Cancelled'
           AND start_date <= $3::date
           AND end_date >= $2::date
       ) AS booked`,
      [Number(vehicleId), startDate, endDate]
    );

    const available = !result.rows[0].booked;

    return res.json({
      available,
      message: available
        ? "This vehicle is available for your selected dates!"
        : "This vehicle is already booked for some of those dates."
    });
  } catch (error) {
    console.error("Availability check error:", error.message);

    return res.status(500).json({
      message: "Unable to check vehicle availability."
    });
  }
});

app.get("/api/bookings/availability", async (req, res) => {
  // Your existing availability code stays here.
});

// PASTE THE NEW DASHBOARD ROUTE HERE
app.get("/api/admin/dashboard", authenticateToken, allowRoles("Admin"), async (req, res) => {
  try {
const [vehicles, available, customers, bookings] = await Promise.all([
  pool.query("SELECT COUNT(*)::int AS total FROM vehicles"),
  pool.query(
    "SELECT COUNT(*)::int AS total FROM vehicles WHERE status = 'Available'"
  ),
  pool.query("SELECT COUNT(*)::int AS total FROM customers"),
  pool.query("SELECT COUNT(*)::int AS total FROM bookings")
]);

res.json({
  totalVehicles: vehicles.rows[0].total,
  availableVehicles: available.rows[0].total,
  totalCustomers: customers.rows[0].total,
  totalBookings: bookings.rows[0].total
});
  } catch (error) {
    console.error("Admin dashboard error:", error.message);
    res.status(500).json({
      message: "Unable to load dashboard statistics."
    });
  }
});


// CREATE a booking

app.post("/api/bookings", async (req, res) => {
  const {
    customerId,
    fullName,
    phone,
    email,
    address,
    vehicleId,
    startDate,
    endDate
  } = req.body;


 
  const hasCustomerDetails =
    typeof fullName === "string" &&
    fullName.trim().length > 0 &&
    typeof phone === "string" &&
    phone.trim().length > 0;

  if (
    !hasCustomerDetails ||
    !Number.isInteger(Number(vehicleId)) ||
    Number(vehicleId) <= 0 ||
    typeof startDate !== "string" ||
    typeof endDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
  ) {
    return res.status(400).json({
      message: "Enter your name, phone number, a valid vehicle, and rental dates."
    });
  }

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start.toISOString().slice(0, 10) !== startDate ||
    end.toISOString().slice(0, 10) !== endDate ||
    end < start
  ) {
    return res.status(400).json({
      message: "The end date must be on or after the start date."
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock the vehicle while checking its availability.
    const vehicleResult = await client.query(
      `SELECT id, price_per_day
       FROM vehicles
       WHERE id = $1
       FOR UPDATE`,
      [Number(vehicleId)]
    );

    if (vehicleResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Vehicle not found." });
    }

   const customerResult = await client.query(
  `INSERT INTO customers (full_name, phone, email, address)
   VALUES ($1, $2, $3, $4)
   RETURNING id, full_name AS "fullName", phone, email, address`,
  [
    fullName.trim(),
    phone.trim(),
    typeof email === "string" && email.trim() ? email.trim() : null,
    typeof address === "string" && address.trim() ? address.trim() : null
  ]
);

const newCustomerId = customerResult.rows[0].id;
    // Check for overlapping, non-cancelled bookings.
    const conflict = await client.query(
      `SELECT id
       FROM bookings
       WHERE vehicle_id = $1
         AND status <> 'Cancelled'
         AND start_date <= $3::date
         AND end_date >= $2::date
       LIMIT 1`,
      [Number(vehicleId), startDate, endDate]
    );

    if (conflict.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "This vehicle is already booked for those dates."
      });
    }

    // Count both the start and end dates as rental days.
    const days =
      Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

    const totalPrice =
      Number(vehicleResult.rows[0].price_per_day) * days;

    const bookingResult = await client.query(
     `INSERT INTO bookings
 (customer_id, vehicle_id, start_date, end_date, total_price, status)
 VALUES ($1, $2, $3, $4, $5, 'Pending')
 RETURNING
   id,
   customer_id AS "customerId",
   vehicle_id AS "vehicleId",
   start_date AS "startDate",
   end_date AS "endDate",
   total_price::float AS "totalPrice",
   status`,
     [
  newCustomerId,
  Number(vehicleId),
  startDate,
  endDate,
  totalPrice
]
    );

await client.query("COMMIT");
    
    

let emailSent = false;

try {
  const detailsResult = await pool.query(
    `SELECT
       c.full_name AS "fullName",
       c.email,
       v.brand,
       v.model
     FROM customers c
     JOIN vehicles v ON v.id = $2
     WHERE c.id = $1`,
    [newCustomerId, Number(vehicleId)]
  );

  if (detailsResult.rows.length === 0) {
    throw new Error("Customer or vehicle details not found.");
  }

  const details = detailsResult.rows[0];
  const recipient = details.email?.trim();

  if (!recipient) {
    throw new Error("The customer has no email address.");
  }

  const mailResult = await sendBookingConfirmation({
    customer: {
      fullName: details.fullName,
      email: recipient,
    },
    vehicle: {
      brand: details.brand,
      model: details.model,
    },
    startDate,
    endDate,
    totalPrice,
  });

  if (!mailResult || !Array.isArray(mailResult.accepted)) {
    throw new Error(
      "Email service did not return recipient acceptance details. Check emailService.js."
    );
  }

  const accepted = mailResult.accepted.some(
    (address) =>
      String(address).toLowerCase() === recipient.toLowerCase()
  );

  if (!accepted) {
    throw new Error(
      `The mail server did not accept the recipient: ${recipient}.`
    );
  }

  emailSent = true;

  console.log("Email accepted by mail server:", recipient);
  console.log("Email message ID:", mailResult.messageId);
  console.log("Mail server response:", mailResult.response);

} catch (emailError) {
  console.error(
    "Booking saved, but confirmation email failed:",
    emailError.message
  );
}



res.status(201).json({
  message: emailSent
    ? "Booking created and confirmation email sent."
    : "Booking created, but the confirmation email was not sent.",
  booking: bookingResult.rows[0],
  emailSent,
});

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error.message);
    res.status(500).json({ message: "Failed to create booking." });
  } finally {
    client.release();
  }
});

 // EDIT an existing booking
app.put(
  "/api/bookings/:id",
  authenticateToken,
  allowRoles("Admin"),
  async (req, res) => {
  const { customerId, vehicleId, startDate, endDate } = req.body;
  const bookingId = Number(req.params.id);

  
  const isExistingCustomer =
    Number.isInteger(Number(customerId)) && Number(customerId) > 0;

  const hasCustomerDetails =
    typeof fullName === "string" &&
    fullName.trim().length > 0 &&
    typeof phone === "string" &&
    phone.trim().length > 0;

  if (
    (!isExistingCustomer && !hasCustomerDetails) ||
    !Number.isInteger(Number(vehicleId)) ||
    Number(vehicleId) <= 0 ||
    typeof startDate !== "string" ||
    typeof endDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
  ) {
    return res.status(400).json({
      message: "Enter customer details, a valid vehicle, and rental dates."
    });
  }

  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start.toISOString().slice(0, 10) !== startDate ||
    end.toISOString().slice(0, 10) !== endDate ||
    end < start
  ) {
    return res.status(400).json({
      message: "The end date must be on or after the start date."
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT id, status FROM bookings WHERE id = $1 FOR UPDATE",
      [bookingId]
    );

    if (existing.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Booking not found." });
    }

    if (!["Pending", "Confirmed"].includes(existing.rows[0].status)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Only pending or confirmed bookings can be edited."
      });
    }

    const customer = await client.query(
      `SELECT id FROM customers
       WHERE id = $1 AND is_deleted = FALSE`,
      [Number(customerId)]
    );

    if (customer.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Active customer not found."
      });
    }

    const vehicle = await client.query(
            `SELECT id, price_per_day, status
      FROM vehicles
      WHERE id = $1
      FOR UPDATE`,
      [Number(vehicleId)]
    );

    if (vehicle.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Vehicle not found." });
    }

    const conflict = await client.query(
      `SELECT id FROM bookings
       WHERE vehicle_id = $1
         AND id <> $2
         AND status NOT IN ('Cancelled', 'Completed')
         AND start_date <= $4::date
         AND end_date >= $3::date
       LIMIT 1`,
      [Number(vehicleId), bookingId, startDate, endDate]
    );

    if (conflict.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "This vehicle is already booked for those dates."
      });
    }

    const days =
      Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

    const totalPrice =
      Number(vehicle.rows[0].price_per_day) * days;

    const updated = await client.query(
      `UPDATE bookings
       SET customer_id = $1,
           vehicle_id = $2,
           start_date = $3,
           end_date = $4,
           total_price = $5
       WHERE id = $6
       RETURNING id,
         customer_id AS "customerId",
         vehicle_id AS "vehicleId",
         start_date AS "startDate",
         end_date AS "endDate",
         total_price::float AS "totalPrice",
         status`,
      [
        Number(customerId), Number(vehicleId),
        startDate, endDate, totalPrice, bookingId
      ]
    );

    await client.query("COMMIT");

    res.json({
      message: "Booking updated successfully.",
      booking: updated.rows[0]
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Update booking error:", error.message);
    res.status(500).json({ message: "Failed to update booking." });
  } finally {
    client.release();
  }
});


// UPDATE booking status / CANCEL a booking
app.patch(
  "/api/bookings/:id/status",
  authenticateToken,
  allowRoles("Admin"),
  async (req, res) => {
  const bookingId = Number(req.params.id);
  const { status } = req.body;

  const allowedStatuses = [
    "Pending", "Confirmed", "Completed", "Cancelled"
  ];

  if (
    !Number.isInteger(bookingId) || bookingId <= 0 ||
    !allowedStatuses.includes(status)
  ) {
    return res.status(400).json({
      message: "Use Pending, Confirmed, Completed, or Cancelled."
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      "SELECT id, status FROM bookings WHERE id = $1 FOR UPDATE",
      [bookingId]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Booking not found." });
    }

    const currentStatus = result.rows[0].status;

    if (["Cancelled", "Completed"].includes(currentStatus)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Cancelled or completed bookings cannot be changed."
      });
    }

    // Pending can become Confirmed or Cancelled.
    // Confirmed can become Completed or Cancelled.
    const transitions = {
      Pending: ["Confirmed", "Cancelled"],
      Confirmed: ["Completed", "Cancelled"]
    };

    if (!transitions[currentStatus]?.includes(status)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: `Cannot change status from ${currentStatus} to ${status}.`
      });
    }

    const updated = await client.query(
      `UPDATE bookings SET status = $1
       WHERE id = $2
       RETURNING id, status`,
      [status, bookingId]
    );

    await client.query("COMMIT");

    res.json({
      message: status === "Cancelled"
        ? "Booking cancelled successfully."
        : "Booking status updated successfully.",
      booking: updated.rows[0]
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Booking status error:", error.message);
    res.status(500).json({
      message: "Failed to update booking status."
    });
  } finally {
    client.release();
  }
});



 
 // AI CHATBOT — uses live PostgreSQL vehicle inventory
app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL;

    if (!apiKey || !model) {
      return res.status(500).json({
        error: "OpenRouter configuration is missing from backend .env.",
      });
    }

    const userMessage = req.body.message;

    if (typeof userMessage !== "string" || !userMessage.trim()) {
      return res.status(400).json({
        error: "Please enter a message.",
      });
    }

    // Get the real vehicle information from PostgreSQL.
    const result = await pool.query(`
      SELECT
        brand,
        model,
        price_per_day::float AS "pricePerDay",
        status
      FROM vehicles
      ORDER BY brand, model
    `);

    const vehicles = result.rows;

    const availableVehicles = vehicles.filter(
      (vehicle) =>
        String(vehicle.status).toLowerCase() === "available"
    );

    const inventory = vehicles.map((vehicle) => ({
      brand: vehicle.brand,
      model: vehicle.model,
      pricePerDay: vehicle.pricePerDay,
      status: vehicle.status,
    }));

    const systemPrompt = `
You are DriveEasy's helpful vehicle rental assistant.

Use ONLY the live vehicle inventory provided below when answering
questions about DriveEasy's actual vehicles, prices, and current status.

LIVE VEHICLE INVENTORY:
${JSON.stringify(inventory, null, 2)}

CURRENTLY AVAILABLE VEHICLES:
${JSON.stringify(availableVehicles, null, 2)}

Rules:
- Only say a vehicle is currently available if its database status is "Available".
- Give the exact pricePerDay from the inventory. Prices are in Philippine pesos (PHP).
- If no vehicles are available, say so clearly.
- Never invent vehicle names, prices, or availability.
- If the inventory is empty, say no vehicle records were found.
- The status reflects the database's current vehicle status. It does not
  guarantee availability for particular rental dates.
- If asked about availability for specific dates, explain that the dates
  must be checked by the booking system before confirming.
- For unrelated questions, answer helpfully and concisely.
- Never claim a booking has been made unless the booking system confirms it.
`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-OpenRouter-Title": "DriveEasy",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userMessage.trim(),
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter error:", data);
      return res.status(response.status).json({
        error: data.error?.message || "AI request failed.",
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    return res.json({
      reply:
        typeof reply === "string" && reply.trim()
          ? reply
          : "Sorry, I couldn't generate a response.",
    });
  } catch (error) {
    console.error("Chat error:", error.message);

    return res.status(500).json({
      error: "Unable to retrieve vehicle information or generate a response.",
    });
  }
});


 // START SERVER
pool.query("SELECT 1")
  .then(() => {
    console.log("PostgreSQL connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
  });
