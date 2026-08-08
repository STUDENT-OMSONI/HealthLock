# COMBINED: Everything from both Admin Panel phases in one script
# This replaces admin-panel.ps1 AND backend-ready-architecture.ps1 -- run only THIS one

Write-Host "Applying complete Admin Panel (combined)..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "src\Components" | Out-Null
New-Item -ItemType Directory -Force -Path "src\pages" | Out-Null
New-Item -ItemType Directory -Force -Path "src\services" | Out-Null
New-Item -ItemType Directory -Force -Path "src\models" | Out-Null

$content_0 = @'
{
  "name": "healthlock",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@react-oauth/google": "^0.13.5",
    "@tailwindcss/vite": "^4.1.12",
    "axios": "^1.11.0",
    "html5-qrcode": "^2.3.8",
    "i18next": "^25.4.0",
    "jwt-decode": "^4.0.0",
    "lucide-react": "^0.540.0",
    "qrcode.react": "^4.2.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-i18next": "^15.7.1",
    "react-router-dom": "^7.8.1",
    "recharts": "^3.10.1",
    "tailwindcss": "^4.1.12"
  },
  "devDependencies": {
    "@eslint/js": "^9.33.0",
    "@types/react": "^19.1.10",
    "@types/react-dom": "^19.1.7",
    "@vitejs/plugin-react": "^5.0.0",
    "eslint": "^9.33.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.3.0",
    "vite": "^7.1.2"
  }
}

'@
Set-Content -Path "package.json" -Value $content_0 -NoNewline
Write-Host "Updated package.json" -ForegroundColor Green

$content_1 = @'
import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import { ToastProvider } from "./Components/Toast.jsx";
import { initTheme } from "./theme.js";
import "./index.css";

initTheme();

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

'@
Set-Content -Path "src\main.jsx" -Value $content_1 -NoNewline
Write-Host "Updated src\main.jsx" -ForegroundColor Green

$content_2 = @'
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
            <ProtectedRoute>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute>
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
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute>
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
            <ProtectedRoute>
              <AdminSystem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/security"
          element={
            <ProtectedRoute>
              <AdminSecurity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/storage"
          element={
            <ProtectedRoute>
              <AdminStorage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute>
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
Set-Content -Path "src\App.jsx" -Value $content_2 -NoNewline
Write-Host "Updated src\App.jsx" -ForegroundColor Green

$content_3 = @'
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

html {
  background-color: white;
}
html.dark {
  background-color: #0f0f0f;
}

'@
Set-Content -Path "src\index.css" -Value $content_3 -NoNewline
Write-Host "Updated src\index.css" -ForegroundColor Green

$content_4 = @'
const KEY = "healthlock_theme"; // "light" | "dark"

export function getTheme() {
  return localStorage.getItem(KEY) || "light";
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem(KEY, theme);
}

export function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

// Call this once when the app first loads so the saved preference applies
// immediately (e.g. from main.jsx).
export function initTheme() {
  applyTheme(getTheme());
}

'@
Set-Content -Path "src\theme.js" -Value $content_4 -NoNewline
Write-Host "Updated src\theme.js" -ForegroundColor Green

$content_5 = @'
const KEY = "healthlock_audit_log";
const MAX_ENTRIES = 500; // keep it from growing forever

function uid() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  // Trim to the most recent MAX_ENTRIES so localStorage doesn't fill up
  const trimmed = list.slice(-MAX_ENTRIES);
  localStorage.setItem(KEY, JSON.stringify(trimmed));
}

// Records a real action with real, honestly-labeled context.
// NOTE: this can only capture what the browser actually knows -- there is
// no real IP address or server session without a backend, so we log the
// browser's user agent string instead of pretending to have IP/device info
// we don't actually have.
export function logAction(action, details = "") {
  const list = readAll();
  list.push({
    id: uid(),
    action,
    details,
    time: new Date().toISOString(),
    browser: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
  });
  writeAll(list);
}

export function getAuditLog() {
  return readAll().sort((a, b) => new Date(b.time) - new Date(a.time));
}

export function clearAuditLog() {
  writeAll([]);
}

'@
Set-Content -Path "src\auditStore.js" -Value $content_5 -NoNewline
Write-Host "Updated src\auditStore.js" -ForegroundColor Green

$content_6 = @'
import { logAction } from "./auditStore";

const KEY = "healthlock_doctors";

function uid() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getDoctors() {
  return readAll();
}

export function addDoctor(data) {
  const list = readAll();
  const doctor = {
    id: uid(),
    name: data.name,
    specialization: data.specialization,
    license: data.license,
    experience: data.experience,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };
  list.push(doctor);
  writeAll(list);
  logAction("Doctor registration submitted", doctor.name);
  return doctor;
}

export function setDoctorStatus(id, status) {
  const list = readAll();
  const idx = list.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  list[idx].status = status;
  writeAll(list);
  logAction(`Doctor ${status.toLowerCase()}`, list[idx].name);
  return list[idx];
}

export function deleteDoctor(id) {
  const doctor = readAll().find((d) => d.id === id);
  writeAll(readAll().filter((d) => d.id !== id));
  if (doctor) logAction("Doctor removed", doctor.name);
}

'@
Set-Content -Path "src\doctorStore.js" -Value $content_6 -NoNewline
Write-Host "Updated src\doctorStore.js" -ForegroundColor Green

$content_7 = @'
// Patient data store.
//
// For now this uses the browser's localStorage as the "database" so the
// whole Patient Management flow (add/edit/delete/search, unique QR per
// patient, file uploads, doctor QR-scan lookup) works end-to-end without
// needing a separate backend server running.
//
// Swapping this out for a real Excel/DB-backed API later just means
// replacing the functions below with real fetch() calls -- everything
// that *uses* this store (Patients.jsx, DoctorDashboard.jsx) only calls
// these functions, so the rest of the app won't need to change.

import { logAction } from "./auditStore";

const KEY = "healthlock_patients";

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}

