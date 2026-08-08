import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Logo from "../Components/Logo";
import { loginWithGoogle } from "../auth";

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      // Sends the Google credential to our real backend, which verifies it
      // with Google and returns the user's real role from the database.
      await loginWithGoogle(credentialResponse.credential);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
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
          Sign in to your account
        </h2>
        <p className="text-gray-500 text-sm text-center mb-8">
          Only Google accounts can access HealthLock.
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
            {error}
          </p>
        )}

        <div className="flex justify-center">
          {loading ? (
            <p className="text-sm text-gray-500">Signing you in...</p>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Sign-In failed. Please try again.")}
              theme="outline"
              shape="pill"
              size="large"
              width="280"
            />
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          By continuing, you agree to HealthLock's terms and privacy policy.
        </p>
      </div>
    </div>
  );
}

export default Login;
