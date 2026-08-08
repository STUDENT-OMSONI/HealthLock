# Fix: real status-code error handling (401/403/404/500) + real server-side
# audit log for every QR scan attempt, written in the database

Write-Host "Applying patient-fetching fix + real audit logging..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "src\pages" | Out-Null
New-Item -ItemType Directory -Force -Path "server\models" | Out-Null
New-Item -ItemType Directory -Force -Path "server\routes" | Out-Null

$content_0 = @'
// Real backend auth helper.
//
// The frontend sends the Google credential to our own backend, which
// verifies it with Google, looks up (or creates) the user in the real
// database, and returns OUR OWN session token + the user's REAL role from
// the database. That token is then attached to every future API call so
// the backend can enforce permissions for real.

const USER_KEY = "healthlock_user";
const TOKEN_KEY = "healthlock_token";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Sends the raw Google ID token to the backend for real verification.
// Throws if the backend rejects it (e.g. suspended account, invalid token).
export async function loginWithGoogle(googleCredential) {
  const res = await fetch(`${API_BASE}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential: googleCredential }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

export function hasRole(...roles) {
  const user = getUser();
  return !!user && roles.includes(user.role);
}

// Helper for calling protected backend routes -- automatically attaches
// the real session token so the server can enforce role checks.
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status; // reliable status check, not fragile string matching
    throw err;
  }
  return data;
}

'@
Set-Content -Path "src\auth.js" -Value $content_0 -NoNewline
Write-Host "Updated src\auth.js" -ForegroundColor Green

$content_1 = @'
// Patient data store -- REAL backend now (Phase 4).
//
// Every function here calls the real Express + MongoDB API instead of
// localStorage. Function names are unchanged from before, but every
// function is now async (returns a Promise) since it's real network I/O --
// callers need to `await` these and handle loading/error states.

import { apiFetch } from "./auth";

// MongoDB documents use `_id`; the rest of the frontend (built before the
// real backend existed) expects `.id`. Normalizing here means every other
// file (Patients.jsx, DoctorDashboard.jsx, modals) keeps working unchanged.
function normalize(patient) {
  if (!patient) return patient;
  return { ...patient, id: patient._id };
}

export async function getPatients(query = "") {
  const qs = query ? `?q=${encodeURIComponent(query)}` : "";
  const data = await apiFetch(`/api/patients${qs}`);
  return data.patients.map(normalize);
}

export async function getPatientByToken(qrToken) {
  try {
    const data = await apiFetch(`/api/patients/by-token/${encodeURIComponent(qrToken)}`);
    return normalize(data.patient);
  } catch (err) {
    if (err.status === 404) return null; // genuinely no match -- not an error
    throw err; // 401/403/500 etc. are real problems the caller should show
  }
}

export async function addPatient(data) {
  const res = await apiFetch("/api/patients", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return normalize(res.patient);
}

export async function updatePatient(id, updates) {
  const res = await apiFetch(`/api/patients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return normalize(res.patient);
}

export async function deletePatient(id) {
  await apiFetch(`/api/patients/${id}`, { method: "DELETE" });
}

export async function addFileToPatient(id, file) {
  const res = await apiFetch(`/api/patients/${id}/files`, {
    method: "POST",
    body: JSON.stringify(file),
  });
  return normalize(res.patient);
}

'@
Set-Content -Path "src\patientStore.js" -Value $content_1 -NoNewline
Write-Host "Updated src\patientStore.js" -ForegroundColor Green

$content_2 = @'
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  User,
  FileText,
  ChevronDown,
  Users,
  ScanLine,
  CalendarClock,
  Stethoscope,
} from "lucide-react";
import QRScanner from "../Components/QRScanner";
import { getPatientByToken } from "../patientStore";
import { logAction } from "../auditStore";
import { useToast } from "../Components/Toast";
import { getUser } from "../auth";
import { useCountUp } from "../useCountUp";

