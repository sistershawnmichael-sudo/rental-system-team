import {
  LayoutDashboard,
  CarFront,
  Users,
  CalendarDays,
  ClipboardList,
  LogOut,
  LogIn,
  House,
  Info,
  Phone,
  CalendarCheck,
} from "lucide-react";
import Chatbot from "./Chatbot";
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
} from "react-router-dom";
import "./App.css";


const API_BASE = (
  import.meta.env.VITE_API_URL ||
  "https://rental-system-team.onrender.com"
).replace(/\/+$/, "");

const API_URL = `${API_BASE}/api/vehicles`;
const CUSTOMER_API = `${API_BASE}/api/customers`;
const AUTH_API = `${API_BASE}/api/auth`;
const BOOKINGS_API = `${API_BASE}/api/bookings`;
const ADMIN_API = `${API_BASE}/api/admin`;



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

   if (data.user.role === "Admin") {
  window.location.href = "/admin";
} else {
  window.location.href = "/";
}
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}



// NAVIGATION


function Navbar() {
  const user = JSON.parse(
    sessionStorage.getItem("driveEasyUser") || "null"
  );

  const isAdmin = user?.role === "Admin";

  function handleLogout() {
    sessionStorage.removeItem("driveEasyToken");
    sessionStorage.removeItem("driveEasyUser");
    window.location.href = "/";
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>
          Drive<span>Easy</span>
        </h2>
        <p>Rent a Car, Drive Your Way</p>
      </div>

      
<nav className="sidebar-nav">
  {isAdmin ? (
    <>
      <NavLink to="/admin">
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink to="/vehicles">
        <CarFront size={20} />
        <span>Vehicles</span>
      </NavLink>

      <NavLink to="/customers">
        <Users size={20} />
        <span>Customers</span>
      </NavLink>

      <NavLink to="/rentals">
        <ClipboardList size={20} />
        <span>Rentals</span>
      </NavLink>

      <NavLink to="/calendar">
        <CalendarDays size={20} />
        <span>Calendar</span>
      </NavLink>
    </>
  ) : (
    <>
      <NavLink to="/">
        <House size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink to="/vehicles">
        <CarFront size={20} />
        <span>Vehicles</span>
      </NavLink>

      <NavLink to="/book">
        <CalendarCheck size={20} />
        <span>Book a Vehicle</span>
      </NavLink>

      <NavLink to="/about">
        <Info size={20} />
        <span>About Us</span>
      </NavLink>

      <NavLink to="/contact">
        <Phone size={20} />
        <span>Contact</span>
      </NavLink>
    </>
  )}
</nav>


      {user ? (
<button
  className="sidebar-logout"
  onClick={handleLogout}
>
  <LogOut size={20} />
  <span>Logout</span>
</button>
      ) : (
<NavLink className="sidebar-login" to="/login">
  <LogIn size={20} />
  <span>Login</span>
</NavLink>
      )}
    </aside>
  );
}





 // HOME PAGE

function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-eyebrow">
            PREMIUM CAR RENTAL EXPERIENCE
          </span>

          <h1>
            Your journey.
            <br />
            <span>Your way.</span>
          </h1>

          <p className="home-description">
            Discover the freedom of the open road.
            Choose your perfect vehicle and enjoy a
            smooth, comfortable, and affordable ride.
          </p>

          <div className="home-actions">
            <Link to="/vehicles" className="home-btn home-btn-primary">
              Explore Our Cars <span>→</span>
            </Link>

            <Link to="/book" className="home-btn home-btn-secondary">
              Book Your Ride
            </Link>
          </div>

          <div className="home-highlights">
            <span>✓ Easy Reservations</span>
            <span>✓ Affordable Prices</span>
            <span>✓ Quality Vehicles</span>
          </div>
        </div>

        <div className="home-hero-visual">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=90"
            alt="Luxury sports car"
          />

          <div className="home-image-label">
            <span className="home-label-dot"></span>
            <div>
              <strong>Find Your Perfect Ride</strong>
              <p>Your next adventure starts here.</p>
            </div>
          </div>

          <div className="home-image-number">01 / DRIVE EASY</div>
        </div>
      </section>

      <section className="home-benefits">
        <div className="home-section-heading">
          <span>THE DRIVE EASY ADVANTAGE</span>
          <h2>Everything you need for the road.</h2>
          <p>A better rental experience, from booking to arrival.</p>
        </div>

        <div className="home-benefit-grid">
          <article className="home-benefit-card">
            <div className="home-benefit-icon">01</div>
            <h3>Quality Vehicles</h3>
            <p>
              Explore our vehicle collection and find
              the right car for your next destination.
            </p>
            <Link to="/vehicles">View vehicles ↗</Link>
          </article>

          <article className="home-benefit-card">
            <div className="home-benefit-icon">02</div>
            <h3>Affordable Rates</h3>
            <p>
              Find a vehicle that fits your budget
              with clear and competitive daily rates.
            </p>
            <Link to="/vehicles">Compare vehicles ↗</Link>
          </article>

          <article className="home-benefit-card">
            <div className="home-benefit-icon">03</div>
            <h3>Easy Booking</h3>
            <p>
              Choose your preferred vehicle and
              make planning your trip simple.
            </p>
            <Link to="/book">Book a vehicle ↗</Link>
          </article>
        </div>
      </section>

      <section className="home-cta">
        <div>
          <span>YOUR NEXT ADVENTURE AWAITS</span>
          <h2>Ready to hit the road?</h2>
          <p>Find your ride and make every journey count.</p>
        </div>

        <Link to="/vehicles" className="home-btn home-btn-primary">
          Find Your Car →
        </Link>
      </section>
    </main>
  );
}



