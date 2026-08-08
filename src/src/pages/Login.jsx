import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock as LockIcon, FileCheck2 } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (email && password) {
      navigate("/dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="bg-white">
      {/* Hero section */}
      <section className="grid md:grid-cols-2 items-stretch min-h-[70vh]">
        {/* Left: text */}
        <div className="flex flex-col justify-center px-8 md:px-16 py-16 bg-gray-50">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Your health records,<br />
            <span className="text-red-600">fully protected.</span>
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-md">
            HealthLock keeps every prescription, report, and consultation
            encrypted end-to-end — shared only with the people you choose.
          </p>

          <div className="space-y-4 max-w-sm">
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-full font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-colors"
            >
              Sign In
            </button>
            <div className="flex justify-between text-sm text-gray-500 pt-1">
              <button className="hover:text-red-600 transition">Forgot password?</button>
              <button onClick={() => navigate("/register")} className="hover:text-red-600 transition font-semibold">
                Create account
              </button>
            </div>
          </div>
        </div>

        {/* Right: image */}
        <div className="relative min-h-[320px] md:min-h-0">
          <img
            src="https://images.unsplash.com/photo-1723189518215-40ca2397edd9?auto=format&fit=crop&w=1200&q=80"
            alt="Person checking health records on phone"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Stat / trust bar */}
      <section className="bg-gray-50 border-t border-gray-200 py-16 px-6 md:px-16">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-6">
          <div className="bg-red-600 text-white rounded-2xl p-8 text-center shadow-sm">
            <ShieldCheck className="mx-auto mb-3" size={32} />
            <p className="text-2xl font-extrabold">End-to-End</p>
            <p className="text-sm font-medium opacity-90">Encrypted records</p>
          </div>
          <div className="bg-gray-900 text-white rounded-2xl p-8 text-center shadow-sm">
            <LockIcon className="mx-auto mb-3" size={32} />
            <p className="text-2xl font-extrabold">You Own It</p>
            <p className="text-sm font-medium opacity-90">Full access control</p>
          </div>
          <div className="bg-gray-900 text-white rounded-2xl p-8 text-center shadow-sm">
            <FileCheck2 className="mx-auto mb-3" size={32} />
            <p className="text-2xl font-extrabold">Instant Share</p>
            <p className="text-sm font-medium opacity-90">Via secure QR code</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
