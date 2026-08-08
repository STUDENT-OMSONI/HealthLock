import React, { useEffect, useState } from "react";
import { KeyRound, AlertTriangle, RotateCcw } from "lucide-react";
import { getRoleNames, getPermissionKeys, getRoleMatrix, setPermission, resetToDefaults } from "../services/roleService";
import { useToast } from "../Components/Toast";

export default function AdminRoles() {
  const showToast = useToast();
  const roles = getRoleNames();
  const permissions = getPermissionKeys();
  const [matrix, setMatrix] = useState(null);

  useEffect(() => {
    setMatrix(getRoleMatrix());
  }, []);

  const handleToggle = (role, perm) => {
    const current = matrix[role]?.[perm] || false;
    const updated = setPermission(role, perm, !current);
    setMatrix({ ...updated });
  };

  const handleReset = () => {
    const updated = resetToDefaults();
    setMatrix({ ...updated });
    showToast("Reset to default permissions", "info");
  };

  if (!matrix) return null;

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
              <KeyRound size={20} />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Roles & Permissions</h1>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RotateCcw size={14} /> Reset to defaults
          </button>
        </div>

        <div className="flex items-start gap-2 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <p>
            This is a <strong>permission editor UI only</strong>, not real security. A permission only
            actually protects anything when a backend server checks it on every request. Use this to
            design the permission structure now -- it's ready to send to the Phase 2 backend, which will
            enforce it for real.
          </p>
        </div>

        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-2xl">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 text-left text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wide">
                <th className="px-4 py-3">Role</th>
                {permissions.map((p) => (
                  <th key={p} className="px-4 py-3 text-center capitalize">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{role}</td>
                  {permissions.map((perm) => (
                    <td key={perm} className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!matrix[role]?.[perm]}
                        onChange={() => handleToggle(role, perm)}
                        className="w-4 h-4 accent-red-600 cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