function generateQrToken(existingTokens) {
  let token;
  do {
    token = "HL-" + uid();
  } while (existingTokens.has(token)); // guarantee uniqueness, just in case
  return token;
}

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getPatients() {
  return readAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getPatientByToken(token) {
  return readAll().find((p) => p.qrToken === token) || null;
}

export function getPatientById(id) {
  return readAll().find((p) => p.id === id) || null;
}

export function addPatient(data) {
  const list = readAll();
  const existingTokens = new Set(list.map((p) => p.qrToken));
  const now = new Date().toISOString();

  const patient = {
    id: uid(),
    qrToken: generateQrToken(existingTokens),
    name: data.name || "",
    age: data.age || "",
    gender: data.gender || "",
    contact: data.contact || "",
    bloodGroup: data.bloodGroup || "",
    diagnosis: data.diagnosis || "",
    medicalHistory: data.medicalHistory || "",
    description: data.description || "",
    files: [],
    createdAt: now,
    updatedAt: now,
  };

  list.push(patient);
  writeAll(list);
  logAction("Patient created", `${patient.name} (ID: ${patient.id})`);
  return patient;
}

export function updatePatient(id, updates) {
  const list = readAll();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
  writeAll(list);
  logAction("Patient updated", `${list[idx].name} (ID: ${id})`);
  return list[idx];
}

export function deletePatient(id) {
  const patient = readAll().find((p) => p.id === id);
  writeAll(readAll().filter((p) => p.id !== id));
  logAction("Patient deleted", patient ? `${patient.name} (ID: ${id})` : `ID: ${id}`);
}

export function addFileToPatient(id, file) {
  const list = readAll();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  list[idx].files.push(file);
  list[idx].updatedAt = new Date().toISOString();
  writeAll(list);
  return list[idx];
}

export function removeFileFromPatient(id, fileId) {
  const list = readAll();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  list[idx].files = list[idx].files.filter((f) => f.id !== fileId);
  list[idx].updatedAt = new Date().toISOString();
  writeAll(list);
  return list[idx];
}

'@
Set-Content -Path "src\patientStore.js" -Value $content_7 -NoNewline
Write-Host "Updated src\patientStore.js" -ForegroundColor Green

$content_8 = @'
import { logAction } from "./auditStore";

const KEY = "healthlock_appointments";

function uid() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getAppointments() {
  return readAll().sort((a, b) => new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time));
}

export function addAppointment(data) {
  const list = readAll();
  const appt = {
    id: uid(),
    doctorName: data.doctorName,
    date: data.date,
    time: data.time,
    reason: data.reason,
    status: "Upcoming",
    createdAt: new Date().toISOString(),
  };
  list.push(appt);
  writeAll(list);
  logAction("Appointment booked", `Dr. ${appt.doctorName} on ${appt.date} ${appt.time}`);
  return appt;
}

