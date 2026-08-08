import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../Components/Logo";

function Register() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-10 shadow-lg">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">
          Create your account
        </h2>

        <input
          type="text"
          placeholder="Full name"
          className="w-full p-3 mb-4 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
        />

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-3 rounded-full font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-colors"
        >
          Register
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <button onClick={() => navigate("/")} className="text-red-600 font-semibold hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
