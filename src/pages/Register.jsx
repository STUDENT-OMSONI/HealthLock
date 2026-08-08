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