export function updateAppointment(id, updates) {
  const list = readAll();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  writeAll(list);
  if (updates.status) {
    logAction(`Appointment ${updates.status.toLowerCase()}`, `Dr. ${list[idx].doctorName} on ${list[idx].date}`);
  }
  return list[idx];
}

export function cancelAppointment(id) {
  return updateAppointment(id, { status: "Cancelled" });
}

export function deleteAppointment(id) {
  writeAll(readAll().filter((a) => a.id !== id));
}

'@
Set-Content -Path "src\appointmentStore.js" -Value $content_8 -NoNewline
Write-Host "Updated src\appointmentStore.js" -ForegroundColor Green

$content_9 = @'
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import Logo from "./Logo";
import { getUser, clearUser } from "../auth";

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
      <Link to="/patients" className="hover:text-red-600 transition-colors">Patients</Link>
      <Link to="/doctor" className="hover:text-red-600 transition-colors">Doctor</Link>
      <Link to="/consent" className="hover:text-red-600 transition-colors">Consent</Link>
    </>
  );

  const moreLinks = (
    <>
      <Link to="/vitals" className="hover:text-red-600 transition-colors">Vitals</Link>
      <Link to="/appointments" className="hover:text-red-600 transition-colors">Appointments</Link>
      <Link to="/family" className="hover:text-red-600 transition-colors">Family</Link>
      <Link to="/emergency" className="hover:text-red-600 transition-colors">Emergency</Link>
      <Link to="/admin" className="hover:text-red-600 transition-colors">Admin</Link>
      <Link to="/admin/doctors" className="hover:text-red-600 transition-colors">Doctor Verification</Link>
      <Link to="/admin/system" className="hover:text-red-600 transition-colors">System Monitoring</Link>
      <Link to="/admin/security" className="hover:text-red-600 transition-colors">Security Center</Link>
      <Link to="/admin/storage" className="hover:text-red-600 transition-colors">Storage Management</Link>
      <Link to="/admin/roles" className="hover:text-red-600 transition-colors">Roles & Permissions</Link>
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
                <Link to="/admin" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 transition-colors">Admin Dashboard</Link>
                <Link to="/admin/doctors" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 transition-colors">Doctor Verification</Link>
                <Link to="/admin/system" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 transition-colors">System Monitoring</Link>
                <Link to="/admin/security" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 transition-colors">Security Center</Link>
                <Link to="/admin/storage" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 transition-colors">Storage Management</Link>
                <Link to="/admin/roles" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 transition-colors">Roles & Permissions</Link>
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
Set-Content -Path "src\Components\Navbar.jsx" -Value $content_9 -NoNewline
Write-Host "Updated src\Components\Navbar.jsx" -ForegroundColor Green

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

  const handleScan = (token) => {
    const patient = getPatientByToken(token);

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
    setPatients(getPatients());
    setAppointments(getAppointments());
    setDoctors(getDoctors());
    setLog(getAuditLog());
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
Set-Content -Path "src\pages\AdminDashboard.jsx" -Value $content_11 -NoNewline
Write-Host "Updated src\pages\AdminDashboard.jsx" -ForegroundColor Green

$content_12 = @'
import React, { useEffect, useState } from "react";
import { UserCog, Plus, X, Check, Ban, Trash2 } from "lucide-react";
import { getDoctors, addDoctor, setDoctorStatus, deleteDoctor } from "../doctorStore";
import { useToast } from "../Components/Toast";

function statusStyle(status) {
  if (status === "Approved") return "bg-green-100 text-green-700";
  if (status === "Rejected") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
}

export default function AdminDoctors() {
  const showToast = useToast();
  const [doctors, setDoctors] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", specialization: "", license: "", experience: "" });
  const [errors, setErrors] = useState({});

  const refresh = () => setDoctors(getDoctors());

  useEffect(() => {
    refresh();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.specialization.trim()) e.specialization = "Specialization is required";
    if (!form.license.trim()) e.license = "Medical license number is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    addDoctor(form);
    setForm({ name: "", specialization: "", license: "", experience: "" });
    setFormOpen(false);
    showToast("Doctor submitted for verification", "success");
    refresh();
  };

  const handleApprove = (id) => {
    setDoctorStatus(id, "Approved");
    showToast("Doctor approved", "success");
    refresh();
  };

  const handleReject = (id) => {
    setDoctorStatus(id, "Rejected");
    showToast("Doctor rejected", "info");
    refresh();
  };

  const handleDelete = (id) => {
    deleteDoctor(id);
    showToast("Doctor removed", "info");
    refresh();
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
              <UserCog size={20} />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Doctor Verification</h1>
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
          >
            <Plus size={18} /> Add Doctor
          </button>
        </div>

        {doctors.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl">
            <UserCog className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium">No doctors submitted for verification yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {doctors.map((d) => (
              <div key={d.id} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Dr. {d.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{d.specialization} · License: {d.license}</p>
                  {d.experience && <p className="text-xs text-gray-400">{d.experience} years experience</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle(d.status)}`}>
                    {d.status}
                  </span>
                  {d.status === "Pending" && (
                    <>
                      <button onClick={() => handleApprove(d.id)} title="Approve" className="p-2 rounded-full hover:bg-green-50 text-green-600">
                        <Check size={16} />
                      </button>
                      <button onClick={() => handleReject(d.id)} title="Reject" className="p-2 rounded-full hover:bg-red-50 text-red-600">
                        <Ban size={16} />
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDelete(d.id)} title="Delete" className="p-2 rounded-full hover:bg-red-50 text-red-600">
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
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Doctor for Verification</h2>
              <button onClick={() => setFormOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl border ${errors.name ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white`}
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Specialization *</label>
                <input
                  type="text"
                  value={form.specialization}
                  onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl border ${errors.specialization ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white`}
                  placeholder="e.g. Cardiologist"
                />
                {errors.specialization && <p className="text-xs text-red-600 mt-1">{errors.specialization}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">License No. *</label>
                  <input
                    type="text"
                    value={form.license}
                    onChange={(e) => setForm((f) => ({ ...f, license: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl border ${errors.license ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white`}
                  />
                  {errors.license && <p className="text-xs text-red-600 mt-1">{errors.license}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Experience (yrs)</label>
                  <input
                    type="number"
                    value={form.experience}
                    onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setFormOpen(false)}
                className="px-5 py-2.5 rounded-full font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-6 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'@
Set-Content -Path "src\pages\AdminDoctors.jsx" -Value $content_12 -NoNewline
Write-Host "Updated src\pages\AdminDoctors.jsx" -ForegroundColor Green

$content_13 = @'
import React, { useState } from "react";
import { Settings as SettingsIcon, Moon, Sun, Trash2 } from "lucide-react";
import { getTheme, toggleTheme } from "../theme";
import { clearAuditLog } from "../auditStore";
import { useToast } from "../Components/Toast";

export default function Settings() {
  const showToast = useToast();
  const [theme, setTheme] = useState(getTheme());

  const handleToggleTheme = () => {
    const next = toggleTheme();
    setTheme(next);
  };

  const handleClearLog = () => {
    clearAuditLog();
    showToast("Audit log cleared", "info");
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
            <SettingsIcon size={20} />
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Settings</h1>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Theme</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark mode</p>
            </div>
            <button
              onClick={handleToggleTheme}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>

          <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Clear Audit Log</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Remove all recorded activity history</p>
            </div>
            <button
              onClick={handleClearLog}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors"
            >
              <Trash2 size={16} /> Clear
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          Note: these settings are stored on this device/browser only. A real
          multi-user settings system (hospital info, email/SMS config,
          password policy) needs a backend server to store shared
          configuration -- that's part of the Phase 2 backend work.
        </p>
      </div>
    </div>
  );
}

'@
Set-Content -Path "src\pages\Settings.jsx" -Value $content_13 -NoNewline
Write-Host "Updated src\pages\Settings.jsx" -ForegroundColor Green

$content_14 = @'
// Central API client.
//
// Every service file in src/services/ goes through this module instead of
// talking to localStorage directly. Today, `request()` just simulates
// network latency and resolves with mock/local data. When the real
// Node/Express backend exists, this is the ONLY file that needs to change --
// swap the body of `request()` for a real fetch() call, and every service
// file above it keeps working unmodified.
//
// TODO (Phase 2 backend): replace the body below with:
//   const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: { Authorization: `Bearer ${token}` } });
//   if (!res.ok) throw new ApiError(res.status, await res.text());
//   return res.json();

const BASE_URL = import.meta.env.VITE_API_BASE_URL || null; // null = no real backend yet

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Simulates network latency so loading states are visible and realistic,
// without needing a real server. Swap this out once BASE_URL points to a
// real API.
export function request(path, { method = "GET", body, mockResolver } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (!BASE_URL) {
          // No backend configured yet -- resolve using the local mock
          // resolver passed in by the calling service function.
          resolve(mockResolver ? mockResolver() : null);
          return;
        }
        // TODO (Phase 2 backend): real fetch() call goes here.
        reject(new ApiError(501, `Real backend not yet connected for ${method} ${path}`));
      } catch (err) {
        reject(err);
      }
    }, 150 + Math.random() * 250); // realistic small latency
  });
}

