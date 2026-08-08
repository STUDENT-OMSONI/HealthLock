import React from "react";

function HealthHistory() {
  const healthRecords = [
    { id: 1, date: "2025-02-10", doctor: "Dr. Sharma", diagnosis: "Fever & Cold", prescription: "Paracetamol 500mg, Rest for 3 days" },
    { id: 2, date: "2024-11-15", doctor: "Dr. Mehta", diagnosis: "Routine Checkup", prescription: "Vitamin D, Regular Exercise" },
  ];

  return (
    <ul className="space-y-3">
      {healthRecords.map((record) => (
        <li key={record.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-gray-900"><span className="font-semibold">Date:</span> {record.date}</p>
          <p className="text-gray-900"><span className="font-semibold">Doctor:</span> {record.doctor}</p>
          <p className="text-gray-900"><span className="font-semibold">Diagnosis:</span> {record.diagnosis}</p>
          <p className="text-gray-900"><span className="font-semibold">Prescription:</span> {record.prescription}</p>
        </li>
      ))}
    </ul>
  );
}

export default HealthHistory;
