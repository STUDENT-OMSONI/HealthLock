# Full Patient Management System update
# Run this from inside your project folder in PowerShell

Write-Host "Applying full Patient Management update..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "src\Components" | Out-Null
New-Item -ItemType Directory -Force -Path "src\pages" | Out-Null

$content_0 = @'
import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import { ToastProvider } from "./Components/Toast.jsx";
import "./index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

'@
Set-Content -Path "src\main.jsx" -Value $content_0 -NoNewline
Write-Host "Updated src\main.jsx" -ForegroundColor Green

$content_1 = @'
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import ConsentManagement from "./pages/ConsentManagement";
import Patients from "./pages/Patients";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <Patients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consent"
          element={
            <ProtectedRoute>
              <ConsentManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;

'@
Set-Content -Path "src\App.jsx" -Value $content_1 -NoNewline
Write-Host "Updated src\App.jsx" -ForegroundColor Green

$content_2 = @'
// Patient data store.
//
// For now this uses the browser's localStorage as the "database" so the
// whole Patient Management flow (add/edit/delete/search, unique QR per
// patient, file uploads, doctor QR-scan lookup) works end-to-end without
// needing a separate backend server running.
//
// Swapping this out for a real Excel/DB-backed API later just means
// replacing the functions below with real fetch() calls -- everything
// that *uses* this store (Patients.jsx, DoctorDashboard.jsx) only calls
// these functions, so the rest of the app won't need to change.

const KEY = "healthlock_patients";

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}

