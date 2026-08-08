# New features: Health Vitals, Appointments, Family Management, Emergency SOS

Write-Host "Applying new features..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "src\Components" | Out-Null
New-Item -ItemType Directory -Force -Path "src\pages" | Out-Null

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
Set-Content -Path "src\App.jsx" -Value $content_1 -NoNewline
Write-Host "Updated src\App.jsx" -ForegroundColor Green

$content_2 = @'
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
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" onClick={() => setMenuOpen(false)}>
          <Logo size="text-lg md:text-2xl" />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-7 text-gray-700 font-medium">
          {primaryLinks}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((o) => !o)}
              className="flex items-center gap-1 hover:text-red-600 transition-colors"
            >
              More <ChevronDown size={16} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-2 flex flex-col min-w-[160px]">
                <Link to="/vitals" className="px-4 py-2 hover:bg-gray-50 hover:text-red-600 transition-colors">Vitals</Link>
                <Link to="/appointments" className="px-4 py-2 hover:bg-gray-50 hover:text-red-600 transition-colors">Appointments</Link>
                <Link to="/family" className="px-4 py-2 hover:bg-gray-50 hover:text-red-600 transition-colors">Family</Link>
                <Link to="/emergency" className="px-4 py-2 hover:bg-gray-50 hover:text-red-600 transition-colors">Emergency</Link>
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
Set-Content -Path "src\Components\Navbar.jsx" -Value $content_2 -NoNewline
Write-Host "Updated src\Components\Navbar.jsx" -ForegroundColor Green

$content_3 = @'
const KEY = "healthlock_vitals";

const VITAL_TYPES = [
  { id: "bp", label: "Blood Pressure", unit: "mmHg" },
  { id: "sugar", label: "Blood Sugar", unit: "mg/dL" },
  { id: "weight", label: "Weight", unit: "kg" },
  { id: "bmi", label: "BMI", unit: "" },
  { id: "heartRate", label: "Heart Rate", unit: "bpm" },
  { id: "oxygen", label: "Oxygen Level", unit: "%" },
];

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

export function getVitalTypes() {
  return VITAL_TYPES;
}

export function getEntries() {
  return readAll().sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function getEntriesByType(typeId) {
  return getEntries().filter((e) => e.type === typeId);
}

export function addEntry({ type, value, date }) {
  const list = readAll();
  const entry = { id: uid(), type, value: Number(value), date };
  list.push(entry);
  writeAll(list);
  return entry;
}

export function deleteEntry(id) {
  writeAll(readAll().filter((e) => e.id !== id));
}

'@
Set-Content -Path "src\vitalsStore.js" -Value $content_3 -NoNewline
Write-Host "Updated src\vitalsStore.js" -ForegroundColor Green

$content_4 = @'
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
  return appt;
}

export function updateAppointment(id, updates) {
  const list = readAll();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates };
  writeAll(list);
  return list[idx];
}

export function cancelAppointment(id) {
  return updateAppointment(id, { status: "Cancelled" });
}

export function deleteAppointment(id) {
  writeAll(readAll().filter((a) => a.id !== id));
}

'@
Set-Content -Path "src\appointmentStore.js" -Value $content_4 -NoNewline
Write-Host "Updated src\appointmentStore.js" -ForegroundColor Green

$content_5 = @'
const KEY = "healthlock_family";

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

export function getFamilyMembers() {
  return readAll();
}

export function addFamilyMember(data) {
  const list = readAll();
  const member = { id: uid(), ...data };
  list.push(member);
  writeAll(list);
  return member;
}

export function deleteFamilyMember(id) {
  writeAll(readAll().filter((m) => m.id !== id));
}

'@
Set-Content -Path "src\familyStore.js" -Value $content_5 -NoNewline
Write-Host "Updated src\familyStore.js" -ForegroundColor Green

$content_6 = @'
import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, Trash2, Activity } from "lucide-react";
import { getVitalTypes, getEntries, addEntry, deleteEntry } from "../vitalsStore";
import { useToast } from "../Components/Toast";

