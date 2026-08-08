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
