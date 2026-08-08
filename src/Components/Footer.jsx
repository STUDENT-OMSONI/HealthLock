import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, ShieldCheck, Lock } from "lucide-react";
import Logo from "./Logo";

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-14 pb-8 px-6 md:px-16">
      <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-10 mb-14 text-gray-400">
        <div className="flex flex-col items-center gap-2 text-xs font-semibold">
          <ShieldCheck size={32} />
          256-BIT
          <br />
          ENCRYPTION
        </div>
        <div className="flex flex-col items-center gap-2 text-xs font-semibold">
          <Lock size={32} />
          END-TO-END
          <br />
          ENCRYPTED
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-200 pt-8">
        <Logo />
        <div className="flex flex-wrap gap-6 text-sm font-semibold text-gray-700">
          <Link to="/about" className="hover:text-red-600 transition-colors">About Us</Link>
          <Link to="/privacy" className="hover:text-red-600 transition-colors">Privacy</Link>
          <Link to="/contact" className="hover:text-red-600 transition-colors">Contact</Link>
        </div>
        <div className="flex gap-4 text-gray-400">
          <Facebook size={18} />
          <Instagram size={18} />
          <Twitter size={18} />
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        © 2026 HealthLock. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