function StatCard({ icon: Icon, label, value, color = "bg-red-600" }) {
  const animated = useCountUp(value);
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <span className={`w-11 h-11 rounded-full ${color} text-white flex items-center justify-center shrink-0`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="text-2xl font-extrabold text-gray-900">{animated}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </motion.div>
  );
}

function ExpandableSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-gray-500" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};

function DoctorDashboard() {
  const showToast = useToast();
  const doctor = getUser();
  const [currentPatient, setCurrentPatient] = useState(null);
  const [scannedList, setScannedList] = useState([]);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleScan = async (token) => {
    let patient;
    try {
      patient = await getPatientByToken(token);
    } catch (err) {
      if (err.status === 401) {
        showToast("Your session has expired. Please log in again.", "error");
      } else if (err.status === 403) {
        showToast("You don't have permission to view patient records.", "error");
      } else if (err.status === 500) {
        showToast("Server error -- please try scanning again.", "error");
      } else {
        showToast(err.message || "Could not reach the server.", "error");
      }
      return;
    }

    if (!patient) {
      showToast("This QR code doesn't match any patient on record.", "error");
      return;
    }

    setCurrentPatient(patient);

    setScannedList((list) => {
      const alreadyScanned = list.some((p) => p.id === patient.id);
      if (alreadyScanned) {
        showToast(`${patient.name} was already scanned in this session.`, "info");
        return list;
      }
      showToast(`${patient.name}'s records loaded successfully.`, "success");
      logAction("QR scan - patient accessed", patient.name);
      return [patient, ...list];
    });
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero welcome section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-red-900">
        <img
          src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1600&q=80"
          alt="Doctor with stethoscope"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-14 md:py-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-red-300 text-sm font-semibold mb-2">{today}</p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2">
              Welcome back, Dr. {doctor?.name?.split(" ")[0] || "Doctor"}
            </h1>
            <p className="text-gray-300 max-w-xl">
              Scan a patient's QR code below to securely access their records, or review who you've already seen today.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-12 space-y-8 md:space-y-10 -mt-8 relative z-10">
        {/* Animated stat cards */}
        <div className="grid sm:grid-cols-3 gap-5">
          <StatCard icon={ScanLine} label="Scanned This Session" value={scannedList.length} />
          <StatCard icon={Users} label="Unique Patients" value={new Set(scannedList.map((p) => p.id)).size} color="bg-gray-900" />
          <StatCard icon={CalendarClock} label="Encrypted Access" value={100} color="bg-gray-900" />
        </div>

        {/* QR Scanner */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="bg-white border border-gray-200 rounded-3xl p-5 md:p-10 shadow-sm"
        >
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-5 md:mb-6 text-center">
            Patient QR Scanner
          </h2>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 max-w-[300px] mx-auto">
            <QRScanner onDecode={handleScan} />
          </div>
        </motion.div>

        {/* Patient profile panel */}
        <AnimatePresence>
          {currentPatient && (
            <motion.div
              key={currentPatient.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-gray-200 rounded-3xl p-5 md:p-10 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                  <User size={22} />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{currentPatient.name}</h2>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <ShieldCheck size={14} /> Access granted via secure QR scan
                  </p>
                </div>
              </div>

              <ExpandableSection title="Overview" defaultOpen>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
                  <p><span className="font-semibold text-gray-900">Age:</span> {currentPatient.age}</p>
                  <p><span className="font-semibold text-gray-900">Gender:</span> {currentPatient.gender}</p>
                  <p><span className="font-semibold text-gray-900">Blood Group:</span> {currentPatient.bloodGroup}</p>
                  <p><span className="font-semibold text-gray-900">Contact:</span> {currentPatient.contact}</p>
                  <p className="sm:col-span-2"><span className="font-semibold text-gray-900">Diagnosis:</span> {currentPatient.diagnosis}</p>
                </div>
              </ExpandableSection>

              {currentPatient.medicalHistory && (
                <ExpandableSection title="Medical History">
                  <p className="text-sm text-gray-700">{currentPatient.medicalHistory}</p>
                </ExpandableSection>
              )}

              {currentPatient.files?.length > 0 && (
                <ExpandableSection title={`Uploaded Files (${currentPatient.files.length})`}>
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
                </ExpandableSection>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session scan list */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="bg-white border border-gray-200 rounded-3xl p-5 md:p-10 shadow-sm"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Stethoscope size={18} className="text-red-600" /> Patients Scanned This Session
          </h2>
          {scannedList.length === 0 ? (
            <p className="text-sm text-gray-400">Scan a patient's QR code above to add them here.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {scannedList.map((p) => (
                <motion.li
                  key={p.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setCurrentPatient(p)}
                  className="py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 px-2 rounded-lg"
                >
                  <span className="font-medium text-gray-900">{p.name}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">{p.diagnosis}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default DoctorDashboard;

'@
Set-Content -Path "src\pages\DoctorDashboard.jsx" -Value $content_2 -NoNewline
Write-Host "Updated src\pages\DoctorDashboard.jsx" -ForegroundColor Green

$content_3 = @'
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userEmail: String,
    userRole: String,
    action: { type: String, required: true }, // e.g. "QR_PATIENT_ACCESS"
    resource: String, // e.g. patient id, if applicable
    status: { type: String, enum: ["success", "failure"], required: true },
    details: String,
  },
  { timestamps: true } // createdAt = the real, server-side timestamp
);

export default mongoose.model("AuditLog", auditLogSchema);

'@
Set-Content -Path "server\models\AuditLog.js" -Value $content_3 -NoNewline
Write-Host "Updated server\models\AuditLog.js" -ForegroundColor Green

$content_4 = @'
import express from "express";
import crypto from "crypto";
import Patient from "../models/Patient.js";
import AuditLog from "../models/AuditLog.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Patient records are managed by hospital staff (Doctor/Admin), not by the
// Patient role directly -- a Patient role in this app is a portal account,
// separate from the hospital's internal patient database. Every route
// below requires Doctor or Admin; a Patient-role token gets a real 403.
router.use(requireAuth, requireRole("Doctor", "Admin"));

function generateQrToken() {
  return "HL-" + crypto.randomUUID();
}

// GET /api/patients - list all, with optional search
router.get("/", async (req, res) => {
  const { q } = req.query;
  const filter = q
    ? {
        $or: [
          { name: new RegExp(q, "i") },
          { diagnosis: new RegExp(q, "i") },
          { contact: new RegExp(q, "i") },
        ],
      }
    : {};
  const patients = await Patient.find(filter).sort({ createdAt: -1 });
  res.json({ patients });
});

// GET /api/patients/by-token/:qrToken - used by the Doctor QR scanner
router.get("/by-token/:qrToken", async (req, res) => {
  const patient = await Patient.findOne({ qrToken: req.params.qrToken });

  // Written server-side, right here, regardless of outcome -- this can't
  // be skipped or forged by the frontend, unlike a client-only audit log.
  await AuditLog.create({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: "QR_PATIENT_ACCESS",
    resource: patient ? patient._id.toString() : req.params.qrToken,
    status: patient ? "success" : "failure",
    details: patient ? `Accessed ${patient.name}` : "QR token did not match any patient",
  });

  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json({ patient });
});

// POST /api/patients - create, with a guaranteed-unique QR token
router.post("/", async (req, res) => {
  try {
    const patient = await Patient.create({
      ...req.body,
      qrToken: generateQrToken(),
      createdBy: req.user.id,
    });
    res.status(201).json({ patient });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/patients/:id - update
router.patch("/:id", async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json({ patient });
});

// DELETE /api/patients/:id
router.delete("/:id", async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json({ success: true });
});

// POST /api/patients/:id/files - add an uploaded file to a patient
router.post("/:id/files", async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  patient.files.push(req.body);
  await patient.save();
  res.json({ patient });
});

export default router;

'@
Set-Content -Path "server\routes\patients.js" -Value $content_4 -NoNewline
Write-Host "Updated server\routes\patients.js" -ForegroundColor Green

Write-Host "Done! Restart both terminals (backend + frontend)." -ForegroundColor Cyan