function generateQrToken(existingTokens) {
  let token;
  do {
    token = "HL-" + uid();
  } while (existingTokens.has(token)); // guarantee uniqueness, just in case
  return token;
}

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getPatients() {
  return readAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getPatientByToken(token) {
  return readAll().find((p) => p.qrToken === token) || null;
}

export function getPatientById(id) {
  return readAll().find((p) => p.id === id) || null;
}

export function addPatient(data) {
  const list = readAll();
  const existingTokens = new Set(list.map((p) => p.qrToken));
  const now = new Date().toISOString();

  const patient = {
    id: uid(),
    qrToken: generateQrToken(existingTokens),
    name: data.name || "",
    age: data.age || "",
    gender: data.gender || "",
    contact: data.contact || "",
    bloodGroup: data.bloodGroup || "",
    diagnosis: data.diagnosis || "",
    medicalHistory: data.medicalHistory || "",
    description: data.description || "",
    files: [],
    createdAt: now,
    updatedAt: now,
  };

  list.push(patient);
  writeAll(list);
  return patient;
}

export function updatePatient(id, updates) {
  const list = readAll();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
  writeAll(list);
  return list[idx];
}

export function deletePatient(id) {
  writeAll(readAll().filter((p) => p.id !== id));
}

export function addFileToPatient(id, file) {
  const list = readAll();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  list[idx].files.push(file);
  list[idx].updatedAt = new Date().toISOString();
  writeAll(list);
  return list[idx];
}

export function removeFileFromPatient(id, fileId) {
  const list = readAll();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  list[idx].files = list[idx].files.filter((f) => f.id !== fileId);
  list[idx].updatedAt = new Date().toISOString();
  writeAll(list);
  return list[idx];
}

'@
Set-Content -Path "src\patientStore.js" -Value $content_2 -NoNewline
Write-Host "Updated src\patientStore.js" -ForegroundColor Green

$content_3 = @'
import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] space-y-2 w-[calc(100%-2.5rem)] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
              t.type === "error"
                ? "bg-red-600"
                : t.type === "info"
                ? "bg-gray-900"
                : "bg-green-600"
            }`}
          >
            {t.type === "error" ? (
              <XCircle size={18} className="shrink-0 mt-0.5" />
            ) : t.type === "info" ? (
              <Info size={18} className="shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

'@
Set-Content -Path "src\Components\Toast.jsx" -Value $content_3 -NoNewline
Write-Host "Updated src\Components\Toast.jsx" -ForegroundColor Green

$content_4 = @'
import React, { useRef, useState } from "react";
import { X, UploadCloud, FileText, Image as ImageIcon, Trash2 } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB - localStorage-friendly limit
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

function readFileAsDataUrl(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PatientFormModal({ initialData, onClose, onSubmit }) {
  const isEdit = !!initialData;
  const [form, setForm] = useState({
    name: initialData?.name || "",
    age: initialData?.age || "",
    gender: initialData?.gender || "",
    contact: initialData?.contact || "",
    bloodGroup: initialData?.bloodGroup || "",
    diagnosis: initialData?.diagnosis || "",
    medicalHistory: initialData?.medicalHistory || "",
    description: initialData?.description || "",
  });
  const [errors, setErrors] = useState({});
  const [pendingFiles, setPendingFiles] = useState([]); // files added in this session
  const [uploadProgress, setUploadProgress] = useState(null);
  const fileInputRef = useRef(null);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.age) e.age = "Age is required";
    else if (isNaN(form.age) || form.age < 0 || form.age > 120)
      e.age = "Enter a valid age (0-120)";
    if (!form.gender) e.gender = "Select a gender";
    if (!form.contact.trim()) e.contact = "Contact number is required";
    else if (!/^\d{10}$/.test(form.contact.trim()))
      e.contact = "Enter a valid 10-digit contact number";
    if (!form.bloodGroup) e.bloodGroup = "Select a blood group";
    if (!form.diagnosis.trim()) e.diagnosis = "Diagnosis is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrors((er) => ({ ...er, file: "Only PDF, JPG, or PNG files are allowed" }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((er) => ({ ...er, file: "File must be smaller than 2MB" }));
      return;
    }
    setErrors((er) => ({ ...er, file: undefined }));
    setUploadProgress(0);
    try {
      const dataUrl = await readFileAsDataUrl(file, setUploadProgress);
      setPendingFiles((pf) => [
        ...pf,
        {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2),
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
          uploadedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePendingFile = (id) => {
    setPendingFiles((pf) => pf.filter((f) => f.id !== id));
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form, pendingFiles);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? "Edit Patient" : "Add New Patient"}
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border ${errors.name ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                placeholder="e.g. David Schulz"
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Age *</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setField("age", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border ${errors.age ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                placeholder="e.g. 32"
              />
              {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Gender *</label>
              <select
                value={form.gender}
                onChange={(e) => setField("gender", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border ${errors.gender ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500 bg-white`}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-xs text-red-600 mt-1">{errors.gender}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number *</label>
              <input
                type="tel"
                value={form.contact}
                onChange={(e) => setField("contact", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border ${errors.contact ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                placeholder="10-digit number"
              />
              {errors.contact && <p className="text-xs text-red-600 mt-1">{errors.contact}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Group *</label>
              <select
                value={form.bloodGroup}
                onChange={(e) => setField("bloodGroup", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border ${errors.bloodGroup ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500 bg-white`}
              >
                <option value="">Select</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
              {errors.bloodGroup && <p className="text-xs text-red-600 mt-1">{errors.bloodGroup}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Diagnosis *</label>
              <input
                type="text"
                value={form.diagnosis}
                onChange={(e) => setField("diagnosis", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border ${errors.diagnosis ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                placeholder="e.g. Viral Infection"
              />
              {errors.diagnosis && <p className="text-xs text-red-600 mt-1">{errors.diagnosis}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Medical History</label>
            <textarea
              value={form.medicalHistory}
              onChange={(e) => setField("medicalHistory", e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Past conditions, allergies, ongoing medication..."
            />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Upload Report / Prescription / Image
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-800 transition-colors"
              >
                <UploadCloud size={16} /> Choose file
              </button>
              <span className="text-xs text-gray-400">PDF, JPG, PNG — max 2MB</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />
            {errors.file && <p className="text-xs text-red-600 mt-1">{errors.file}</p>}

            {uploadProgress !== null && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-600 h-2 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            {pendingFiles.length > 0 && (
              <ul className="mt-3 space-y-2">
                {pendingFiles.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                    {f.type.startsWith("image/") ? (
                      <img src={f.dataUrl} alt={f.name} className="w-10 h-10 object-cover rounded-lg" />
                    ) : (
                      <span className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg text-gray-500">
                        <FileText size={18} />
                      </span>
                    )}
                    <span className="text-sm text-gray-700 truncate flex-1">{f.name}</span>
                    <button type="button" onClick={() => removePendingFile(f.id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description / Notes</label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Any additional notes about this patient or the uploaded file..."
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            {isEdit ? "Save Changes" : "Add Patient"}
          </button>
        </div>
      </div>
    </div>
  );
}

'@
Set-Content -Path "src\Components\PatientFormModal.jsx" -Value $content_4 -NoNewline
Write-Host "Updated src\Components\PatientFormModal.jsx" -ForegroundColor Green

$content_5 = @'
import React, { useRef } from "react";
import { X, FileText, Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
}

export default function PatientDetailModal({ patient, onClose }) {
  const qrRef = useRef(null);

  const handleDownloadQr = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${patient.name.replace(/\s+/g, "_")}_QR.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-bold text-gray-900">Patient Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 grid md:grid-cols-3 gap-6">
          {/* QR + core info */}
          <div className="md:col-span-1 flex flex-col items-center text-center border border-gray-200 rounded-2xl p-5 h-fit">
            <div ref={qrRef} className="bg-white p-3 rounded-xl border border-gray-200">
              <QRCodeCanvas value={patient.qrToken} size={160} />
            </div>
            <button
              onClick={handleDownloadQr}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
            >
              <Download size={14} /> Download QR
            </button>
            <p className="text-xs text-gray-400 mt-3 break-all">{patient.qrToken}</p>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-2xl font-extrabold text-gray-900">{patient.name}</h3>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <p><span className="font-semibold text-gray-900">Patient ID:</span> <span className="text-gray-600">{patient.id}</span></p>
              <p><span className="font-semibold text-gray-900">Age:</span> <span className="text-gray-600">{patient.age}</span></p>
              <p><span className="font-semibold text-gray-900">Gender:</span> <span className="text-gray-600">{patient.gender}</span></p>
              <p><span className="font-semibold text-gray-900">Contact:</span> <span className="text-gray-600">{patient.contact}</span></p>
              <p><span className="font-semibold text-gray-900">Blood Group:</span> <span className="text-gray-600">{patient.bloodGroup}</span></p>
              <p><span className="font-semibold text-gray-900">Diagnosis:</span> <span className="text-gray-600">{patient.diagnosis}</span></p>
            </div>

            {patient.medicalHistory && (
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Medical History</p>
                <p className="text-gray-600 text-sm bg-gray-50 border border-gray-200 rounded-xl p-3">{patient.medicalHistory}</p>
              </div>
            )}

            {patient.description && (
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Description / Notes</p>
                <p className="text-gray-600 text-sm bg-gray-50 border border-gray-200 rounded-xl p-3">{patient.description}</p>
              </div>
            )}

            <div>
              <p className="font-semibold text-gray-900 text-sm mb-2">Uploaded Files</p>
              {patient.files && patient.files.length > 0 ? (
                <ul className="space-y-2">
                  {patient.files.map((f) => (
                    <li key={f.id} className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                      {f.type.startsWith("image/") ? (
                        <img src={f.dataUrl} alt={f.name} className="w-10 h-10 object-cover rounded-lg" />
                      ) : (
                        <span className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg text-gray-500">
                          <FileText size={18} />
                        </span>
                      )}
                      <a
                        href={f.dataUrl}
                        download={f.name}
                        className="text-sm text-red-600 font-medium hover:underline truncate flex-1"
                      >
                        {f.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No files uploaded yet.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400 pt-2 border-t border-gray-100">
              <span>Created: {formatDate(patient.createdAt)}</span>
              <span>Last Updated: {formatDate(patient.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'@
Set-Content -Path "src\Components\PatientDetailModal.jsx" -Value $content_5 -NoNewline
Write-Host "Updated src\Components\PatientDetailModal.jsx" -ForegroundColor Green

$content_6 = @'
import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, AlertTriangle, RefreshCw, Camera } from "lucide-react";

export default function QRScanner({ onDecode }) {
  const idRef = useRef("qr-reader-" + Math.random().toString(36).slice(2));
  const html5QrRef = useRef(null);

  // Keep the latest onDecode callback in a ref so the camera effect below
  // doesn't need to depend on it -- otherwise a new inline function from
  // the parent on every render would restart the camera constantly.
  const onDecodeRef = useRef(onDecode);
  onDecodeRef.current = onDecode;

  const [status, setStatus] = useState("starting"); // starting | scanning | success | camera-error
  const [scannedValue, setScannedValue] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("starting");
    setScannedValue(null);

    const html5QrCode = new Html5Qrcode(idRef.current);
    html5QrRef.current = html5QrCode;

    const onScanSuccess = (decodedText) => {
      if (cancelled) return;
      setStatus("success");
      setScannedValue(decodedText);
      onDecodeRef.current?.(decodedText);
      html5QrCode.stop().catch(() => {});
    };

    const onScanFailure = () => {
      // Called continuously while no QR code is in view -- this is normal
      // and not an actual error, so we intentionally do nothing here.
    };

    const config = { fps: 10, qrbox: { width: 240, height: 240 } };

    // Try the back/rear camera first (best for scanning on phones).
    html5QrCode
      .start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure)
      .then(() => {
        if (!cancelled) setStatus("scanning");
      })
      .catch(() => {
        // No rear camera (common on laptops) -- fall back to any camera.
        Html5Qrcode.getCameras()
          .then((devices) => {
            if (cancelled) return;
            if (!devices || devices.length === 0) {
              setStatus("camera-error");
              return;
            }
            html5QrCode
              .start(devices[0].id, config, onScanSuccess, onScanFailure)
              .then(() => {
                if (!cancelled) setStatus("scanning");
              })
              .catch(() => {
                if (!cancelled) setStatus("camera-error");
              });
          })
          .catch(() => {
            if (!cancelled) setStatus("camera-error");
          });
      });

    return () => {
      cancelled = true;
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const handleScanAgain = () => setResetKey((k) => k + 1);

  return (
    <div>
      {status === "success" ? (
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
      ) : status === "camera-error" ? (
        <div className="text-center py-8">
          <AlertTriangle className="mx-auto text-yellow-600 mb-3" size={40} />
          <p className="font-semibold text-gray-900">Camera not available</p>
          <p className="text-xs text-gray-500 mt-1 px-4">
            Allow camera permission in your browser's address bar, close any
            other app/tab using the camera, and make sure you're on
            http://localhost (or HTTPS) -- browsers block camera access
            otherwise.
          </p>
          <button
            onClick={handleScanAgain}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
          >
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      ) : (
        <>
          {status === "starting" && (
            <p className="text-xs text-gray-400 text-center mb-2 flex items-center justify-center gap-1">
              <Camera size={14} className="animate-pulse" /> Requesting camera access...
            </p>
          )}
          <style>{`
            #${idRef.current} video,
            #${idRef.current} canvas,
            #${idRef.current} img {
              width: 100% !important;
              height: auto !important;
              max-width: 280px;
              border-radius: 16px;
              margin: 0 auto;
              display: block;
            }
            #${idRef.current} {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            #${idRef.current} select,
            #${idRef.current} button {
              max-width: 100%;
              font-size: 12px;
            }
          `}</style>
          <div
            id={idRef.current}
            className="w-full max-w-[280px] mx-auto overflow-hidden rounded-2xl"
          />
          <p className="text-xs text-gray-500 mt-2 text-center">
            Point the camera at the patient's QR code to securely load their records.
          </p>
        </>
      )}
    </div>
  );
}

'@
Set-Content -Path "src\Components\QRScanner.jsx" -Value $content_6 -NoNewline
Write-Host "Updated src\Components\QRScanner.jsx" -ForegroundColor Green

$content_7 = @'
import React, { useRef, useState, useEffect } from "react";
import { UploadCloud, FileText, Trash2 } from "lucide-react";
import { useToast } from "./Toast";

const STORAGE_KEY = "healthlock_my_files";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStored(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function readFileAsDataUrl(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function FileUpload() {
  const showToast = useToast();
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    setFiles(readStored());
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only PDF, JPG, or PNG files are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File must be smaller than 2MB.");
      return;
    }
    setError("");
    setProgress(0);

    try {
      const dataUrl = await readFileAsDataUrl(file, setProgress);
      const entry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
        description,
        uploadedAt: new Date().toISOString(),
      };
      const updated = [entry, ...files];
      setFiles(updated);
      writeStored(updated);
      setDescription("");
      showToast("File uploaded successfully!", "success");
    } catch {
      showToast("Upload failed. Please try again.", "error");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = (id) => {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    writeStored(updated);
    showToast("File removed.", "info");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
        >
          <UploadCloud size={16} /> Choose file
        </button>
        <span className="text-xs text-gray-400">PDF, JPG, PNG — max 2MB</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        className="hidden"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}

      {progress !== null && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-red-600 h-2 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Description / Notes</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Add a note about this file before uploading (optional)..."
          className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-2 pt-2">
          {files.map((f) => (
            <li key={f.id} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
              {f.type.startsWith("image/") ? (
                <img src={f.dataUrl} alt={f.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
              ) : (
                <span className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg text-gray-500 shrink-0">
                  <FileText size={18} />
                </span>
              )}
              <div className="flex-1 min-w-0">
                <a href={f.dataUrl} download={f.name} className="text-sm font-medium text-red-600 hover:underline truncate block">
                  {f.name}
                </a>
                {f.description && <p className="text-xs text-gray-500 mt-0.5">{f.description}</p>}
              </div>
              <button onClick={() => handleDelete(f.id)} className="text-gray-400 hover:text-red-600 shrink-0">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FileUpload;

'@
Set-Content -Path "src\Components\FileUpload.jsx" -Value $content_7 -NoNewline
Write-Host "Updated src\Components\FileUpload.jsx" -ForegroundColor Green

$content_8 = @'
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { getUser, clearUser } from "../auth";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getUser());
  const [menuOpen, setMenuOpen] = useState(false);

  // Re-check login state whenever the route changes (e.g. right after login)
  useEffect(() => {
    setUser(getUser());
    setMenuOpen(false); // close mobile menu on navigation
  }, [location]);

  const handleLogout = () => {
    clearUser();
    setUser(null);
    navigate("/");
  };

  const navLinks = (
    <>
      <Link to="/dashboard" className="hover:text-red-600 transition-colors">Dashboard</Link>
      <Link to="/patients" className="hover:text-red-600 transition-colors">Patients</Link>
      <Link to="/doctor" className="hover:text-red-600 transition-colors">Doctor</Link>
      <Link to="/consent" className="hover:text-red-600 transition-colors">Consent</Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" onClick={() => setMenuOpen(false)}>
          <Logo size="text-lg md:text-2xl" />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          {navLinks}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                {user.picture && (
                  <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                )}
                <span className="text-sm font-semibold text-gray-800 max-w-[120px] truncate">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-full font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2.5 rounded-full font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger button */}
        <button
          className="md:hidden p-2 text-gray-700"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 pb-5 pt-2 space-y-4">
          <div className="flex flex-col gap-3 text-gray-700 font-medium text-base pt-2">
            {navLinks}
          </div>

          <div className="border-t border-gray-200 pt-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {user.picture && (
                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                  )}
                  <span className="text-sm font-semibold text-gray-800 truncate">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-5 py-2.5 rounded-full font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full px-5 py-2.5 rounded-full font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="w-full px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

'@
Set-Content -Path "src\Components\Navbar.jsx" -Value $content_8 -NoNewline
Write-Host "Updated src\Components\Navbar.jsx" -ForegroundColor Green

$content_9 = @'
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, ShieldCheck, Lock } from "lucide-react";
import Logo from "./Logo";

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-14 pb-8 px-6 md:px-16">
      <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-10 mb-14 text-gray-400">
        <div className="flex flex-col items-center gap-2 text-xs font-semibold">
          <ShieldCheck size={32} />
          256-BIT
          <br />
          ENCRYPTION
        </div>
        <div className="flex flex-col items-center gap-2 text-xs font-semibold">
          <Lock size={32} />
          END-TO-END
          <br />
          ENCRYPTED
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-200 pt-8">
        <Logo />
        <div className="flex flex-wrap gap-6 text-sm font-semibold text-gray-700">
          <Link to="/about" className="hover:text-red-600 transition-colors">About Us</Link>
          <Link to="/privacy" className="hover:text-red-600 transition-colors">Privacy</Link>
          <Link to="/contact" className="hover:text-red-600 transition-colors">Contact</Link>
        </div>
        <div className="flex gap-4 text-gray-400">
          <Facebook size={18} />
          <Instagram size={18} />
          <Twitter size={18} />
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        © 2026 HealthLock. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;

'@
Set-Content -Path "src\Components\Footer.jsx" -Value $content_9 -NoNewline
Write-Host "Updated src\Components\Footer.jsx" -ForegroundColor Green

$content_10 = @'
import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Eye, Pencil, Trash2, Users } from "lucide-react";
import {
  getPatients,
  addPatient,
  updatePatient,
  deletePatient,
} from "../patientStore";
import PatientFormModal from "../Components/PatientFormModal";
import PatientDetailModal from "../Components/PatientDetailModal";
import { useToast } from "../Components/Toast";

export default function Patients() {
  const showToast = useToast();
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const refresh = () => setPatients(getPatients());

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.diagnosis.toLowerCase().includes(q) ||
        p.contact.includes(q);
      const matchesGender = !genderFilter || p.gender === genderFilter;
      return matchesQuery && matchesGender;
    });
  }, [patients, query, genderFilter]);

  const handleAddClick = () => {
    setEditingPatient(null);
    setFormOpen(true);
  };

  const handleEditClick = (patient) => {
    setEditingPatient(patient);
    setFormOpen(true);
  };

  const handleFormSubmit = (formData, pendingFiles) => {
    if (editingPatient) {
      const updated = updatePatient(editingPatient.id, {
        ...formData,
        files: [...editingPatient.files, ...pendingFiles],
      });
      showToast(updated ? "Patient updated successfully" : "Update failed", updated ? "success" : "error");
    } else {
      const created = addPatient(formData);
      if (pendingFiles.length > 0) {
        updatePatient(created.id, { files: pendingFiles });
      }
      showToast(`Patient added with a unique QR code`, "success");
    }
    setFormOpen(false);
    setEditingPatient(null);
    refresh();
  };

  const handleDeleteConfirmed = (id) => {
    deletePatient(id);
    setConfirmDeleteId(null);
    showToast("Patient deleted", "info");
    refresh();
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
              <Users size={20} />
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Patient Management</h1>
              <p className="text-gray-500 text-sm">{patients.length} patient{patients.length !== 1 ? "s" : ""} on record</p>
            </div>
          </div>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
          >
            <Plus size={18} /> Add Patient
          </button>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, diagnosis, or contact..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded-3xl">
            <Users className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium">
              {patients.length === 0 ? "No patients added yet." : "No patients match your search."}
            </p>
            {patients.length === 0 && (
              <button
                onClick={handleAddClick}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <Plus size={16} /> Add your first patient
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table on larger screens */}
            <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Age</th>
                    <th className="px-5 py-3">Gender</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Blood Group</th>
                    <th className="px-5 py-3">Diagnosis</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3 font-semibold text-gray-900">{p.name}</td>
                      <td className="px-5 py-3 text-gray-600">{p.age}</td>
                      <td className="px-5 py-3 text-gray-600">{p.gender}</td>
                      <td className="px-5 py-3 text-gray-600">{p.contact}</td>
                      <td className="px-5 py-3 text-gray-600">{p.bloodGroup}</td>
                      <td className="px-5 py-3 text-gray-600">{p.diagnosis}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setViewingPatient(p)} title="View" className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleEditClick(p)} title="Edit" className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => setConfirmDeleteId(p.id)} title="Delete" className="p-2 rounded-full hover:bg-red-50 text-red-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards on mobile */}
            <div className="md:hidden space-y-4">
              {filtered.map((p) => (
                <div key={p.id} className="border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.age} yrs · {p.gender} · {p.bloodGroup}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setViewingPatient(p)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleEditClick(p)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setConfirmDeleteId(p.id)} className="p-2 rounded-full hover:bg-red-50 text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600"><span className="font-semibold text-gray-800">Contact:</span> {p.contact}</p>
                  <p className="text-sm text-gray-600"><span className="font-semibold text-gray-800">Diagnosis:</span> {p.diagnosis}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {formOpen && (
        <PatientFormModal
          initialData={editingPatient}
          onClose={() => {
            setFormOpen(false);
            setEditingPatient(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}

      {viewingPatient && (
        <PatientDetailModal patient={viewingPatient} onClose={() => setViewingPatient(null)} />
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <p className="font-bold text-gray-900 mb-2">Delete this patient?</p>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-5 py-2.5 rounded-full font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirmed(confirmDeleteId)}
                className="px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'@
Set-Content -Path "src\pages\Patients.jsx" -Value $content_10 -NoNewline
Write-Host "Updated src\pages\Patients.jsx" -ForegroundColor Green

$content_11 = @'
import React, { useState } from "react";
import { ShieldCheck, User, FileText } from "lucide-react";
import QRScanner from "../Components/QRScanner";
import { getPatientByToken } from "../patientStore";
import { useToast } from "../Components/Toast";

function DoctorDashboard() {
  const showToast = useToast();
  const [currentPatient, setCurrentPatient] = useState(null);
  const [scannedList, setScannedList] = useState([]); // patients scanned this session

  const handleScan = (token) => {
    const patient = getPatientByToken(token);

    if (!patient) {
      showToast("QR code not recognized -- no matching patient found.", "error");
      return;
    }

    setCurrentPatient(patient);

    setScannedList((list) => {
      const alreadyScanned = list.some((p) => p.id === patient.id);
      if (alreadyScanned) {
        showToast(`${patient.name} was already scanned in this session.`, "info");
        return list; // no duplicate entry
      }
      showToast(`${patient.name}'s records loaded successfully.`, "success");
      return [patient, ...list];
    });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1600&q=80"
          alt="Doctor with stethoscope"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center">
          <h1 className="text-2xl md:text-5xl font-extrabold text-white px-6 md:px-16">
            Doctor Dashboard
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-12 space-y-8 md:space-y-10">
        {/* QR Scanner - constrained width so the camera never looks oversized */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-10 shadow-sm">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-5 md:mb-6 text-center">
            Patient QR Scanner
          </h2>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 max-w-[300px] mx-auto">
            <QRScanner onDecode={handleScan} />
          </div>
        </div>

        {/* Currently viewed patient */}
        {currentPatient && (
          <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                <User size={20} />
              </span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentPatient.name}</h2>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <ShieldCheck size={14} /> Access granted via secure QR scan
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700 mb-4">
              <p><span className="font-semibold text-gray-900">Age:</span> {currentPatient.age}</p>
              <p><span className="font-semibold text-gray-900">Gender:</span> {currentPatient.gender}</p>
              <p><span className="font-semibold text-gray-900">Blood Group:</span> {currentPatient.bloodGroup}</p>
              <p><span className="font-semibold text-gray-900">Contact:</span> {currentPatient.contact}</p>
              <p className="sm:col-span-2"><span className="font-semibold text-gray-900">Diagnosis:</span> {currentPatient.diagnosis}</p>
              {currentPatient.medicalHistory && (
                <p className="sm:col-span-2"><span className="font-semibold text-gray-900">Medical History:</span> {currentPatient.medicalHistory}</p>
              )}
            </div>
            {currentPatient.files?.length > 0 && (
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-2">Uploaded Files</p>
                <ul className="space-y-2">
                  {currentPatient.files.map((f) => (
                    <li key={f.id} className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 rounded-xl p-2">
                      <FileText size={16} className="text-gray-500 shrink-0" />
                      <a href={f.dataUrl} download={f.name} className="text-red-600 hover:underline truncate">
                        {f.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Session scan list */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 md:p-10 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Patients Scanned This Session</h2>
          {scannedList.length === 0 ? (
            <p className="text-sm text-gray-400">Scan a patient's QR code above to add them here.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {scannedList.map((p) => (
                <li
                  key={p.id}
                  onClick={() => setCurrentPatient(p)}
                  className="py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 px-2 rounded-lg"
                >
                  <span className="font-medium text-gray-900">{p.name}</span>
                  <span className="text-xs text-gray-500">{p.diagnosis}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;

'@
Set-Content -Path "src\pages\DoctorDashboard.jsx" -Value $content_11 -NoNewline
Write-Host "Updated src\pages\DoctorDashboard.jsx" -ForegroundColor Green

$content_12 = @'
import React from "react";

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">About HealthLock</h1>
      <p className="text-gray-600 leading-relaxed">
        HealthLock is a secure health record platform built to give patients
        full ownership of their medical data -- prescriptions, reports, and
        consultation history, all encrypted and shared only with the people
        they choose.
      </p>
    </div>
  );
}

'@
Set-Content -Path "src\pages\About.jsx" -Value $content_12 -NoNewline
Write-Host "Updated src\pages\About.jsx" -ForegroundColor Green

$content_13 = @'
import React from "react";

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Privacy Policy</h1>
      <p className="text-gray-600 leading-relaxed">
        We store your health records securely and never share them without
        your explicit consent. You control exactly who can access your data
        at all times through the Consent Management page.
      </p>
    </div>
  );
}

'@
Set-Content -Path "src\pages\Privacy.jsx" -Value $content_13 -NoNewline
Write-Host "Updated src\pages\Privacy.jsx" -ForegroundColor Green

$content_14 = @'
import React from "react";

export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Contact Us</h1>
      <p className="text-gray-600 leading-relaxed">
        Have a question or need support? Reach out to our team and we'll get
        back to you as soon as possible.
      </p>
    </div>
  );
}

'@
Set-Content -Path "src\pages\Contact.jsx" -Value $content_14 -NoNewline
Write-Host "Updated src\pages\Contact.jsx" -ForegroundColor Green

Write-Host "Done! Now run: npm run dev" -ForegroundColor Cyan