'@
Set-Content -Path "src\services\apiClient.js" -Value $content_14 -NoNewline
Write-Host "Updated src\services\apiClient.js" -ForegroundColor Green

$content_15 = @'
import { request } from "./apiClient";

// System-level infrastructure metrics (CPU, memory, DB connection, API
// latency) can only be measured by a real running server -- there is no
// way for browser JavaScript to know the CPU/memory usage of a machine it
// isn't running on. Until the Phase 2 backend exists, this returns
// realistic-looking simulated values, clearly flagged with `simulated: true`
// so the UI can (and does) label them honestly instead of presenting them
// as genuine measurements.
//
// TODO (Phase 2 backend): implement a real `/api/system/status` endpoint
// that reads actual OS metrics (e.g. via Node's `os` module or a monitoring
// agent) and returns real numbers here instead.

function mockSystemStatus() {
  return {
    cpuUsagePercent: Math.round(20 + Math.random() * 40),
    memoryUsagePercent: Math.round(30 + Math.random() * 35),
    databaseStatus: "disconnected", // genuinely true -- no DB is connected yet
    apiResponseTimeMs: Math.round(150 + Math.random() * 250), // matches apiClient's simulated latency
    activeUsers: 1, // genuinely accurate for a local single-browser session
    simulated: true,
  };
}