function getVehicleImage(brand, model) {
  const vehicleImages = {
    "toyota vios": "/cars/toyota-vios.png",
    "honda civic": "/cars/honda-civic.jpg",
    "mitsubishi mirage": "/cars/mitsubishi-mirage.png",
    "toyota fortuner": "/cars/toyota-fortuner.jpg",
    "bmw m2": "/cars/bmw-m2.avif",
  };

  const vehicleName = `${brand || ""} ${model || ""}`
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  return vehicleImages[vehicleName] || "/cars/default-car.png";
}

// VEHICLES PAGE
function Vehicles() {
  const user = JSON.parse(
    sessionStorage.getItem("driveEasyUser") || "null"
  );
  console.log("Logged-in user:", user);
  const isAdmin = user?.role === "Admin";

  const emptyForm = {
    brand: "",
    model: "",
    plateNumber: "",
    pricePerDay: "",
    status: "Available",
  };
  
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
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
    if (!isAdmin) return;

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

    if (!isAdmin) {
      setMessage("Only Admin can manage vehicles.");
      return;
    }

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
    if (!isAdmin) {
      setMessage("Only Admin can manage vehicles.");
      return;
    }

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

const filteredVehicles = vehicles.filter((vehicle) => {
  const search = vehicleSearch.trim().toLowerCase();

  const matchesSearch =
    `${vehicle.brand} ${vehicle.model} ${vehicle.plateNumber}`
      .toLowerCase()
      .includes(search);

  const matchesAvailability =
    availabilityFilter === "All" ||
    vehicle.status?.toLowerCase() ===
      availabilityFilter.toLowerCase();

  return matchesSearch && matchesAvailability;
});

  return (
    <main className="page section">
      <div className="page-heading">
        <p className="eyebrow">OUR VEHICLE COLLECTION</p>
        <h1>Find your perfect ride.</h1>
        <p>Explore our vehicles and compare daily rental rates.</p>
      </div>

      {/* ADMIN-ONLY VEHICLE MANAGEMENT */}
      {isAdmin && (
        <section className="management-panel">
          <h2>
            {editingId !== null ? "Update Vehicle" : "Add New Vehicle"}
          </h2>
          <p>Enter the vehicle details below.</p>

          <form className="vehicle-form" onSubmit={handleSubmit}>
            <label htmlFor="brand">Brand</label>
            <input
              id="brand"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="e.g. Toyota"
              required
            />

            <label htmlFor="model">Model</label>
            <input
              id="model"
              name="model"
              value={form.model}
              onChange={handleChange}
              placeholder="e.g. Vios"
              required
            />

            <label htmlFor="plateNumber">Plate Number</label>
            <input
              id="plateNumber"
              name="plateNumber"
              value={form.plateNumber}
              onChange={handleChange}
              placeholder="e.g. ABC-1234"
              required
            />

            <label htmlFor="pricePerDay">Price Per Day (₱)</label>
            <input
              id="pricePerDay"
              name="pricePerDay"
              type="number"
              min="0"
              step="0.01"
              value={form.pricePerDay}
              onChange={handleChange}
              placeholder="1500"
              required
            />

            <label htmlFor="status">Availability</label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
            </select>

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
                    : "Add Vehicle"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="button secondary-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      {/* PUBLIC VEHICLE BROWSING */}
      <div className="list-heading">
        <div>
          <h2>Our Vehicles</h2>
          <p>Check vehicle details and availability.</p>
        </div>

        <div className="vehicle-search-panel">
  <input
    type="search"
    placeholder="Search brand, model, or plate number..."
    value={vehicleSearch}
    onChange={(event) => setVehicleSearch(event.target.value)}
  />

  <select
    value={availabilityFilter}
    onChange={(event) => setAvailabilityFilter(event.target.value)}
  >
    <option value="All">All Vehicles</option>
    <option value="Available">Available</option>
    <option value="Rented">Rented</option>
  </select>

  <button
    type="button"
    onClick={() => {
      setVehicleSearch("");
      setAvailabilityFilter("All");
    }}
  >
    Clear Filters
  </button>
</div>

        <button
          type="button"
          className="button secondary-button"
          onClick={loadVehicles}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      <form className="search-form" onSubmit={searchVehicle}>
        <input
          type="number"
          min="1"
          placeholder="Search by vehicle ID"
          value={searchId}
          onChange={(event) => setSearchId(event.target.value)}
        />

        <button type="submit" className="button primary-button">
          Search
        </button>

        <button
          type="button"
          className="button secondary-button"
          onClick={() => {
            setSearchId("");
            loadVehicles();
          }}
        >
          Show All
        </button>
      </form>

      <p className="message" role="status">
        {message}
      </p>

      <div className="vehicle-grid">
        {filteredVehicles.map((vehicle) => (
          <article className="vehicle-card" key={vehicle.id}>

<div className="vehicle-image">
  <img
    src={getVehicleImage(vehicle.brand, vehicle.model)}
    alt={`${vehicle.brand} ${vehicle.model}`}
    onError={(event) => {
      if (!event.currentTarget.dataset.fallback) {
        event.currentTarget.dataset.fallback = "true";
        event.currentTarget.src = "/cars/default-car.png";
      }
    }}
  />
  <small>ID #{vehicle.id}</small>
</div>

            <div className="vehicle-info">
              <div className="vehicle-title">
                <div>
                  <h3>
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p>Plate: {vehicle.plateNumber}</p>
                </div>

                <span
                  className={
                    vehicle.status === "Available"
                      ? "badge available"
                      : "badge rented"
                  }
                >
                  {vehicle.status}
                </span>
              </div>

              <p className="price">
                ₱{Number(vehicle.pricePerDay).toLocaleString("en-PH")}
                <small> / day</small>
              </p>

              {/* ADMIN-ONLY EDIT AND DELETE */}
              {isAdmin && (
                <div className="card-actions">
                  <button
                    type="button"
                    className="button secondary-button"
                    onClick={() => editVehicle(vehicle)}
                    disabled={loading}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="button delete-button"
                    onClick={() => deleteVehicle(vehicle)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {vehicles.length === 0 && (
        <p className="empty-message">No vehicles to display.</p>
      )}
    </main>
  );
}
// CUSTOMER BOOKING PAGE

function CustomerBooking() {
  
 const AVAILABILITY_API = `${BOOKINGS_API}/availability`;
  const emptyForm = {
    fullName: "",
    phone: "",
    email: "",
    address: "",
    vehicleId: "",
    startDate: "",
    endDate: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [vehicles, setVehicles] = useState([]);
  const [message, setMessage] = useState("");
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadVehicles() {
      try {
        const data = await request(API_URL);
        setVehicles(data);
      } catch (error) {
        setMessage(error.message);
      }
    }

    loadVehicles();
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

  const total = selectedVehicle
    ? days * Number(selectedVehicle.pricePerDay ?? 0)
    : 0;

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (["vehicleId", "startDate", "endDate"].includes(name)) {
      setAvailability(null);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function checkAvailability() {
      if (
        !form.vehicleId ||
        !form.startDate ||
        !form.endDate ||
        form.endDate < form.startDate ||
        !selectedVehicle
      ) {
        setAvailability(null);
        setCheckingAvailability(false);
        return;
      }

      setAvailability(null);
      setCheckingAvailability(true);

      try {
        const params = new URLSearchParams({
          vehicleId: form.vehicleId,
          startDate: form.startDate,
          endDate: form.endDate,
        });

        const result = await request(
          `${AVAILABILITY_API}?${params.toString()}`
        );

        if (!cancelled) {
          setAvailability(result);
        }
      } catch (error) {
        if (!cancelled) {
          setAvailability({
            available: false,
            message: error.message,
          });
        }
      } finally {
        if (!cancelled) {
          setCheckingAvailability(false);
        }
      }
    }

    checkAvailability();

    return () => {
      cancelled = true;
    };
  }, [
    form.vehicleId,
    form.startDate,
    form.endDate,
    selectedVehicle?.status,
  ]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!selectedVehicle) {
        throw new Error("Please select a vehicle.");
      }

      if (days < 1) {
        throw new Error("Please enter valid rental dates.");
      }

if (checkingAvailability || availability === null) {
  throw new Error("Please wait for the availability check.");
}

if (availability.available !== true) {
  throw new Error(
    availability.message || "This vehicle is unavailable for these dates."
  );
}

      const result = await request(BOOKINGS_API, {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          vehicleId: Number(form.vehicleId),
          startDate: form.startDate,
          endDate: form.endDate,
        }),
      });

      setForm(emptyForm);
      setAvailability(null);
      setMessage(
        result.message ||
          "Booking submitted successfully! Your request has been received."
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return (
    <main className="page section">
      <div className="page-heading">
        <p className="eyebrow">BOOK YOUR NEXT RIDE</p>
        <h1>Book a Vehicle</h1>
        <p>
          Choose a vehicle and rental dates to check availability
          before submitting your booking.
        </p>
      </div>

      <section className="management-panel customer-booking-panel">
        <h2>Your Information</h2>
        <p>Name and phone number are required.</p>

        <form className="vehicle-form" onSubmit={handleSubmit}>
          <label htmlFor="booking-fullName">Full Name</label>
          <input
            id="booking-fullName"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="e.g. Juan Dela Cruz"
            required
          />

          <label htmlFor="booking-phone">Phone Number</label>
          <input
            id="booking-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="e.g. 09123456789"
            required
          />

          <label htmlFor="booking-email">Email</label>
          <input
            id="booking-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="e.g. juan@email.com"
          />

          <label htmlFor="booking-address">Address</label>
          <textarea
            id="booking-address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Enter your address (optional)"
            rows="3"
          />

          <label htmlFor="booking-vehicle">Choose Vehicle</label>
          <select
            id="booking-vehicle"
            name="vehicleId"
            value={form.vehicleId}
            onChange={handleChange}
            required
          >
            <option value="">Select a vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.brand} {vehicle.model} — ₱
                {Number(vehicle.pricePerDay).toLocaleString("en-PH")}/day
              </option>
            ))}
          </select>

          <label htmlFor="booking-startDate">Rental Start Date</label>
          <input
            id="booking-startDate"
            name="startDate"
            type="date"
            min={todayString}
            value={form.startDate}
            onChange={handleChange}
            required
          />

          <label htmlFor="booking-endDate">Rental End Date</label>
          <input
            id="booking-endDate"
            name="endDate"
            type="date"
            min={form.startDate || todayString}
            value={form.endDate}
            onChange={handleChange}
            required
          />

          {checkingAvailability && (
            <p className="message" role="status">
              Checking vehicle availability...
            </p>
          )}

          {!checkingAvailability && availability && (
            <p
              className="message"
              role="status"
              style={{
                color: availability.available ? "green" : "crimson",
                fontWeight: 600,
              }}
            >
              {availability.message}
            </p>
          )}

          <div className="booking-total">
            <p>
              Rental Days: <strong>{days}</strong>
            </p>
            <p>
              Estimated Total:{" "}
              <strong>
                ₱{total.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </p>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="button primary-button"
              disabled={
                loading ||
                checkingAvailability ||
                availability?.available !== true
              }
            >
              {loading
                ? "Submitting..."
                : checkingAvailability
                  ? "Checking Availability..."
                  : "Submit Booking"}
            </button>
          </div>
        </form>

        {message && (
          <p className="message" role="status">
            {message}
          </p>
        )}
      </section>
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
    setLoading(true);
    setMessage("Loading booking records...");

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
      setMessage(`Loaded ${bookingData.length} booking record(s).`);
    } catch (error) {
      console.error("Failed to load booking records:", error);
      setMessage(`Could not load bookings: ${error.message}`);
    } finally {
      setLoading(false);
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
      const selectedCustomer = customers.find(
  (customer) => String(customer.id) === form.customerId
);

if (!selectedCustomer) {
  setMessage("Please select a valid customer.");
  setLoading(false);
  return;
}

      await request(
        isEditing
          ? `${BOOKINGS_API}/${editingId}`
          : BOOKINGS_API,
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify({
  fullName: selectedCustomer.fullName,
  phone: selectedCustomer.phone,
  email: selectedCustomer.email || "",
  address: selectedCustomer.address || "",
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
      <h1>Booking Records</h1>
      <p>View and manage your vehicle rental bookings.</p>
    </div>

    <div className="list-heading">
      <div>
        <h2>All Bookings</h2>
        <p>Search and manage rental reservations.</p>
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


 // BOOKING CALENDAR PAGE

function BookingCalendar() {


  const [bookings, setBookings] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const user = JSON.parse(
    sessionStorage.getItem("driveEasyUser") || "null"
  );

  useEffect(() => {
    if (!user || user.role !== "Admin") {
      window.location.href = "/";
      return;
    }

    async function loadBookings() {
      try {
        setLoading(true);
        const data = await request(BOOKINGS_API);
        setBookings(data);
        setMessage("");
      } catch (error) {
        setMessage("Could not load bookings: " + error.message);
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  if (!user || user.role !== "Admin") {
    return null;
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Make Monday the first day of the week.
  const startingOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil(
    (startingOffset + daysInMonth) / 7
  ) * 7;

  const calendarDates = Array.from(
    { length: totalCells },
    (_, index) => {
      const day = index - startingOffset + 1;

      if (day < 1 || day > daysInMonth) {
        return null;
      }

      return new Date(year, month, day);
    }
  );

  function dateKey(value) {
    return String(value).slice(0, 10);
  }

  function formatDate(value) {
    if (!value) return "Not provided";

    const date = new Date(dateKey(value) + "T00:00:00");
    return date.toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function bookingsForDate(date) {
    if (!date) return [];

    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    return bookings.filter((booking) => {
      if (!booking.startDate || !booking.endDate) return false;

      const start = dateKey(booking.startDate);
      const end = dateKey(booking.endDate);

      return key >= start && key <= end;
    });
  }

  function changeMonth(amount) {
    setCurrentMonth(
      new Date(year, month + amount, 1)
    );
    setSelectedBooking(null);
  }

  const today = new Date();
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return (
    <main className="page section booking-calendar-page">
      <div className="page-heading">
        <p className="eyebrow">DRIVEEASY MANAGEMENT</p>
        <h1>Booking Calendar</h1>
        <p>
          View vehicle reservations by date and check their status.
        </p>
      </div>

      <section className="management-panel calendar-panel">
        <div className="calendar-toolbar">
          <button
            type="button"
            className="button secondary-button"
            onClick={() => changeMonth(-1)}
          >
            ← Previous
          </button>

          <h2>
            {currentMonth.toLocaleDateString("en-PH", {
              month: "long",
              year: "numeric",
            })}
          </h2>

          <button
            type="button"
            className="button secondary-button"
            onClick={() => changeMonth(1)}
          >
            Next →
          </button>
        </div>

        {loading && <p>Loading bookings...</p>}

        {message && (
          <p className="message" role="alert">{message}</p>
        )}

        {!loading && !message && (
          <>
            <div className="calendar-grid calendar-weekdays">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day) => (
                  <div key={day}>{day}</div>
                )
              )}
            </div>

            <div className="calendar-grid calendar-days">
              {calendarDates.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      className="calendar-day calendar-empty"
                      key={`empty-${index}`}
                    />
                  );
                }

                const dayBookings = bookingsForDate(date);

                const key = [
                  date.getFullYear(),
                  String(date.getMonth() + 1).padStart(2, "0"),
                  String(date.getDate()).padStart(2, "0"),
                ].join("-");

                return (
                  <div
                    className={
                      "calendar-day" +
                      (key === todayKey ? " calendar-today" : "")
                    }
                    key={key}
                  >
                    <strong className="calendar-date">
                      {date.getDate()}
                    </strong>

                    {dayBookings.map((booking) => (
                      <button
                        type="button"
                        key={booking.id}
                        className={
                          "calendar-booking status-" +
                          String(booking.status || "Pending").toLowerCase()
                        }
                        title={
                          `${booking.customerName || "Customer"} - ` +
                          `${booking.brand || ""} ${booking.model || ""}`
                        }
                        onClick={() => setSelectedBooking(booking)}
                      >
                        #{booking.id}{" "}
                        {booking.brand || "Vehicle"}{" "}
                        {booking.model || ""}
                      </button>
                    ))}

                    {dayBookings.length === 0 && (
                      <span className="calendar-no-booking">—</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="calendar-legend">
              <span><i className="legend-pending" /> Pending</span>
              <span><i className="legend-confirmed" /> Confirmed</span>
              <span><i className="legend-completed" /> Completed</span>
              <span><i className="legend-cancelled" /> Cancelled</span>
            </div>
          </>
        )}
      </section>

      {selectedBooking && (
        <section className="management-panel calendar-details">
          <div className="calendar-details-heading">
            <h2>Booking #{selectedBooking.id}</h2>
            <button
              type="button"
              className="button secondary-button"
              onClick={() => setSelectedBooking(null)}
            >
              Close
            </button>
          </div>

          <p>
            <strong>Customer:</strong>{" "}
            {selectedBooking.customerName || "Not provided"}
          </p>

          <p>
            <strong>Vehicle:</strong>{" "}
            {selectedBooking.brand || ""} {selectedBooking.model || ""}
          </p>

          <p>
            <strong>Plate Number:</strong>{" "}
            {selectedBooking.plateNumber || "Not provided"}
          </p>

          <p>
            <strong>Start:</strong>{" "}
            {formatDate(selectedBooking.startDate)}
          </p>

          <p>
            <strong>End:</strong>{" "}
            {formatDate(selectedBooking.endDate)}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {selectedBooking.status || "Pending"}
          </p>

          <p>
            <strong>Total:</strong>{" "}
            ₱{Number(selectedBooking.totalPrice || 0).toLocaleString(
              "en-PH",
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}
          </p>

          <Link to="/rentals" className="button primary-button">
            Manage Bookings
          </Link>
        </section>
      )}
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


function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    availableVehicles: 0,
    totalCustomers: 0,
    totalBookings: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("driveEasyToken");
     const response = await fetch(
  `${ADMIN_API}/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load dashboard.");
      }

      setStats({
        totalVehicles: data.totalVehicles ?? 0,
        availableVehicles: data.availableVehicles ?? 0,
        totalCustomers: data.totalCustomers ?? 0,
        totalBookings: data.totalBookings ?? 0
      });
    } catch (err) {
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const statsCards = [
    {
      title: "Total Vehicles",
      value: stats.totalVehicles,
      icon: "🚘"
    },
    {
      title: "Available Vehicles",
      value: stats.availableVehicles,
      icon: "☑️"
    },
    {
      title: "Registered Customers",
      value: stats.totalCustomers,
      icon: "👥"
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: "▤"
    }
  ];

  const managementCards = [
    {
      title: "Rental Management",
      description: "View bookings and manage rental status.",
      button: "Manage Rentals",
      icon: "▤",
      path: "/rentals"
    },
    {
      title: "Customer Management",
      description: "View and manage customer records.",
      button: "Manage Customers",
      icon: "👥",
      path: "/customers"
    },
    {
      title: "Vehicle Management",
      description: "Add, edit, and remove vehicles.",
      button: "Manage Vehicles",
      icon: "🚘",
      path: "/vehicles"
    }
  ];

  return (
    <main className="admin-dashboard">
      <div className="dashboard-heading">
        <span className="dashboard-eyebrow">
          DRIVEEASY ADMINISTRATION
        </span>
        <h1>Admin Dashboard</h1>
        <p>
          Welcome to DriveEasy! Here is an overview of your vehicle
          rental system.
        </p>
      </div>

      <section className="dashboard-section">
        <h2 className="dashboard-overview-title">System Overview</h2>

        {loading ? (
          <p className="dashboard-message">Loading dashboard statistics...</p>
        ) : error ? (
          <div className="dashboard-message dashboard-error">
            <p>{error}</p>
            <button onClick={loadDashboard} className="dashboard-button">
              Try Again
            </button>
          </div>
        ) : (
          <div className="dashboard-cards">
            {statsCards.map((card) => (
              <article className="dashboard-card" key={card.title}>
                <span className="dashboard-card-icon">{card.icon}</span>
                <p>{card.title}</p>
                <h3>
                  {Number(card.value).toLocaleString("en-PH")}
                </h3>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-management">
        <div className="dashboard-action-grid">
          {managementCards.map((card) => (
            <article className="dashboard-action" key={card.title}>
              <span className="dashboard-action-icon">{card.icon}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <Link to={card.path} className="dashboard-button">
                {card.button}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <footer className="dashboard-footer">
        <span>✦ DRIVEEASY</span>
        <span>PREMIUM RENTAL MANAGEMENT</span>
      </footer>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/calendar" element={<BookingCalendar />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/book" element={<CustomerBooking />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Chatbot />
        <Footer />
      </div>
    </BrowserRouter>
  );
}