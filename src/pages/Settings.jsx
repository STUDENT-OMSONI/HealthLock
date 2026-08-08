import React, { useState } from "react";
import { Settings as SettingsIcon, Moon, Sun, Trash2 } from "lucide-react";
import { getTheme, toggleTheme } from "../theme";
import { clearAuditLog } from "../auditStore";
import { useToast } from "../Components/Toast";

export default function Settings() {
  const showToast = useToast();
  const [theme, setTheme] = useState(getTheme());

  const handleToggleTheme = () => {
    const next = toggleTheme();
    setTheme(next);
  };

  const handleClearLog = () => {
    clearAuditLog();
    showToast("Audit log cleared", "info");
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
            <SettingsIcon size={20} />
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Settings</h1>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Theme</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark mode</p>
            </div>
            <button
              onClick={handleToggleTheme}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>

          <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Clear Audit Log</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Remove all recorded activity history</p>
            </div>
            <button
              onClick={handleClearLog}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors"
            >
              <Trash2 size={16} /> Clear
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          Note: these settings are stored on this device/browser only. A real
          multi-user settings system (hospital info, email/SMS config,
          password policy) needs a backend server to store shared
          configuration -- that's part of the Phase 2 backend work.
        </p>
      </div>
    </div>
  );
}