export async function getSystemStatus() {
  return request("/system/status", { mockResolver: mockSystemStatus });
}

'@
Set-Content -Path "src\services\systemService.js" -Value $content_15 -NoNewline
Write-Host "Updated src\services\systemService.js" -ForegroundColor Green

$content_16 = @'
import { request } from "./apiClient";
import { getAuditLog } from "../auditStore";
import { isLoggedIn } from "../auth";

// Some security data IS genuinely available client-side (we use it below).
// Some genuinely is NOT possible without a backend:
//   - Real IP addresses: browsers deliberately don't expose the client's
//     public IP to JavaScript for privacy/security reasons. A real backend
//     would read this from the incoming HTTP request headers.
//   - True "blocked user" enforcement: blocking only means something if a
//     server refuses to authenticate that user -- client-side "blocking"
//     can always be bypassed by clearing localStorage.
//   - Failed login attempts: this app only supports Google Sign-In, which
//     doesn't have a "wrong password" failure mode the way a traditional
//     login does, so this genuinely stays at 0 rather than being faked.
//
// TODO (Phase 2 backend): implement `/api/security/overview` that reads
// real IP addresses (from request headers), real failed-login counts (from
// auth attempts logged server-side), and enforces real session/user blocks.

function mockSecurityOverview() {
  return {
    failedLogins: 0, // genuinely accurate -- Google OAuth has no local failure mode to count
    activeSessions: isLoggedIn() ? 1 : 0, // genuinely accurate for this browser
    blockedUsers: 0, // no real blocking exists without a backend yet
    ipAddressAvailable: false, // browsers never expose this to client JS
    suspiciousActivityEvents: getAuditLog().filter((e) =>
      e.action.toLowerCase().includes("deleted")
    ).length, // a real heuristic from real audit data, not fabricated
    simulated: true,
  };
}

export async function getSecurityOverview() {
  return request("/security/overview", { mockResolver: mockSecurityOverview });
}

'@
Set-Content -Path "src\services\securityService.js" -Value $content_16 -NoNewline
Write-Host "Updated src\services\securityService.js" -ForegroundColor Green

$content_17 = @'
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

