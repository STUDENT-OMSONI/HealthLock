import React, { useEffect, useState } from "react";
import { ShieldAlert, LogIn, Ban, Activity, AlertTriangle, Info } from "lucide-react";
import { getSecurityOverview } from "../services/securityService";
import { clearUser } from "../auth";
import { useToast } from "../Components/Toast";
import { useNavigate } from "react-router-dom";

export default function AdminSecurity() {
  const showToast = useToast();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    getSecurityOverview().then(setOverview);
  }, []);

  const handleForceLogout = () => {
    clearUser();
    showToast("This session has been logged out", "info");
    navigate("/");
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
            <ShieldAlert size={20} />
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Security Center</h1>
        </div>

        <div className="flex items-start gap-2 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <p>
            Real IP address tracking and true user-blocking require a backend server -- browsers never
            expose a visitor's IP to JavaScript, and "blocking" only works if a server actually refuses
            requests. What's shown below is honestly labeled: real numbers where this browser can
            actually know them, and clearly marked where a backend is required.
          </p>
        </div>

        {!overview ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5 mb-10">
            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <LogIn size={18} className="text-red-600" />
                <p className="font-semibold text-gray-900 dark:text-white">Failed Logins</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{overview.failedLogins}</p>
              <p className="text-xs text-gray-400 mt-1">Real count -- Google Sign-In has no local failure to track here.</p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={18} className="text-green-600" />
                <p className="font-semibold text-gray-900 dark:text-white">Active Sessions</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{overview.activeSessions}</p>
              <p className="text-xs text-gray-400 mt-1">Real -- this browser's current session only.</p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Ban size={18} className="text-gray-500" />
                <p className="font-semibold text-gray-900 dark:text-white">Blocked Users</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{overview.blockedUsers}</p>
              <p className="text-xs text-gray-400 mt-1">Requires a backend to enforce real blocking.</p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert size={18} className="text-yellow-600" />
                <p className="font-semibold text-gray-900 dark:text-white">Suspicious Activity</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{overview.suspiciousActivityEvents}</p>
              <p className="text-xs text-gray-400 mt-1">Real -- counted from your actual audit log (deletions).</p>
            </div>
          </div>
        )}

        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-gray-500" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Force Logout This Session</p>
              <p className="text-xs text-gray-400">Signs out the current browser session immediately.</p>
            </div>
          </div>
          <button
            onClick={handleForceLogout}
            className="px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Force Logout
          </button>
        </div>
      </div>
    </div>
  );
}
