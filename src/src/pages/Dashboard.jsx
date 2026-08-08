import React from "react";
import FileUpload from "../Components/FileUpload";
import QRGenerator from "../Components/QRGenerator";
import AccessLogs from "../Components/AccessLogs";
import HealthHistory from "../Components/HealthHistory";

function Dashboard() {
  return (
    <div className="bg-white min-h-screen">
      {/* Banner */}
      <div className="relative h-56 md:h-64 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1600&q=80"
          alt="Healthcare records"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white px-6 md:px-16">
            Patient Dashboard
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 space-y-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">File Upload</h2>
            <FileUpload />
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">QR Generator</h2>
            <QRGenerator />
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Health Record History</h2>
            <HealthHistory />
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Access Logs</h2>
            <AccessLogs />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
