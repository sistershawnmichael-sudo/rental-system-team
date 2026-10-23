
const express = require("express");
const cors = require("cors");
const pool = require("./db");

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

// DELETE vehicle
app.delete("/api/vehicles/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM vehicles WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    res.json({ message: "Vehicle deleted successfully." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to delete vehicle." });
  }
});

// ==========================
// CUSTOMER ROUTES
// ==========================

// GET all customers
app.get("/api/customers", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${customerFields} FROM customers ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Failed to retrieve customers. Check that the customers table exists."
    });
  }
});

// GET one customer
app.get("/api/customers/:id", async (req, res) => {
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

// DELETE customer
app.delete("/api/customers/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM customers WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found." });
    }

    res.json({ message: "Customer deleted successfully." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to delete customer." });
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
