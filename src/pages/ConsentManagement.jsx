import React, { useState } from "react";

function ConsentManagement() {
  const [consents, setConsents] = useState([
    { role: "Doctor", granted: true },
    { role: "Pharmacist", granted: false },
    { role: "Diagnostics", granted: true },
  ]);

  const toggleConsent = (index) => {
    const updated = [...consents];
    updated[index].granted = !updated[index].granted;
    setConsents(updated);
  };

  return (
    <div className="min-h-screen bg-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
          Consent Management
        </h1>

        <ul className="space-y-5">
          {consents.map((c, i) => (
            <li
              key={i}
              className="flex justify-between items-center p-6 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-gray-900 text-lg font-semibold">{c.role}</span>

              <div
                onClick={() => toggleConsent(i)}
                className={`w-16 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                  c.granted ? "bg-red-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                    c.granted ? "translate-x-8" : "translate-x-0"
                  }`}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ConsentManagement;
