import React from "react";

function AccessLogs() {
  const logs = [
    { user: "Dr. Sharma", action: "Viewed MRI Report", time: "12:30 PM" },
    { user: "Pharmacist", action: "Checked Prescription", time: "01:00 PM" },
  ];

  return (
    <ul className="space-y-2">
      {logs.map((log, index) => (
        <li key={index} className="text-sm text-gray-700 p-3 bg-gray-50 border border-gray-200 rounded-xl">
          <span className="font-semibold text-gray-900">{log.user}</span> — {log.action} @ {log.time}
        </li>
      ))}
    </ul>
  );
}

export default AccessLogs;