export function getStorageOverview() {
  const usedBytes = getRealLocalStorageUsageBytes();
  const patients = getPatients();

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
Set-Content -Path "src\services\storageService.js" -Value $content_17 -NoNewline
Write-Host "Updated src\services\storageService.js" -ForegroundColor Green

$content_18 = @'
// Role & Permission definitions.
//
// IMPORTANT: this is a UI-level permission MATRIX EDITOR only. It does not
// and cannot actually enforce anything -- a permission only means something
// when a server checks it on every API request and rejects unauthorized
// ones. Anyone could open the browser dev tools and bypass any check based
// only on this data. This exists so the admin can design/preview the
// permission structure now, ready to send to a real backend later.
//
// TODO (Phase 2 backend): send this permission matrix to the server, store
// it against each user's role in the database, and check it in Express
// middleware on every protected route -- e.g.
//   requirePermission("patients", "delete")
// BEFORE any real enforcement exists, treat every "permission" in this app
// as a UI preference only, never a security boundary.

const KEY = "healthlock_roles";

const DEFAULT_ROLES = ["Super Admin", "Admin", "Doctor", "Patient", "Moderator", "Receptionist"];
const PERMISSIONS = ["view", "create", "edit", "delete", "export", "approve", "assign"];

function defaultMatrix() {
  const matrix = {};
  DEFAULT_ROLES.forEach((role) => {
    matrix[role] = {};
    PERMISSIONS.forEach((perm) => {
      // Sensible starting defaults -- fully editable afterward.
      matrix[role][perm] = role === "Super Admin";
    });
    if (role === "Admin") {
      matrix[role] = { view: true, create: true, edit: true, delete: true, export: true, approve: true, assign: false };
    }
    if (role === "Doctor") {
      matrix[role] = { view: true, create: true, edit: true, delete: false, export: false, approve: false, assign: false };
    }
    if (role === "Patient") {
      matrix[role] = { view: true, create: true, edit: false, delete: false, export: false, approve: false, assign: false };
    }
  });
  return matrix;
}

export function getPermissionKeys() {
  return PERMISSIONS;
}

export function getRoleNames() {
  return DEFAULT_ROLES;
}

export function getRoleMatrix() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : defaultMatrix();
  } catch {
    return defaultMatrix();
  }
}

export function setPermission(role, permission, value) {
  const matrix = getRoleMatrix();
  if (!matrix[role]) matrix[role] = {};
  matrix[role][permission] = value;
  localStorage.setItem(KEY, JSON.stringify(matrix));
  return matrix;
}

export function resetToDefaults() {
  const matrix = defaultMatrix();
  localStorage.setItem(KEY, JSON.stringify(matrix));
  return matrix;
}

'@
Set-Content -Path "src\services\roleService.js" -Value $content_18 -NoNewline
Write-Host "Updated src\services\roleService.js" -ForegroundColor Green

$content_19 = @'
// Model/type definitions.
//
// NOTE on TypeScript: a full TS migration would mean re-scaffolding this
// entire Vite project (`npm create vite -- --template react-ts`) and
// converting every existing .jsx file -- that's a large, separate, breaking
// change to code that already works today. Instead, these JSDoc @typedef
// blocks give the same IDE autocomplete/type-checking benefit in plain JS,
// and can be converted 1:1 into real TypeScript interfaces later with
// minimal rework if/when the project is migrated.

/**
 * @typedef {Object} Patient
 * @property {string} id
 * @property {string} qrToken
 * @property {string} name
 * @property {number|string} age
 * @property {string} gender
 * @property {string} contact
 * @property {string} bloodGroup
 * @property {string} diagnosis
 * @property {string} medicalHistory
 * @property {string} description
 * @property {PatientFile[]} files
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} PatientFile
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {number} size
 * @property {string} dataUrl
 * @property {string} [description]
 * @property {string} uploadedAt
 */

/**
 * @typedef {Object} Doctor
 * @property {string} id
 * @property {string} name
 * @property {string} specialization
 * @property {string} license
 * @property {number|string} experience
 * @property {"Pending"|"Approved"|"Rejected"} status
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Appointment
 * @property {string} id
 * @property {string} doctorName
 * @property {string} date
 * @property {string} time
 * @property {string} reason
 * @property {"Upcoming"|"Cancelled"|"Completed"} status
 * @property {string} createdAt
 */

/**
 * @typedef {Object} AuditLogEntry
 * @property {string} id
 * @property {string} action
 * @property {string} details
 * @property {string} time
 * @property {string} browser
 */

/**
 * @typedef {Object} SystemStatus
 * @property {number} cpuUsagePercent
 * @property {number} memoryUsagePercent
 * @property {"connected"|"disconnected"} databaseStatus
 * @property {number} apiResponseTimeMs
 * @property {number} activeUsers
 * @property {boolean} simulated - true until a real backend reports this
 */

