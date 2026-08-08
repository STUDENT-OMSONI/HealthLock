# Video background + animations + real drag-drop file upload + medical timeline

Write-Host "Applying video/animation/upload/timeline update..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "src\Components" | Out-Null
New-Item -ItemType Directory -Force -Path "src\pages" | Out-Null

$content_0 = @'
{
  "name": "healthlock",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@react-oauth/google": "^0.13.5",
    "@tailwindcss/vite": "^4.1.12",
    "axios": "^1.11.0",
    "framer-motion": "^12.43.0",
    "html5-qrcode": "^2.3.8",
    "i18next": "^25.4.0",
    "jwt-decode": "^4.0.0",
    "lucide-react": "^0.540.0",
    "qrcode.react": "^4.2.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-i18next": "^15.7.1",
    "react-router-dom": "^7.8.1",
    "recharts": "^3.10.1",
    "tailwindcss": "^4.1.12"
  },
  "devDependencies": {
    "@eslint/js": "^9.33.0",
    "@types/react": "^19.1.10",
    "@types/react-dom": "^19.1.7",
    "@vitejs/plugin-react": "^5.0.0",
    "eslint": "^9.33.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.3.0",
    "vite": "^7.1.2"
  }
}

'@
Set-Content -Path "package.json" -Value $content_0 -NoNewline
Write-Host "Updated package.json" -ForegroundColor Green

