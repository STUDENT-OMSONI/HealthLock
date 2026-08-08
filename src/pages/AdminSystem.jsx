import React, { useEffect, useState } from "react";
import { Cpu, MemoryStick, Database, Zap, Users, AlertTriangle } from "lucide-react";
import { getSystemStatus } from "../services/systemService";

function Bar({ percent, colorClass }) {
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
      <div className={`h-2 ${colorClass} transition-all`} style={{ width: `${percent}%` }} />
    </div>
  );
}

export default function AdminSystem() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const data = await getSystemStatus();
    setStatus(data);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000); // refreshes to feel live
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
            <Cpu size={20} />
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">System Monitoring</h1>
        </div>

        {status?.simulated && (
          <div className="flex items-start gap-2 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <p>
              These values are <strong>simulated</strong> for preview purposes. Real CPU/memory/server
              metrics require a running backend server -- there is no way for a browser to measure a
              server's hardware usage. This will connect to real data once the Phase 2 backend exists.
            </p>
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-sm">Loading system status...</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Cpu size={18} className="text-red-600" />
                <p className="font-semibold text-gray-900 dark:text-white">CPU Usage</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">{status.cpuUsagePercent}%</p>
              <Bar percent={status.cpuUsagePercent} colorClass="bg-red-600" />
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <MemoryStick size={18} className="text-gray-900 dark:text-white" />
                <p className="font-semibold text-gray-900 dark:text-white">Memory Usage</p>
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">{status.memoryUsagePercent}%</p>
              <Bar percent={status.memoryUsagePercent} colorClass="bg-gray-900 dark:bg-white" />
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex items-center gap-4">
              <span className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Database size={18} className="text-gray-700 dark:text-gray-300" />
              </span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Database Status</p>
                <p className={`text-sm font-medium ${status.databaseStatus === "connected" ? "text-green-600" : "text-red-600"}`}>
                  {status.databaseStatus === "connected" ? "Connected" : "Not connected (no backend yet)"}
                </p>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex items-center gap-4">
              <span className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Zap size={18} className="text-gray-700 dark:text-gray-300" />
              </span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">API Response Time</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{status.apiResponseTimeMs} ms</p>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex items-center gap-4 sm:col-span-2">
              <span className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Users size={18} className="text-gray-700 dark:text-gray-300" />
              </span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Active Users</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {status.activeUsers} (this browser session -- real count needs a backend with shared sessions)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