/**
 * @typedef {Object} SecurityEvent
 * @property {string} id
 * @property {"failed-login"|"blocked-user"|"suspicious-activity"} type
 * @property {string} detail
 * @property {string} time
 */

/**
 * @typedef {"Super Admin"|"Admin"|"Doctor"|"Patient"|"Moderator"|"Receptionist"} RoleName
 */

/**
 * @typedef {"view"|"create"|"edit"|"delete"|"export"|"approve"|"assign"} PermissionKey
 */

/**
 * @typedef {Object} RolePermissions
 * @property {RoleName} role
 * @property {Record<PermissionKey, boolean>} permissions
 */

export {}; // this file only exports types (via JSDoc), no runtime values

'@
Set-Content -Path "src\models\types.js" -Value $content_19 -NoNewline
Write-Host "Updated src\models\types.js" -ForegroundColor Green

$content_20 = @'
import React, { useEffect, useState } from "react";
import { Cpu, MemoryStick, Database, Zap, Users, AlertTriangle } from "lucide-react";
import { getSystemStatus } from "../services/systemService";

function Bar({ percent, colorClass }) {
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
      <div className={`h-2 ${colorClass} transition-all`} style={{ width: `${percent}%` }} />
    </div>
  );
}

export default function AdminSystem() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const data = await getSystemStatus();
    setStatus(data);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000); // refreshes to feel live
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
            <Cpu size={20} />
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">System Monitoring</h1>
        </div>

        {status?.simulated && (
          <div className="flex items-start gap-2 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <p>
              These values are <strong>simulated</strong> for preview purposes. Real CPU/memory/server
              metrics require a running backend server -- there is no way for a browser to measure a
              server's hardware usage. This will connect to real data once the Phase 2 backend exists.
            </p>
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-sm">Loading system status...</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Cpu size={18} className="text-red-600" />
                <p className="font-semibold text-gray-900 dark:text-white">CPU Usage</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">{status.cpuUsagePercent}%</p>
              <Bar percent={status.cpuUsagePercent} colorClass="bg-red-600" />
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <MemoryStick size={18} className="text-gray-900 dark:text-white" />
                <p className="font-semibold text-gray-900 dark:text-white">Memory Usage</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">{status.memoryUsagePercent}%</p>
              <Bar percent={status.memoryUsagePercent} colorClass="bg-gray-900 dark:bg-white" />
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex items-center gap-4">
              <span className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Database size={18} className="text-gray-700 dark:text-gray-300" />
              </span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Database Status</p>
                <p className={`text-sm font-medium ${status.databaseStatus === "connected" ? "text-green-600" : "text-red-600"}`}>
                  {status.databaseStatus === "connected" ? "Connected" : "Not connected (no backend yet)"}
                </p>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex items-center gap-4">
              <span className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Zap size={18} className="text-gray-700 dark:text-gray-300" />
              </span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">API Response Time</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{status.apiResponseTimeMs} ms</p>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex items-center gap-4 sm:col-span-2">
              <span className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Users size={18} className="text-gray-700 dark:text-gray-300" />
              </span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Active Users</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {status.activeUsers} (this browser session -- real count needs a backend with shared sessions)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'@
Set-Content -Path "src\pages\AdminSystem.jsx" -Value $content_20 -NoNewline
Write-Host "Updated src\pages\AdminSystem.jsx" -ForegroundColor Green

$content_21 = @'
import React, { useEffect, useState } from "react";
import { ShieldAlert, LogIn, Ban, Activity, AlertTriangle, Info } from "lucide-react";
import { getSecurityOverview } from "../services/securityService";
import { clearUser } from "../auth";
import { useToast } from "../Components/Toast";
import { useNavigate } from "react-router-dom";

export default function AdminSecurity() {
  const showToast = useToast();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    getSecurityOverview().then(setOverview);
  }, []);

  const handleForceLogout = () => {
    clearUser();
    showToast("This session has been logged out", "info");
    navigate("/");
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
            <ShieldAlert size={20} />
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Security Center</h1>
        </div>

        <div className="flex items-start gap-2 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <p>
            Real IP address tracking and true user-blocking require a backend server -- browsers never
            expose a visitor's IP to JavaScript, and "blocking" only works if a server actually refuses
            requests. What's shown below is honestly labeled: real numbers where this browser can
            actually know them, and clearly marked where a backend is required.
          </p>
        </div>

        {!overview ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5 mb-10">
            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <LogIn size={18} className="text-red-600" />
                <p className="font-semibold text-gray-900 dark:text-white">Failed Logins</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{overview.failedLogins}</p>
              <p className="text-xs text-gray-400 mt-1">Real count -- Google Sign-In has no local failure to track here.</p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={18} className="text-green-600" />
                <p className="font-semibold text-gray-900 dark:text-white">Active Sessions</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{overview.activeSessions}</p>
              <p className="text-xs text-gray-400 mt-1">Real -- this browser's current session only.</p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Ban size={18} className="text-gray-500" />
                <p className="font-semibold text-gray-900 dark:text-white">Blocked Users</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{overview.blockedUsers}</p>
              <p className="text-xs text-gray-400 mt-1">Requires a backend to enforce real blocking.</p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert size={18} className="text-yellow-600" />
                <p className="font-semibold text-gray-900 dark:text-white">Suspicious Activity</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{overview.suspiciousActivityEvents}</p>
              <p className="text-xs text-gray-400 mt-1">Real -- counted from your actual audit log (deletions).</p>
            </div>
          </div>
        )}

        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-gray-500" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Force Logout This Session</p>
              <p className="text-xs text-gray-400">Signs out the current browser session immediately.</p>
            </div>
          </div>
          <button
            onClick={handleForceLogout}
            className="px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Force Logout
          </button>
        </div>
      </div>
    </div>
  );
}

