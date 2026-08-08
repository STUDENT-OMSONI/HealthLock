import React from "react";
import QRScanner from "../Components/QRScanner";

function DoctorDashboard() {
  return (
    <div className="bg-white min-h-screen">
      {/* Banner */}
      <div className="relative h-56 md:h-64 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1600&q=80"
          alt="Doctor with stethoscope"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white px-6 md:px-16">
            Doctor Dashboard
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 space-y-10">
        {/* QR Scanner */}
        <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Patient QR Scanner
          </h2>
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <QRScanner />
          </div>
          <p className="text-gray-500 text-sm mt-6 text-center">
            Scan patient QR codes to securely access their health records.
          </p>
        </div>

        {/* Stat row */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-red-600 text-white rounded-2xl p-6 text-center shadow-sm">
            <p className="text-2xl font-extrabold">36</p>
            <p className="text-sm font-medium opacity-90">Verified claims</p>
          </div>
          <div className="bg-gray-900 text-white rounded-2xl p-6 text-center shadow-sm">
            <p className="text-2xl font-extrabold">2</p>
            <p className="text-sm font-medium opacity-90">Flagged for review</p>
          </div>
          <div className="bg-gray-900 text-white rounded-2xl p-6 text-center shadow-sm">
            <p className="text-2xl font-extrabold">100%</p>
            <p className="text-sm font-medium opacity-90">Encrypted access</p>
          </div>
        </div>

        {/* Patient results */}
        <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Patient Results</h2>
          <div className="space-y-3 text-gray-700">
            <p><span className="font-semibold text-gray-900">Diagnosis:</span> Viral Infection</p>
            <p><span className="font-semibold text-gray-900">Prescription:</span> Paracetamol 500mg (2x daily), ORS</p>
            <p><span className="font-semibold text-gray-900">Test Results:</span> CBC Report Normal, COVID Negative</p>
          </div>
        </div>

        {/* Doctor review */}
        <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Doctor's Review</h2>
          <p className="text-gray-700">
            Patient is recovering well. Recommended to maintain hydration and
            complete 5 days of rest. No further complications observed.
          </p>
          <p className="italic text-gray-400 mt-4">— Dr. Sharma, 22 Aug 2025</p>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
