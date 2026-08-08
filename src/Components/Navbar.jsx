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
