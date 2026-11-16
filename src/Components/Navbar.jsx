import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, User, Stethoscope, Shield, Calendar, FileText, Pill, Users } from "lucide-react";
import Logo from "./Logo";
import { getUser, clearUser, isLoggedIn } from "../auth";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getUser());
  const [menuOpen, setMenuOpen] = useState(false);

  // Parse current search params for active tab detection
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "overview";

  useEffect(() => {
    setUser(getUser());
    setMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    clearUser();
    setUser(null);
    window.location.href = "/login";
  };

  const getProfileLink = () => {
    if (!user) return "/login";
    const email = (user.email || "").toLowerCase();
    if (user.role === "Admin" || email === "om27ec015@gmail.com") return "/admin?tab=overview";
    if (user.role === "Doctor" || email === "omsoni2006456@gmail.com") return "/doctor?tab=profile";
    return "/dashboard?tab=profile";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-xs transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 md:h-18 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" onClick={() => setMenuOpen(false)} className="hover:opacity-90 transition-opacity">
          <Logo size="text-lg md:text-2xl" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-7 text-gray-700 font-semibold text-sm">
          <Link
            to="/"
            className={`transition-colors ${
              location.pathname === "/" ? "text-red-600 font-bold" : "hover:text-red-600 text-gray-700"
            }`}
          >
            Home
          </Link>

          {isLoggedIn() && user?.role === "Patient" && (
            <>
              <Link
                to="/dashboard?tab=overview"
                className={`transition-colors ${
                  location.pathname === "/dashboard" && currentTab === "overview"
                    ? "text-red-600 font-bold border-b-2 border-red-600 pb-0.5"
                    : "hover:text-red-600 text-gray-700"
                }`}
              >
                Patient Dashboard
              </Link>
              <Link
                to="/dashboard?tab=records"
                className={`transition-colors ${
                  location.pathname === "/dashboard" && currentTab === "records"
                    ? "text-red-600 font-bold border-b-2 border-red-600 pb-0.5"
                    : "hover:text-red-600 text-gray-700"
                }`}
              >
                My Records
              </Link>
              <Link
                to="/dashboard?tab=appointments"
                className={`transition-colors ${
                  location.pathname === "/dashboard" && currentTab === "appointments"
                    ? "text-red-600 font-bold border-b-2 border-red-600 pb-0.5"
                    : "hover:text-red-600 text-gray-700"
                }`}
              >
                Appointments
              </Link>
              <Link
                to="/dashboard?tab=consent"
                className={`transition-colors ${
                  location.pathname === "/dashboard" && currentTab === "consent"
                    ? "text-red-600 font-bold border-b-2 border-red-600 pb-0.5"
                    : "hover:text-red-600 text-gray-700"
                }`}
              >
                Doctor Consent
              </Link>
            </>
          )}

          {isLoggedIn() && user?.role === "Doctor" && (
            <>
              <Link
                to="/doctor?tab=overview"
                className={`transition-colors ${
                  location.pathname === "/doctor" && currentTab === "overview"
                    ? "text-red-600 font-bold border-b-2 border-red-600 pb-0.5"
                    : "hover:text-red-600 text-gray-700"
                }`}
              >
                Doctor Dashboard
              </Link>
              <Link
                to="/doctor?tab=patients"
                className={`transition-colors ${
                  location.pathname === "/doctor" && currentTab === "patients"
                    ? "text-red-600 font-bold border-b-2 border-red-600 pb-0.5"
                    : "hover:text-red-600 text-gray-700"
                }`}
              >
                My Patients
              </Link>
              <Link
                to="/doctor?tab=records"
                className={`transition-colors ${
                  location.pathname === "/doctor" && currentTab === "records"
                    ? "text-red-600 font-bold border-b-2 border-red-600 pb-0.5"
                    : "hover:text-red-600 text-gray-700"
                }`}
              >
                Patient Records
              </Link>
              <Link
                to="/doctor?tab=appointments"
                className={`transition-colors ${
                  location.pathname === "/doctor" && currentTab === "appointments"
                    ? "text-red-600 font-bold border-b-2 border-red-600 pb-0.5"
                    : "hover:text-red-600 text-gray-700"
                }`}
              >
                Appointments
              </Link>
              <Link
                to="/doctor?tab=prescriptions"
                className={`transition-colors ${
                  location.pathname === "/doctor" && currentTab === "prescriptions"
                    ? "text-red-600 font-bold border-b-2 border-red-600 pb-0.5"
                    : "hover:text-red-600 text-gray-700"
                }`}
              >
                Prescriptions
              </Link>
            </>
          )}

          {isLoggedIn() && user?.role === "Admin" && (
            <>
              <Link
                to="/admin?tab=overview"
                className={`transition-colors ${
                  location.pathname === "/admin" && currentTab === "overview"
                    ? "text-red-600 font-bold border-b-2 border-red-600 pb-0.5"
                    : "hover:text-red-600 text-gray-700"
                }`}
              >
                Admin Panel
              </Link>
              <Link
                to="/admin?tab=users"
                className={`transition-colors ${
                  location.pathname === "/admin" && currentTab === "users"
                    ? "text-red-600 font-bold border-b-2 border-red-600 pb-0.5"
                    : "hover:text-red-600 text-gray-700"
                }`}
              >
                User Management
              </Link>
              <Link
                to="/admin?tab=doctors"
                className={`transition-colors ${
                  location.pathname === "/admin" && currentTab === "doctors"
                    ? "text-red-600 font-bold border-b-2 border-red-600 pb-0.5"
                    : "hover:text-red-600 text-gray-700"
                }`}
              >
                Doctor Verification
              </Link>
              <Link
                to="/admin?tab=patients"
                className={`transition-colors ${
                  location.pathname === "/admin" && currentTab === "patients"
                    ? "text-red-600 font-bold border-b-2 border-red-600 pb-0.5"
                    : "hover:text-red-600 text-gray-700"
                }`}
              >
                Patients
              </Link>
              <Link
                to="/admin?tab=appointments"
                className={`transition-colors ${
                  location.pathname === "/admin" && currentTab === "appointments"
                    ? "text-red-600 font-bold border-b-2 border-red-600 pb-0.5"
                    : "hover:text-red-600 text-gray-700"
                }`}
              >
                Appointments
              </Link>
            </>
          )}
        </div>

        {/* Right side User Info & Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={getProfileLink()}
                className="flex items-center gap-2.5 hover:opacity-85 transition cursor-pointer"
                title="View Account Profile"
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-red-50 text-red-600 font-bold flex items-center justify-center border border-red-200 text-xs shadow-xs">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="text-left">
                  <div className="text-xs font-bold text-gray-900 leading-tight">{user.name}</div>
                  <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                    {user.role}
                  </span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors ml-1 cursor-pointer"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-5 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-gray-700 hover:text-red-600 cursor-pointer"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md px-5 py-4 space-y-3 shadow-lg"
          >
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="block text-sm font-semibold text-gray-800 hover:text-red-600 py-1"
          >
            Home
          </Link>
          {isLoggedIn() && user?.role === "Patient" && (
            <>
              <Link
                to="/dashboard?tab=overview"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold text-gray-800 hover:text-red-600 py-1"
              >
                Overview
              </Link>
              <Link
                to="/dashboard?tab=records"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold text-gray-800 hover:text-red-600 py-1"
              >
                My Records
              </Link>
              <Link
                to="/dashboard?tab=appointments"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold text-gray-800 hover:text-red-600 py-1"
              >
                Appointments
              </Link>
              <Link
                to="/dashboard?tab=consent"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold text-gray-800 hover:text-red-600 py-1"
              >
                Doctor Consent
              </Link>
            </>
          )}

          {isLoggedIn() && user?.role === "Doctor" && (
            <>
              <Link
                to="/doctor?tab=overview"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold text-gray-800 hover:text-red-600 py-1"
              >
                Doctor Dashboard
              </Link>
              <Link
                to="/doctor?tab=patients"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold text-gray-800 hover:text-red-600 py-1"
              >
                My Patients
              </Link>
              <Link
                to="/doctor?tab=records"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold text-gray-800 hover:text-red-600 py-1"
              >
                Patient Records
              </Link>
              <Link
                to="/doctor?tab=appointments"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold text-gray-800 hover:text-red-600 py-1"
              >
                Appointments
              </Link>
              <Link
                to="/doctor?tab=prescriptions"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold text-gray-800 hover:text-red-600 py-1"
              >
                Prescriptions
              </Link>
            </>
          )}

          {isLoggedIn() && user?.role === "Admin" && (
            <>
              <Link
                to="/admin?tab=overview"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold text-gray-800 hover:text-red-600 py-1"
              >
                Admin Overview
              </Link>
              <Link
                to="/admin?tab=users"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold text-gray-800 hover:text-red-600 py-1"
              >
                User Management
              </Link>
              <Link
                to="/admin?tab=doctors"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold text-gray-800 hover:text-red-600 py-1"
              >
                Doctor Verification
              </Link>
              <Link
                to="/admin?tab=patients"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold text-gray-800 hover:text-red-600 py-1"
              >
                Patient Accounts
              </Link>
              <Link
                to="/admin?tab=appointments"
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-semibold text-gray-800 hover:text-red-600 py-1"
              >
                Appointments Monitor
              </Link>
            </>
          )}

          <div className="pt-3 border-t border-gray-100">
            {user ? (
              <div className="space-y-2">
                <div className="text-xs text-gray-600 flex items-center justify-between">
                  <span>Signed in as <b>{user.name}</b></span>
                  <span className="text-red-600 font-bold">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-white bg-red-600 rounded-full shadow-sm"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-center py-2 text-sm font-semibold border border-gray-300 rounded-full text-gray-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="text-center py-2 text-sm font-bold bg-red-600 text-white rounded-full"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </nav>
  );
}
