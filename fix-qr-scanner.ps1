# Fix: QR scanner now actually works and shows scanned patient data

Write-Host "Applying QR scanner fix..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "src\Components" | Out-Null
New-Item -ItemType Directory -Force -Path "src\pages" | Out-Null

$content_0 = @'
import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

export default function QRScanner({ onDecode }) {
  const idRef = useRef("qr-reader-" + Math.random().toString(36).slice(2));
  const scannerRef = useRef(null);

  // Keep the latest onDecode callback in a ref so the scanner effect
  // below doesn't need to depend on it directly. If it did, passing a new
  // inline function from the parent on every render would tear down and
  // recreate the camera scanner constantly -- which looks like "scanning
  // doesn't work" (camera flickers / never completes a scan).
  const onDecodeRef = useRef(onDecode);
  onDecodeRef.current = onDecode;

  const [status, setStatus] = useState("scanning"); // scanning | success | camera-error
  const [scannedValue, setScannedValue] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    setStatus("scanning");
    setScannedValue(null);

    const scanner = new Html5QrcodeScanner(
      idRef.current,
      {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        rememberLastUsedCamera: true,
      },
      false
    );
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        setStatus("success");
        setScannedValue(decodedText);
        onDecodeRef.current?.(decodedText);
        scanner.clear().catch(() => {});
      },
      (err) => {
        // html5-qrcode calls this constantly while it's still looking for a
        // QR code -- that's normal and NOT a real error, so we ignore it
        // unless it looks like an actual camera/permission failure.
        const message = typeof err === "string" ? err : err?.message || "";
        if (
          message.toLowerCase().includes("permission") ||
          message.toLowerCase().includes("notallowed") ||
          message.toLowerCase().includes("notfound")
        ) {
          setStatus("camera-error");
        }
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const handleScanAgain = () => {
    setResetKey((k) => k + 1);
  };

  if (status === "success") {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="mx-auto text-green-600 mb-3" size={40} />
        <p className="font-semibold text-gray-900">Scan successful</p>
        <p className="text-xs text-gray-500 mt-1 break-all px-4">{scannedValue}</p>
        <button
          onClick={handleScanAgain}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
        >
          <RefreshCw size={14} /> Scan another patient
        </button>
      </div>
    );
  }

  if (status === "camera-error") {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto text-yellow-600 mb-3" size={40} />
        <p className="font-semibold text-gray-900">Camera not available</p>
        <p className="text-xs text-gray-500 mt-1 px-4">
          Please allow camera permission in your browser, or use HTTPS if
          testing on a phone (browsers block camera access on plain HTTP
          except on localhost).
        </p>
        <button
          onClick={handleScanAgain}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
        >
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div id={idRef.current} style={{ width: "100%" }} />
      <p className="text-xs text-gray-500 mt-2 text-center">
        Point the camera at the patient's QR code to securely load their records.
      </p>
    </div>
  );
}

'@
Set-Content -Path "src\Components\QRScanner.jsx" -Value $content_0 -NoNewline
Write-Host "Updated src\Components\QRScanner.jsx" -ForegroundColor Green

$content_1 = @'
import React, { useState } from "react";
import { ShieldCheck, User } from "lucide-react";
import QRScanner from "../Components/QRScanner";

// Temporary mock "database" until the real Excel/backend lookup (Phase 2)
// is wired in. In production this should call an API using the scanned
// token, over HTTPS, with the doctor's session verified server-side.
const MOCK_PATIENT_RECORDS = {
  default: {
    name: "David Schulz",
    diagnosis: "Viral Infection",
    prescription: "Paracetamol 500mg (2x daily), ORS",
    testResults: "CBC Report Normal, COVID Negative",
    review:
      "Patient is recovering well. Recommended to maintain hydration and complete 5 days of rest. No further complications observed.",
    reviewedBy: "Dr. Sharma, 22 Aug 2025",
  },
};

function lookupPatientByToken(token) {
  // Real implementation: verify token server-side and fetch that
  // specific patient's records. For now, any scanned token resolves
  // to the same demo record so the flow can be tested end-to-end.
  return MOCK_PATIENT_RECORDS.default;
}

function DoctorDashboard() {
  const [patient, setPatient] = useState(null);

  const handleScan = (token) => {
    const record = lookupPatientByToken(token);
    setPatient(record);
  };

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
        <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Patient QR Scanner
          </h2>
          <div className="p-4 md:p-6 bg-gray-50 rounded-2xl border border-gray-200 max-w-md mx-auto">
            <QRScanner onDecode={handleScan} />
          </div>
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

        {/* Patient data - only shown after a successful, valid scan */}
        {patient ? (
          <>
            <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center">
                  <User size={20} />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <ShieldCheck size={14} /> Access granted via secure QR scan
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-gray-700">
                <p><span className="font-semibold text-gray-900">Diagnosis:</span> {patient.diagnosis}</p>
                <p><span className="font-semibold text-gray-900">Prescription:</span> {patient.prescription}</p>
                <p><span className="font-semibold text-gray-900">Test Results:</span> {patient.testResults}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-10 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Doctor's Review</h2>
              <p className="text-gray-700">{patient.review}</p>
              <p className="italic text-gray-400 mt-4">— {patient.reviewedBy}</p>
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm">
            Scan a patient's QR code above to securely view their records here.
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;

'@
Set-Content -Path "src\pages\DoctorDashboard.jsx" -Value $content_1 -NoNewline
Write-Host "Updated src\pages\DoctorDashboard.jsx" -ForegroundColor Green

Write-Host "Done! Now run: npm run dev" -ForegroundColor Cyan