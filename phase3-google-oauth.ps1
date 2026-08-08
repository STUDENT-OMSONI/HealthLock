# Phase 3: Google OAuth login
# Run this from inside your project folder in PowerShell

Write-Host "Applying Google OAuth changes..." -ForegroundColor Cyan
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
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local
.env
.env.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

'@
Set-Content -Path ".gitignore" -Value $content_1 -NoNewline
Write-Host "Updated .gitignore" -ForegroundColor Green

$content_2 = @'
VITE_GOOGLE_CLIENT_ID=506047558704-q5cua06g2hp2787sbg54gc3cm095ev5r.apps.googleusercontent.com

'@
Set-Content -Path ".env" -Value $content_2 -NoNewline
Write-Host "Updated .env" -ForegroundColor Green

$content_3 = @'
import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import "./index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

'@
Set-Content -Path "src\main.jsx" -Value $content_3 -NoNewline
Write-Host "Updated src\main.jsx" -ForegroundColor Green

$content_4 = @'
// Simple client-side auth helper.
// Stores the decoded Google profile after a successful sign-in.
// NOTE: for a real production app, the ID token should also be verified
// on a backend server (Phase 2/3) — this is fine for the current MVP stage.

const USER_KEY = "healthlock_user";

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn() {
  return !!getUser();
}

'@
Set-Content -Path "src\auth.js" -Value $content_4 -NoNewline
Write-Host "Updated src\auth.js" -ForegroundColor Green

$content_5 = @'
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import ConsentManagement from "./pages/ConsentManagement";
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
Set-Content -Path "src\App.jsx" -Value $content_5 -NoNewline
Write-Host "Updated src\App.jsx" -ForegroundColor Green

$content_6 = @'
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { getUser, clearUser } from "../auth";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getUser());

  // Re-check login state whenever the route changes (e.g. right after login)
  useEffect(() => {
    setUser(getUser());
  }, [location]);

  const handleLogout = () => {
    clearUser();
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        <Link to="/">
          <Logo />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          <Link to="/dashboard" className="hover:text-red-600 transition-colors">Dashboard</Link>
          <Link to="/doctor" className="hover:text-red-600 transition-colors">Doctor</Link>
          <Link to="/consent" className="hover:text-red-600 transition-colors">Consent</Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                {user.picture && (
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                )}
                <span className="text-sm font-semibold text-gray-800">{user.name}</span>
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
                className="hidden sm:inline-flex px-5 py-2.5 rounded-full font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors"
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
      </div>
    </nav>
  );
}

export default Navbar;

'@
Set-Content -Path "src\Components\Navbar.jsx" -Value $content_6 -NoNewline
Write-Host "Updated src\Components\Navbar.jsx" -ForegroundColor Green

$content_7 = @'
import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../auth";

// Wrap any route that should only be visible to signed-in users.
// If nobody is logged in, redirect them to /login instead.
export default function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

'@
Set-Content -Path "src\Components\ProtectedRoute.jsx" -Value $content_7 -NoNewline
Write-Host "Updated src\Components\ProtectedRoute.jsx" -ForegroundColor Green

$content_8 = @'
import React from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import Logo from "../Components/Logo";
import { saveUser } from "../auth";

function Login() {
  const navigate = useNavigate();

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      // decoded contains: email, name, picture, email_verified, etc.
      if (!decoded.email_verified) {
        alert("This Google account's email is not verified.");
        return;
      }
      saveUser({
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Google login failed:", err);
      alert("Login failed. Please try again.");
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

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Google Sign-In failed. Please try again.")}
            theme="outline"
            shape="pill"
            size="large"
            width="280"
          />
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
Set-Content -Path "src\pages\Login.jsx" -Value $content_8 -NoNewline
Write-Host "Updated src\pages\Login.jsx" -ForegroundColor Green

$content_9 = @'
import React from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import Logo from "../Components/Logo";
import { saveUser } from "../auth";

function Register() {
  const navigate = useNavigate();

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      if (!decoded.email_verified) {
        alert("This Google account's email is not verified.");
        return;
      }
      saveUser({
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Google sign-up failed:", err);
      alert("Sign-up failed. Please try again.");
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

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Google Sign-Up failed. Please try again.")}
            theme="filled_blue"
            shape="pill"
            size="large"
            width="280"
            text="signup_with"
          />
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
Set-Content -Path "src\pages\Register.jsx" -Value $content_9 -NoNewline
Write-Host "Updated src\pages\Register.jsx" -ForegroundColor Green

Write-Host "Installing new packages (@react-oauth/google, jwt-decode)..." -ForegroundColor Cyan
npm install
Write-Host "Phase 3 done! Now run: npm run dev" -ForegroundColor Cyan
Write-Host "IMPORTANT: .env is gitignored on purpose - never commit it." -ForegroundColor Yellow