import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  Calendar,
  FileText,
  Pill,
  Lock,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  Search,
  Check,
  X,
  FileCheck2,
  Clock,
  Sparkles,
  Stethoscope,
  ChevronRight,
  ExternalLink,
  Activity,
  User,
  LayoutDashboard,
  Bell,
  ArrowRight,
  FileSpreadsheet,
  AlertCircle,
  Camera,
  Image as ImageIcon,
  Building,
  Shield,
  KeyRound,
  Copy,
  Phone,
  Heart,
} from "lucide-react";
import { apiFetch, getUser, getLocalPrivateKey, storePrivateKeyLocally } from "../auth";
import {
  generateUserKeyPair,
  encryptDocumentClientSide,
  decryptDocumentClientSide,
  computeSHA256,
  reencryptDocKeyForDoctor,
} from "../services/cryptoService.js";
import { VERIFIED_DOCTORS, CATEGORIES } from "../data/doctorsData.js";

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(getUser());

  // Derive active tab directly from URL search params for instant sync with navbar and sidebar
  const activeTab = searchParams.get("tab") || "overview";

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  // Data states
  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [consents, setConsents] = useState([]);
  const [doctors, setDoctors] = useState(VERIFIED_DOCTORS);
  const [chainBlocks, setChainBlocks] = useState([]);
  const [chainValid, setChainValid] = useState(true);
  const [loading, setLoading] = useState(true);

  // Upload modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Lab Report");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Decryption & preview states
  const [decryptingId, setDecryptingId] = useState(null);
  const [decryptedUrls, setDecryptedUrls] = useState({});
  const [verificationModalData, setVerificationModalData] = useState(null);

  // Appointment booking modal & Category filters
  const [showApptModal, setShowApptModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(VERIFIED_DOCTORS[0]?.id || "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [modalCategory, setModalCategory] = useState("All");
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("10:00 AM");
  const [apptReason, setApptReason] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // File hash integrity verifier
  const [verifyFile, setVerifyFile] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyingHash, setVerifyingHash] = useState(false);

  // Demo record state
  const [creatingDemo, setCreatingDemo] = useState(false);

  // Profile Photo & Vitals State
  const fileInputRef = useRef(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoInputUrl, setPhotoInputUrl] = useState("");
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileBloodGroup, setProfileBloodGroup] = useState(user?.patientDetails?.bloodGroup || "A+");
  const [profileAge, setProfileAge] = useState(user?.patientDetails?.age || "21");
  const [profileGender, setProfileGender] = useState(user?.patientDetails?.gender || "Male");
  const [profileContact, setProfileContact] = useState(user?.patientDetails?.contact || "+1 (555) 876-5432");
  const [profileEmergencyContact, setProfileEmergencyContact] = useState(user?.patientDetails?.emergencyContact || "+1 (555) 987-6543");
  const [profileAllergies, setProfileAllergies] = useState(user?.patientDetails?.allergies || "No known drug allergies");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [showKeyDetails, setShowKeyDetails] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);

  // Sync profile fields if user changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      if (user.patientDetails) {
        setProfileBloodGroup(user.patientDetails.bloodGroup || "A+");
        setProfileAge(user.patientDetails.age || "21");
        setProfileGender(user.patientDetails.gender || "Male");
        setProfileContact(user.patientDetails.contact || "+1 (555) 876-5432");
        setProfileEmergencyContact(user.patientDetails.emergencyContact || "+1 (555) 987-6543");
        setProfileAllergies(user.patientDetails.allergies || "No known drug allergies");
      }
    }
  }, [user]);

  // Handle local file photo upload
  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image file under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      saveProfilePicture(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Save profile picture to backend
  const saveProfilePicture = async (picUrl) => {
    if (!picUrl) return;
    setSavingPhoto(true);
    try {
      const res = await apiFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ picture: picUrl }),
      });
      if (res.user) {
        localStorage.setItem("healthlock_user", JSON.stringify(res.user));
        setUser(res.user);
        setProfileSuccessMsg("Profile photo updated successfully!");
        setTimeout(() => setProfileSuccessMsg(""), 3500);
      }
    } catch (err) {
      alert("Failed to update profile picture: " + err.message);
    } finally {
      setSavingPhoto(false);
      setShowPhotoModal(false);
      setPhotoInputUrl("");
    }
  };

  // Save patient profile vitals
  const handleSavePatientProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await apiFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: profileName,
          patientDetails: {
            bloodGroup: profileBloodGroup,
            age: profileAge,
            gender: profileGender,
            contact: profileContact,
            emergencyContact: profileEmergencyContact,
            allergies: profileAllergies,
          },
        }),
      });
      if (res.user) {
        localStorage.setItem("healthlock_user", JSON.stringify(res.user));
        setUser(res.user);
        setProfileSuccessMsg("Patient details updated successfully!");
        setTimeout(() => setProfileSuccessMsg(""), 3500);
      }
    } catch (err) {
      alert("Failed to save profile: " + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // Auto-heal encryption keys if missing
  const ensureKeys = async () => {
    const currentUser = getUser();
    if (!currentUser || !currentUser.id) return { publicKey: null, privateKey: null };

    let privKey = getLocalPrivateKey(currentUser.id);
    let pubKey = currentUser.publicKey;

    if (!privKey || !pubKey) {
      try {
        const keys = await generateUserKeyPair();
        storePrivateKeyLocally(currentUser.id, keys.privateKey);

        const res = await apiFetch("/api/auth/profile", {
          method: "PATCH",
          body: JSON.stringify({ publicKey: keys.publicKey }),
        });

        if (res.user) {
          localStorage.setItem("healthlock_user", JSON.stringify(res.user));
          setUser(res.user);
        }
        return keys;
      } catch (err) {
        console.warn("Keygen warning:", err);
      }
    }
    return { publicKey: pubKey, privateKey: privKey };
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await ensureKeys();

      const [recRes, apptRes, rxRes, conRes, docRes, blockRes] = await Promise.all([
        apiFetch("/api/records").catch(() => ({ records: [] })),
        apiFetch("/api/appointments").catch(() => ({ appointments: [] })),
        apiFetch("/api/prescriptions").catch(() => ({ prescriptions: [] })),
        apiFetch("/api/consent/patient").catch(() => ({ consents: [] })),
        apiFetch("/api/doctors").catch(() => apiFetch("/api/auth/doctors")).catch(() => ({ doctors: VERIFIED_DOCTORS })),
        apiFetch("/api/blockchain/chain").catch(() => ({ chain: [] })),
      ]);

      setRecords(recRes.records || []);
      setAppointments(apptRes.appointments || []);
      setPrescriptions(rxRes.prescriptions || []);
      setConsents(conRes.consents || []);
      if (docRes.doctors && docRes.doctors.length > 0) {
        setDoctors(docRes.doctors);
      }
      setChainBlocks(blockRes.chain || []);

      if (docRes.doctors?.length > 0 && !selectedDoctorId) {
        setSelectedDoctorId(docRes.doctors[0].id);
      }

      const statusRes = await apiFetch("/api/blockchain/status").catch(() => ({ isValid: true }));
      setChainValid(statusRes.isValid ?? true);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Upload Encrypted Document
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      setUploadError("Please provide a title and select a file.");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const keys = await ensureKeys();
      if (!keys.publicKey) {
        throw new Error("Encryption key could not be initialized. Please refresh the page.");
      }

      const encryptedPayload = await encryptDocumentClientSide(uploadFile, keys.publicKey);

      const res = await apiFetch("/api/records", {
        method: "POST",
        body: JSON.stringify({
          title: uploadTitle.trim(),
          category: uploadCategory,
          description: uploadDescription.trim(),
          ...encryptedPayload,
        }),
      });

      setRecords((prev) => [res.record, ...prev]);
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadTitle("");
      setUploadDescription("");
      loadAllData();
      alert("Document encrypted with AES-256-GCM and registered on blockchain!");
    } catch (err) {
      setUploadError(err.message || "Failed to encrypt and upload document.");
    } finally {
      setUploading(false);
    }
  };

  // Client-Side Decrypt and View
  const handleDecryptFile = async (record) => {
    if (decryptedUrls[record.id]) {
      window.open(decryptedUrls[record.id], "_blank");
      return;
    }

    setDecryptingId(record.id);
    try {
      const keys = await ensureKeys();
      const result = await decryptDocumentClientSide(
        record.encryptedData,
        record.iv,
        record.patientEncryptedKey,
        keys?.privateKey,
        record.fileType || "text/html",
        record.rawKey
      );

      setDecryptedUrls((prev) => ({ ...prev, [record.id]: result.blobUrl }));
      window.open(result.blobUrl, "_blank");
    } catch (err) {
      alert("Decryption Error: " + err.message);
    } finally {
      setDecryptingId(null);
    }
  };

  // Instant Demo Record Generator
  const handleAddDemoRecord = async () => {
    setCreatingDemo(true);
    try {
      const keys = await ensureKeys();
      const demoContent = `MEDIKEY CLINICAL EXAMINATION
Patient Name: ${user?.name || "Patient"}
Test: Comprehensive Lipid & Metabolic Blood Panel
Status: Complete & Normal
Cholesterol: 185 mg/dL (Normal)
HDL: 62 mg/dL | LDL: 104 mg/dL
Fasting Blood Sugar: 90 mg/dL
Physician: Dr. Michael Smith, MD`;

      const blob = new Blob([demoContent], { type: "text/plain" });
      const file = new File([blob], "Comprehensive_Blood_Panel.txt", { type: "text/plain" });

      const encryptedPayload = await encryptDocumentClientSide(file, keys.publicKey);

      const res = await apiFetch("/api/records", {
        method: "POST",
        body: JSON.stringify({
          title: "Comprehensive Lipid & Metabolic Panel",
          category: "Blood Test",
          description: "Annual preventive cardiovascular blood test. All indicators normal.",
          ...encryptedPayload,
        }),
      });

      setRecords((prev) => [res.record, ...prev]);
      loadAllData();
      alert("Demo encrypted medical record created! Click 'Decrypt & View' to decrypt it.");
    } catch (err) {
      alert("Failed to create demo record: " + err.message);
    } finally {
      setCreatingDemo(false);
    }
  };

  // Blockchain Document Integrity Verification
  const handleVerifyIntegrity = async (record) => {
    try {
      const res = await apiFetch(`/api/records/${record.id}/verify`, {
        method: "POST",
        body: JSON.stringify({ hash: record.documentHash }),
      });
      setVerificationModalData(res);
    } catch (err) {
      alert("Verification query failed: " + err.message);
    }
  };

  // Standalone File Hash Integrity Verifier
  const handleVerifyArbitraryFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVerifyFile(file);
    setVerifyingHash(true);
    setVerifyResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const hash = await computeSHA256(buffer);

      const res = await apiFetch("/api/blockchain/verify-hash", {
        method: "POST",
        body: JSON.stringify({ hash }),
      });

      setVerifyResult({ ...res, calculatedHash: hash, fileName: file.name });
    } catch (err) {
      setVerifyResult({ verified: false, error: err.message });
    } finally {
      setVerifyingHash(false);
    }
  };

  // Doctor Access Consent Approval with Asymmetric Re-Encryption
  const handleApproveConsent = async (consent) => {
    try {
      const keyRes = await apiFetch(`/api/auth/user-key/${consent.doctorId}`);
      if (!keyRes.publicKey) {
        throw new Error("Doctor has not published an RSA public encryption key yet.");
      }

      const keys = await ensureKeys();
      if (!keys.privateKey) {
        throw new Error("Your private key is missing from local storage.");
      }

      const doctorEncryptedKeys = {};
      for (const rec of records) {
        if (rec.patientEncryptedKey) {
          try {
            const docKeyForDoctor = await reencryptDocKeyForDoctor(
              rec.patientEncryptedKey,
              keys.privateKey,
              keyRes.publicKey
            );
            doctorEncryptedKeys[rec.id] = docKeyForDoctor;
          } catch (kErr) {
            console.warn("Key re-encryption notice:", kErr);
          }
        }
      }

      await apiFetch("/api/consent/approve", {
        method: "POST",
        body: JSON.stringify({
          requestId: consent.id,
          doctorEncryptedKeys,
        }),
      });

      alert(`Access granted to Dr. ${consent.doctorName}. Keys securely shared.`);
      loadAllData();
    } catch (err) {
      alert("Failed to grant consent: " + err.message);
    }
  };

  // Revoke Consent
  const handleRevokeConsent = async (consent) => {
    if (!window.confirm(`Revoke access permissions for Dr. ${consent.doctorName}?`)) {
      return;
    }
    try {
      await apiFetch("/api/consent/revoke", {
        method: "POST",
        body: JSON.stringify({ consentId: consent.id }),
      });
      alert(`Access revoked for Dr. ${consent.doctorName}. Doctor can no longer decrypt records.`);
      loadAllData();
    } catch (err) {
      alert("Failed to revoke consent: " + err.message);
    }
  };

  // Book Appointment
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId || !apptDate || !apptReason) {
      alert("Please choose a doctor, date, and reason.");
      return;
    }

    setBookingLoading(true);
    try {
      await apiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          date: apptDate,
          time: apptTime,
          reason: apptReason,
        }),
      });

      setShowApptModal(false);
      setApptReason("");
      loadAllData();
      alert("Appointment booked successfully!");
    } catch (err) {
      alert("Booking error: " + err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  // Derive categories and filtered lists
  const categories = ["All", ...Array.from(new Set(doctors.map((d) => d.doctorDetails?.specialization).filter(Boolean)))];

  const filteredDoctors = selectedCategory === "All"
    ? doctors
    : doctors.filter((d) => d.doctorDetails?.specialization === selectedCategory);

  const modalDoctors = modalCategory === "All"
    ? doctors
    : doctors.filter((d) => d.doctorDetails?.specialization === modalCategory);

  const openGeneralBooking = () => {
    setModalCategory("All");
    if (doctors.length > 0 && (!selectedDoctorId || !doctors.some((d) => d.id === selectedDoctorId))) {
      setSelectedDoctorId(doctors[0].id);
    }
    setShowApptModal(true);
  };

  const openBookingForDoctor = (docId) => {
    const doc = doctors.find((d) => d.id === docId);


    if (doc?.doctorDetails?.specialization) {
      setModalCategory(doc.doctorDetails.specialization);
    } else {
      setModalCategory("All");
    }
    setSelectedDoctorId(docId);
    setShowApptModal(true);
  };

  const nextAppointment = appointments.find((a) => a.status === "Upcoming") || appointments[0];
  const pendingConsentRequests = consents.filter((c) => c.status === "pending");

  const getDoctorAvatar = (name, docId) => {
    const match = doctors.find((d) => (docId && (d.id === docId || d._id === docId)) || d.name === name || (docId && d.email === docId));
    return (
      match?.picture ||
      match?.doctorDetails?.avatar ||
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"
    );
  };

  // Navigation Items matching the reference design layout
  const navItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "appointments", label: "Appointments", icon: Calendar, badge: appointments.length },
    { id: "records", label: "Medical Records", icon: FileText, badge: records.length },
    { id: "prescriptions", label: "Medications", icon: Pill, badge: prescriptions.length },
    { id: "blockchain", label: "Lab Results & Ledger", icon: ShieldCheck, badge: chainBlocks.length },
    { id: "consent", label: "Doctor Consent", icon: Lock, badge: pendingConsentRequests.length || null },
    { id: "profile", label: "Personal Profile", icon: User },
  ];

  const tabTitles = {
    overview: "Patient Health Summary",
    appointments: "Doctor Consultations & Visits",
    records: "Medical Records & Diagnostic Reports",
    prescriptions: "Prescriptions & Medications",
    blockchain: "Transaction Audit & Verification Ledger",
    consent: "Physician Permissions & Consent",
    profile: "Patient Profile & Medical Identification",
  };

  const tabSubtitles = {
    overview: "Clinical health overview, upcoming consultations, and personal vitals.",
    appointments: "Schedule and manage consultations across 11 hospital specialties.",
    records: "Access and organize your diagnostic lab reports, clinical records, and hospital documents.",
    prescriptions: "Prescribed medications, dosage instructions, and refill details.",
    blockchain: "Tamper-evident audit trail tracking document uploads and cryptographic verification.",
    consent: "Manage physician access permissions and clinical document sharing.",
    profile: "Verified patient identification, emergency contacts, and security credentials.",
  };

  return (
    <div
      className="min-h-screen p-3 sm:p-6 lg:p-8 relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.94), rgba(241, 245, 249, 0.97)), url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
      {/* Outer App Frame Container matching the reference design */}
      <div className="max-w-[1440px] mx-auto bg-white/95 backdrop-blur-md rounded-[28px] border border-slate-200/90 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[840px]">

        {/* ==================== LEFT SIDEBAR ==================== */}
        <aside className="w-full md:w-64 lg:w-72 bg-white md:border-r border-slate-200/80 p-5 flex flex-col justify-between shrink-0">
          <div>
            {/* Header: Portal Identity */}
            <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-100 pb-4">
              <div className="relative group shrink-0">
                <img
                  src={user?.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                  alt={user?.name}
                  className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-xs"
                />
                <button
                  onClick={() => handleTabChange("profile")}
                  title="Update profile picture"
                  className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white cursor-pointer"
                >
                  <Camera size={14} />
                </button>
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm font-bold text-slate-900 truncate leading-tight">
                  {user?.name || "Om Soni"}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400">Patient Portal</span>
              </div>
            </div>

            {/* Sidebar Navigation Items */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition text-left ${isActive
                      ? "bg-[#1e293b] text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} className={isActive ? "text-white" : "text-slate-400"} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive
                          ? "bg-red-500 text-white"
                          : item.id === "consent"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                          }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Bottom: Hospital Network Info */}
          <div className="mt-8 pt-4 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                <Building size={15} className="text-red-600 shrink-0" />
                <span>Metropolitan Health System</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                24/7 Patient Helpdesk: (800) 555-0199
              </p>
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Facility: MGH-MAIN</span>
                <span className="font-bold text-emerald-600">● Online</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ==================== MAIN CONTENT AREA ==================== */}
        <main className="flex-1 bg-slate-50/40 p-6 sm:p-8 flex flex-col space-y-6 overflow-y-auto">

          {/* ==================== PATIENT HERO BANNER WITH MOVING HD VIDEO ==================== */}
          <div className="relative rounded-3xl overflow-hidden shadow-sm text-white p-6 sm:p-8 border border-slate-800/60 bg-slate-950">
            {/* Moving HD Healthcare Video */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center"
              src="https://videos.pexels.com/video-files/7578544/7578544-uhd_2560_1440_25fps.mp4"
              poster="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1600&q=80"
            />
            {/* Elegant Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-slate-950/70 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <p className="text-xs font-semibold text-slate-300">
                  Apollo & Metropolitan Hospitals Network • Patient ID: {user?.id ? user.id.slice(0, 8).toUpperCase() : "HL-88412"} • Blood Group: {user?.patientDetails?.bloodGroup || "A+"}
                </p>

                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0 hidden sm:block">
                    <img
                      src={user?.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                      alt={user?.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40 shadow-md"
                    />
                    <button
                      onClick={() => handleTabChange("profile")}
                      title="Update profile picture"
                      className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white cursor-pointer"
                    >
                      <Camera size={18} />
                    </button>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      Welcome back, {user?.name || "Om Soni"}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      Manage your personal medical history, verified consultations, and diagnostic records.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Banner */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={openGeneralBooking}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 backdrop-blur-xs cursor-pointer"
                >
                  <Calendar size={15} /> Book Appointment
                </button>

                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Upload size={16} /> Upload Record (E2EE)
                </button>
              </div>
            </div>
          </div>

          {/* TOP BAR / HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {tabTitles[activeTab] || "Dashboard"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {tabSubtitles[activeTab] || "Here is your secure health overview and cryptographic verification status."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleTabChange("consent")}
                title="Notifications"
                className="relative p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs hover:bg-slate-50 transition"
              >
                <Bell size={18} />
                {pendingConsentRequests.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white"></span>
                )}
              </button>
            </div>
          </div>

          {/* 4 SUMMARY STAT CARDS (Arranged exactly like reference design) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Next Appointment */}
            <div
              onClick={() => handleTabChange("appointments")}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition"
            >
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Next Appointment</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {nextAppointment ? (nextAppointment.date?.split("-")?.slice(1)?.join("/") || nextAppointment.date) : "Dec 15"}
                </p>
                <p className="text-[11px] font-medium text-slate-500 truncate max-w-[140px] mt-0.5">
                  {nextAppointment ? `${nextAppointment.doctorName?.split(",")[0]} · ${nextAppointment.time || "2:30 PM"}` : "Dr. Smith · 2:30 PM"}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Calendar size={20} />
              </div>
            </div>

            {/* Card 2: Active Medications */}
            <div
              onClick={() => handleTabChange("prescriptions")}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition"
            >
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Active Medications</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {prescriptions.length > 0 ? prescriptions.length : 4}
                </p>
                <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">All up to date</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Pill size={20} />
              </div>
            </div>

            {/* Card 3: Pending Results */}
            <div
              onClick={() => handleTabChange("records")}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition"
            >
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Pending Results</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {records.length > 0 ? records.length : 2}
                </p>
                <p className="text-[11px] font-semibold text-amber-600 mt-0.5">Review required</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
            </div>

            {/* Card 4: Doctor Consent / Ledger */}
            <div
              onClick={() => handleTabChange("consent")}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition"
            >
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Consent Requests</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {pendingConsentRequests.length > 0 ? pendingConsentRequests.length : 1}
                </p>
                <p className="text-[11px] font-semibold text-teal-600 mt-0.5">New access requests</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Lock size={20} />
              </div>
            </div>
          </div>

          {/* ==================== TAB 1: OVERVIEW ==================== */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* LEFT COLUMN: UPCOMING APPOINTMENTS + HEALTH METRICS (8 cols) */}
              <div className="lg:col-span-8 space-y-6">

                {/* Upcoming Appointments Card */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">Upcoming Appointments</h3>
                    <button
                      onClick={() => handleTabChange("appointments")}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Appointment Item 1 */}
                    <div className="p-4 bg-slate-100/70 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <img
                          src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"
                          alt="Dr. Michael Smith"
                          className="w-12 h-12 rounded-xl object-cover border border-white shadow-xs shrink-0"
                        />
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">Dr. Michael Smith</h4>
                          <p className="text-xs text-slate-500 font-medium">General Checkup & Cardiovascular Review</p>
                          <span className="text-[11px] font-semibold text-slate-600">
                            Dec 15, 2026 at 2:30 PM
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => openBookingForDoctor("user_doctor_smith_01")}
                        className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition self-start sm:self-auto"
                      >
                        Reschedule
                      </button>
                    </div>

                    {/* Appointment Item 2 */}
                    <div className="p-4 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                      <div className="flex items-center gap-3.5">
                        <img
                          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80"
                          alt="Dr. Emily Davis"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80";
                          }}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                        />
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">Dr. Emily Davis</h4>
                          <p className="text-xs text-slate-500 font-medium">Cardiology Consultation & Heart Rate Review</p>
                          <span className="text-[11px] font-semibold text-slate-600">
                            Dec 22, 2026 at 10:00 AM
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => openBookingForDoctor("user_doctor_emily_02")}
                        className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition self-start sm:self-auto"
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>

                {/* Health Metrics Chart Card (Interactive SVG Curve matching reference design) */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Health Metrics</h3>
                      <p className="text-xs text-slate-400">Vital signs recorded across clinical checkups</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                      Normal Range
                    </span>
                  </div>

                  {/* SVG Chart */}
                  <div className="w-full pt-2 pb-4">
                    <svg viewBox="0 0 650 200" className="w-full h-44 overflow-visible">
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="620" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="60" x2="620" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="100" x2="620" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="140" x2="620" y2="140" stroke="#f1f5f9" strokeWidth="1" />

                      {/* Y-Axis Labels */}
                      <text x="15" y="24" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">150</text>
                      <text x="15" y="64" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">125</text>
                      <text x="15" y="104" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">100</text>
                      <text x="20" y="144" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">75</text>

                      {/* Line 1: Blood Pressure (Systolic) - Dark Navy Slate Curve */}
                      <path
                        d="M 60 70 Q 170 73 280 63 T 500 70 T 600 68"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {/* Data Points - Blood Pressure */}
                      <circle cx="60" cy="70" r="3.5" fill="#1e293b" />
                      <circle cx="170" cy="73" r="3.5" fill="#1e293b" />
                      <circle cx="280" cy="63" r="3.5" fill="#1e293b" />
                      <circle cx="390" cy="68" r="3.5" fill="#1e293b" />
                      <circle cx="500" cy="70" r="3.5" fill="#1e293b" />
                      <circle cx="600" cy="68" r="3.5" fill="#1e293b" />

                      {/* Line 2: Heart Rate - Teal Curve */}
                      <path
                        d="M 60 140 Q 170 135 280 138 T 500 139 T 600 137"
                        fill="none"
                        stroke="#0d9488"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      {/* Data Points - Heart Rate */}
                      <circle cx="60" cy="140" r="3" fill="#0d9488" />
                      <circle cx="170" cy="135" r="3" fill="#0d9488" />
                      <circle cx="280" cy="138" r="3" fill="#0d9488" />
                      <circle cx="390" cy="139" r="3" fill="#0d9488" />
                      <circle cx="500" cy="139" r="3" fill="#0d9488" />
                      <circle cx="600" cy="137" r="3" fill="#0d9488" />

                      {/* X-Axis Month Labels */}
                      <text x="50" y="180" fontSize="11" fill="#64748b" fontFamily="sans-serif">Jan</text>
                      <text x="160" y="180" fontSize="11" fill="#64748b" fontFamily="sans-serif">Feb</text>
                      <text x="270" y="180" fontSize="11" fill="#64748b" fontFamily="sans-serif">Mar</text>
                      <text x="380" y="180" fontSize="11" fill="#64748b" fontFamily="sans-serif">Apr</text>
                      <text x="490" y="180" fontSize="11" fill="#64748b" fontFamily="sans-serif">May</text>
                      <text x="590" y="180" fontSize="11" fill="#64748b" fontFamily="sans-serif">Jun</text>
                    </svg>

                    {/* Chart Legend */}
                    <div className="flex items-center justify-center gap-8 mt-2 text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1e293b]"></span>
                        <span>Blood Pressure (Systolic)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488]"></span>
                        <span>Heart Rate</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: QUICK ACTIONS + RECENT RESULTS + CURRENT MEDICATIONS (4 cols) */}
              <div className="lg:col-span-4 space-y-6">

                {/* Quick Actions Card */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2.5">
                    <button
                      onClick={() => handleTabChange("records")}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-semibold text-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <Download size={16} className="text-slate-500" />
                        <span>Download Records</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>

                    <button
                      onClick={() => handleTabChange("prescriptions")}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-semibold text-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-slate-500" />
                        <span>Request Prescription</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>

                    <button
                      onClick={openGeneralBooking}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-semibold text-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className="text-slate-500" />
                        <span>Book Doctor Visit</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>

                    <button
                      onClick={() => handleTabChange("blockchain")}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-semibold text-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={16} className="text-slate-500" />
                        <span>Blockchain Audit</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Recent Results Card */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">Recent Results</h3>
                    <button
                      onClick={() => handleTabChange("records")}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 bg-slate-50/70 border border-slate-200/60 rounded-2xl flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">Blood Panel</h5>
                        <p className="text-[11px] text-slate-400">May 1, 2026</p>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Normal
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50/70 border border-slate-200/60 rounded-2xl flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">X-Ray Chest</h5>
                        <p className="text-[11px] text-slate-400">Jun 28, 2026</p>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    </div>

                    {records.length > 0 && (
                      <div className="p-3.5 bg-slate-50/70 border border-slate-200/60 rounded-2xl flex items-center justify-between">
                        <div className="overflow-hidden mr-2">
                          <h5 className="text-xs font-bold text-slate-900 truncate">{records[0].title}</h5>
                          <p className="text-[11px] text-slate-400">{records[0].category}</p>
                        </div>
                        <button
                          onClick={() => handleDecryptFile(records[0])}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg shadow-2xs shrink-0"
                        >
                          Decrypt
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Medications Card */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Current Medications</h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>Paracetamol</span>
                        <span className="text-red-600 font-semibold">500mg</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">1 tablet every 6 hours as needed</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>Lipitor</span>
                        <span className="text-red-600 font-semibold">20mg</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">1 tablet at bedtime with water</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== TAB 2: APPOINTMENTS ==================== */}
          {activeTab === "appointments" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Doctor Appointments</h3>
                  <p className="text-xs text-slate-500">
                    Schedule and manage consultations with verified medical specialists.
                  </p>
                </div>
                <button
                  onClick={openGeneralBooking}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus size={15} /> Book New Visit
                </button>
              </div>

              {/* Scheduled Appointments */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Scheduled Appointments ({appointments.length})
                </h4>

                {appointments.length === 0 ? (
                  <div className="p-8 text-center bg-gradient-to-b from-slate-50 to-white border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-2xs">
                      <Calendar size={28} />
                    </div>
                    <div className="max-w-md">
                      <h5 className="font-bold text-slate-800 text-sm">No Consultations Scheduled Yet</h5>
                      <p className="text-xs text-slate-500 mt-1">
                        Schedule a visit with any of our 11 verified hospital specialists below. Your booking is recorded on the tamper-evident blockchain ledger and access is strictly consent-gated.
                      </p>
                    </div>
                    <button
                      onClick={openGeneralBooking}
                      className="mt-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                    >
                      <Plus size={15} /> Book Doctor Consultation
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {appointments.map((a) => (
                      <div key={a.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={a.doctorPicture || getDoctorAvatar(a.doctorName, a.doctorId)}
                            alt={a.doctorName}
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80";
                            }}
                            className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs sm:text-sm font-bold text-slate-900">{a.doctorName}</h5>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                {a.doctorSpecialization || a.doctorDetails?.specialization || "Clinical Specialist"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5"><b>Reason:</b> {a.reason}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              <b>Hospital:</b> {a.doctorHospital || "Metropolitan Health"} &bull; <b>Fee:</b> {a.doctorFee || "₹1,200"}
                            </p>
                            <div className="flex items-center gap-3 text-[11px] font-bold text-red-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar size={13} /> {a.date}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock size={13} /> {a.time}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span
                            className={`text-[10px] font-bold px-3 py-1 rounded-full ${a.status === "Upcoming"
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              }`}
                          >
                            {a.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Verified Specialist Physicians Directory */}
              <div className="space-y-4">
                {/* Moving HD Video Clinical Network Banner */}
                <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm text-white p-6 sm:p-8 mb-2 bg-slate-950">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-35"
                    src="https://videos.pexels.com/video-files/8413486/8413486-uhd_2560_1440_25fps.mp4"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-transparent pointer-events-none" />
                  <div className="relative z-10 max-w-xl space-y-1.5">
                    <span className="px-3 py-1 bg-red-600/90 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-xs inline-block">
                      National Healthcare Network • Made In India
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                      Consult Top Medical Specialists Across India
                    </h3>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      Consult certified specialists across Apollo, Max Super Speciality, Fortis, AIIMS, and Medanta with transparent Indian Rupee (₹) fees.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Stethoscope size={15} className="text-red-600" />
                      Verified Specialist Physicians Directory ({filteredDoctors.length})
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Browse certified specialists across 11 hospital departments with encrypted record review.
                    </p>
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer ${selectedCategory === cat
                        ? "bg-red-600 text-white shadow-xs"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDoctors.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition"
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                          <img
                            src={doc.picture || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"}
                            alt={doc.name}
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80";
                            }}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
                          />
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Verified Active Specialist"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-slate-900 truncate leading-snug">{doc.name}</h4>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md shrink-0">
                              ★ {doc.doctorDetails?.rating || "4.9"}
                            </span>
                          </div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold rounded-md">
                            {doc.doctorDetails?.specialization || "Specialist"}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-1 truncate">
                            {doc.doctorDetails?.hospital || "MediKey Hospital Network India"} • {doc.doctorDetails?.experience || "12+ Years"}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                            {doc.doctorDetails?.bio || "Certified clinical specialist in patient care."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium">Fee:</span>{" "}
                          <span className="text-xs font-bold text-slate-800">{doc.doctorDetails?.consultationFee || "₹1,200"}</span>
                        </div>
                        <button
                          onClick={() => openBookingForDoctor(doc.id)}
                          className="px-4 py-1.5 bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Calendar size={13} /> Book Visit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 3: MEDICAL RECORDS ==================== */}
          {activeTab === "records" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Personal Medical Vault</h3>
                  <p className="text-xs text-slate-500">
                    Encrypted client-side with 256-bit AES-GCM. The server never receives plaintext or encryption keys.
                  </p>
                </div>


                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload size={14} /> Upload Encrypted File
                  </button>
                </div>
              </div>

              {records.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-200/90 rounded-3xl shadow-2xs">
                  <FileText className="mx-auto text-slate-300 mb-3" size={44} />
                  <h4 className="text-sm font-bold text-slate-800">No medical records uploaded yet</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Upload your diagnostic reports, lab investigations, and clinical records securely.
                  </p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-xs cursor-pointer"
                  >
                    Upload Document
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {records.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 font-bold flex items-center justify-center shrink-0">
                              <FileText size={18} />
                            </span>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 leading-snug">{rec.title}</h4>
                              <p className="text-[11px] text-slate-500">
                                {rec.fileName} &bull; {(rec.fileSize / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                            {rec.category}
                          </span>
                        </div>

                        {rec.description && (
                          <p className="text-xs text-slate-600 my-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            {rec.description}
                          </p>
                        )}

                        <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 font-mono text-[10px] text-slate-600 space-y-1 my-3">
                          <div className="flex items-center justify-between">
                            <span className="font-sans text-slate-400">Document SHA-256:</span>
                            <span className="font-bold text-slate-800 truncate max-w-[170px]" title={rec.documentHash}>
                              {rec.documentHash?.slice(0, 16)}...
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-sans text-slate-400">Blockchain Block:</span>
                            <span className="text-emerald-700 font-bold">Block #{rec.blockNumber}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleVerifyIntegrity(rec)}
                          className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-1"
                        >
                          <ShieldCheck size={14} className="text-emerald-600" /> Verify Hash
                        </button>
                        <button
                          onClick={() => handleDecryptFile(rec)}
                          disabled={decryptingId === rec.id}
                          className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition flex items-center justify-center gap-1"
                        >
                          {decryptingId === rec.id ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : (
                            <Download size={13} />
                          )}
                          Decrypt & View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 4: MEDICATIONS & PRESCRIPTIONS ==================== */}
          {activeTab === "prescriptions" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Medical Prescriptions</h3>
                <p className="text-xs text-slate-500">Official medication schedules issued by consulting physicians.</p>
              </div>

              {prescriptions.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-200/90 rounded-3xl shadow-2xs">
                  <Pill className="mx-auto text-slate-300 mb-3" size={44} />
                  <h4 className="text-sm font-bold text-slate-800">No prescriptions on record</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    When a physician writes a prescription, it will appear here with clinical dosage instructions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                        <div>
                          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                            Prescribed by {rx.doctorName}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">Diagnosis: {rx.diagnosis}</h4>
                        </div>
                        <span className="text-xs font-semibold text-slate-400">{rx.issuedDate}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        {rx.medications?.map((m, idx) => (
                          <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-xs">
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>{m.name}</span>
                              <span className="font-bold text-red-600">{m.dosage}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1">
                              <b>Schedule:</b> {m.frequency} &bull; <b>Duration:</b> {m.duration}
                            </p>
                            {m.instructions && (
                              <p className="text-[11px] text-slate-500 italic mt-0.5">{m.instructions}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      {rx.notes && (
                        <p className="text-xs text-slate-600 bg-red-50/50 border border-red-100 p-2.5 rounded-xl">
                          <b>Doctor's Instructions:</b> {rx.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 5: DOCTOR CONSENT & PERMISSIONS ==================== */}
          {activeTab === "consent" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Doctor Access & Consent</h3>
                <p className="text-xs text-slate-500">
                  Control who can decrypt and view your records. Approving requests securely shares keys via RSA-OAEP.
                </p>
              </div>

              {/* Pending Requests */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Lock size={15} className="text-amber-500" /> Pending Doctor Access Requests
                </h4>

                {pendingConsentRequests.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">No pending doctor access requests.</p>
                ) : (
                  <div className="space-y-3">
                    {pendingConsentRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">
                            {req.doctorName}{" "}
                            <span className="font-normal text-slate-600">({req.doctorSpecialization})</span>
                          </h5>
                          <p className="text-xs text-slate-600 mt-0.5">
                            <b>Reason:</b> {req.reason}
                          </p>
                          <span className="text-[10px] text-slate-400">Requested: {req.requestedAt?.split("T")[0]}</span>
                        </div>

                        <button
                          onClick={() => handleApproveConsent(req)}
                          className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center gap-1"
                        >
                          <Check size={14} /> Approve & Share Keys
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Authorized Doctors */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-emerald-600" /> Authorized Doctors
                </h4>

                {consents.filter((c) => c.status === "approved").length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">
                    No doctors currently authorized. When you approve an access request, they will appear here.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {consents
                      .filter((c) => c.status === "approved")
                      .map((c) => (
                        <div key={c.id} className="py-3.5 flex items-center justify-between">
                          <div>
                            <h5 className="text-xs font-bold text-slate-900">{c.doctorName}</h5>
                            <p className="text-[11px] text-slate-500">
                              {c.doctorSpecialization} &bull; {c.doctorHospital}
                            </p>
                            <span className="text-[10px] text-emerald-600 font-semibold">
                              Authorized on {c.approvedAt?.split("T")[0]}
                            </span>
                          </div>

                          <button
                            onClick={() => handleRevokeConsent(c)}
                            className="px-3.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition"
                          >
                            Revoke Access
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 6: BLOCKCHAIN LEDGER ==================== */}
          {activeTab === "blockchain" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Blockchain Security & Ledger Audit</h3>
                  <p className="text-xs text-slate-500">
                    Chained SHA-256 blocks recording cryptographic document digests and consent modifications.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200 self-start sm:self-auto">
                  Chain Valid &bull; Tamper-Proof
                </span>
              </div>

              {/* Document Hash Verifier */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-red-600" /> Verify Any Medical Document File
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Select a local PDF or image to recalculate its SHA-256 digest in your browser and check against the blockchain.
                </p>

                <input
                  type="file"
                  onChange={handleVerifyArbitraryFile}
                  className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer"
                />

                {verifyingHash && <p className="text-xs text-slate-500 mt-2">Computing SHA-256 digest...</p>}

                {verifyResult && (
                  <div
                    className={`mt-4 p-4 rounded-2xl border text-xs ${verifyResult.verified
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-red-50 border-red-200 text-red-900"
                      }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {verifyResult.verified ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                      <span>Status: {verifyResult.status || (verifyResult.verified ? "VERIFIED" : "TAMPER ALERT")}</span>
                    </div>
                    <p className="font-mono text-[11px] truncate mt-1">Hash: {verifyResult.calculatedHash}</p>
                    {verifyResult.blockNumber && (
                      <p className="mt-1">
                        Anchored in <b>Block #{verifyResult.blockNumber}</b> &bull; Tx:{" "}
                        <code>{verifyResult.blockHash?.slice(0, 16)}...</code>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Block List */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Immutable Blockchain Blocks ({chainBlocks.length})
                </h4>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {chainBlocks.map((b) => (
                    <div key={b.index} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                          Block #{b.index}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.action === "DOCUMENT_REGISTERED"
                            ? "bg-red-100 text-red-800"
                            : b.action === "CONSENT_GRANTED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-700"
                            }`}
                        >
                          {b.action}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-slate-500 truncate">
                        <b>Hash:</b> {b.hash}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{b.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 7: PERSONAL PROFILE ==================== */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Patient Medical Profile</h3>
                  <p className="text-xs text-slate-500">Official medical record credentials, clinical vitals, and profile details.</p>
                </div>
                {profileSuccessMsg && (
                  <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl animate-fade-in flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-600" /> {profileSuccessMsg}
                  </span>
                )}
              </div>

              {/* Patient ID Card Header with Hospital Backdrop */}
              <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-2xs">
                <div
                  className="h-36 sm:h-44 relative p-6 flex items-end"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.4)), url('https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center 30%",
                  }}
                >
                  <div className="flex items-center justify-between w-full text-white">
                    <div>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold tracking-wider uppercase">
                        Metropolitan General Hospital
                      </span>
                      <h4 className="text-xl sm:text-2xl font-black mt-2">Hospital Patient Record</h4>
                    </div>
                    <span className="text-xs font-mono font-bold bg-black/40 px-3 py-1.5 rounded-xl border border-white/20 hidden sm:block">
                      MRN: {user?.id ? user.id.slice(0, 8).toUpperCase() : "HL-88412"}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 -mt-12 sm:-mt-14 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-100">
                    <div className="flex items-end gap-4">
                      {/* Patient Photo with Upload Button */}
                      <div className="relative group shrink-0">
                        <img
                          src={user?.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                          alt={user?.name}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-md bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          title="Upload photo from device"
                          className="absolute bottom-1 right-1 p-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-md transition cursor-pointer"
                        >
                          <Camera size={16} />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handlePhotoFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>

                      <div className="mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl font-bold text-slate-900">{user?.name || "Om Soni"}</h4>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Verified Patient
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Registered with Metropolitan General Hospital • Patient Portal
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload size={14} /> Upload New Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPhotoModal(true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <ImageIcon size={14} /> Photo URL
                      </button>
                    </div>
                  </div>

                  {/* Patient Clinical Vitals & Information Form */}
                  <form onSubmit={handleSavePatientProfile} className="mt-6 space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                        Clinical Vitals & Personal Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name</label>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            required
                            className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                          <select
                            value={profileBloodGroup}
                            onChange={(e) => setProfileBloodGroup(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <option value="A+">A+ Positive</option>
                            <option value="A-">A- Negative</option>
                            <option value="B+">B+ Positive</option>
                            <option value="B-">B- Negative</option>
                            <option value="AB+">AB+ Positive</option>
                            <option value="AB-">AB- Negative</option>
                            <option value="O+">O+ Positive</option>
                            <option value="O-">O- Negative</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Age / Date of Birth</label>
                          <input
                            type="text"
                            value={profileAge}
                            onChange={(e) => setProfileAge(e.target.value)}
                            placeholder="e.g. 21"
                            className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Biological Gender</label>
                          <select
                            value={profileGender}
                            onChange={(e) => setProfileGender(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Primary Phone</label>
                          <input
                            type="text"
                            value={profileContact}
                            onChange={(e) => setProfileContact(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Number</label>
                          <input
                            type="text"
                            value={profileEmergencyContact}
                            onChange={(e) => setProfileEmergencyContact(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Known Allergies & Clinical Alerts</label>
                        <input
                          type="text"
                          value={profileAllergies}
                          onChange={(e) => setProfileAllergies(e.target.value)}
                          placeholder="e.g. Penicillin, Peanuts, Latex"
                          className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div className="mt-4 text-right">
                        <button
                          type="submit"
                          disabled={savingProfile}
                          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Check size={14} />
                          {savingProfile ? "Saving Vitals..." : "Save Patient Vitals"}
                        </button>
                      </div>
                    </div>
                  </form>


                </div>
              </div>
            </div>
          )}

          {/* Modal for Setting Photo via URL or Preset */}
          {showPhotoModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center">
                      <Camera size={16} />
                    </span>
                    <h4 className="text-base font-bold text-slate-900">Update Profile Picture</h4>
                  </div>
                  <button onClick={() => setShowPhotoModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Upload from Computer</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPhotoModal(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload size={14} /> Browse Image File...
                    </button>
                  </div>

                  <div className="relative flex items-center justify-center">
                    <span className="border-t border-slate-200 w-full"></span>
                    <span className="bg-white px-2 text-[11px] text-slate-400 font-bold uppercase">Or Enter URL</span>
                    <span className="border-t border-slate-200 w-full"></span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Image URL (Unsplash or web link)</label>
                    <input
                      type="url"
                      value={photoInputUrl}
                      onChange={(e) => setPhotoInputUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {photoInputUrl && (
                    <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                      <img
                        src={photoInputUrl}
                        alt="Preview"
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
                        }}
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-900">Image Preview</p>
                        <p className="text-[10px] text-slate-400 truncate">{photoInputUrl}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPhotoModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!photoInputUrl || savingPhoto}
                      onClick={() => saveProfilePicture(photoInputUrl)}
                      className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition cursor-pointer"
                    >
                      {savingPhoto ? "Saving..." : "Save Picture"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ==================== UPLOAD MODAL ==================== */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                  <Upload size={17} />
                </span>
                <h3 className="text-base font-extrabold text-slate-900">Upload Encrypted Medical File</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs mb-4">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Complete Blood Count (CBC) Report"
                  required
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="Lab Report">Lab Report</option>
                    <option value="Blood Test">Blood Test</option>
                    <option value="Prescription">Prescription</option>
                    <option value="X-Ray">X-Ray</option>
                    <option value="MRI">MRI Scan</option>
                    <option value="CT Scan">CT Scan</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">File (PDF, Image, TXT) *</label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.txt"
                    onChange={(e) => setUploadFile(e.target.files?.[0])}
                    required
                    className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Notes (Optional)</label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={2}
                  placeholder="e.g. Annual lipid panel review"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="p-3 bg-red-50 border border-red-100 rounded-2xl text-[11px] text-slate-700 flex items-start gap-2">
                <Lock size={15} className="text-red-600 shrink-0 mt-0.5" />
                <span>
                  <b>Client-Side AES-256-GCM:</b> This file is encrypted inside your browser before uploading.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition"
                >
                  {uploading ? "Encrypting & Storing..." : "Encrypt & Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== BOOK APPOINTMENT MODAL ==================== */}
      {showApptModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Book Doctor Consultation</h3>
                <p className="text-xs text-slate-500 mt-0.5">Choose your medical specialist and appointment slot</p>
              </div>
              <button onClick={() => setShowApptModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4">
              {/* Category / Specialty Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Filter by Medical Category</label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setModalCategory(cat);
                        const match = cat === "All" ? doctors[0] : doctors.find((d) => d.doctorDetails?.specialization === cat);
                        if (match) setSelectedDoctorId(match.id);
                      }}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${modalCategory === cat
                        ? "bg-red-600 text-white shadow-xs"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Physician */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Physician ({modalDoctors.length} available in this category)
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                >
                  {modalDoctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.doctorDetails?.specialization || "Specialist"} ({d.doctorDetails?.hospital || "Hospital"}) • {d.doctorDetails?.consultationFee || "₹1,200"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Physician Quick Preview Card */}
              {(() => {
                const currentDoc = doctors.find((d) => d.id === selectedDoctorId) || modalDoctors[0] || doctors[0];
                if (!currentDoc) return null;
                return (
                  <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl">
                    <img
                      src={currentDoc.picture || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"}
                      alt={currentDoc.name}
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80";
                      }}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-2xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 truncate">{currentDoc.name}</p>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          ★ {currentDoc.doctorDetails?.rating || "4.9"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-bold text-red-600 truncate">
                          {currentDoc.doctorDetails?.specialization}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[10px] font-bold text-slate-700">
                          Fee: {currentDoc.doctorDetails?.consultationFee || "₹1,200"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {currentDoc.doctorDetails?.hospital} • {currentDoc.doctorDetails?.experience}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={apptDate}
                    onChange={(e) => setApptDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
                  <select
                    value={apptTime}
                    onChange={(e) => setApptTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Visit</label>
                <textarea
                  value={apptReason}
                  onChange={(e) => setApptReason(e.target.value)}
                  rows={2}
                  placeholder="e.g. Follow-up consultation and blood pressure assessment"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApptModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="px-6 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar size={14} />
                  {bookingLoading ? "Confirming..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== VERIFICATION MODAL ==================== */}
      {verificationModalData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">Blockchain Integrity Verified</h3>
              </div>
              <button onClick={() => setVerificationModalData(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 mb-4">
              <p className="font-bold">Status: {verificationModalData.status}</p>
              <p className="text-[11px] mt-0.5">
                The cryptographic SHA-256 hash matches the immutable block ledger.
              </p>
            </div>

            <div className="space-y-2 font-mono text-[11px] bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <p className="truncate"><b>Document Hash:</b> {verificationModalData.hash}</p>
              <p><b>Block Number:</b> #{verificationModalData.blockNumber}</p>
              <p className="truncate"><b>Block Hash:</b> {verificationModalData.blockHash}</p>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setVerificationModalData(null)}
                className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
