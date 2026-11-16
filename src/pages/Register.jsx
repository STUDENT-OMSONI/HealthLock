import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, User, ShieldCheck, Stethoscope, ArrowRight, AlertCircle, Phone, Heart, CheckCircle2 } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import Logo from "../Components/Logo";
import { registerWithEmail, loginWithGoogle } from "../auth";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Patient specifics
  const [age, setAge] = useState("25");
  const [gender, setGender] = useState("Male");
  const [contact, setContact] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [emergencyContact, setEmergencyContact] = useState("");

  // Doctor specifics
  const [specialization, setSpecialization] = useState("Cardiology");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [hospital, setHospital] = useState("Metropolitan General Hospital");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      };

      if (role === "Doctor") {
        payload.doctorDetails = {
          specialization,
          licenseNumber: licenseNumber || "LIC-REG-" + Math.floor(10000 + Math.random() * 90000),
          hospital: hospital || "MediKey Hospital Network",
        };
      } else {
        payload.patientDetails = {
          age: age ? parseInt(age) : 25,
          gender,
          contact,
          bloodGroup,
          emergencyContact,
        };
      }

      const user = await registerWithEmail(payload);

      let target = "/dashboard";
      if (user.role === "Doctor" || user.email === "omsoni2006456@gmail.com") {
        target = "/doctor";
      } else if (user.role === "Admin" || user.email === "om27ec015@gmail.com") {
        target = "/admin";
      }
      navigate(target, { replace: true });
      window.location.replace(target);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError("Unable to obtain Google credentials.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const user = await loginWithGoogle(credentialResponse.credential, { role });
      let target = "/dashboard";
      if (user.role === "Doctor" || user.email === "omsoni2006456@gmail.com") {
        target = "/doctor";
      } else if (user.role === "Admin" || user.email === "om27ec015@gmail.com") {
        target = "/admin";
      }
      navigate(target, { replace: true });
      window.location.replace(target);
    } catch (err) {
      setError(err.message || "Google sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In failed or popup was closed. Please try again.");
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-100/60">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-4xl bg-white border border-slate-200/90 rounded-[28px] shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[640px]"
      >
        
        {/* Left Side: Form */}
        <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-4 max-h-[90vh] overflow-y-auto">
          <div>
            <div className="mb-4">
              <Logo size="text-2xl" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Get Started</h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Join MediKey for confidential, encrypted healthcare management
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs flex items-center gap-2"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setRole("Patient")}
                className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
                  role === "Patient"
                    ? "bg-white text-red-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <User size={15} /> Patient Account
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setRole("Doctor")}
                className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
                  role === "Doctor"
                    ? "bg-white text-red-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Stethoscope size={15} /> Doctor Account
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === "Doctor" ? "Dr. Marcus Vance" : "Alex Vance"}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@domain.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Conditional Doctor Details */}
              {role === "Doctor" && (
                <div className="p-3.5 bg-orange-50/60 border border-orange-200 rounded-2xl space-y-2.5">
                  <p className="font-bold text-orange-800 text-[11px] uppercase tracking-wider">Doctor Credentials</p>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Specialization</label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Cardiology, Neurology"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Hospital / Clinic</label>
                      <input
                        type="text"
                        value={hospital}
                        onChange={(e) => setHospital(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Medical License #</label>
                      <input
                        type="text"
                        placeholder="MED-CA-XXXXX"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Patient Details */}
              {role === "Patient" && (
                <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2.5">
                  <p className="font-bold text-blue-800 text-[11px] uppercase tracking-wider">Patient Vitals Profile</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Age</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white font-bold text-red-600"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        placeholder="Phone number"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Emergency Contact</label>
                      <input
                        type="text"
                        placeholder="Contact person"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-full shadow-md transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {loading ? "Creating Account..." : `Register as ${role}`}
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
                  Or Register With Google
                </span>
              </div>
            </div>

            <div className="flex justify-center w-full min-h-[44px]">
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
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-red-600 hover:underline">
                Sign In here
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side: Moving HD Healthcare Video with Formal Overlay */}
        <div className="relative hidden md:flex flex-col justify-between p-8 sm:p-10 text-white overflow-hidden bg-slate-950">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center"
            src="https://videos.pexels.com/video-files/8413486/8413486-uhd_2560_1440_25fps.mp4"
            poster="https://images.pexels.com/videos/8413486/adult-business-computer-connection-8413486.jpeg?auto=compress&w=1600"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/70 to-slate-950/50" />

          <div className="relative z-10 space-y-2">
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
              Metropolitan Health Network
            </p>
            <h3 className="text-2xl font-extrabold text-white leading-tight">
              Patient Registration & Clinical Credentials
            </h3>
          </div>

          <div className="relative z-10 space-y-4">
            <p className="text-xs text-slate-200 leading-relaxed bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              Create a patient profile to consult certified hospital specialists, manage electronic prescriptions, and retain complete control over your medical records.
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10">
              <span>Verified Clinical Network</span>
              <span className="font-semibold text-slate-200">Patient-Governed Access</span>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
