 
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample vehicle data
const vehicles = [
  {
    id: 1,
    brand: "Toyota",
    model: "Vios",
    plateNumber: "ABC-1234",
    pricePerDay: 1500,
    status: "Available"
  },
  {
    id: 2,
    brand: "Honda",
    model: "Civic",
    plateNumber: "XYZ-5678",
    pricePerDay: 2500,
    status: "Rented"
  },
  {
    id: 3,
    brand: "Mitsubishi",
    model: "Mirage",
    plateNumber: "DEF-9012",
    pricePerDay: 1200,
    status: "Available"
  }
];

// Home route
app.get("/", (req, res) => {
  res.send("Vehicle Rental API is running!");
});

// GET: Retrieve all vehicles
app.get("/api/vehicles", (req, res) => {
  res.status(200).json(vehicles);
});

// GET: Retrieve one vehicle by ID
app.get("/api/vehicles/:id", (req, res) => {
  const id = Number(req.params.id);
  const vehicle = vehicles.find((v) => v.id === id);

  if (!vehicle) {
    return res.status(404).json({
      message: "Vehicle not found"
    });
  }

  res.status(200).json(vehicle);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});