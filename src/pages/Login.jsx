import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, AlertCircle, UserCheck } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import Logo from "../Components/Logo";
import { loginWithEmail, loginWithGoogle, getUser } from "../auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectAfterLogin = (user) => {
    if (!user) return;
    const role = user?.role;
    const userEmail = (user?.email || "").toLowerCase();

    let target = "/dashboard";
    if (role === "Admin" || userEmail === "om27ec015@gmail.com") {
      target = "/admin";
    } else if (role === "Doctor" || userEmail === "omsoni2006456@gmail.com") {
      target = "/doctor";
    }

    // Instantly navigate via React Router and enforce hard browser replace
    navigate(target, { replace: true });
    window.location.replace(target);
  };

  useEffect(() => {
    const user = getUser();
    if (user && user.role) {
      redirectAfterLogin(user);
    }
  }, []);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const user = await loginWithEmail(email, password);
      redirectAfterLogin(user);
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError("Unable to obtain Google sign-in credentials.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await loginWithGoogle(credentialResponse.credential);
      redirectAfterLogin(user);
    } catch (err) {
      setError(err.message || "Google authentication failed. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In failed or popup was closed. Please try again.");
  };

  const handleFastLogin = async (role) => {
    let emailToUse = "";
    let passToUse = "";
    if (role === "patient") {
      emailToUse = "patient@healthlock.com";
      passToUse = "Patient@123456";
    } else if (role === "doctor") {
      emailToUse = "omsoni2006456@gmail.com";
      passToUse = "Doctor@123456";
    } else if (role === "admin") {
      emailToUse = "om27ec015@gmail.com";
      passToUse = "Admin@123456";
    }
    if (!emailToUse) return;

    setEmail(emailToUse);
    setPassword(passToUse);
    setLoading(true);
    setError("");
    try {
      const user = await loginWithEmail(emailToUse, passToUse);
      redirectAfterLogin(user);
    } catch (err) {
      setError(err.message || "Failed to sign in.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-100/70">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-4xl bg-white border border-slate-200/90 rounded-[28px] shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
      >
        
        {/* Left Side: Clean Formal Login Form (no ugly scrollbars) */}
        <div className="p-6 sm:p-7 md:p-8 flex flex-col justify-between space-y-3 max-h-[92vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div>
            <div className="mb-3">
              <Logo size="text-2xl" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Account Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-3">
              Authorized clinical access for patients, physicians, and administrative staff
            </p>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs flex items-center gap-2"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-full shadow-md transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {loading ? "Authenticating..." : "Sign In to Account"}
                <ArrowRight size={15} />
              </motion.button>
            </form>

            {/* Google OAuth Section */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  Or Continue With Google
                </span>
              </div>
            </div>

            <div className="flex justify-center w-full min-h-[42px]">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="continue_with"
                shape="pill"
                width="340"
              />
            </div>

            {/* Quick 1-Click Fast Fill Verified Accounts (No personal names) */}
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <UserCheck size={14} className="text-red-600" />
                Quick 1-Click Fast-Fill:
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => handleFastLogin("patient")}
                  disabled={loading}
                  className="py-2.5 px-2 text-center bg-white border border-slate-200 hover:border-red-500 hover:text-red-600 rounded-xl font-bold text-slate-800 text-xs shadow-2xs transition-colors cursor-pointer flex items-center justify-center"
                >
                  Patient
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => handleFastLogin("doctor")}
                  disabled={loading}
                  className="py-2.5 px-2 text-center bg-white border border-slate-200 hover:border-red-500 hover:text-red-600 rounded-xl font-bold text-slate-800 text-xs shadow-2xs transition-colors cursor-pointer flex items-center justify-center"
                >
                  Doctor
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => handleFastLogin("admin")}
                  disabled={loading}
                  className="py-2.5 px-2 text-center bg-white border border-slate-200 hover:border-red-500 hover:text-red-600 rounded-xl font-bold text-slate-800 text-xs shadow-2xs transition-colors cursor-pointer flex items-center justify-center"
                >
                  Admin
                </motion.button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{" "}
              <Link to="/register" className="font-bold text-red-600 hover:underline">
                Register as Patient or Doctor
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side: Moving HD Healthcare Video with Formal Overlay */}
        <div className="relative hidden md:flex flex-col justify-between p-8 sm:p-10 text-white overflow-hidden bg-slate-950">
          {/* Moving HD Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center"
            src="https://videos.pexels.com/video-files/8413486/8413486-uhd_2560_1440_25fps.mp4"
            poster="https://images.pexels.com/videos/8413486/adult-business-computer-connection-8413486.jpeg?auto=compress&w=1600"
          />

          {/* Elegant Dark Vignette Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/70 to-slate-950/50" />

          {/* Top Header Text */}
          <div className="relative z-10 space-y-2">
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
              Metropolitan Health Network
            </p>
            <h3 className="text-2xl font-extrabold text-white leading-tight">
              Clinical Care & Records Portal
            </h3>
          </div>

          {/* Bottom Accreditation & Security Note */}
          <div className="relative z-10 space-y-4">
            <p className="text-xs text-slate-200 leading-relaxed bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              MediKey provides confidential access to diagnostic records, doctor appointments, and electronic prescriptions with zero-knowledge data security.
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10">
              <span>HIPAA & HITECH Architecture</span>
              <span className="font-semibold text-slate-200">SHA-256 Verified Ledger</span>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
