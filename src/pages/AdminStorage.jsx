import React, { useEffect, useState } from "react";
import { HardDrive, FileText, AlertTriangle } from "lucide-react";
import { getStorageOverview, formatBytes } from "../services/storageService";

export default function AdminStorage() {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    getStorageOverview().then(setOverview).catch(() => setOverview(null));
  }, []);

  if (!overview) return null;

  const usedPercent = Math.min(100, Math.round((overview.usedBytes / overview.quotaBytes) * 100));

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
            <HardDrive size={20} />
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">File Storage Management</h1>
        </div>

        <div className="flex items-start gap-2 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <p>
            These numbers are <strong>real</strong> -- calculated from actual browser storage usage, not
            simulated. This is browser (localStorage) storage, not cloud storage. Swapping to
            Cloudinary/Firebase later (see storageService.js TODO) will replace this with real cloud
            quota numbers instead.
          </p>
        </div>

        {/* Usage bar */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatBytes(overview.usedBytes)} used
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {formatBytes(overview.remainingBytes)} remaining of ~{formatBytes(overview.quotaBytes)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 transition-all ${usedPercent > 80 ? "bg-red-600" : "bg-gray-900 dark:bg-white"}`}
              style={{ width: `${usedPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{overview.totalFiles} file(s) uploaded across all patients</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
            <p className="font-semibold text-gray-900 dark:text-white mb-3">Largest Files</p>
            {overview.largestFiles.length === 0 ? (
              <p className="text-sm text-gray-400">No files uploaded yet.</p>
            ) : (
              <ul className="space-y-2">
                {overview.largestFiles.map((f) => (
                  <li key={f.id} className="flex items-center gap-2 text-sm">
                    <FileText size={14} className="text-gray-400 shrink-0" />
                    <span className="truncate flex-1 text-gray-700 dark:text-gray-300">{f.name}</span>
                    <span className="text-gray-400 text-xs shrink-0">{formatBytes(f.size)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
            <p className="font-semibold text-gray-900 dark:text-white mb-3">Recent Uploads</p>
            {overview.recentUploads.length === 0 ? (
              <p className="text-sm text-gray-400">No files uploaded yet.</p>
            ) : (
              <ul className="space-y-2">
                {overview.recentUploads.map((f) => (
                  <li key={f.id} className="flex items-center gap-2 text-sm">
                    <FileText size={14} className="text-gray-400 shrink-0" />
                    <span className="truncate flex-1 text-gray-700 dark:text-gray-300">{f.name}</span>
                    <span className="text-gray-400 text-xs shrink-0">{f.patientName}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
