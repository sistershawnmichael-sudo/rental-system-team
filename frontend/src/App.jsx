
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
} from "react-router-dom";
import "./App.css";

const API_URL = "http://localhost:5000/api/vehicles";
const CUSTOMER_API = "http://localhost:5000/api/customers";

const AUTH_API = "http://localhost:5000/api/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await request(`${AUTH_API}/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      sessionStorage.setItem("driveEasyToken", data.token);
      sessionStorage.setItem("driveEasyUser", JSON.stringify(data.user));

      window.location.href = "/";
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="section simple-page">
      <div className="management-panel">
        <p className="eyebrow">WELCOME BACK</p>
        <h1>DriveEasy Login</h1>
        <p>Sign in to access your account.</p>

        <form className="vehicle-form" onSubmit={handleLogin}>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            autoComplete="username"
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          <button
            className="button primary-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {message && (
          <p className="message" role="alert">{message}</p>
        )}
      </div>
    </main>
  );
}



async function request(url, options = {}) {
  const token = sessionStorage.getItem("driveEasyToken");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  console.log("Request token exists:", Boolean(token));

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}


// NAVIGATION
function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="logo">
        DriveEasy<span>.</span>
      </Link>

      <nav>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/vehicles">Vehicles</NavLink>
        <NavLink to="/customers">Customers</NavLink>
        <NavLink to="/about">About Us</NavLink>
        <NavLink to="/contact">Contact</NavLink>
        <NavLink to="/rentals">Rentals</NavLink>
      
      </nav>

      <div className="nav-actions">
        <NavLink to="/login" className="login-link">
          Login
        </NavLink>

        <Link to="/vehicles" className="nav-button">
          Explore Cars
        </Link>
      </div>
    </header>
  );

}

// HOME PAGE
function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">WELCOME TO DRIVE EASY</p>
          <h1>Your journey.<br />Your freedom.</h1>
          <p>
            Find the perfect vehicle for your next trip.
            Affordable daily rates and a simple rental experience.
          </p>
          <Link to="/vehicles" className="button primary-button">
            Explore Our Vehicles →
          </Link>
        </div>

        <div className="hero-visual">
          <span className="hero-car">🚘</span>
          <div className="hero-label">
            <strong>Drive your way.</strong>
            <p>Your next adventure starts here.</p>
          </div>
        </div>
      </section>

      <section className="features section">
        <div>
          <span className="feature-icon">🚗</span>
          <h3>Quality Vehicles</h3>
          <p>Choose from our vehicle collection.</p>
        </div>
        <div>
          <span className="feature-icon">₱</span>
          <h3>Affordable Rates</h3>
          <p>Clear daily rental prices.</p>
        </div>
        <div>
          <span className="feature-icon">✓</span>
          <h3>Easy Booking</h3>
          <p>Find the right vehicle for your plans.</p>
        </div>
      </section>

      <section className="home-cta">
        <h2>Ready for your next ride?</h2>
        <p>Explore our vehicles and find your perfect match.</p>
        <Link to="/vehicles" className="button primary-button">
          View Vehicles
        </Link>
      </section>
    </main>
  );
}

