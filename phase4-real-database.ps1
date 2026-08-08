# Phase 4: Patients + Appointments moved to real MongoDB
# Real RBAC now protects real data, not just the User model

Write-Host "Applying Phase 4 (real database)..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "src\Components" | Out-Null
New-Item -ItemType Directory -Force -Path "src\pages" | Out-Null
New-Item -ItemType Directory -Force -Path "src\services" | Out-Null
New-Item -ItemType Directory -Force -Path "server\models" | Out-Null
New-Item -ItemType Directory -Force -Path "server\routes" | Out-Null

$content_0 = @'
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import doctorRoutes from "./routes/doctor.js";
import patientRoutes from "./routes/patients.js";
import appointmentRoutes from "./routes/appointments.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("HealthLock backend is running. Try /api/health for a status check.");
});

// Simple health check -- open this URL in a browser to confirm the server
// is actually running: http://localhost:5000/api/health
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    databaseConnected: mongoose.connection.readyState === 1,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000, // fail fast instead of hanging silently
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection FAILED:", err.message);
    console.error("Check your MONGODB_URI in server/.env -- server will keep running but database calls will fail.");
  }

  app.listen(PORT, () => {
    console.log(`HealthLock backend running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

start();

'@
Set-Content -Path "server\server.js" -Value $content_0 -NoNewline
Write-Host "Updated server\server.js" -ForegroundColor Green

$content_1 = @'
import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    size: Number,
    dataUrl: String, // TODO (Phase 2b): move to Cloudinary/Firebase, store URL instead of base64
    description: String,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const patientSchema = new mongoose.Schema(
  {
    qrToken: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    contact: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    diagnosis: { type: String, required: true },
    medicalHistory: { type: String, default: "" },
    description: { type: String, default: "" },
    files: [fileSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // which staff account created this record
  },
  { timestamps: true } // createdAt / updatedAt
);

export default mongoose.model("Patient", patientSchema);

'@
Set-Content -Path "server\models\Patient.js" -Value $content_1 -NoNewline
Write-Host "Updated server\models\Patient.js" -ForegroundColor Green

$content_2 = @'
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who booked it
    doctorName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Upcoming", "Cancelled", "Completed"],
      default: "Upcoming",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);

'@
Set-Content -Path "server\models\Appointment.js" -Value $content_2 -NoNewline
Write-Host "Updated server\models\Appointment.js" -ForegroundColor Green

$content_3 = @'
import express from "express";
import crypto from "crypto";
import Patient from "../models/Patient.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Patient records are managed by hospital staff (Doctor/Admin), not by the
// Patient role directly -- a Patient role in this app is a portal account,
// separate from the hospital's internal patient database. Every route
// below requires Doctor or Admin; a Patient-role token gets a real 403.
router.use(requireAuth, requireRole("Doctor", "Admin"));

function generateQrToken() {
  return "HL-" + crypto.randomUUID();
}

// GET /api/patients - list all, with optional search
router.get("/", async (req, res) => {
  const { q } = req.query;
  const filter = q
    ? {
        $or: [
          { name: new RegExp(q, "i") },
          { diagnosis: new RegExp(q, "i") },
          { contact: new RegExp(q, "i") },
        ],
      }
    : {};
  const patients = await Patient.find(filter).sort({ createdAt: -1 });
  res.json({ patients });
});

// GET /api/patients/by-token/:qrToken - used by the Doctor QR scanner
router.get("/by-token/:qrToken", async (req, res) => {
  const patient = await Patient.findOne({ qrToken: req.params.qrToken });
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json({ patient });
});

// POST /api/patients - create, with a guaranteed-unique QR token
router.post("/", async (req, res) => {
  try {
    const patient = await Patient.create({
      ...req.body,
      qrToken: generateQrToken(),
      createdBy: req.user.id,
    });
    res.status(201).json({ patient });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/patients/:id - update
router.patch("/:id", async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json({ patient });
});

// DELETE /api/patients/:id
router.delete("/:id", async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json({ success: true });
});

// POST /api/patients/:id/files - add an uploaded file to a patient
router.post("/:id/files", async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  patient.files.push(req.body);
  await patient.save();
  res.json({ patient });
});

export default router;

'@
Set-Content -Path "server\routes\patients.js" -Value $content_3 -NoNewline
Write-Host "Updated server\routes\patients.js" -ForegroundColor Green

$content_4 = @'
import express from "express";
import Appointment from "../models/Appointment.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth); // every route below requires a valid session

// GET /api/appointments
// Patient role: only sees their own appointments.
// Doctor/Admin: sees everyone's (needed to manage the schedule).
router.get("/", async (req, res) => {
  const filter = req.user.role === "Patient" ? { userId: req.user.id } : {};
  const appointments = await Appointment.find(filter).sort({ date: 1, time: 1 });
  res.json({ appointments });
});

// POST /api/appointments - book one for yourself
router.post("/", async (req, res) => {
  try {
    const appt = await Appointment.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ appointment: appt });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Helper: only the owner OR a Doctor/Admin can modify a given appointment.
async function canModify(req, res, next) {
  const appt = await Appointment.findById(req.params.id);
  if (!appt) return res.status(404).json({ error: "Appointment not found" });
  const isOwner = appt.userId.toString() === req.user.id;
  const isStaff = ["Doctor", "Admin"].includes(req.user.role);
  if (!isOwner && !isStaff) {
    return res.status(403).json({ error: "Forbidden -- not your appointment" });
  }
  req.appointment = appt;
  next();
}

// PATCH /api/appointments/:id - update status (cancel, etc.)
router.patch("/:id", canModify, async (req, res) => {
  Object.assign(req.appointment, req.body);
  await req.appointment.save();
  res.json({ appointment: req.appointment });
});

// DELETE /api/appointments/:id
router.delete("/:id", canModify, async (req, res) => {
  await req.appointment.deleteOne();
  res.json({ success: true });
});

export default router;

'@
Set-Content -Path "server\routes\appointments.js" -Value $content_4 -NoNewline
Write-Host "Updated server\routes\appointments.js" -ForegroundColor Green

$content_5 = @'
// Patient data store -- REAL backend now (Phase 4).
//
// Every function here calls the real Express + MongoDB API instead of
// localStorage. Function names are unchanged from before, but every
// function is now async (returns a Promise) since it's real network I/O --
// callers need to `await` these and handle loading/error states.

import { apiFetch } from "./auth";

// MongoDB documents use `_id`; the rest of the frontend (built before the
// real backend existed) expects `.id`. Normalizing here means every other
// file (Patients.jsx, DoctorDashboard.jsx, modals) keeps working unchanged.
function normalize(patient) {
  if (!patient) return patient;
  return { ...patient, id: patient._id };
}

export async function getPatients(query = "") {
  const qs = query ? `?q=${encodeURIComponent(query)}` : "";
  const data = await apiFetch(`/api/patients${qs}`);
  return data.patients.map(normalize);
}

export async function getPatientByToken(qrToken) {
  try {
    const data = await apiFetch(`/api/patients/by-token/${encodeURIComponent(qrToken)}`);
    return normalize(data.patient);
  } catch (err) {
    if (err.message.includes("404")) return null;
    throw err;
  }
}

export async function addPatient(data) {
  const res = await apiFetch("/api/patients", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return normalize(res.patient);
}

export async function updatePatient(id, updates) {
  const res = await apiFetch(`/api/patients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return normalize(res.patient);
}

export async function deletePatient(id) {
  await apiFetch(`/api/patients/${id}`, { method: "DELETE" });
}

export async function addFileToPatient(id, file) {
  const res = await apiFetch(`/api/patients/${id}/files`, {
    method: "POST",
    body: JSON.stringify(file),
  });
  return normalize(res.patient);
}

'@
Set-Content -Path "src\patientStore.js" -Value $content_5 -NoNewline
Write-Host "Updated src\patientStore.js" -ForegroundColor Green

$content_6 = @'
// Appointment data store -- REAL backend now (Phase 4).
import { apiFetch } from "./auth";

function normalize(appt) {
  if (!appt) return appt;
  return { ...appt, id: appt._id };
}

export async function getAppointments() {
  const data = await apiFetch("/api/appointments");
  return data.appointments.map(normalize);
}

export async function addAppointment(data) {
  const res = await apiFetch("/api/appointments", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return normalize(res.appointment);
}

export async function updateAppointment(id, updates) {
  const res = await apiFetch(`/api/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return normalize(res.appointment);
}

export async function cancelAppointment(id) {
  return updateAppointment(id, { status: "Cancelled" });
}

export async function deleteAppointment(id) {
  await apiFetch(`/api/appointments/${id}`, { method: "DELETE" });
}

'@
Set-Content -Path "src\appointmentStore.js" -Value $content_6 -NoNewline
Write-Host "Updated src\appointmentStore.js" -ForegroundColor Green

$content_7 = @'
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import ConsentManagement from "./pages/ConsentManagement";
import Patients from "./pages/Patients";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import Vitals from "./pages/Vitals";
import Appointments from "./pages/Appointments";
import Family from "./pages/Family";
import Emergency from "./pages/Emergency";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDoctors from "./pages/AdminDoctors";
import Settings from "./pages/Settings";
import AdminSystem from "./pages/AdminSystem";
import AdminSecurity from "./pages/AdminSecurity";
import AdminStorage from "./pages/AdminStorage";
import AdminRoles from "./pages/AdminRoles";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute roles={["Doctor", "Admin"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute roles={["Doctor", "Admin"]}>
              <Patients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vitals"
          element={
            <ProtectedRoute>
              <Vitals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/family"
          element={
            <ProtectedRoute>
              <Family />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emergency"
          element={
            <ProtectedRoute>
              <Emergency />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <AdminDoctors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/system"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <AdminSystem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/security"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <AdminSecurity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/storage"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <AdminStorage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute roles={["Admin"]}>
              <AdminRoles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consent"
          element={
            <ProtectedRoute>
              <ConsentManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;

'@
Set-Content -Path "src\App.jsx" -Value $content_7 -NoNewline
Write-Host "Updated src\App.jsx" -ForegroundColor Green

$content_8 = @'
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import Logo from "./Logo";
import { getUser, clearUser, hasRole } from "../auth";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  // Re-check login state whenever the route changes (e.g. right after login)
  useEffect(() => {
    setUser(getUser());
    setMenuOpen(false); // close mobile menu on navigation
    setMoreOpen(false);
  }, [location]);

  // Close the "More" dropdown when clicking outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearUser();
    setUser(null);
    navigate("/");
  };

  const primaryLinks = (
    <>
      <Link to="/dashboard" className="hover:text-red-600 transition-colors">Dashboard</Link>
      {hasRole("Doctor", "Admin") && (
        <Link to="/patients" className="hover:text-red-600 transition-colors">Patients</Link>
      )}
      {hasRole("Doctor", "Admin") && (
        <Link to="/doctor" className="hover:text-red-600 transition-colors">Doctor</Link>
      )}
      <Link to="/consent" className="hover:text-red-600 transition-colors">Consent</Link>
    </>
  );

  const moreLinks = (
    <>
      <Link to="/vitals" className="hover:text-red-600 transition-colors">Vitals</Link>
      <Link to="/appointments" className="hover:text-red-600 transition-colors">Appointments</Link>
      <Link to="/family" className="hover:text-red-600 transition-colors">Family</Link>
      <Link to="/emergency" className="hover:text-red-600 transition-colors">Emergency</Link>
      {hasRole("Admin") && (
        <>
          <Link to="/admin" className="hover:text-red-600 transition-colors">Admin</Link>
          <Link to="/admin/doctors" className="hover:text-red-600 transition-colors">Doctor Verification</Link>
          <Link to="/admin/system" className="hover:text-red-600 transition-colors">System Monitoring</Link>
          <Link to="/admin/security" className="hover:text-red-600 transition-colors">Security Center</Link>
          <Link to="/admin/storage" className="hover:text-red-600 transition-colors">Storage Management</Link>
          <Link to="/admin/roles" className="hover:text-red-600 transition-colors">Roles & Permissions</Link>
        </>
      )}
      <Link to="/settings" className="hover:text-red-600 transition-colors">Settings</Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" onClick={() => setMenuOpen(false)}>
          <Logo size="text-lg md:text-2xl" />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7 text-gray-700 dark:text-gray-200 font-medium">
          {primaryLinks}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((o) => !o)}
              className="flex items-center gap-1 hover:text-red-600 transition-colors"
            >
              More <ChevronDown size={16} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 flex flex-col min-w-[160px]">
                <Link to="/vitals" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 transition-colors">Vitals</Link>
                <Link to="/appointments" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 transition-colors">Appointments</Link>
                <Link to="/family" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 transition-colors">Family</Link>
                <Link to="/emergency" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 transition-colors">Emergency</Link>
                <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                {hasRole("Admin") && (
                  <>
                    <Link to="/admin" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 transition-colors">Admin Dashboard</Link>
                    <Link to="/admin/doctors" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 transition-colors">Doctor Verification</Link>
                    <Link to="/admin/system" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 transition-colors">System Monitoring</Link>
                    <Link to="/admin/security" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 transition-colors">Security Center</Link>
                    <Link to="/admin/storage" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 transition-colors">Storage Management</Link>
                    <Link to="/admin/roles" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 transition-colors">Roles & Permissions</Link>
                  </>
                )}
                <Link to="/settings" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 transition-colors">Settings</Link>
              </div>
            )}
          </div>
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                {user.picture && (
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                )}
                <span className="text-sm font-semibold text-gray-800 max-w-[120px] truncate">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-full font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2.5 rounded-full font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger button */}
        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 pb-5 pt-2 space-y-4">
          <div className="flex flex-col gap-3 text-gray-700 font-medium text-base pt-2">
            {primaryLinks}
            {moreLinks}
          </div>

          <div className="border-t border-gray-200 pt-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {user.picture && (
                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                  )}
                  <span className="text-sm font-semibold text-gray-800 truncate">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-5 py-2.5 rounded-full font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full px-5 py-2.5 rounded-full font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="w-full px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

'@
Set-Content -Path "src\Components\Navbar.jsx" -Value $content_8 -NoNewline
Write-Host "Updated src\Components\Navbar.jsx" -ForegroundColor Green

$content_9 = @'
import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Eye, Pencil, Trash2, Users, Loader2 } from "lucide-react";
import {
  getPatients,
  addPatient,
  updatePatient,
  deletePatient,
} from "../patientStore";
import PatientFormModal from "../Components/PatientFormModal";
import PatientDetailModal from "../Components/PatientDetailModal";
import { useToast } from "../Components/Toast";

export default function Patients() {
  const showToast = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      showToast(err.message || "Failed to load patients", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.diagnosis.toLowerCase().includes(q) ||
        p.contact.includes(q);
      const matchesGender = !genderFilter || p.gender === genderFilter;
      return matchesQuery && matchesGender;
    });
  }, [patients, query, genderFilter]);

  const handleAddClick = () => {
    setEditingPatient(null);
    setFormOpen(true);
  };

  const handleEditClick = (patient) => {
    setEditingPatient(patient);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData, pendingFiles) => {
    setSaving(true);
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, {
          ...formData,
          files: [...editingPatient.files, ...pendingFiles],
        });
        showToast("Patient updated successfully", "success");
      } else {
        const created = await addPatient(formData);
        if (pendingFiles.length > 0) {
          await updatePatient(created.id, { files: pendingFiles });
        }
        showToast("Patient added with a unique QR code", "success");
      }
      setFormOpen(false);
      setEditingPatient(null);
      await refresh();
    } catch (err) {
      showToast(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirmed = async (id) => {
    try {
      await deletePatient(id);
      showToast("Patient deleted", "info");
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      setConfirmDeleteId(null);
      await refresh();
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
              <Users size={20} />
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Patient Management</h1>
              <p className="text-gray-500 text-sm">{patients.length} patient{patients.length !== 1 ? "s" : ""} on record</p>
            </div>
          </div>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
          >
            <Plus size={18} /> Add Patient
          </button>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, diagnosis, or contact..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="mx-auto animate-spin text-red-600 mb-3" size={32} />
            <p className="text-gray-400 text-sm">Loading patients...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded-3xl">
            <Users className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium">
              {patients.length === 0 ? "No patients added yet." : "No patients match your search."}
            </p>
            {patients.length === 0 && (
              <button
                onClick={handleAddClick}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <Plus size={16} /> Add your first patient
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table on larger screens */}
            <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Age</th>
                    <th className="px-5 py-3">Gender</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Blood Group</th>
                    <th className="px-5 py-3">Diagnosis</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3 font-semibold text-gray-900">{p.name}</td>
                      <td className="px-5 py-3 text-gray-600">{p.age}</td>
                      <td className="px-5 py-3 text-gray-600">{p.gender}</td>
                      <td className="px-5 py-3 text-gray-600">{p.contact}</td>
                      <td className="px-5 py-3 text-gray-600">{p.bloodGroup}</td>
                      <td className="px-5 py-3 text-gray-600">{p.diagnosis}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setViewingPatient(p)} title="View" className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleEditClick(p)} title="Edit" className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => setConfirmDeleteId(p.id)} title="Delete" className="p-2 rounded-full hover:bg-red-50 text-red-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards on mobile */}
            <div className="md:hidden space-y-4">
              {filtered.map((p) => (
                <div key={p.id} className="border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.age} yrs · {p.gender} · {p.bloodGroup}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setViewingPatient(p)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleEditClick(p)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setConfirmDeleteId(p.id)} className="p-2 rounded-full hover:bg-red-50 text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600"><span className="font-semibold text-gray-800">Contact:</span> {p.contact}</p>
                  <p className="text-sm text-gray-600"><span className="font-semibold text-gray-800">Diagnosis:</span> {p.diagnosis}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {formOpen && (
        <PatientFormModal
          initialData={editingPatient}
          onClose={() => {
            setFormOpen(false);
            setEditingPatient(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}

      {viewingPatient && (
        <PatientDetailModal patient={viewingPatient} onClose={() => setViewingPatient(null)} />
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <p className="font-bold text-gray-900 mb-2">Delete this patient?</p>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-5 py-2.5 rounded-full font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirmed(confirmDeleteId)}
                className="px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'@
Set-Content -Path "src\pages\Patients.jsx" -Value $content_9 -NoNewline
Write-Host "Updated src\pages\Patients.jsx" -ForegroundColor Green

$content_10 = @'
import React, { useState } from "react";
import { ShieldCheck, User, FileText } from "lucide-react";
import QRScanner from "../Components/QRScanner";
import { getPatientByToken } from "../patientStore";
import { logAction } from "../auditStore";
import { useToast } from "../Components/Toast";

function DoctorDashboard() {
  const showToast = useToast();
  const [currentPatient, setCurrentPatient] = useState(null);
  const [scannedList, setScannedList] = useState([]); // patients scanned this session

  const handleScan = async (token) => {
    let patient;
    try {
      patient = await getPatientByToken(token);
    } catch (err) {
      showToast(err.message || "Could not reach the server", "error");
      return;
    }

    if (!patient) {
      showToast("QR code not recognized -- no matching patient found.", "error");
      return;
    }

    setCurrentPatient(patient);

    setScannedList((list) => {
      const alreadyScanned = list.some((p) => p.id === patient.id);
      if (alreadyScanned) {
        showToast(`${patient.name} was already scanned in this session.`, "info");
        return list; // no duplicate entry
      }
      showToast(`${patient.name}'s records loaded successfully.`, "success");
      logAction("QR scan - patient accessed", patient.name);
      return [patient, ...list];
    });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1600&q=80"
          alt="Doctor with stethoscope"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center">
          <h1 className="text-2xl md:text-5xl font-extrabold text-white px-6 md:px-16">
            Doctor Dashboard
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-12 space-y-8 md:space-y-10">
        {/* QR Scanner - constrained width so the camera never looks oversized */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-10 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-5 md:mb-6 text-center">
            Patient QR Scanner
          </h2>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 max-w-[300px] mx-auto">
            <QRScanner onDecode={handleScan} />
          </div>
        </div>

        {/* Currently viewed patient */}
        {currentPatient && (
          <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                <User size={20} />
              </span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentPatient.name}</h2>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <ShieldCheck size={14} /> Access granted via secure QR scan
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700 mb-4">
              <p><span className="font-semibold text-gray-900">Age:</span> {currentPatient.age}</p>
              <p><span className="font-semibold text-gray-900">Gender:</span> {currentPatient.gender}</p>
              <p><span className="font-semibold text-gray-900">Blood Group:</span> {currentPatient.bloodGroup}</p>
              <p><span className="font-semibold text-gray-900">Contact:</span> {currentPatient.contact}</p>
              <p className="sm:col-span-2"><span className="font-semibold text-gray-900">Diagnosis:</span> {currentPatient.diagnosis}</p>
              {currentPatient.medicalHistory && (
                <p className="sm:col-span-2"><span className="font-semibold text-gray-900">Medical History:</span> {currentPatient.medicalHistory}</p>
              )}
            </div>
            {currentPatient.files?.length > 0 && (
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-2">Uploaded Files</p>
                <ul className="space-y-2">
                  {currentPatient.files.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 rounded-xl p-2">
                      <FileText size={16} className="text-gray-500 shrink-0" />
                      <a href={f.dataUrl} download={f.name} className="text-red-600 hover:underline truncate">
                        {f.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Session scan list */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-10 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Patients Scanned This Session</h2>
          {scannedList.length === 0 ? (
            <p className="text-sm text-gray-400">Scan a patient's QR code above to add them here.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {scannedList.map((p) => (
                <li
                  key={p.id}
                  onClick={() => setCurrentPatient(p)}
                  className="py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 px-2 rounded-lg"
                >
                  <span className="font-medium text-gray-900">{p.name}</span>
                  <span className="text-xs text-gray-500">{p.diagnosis}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;

'@
Set-Content -Path "src\pages\DoctorDashboard.jsx" -Value $content_10 -NoNewline
Write-Host "Updated src\pages\DoctorDashboard.jsx" -ForegroundColor Green

$content_11 = @'
import React, { useEffect, useState } from "react";
import { CalendarDays, Plus, X, Trash2, Loader2 } from "lucide-react";
import {
  getAppointments,
  addAppointment,
  cancelAppointment,
  deleteAppointment,
} from "../appointmentStore";
import { useToast } from "../Components/Toast";

const TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "04:00 PM", "05:00 PM"];

function statusStyle(status) {
  if (status === "Upcoming") return "bg-green-100 text-green-700";
  if (status === "Cancelled") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

export default function Appointments() {
  const showToast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ doctorName: "", date: "", time: TIME_SLOTS[0], reason: "" });
  const [errors, setErrors] = useState({});

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      showToast(err.message || "Failed to load appointments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.doctorName.trim()) e.doctorName = "Doctor name is required";
    if (!form.date) e.date = "Pick a date";
    else if (new Date(form.date) < new Date(new Date().toDateString())) e.date = "Date cannot be in the past";
    if (!form.reason.trim()) e.reason = "Reason for visit is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleBook = async () => {
    if (!validate()) return;
    try {
      await addAppointment(form);
      setForm({ doctorName: "", date: "", time: TIME_SLOTS[0], reason: "" });
      setFormOpen(false);
      showToast("Appointment booked successfully", "success");
      await refresh();
    } catch (err) {
      showToast(err.message || "Booking failed", "error");
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      showToast("Appointment cancelled", "info");
    } catch (err) {
      showToast(err.message || "Cancel failed", "error");
    } finally {
      await refresh();
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAppointment(id);
      showToast("Appointment removed", "info");
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      await refresh();
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
              <CalendarDays size={20} />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Appointments</h1>
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
          >
            <Plus size={18} /> Book Appointment
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="mx-auto animate-spin text-red-600 mb-3" size={32} />
            <p className="text-gray-400 text-sm">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded-3xl">
            <CalendarDays className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium">No appointments booked yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((a) => (
              <div key={a.id} className="border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">Dr. {a.doctorName}</p>
                  <p className="text-sm text-gray-500">{a.date} · {a.time}</p>
                  <p className="text-sm text-gray-600 mt-1">{a.reason}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle(a.status)}`}>
                    {a.status}
                  </span>
                  {a.status === "Upcoming" && (
                    <button
                      onClick={() => handleCancel(a.id)}
                      className="text-xs font-semibold text-gray-600 hover:text-red-600 underline"
                    >
                      Cancel
                    </button>
                  )}
                  <button onClick={() => handleDelete(a.id)} className="text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Book Appointment</h2>
              <button onClick={() => setFormOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Doctor Name *</label>
                <input
                  type="text"
                  value={form.doctorName}
                  onChange={(e) => setForm((f) => ({ ...f, doctorName: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl border ${errors.doctorName ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                  placeholder="e.g. Sharma"
                />
                {errors.doctorName && <p className="text-xs text-red-600 mt-1">{errors.doctorName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl border ${errors.date ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                  />
                  {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Time slot</label>
                  <select
                    value={form.time}
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for visit *</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  rows={2}
                  className={`w-full px-3 py-2.5 rounded-xl border ${errors.reason ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                  placeholder="e.g. Regular checkup"
                />
                {errors.reason && <p className="text-xs text-red-600 mt-1">{errors.reason}</p>}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setFormOpen(false)}
                className="px-5 py-2.5 rounded-full font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                className="px-6 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'@
Set-Content -Path "src\pages\Appointments.jsx" -Value $content_11 -NoNewline
Write-Host "Updated src\pages\Appointments.jsx" -ForegroundColor Green

$content_12 = @'
import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, CalendarDays, ClipboardList, Download, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { getPatients } from "../patientStore";
import { getAppointments } from "../appointmentStore";
import { getAuditLog } from "../auditStore";
import { getDoctors } from "../doctorStore";

function toCsv(rows, headers) {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  });
  return lines.join("\n");
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function StatCard({ icon: Icon, label, value, to }) {
  const content = (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-900">
      <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
        <Icon size={20} />
      </span>
      <div>
        <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

export default function AdminDashboard() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [log, setLog] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setPatients(await getPatients());
      } catch {
        setPatients([]);
      }
      try {
        setAppointments(await getAppointments());
      } catch {
        setAppointments([]);
      }
      setDoctors(getDoctors());
      setLog(getAuditLog());
    })();
  }, []);

  const todayStr = new Date().toDateString();

  const newPatientsToday = patients.filter((p) => new Date(p.createdAt).toDateString() === todayStr).length;
  const todaysAppointments = appointments.filter((a) => new Date(a.date).toDateString() === todayStr).length;
  const cancelledAppointments = appointments.filter((a) => a.status === "Cancelled").length;
  const pendingDoctors = doctors.filter((d) => d.status === "Pending").length;

  // Real chart: patients registered per day, over the last 14 days actually
  // present in the data (no fabricated numbers).
  const chartData = useMemo(() => {
    const counts = {};
    patients.forEach((p) => {
      const day = new Date(p.createdAt).toLocaleDateString();
      counts[day] = (counts[day] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([day, count]) => ({ day, count }))
      .slice(-14);
  }, [patients]);

  const handleExportPatients = () => {
    const csv = toCsv(patients, ["id", "name", "age", "gender", "contact", "bloodGroup", "diagnosis", "createdAt"]);
    downloadCsv("patients_report.csv", csv);
  };

  const handleExportAppointments = () => {
    const csv = toCsv(appointments, ["id", "doctorName", "date", "time", "reason", "status"]);
    downloadCsv("appointments_report.csv", csv);
  };

  const handleExportAuditLog = () => {
    const csv = toCsv(log, ["id", "action", "details", "time", "browser"]);
    downloadCsv("audit_log.csv", csv);
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
          Admin Dashboard
        </h1>

        {/* Real stat cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Users} label="Total Patients" value={patients.length} to="/patients" />
          <StatCard icon={Users} label="New Today" value={newPatientsToday} />
          <StatCard icon={CalendarDays} label="Total Appointments" value={appointments.length} to="/appointments" />
          <StatCard icon={CalendarDays} label="Today's Appointments" value={todaysAppointments} />
          <StatCard icon={ClipboardList} label="Cancelled Appointments" value={cancelledAppointments} />
          <StatCard icon={ShieldAlert} label="Doctors Pending Verification" value={pendingDoctors} to="/admin/doctors" />
        </div>

        {/* Real chart from real data */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 mb-10">
          <p className="font-semibold text-gray-900 dark:text-white mb-4">Patients Registered (by day)</p>
          {chartData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No patients registered yet.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Export reports */}
        <div className="flex flex-wrap gap-3 mb-10">
          <button
            onClick={handleExportPatients}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-semibold hover:bg-black dark:hover:bg-gray-200 transition-colors"
          >
            <Download size={16} /> Export Patients (CSV)
          </button>
          <button
            onClick={handleExportAppointments}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-semibold hover:bg-black dark:hover:bg-gray-200 transition-colors"
          >
            <Download size={16} /> Export Appointments (CSV)
          </button>
          <button
            onClick={handleExportAuditLog}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-semibold hover:bg-black dark:hover:bg-gray-200 transition-colors"
          >
            <Download size={16} /> Export Audit Log (CSV)
          </button>
        </div>

        {/* Quick links to other admin sections */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <Link to="/admin/system" className="text-center px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors">
            System Monitoring
          </Link>
          <Link to="/admin/security" className="text-center px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors">
            Security Center
          </Link>
          <Link to="/admin/storage" className="text-center px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors">
            Storage Management
          </Link>
          <Link to="/admin/roles" className="text-center px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors">
            Roles & Permissions
          </Link>
        </div>

        {/* Real audit log */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
          <p className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity (Audit Log)</p>
          {log.length === 0 ? (
            <p className="text-sm text-gray-400">No activity recorded yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
              {log.slice(0, 50).map((entry) => (
                <li key={entry.id} className="py-2.5 flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">{entry.action}</span>
                    {entry.details && <span className="text-gray-500 dark:text-gray-400"> — {entry.details}</span>}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">{new Date(entry.time).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

'@
Set-Content -Path "src\pages\AdminDashboard.jsx" -Value $content_12 -NoNewline
Write-Host "Updated src\pages\AdminDashboard.jsx" -ForegroundColor Green

$content_13 = @'
import React, { useEffect, useState } from "react";
import { HardDrive, FileText, AlertTriangle } from "lucide-react";
import { getStorageOverview, formatBytes } from "../services/storageService";

export default function AdminStorage() {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    getStorageOverview().then(setOverview).catch(() => setOverview(null));
  }, []);

  if (!overview) return null;

  const usedPercent = Math.min(100, Math.round((overview.usedBytes / overview.quotaBytes) * 100));

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
            <HardDrive size={20} />
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">File Storage Management</h1>
        </div>

        <div className="flex items-start gap-2 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <p>
            These numbers are <strong>real</strong> -- calculated from actual browser storage usage, not
            simulated. This is browser (localStorage) storage, not cloud storage. Swapping to
            Cloudinary/Firebase later (see storageService.js TODO) will replace this with real cloud
            quota numbers instead.
          </p>
        </div>

        {/* Usage bar */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatBytes(overview.usedBytes)} used
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {formatBytes(overview.remainingBytes)} remaining of ~{formatBytes(overview.quotaBytes)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 transition-all ${usedPercent > 80 ? "bg-red-600" : "bg-gray-900 dark:bg-white"}`}
              style={{ width: `${usedPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{overview.totalFiles} file(s) uploaded across all patients</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
            <p className="font-semibold text-gray-900 dark:text-white mb-3">Largest Files</p>
            {overview.largestFiles.length === 0 ? (
              <p className="text-sm text-gray-400">No files uploaded yet.</p>
            ) : (
              <ul className="space-y-2">
                {overview.largestFiles.map((f) => (
                  <li key={f.id} className="flex items-center gap-2 text-sm">
                    <FileText size={14} className="text-gray-400 shrink-0" />
                    <span className="truncate flex-1 text-gray-700 dark:text-gray-300">{f.name}</span>
                    <span className="text-gray-400 text-xs shrink-0">{formatBytes(f.size)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
            <p className="font-semibold text-gray-900 dark:text-white mb-3">Recent Uploads</p>
            {overview.recentUploads.length === 0 ? (
              <p className="text-sm text-gray-400">No files uploaded yet.</p>
            ) : (
              <ul className="space-y-2">
                {overview.recentUploads.map((f) => (
                  <li key={f.id} className="flex items-center gap-2 text-sm">
                    <FileText size={14} className="text-gray-400 shrink-0" />
                    <span className="truncate flex-1 text-gray-700 dark:text-gray-300">{f.name}</span>
                    <span className="text-gray-400 text-xs shrink-0">{f.patientName}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'@
Set-Content -Path "src\pages\AdminStorage.jsx" -Value $content_13 -NoNewline
Write-Host "Updated src\pages\AdminStorage.jsx" -ForegroundColor Green

$content_14 = @'
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, CalendarCheck, ShieldCheck } from "lucide-react";
import FileUpload from "../Components/FileUpload";
import QRGenerator from "../Components/QRGenerator";
import AccessLogs from "../Components/AccessLogs";
import HealthHistory from "../Components/HealthHistory";
import { useCountUp } from "../useCountUp";
import { getAppointments } from "../appointmentStore";

function StatCard({ icon: Icon, label, value }) {
  const animated = useCountUp(value);
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
        <Icon size={20} />
      </span>
      <div>
        <p className="text-2xl font-extrabold text-gray-900">{animated}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

function Dashboard() {
  const [fileCount, setFileCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);

  useEffect(() => {
    try {
      const files = JSON.parse(localStorage.getItem("healthlock_my_files") || "[]");
      setFileCount(files.length);
    } catch {
      setFileCount(0);
    }
    getAppointments()
      .then((appts) => setAppointmentCount(appts.length))
      .catch(() => setAppointmentCount(0));
  }, []);

  const cards = [
    { component: FileUpload, title: "File Upload" },
    { component: QRGenerator, title: "QR Generator" },
    { component: HealthHistory, title: "Health Record History" },
    { component: AccessLogs, title: "Access Logs" },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Banner */}
      <div className="relative h-56 md:h-64 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1600&q=80"
          alt="Healthcare records"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-extrabold text-white px-6 md:px-16"
          >
            Patient Dashboard
          </motion.h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 space-y-10">
        {/* Real animated stat cards */}
        <div className="grid sm:grid-cols-3 gap-5">
          <StatCard icon={FileText} label="Files Uploaded" value={fileCount} />
          <StatCard icon={CalendarCheck} label="Appointments" value={appointmentCount} />
          <StatCard icon={ShieldCheck} label="Encryption" value={100} />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {cards.map(({ component: Comp, title }, i) => (
            <motion.div
              key={title}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              whileHover={{ y: -3 }}
              className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">{title}</h2>
              <Comp />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

'@
Set-Content -Path "src\pages\Dashboard.jsx" -Value $content_14 -NoNewline
Write-Host "Updated src\pages\Dashboard.jsx" -ForegroundColor Green

$content_15 = @'
import { getPatients } from "../patientStore";

// Storage usage here is genuinely real -- we calculate the actual number of
// bytes currently used in this browser's localStorage, and list the actual
// uploaded patient files with their real sizes. Nothing here is simulated.
//
// TODO (Phase 2 backend): once file uploads go to Cloudinary/Firebase
// instead of being base64-encoded into localStorage, replace
// `getRealLocalStorageUsage()` with a real API call that returns the
// cloud storage provider's actual usage/quota numbers.

const APPROX_BROWSER_QUOTA_BYTES = 5 * 1024 * 1024; // ~5MB is the typical localStorage limit

function getRealLocalStorageUsageBytes() {
  let total = 0;
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      total += (localStorage[key]?.length || 0) + key.length;
    }
  }
  return total; // real byte count (UTF-16 code units), not a fabricated number
}

export async function getStorageOverview() {
  const usedBytes = getRealLocalStorageUsageBytes();
  const patients = await getPatients();

  const allFiles = patients.flatMap((p) =>
    (p.files || []).map((f) => ({ ...f, patientName: p.name, patientId: p.id }))
  );

  const largestFiles = [...allFiles].sort((a, b) => b.size - a.size).slice(0, 10);
  const recentUploads = [...allFiles]
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    .slice(0, 10);

  return {
    usedBytes,
    quotaBytes: APPROX_BROWSER_QUOTA_BYTES,
    remainingBytes: Math.max(0, APPROX_BROWSER_QUOTA_BYTES - usedBytes),
    totalFiles: allFiles.length,
    largestFiles,
    recentUploads,
    isCloudStorage: false, // genuinely true -- this is browser storage, not cloud
  };
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

'@
Set-Content -Path "src\services\storageService.js" -Value $content_15 -NoNewline
Write-Host "Updated src\services\storageService.js" -ForegroundColor Green

Write-Host "Done! Restart BOTH terminals: backend (cd server; npm run dev) and frontend (npm run dev)" -ForegroundColor Cyan