export default function Vitals() {
  const showToast = useToast();
  const vitalTypes = getVitalTypes();
  const [entries, setEntries] = useState([]);
  const [selectedType, setSelectedType] = useState(vitalTypes[0].id);
  const [form, setForm] = useState({ value: "", date: new Date().toISOString().slice(0, 10) });
  const [errors, setErrors] = useState({});

  const refresh = () => setEntries(getEntries());

  useEffect(() => {
    refresh();
  }, []);

  const chartData = useMemo(() => {
    return entries
      .filter((e) => e.type === selectedType)
      .map((e) => ({ date: e.date, value: e.value, id: e.id }));
  }, [entries, selectedType]);

  const selectedTypeInfo = vitalTypes.find((t) => t.id === selectedType);

  const handleAdd = () => {
    const errs = {};
    if (!form.value || isNaN(form.value)) errs.value = "Enter a valid number";
    if (!form.date) errs.date = "Pick a date";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    addEntry({ type: selectedType, value: form.value, date: form.date });
    setForm({ value: "", date: new Date().toISOString().slice(0, 10) });
    showToast(`${selectedTypeInfo.label} entry added`, "success");
    refresh();
  };

  const handleDelete = (id) => {
    deleteEntry(id);
    showToast("Entry removed", "info");
    refresh();
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
            <Activity size={20} />
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Health Vitals</h1>
        </div>

        {/* Type tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {vitalTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedType === t.id
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Add entry form */}
        <div className="border border-gray-200 rounded-2xl p-5 mb-8">
          <p className="font-semibold text-gray-900 mb-3">
            Add {selectedTypeInfo.label} entry {selectedTypeInfo.unit && `(${selectedTypeInfo.unit})`}
          </p>
          <div className="flex flex-wrap gap-3 items-start">
            <div>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder="Value"
                className={`px-3 py-2 rounded-xl border ${errors.value ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500 w-32`}
              />
              {errors.value && <p className="text-xs text-red-600 mt-1">{errors.value}</p>}
            </div>
            <div>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={`px-3 py-2 rounded-xl border ${errors.date ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
            </div>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="border border-gray-200 rounded-2xl p-5 mb-8">
          {chartData.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">
              No {selectedTypeInfo.label} entries yet — add one above.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Entry list */}
        {chartData.length > 0 && (
          <div className="border border-gray-200 rounded-2xl divide-y divide-gray-100">
            {chartData.slice().reverse().map((e) => (
              <div key={e.id} className="flex justify-between items-center px-5 py-3">
                <span className="text-sm text-gray-700">{e.date}</span>
                <span className="font-semibold text-gray-900">{e.value} {selectedTypeInfo.unit}</span>
                <button onClick={() => handleDelete(e.id)} className="text-gray-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'@
Set-Content -Path "src\pages\Vitals.jsx" -Value $content_6 -NoNewline
Write-Host "Updated src\pages\Vitals.jsx" -ForegroundColor Green

$content_7 = @'
import React, { useEffect, useState } from "react";
import { CalendarDays, Plus, X, Trash2 } from "lucide-react";
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
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ doctorName: "", date: "", time: TIME_SLOTS[0], reason: "" });
  const [errors, setErrors] = useState({});

  const refresh = () => setAppointments(getAppointments());

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

  const handleBook = () => {
    if (!validate()) return;
    addAppointment(form);
    setForm({ doctorName: "", date: "", time: TIME_SLOTS[0], reason: "" });
    setFormOpen(false);
    showToast("Appointment booked successfully", "success");
    refresh();
  };

  const handleCancel = (id) => {
    cancelAppointment(id);
    showToast("Appointment cancelled", "info");
    refresh();
  };

  const handleDelete = (id) => {
    deleteAppointment(id);
    showToast("Appointment removed", "info");
    refresh();
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

        {appointments.length === 0 ? (
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
Set-Content -Path "src\pages\Appointments.jsx" -Value $content_7 -NoNewline
Write-Host "Updated src\pages\Appointments.jsx" -ForegroundColor Green

$content_8 = @'
import React, { useEffect, useState } from "react";
import { Users2, Plus, X, Trash2, User } from "lucide-react";
import { getFamilyMembers, addFamilyMember, deleteFamilyMember } from "../familyStore";
import { useToast } from "../Components/Toast";

const RELATIONS = ["Spouse", "Child", "Parent", "Sibling", "Grandparent", "Other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Family() {
  const showToast = useToast();
  const [members, setMembers] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", relation: "", age: "", gender: "", bloodGroup: "" });
  const [errors, setErrors] = useState({});

  const refresh = () => setMembers(getFamilyMembers());

  useEffect(() => {
    refresh();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.relation) e.relation = "Select a relation";
    if (!form.age || isNaN(form.age) || form.age < 0 || form.age > 120) e.age = "Enter a valid age";
    if (!form.gender) e.gender = "Select a gender";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    addFamilyMember(form);
    setForm({ name: "", relation: "", age: "", gender: "", bloodGroup: "" });
    setFormOpen(false);
    showToast("Family member added", "success");
    refresh();
  };

  const handleDelete = (id) => {
    deleteFamilyMember(id);
    showToast("Family member removed", "info");
    refresh();
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
              <Users2 size={20} />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Family Management</h1>
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
          >
            <Plus size={18} /> Add Family Member
          </button>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded-3xl">
            <Users2 className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium">No family members added yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {members.map((m) => (
              <div key={m.id} className="border border-gray-200 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <User size={18} />
                  </span>
                  <button onClick={() => handleDelete(m.id)} className="text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="font-bold text-gray-900">{m.name}</p>
                <p className="text-xs text-red-600 font-semibold mb-2">{m.relation}</p>
                <p className="text-sm text-gray-600">{m.age} yrs · {m.gender}</p>
                {m.bloodGroup && <p className="text-sm text-gray-600">Blood group: {m.bloodGroup}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Add Family Member</h2>
              <button onClick={() => setFormOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl border ${errors.name ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Relation *</label>
                  <select
                    value={form.relation}
                    onChange={(e) => setForm((f) => ({ ...f, relation: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl border ${errors.relation ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500 bg-white`}
                  >
                    <option value="">Select</option>
                    {RELATIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {errors.relation && <p className="text-xs text-red-600 mt-1">{errors.relation}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Age *</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl border ${errors.age ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                  />
                  {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Gender *</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl border ${errors.gender ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500 bg-white`}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-xs text-red-600 mt-1">{errors.gender}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Group</label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm((f) => ({ ...f, bloodGroup: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
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
                onClick={handleAdd}
                className="px-6 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'@
Set-Content -Path "src\pages\Family.jsx" -Value $content_8 -NoNewline
Write-Host "Updated src\pages\Family.jsx" -ForegroundColor Green

$content_9 = @'
import React, { useEffect, useRef, useState } from "react";
import { Siren, Download, MapPin, Plus, Trash2, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "../Components/Toast";

const KEY = "healthlock_emergency";

function readData() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw
      ? JSON.parse(raw)
      : { bloodGroup: "", allergies: "", contacts: [] };
  } catch {
    return { bloodGroup: "", allergies: "", contacts: [] };
  }
}

function writeData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export default function Emergency() {
  const showToast = useToast();
  const qrRef = useRef(null);
  const [data, setData] = useState(readData());
  const [contactForm, setContactForm] = useState({ name: "", phone: "" });
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [locationLink, setLocationLink] = useState(null);

  useEffect(() => {
    writeData(data);
  }, [data]);

  const qrValue = JSON.stringify({
    bloodGroup: data.bloodGroup,
    allergies: data.allergies,
    contacts: data.contacts,
  });

  const handleDownloadQr = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "emergency-qr-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleAddContact = () => {
    if (!contactForm.name.trim() || !/^\d{10}$/.test(contactForm.phone.trim())) {
      showToast("Enter a name and valid 10-digit phone number", "error");
      return;
    }
    setData((d) => ({ ...d, contacts: [...d.contacts, contactForm] }));
    setContactForm({ name: "", phone: "" });
    setContactModalOpen(false);
    showToast("Emergency contact added", "success");
  };

  const handleRemoveContact = (idx) => {
    setData((d) => ({ ...d, contacts: d.contacts.filter((_, i) => i !== idx) }));
  };

  const handleFindHospitals = () => {
    if (!navigator.geolocation) {
      showToast("Location is not supported in this browser", "error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const url = `https://www.google.com/maps/search/hospitals/@${latitude},${longitude},14z`;
        setLocationLink(url);
        window.open(url, "_blank", "noopener,noreferrer");
      },
      () => {
        showToast("Could not access your location. Please allow location permission.", "error");
      }
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
            <Siren size={20} />
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Emergency</h1>
        </div>

        {/* SOS button + nearby hospitals */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <button
            onClick={handleFindHospitals}
            className="flex flex-col items-center justify-center gap-2 py-8 rounded-3xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg shadow-lg transition-colors"
          >
            <Siren size={32} />
            SOS — Find Nearby Hospitals
          </button>
          <div className="border border-gray-200 rounded-3xl p-6 flex flex-col justify-center">
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <MapPin size={16} /> Uses your device location to open nearby hospitals in Google Maps.
            </p>
          </div>
        </div>

        {/* Blood group + allergies */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Group</label>
            <select
              value={data.bloodGroup}
              onChange={(e) => setData((d) => ({ ...d, bloodGroup: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="">Select</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Allergies</label>
            <input
              type="text"
              value={data.allergies}
              onChange={(e) => setData((d) => ({ ...d, allergies: e.target.value }))}
              placeholder="e.g. Penicillin, Peanuts"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Emergency contacts */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-900">Emergency Contacts</p>
            <button
              onClick={() => setContactModalOpen(true)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline"
            >
              <Plus size={14} /> Add
            </button>
          </div>
          {data.contacts.length === 0 ? (
            <p className="text-sm text-gray-400">No emergency contacts added yet.</p>
          ) : (
            <ul className="space-y-2">
              {data.contacts.map((c, i) => (
                <li key={i} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <span className="text-sm text-gray-800">{c.name} — {c.phone}</span>
                  <button onClick={() => handleRemoveContact(i)} className="text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Emergency QR card */}
        <div className="border border-gray-200 rounded-3xl p-8 flex flex-col items-center text-center">
          <p className="font-semibold text-gray-900 mb-4">Emergency QR Card</p>
          <div ref={qrRef} className="bg-white p-3 rounded-xl border border-gray-200">
            <QRCodeCanvas value={qrValue} size={160} />
          </div>
          <p className="text-xs text-gray-400 mt-3 max-w-xs">
            Contains your blood group, allergies, and emergency contacts — scan to share with first responders.
          </p>
          <button
            onClick={handleDownloadQr}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
          >
            <Download size={14} /> Download / Print QR Card
          </button>
        </div>
      </div>

      {contactModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Add Emergency Contact</h2>
              <button onClick={() => setContactModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Contact name"
                value={contactForm.name}
                onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="tel"
                placeholder="10-digit phone number"
                value={contactForm.phone}
                onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setContactModalOpen(false)}
                className="px-5 py-2.5 rounded-full font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContact}
                className="px-6 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'@
Set-Content -Path "src\pages\Emergency.jsx" -Value $content_9 -NoNewline
Write-Host "Updated src\pages\Emergency.jsx" -ForegroundColor Green

Write-Host "Installing recharts package..." -ForegroundColor Cyan
npm install
Write-Host "Done! Now run: npm run dev" -ForegroundColor Cyan