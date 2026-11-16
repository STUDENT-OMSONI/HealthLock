import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock as LockIcon,
  FileCheck2,
  Search,
  Bell,
  Stethoscope,
  CheckCircle2,
  Calendar,
  Star,
  Building2,
  ChevronRight,
  ArrowRight,
  Key,
  Layers,
  Users,
  Wallet,
  Headphones,
  HeartHandshake,
  HeartPulse,
  Activity,
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FileText,
  UserCheck,
  MapPin,
  ExternalLink,
  Award,
  Sparkles,
  PhoneCall,
  X,
  Check,
} from "lucide-react";
import { VERIFIED_DOCTORS, CATEGORIES } from "../data/doctorsData";
import heroTeamImg from "../assets/hero-team.jpg";

const easeSmooth = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeSmooth } },
};

const headerVariant = {
  hidden: { opacity: 0, y: -20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeSmooth } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easeSmooth },
  },
};

// Treatments & Specialities list matching the reference design
const TREATMENTS = [
  {
    title: "Cardiology",
    category: "Cardiology",
    image: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=600&q=80",
    badge: "Heart & Vascular",
    desc: "Angiography, bypass surgery, cardiac rhythm care.",
  },
  {
    title: "Oncology",
    category: "Oncology",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
    badge: "Cancer Care",
    desc: "Targeted therapy, precision oncology, radiation.",
  },
  {
    title: "Orthopaedics",
    category: "Orthopedics",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
    badge: "Joint & Spine",
    desc: "Robotic joint replacement, spine arthroplasty.",
  },
  {
    title: "Neurology",
    category: "Neurology",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
    badge: "Brain & Nerves",
    desc: "Epilepsy, stroke rehabilitation, neuro-imaging.",
  },
  {
    title: "Cosmetic & Derma",
    category: "Dermatology",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
    badge: "Aesthetics",
    desc: "Skin rejuvenation, dermatological surgery.",
  },
  {
    title: "Dental Care",
    category: "All",
    image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80",
    badge: "Oral Surgery",
    desc: "Dental implants, aesthetic smile corrections.",
  },
  {
    title: "Organ Transplant",
    category: "All",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80",
    badge: "Super Speciality",
    desc: "Renal & liver transplants, donor match coordination.",
  },
  {
    title: "Pediatrics",
    category: "Pediatrics",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80",
    badge: "Child Health",
    desc: "Neonatal ICU, developmental pediatric therapies.",
  },
];

// Top Hospitals matching the reference design
const HOSPITALS = [
  {
    name: "Fortis Hospitals",
    location: "India • Multi Speciality",
    tag: "JCI & NABH Accredited",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80",
    beds: "4,000+ Beds Across India",
    highlight: "Excellence in Cardiac & Bone Care",
  },
  {
    name: "Apollo Hospitals",
    location: "India • Multi Speciality",
    tag: "Asia's Leading Hospital Group",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
    beds: "10,000+ Beds Across 70+ Hospitals",
    highlight: "Robotic Surgery & Precision Oncology",
  },
  {
    name: "Medanta – The Medicity",
    location: "India • Multi Speciality",
    tag: "1,250+ Bed Super Speciality",
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80",
    beds: "Flagship Multi-Organ Campus",
    highlight: "World-Renowned Cardiac & Neuro Surgeons",
  },
  {
    name: "Max Healthcare",
    location: "India • Multi Speciality",
    tag: "NABH & NABL Certified",
    image: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=800&q=80",
    beds: "3,500+ Beds Across Tier 1 Centers",
    highlight: "Advanced Minimally Invasive Surgery",
  },
];