$content_1 = @'
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock as LockIcon,
  FileCheck2,
  Link2,
  Search,
  Bell,
  MessageSquare,
  ShieldPlus,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      {/* Hero with real background video (Pexels, free license, no attribution required) */}
      <section className="relative min-h-[75vh] flex items-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="https://videos.pexels.com/video-files/8413486/8413486-uhd_2560_1440_25fps.mp4"
          poster="https://images.pexels.com/videos/8413486/adult-business-computer-connection-8413486.jpeg?auto=compress&w=1600"
          autoPlay
          loop
          muted
          playsInline
        >
          {/* Fallback image shown if video can't load/play */}
          <img
            src="https://images.unsplash.com/photo-1723189518215-40ca2397edd9?auto=format&fit=crop&w=1600&q=80"
            alt="Person checking health records"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="relative z-10 max-w-3xl px-6 md:px-16 text-white"
        >
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
            Don't visit the doctor without <span className="text-red-500">HealthLock.</span>
          </h1>
          <p className="text-lg text-gray-200 mb-8 max-w-xl">
            Every prescription, report, and consultation — encrypted end-to-end,
            organized in one place, and shared only with the people you choose.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-3 rounded-full font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg transition-colors hover:scale-105 duration-200"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 rounded-full font-bold text-white bg-white/10 border border-white/40 hover:bg-white/20 backdrop-blur transition-colors"
            >
              Sign In
            </button>
          </div>
        </motion.div>
      </section>

      {/* Pillars */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="py-20 px-6 md:px-16 text-center"
      >
        <h2 className="text-3xl md:text-4xl font-extrabold text-red-600 mb-14">
          Take control of your health data.
        </h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          <div className="border-b-4 border-red-600 pb-4">
            <h3 className="text-2xl font-bold text-red-600 mb-2">Access</h3>
            <p className="text-gray-500">
              Every report and prescription organized in one secure dashboard.
            </p>
          </div>
          <div className="border-b-4 border-gray-800 pb-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Control</h3>
            <p className="text-gray-500">
              You decide exactly who can view your records, and for how long.
            </p>
          </div>
          <div className="border-b-4 border-gray-800 pb-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Privacy</h3>
            <p className="text-gray-500">
              End-to-end encryption keeps your data safe from unauthorized access.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Problem section */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="grid md:grid-cols-2 min-h-[420px]"
      >
        <div className="flex flex-col justify-center px-8 md:px-16 py-14 bg-gray-50">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-5">
            Ever had a report go missing right when you needed it?
          </h2>
          <p className="text-gray-600 text-lg max-w-md">
            Paper prescriptions get lost, old reports pile up, and doctors don't
            always have your full history. HealthLock keeps everything backed up
            and instantly shareable — even in an emergency.
          </p>
        </div>
        <div className="relative min-h-[280px]">
          <img
            src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80"
            alt="Doctor with stethoscope"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </motion.section>

      {/* Stat cards */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="py-20 px-6 md:px-16 bg-gray-50"
      >
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-6">
          <div className="bg-red-600 text-white rounded-2xl p-8 text-center shadow-sm">
            <ShieldCheck className="mx-auto mb-3" size={32} />
            <p className="text-2xl font-extrabold">256-bit</p>
            <p className="text-sm font-medium opacity-90">Encrypted storage</p>
          </div>
          <div className="bg-gray-900 text-white rounded-2xl p-8 text-center shadow-sm">
            <LockIcon className="mx-auto mb-3" size={32} />
            <p className="text-2xl font-extrabold">You Own It</p>
            <p className="text-sm font-medium opacity-90">Full access control</p>
          </div>
          <div className="bg-gray-900 text-white rounded-2xl p-8 text-center shadow-sm">
            <FileCheck2 className="mx-auto mb-3" size={32} />
            <p className="text-2xl font-extrabold">Instant Share</p>
            <p className="text-sm font-medium opacity-90">Secure QR access for doctors</p>
          </div>
        </div>
      </motion.section>

      {/* How it works */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="py-20 px-6 md:px-16 text-center"
      >
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-14">
          How HealthLock works
        </h2>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-10 text-left">
          <div>
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 text-white mb-4">
              <Link2 size={22} />
            </span>
            <h4 className="font-bold text-gray-900 mb-1">Connect</h4>
            <p className="text-gray-500 text-sm">
              Create your account and add your health records in minutes.
            </p>
          </div>
          <div>
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 text-white mb-4">
              <Search size={22} />
            </span>
            <h4 className="font-bold text-gray-900 mb-1">Organize</h4>
            <p className="text-gray-500 text-sm">
              Every report, prescription, and visit stored in one dashboard.
            </p>
          </div>
          <div>
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 text-white mb-4">
              <MessageSquare size={22} />
            </span>
            <h4 className="font-bold text-gray-900 mb-1">Share via QR</h4>
            <p className="text-gray-500 text-sm">
              Generate a secure QR code so your doctor can access what they need.
            </p>
          </div>
          <div>
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 text-white mb-4">
              <ShieldPlus size={22} />
            </span>
            <h4 className="font-bold text-gray-900 mb-1">Stay Protected</h4>
            <p className="text-gray-500 text-sm">
              Track every access with logs, and revoke consent anytime.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Benefits */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="py-20 px-6 md:px-16 bg-gray-50"
      >
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-14">
          Member Benefits
        </h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-x-16 gap-y-10">
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Secure Record Vault</h4>
            <p className="text-gray-600 text-sm">
              Upload prescriptions, lab reports, and scans — all encrypted and
              stored in one place you control.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Consent Management</h4>
            <p className="text-gray-600 text-sm">
              Grant or revoke access for doctors, pharmacists, and diagnostic
              centers whenever you choose.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">QR-Based Sharing</h4>
            <p className="text-gray-600 text-sm">
              Generate a one-time QR code so a doctor can instantly pull up your
              relevant records during a visit.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Access Logs</h4>
            <p className="text-gray-600 text-sm">
              See exactly who viewed your records and when — full transparency,
              always.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Health Record History</h4>
            <p className="text-gray-600 text-sm">
              A complete, chronological view of your diagnoses, prescriptions,
              and doctor visits.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">Doctor Dashboard</h4>
            <p className="text-gray-600 text-sm">
              Doctors get a dedicated view to scan, review, and log consultations
              securely.
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default Home;

'@
Set-Content -Path "src\pages\Home.jsx" -Value $content_1 -NoNewline
Write-Host "Updated src\pages\Home.jsx" -ForegroundColor Green

$content_2 = @'
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, CalendarCheck, ShieldCheck } from "lucide-react";
import FileUpload from "../Components/FileUpload";
import QRGenerator from "../Components/QRGenerator";
import AccessLogs from "../Components/AccessLogs";
import HealthHistory from "../Components/HealthHistory";
import { useCountUp } from "../useCountUp";
import { getAppointments } from "../appointmentStore";

function StatCard({ icon: Icon, label, value }) {
  const animated = useCountUp(value);
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
        <Icon size={20} />
      </span>
      <div>
        <p className="text-2xl font-extrabold text-gray-900">{animated}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

function Dashboard() {
  const [fileCount, setFileCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);

  useEffect(() => {
    try {
      const files = JSON.parse(localStorage.getItem("healthlock_my_files") || "[]");
      setFileCount(files.length);
    } catch {
      setFileCount(0);
    }
    setAppointmentCount(getAppointments().length);
  }, []);

  const cards = [
    { component: FileUpload, title: "File Upload" },
    { component: QRGenerator, title: "QR Generator" },
    { component: HealthHistory, title: "Health Record History" },
    { component: AccessLogs, title: "Access Logs" },
  ];

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
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-extrabold text-white px-6 md:px-16"
          >
            Patient Dashboard
          </motion.h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 space-y-10">
        {/* Real animated stat cards */}
        <div className="grid sm:grid-cols-3 gap-5">
          <StatCard icon={FileText} label="Files Uploaded" value={fileCount} />
          <StatCard icon={CalendarCheck} label="Appointments" value={appointmentCount} />
          <StatCard icon={ShieldCheck} label="Encryption" value={100} />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {cards.map(({ component: Comp, title }, i) => (
            <motion.div
              key={title}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              whileHover={{ y: -3 }}
              className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">{title}</h2>
              <Comp />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

'@
Set-Content -Path "src\pages\Dashboard.jsx" -Value $content_2 -NoNewline
Write-Host "Updated src\pages\Dashboard.jsx" -ForegroundColor Green

$content_3 = @'
import React, { useRef, useState, useEffect, useCallback } from "react";
import { UploadCloud, FileText, Trash2, Check, X } from "lucide-react";
import { useToast } from "./Toast";

const STORAGE_KEY = "healthlock_my_files";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const CATEGORIES = [
  "Prescription",
  "Lab Report",
  "Blood Test",
  "X-Ray",
  "MRI",
  "CT Scan",
  "Vaccination",
  "Insurance",
  "Other",
];

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
  const [pending, setPending] = useState(null); // { file, dataUrl } staged, not yet saved
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setFiles(readStored());
  }, []);

  const stageFile = async (file) => {
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
      setPending({ file, dataUrl });
    } finally {
      setProgress(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) stageFile(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) stageFile(file);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = () => setDragActive(false);

  const handleCancel = () => {
    setPending(null);
    setDescription("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSave = () => {
    if (!pending) return;
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      name: pending.file.name,
      type: pending.file.type,
      size: pending.file.size,
      dataUrl: pending.dataUrl,
      category,
      description,
      uploadedAt: new Date().toISOString(),
    };
    const updated = [entry, ...files];
    setFiles(updated);
    writeStored(updated);
    showToast(`${category} saved successfully`, "success");
    handleCancel();
  };

  const handleDelete = (id) => {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    writeStored(updated);
    showToast("File removed", "info");
  };

  return (
    <div className="space-y-4">
      {/* Drag & drop zone */}
      {!pending && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
            dragActive ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-red-400"
          }`}
        >
          <UploadCloud className="mx-auto mb-2 text-gray-400" size={28} />
          <p className="text-sm font-semibold text-gray-700">
            Drag & drop a file here, or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — max 2MB</p>
        </div>
      )}
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

      {/* Staged file: preview + category + description + Save/Cancel */}
      {pending && (
        <div className="border border-gray-200 rounded-2xl p-4 space-y-3 bg-gray-50">
          <div className="flex items-center gap-3">
            {pending.file.type.startsWith("image/") ? (
              <img src={pending.dataUrl} alt={pending.file.name} className="w-14 h-14 object-cover rounded-lg" />
            ) : (
              <span className="w-14 h-14 flex items-center justify-center bg-gray-200 rounded-lg text-gray-500">
                <FileText size={22} />
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{pending.file.name}</p>
              <p className="text-xs text-gray-400">{(pending.file.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description / Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional notes about this file..."
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 transition-colors"
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
            >
              <Check size={14} /> Save
            </button>
          </div>
        </div>
      )}

      {/* Saved files list */}
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
                <div className="flex items-center gap-2">
                  <a href={f.dataUrl} download={f.name} className="text-sm font-medium text-red-600 hover:underline truncate">
                    {f.name}
                  </a>
                  {f.category && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 shrink-0">
                      {f.category}
                    </span>
                  )}
                </div>
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
Set-Content -Path "src\Components\FileUpload.jsx" -Value $content_3 -NoNewline
Write-Host "Updated src\Components\FileUpload.jsx" -ForegroundColor Green

$content_4 = @'
import React, { useEffect, useMemo, useState } from "react";
import { FileText, Image as ImageIcon, Search, Filter } from "lucide-react";

const STORAGE_KEY = "healthlock_my_files";

const CATEGORY_ICONS = {
  Prescription: "💊",
  "Lab Report": "🧪",
  "Blood Test": "🩸",
  "X-Ray": "🩻",
  MRI: "🧠",
  "CT Scan": "🫁",
  Vaccination: "💉",
  Insurance: "📄",
  Other: "📁",
};

function readFiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function HealthHistory() {
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    // Timeline is built from real uploaded files (Health History = "what
    // actually happened", so it updates the moment a new file is saved via
    // FileUpload -- since both read the same localStorage key).
    setFiles(readFiles());
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(files.map((f) => f.category).filter(Boolean))),
    [files]
  );

  const filtered = useMemo(() => {
    return files
      .filter((f) => {
        const q = query.trim().toLowerCase();
        const matchesQuery = !q || f.name.toLowerCase().includes(q) || (f.description || "").toLowerCase().includes(q);
        const matchesCategory = !categoryFilter || f.category === categoryFilter;
        return matchesQuery && matchesCategory;
      })
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  }, [files, query, categoryFilter]);

  if (files.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        No records yet. Upload a file above to start your medical timeline.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records..."
            className="w-full pl-9 pr-3 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-full border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {/* Timeline */}
      <ol className="relative border-l-2 border-gray-100 ml-2 space-y-6">
        {filtered.map((f) => (
          <li key={f.id} className="ml-5">
            <span className="absolute -left-[11px] flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-red-600 text-[10px]">
              {CATEGORY_ICONS[f.category] || "📁"}
            </span>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="font-semibold text-gray-900 text-sm truncate">{f.name}</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 shrink-0">
                  {f.category || "Other"}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-1">
                {new Date(f.uploadedAt).toLocaleString()}
              </p>
              {f.description && <p className="text-xs text-gray-600">{f.description}</p>}
              <a href={f.dataUrl} download={f.name} className="text-xs text-red-600 font-medium hover:underline mt-1 inline-block">
                View / Download
              </a>
            </div>
          </li>
        ))}
      </ol>

      {filtered.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No records match your search.</p>
      )}
    </div>
  );
}

export default HealthHistory;

'@
Set-Content -Path "src\Components\HealthHistory.jsx" -Value $content_4 -NoNewline
Write-Host "Updated src\Components\HealthHistory.jsx" -ForegroundColor Green

$content_5 = @'
import { useEffect, useState, useRef } from "react";

// Lightweight animated counter -- counts up from 0 to `target` over
// `duration` ms using requestAnimationFrame. No extra dependency needed.
export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    startRef.current = null;
    let frame;

    function step(timestamp) {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    }

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

'@
Set-Content -Path "src\useCountUp.js" -Value $content_5 -NoNewline
Write-Host "Updated src\useCountUp.js" -ForegroundColor Green

Write-Host "Installing framer-motion..." -ForegroundColor Cyan
npm install
Write-Host "Done! Now run: npm run dev" -ForegroundColor Cyan