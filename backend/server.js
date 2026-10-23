require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const { sendBookingConfirmation } = require("./emailService");

require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

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
app.post("/api/vehicles", async (req, res) => {
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
app.put("/api/vehicles/:id", async (req, res) => {
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



// SOFT DELETE customer
app.delete("/api/customers/:id", async (req, res) => {
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
app.get("/api/customers", async (req, res) => {
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
app.get("/api/customers/:id", async (req, res) => {
  console.log("GET CUSTOMERS ROUTE 1 REACHED!");
  try {
    const result = await pool.query(
      `SELECT ${customerFields} FROM customers WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to retrieve customer." });
  }
});


// ADD customer
app.post("/api/customers", async (req, res) => {
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
app.put("/api/customers/:id", async (req, res) => {
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
app.get("/api/customers/:id", async (req, res) => {
  console.log("GET CUSTOMERS ROUTE 1 REACHED!");
  try {
    const result = await pool.query(
      `SELECT id, full_name AS "fullName",
              phone, email, address,
              created_at AS "createdAt"
       FROM customers WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch customer." });
  }
});

// CREATE customer
app.post("/api/customers", async (req, res) => {
  const { fullName, phone, email, address } = req.body;

  if (!fullName?.trim() || !phone?.trim()) {
    return res.status(400).json({
      message: "Full name and phone number are required."
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO customers (full_name, phone, email, address)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name AS "fullName",
                 phone, email, address,
                 created_at AS "createdAt"`,
      [fullName.trim(), phone.trim(), email || null, address || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to add customer." });
  }
});

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
app.get("/api/bookings", async (req, res) => {
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

// CREATE a booking
app.post("/api/bookings", async (req, res) => {
  const { customerId, vehicleId, startDate, endDate } = req.body;

  if (
    !Number.isInteger(Number(customerId)) ||
    Number(customerId) <= 0 ||
    !Number.isInteger(Number(vehicleId)) ||
    Number(vehicleId) <= 0 ||
    typeof startDate !== "string" ||
    typeof endDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate)
  ) {
    return res.status(400).json({
      message: "Enter a valid customer, vehicle, and rental dates."
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
      "SELECT id FROM customers WHERE id = $1",
      [Number(customerId)]
    );

    if (customerResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Customer not found." });
    }

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
       (customer_id, vehicle_id, start_date, end_date, total_price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING
         id,
         customer_id AS "customerId",
         vehicle_id AS "vehicleId",
         start_date AS "startDate",
         end_date AS "endDate",
         total_price::float AS "totalPrice",
         status`,
      [
        Number(customerId),
        Number(vehicleId),
        startDate,
        endDate,
        totalPrice
      ]
    );

    await client.query("COMMIT");
    
    
let emailSent = false;

try {
  // Get the customer's email and the booked vehicle.
  const detailsResult = await pool.query(
    `SELECT
       c.full_name AS "fullName",
       c.email,
       v.brand,
       v.model
     FROM customers c
     JOIN vehicles v ON v.id = $2
     WHERE c.id = $1`,
    [Number(customerId), Number(vehicleId)]
  );

  if (detailsResult.rows.length > 0) {
    const details = detailsResult.rows[0];

    await sendBookingConfirmation({
      customer: {
        fullName: details.fullName,
        email: details.email,
      },
      vehicle: {
        brand: details.brand,
        model: details.model,
      },
      startDate,
      endDate,
      totalPrice,
    });

    emailSent = true;
    console.log("Booking confirmation email sent.");
  }
} catch (emailError) {
  // The booking is already saved, so do not undo it.
  console.error(
    "Booking saved, but confirmation email failed:",
    emailError.message
  );
}

res.status(201).json({
  message: "Booking created successfully.",
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
