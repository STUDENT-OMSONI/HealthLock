import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        <Link to="/dashboard">
          <Logo />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          <Link to="/dashboard" className="hover:text-red-600 transition-colors">Dashboard</Link>
          <Link to="/doctor" className="hover:text-red-600 transition-colors">Doctor</Link>
          <Link to="/consent" className="hover:text-red-600 transition-colors">Consent</Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="hidden sm:inline-flex px-5 py-2.5 rounded-full font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Logout
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