// VEHICLES PAGE
function Vehicles() {
  const emptyForm = {
    brand: "",
    model: "",
    plateNumber: "",
    pricePerDay: "",
    status: "Available",
  };

  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [message, setMessage] = useState("Loading vehicles...");
  const [loading, setLoading] = useState(false);

  async function loadVehicles() {
    setLoading(true);
    try {
      const data = await request(API_URL);
      setVehicles(data);
      setMessage(`${data.length} vehicle(s) found.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function editVehicle(vehicle) {
    setEditingId(vehicle.id);
    setForm({
      brand: vehicle.brand,
      model: vehicle.model,
      plateNumber: vehicle.plateNumber,
      pricePerDay: String(vehicle.pricePerDay),
      status: vehicle.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.brand.trim() ||
      !form.model.trim() ||
      !form.plateNumber.trim() ||
      form.pricePerDay === "" ||
      !Number.isFinite(Number(form.pricePerDay)) ||
      Number(form.pricePerDay) < 0
    ) {
      setMessage("Please enter valid vehicle details.");
      return;
    }

    setLoading(true);
    const wasEditing = editingId !== null;

    try {
      const payload = {
        ...form,
        pricePerDay: Number(form.pricePerDay),
      };

      await request(
        wasEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: wasEditing ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );

      resetForm();
      const data = await request(API_URL);
      setVehicles(data);
      setMessage(
        wasEditing
          ? "Vehicle updated successfully."
          : "Vehicle added successfully."
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteVehicle(vehicle) {
    if (!window.confirm(`Delete ${vehicle.brand} ${vehicle.model}?`)) {
      return;
    }

    setLoading(true);
    try {
      await request(`${API_URL}/${vehicle.id}`, {
        method: "DELETE",
      });
      if (editingId === vehicle.id) resetForm();

      const data = await request(API_URL);
      setVehicles(data);
      setMessage("Vehicle deleted successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function searchVehicle(event) {
    event.preventDefault();

    if (!searchId.trim() || Number(searchId) < 1) {
      setMessage("Enter a valid vehicle ID.");
      return;
    }

    setLoading(true);
    try {
      const vehicle = await request(
        `${API_URL}/${encodeURIComponent(searchId.trim())}`
      );
      setVehicles([vehicle]);
      setMessage("Vehicle found.");
    } catch (error) {
      setVehicles([]);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page section">
      <div className="page-heading">
        <p className="eyebrow">OUR VEHICLE COLLECTION</p>
        <h1>Find your perfect ride.</h1>
        <p>Explore our vehicles and compare daily rental rates.</p>
      </div>

      <section className="management-panel">
        <h2>{editingId !== null ? "Update Vehicle" : "Add New Vehicle"}</h2>
        <p>Enter the vehicle details below.</p>

        <form className="vehicle-form" onSubmit={handleSubmit}>
          <label htmlFor="brand">Brand</label>
          <input id="brand" name="brand" value={form.brand}
            onChange={handleChange} placeholder="e.g. Toyota" required />

          <label htmlFor="model">Model</label>
          <input id="model" name="model" value={form.model}
            onChange={handleChange} placeholder="e.g. Vios" required />

          <label htmlFor="plateNumber">Plate Number</label>
          <input id="plateNumber" name="plateNumber"
            value={form.plateNumber} onChange={handleChange}
            placeholder="e.g. ABC-1234" required />

          <label htmlFor="pricePerDay">Price Per Day (₱)</label>
          <input id="pricePerDay" name="pricePerDay" type="number"
            min="0" step="0.01" value={form.pricePerDay}
            onChange={handleChange} placeholder="1500" required />

          <label htmlFor="status">Availability</label>
          <select id="status" name="status" value={form.status}
            onChange={handleChange}>
            <option value="Available">Available</option>
            <option value="Rented">Rented</option>
          </select>

          <div className="form-actions">
            <button className="button primary-button" disabled={loading}>
              {loading ? "Please wait..." :
                editingId !== null ? "Save Changes" : "Add Vehicle"}
            </button>
            {editingId !== null && (
              <button type="button" className="button secondary-button"
                onClick={resetForm}>Cancel</button>
            )}
          </div>
        </form>
      </section>

      <div className="list-heading">
        <div>
          <h2>Our Vehicles</h2>
          <p>Check vehicle details and availability.</p>
        </div>
        <button className="button secondary-button"
          onClick={loadVehicles} disabled={loading}>↻ Refresh</button>
      </div>

      <form className="search-form" onSubmit={searchVehicle}>
        <input type="number" min="1" placeholder="Search by vehicle ID"
          value={searchId}
          onChange={(event) => setSearchId(event.target.value)} />
        <button className="button primary-button">Search</button>
        <button type="button" className="button secondary-button"
          onClick={() => {
            setSearchId("");
            loadVehicles();
          }}>Show All</button>
      </form>

      <p className="message" role="status">{message}</p>

      <div className="vehicle-grid">
        {vehicles.map((vehicle) => (
          <article className="vehicle-card" key={vehicle.id}>
            <div className="vehicle-image">
              <span>🚘</span>
              <small>ID #{vehicle.id}</small>
            </div>
            <div className="vehicle-info">
              <div className="vehicle-title">
                <div>
                  <h3>{vehicle.brand} {vehicle.model}</h3>
                  <p>Plate: {vehicle.plateNumber}</p>
                </div>
                <span className={vehicle.status === "Available"
                  ? "badge available" : "badge rented"}>
                  {vehicle.status}
                </span>
              </div>
              <p className="price">
                ₱{Number(vehicle.pricePerDay).toLocaleString("en-PH")}
                <small> / day</small>
              </p>
              <div className="card-actions">
                <button className="button secondary-button"
                  onClick={() => editVehicle(vehicle)} disabled={loading}>
                  Edit
                </button>
                <button className="button delete-button"
                  onClick={() => deleteVehicle(vehicle)} disabled={loading}>
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {vehicles.length === 0 &&
        <p className="empty-message">No vehicles to display.</p>}
    </main>
  );
}

// CUSTOMERS PAGE
function Customers() {
  const emptyForm = {
    fullName: "",
    phone: "",
    email: "",
    address: "",
  };

  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("Loading customers...");
  const [loading, setLoading] = useState(false);

  async function loadCustomers() {
    setLoading(true);
    try {
      const data = await request(CUSTOMER_API);
      setCustomers(data);
      setMessage(`${data.length} customer(s) found.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function editCustomer(customer) {
    setEditingId(customer.id);
    setForm({
      fullName: customer.fullName || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.fullName.trim() || !form.phone.trim()) {
      setMessage("Customer name and phone are required.");
      return;
    }

    setLoading(true);
    const wasEditing = editingId !== null;

    try {
      await request(
        wasEditing ? `${CUSTOMER_API}/${editingId}` : CUSTOMER_API,
        {
          method: wasEditing ? "PUT" : "POST",
          body: JSON.stringify(form),
        }
      );

      resetForm();
      const data = await request(CUSTOMER_API);
      setCustomers(data);
      setMessage(
        wasEditing
          ? "Customer updated successfully."
          : "Customer added successfully."
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCustomer(customer) {
    if (!window.confirm(`Delete customer ${customer.fullName}?`)) {
      return;
    }

    setLoading(true);
    try {
      await request(`${CUSTOMER_API}/${customer.id}`, {
        method: "DELETE",
      });

      const data = await request(CUSTOMER_API);
      setCustomers(data);
      if (editingId === customer.id) resetForm();
      setMessage("Customer deleted successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = customers.filter((customer) =>
    `${customer.fullName} ${customer.phone} ${customer.email || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="page section">
      <div className="page-heading">
        <p className="eyebrow">CUSTOMER MANAGEMENT</p>
        <h1>Our Customers</h1>
        <p>Register and manage customer information in one place.</p>
      </div>

      <section className="management-panel">
        <h2>{editingId !== null ? "Update Customer" : "Add New Customer"}</h2>
        <p>Name and phone number are required.</p>

        <form className="vehicle-form" onSubmit={handleSubmit}>
          <label htmlFor="fullName">Full Name</label>
          <input id="fullName" name="fullName" value={form.fullName}
            onChange={handleChange} placeholder="e.g. Juan Dela Cruz" required />

          <label htmlFor="phone">Phone Number</label>
          <input id="phone" name="phone" value={form.phone}
            onChange={handleChange} placeholder="e.g. 09123456789" required />

          <label htmlFor="email">Email (optional)</label>
          <input id="email" name="email" type="email" value={form.email}
            onChange={handleChange} placeholder="e.g. juan@email.com" />

          <label htmlFor="address">Address (optional)</label>
          <textarea id="address" name="address" rows="3"
            value={form.address} onChange={handleChange}
            placeholder="Customer address" />

          <div className="form-actions">
            <button className="button primary-button" disabled={loading}>
              {loading ? "Please wait..." :
                editingId !== null ? "Save Changes" : "Add Customer"}
            </button>
            {editingId !== null && (
              <button type="button" className="button secondary-button"
                onClick={resetForm}>Cancel</button>
            )}
          </div>
        </form>
      </section>

      <div className="list-heading">
        <div>
          <h2>Customer List</h2>
          <p>View, search, edit, or delete customer records.</p>
        </div>
        <button className="button secondary-button"
          onClick={loadCustomers} disabled={loading}>↻ Refresh</button>
      </div>

      <form className="search-form"
        onSubmit={(event) => event.preventDefault()}>
        <input value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, phone, or email" />
        <button type="button" className="button secondary-button"
          onClick={() => setSearch("")}>Clear</button>
      </form>

      <p className="message" role="status">{message}</p>

      <div className="customer-list">
        {filteredCustomers.map((customer) => (
          <article className="management-panel" key={customer.id}>
            <div className="vehicle-title">
              <div>
                <h3>{customer.fullName}</h3>
                <p>Customer ID: #{customer.id}</p>
              </div>
            </div>
            <p><strong>Phone:</strong> {customer.phone}</p>
            {customer.email && <p><strong>Email:</strong> {customer.email}</p>}
            {customer.address &&
              <p><strong>Address:</strong> {customer.address}</p>}
            <div className="card-actions">
              <button className="button secondary-button"
                onClick={() => editCustomer(customer)} disabled={loading}>
                Edit
              </button>
              <button
                type="button"
                className="button delete-button"
                onClick={() => {
                  console.log("Delete clicked:", customer);
                  deleteCustomer(customer);
                }}
                disabled={loading}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {filteredCustomers.length === 0 &&
        <p className="empty-message">No customers found.</p>}
    </main>
  );
}

 // RENTALS / BOOKINGS PAGE

function Rentals() {
  const BOOKINGS_API = "http://localhost:5000/api/bookings";
  const emptyForm = {
    customerId: "",
    vehicleId: "",
    startDate: "",
    endDate: "",
  };

  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  async function loadData() {
    try {
      const [customerData, vehicleData, bookingData] =
        await Promise.all([
          request(CUSTOMER_API),
          request(API_URL),
          request(BOOKINGS_API),
        ]);

      setCustomers(customerData);
      setVehicles(vehicleData);
      setBookings(bookingData);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedVehicle = vehicles.find(
    (vehicle) => String(vehicle.id) === form.vehicleId
  );

  const days =
    form.startDate &&
    form.endDate &&
    form.endDate >= form.startDate
      ? Math.floor(
          (new Date(form.endDate + "T00:00:00Z") -
            new Date(form.startDate + "T00:00:00Z")) /
            86400000
        ) + 1
      : 0;

  const total =
    days > 0 && selectedVehicle
      ? days *
        Number(
          selectedVehicle.pricePerDay ??
          selectedVehicle.price_per_day ??
          0
        )
      : 0;

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function editBooking(booking) {
    if (!["Pending", "Approved"].includes(booking.status)) {
      setMessage("Only pending or approved bookings can be edited.");
      return;
    }

    setEditingId(booking.id);
    setForm({
      customerId: String(booking.customerId),
      vehicleId: String(booking.vehicleId),
      startDate: String(booking.startDate).slice(0, 10),
      endDate: String(booking.endDate).slice(0, 10),
    });
    setMessage("Editing booking #" + booking.id);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const isEditing = editingId !== null;

      await request(
        isEditing
          ? `${BOOKINGS_API}/${editingId}`
          : BOOKINGS_API,
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify({
            customerId: Number(form.customerId),
            vehicleId: Number(form.vehicleId),
            startDate: form.startDate,
            endDate: form.endDate,
          }),
        }
      );

      resetForm();
      setMessage(
        isEditing
          ? "Booking updated successfully."
          : "Booking created successfully."
      );

      await loadData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(booking, status) {
    const action =
      status === "Cancelled"
        ? "cancel this booking"
        : `change this booking to ${status}`;

    if (!window.confirm(`Are you sure you want to ${action}?`)) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await request(`${BOOKINGS_API}/${booking.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setMessage(
        status === "Cancelled"
          ? "Booking cancelled successfully."
          : `Booking status changed to ${status}.`
      );

      await loadData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const searchText = [
      booking.id,
      booking.customerName,
      booking.brand,
      booking.model,
      booking.plateNumber,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="page section">
      <div className="page-heading">
        <p className="eyebrow">DRIVEEASY MANAGEMENT</p>
        <h1>Rentals & Bookings</h1>
        <p>Create, edit, and manage your vehicle rental bookings.</p>
      </div>

      <section className="management-panel">
        <h2>
          {editingId !== null
            ? `Edit Booking #${editingId}`
            : "Create a Booking"}
        </h2>

        <form className="vehicle-form" onSubmit={handleSubmit}>
          <label htmlFor="bookingCustomer">Customer</label>
          <select
            id="bookingCustomer"
            value={form.customerId}
            onChange={(e) =>
              setForm({ ...form, customerId: e.target.value })
            }
            required
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.fullName ?? customer.full_name}
              </option>
            ))}
          </select>

          <label htmlFor="bookingVehicle">Vehicle</label>
          <select
            id="bookingVehicle"
            value={form.vehicleId}
            onChange={(e) =>
              setForm({ ...form, vehicleId: e.target.value })
            }
            required
          >
            <option value="">Select a vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.brand} {vehicle.model} —{" "}
                {vehicle.plateNumber ?? vehicle.plate_number}
              </option>
            ))}
          </select>

          <label htmlFor="bookingStart">Rental Start Date</label>
          <input
            id="bookingStart"
            type="date"
            value={form.startDate}
            onChange={(e) =>
              setForm({
                ...form,
                startDate: e.target.value,
                endDate:
                  form.endDate && form.endDate < e.target.value
                    ? ""
                    : form.endDate,
              })
            }
            required
          />

          <label htmlFor="bookingEnd">Rental End Date</label>
          <input
            id="bookingEnd"
            type="date"
            min={form.startDate || undefined}
            value={form.endDate}
            onChange={(e) =>
              setForm({ ...form, endDate: e.target.value })
            }
            required
          />

          <p>
            Rental Days: <strong>{days}</strong>
          </p>
          <p>
            Estimated Total:{" "}
            <strong>
              ₱
              {total.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>
          </p>

          <div className="form-actions">
            <button
              type="submit"
              className="button primary-button"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : editingId !== null
                  ? "Save Changes"
                  : "Create Booking"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="button secondary-button"
                onClick={resetForm}
                disabled={loading}
              >
                Stop Editing
              </button>
            )}
          </div>
        </form>
      </section>

      <div className="list-heading">
        <div>
          <h2>Booking Records</h2>
          <p>Manage booking details and track rental progress.</p>
        </div>

        <button
          type="button"
          className="button secondary-button"
          onClick={loadData}
          disabled={loading}
        >
          ↻ Refresh Bookings
        </button>
      </div>

      <div className="search-form">
        <input
          type="search"
          placeholder="Search ID, customer, or vehicle"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          aria-label="Filter by booking status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <p className="message" role="status">{message}</p>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td>#{booking.id}</td>
                <td>{booking.customerName}</td>
                <td>
                  {booking.brand} {booking.model}
                  <br />
                  <small>{booking.plateNumber}</small>
                </td>
                <td>{String(booking.startDate).slice(0, 10)}</td>
                <td>{String(booking.endDate).slice(0, 10)}</td>
                <td>
                  ₱
                  {Number(booking.totalPrice).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td>
                  <span className="badge">
                    {booking.status}
                  </span>
                </td>
                <td>
                  <div className="card-actions booking-actions">
                    {["Pending", "Confirmed"].includes(booking.status) && (
                      <>
                        <button
                          type="button"
                          className="button secondary-button"
                          onClick={() => editBooking(booking)}
                          disabled={loading}
                        >
                          Edit
                        </button>

                        {booking.status === "Pending" && (
                          <button
                            type="button"
                            className="button primary-button"
                            onClick={() =>
                              updateStatus(booking, "Confirmed")
                            }
                            disabled={loading}
                          >
                            Confirm
                          </button>
                        )}

                        {booking.status === "Confirmed" && (
                          <button
                            type="button"
                            className="button primary-button"
                            onClick={() =>
                              updateStatus(booking, "Completed")
                            }
                            disabled={loading}
                          >
                            Complete
                          </button>
                        )}

                        <button
                          type="button"
                          className="button delete-button"
                          onClick={() =>
                            updateStatus(booking, "Cancelled")
                          }
                          disabled={loading}
                        >
                          Cancel Booking
                        </button>
                      </>
                    )}

                    {["Completed", "Cancelled"].includes(booking.status) && (
                      <span>Closed</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filteredBookings.length === 0 && (
              <tr>
                <td colSpan="8">No matching bookings found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

// ABOUT PAGE
function About() {
  return (
    <main className="section simple-page">
      <p className="eyebrow">GET TO KNOW US</p>
      <h1>About DriveEasy</h1>
      <p>
        DriveEasy is a vehicle rental system designed to make finding
        and managing rental vehicles simple and convenient.
      </p>
      <div className="about-panel">
        <h2>Our Mission</h2>
        <p>
          To provide a convenient way to explore vehicles, check
          availability, and view rental prices.
        </p>
        <h2>Our Goal</h2>
        <p>
          To make vehicle information organized and easy to manage.
        </p>
      </div>
    </main>
  );
}

// CONTACT PAGE
function Contact() {
  return (
    <main className="section simple-page">
      <p className="eyebrow">WE'RE HERE TO HELP</p>
      <h1>Contact Us</h1>
      <p>Have questions about our vehicles? Get in touch with us.</p>
      <div className="contact-grid">
        <div className="contact-card">
          <span>✉️</span>
          <h3>Email</h3>
          <p>driveeasy@example.com</p>
        </div>
        <div className="contact-card">
          <span>📞</span>
          <h3>Phone</h3>
          <p>Contact number to be announced</p>
        </div>
        <div className="contact-card">
          <span>📍</span>
          <h3>Location</h3>
          <p>Contact us for location details</p>
        </div>
      </div>
    </main>
  );
}

function NotFound() {
  return (
    <main className="section simple-page">
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="button primary-button">Back to Home</Link>
    </main>
  );
}

// FOOTER
function Footer() {
  return (
    <footer className="footer">
      <Link to="/" className="logo">DriveEasy<span>.</span></Link>
      <p>Vehicle Rental System</p>
      <p>© 2026 DriveEasy Rentals</p>
    </footer>
  );
}

// MAIN APP
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/rentals" element={<Rentals />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
