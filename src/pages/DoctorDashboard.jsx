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
      console.log("QR scan: no matching patient. Decoded value was:", JSON.stringify(token));
      showToast(`No patient matches this QR code. Scanned value: "${token}"`, "error");
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
