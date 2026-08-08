import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText, CalendarCheck, ShieldCheck, QrCode } from "lucide-react";
import FileUpload from "../Components/FileUpload";
import AccessLogs from "../Components/AccessLogs";
import HealthHistory from "../Components/HealthHistory";
import { useCountUp } from "../useCountUp";
import { getAppointments } from "../appointmentStore";
import { hasRole } from "../auth";

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

// The real, working patient QR lives on a specific Patient record inside
// the hospital's Patient Management system (Doctor/Admin only) -- NOT here.
// This card just explains that clearly instead of showing a disconnected
// demo QR that doesn't correspond to any real record (the old "TEMP_TOKEN_"
// generator that used to live here caused real confusion).
function QrInfoCard() {
  return (
    <div className="text-center py-6">
      <QrCode className="mx-auto text-gray-300 mb-3" size={36} />
      <p className="text-sm text-gray-600 max-w-xs mx-auto">
        Your scannable patient QR is generated automatically when a Doctor or
        Admin adds you as a patient record.
      </p>
      {hasRole("Doctor", "Admin") && (
        <Link
          to="/patients"
          className="inline-block mt-4 text-sm font-semibold text-red-600 hover:underline"
        >
          Go to Patient Management &rarr;
        </Link>
      )}
    </div>
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
    getAppointments()
      .then((appts) => setAppointmentCount(appts.length))
      .catch(() => setAppointmentCount(0));
  }, []);

  const cards = [
    { component: FileUpload, title: "File Upload" },
    { component: QrInfoCard, title: "Patient QR Code" },
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