// Interactive Video Clips
const VIDEO_CLIPS = [
  {
    id: "consultation",
    title: "Clinical Consultation & Records",
    subtitle: "High-definition tele-consultation with zero-knowledge record encryption",
    url: "https://videos.pexels.com/video-files/8413486/8413486-uhd_2560_1440_25fps.mp4",
    poster: "https://images.pexels.com/videos/8413486/adult-business-computer-connection-8413486.jpeg?auto=compress&w=1600",
  },
  {
    id: "surgery",
    title: "Advanced Surgery & Robotic Theatre",
    subtitle: "State-of-the-art sterile operating facilities and surgical accuracy",
    url: "https://videos.pexels.com/video-files/7088530/7088530-uhd_2560_1440_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "diagnostics",
    title: "High-Precision Laboratory Diagnostics",
    subtitle: "Automated hematology, molecular testing, and instant blockchain verification",
    url: "https://videos.pexels.com/video-files/853889/853889-hd_1920_1080_25fps.mp4",
    poster: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=80",
  },
];

function Home() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [doctorsList, setDoctorsList] = useState(VERIFIED_DOCTORS);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [careModalOpen, setCareModalOpen] = useState(false);
  const [coordinatorSent, setCoordinatorSent] = useState(false);
  const [careForm, setCareForm] = useState({ name: "", phone: "", need: "Cardiology" });
  const videoRef = useRef(null);
  const heroVideoRef = useRef(null);
  const cardVideoRef = useRef(null);
  const [isCardVideoPlaying, setIsCardVideoPlaying] = useState(true);
  const [isCardVideoMuted, setIsCardVideoMuted] = useState(true);

  useEffect(() => {
    if (heroVideoRef.current) {
      heroVideoRef.current.defaultMuted = true;
      heroVideoRef.current.muted = true;
      heroVideoRef.current.play().catch(() => {});
    }
    if (cardVideoRef.current) {
      cardVideoRef.current.defaultMuted = true;
      cardVideoRef.current.muted = true;
      cardVideoRef.current.play().catch(() => {});
    }
  }, []);

  const toggleCardVideoPlay = () => {
    if (!cardVideoRef.current) return;
    if (cardVideoRef.current.paused) {
      cardVideoRef.current.play();
      setIsCardVideoPlaying(true);
    } else {
      cardVideoRef.current.pause();
      setIsCardVideoPlaying(false);
    }
  };

  const toggleCardVideoMute = () => {
    if (!cardVideoRef.current) return;
    cardVideoRef.current.muted = !cardVideoRef.current.muted;
    setIsCardVideoMuted(cardVideoRef.current.muted);
  };

  useEffect(() => {
    fetch("/api/doctors")
      .then((r) => r.json())
      .then((data) => {
        if (data.doctors && data.doctors.length > 0) {
          setDoctorsList(data.doctors);
        }
      })
      .catch(() => {});
  }, []);

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const toggleVideoMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsVideoMuted(videoRef.current.muted);
  };

  const filteredDoctors =
    selectedCategory === "All"
      ? doctorsList
      : doctorsList.filter((d) => d.doctorDetails?.specialization === selectedCategory);

  const handleCoordinatorSubmit = (e) => {
    e.preventDefault();
    setCoordinatorSent(true);
    setTimeout(() => {
      setCareModalOpen(false);
      setCoordinatorSent(false);
      setCareForm({ name: "", phone: "", need: "Cardiology" });
    }, 2000);
  };

  return (
    <div className="bg-white text-slate-800 font-sans selection:bg-red-500 selection:text-white">
      {/* =========================================================================
          HERO SECTION (With High-Definition Medical Background Video & Crystal-Clear Visual)
      ========================================================================== */}
      <section className="relative overflow-hidden min-h-[82vh] flex items-center pt-8 pb-16 md:pt-14 md:pb-24 border-b border-slate-100 bg-white">
        {/* Moving HD Background Video from Internet (Clinical Consultation & Records with Translucent Layer) */}
        <video
          ref={heroVideoRef}
          autoPlay
          loop
          muted
          playsInline
          src="https://videos.pexels.com/video-files/8413486/8413486-uhd_2560_1440_25fps.mp4"
          poster="https://images.pexels.com/videos/8413486/adult-business-computer-connection-8413486.jpeg?auto=compress&w=1600"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-40"
        />

        {/* Dynamic Light & Contrast Layer with transparent gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/65 to-white/25 backdrop-blur-[0.5px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/25 pointer-events-none" />

        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="lg:col-span-7 space-y-6"
            >
              {/* Trust / Accreditation Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50/90 border border-red-200 text-red-700 text-xs font-bold tracking-wide shadow-xs backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span>World-Class Healthcare Network • 100% Encrypted</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] drop-shadow-xs">
                World-Class Healthcare. <br />
                <span className="text-red-600">Seamless Care.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-700 max-w-xl leading-relaxed font-medium">
                We connect you with the best accredited hospitals, specialist doctors, and a private zero-knowledge medical vault — with complete clinical care, wherever you are.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/register")}
                  className="px-8 py-3.5 rounded-full font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-colors duration-200 flex items-center gap-2 cursor-pointer text-sm sm:text-base"
                >
                  <span>Find Treatment & Doctors</span>
                  <ArrowRight size={18} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCareModalOpen(true)}
                  className="px-6 py-3.5 rounded-full font-bold text-slate-800 bg-white/95 border border-slate-300 hover:border-red-500 hover:text-red-600 shadow-md transition-colors duration-200 flex items-center gap-2.5 cursor-pointer text-sm sm:text-base backdrop-blur-sm"
                >
                  <Headphones size={18} className="text-red-600" />
                  <span>Talk to a Care Coordinator</span>
                </motion.button>
              </div>

              {/* Social Proof & Trust Badges */}
              <div className="pt-4 border-t border-slate-300/80 flex flex-wrap items-center gap-6 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2 hover:text-red-600 transition-colors">
                  <ShieldCheck size={18} className="text-red-600 shrink-0" />
                  <span>JCI & NABH Hospital Standards</span>
                </div>
                <div className="flex items-center gap-2 hover:text-emerald-600 transition-colors">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>Trusted by 25,000+ Indian Patients</span>
                </div>
                <div className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                  <LockIcon size={16} className="text-blue-600 shrink-0" />
                  <span>AES-256 Client-Side Vault</span>
                </div>
              </div>
            </motion.div>

            {/* Right Hero Visual: Professional, Warm & Crisp Doctor Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: easeSmooth }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Subtle Ambient Glow */}
                <motion.div
                  animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.98, 1.02, 0.98] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-2 bg-gradient-to-tr from-red-500/25 to-blue-500/25 rounded-3xl blur-2xl -z-10"
                />

                {/* Floating Patient Review Badge */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-3.5 -left-3.5 sm:-top-4 sm:-left-4 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl px-3.5 py-2 shadow-lg flex items-center gap-2.5 z-20 pointer-events-none"
                >
                  <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                    <Star size={15} className="fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-slate-900 leading-tight">4.95 / 5 Rating</div>
                    <div className="text-[9px] text-slate-500 font-medium">1,200+ Verified Patient Reviews</div>
                  </div>
                </motion.div>

                {/* Hero Doctor Team Image Card - User Selected Indian Medical Specialists Team */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                  className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white aspect-[16/9] group"
                >
                  <img
                    src={heroTeamImg}
                    alt="MediKey Healthcare Specialists Team"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          WHY CHOOSE US (Matching the 5-item horizontal layout from reference image)
      ========================================================================== */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={headerVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-xs font-black uppercase tracking-widest text-red-600 mb-2">
              WHY CHOOSE US
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Clinical Excellence Built Around Your Safety
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Designed to eliminate fragmented records, lost prescriptions, and hospital queues.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
          >
            {/* Card 1 */}
            <motion.div
              variants={cardVariant}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-red-300 rounded-3xl p-6 text-center transition-all duration-300 hover:shadow-xl flex flex-col items-center cursor-default"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <ShieldCheck size={26} />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">Verified Hospitals</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Partnered with JCI and NABH accredited premier hospital networks across India.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              variants={cardVariant}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-red-300 rounded-3xl p-6 text-center transition-all duration-300 hover:shadow-xl flex flex-col items-center cursor-default"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <Users size={26} />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">Expert Doctors</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Board-certified clinical specialists with 10+ to 20+ years of institutional expertise.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              variants={cardVariant}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-red-300 rounded-3xl p-6 text-center transition-all duration-300 hover:shadow-xl flex flex-col items-center cursor-default"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <Wallet size={26} />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">Affordable Treatment</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                High-quality care at transparent rates in Indian Rupees (₹) with zero hidden fees.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              variants={cardVariant}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-red-300 rounded-3xl p-6 text-center transition-all duration-300 hover:shadow-xl flex flex-col items-center cursor-default"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <HeartHandshake size={26} />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">End-to-End Assistance</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We handle doctor appointments, encrypted record transfers, and follow-up guidance.
              </p>
            </motion.div>

            {/* Card 5 */}
            <motion.div
              variants={cardVariant}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-red-300 rounded-3xl p-6 text-center transition-all duration-300 hover:shadow-xl flex flex-col items-center cursor-default"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                <Headphones size={26} />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">24/7 Patient Support</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Instant emergency access via secure QR authorization in your language anytime.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          TREATMENTS & SPECIALITIES (With real photo thumbnails matching reference)
      ========================================================================== */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-10 bg-slate-50/60 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={headerVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h2 className="text-xs font-black uppercase tracking-widest text-red-600 mb-2">
              TREATMENTS & SPECIALITIES
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Comprehensive Multi-Speciality Departments
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Explore specialized medical departments staffed by verified clinical authorities.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          >
            {TREATMENTS.map((item, idx) => (
              <motion.div
                key={idx}
                variants={cardVariant}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedCategory(item.category);
                  const el = document.getElementById("doctors-directory");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-red-400 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80";
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
                  <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-sm text-slate-900 shadow-xs">
                    {item.badge}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-red-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-red-600">
                    <span>Consult Doctor</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-12">
            <motion.a
              href="#doctors-directory"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-md transition-colors duration-200 cursor-pointer uppercase tracking-wider"
            >
              <span>View All Treatments & Specialists</span>
              <ArrowRight size={16} />
            </motion.a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS (The 5-step stepper directly from reference image)
      ========================================================================== */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-10 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={headerVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-xs font-black uppercase tracking-widest text-red-600 mb-2">
              HOW IT WORKS
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Your Complete Health Journey in 5 Simple Steps
            </p>
            <p className="text-sm text-slate-500 mt-2">
              From appointment scheduling to tamper-proof prescriptions with complete ownership.
            </p>
          </motion.div>

          {/* Stepper Grid with Connected Dashed Line */}
          <div className="relative">
            {/* Desktop Connector Line */}
            <div className="hidden lg:block absolute top-7 left-12 right-12 h-0.5 border-t-2 border-dashed border-slate-200 -z-0" />

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10"
            >
              {/* Step 1 */}
              <motion.div
                variants={cardVariant}
                whileHover={{ y: -6 }}
                className="group flex flex-col items-center text-center cursor-default"
              >
                <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center font-black shadow-md border-4 border-white mb-4 group-hover:scale-110 transition-all duration-300">
                  <FileText size={22} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-red-600 mb-1">Step 1</span>
                <h4 className="text-sm font-extrabold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">Share Medical Needs</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Fill our simple online medical inquiry or upload your encrypted clinical test reports.
                </p>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                variants={cardVariant}
                whileHover={{ y: -6 }}
                className="group flex flex-col items-center text-center cursor-default"
              >
                <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center font-black shadow-md border-4 border-white mb-4 group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
                  <UserCheck size={22} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">Step 2</span>
                <h4 className="text-sm font-extrabold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">Expert Consultation</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Our certified clinical experts review your history and advise the best treatment plan.
                </p>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                variants={cardVariant}
                whileHover={{ y: -6 }}
                className="group flex flex-col items-center text-center cursor-default"
              >
                <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center font-black shadow-md border-4 border-white mb-4 group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
                  <Building2 size={22} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">Step 3</span>
                <h4 className="text-sm font-extrabold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">Choose Hospital</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Select from accredited hospital partners and verified doctors that match your needs.
                </p>
              </motion.div>

              {/* Step 4 */}
              <motion.div
                variants={cardVariant}
                whileHover={{ y: -6 }}
                className="group flex flex-col items-center text-center cursor-default"
              >
                <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center font-black shadow-md border-4 border-white mb-4 group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
                  <Stethoscope size={22} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">Step 4</span>
                <h4 className="text-sm font-extrabold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">Care & Treatment</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Receive smooth treatment, in-person consultations, and digital prescriptions.
                </p>
              </motion.div>

              {/* Step 5 */}
              <motion.div
                variants={cardVariant}
                whileHover={{ y: -6 }}
                className="group flex flex-col items-center text-center cursor-default"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black shadow-md border-4 border-white mb-4 group-hover:scale-110 transition-all duration-300">
                  <HeartHandshake size={22} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 mb-1">Step 5</span>
                <h4 className="text-sm font-extrabold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">Post-Care Support</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Continued digital follow-up and lifelong tamper-evident records on the blockchain.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          TOP HOSPITALS / MEDICAL PARTNERS (Directly matching reference image)
      ========================================================================== */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-10 bg-slate-50/70 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={headerVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <h2 className="text-xs font-black uppercase tracking-widest text-red-600 mb-2">
              TOP HOSPITALS / MEDICAL PARTNERS
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Connected with India's Premier Health Networks
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Seamlessly share records with NABH & JCI accredited multi-speciality tertiary hospitals.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {HOSPITALS.map((hosp, idx) => (
              <motion.div
                key={idx}
                variants={cardVariant}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={hosp.image}
                      alt={hosp.name}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80";
                      }}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/85 backdrop-blur-sm text-white shadow-xs">
                      {hosp.tag}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">
                      {hosp.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mb-3 flex items-center gap-1">
                      <MapPin size={12} className="text-red-600 shrink-0" />
                      {hosp.location}
                    </p>
                    <p className="text-xs text-slate-600 font-semibold mb-1">
                      {hosp.highlight}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {hosp.beds}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <motion.button
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate("/login")}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Explore Hospital</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    Verified
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE MOVING HD VIDEO SHOWCASE SECTION
          "add videos as well make site attractive and professional"
      ========================================================================== */}
      <section id="hospital-video" className="py-20 px-4 sm:px-6 lg:px-10 bg-slate-950 text-white relative overflow-hidden">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#dc2626_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            variants={headerVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center max-w-3xl mx-auto mb-10"
          >
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-950/60 text-red-400 border border-red-700/40 inline-flex items-center gap-1.5 mb-3 shadow-2xs">
              <Activity size={14} className="text-red-500" /> Clinical Operations Overview
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Integrated Clinical Operations & Care Delivery
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2.5 max-w-2xl mx-auto leading-relaxed">
              Standardized tele-consultations, modern surgical facilities, and cryptographically verified diagnostic workflows across partner health networks.
            </p>
          </motion.div>

          {/* Video Selector Tabs */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 flex-wrap">
            {VIDEO_CLIPS.map((clip, idx) => (
              <motion.button
                key={clip.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveVideoIndex(idx);
                  setIsVideoPlaying(true);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  activeVideoIndex === idx
                    ? "bg-red-600 text-white shadow-sm border border-red-500"
                    : "bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                }`}
              >
                <Activity size={14} className={activeVideoIndex === idx ? "text-white" : "text-red-500"} />
                <span>{clip.title}</span>
              </motion.button>
            ))}
          </div>

          {/* High-Definition Moving Video Player Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: easeSmooth }}
            whileHover={{ scale: 1.005 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 aspect-video max-h-[540px] mx-auto transition-shadow"
          >
            <video
              ref={videoRef}
              key={VIDEO_CLIPS[activeVideoIndex].url}
              src={VIDEO_CLIPS[activeVideoIndex].url}
              poster={VIDEO_CLIPS[activeVideoIndex].poster}
              autoPlay
              loop
              muted={isVideoMuted}
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40 pointer-events-none" />

            {/* Top Bar inside Player */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs">
              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">HD Clinical Stream</span>
              </div>
              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] text-slate-300 font-semibold">
                100% Client-Side AES-256
              </div>
            </div>

            {/* Bottom Controls inside Player */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="max-w-md">
                <p className="text-sm sm:text-base font-extrabold text-white">
                  {VIDEO_CLIPS[activeVideoIndex].title}
                </p>
                <p className="text-xs text-slate-300 line-clamp-1">
                  {VIDEO_CLIPS[activeVideoIndex].subtitle}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleVideoMute}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center transition cursor-pointer"
                  title={isVideoMuted ? "Unmute" : "Mute"}
                >
                  {isVideoMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleVideoPlay}
                  className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition cursor-pointer"
                  title={isVideoPlaying ? "Pause" : "Play"}
                >
                  {isVideoPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          VERIFIED SPECIALIST PHYSICIANS DIRECTORY (Preserved & Enhanced)
      ========================================================================== */}
      <section id="doctors-directory" className="py-20 px-4 sm:px-6 lg:px-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={headerVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center max-w-2xl mx-auto mb-10"
          >
            <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-100 text-red-700 inline-flex items-center gap-1.5 mb-3">
              <Stethoscope size={14} /> Certified Clinical Directory
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Meet Our Verified Medical Specialists
            </h2>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Consult board-certified physicians across 11 hospital departments with transparent consultation fees in Indian Rupees (₹).
            </p>
          </motion.div>

          {/* Specialty Category Filter Buttons */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none flex-wrap">
            {CATEGORIES.slice(0, 8).map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-bold rounded-full transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          {/* Doctors Grid with fluid animated layout changes */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredDoctors.slice(0, 6).map((doc) => (
                <motion.div
                  layout
                  key={doc.id}
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -20 }}
                  transition={{ duration: 0.35, ease: easeSmooth }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-red-300 transition-shadow duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative shrink-0">
                        <img
                          src={doc.picture}
                          alt={doc.name}
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80";
                          }}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-xs group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-extrabold text-slate-900 truncate">{doc.name}</h4>
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                            ★ 4.9
                          </span>
                        </div>
                        <span className="inline-block mt-0.5 text-xs font-bold text-red-600">
                          {doc.doctorDetails?.specialization}
                        </span>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {doc.doctorDetails?.hospital}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {doc.doctorDetails?.bio}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Consultation Fee</span>
                      <span className="text-xs font-extrabold text-slate-900">{doc.doctorDetails?.consultationFee}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/login")}
                      className="px-4 py-2 bg-slate-900 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Calendar size={13} /> Book Visit
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <div className="text-center mt-10">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-md transition-colors duration-200 cursor-pointer"
            >
              <span>View All 11 Specialists & Register</span>
              <ArrowRight size={14} />
            </motion.button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CRYPTOGRAPHIC DEFENSE ARCHITECTURE (Zero-Knowledge & Blockchain)
          Matches the clean medical white & red theme with premium light cards
      ========================================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-10 bg-slate-50/70 border-t border-slate-100 relative overflow-hidden">
        {/* Subtle grid pattern matching the light theme */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-red-500/5 via-blue-500/5 to-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div
            variants={headerVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="max-w-2xl mx-auto mb-14"
          >
            <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1.5 mb-3 shadow-2xs">
              <ShieldCheck size={14} className="text-red-600" /> Cryptographic Defense Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Built On Genuine End-to-End Encryption & Blockchain
            </h2>
            <p className="text-slate-500 mt-2 text-xs sm:text-sm leading-relaxed">
              Your medical records never leave your device in plaintext. Even hospital database administrators cannot view your medical files without your explicit cryptographic authorization.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
          >
            {/* Card 1: AES-256 */}
            <motion.div
              variants={cardVariant}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group p-7 rounded-3xl bg-white border border-slate-200/90 hover:border-red-400 transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mb-5 shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  <Key size={26} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-red-600 transition-colors">
                  AES-256-GCM Encryption
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Unique random 256-bit symmetric key per file generated in-browser via standard Web Crypto API. Only ciphertext is stored.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-400">Symmetric Vault</span>
                <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                  Zero Plaintext
                </span>
              </div>
            </motion.div>

            {/* Card 2: SHA-256 Ledger */}
            <motion.div
              variants={cardVariant}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group p-7 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-400 transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-5 shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  <Layers size={26} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  SHA-256 Blockchain Ledger
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tamper-evident audit trail recording every document registration, doctor verification, and consent change with cryptographic proof.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-400">Audited Ledger</span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  Immutable
                </span>
              </div>
            </motion.div>

            {/* Card 3: Zero-Knowledge Consent */}
            <motion.div
              variants={cardVariant}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group p-7 rounded-3xl bg-white border border-slate-200/90 hover:border-blue-400 transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-5 shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  <LockIcon size={26} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Zero-Knowledge Consent
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Document keys are re-encrypted using RSA-OAEP 2048-bit with the verified doctor's public key upon explicit patient approval.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-400">Asymmetric Keys</span>
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Patient Governed
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          BOTTOM CALL TO ACTION BANNER (Matching the scenic bottom banner from image)
      ========================================================================== */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-10 overflow-hidden bg-slate-900 text-white">
        {/* Scenic Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&q=80"
            alt="Scenic wellness landscape"
            className="w-full h-full object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-900/60" />
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="max-w-6xl mx-auto relative z-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-red-400">
                START YOUR CONFIDENTIAL HEALTH VAULT
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Your Journey to Better Health <br />
                <span className="text-red-500">Starts Here.</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Join verified patients and top hospital specialists across India. Keep every lab report, ECG, prescription, and visit in your private encrypted vault.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/register")}
                className="w-full px-8 py-4 rounded-full font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Get a Free Medical Assessment</span>
                <ArrowRight size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/login")}
                className="w-full px-8 py-3.5 rounded-full font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <span>Sign In to Your Dashboard</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* =========================================================================
          CARE COORDINATOR INQUIRY MODAL ("Talk to a Care Coordinator")
      ========================================================================== */}
      <AnimatePresence>
        {careModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100"
            >
              <button
                onClick={() => setCareModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
              >
                <X size={20} />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                <Headphones size={24} />
              </div>

              <h3 className="text-xl font-black text-slate-900">Talk to a Care Coordinator</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
                Our medical concierge will connect you with accredited hospitals and specialist doctors within 2 hours.
              </p>

              {coordinatorSent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                    <Check size={20} />
                  </div>
                  <p className="text-sm font-bold">Request Received!</p>
                  <p className="text-xs text-emerald-600">A care coordinator will call you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleCoordinatorSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={careForm.name}
                      onChange={(e) => setCareForm({ ...careForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (with Country Code)</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={careForm.phone}
                      onChange={(e) => setCareForm({ ...careForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Primary Medical Speciality</label>
                    <select
                      value={careForm.need}
                      onChange={(e) => setCareForm({ ...careForm, need: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-red-500"
                    >
                      <option value="Cardiology">Cardiology (Heart & Blood Pressure)</option>
                      <option value="Oncology">Oncology (Cancer Consultation)</option>
                      <option value="Orthopaedics">Orthopaedics (Joint & Spine Surgery)</option>
                      <option value="Neurology">Neurology (Brain & Headache)</option>
                      <option value="General Health">General Health Checkup & Lab Reports</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
                  >
                    Request Free Call Back
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Home;
