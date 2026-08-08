# Real backend: Express + MongoDB Atlas + real Google token verification
# + real JWT sessions + real server-enforced role-based access control (403s)

Write-Host "Setting up the real backend + frontend integration..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "src\Components" | Out-Null
New-Item -ItemType Directory -Force -Path "src\pages" | Out-Null
New-Item -ItemType Directory -Force -Path "server\models" | Out-Null
New-Item -ItemType Directory -Force -Path "server\middleware" | Out-Null
New-Item -ItemType Directory -Force -Path "server\routes" | Out-Null

$content_0 = @'
VITE_GOOGLE_CLIENT_ID=506047558704-q5cua06g2hp2787sbg54gc3cm095ev5r.apps.googleusercontent.com
VITE_API_URL=http://localhost:5000

'@
Set-Content -Path ".env" -Value $content_0 -NoNewline
Write-Host "Updated .env" -ForegroundColor Green

$content_1 = @'
// Real backend auth helper.
//
// The frontend sends the Google credential to our own backend, which
// verifies it with Google, looks up (or creates) the user in the real
// database, and returns OUR OWN session token + the user's REAL role from
// the database. That token is then attached to every future API call so
// the backend can enforce permissions for real.

const USER_KEY = "healthlock_user";
const TOKEN_KEY = "healthlock_token";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Sends the raw Google ID token to the backend for real verification.
// Throws if the backend rejects it (e.g. suspended account, invalid token).
export async function loginWithGoogle(googleCredential) {
  const res = await fetch(`${API_BASE}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential: googleCredential }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

export function hasRole(...roles) {
  const user = getUser();
  return !!user && roles.includes(user.role);
}

// Helper for calling protected backend routes -- automatically attaches
// the real session token so the server can enforce role checks.
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

'@
Set-Content -Path "src\auth.js" -Value $content_1 -NoNewline
Write-Host "Updated src\auth.js" -ForegroundColor Green

$content_2 = @'
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
      <Link to="/patients" className="hover:text-red-600 transition-colors">Patients</Link>
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
Set-Content -Path "src\Components\Navbar.jsx" -Value $content_2 -NoNewline
Write-Host "Updated src\Components\Navbar.jsx" -ForegroundColor Green

$content_3 = @'
import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn, hasRole } from "../auth";
import { ShieldAlert } from "lucide-react";

// Wrap any route that should only be visible to signed-in users.
// If nobody is logged in, redirect them to /login instead.
//
// Optional `roles` prop restricts the route further -- e.g.
// <ProtectedRoute roles={["Admin"]}>. This is a client-side UX layer only;
// the REAL enforcement happens on the backend (server/middleware/auth.js),
// which returns a genuine 403 if someone tries to call a protected API
// directly without the right role, regardless of what this component does.
export default function ProtectedRoute({ children, roles }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRole(...roles)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <ShieldAlert size={48} className="text-red-600 mb-4" />
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">403 — Forbidden</h1>
        <p className="text-gray-500 max-w-sm">
          Your account role doesn't have permission to view this page.
        </p>
      </div>
    );
  }

  return children;
}

'@
Set-Content -Path "src\Components\ProtectedRoute.jsx" -Value $content_3 -NoNewline
Write-Host "Updated src\Components\ProtectedRoute.jsx" -ForegroundColor Green

$content_4 = @'
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Logo from "../Components/Logo";
import { loginWithGoogle } from "../auth";

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      // Sends the Google credential to our real backend, which verifies it
      // with Google and returns the user's real role from the database.
      await loginWithGoogle(credentialResponse.credential);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setError(
        err.message.includes("fetch")
          ? "Could not reach the server. Make sure the backend is running (npm run dev inside the server folder)."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-10 shadow-lg">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">
          Sign in to your account
        </h2>
        <p className="text-gray-500 text-sm text-center mb-8">
          Only Google accounts can access HealthLock.
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
            {error}
          </p>
        )}

        <div className="flex justify-center">
          {loading ? (
            <p className="text-sm text-gray-500">Signing you in...</p>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Sign-In failed. Please try again.")}
              theme="outline"
              shape="pill"
              size="large"
              width="280"
            />
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          By continuing, you agree to HealthLock's terms and privacy policy.
        </p>
      </div>
    </div>
  );
}

export default Login;

'@
Set-Content -Path "src\pages\Login.jsx" -Value $content_4 -NoNewline
Write-Host "Updated src\pages\Login.jsx" -ForegroundColor Green

$content_5 = @'
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Logo from "../Components/Logo";
import { loginWithGoogle } from "../auth";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate("/dashboard");
    } catch (err) {
      console.error("Sign-up failed:", err);
      setError(
        err.message.includes("fetch")
          ? "Could not reach the server. Make sure the backend is running (npm run dev inside the server folder)."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-10 shadow-lg">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">
          Create your account
        </h2>
        <p className="text-gray-500 text-sm text-center mb-8">
          Sign up instantly using your Google account — no password needed.
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
            {error}
          </p>
        )}

        <div className="flex justify-center">
          {loading ? (
            <p className="text-sm text-gray-500">Creating your account...</p>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Sign-Up failed. Please try again.")}
              theme="filled_blue"
              shape="pill"
              size="large"
              width="280"
              text="signup_with"
            />
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-red-600 font-semibold hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;

'@
Set-Content -Path "src\pages\Register.jsx" -Value $content_5 -NoNewline
Write-Host "Updated src\pages\Register.jsx" -ForegroundColor Green

$content_6 = @'
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
Set-Content -Path "src\App.jsx" -Value $content_6 -NoNewline
Write-Host "Updated src\App.jsx" -ForegroundColor Green

$content_7 = @'
{
  "name": "healthlock-server",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "node server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "google-auth-library": "^9.11.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.5.1"
  }
}

'@
Set-Content -Path "server\package.json" -Value $content_7 -NoNewline
Write-Host "Updated server\package.json" -ForegroundColor Green

$content_8 = @'
# Real secrets go here. This file is gitignored -- never commit it.

MONGODB_URI=mongodb+srv://HealthLock:viC9aHZrrQheB3Wm@healthlock-db.h74bkky.mongodb.net/healthlock?appName=HealthLock-DB
GOOGLE_CLIENT_ID=506047558704-q5cua06g2hp2787sbg54gc3cm095ev5r.apps.googleusercontent.com
JWT_SECRET=changeme-to-a-long-random-string-before-real-use
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

'@
Set-Content -Path "server\.env" -Value $content_8 -NoNewline
Write-Host "Updated server\.env" -ForegroundColor Green

$content_9 = @'
node_modules
.env
*.log

'@
Set-Content -Path "server\.gitignore" -Value $content_9 -NoNewline
Write-Host "Updated server\.gitignore" -ForegroundColor Green

$content_10 = @'
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import doctorRoutes from "./routes/doctor.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

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
Set-Content -Path "server\server.js" -Value $content_10 -NoNewline
Write-Host "Updated server\server.js" -ForegroundColor Green

$content_11 = @'
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    picture: { type: String },
    role: {
      type: String,
      enum: ["Patient", "Doctor", "Admin"],
      default: "Patient", // new sign-ups start as Patient; an Admin promotes them later
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    lastLogin: { type: Date },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

export default mongoose.model("User", userSchema);

'@
Set-Content -Path "server\models\User.js" -Value $content_11 -NoNewline
Write-Host "Updated server\models\User.js" -ForegroundColor Green

$content_12 = @'
import jwt from "jsonwebtoken";

// This is the REAL enforcement point. Every protected route runs this
// first. If the token is missing, invalid, or expired, the request is
// rejected here -- before any route logic runs, and before any data is
// touched. This cannot be bypassed by editing frontend code, because it
// runs on the server, not in the browser.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Role guard -- use AFTER requireAuth. Genuinely returns 403 Forbidden if
// the authenticated user's role isn't in the allowed list.
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden -- insufficient role" });
    }
    next();
  };
}

'@
Set-Content -Path "server\middleware\auth.js" -Value $content_12 -NoNewline
Write-Host "Updated server\middleware\auth.js" -ForegroundColor Green

$content_13 = @'
import express from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google
// The frontend sends the raw Google ID token it got from the Google Sign-In
// button. We verify it directly with Google's servers here -- this is the
// real check that the token genuinely came from Google and wasn't forged.
router.post("/google", async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: "Missing Google credential" });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload.email_verified) {
      return res.status(401).json({ error: "Google email not verified" });
    }

    // Find or create the user in the real database.
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        role: "Patient", // default role for new sign-ups
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ error: "This account has been suspended" });
    }

    user.lastLogin = new Date();
    await user.save();

    // Issue OUR OWN token -- this is what the frontend will send on every
    // future request. It encodes the user's real role from the database.
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Google auth error:", err.message);
    res.status(401).json({ error: "Invalid Google token" });
  }
});

// GET /api/auth/me - lets the frontend re-check who's logged in using the
// token it already has, without asking Google again.
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-__v");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

export default router;

'@
Set-Content -Path "server\routes\auth.js" -Value $content_13 -NoNewline
Write-Host "Updated server\routes\auth.js" -ForegroundColor Green

$content_14 = @'
import express from "express";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Every route below requires a valid token (requireAuth) AND the Admin role
// (requireRole("Admin")). A Patient or Doctor token gets a real 403 here --
// try it: call this with a Patient's token and you'll get rejected before
// any user data is touched.

// GET /api/admin/users - list every user (Admin only)
router.get("/users", requireAuth, requireRole("Admin"), async (req, res) => {
  const users = await User.find().select("-__v").sort({ createdAt: -1 });
  res.json({ users });
});

// PATCH /api/admin/users/:id/role - change a user's role (Admin only)
router.patch("/users/:id/role", requireAuth, requireRole("Admin"), async (req, res) => {
  const { role } = req.body;
  if (!["Patient", "Doctor", "Admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

// PATCH /api/admin/users/:id/status - suspend/activate a user (Admin only)
router.patch("/users/:id/status", requireAuth, requireRole("Admin"), async (req, res) => {
  const { status } = req.body;
  if (!["active", "suspended"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

// DELETE /api/admin/users/:id - delete a user (Admin only)
router.delete("/users/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ success: true });
});

// GET /api/admin/stats - real counts from the real database (Admin only)
router.get("/stats", requireAuth, requireRole("Admin"), async (req, res) => {
  const [totalUsers, totalPatients, totalDoctors, totalAdmins] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "Patient" }),
    User.countDocuments({ role: "Doctor" }),
    User.countDocuments({ role: "Admin" }),
  ]);
  res.json({ totalUsers, totalPatients, totalDoctors, totalAdmins });
});

export default router;

'@
Set-Content -Path "server\routes\admin.js" -Value $content_14 -NoNewline
Write-Host "Updated server\routes\admin.js" -ForegroundColor Green

$content_15 = @'
import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Example: only Doctors (or Admins, who can access everything) can reach
// this. A Patient token gets a real 403 here.
router.get("/ping", requireAuth, requireRole("Doctor", "Admin"), (req, res) => {
  res.json({ message: `Hello Dr. ${req.user.email}, this route is doctor-protected.` });
});

export default router;

'@
Set-Content -Path "server\routes\doctor.js" -Value $content_15 -NoNewline
Write-Host "Updated server\routes\doctor.js" -ForegroundColor Green

Write-Host "Installing frontend packages..." -ForegroundColor Cyan
npm install
Write-Host "Installing backend packages..." -ForegroundColor Cyan
Push-Location server
npm install
Pop-Location
Write-Host "" 
Write-Host "DONE. Now open TWO terminals:" -ForegroundColor Cyan
Write-Host "  Terminal 1 (backend):  cd server; npm run dev" -ForegroundColor Yellow
Write-Host "  Terminal 2 (frontend): npm run dev" -ForegroundColor Yellow