'@
Set-Content -Path "src\pages\AdminSecurity.jsx" -Value $content_21 -NoNewline
Write-Host "Updated src\pages\AdminSecurity.jsx" -ForegroundColor Green

$content_22 = @'
import React, { useEffect, useState } from "react";
import { HardDrive, FileText, AlertTriangle } from "lucide-react";
import { getStorageOverview, formatBytes } from "../services/storageService";

export default function AdminStorage() {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    setOverview(getStorageOverview());
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
Set-Content -Path "src\pages\AdminStorage.jsx" -Value $content_22 -NoNewline
Write-Host "Updated src\pages\AdminStorage.jsx" -ForegroundColor Green

$content_23 = @'
import React, { useEffect, useState } from "react";
import { KeyRound, AlertTriangle, RotateCcw } from "lucide-react";
import { getRoleNames, getPermissionKeys, getRoleMatrix, setPermission, resetToDefaults } from "../services/roleService";
import { useToast } from "../Components/Toast";

export default function AdminRoles() {
  const showToast = useToast();
  const roles = getRoleNames();
  const permissions = getPermissionKeys();
  const [matrix, setMatrix] = useState(null);

  useEffect(() => {
    setMatrix(getRoleMatrix());
  }, []);

  const handleToggle = (role, perm) => {
    const current = matrix[role]?.[perm] || false;
    const updated = setPermission(role, perm, !current);
    setMatrix({ ...updated });
  };

  const handleReset = () => {
    const updated = resetToDefaults();
    setMatrix({ ...updated });
    showToast("Reset to default permissions", "info");
  };

  if (!matrix) return null;

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
              <KeyRound size={20} />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Roles & Permissions</h1>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw size={14} /> Reset to defaults
          </button>
        </div>

        <div className="flex items-start gap-2 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <p>
            This is a <strong>permission editor UI only</strong>, not real security. A permission only
            actually protects anything when a backend server checks it on every request. Use this to
            design the permission structure now -- it's ready to send to the Phase 2 backend, which will
            enforce it for real.
          </p>
        </div>

        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-2xl">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 text-left text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wide">
                <th className="px-4 py-3">Role</th>
                {permissions.map((p) => (
                  <th key={p} className="px-4 py-3 text-center capitalize">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{role}</td>
                  {permissions.map((perm) => (
                    <td key={perm} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!matrix[role]?.[perm]}
                        onChange={() => handleToggle(role, perm)}
                        className="w-4 h-4 accent-red-600 cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'@
Set-Content -Path "src\pages\AdminRoles.jsx" -Value $content_23 -NoNewline
Write-Host "Updated src\pages\AdminRoles.jsx" -ForegroundColor Green

Write-Host "Installing packages (recharts, etc.)..." -ForegroundColor Cyan
npm install
Write-Host "Done! Now run: npm run dev" -ForegroundColor Cyan