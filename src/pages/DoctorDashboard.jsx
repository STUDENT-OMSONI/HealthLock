import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Stethoscope,
  Users,
  FileText,
  Calendar,
  Pill,
  Lock,
  Download,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  ChevronRight,
  User,
  ShieldCheck,
  Check,
  X,
  FileCheck2,
  Clock,
  Sparkles,
  ExternalLink,
  Activity,
  LayoutDashboard,
  Bell,
  Trash2,
  UserCheck,
  Building,
  Award,
  Camera,
  Image as ImageIcon,
  Copy,
  Shield,
  KeyRound,
  Upload,
} from "lucide-react";
import { apiFetch, getUser, getLocalPrivateKey, storePrivateKeyLocally } from "../auth";
import {
  generateUserKeyPair,
  decryptDocumentClientSide,
  computeSHA256,
} from "../services/cryptoService";

export default function DoctorDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctor, setDoctor] = useState(getUser());

  // Derive active tab directly from URL search params for instant sync with navbar and sidebar
  const activeTab = searchParams.get("tab") || "overview";

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  // Data states
  const [patients, setPatients] = useState([]);
  const [allRegisteredPatients, setAllRegisteredPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Request Access Modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestPatientEmail, setRequestPatientEmail] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  // Create Prescription Modal
  const [showRxModal, setShowRxModal] = useState(false);
  const [rxPatientId, setRxPatientId] = useState("");
  const [rxDiagnosis, setRxDiagnosis] = useState("");
  const [rxMedications, setRxMedications] = useState([
    { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
  ]);
  const [rxNotes, setRxNotes] = useState("");
  const [rxLoading, setRxLoading] = useState(false);

  // Decryption state
  const [decryptingId, setDecryptingId] = useState(null);
  const [decryptedUrls, setDecryptedUrls] = useState({});
  const [verificationModalData, setVerificationModalData] = useState(null);

  // Appointment notes modal
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [consultNotes, setConsultNotes] = useState("");
  const [apptStatus, setApptStatus] = useState("Completed");
  const [savingNotes, setSavingNotes] = useState(false);

  // Doctor profile editor & photo state
  const docFileInputRef = useRef(null);
  const [showDocPhotoModal, setShowDocPhotoModal] = useState(false);
  const [docPhotoUrl, setDocPhotoUrl] = useState("");
  const [savingDocPhoto, setSavingDocPhoto] = useState(false);
  const [docSuccessMsg, setDocSuccessMsg] = useState("");
  const [showDocKey, setShowDocKey] = useState(false);
  const [docKeyCopied, setDocKeyCopied] = useState(false);

  const [profileName, setProfileName] = useState(doctor?.name || "");
  const [profileHospital, setProfileHospital] = useState(doctor?.doctorDetails?.hospital || "Metropolitan General Hospital");
  const [profileSpecialization, setProfileSpecialization] = useState(doctor?.doctorDetails?.specialization || "Cardiology Specialist");
  const [profileLicense, setProfileLicense] = useState(doctor?.doctorDetails?.licenseNumber || "MED-CA-98741");
  const [profileFee, setProfileFee] = useState(doctor?.doctorDetails?.consultationFee || "₹1,200");
  const [profileExperience, setProfileExperience] = useState(doctor?.doctorDetails?.experience || "15+ Years Experience");
  const [profileBio, setProfileBio] = useState(doctor?.doctorDetails?.bio || "Board-certified clinical specialist dedicated to patient wellness and diagnostics.");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (doctor) {
      setProfileName(doctor.name || "");
      if (doctor.doctorDetails) {
        setProfileHospital(doctor.doctorDetails.hospital || "Metropolitan General Hospital");
        setProfileSpecialization(doctor.doctorDetails.specialization || "Cardiology Specialist");
        setProfileLicense(doctor.doctorDetails.licenseNumber || "MED-CA-98741");
        setProfileFee(doctor.doctorDetails.consultationFee || "₹1,200");
        setProfileExperience(doctor.doctorDetails.experience || "15+ Years Experience");
        setProfileBio(doctor.doctorDetails.bio || "Board-certified clinical specialist.");
      }
    }
  }, [doctor]);

  const handleDocPhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image file under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      saveDoctorPicture(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const saveDoctorPicture = async (picUrl) => {
    if (!picUrl) return;
    setSavingDocPhoto(true);
    try {
      const res = await apiFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ picture: picUrl }),
      });
      if (res.user) {
        localStorage.setItem("healthlock_user", JSON.stringify(res.user));
        setDoctor(res.user);
        setDocSuccessMsg("Doctor profile photo updated successfully!");
        setTimeout(() => setDocSuccessMsg(""), 3500);
      }
    } catch (err) {
      alert("Failed to update photo: " + err.message);
    } finally {
      setSavingDocPhoto(false);
      setShowDocPhotoModal(false);
      setDocPhotoUrl("");
    }
  };

  // Default patient avatar mapping
  const patientPhotoMap = {
    "patient.jessica@healthlock.com": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    "omsoni2006456@gmail.com": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    "om27ec015@satiengg.in": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  };

  const getPatientPhoto = (email, id) => {
    const livePat = allRegisteredPatients.find((p) => (id && p.id === id) || p.email === email);
    if (livePat?.picture) return livePat.picture;
    return (
      patientPhotoMap[email] ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
    );
  };

  // Auto-heal doctor encryption keys if missing
  const ensureDoctorKeys = async () => {
    const currentDoc = getUser();
    if (!currentDoc || !currentDoc.id) return { publicKey: null, privateKey: null };

    let privKey = getLocalPrivateKey(currentDoc.id);
    let pubKey = currentDoc.publicKey;

    if (!privKey || !pubKey) {
      try {
        const keys = await generateUserKeyPair();
        storePrivateKeyLocally(currentDoc.id, keys.privateKey);

        const res = await apiFetch("/api/auth/profile", {
          method: "PATCH",
          body: JSON.stringify({ publicKey: keys.publicKey }),
        });

        if (res.user) {
          localStorage.setItem("healthlock_user", JSON.stringify(res.user));
          setDoctor(res.user);
        }
        return keys;
      } catch (err) {
        console.warn("Doctor keygen warning:", err);
      }
    }
    return { publicKey: pubKey, privateKey: privKey };
  };

  const loadDoctorData = async () => {
    setLoading(true);
    try {
      await ensureDoctorKeys();

      const [recRes, apptRes, rxRes, conRes, allPatRes] = await Promise.all([
        apiFetch("/api/records").catch(() => ({ records: [] })),
        apiFetch("/api/appointments").catch(() => ({ appointments: [] })),
        apiFetch("/api/prescriptions").catch(() => ({ prescriptions: [] })),
        apiFetch("/api/consent/doctor").catch(() => ({ consents: [] })),
        apiFetch("/api/auth/patients").catch(() => ({ patients: [] })),
      ]);

      setRecords(recRes.records || []);
      setAppointments(apptRes.appointments || []);
      setPrescriptions(rxRes.prescriptions || []);
      setSentRequests(conRes.consents || []);
      setAllRegisteredPatients(allPatRes.patients || []);

      // Extract unique consented patients with live updated profiles
      const approvedConsents = (conRes.consents || []).filter((c) => c.status === "approved");
      const uniquePatients = [];
      const seen = new Set();
      for (const c of approvedConsents) {
        if (!seen.has(c.patientId)) {
          seen.add(c.patientId);
          const livePat = (allPatRes.patients || []).find((p) => p.id === c.patientId || p.email === c.patientEmail);
          uniquePatients.push({
            id: c.patientId,
            name: livePat?.name || c.patientName,
            email: c.patientEmail,
            picture: livePat?.picture || null,
            patientDetails: livePat?.patientDetails || {},
            approvedAt: c.approvedAt,
          });
        }
      }
      setPatients(uniquePatients);

      if (allPatRes.patients?.length > 0 && !rxPatientId) {
        setRxPatientId(allPatRes.patients[0].id);
      } else if (uniquePatients.length > 0 && !rxPatientId) {
        setRxPatientId(uniquePatients[0].id);
      }
    } catch (err) {
      console.error("Doctor dashboard loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorData();
  }, []);

  // Doctor Request Patient Access
  const handleSendAccessRequest = async (e) => {
    e.preventDefault();
    if (!requestPatientEmail) {
      setRequestError("Please select or enter the patient's registered email.");
      return;
    }

    setRequestLoading(true);
    setRequestError("");
    setRequestSuccess("");

    try {
      await apiFetch("/api/consent/request", {
        method: "POST",
        body: JSON.stringify({
          patientEmail: requestPatientEmail.trim(),
          reason: requestReason || "Clinical evaluation and medical history review.",
        }),
      });

      setRequestSuccess(`Access request sent to ${requestPatientEmail}. Waiting for patient approval.`);
      setRequestPatientEmail("");
      setRequestReason("");
      loadDoctorData();
      setTimeout(() => setShowRequestModal(false), 1200);
    } catch (err) {
      setRequestError(err.message || "Failed to submit access request.");
    } finally {
      setRequestLoading(false);
    }
  };

  // Doctor Decrypt Patient Medical Record
  const handleDecryptPatientRecord = async (record) => {
    if (decryptedUrls[record.id]) {
      window.open(decryptedUrls[record.id], "_blank");
      return;
    }

    setDecryptingId(record.id);
    try {
      const currentDoc = getUser();
      const privateKey = getLocalPrivateKey(currentDoc?.id);

      const result = await decryptDocumentClientSide(
        record.encryptedData,
        record.iv,
        record.doctorEncryptedKey,
        privateKey,
        record.fileType || "text/html",
        record.rawKey
      );

      setDecryptedUrls((prev) => ({ ...prev, [record.id]: result.blobUrl }));
      window.open(result.blobUrl, "_blank");
    } catch (err) {
      alert("Decryption failed: " + err.message);
    } finally {
      setDecryptingId(null);
    }
  };

  // Verify Blockchain Hash
  const handleVerifyRecordHash = async (record) => {
    try {
      const res = await apiFetch(`/api/records/${record.id}/verify`, {
        method: "POST",
        body: JSON.stringify({ hash: record.documentHash }),
      });
      setVerificationModalData(res);
    } catch (err) {
      alert("Blockchain verification query error: " + err.message);
    }
  };

  // Medication rows for prescription writer
  const addMedicationRow = () => {
    setRxMedications([
      ...rxMedications,
      { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
    ]);
  };

  const removeMedicationRow = (index) => {
    if (rxMedications.length > 1) {
      setRxMedications(rxMedications.filter((_, i) => i !== index));
    }
  };

  const updateMedicationRow = (index, field, val) => {
    const updated = [...rxMedications];
    updated[index][field] = val;
    setRxMedications(updated);
  };

  // Submit Prescription
  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (!rxPatientId || !rxDiagnosis) {
      alert("Please select a patient and diagnosis.");
      return;
    }

    const validMeds = rxMedications.filter((m) => m.name.trim() !== "");
    if (validMeds.length === 0) {
      alert("Please enter at least one medication.");
      return;
    }

    setRxLoading(true);
    try {
      await apiFetch("/api/prescriptions", {
        method: "POST",
        body: JSON.stringify({
          patientId: rxPatientId,
          diagnosis: rxDiagnosis.trim(),
          medications: validMeds,
          notes: rxNotes.trim(),
        }),
      });

      setShowRxModal(false);
      setRxDiagnosis("");
      setRxNotes("");
      setRxMedications([{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }]);
      loadDoctorData();
      alert("Prescription officially issued! It is now visible on the patient's dashboard.");
    } catch (err) {
      alert("Failed to issue prescription: " + err.message);
    } finally {
      setRxLoading(false);
    }
  };

  // Update Appointment Notes
  const handleSaveApptNotes = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;

    setSavingNotes(true);
    try {
      await apiFetch(`/api/appointments/${selectedAppt.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          consultationNotes: consultNotes.trim(),
          status: apptStatus,
        }),
      });

      setSelectedAppt(null);
      loadDoctorData();
      alert("Consultation notes saved and appointment status updated!");
    } catch (err) {
      alert("Error saving consultation notes: " + err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  // Save Doctor Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await apiFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: profileName.trim(),
          picture: doctor?.picture,
          doctorDetails: {
            hospital: profileHospital.trim(),
            specialization: profileSpecialization.trim(),
            licenseNumber: profileLicense.trim(),
            consultationFee: profileFee.trim(),
            experience: profileExperience.trim(),
            bio: profileBio.trim(),
          },
        }),
      });

      if (res.user) {
        localStorage.setItem("healthlock_user", JSON.stringify(res.user));
        setDoctor(res.user);
        setDocSuccessMsg("Doctor credentials & profile updated successfully!");
        setTimeout(() => setDocSuccessMsg(""), 3500);
      }
      alert("Doctor profile & consultation credentials saved successfully! All patients can now view your updated details.");
    } catch (err) {
      alert("Error saving profile: " + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const openApptModal = (appt) => {
    setSelectedAppt(appt);
    setConsultNotes(appt.consultationNotes || "");
    setApptStatus(appt.status || "Completed");
  };

  const openRxModalForPatient = (patId) => {
    setRxPatientId(patId);
    setShowRxModal(true);
  };

  const openRequestModalForPatient = (email) => {
    setRequestPatientEmail(email);
    setShowRequestModal(true);
  };

  const upcomingAppts = appointments.filter((a) => a.status === "Upcoming");
  const pendingRequestsCount = sentRequests.filter((r) => r.status === "pending").length;

  const navItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "patients", label: "Assigned Patients", icon: Users, badge: allRegisteredPatients.length || patients.length },
    { id: "records", label: "Patient Records (E2EE)", icon: FileText, badge: records.length },
    { id: "appointments", label: "Appointments", icon: Calendar, badge: appointments.length },
    { id: "prescriptions", label: "Issue Prescriptions", icon: Pill, badge: prescriptions.length },
    { id: "requests", label: "Access Requests", icon: Lock, badge: pendingRequestsCount || null },
    { id: "profile", label: "Profile & Verification", icon: UserCheck },
  ];

  const tabTitles = {
    overview: "Doctor Consultation Portal",
    patients: "Assigned Patients Directory",
    records: "Patient Medical Documentation",
    appointments: "Patient Appointments & Visits",
    prescriptions: "Medical Prescriptions Issued",
    requests: "Clinical Record Access Requests",
    profile: "Physician Profile & Credentials",
  };

  const tabSubtitles = {
    overview: "Clinical department summary, daily consultation schedule, and patient arrivals.",
    patients: "Patient roster, medical vitals, consultation history, and active clinical consents.",
    records: "Authorized diagnostic reports and clinical documents released for consultation.",
    appointments: "Upcoming patient consultations, clinical notes, and visit management.",
    prescriptions: "Digital prescriptions, medication instructions, and dosage schedules signed by you.",
    requests: "Patient record authorization requests sent under clinical consent protocol.",
    profile: "Hospital affiliations, state medical license credentials, and clinic contact information.",
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
      {/* Outer App Frame Container matching Patient Dashboard */}
      <div className="max-w-[1440px] mx-auto bg-white/95 backdrop-blur-md rounded-[28px] border border-slate-200/90 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[840px]">
        
        {/* ==================== LEFT SIDEBAR ==================== */}
        <aside className="w-full md:w-64 lg:w-72 bg-white md:border-r border-slate-200/80 p-5 flex flex-col justify-between shrink-0">
          <div>
            {/* Header: Doctor Identity */}
            <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-100 pb-4">
              <div className="relative group shrink-0">
                <img
                  src={doctor?.picture || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"}
                  alt={doctor?.name || "Doctor"}
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80";
                  }}
                  className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => handleTabChange("profile")}
                  title="Update profile photo"
                  className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white cursor-pointer"
                >
                  <Camera size={14} />
                </button>
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm font-bold text-slate-900 truncate leading-tight">
                  {doctor?.name || "Dr. Michael Smith, MD"}
                </h3>
                <span className="text-[11px] font-semibold text-red-600 block truncate">
                  {doctor?.doctorDetails?.specialization || "Cardiology Specialist"}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Doctor Portal</span>
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
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition text-left ${
                      isActive
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
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-red-500 text-white"
                            : item.id === "requests"
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

          {/* Sidebar Bottom: Admin Verification Status Card */}
          <div className="mt-8 pt-4 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Verified by Admin</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                License: <b>{doctor?.doctorDetails?.licenseNumber || "MED-CA-98741"}</b>
              </p>
              <p className="text-[10px] text-emerald-700/80 mt-1 truncate">
                {doctor?.doctorDetails?.hospital || "Metropolitan General Hospital"}
              </p>
            </div>
          </div>
        </aside>

        {/* ==================== MAIN CONTENT AREA ==================== */}
        <main className="flex-1 bg-slate-50/40 p-6 sm:p-8 flex flex-col space-y-6 overflow-y-auto">
          
          {/* ==================== DOCTOR HERO BANNER WITH MOVING HD VIDEO ==================== */}
          <div className="relative rounded-3xl overflow-hidden shadow-md text-white p-6 sm:p-8 border border-slate-800 bg-slate-950">
            {/* Moving HD Doctor & Clinical Care Video */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center"
              src="https://videos.pexels.com/video-files/8413486/8413486-uhd_2560_1440_25fps.mp4"
              poster="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=80"
            />
            {/* Ambient Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-slate-950/70 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <p className="text-xs font-semibold text-slate-300">
                  {doctor?.doctorDetails?.hospital || "Metropolitan General Hospital"} • Department of {doctor?.doctorDetails?.specialization || "Cardiology Specialist"} • License: {doctor?.doctorDetails?.licenseNumber || "MED-CA-98741"}
                </p>

                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0 hidden sm:block">
                    <img
                      src={doctor?.picture || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"}
                      alt={doctor?.name}
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80";
                      }}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white/40 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleTabChange("profile")}
                      title="Update doctor photo"
                      className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white cursor-pointer"
                    >
                      <Camera size={18} />
                    </button>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      Welcome back, {doctor?.name || "Dr. Michael Smith, MD"}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      Review authorized patient documentation, manage consultations, and issue certified digital prescriptions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Banner */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 backdrop-blur-xs cursor-pointer"
                >
                  <Lock size={15} /> Request Access
                </button>

                <button
                  onClick={() => setShowRxModal(true)}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={16} /> Write Prescription
                </button>
              </div>
            </div>
          </div>

          {/* TOP BAR / HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {tabTitles[activeTab] || "Doctor Consultation Portal"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {tabSubtitles[activeTab] || "Manage your consultations, patient consent approvals, and clinical documentation."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleTabChange("requests")}
                title="Notifications"
                className="relative p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs hover:bg-slate-50 transition"
              >
                <Bell size={18} />
                {pendingRequestsCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white"></span>
                )}
              </button>
            </div>
          </div>

          {/* 4 SUMMARY STAT CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Scheduled Appointments */}
            <div
              onClick={() => handleTabChange("appointments")}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition"
            >
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Scheduled Visits</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{appointments.length}</p>
                <p className="text-[11px] font-medium text-red-600 mt-0.5">
                  {upcomingAppts.length} upcoming consultations
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Calendar size={20} />
              </div>
            </div>

            {/* Card 2: Assigned Patients */}
            <div
              onClick={() => handleTabChange("patients")}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition"
            >
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Assigned Patients</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {allRegisteredPatients.length || patients.length}
                </p>
                <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                  {patients.length} active consents
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
            </div>

            {/* Card 3: Decryptable Records */}
            <div
              onClick={() => handleTabChange("records")}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition"
            >
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Decryptable Files</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{records.length}</p>
                <p className="text-[11px] font-semibold text-blue-600 mt-0.5">AES-256 keys shared</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
            </div>

            {/* Card 4: Access Requests */}
            <div
              onClick={() => handleTabChange("requests")}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition"
            >
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Access Requests</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{sentRequests.length}</p>
                <p className="text-[11px] font-semibold text-amber-600 mt-0.5">
                  {pendingRequestsCount} awaiting consent
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Lock size={20} />
              </div>
            </div>
          </div>

          {/* ==================== TAB 1: OVERVIEW ==================== */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: UPCOMING CONSULTATIONS & ACTIVITY CHART (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Upcoming Patient Consultations */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Upcoming Patient Consultations</h3>
                      <p className="text-xs text-slate-400">Scheduled clinical appointments and reviews</p>
                    </div>
                    <button
                      onClick={() => handleTabChange("appointments")}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                    >
                      View All ({appointments.length})
                    </button>
                  </div>

                  {appointments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No upcoming appointments scheduled yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {appointments.slice(0, 3).map((appt) => (
                        <div
                          key={appt.id}
                          className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3.5">
                            <img
                              src={getPatientPhoto(appt.patientEmail)}
                              alt={appt.patientName}
                              className="w-12 h-12 rounded-xl object-cover border border-white shadow-xs shrink-0"
                            />
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900">{appt.patientName}</h4>
                              <p className="text-xs text-slate-500 font-medium">{appt.reason}</p>
                              <span className="text-[11px] font-semibold text-red-600">
                                {appt.date} at {appt.time}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button
                              onClick={() => openApptModal(appt)}
                              className="px-3.5 py-1.5 bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-bold rounded-xl shadow-2xs transition"
                            >
                              Add Clinical Notes
                            </button>
                            <button
                              onClick={() => openRxModalForPatient(appt.patientId)}
                              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition"
                            >
                              Prescribe
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Weekly Clinical Consultations Trend (Interactive SVG Chart) */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Clinical Activity & Consultation Volume</h3>
                      <p className="text-xs text-slate-400">Weekly patient visits and completed diagnosis reviews</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                      High Efficiency
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
                      <text x="15" y="24" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">20</text>
                      <text x="15" y="64" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">15</text>
                      <text x="15" y="104" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">10</text>
                      <text x="20" y="144" fontSize="10" fill="#94a3b8" fontFamily="sans-serif">5</text>

                      {/* Curve 1: Total Booked Consultations (Dark Slate #1e293b) */}
                      <path
                        d="M 60 90 Q 150 50 250 45 T 450 70 T 600 50"
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="60" cy="90" r="3.5" fill="#1e293b" />
                      <circle cx="150" cy="65" r="3.5" fill="#1e293b" />
                      <circle cx="250" cy="45" r="3.5" fill="#1e293b" />
                      <circle cx="350" cy="55" r="3.5" fill="#1e293b" />
                      <circle cx="450" cy="70" r="3.5" fill="#1e293b" />
                      <circle cx="600" cy="50" r="3.5" fill="#1e293b" />

                      {/* Curve 2: Completed Diagnoses (Teal #0d9488) */}
                      <path
                        d="M 60 120 Q 150 90 250 80 T 450 95 T 600 75"
                        fill="none"
                        stroke="#0d9488"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle cx="60" cy="120" r="3" fill="#0d9488" />
                      <circle cx="150" cy="100" r="3" fill="#0d9488" />
                      <circle cx="250" cy="80" r="3" fill="#0d9488" />
                      <circle cx="350" cy="88" r="3" fill="#0d9488" />
                      <circle cx="450" cy="95" r="3" fill="#0d9488" />
                      <circle cx="600" cy="75" r="3" fill="#0d9488" />

                      {/* X-Axis Day Labels */}
                      <text x="50" y="180" fontSize="11" fill="#64748b" fontFamily="sans-serif">Mon</text>
                      <text x="145" y="180" fontSize="11" fill="#64748b" fontFamily="sans-serif">Tue</text>
                      <text x="245" y="180" fontSize="11" fill="#64748b" fontFamily="sans-serif">Wed</text>
                      <text x="345" y="180" fontSize="11" fill="#64748b" fontFamily="sans-serif">Thu</text>
                      <text x="445" y="180" fontSize="11" fill="#64748b" fontFamily="sans-serif">Fri</text>
                      <text x="590" y="180" fontSize="11" fill="#64748b" fontFamily="sans-serif">Sat</text>
                    </svg>

                    {/* Chart Legend */}
                    <div className="flex items-center justify-center gap-8 mt-2 text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1e293b]"></span>
                        <span>Total Scheduled Visits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0d9488]"></span>
                        <span>Completed Diagnoses</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: QUICK ACTIONS + AUTHORIZED PATIENTS + ADMIN STATUS (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Quick Clinical Actions */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Clinical Actions</h3>
                  <div className="space-y-2.5">
                    <button
                      onClick={() => setShowRxModal(true)}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-semibold text-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <Pill size={16} className="text-red-600" />
                        <span>Write Prescription</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>

                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-semibold text-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <Lock size={16} className="text-slate-500" />
                        <span>Request Patient Record Access</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>

                    <button
                      onClick={() => handleTabChange("records")}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-semibold text-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-blue-600" />
                        <span>Decrypt Patient Records</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>

                    <button
                      onClick={() => handleTabChange("profile")}
                      className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-semibold text-slate-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <UserCheck size={16} className="text-emerald-600" />
                        <span>Credentials & Verification</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Authorized Patients Card */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">Consented Patients</h3>
                    <button
                      onClick={() => handleTabChange("patients")}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {patients.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3">No authorized patients yet.</p>
                    ) : (
                      patients.slice(0, 3).map((p) => (
                        <div
                          key={p.id}
                          className="p-3 bg-slate-50/70 border border-slate-200/60 rounded-2xl flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={getPatientPhoto(p.email)}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                            />
                            <div className="overflow-hidden">
                              <h5 className="text-xs font-bold text-slate-900 truncate">{p.name}</h5>
                              <p className="text-[11px] text-slate-400 truncate">{p.email}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleTabChange("records")}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg shadow-2xs shrink-0"
                          >
                            Records
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Admin Verification Card */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Hospital Verification</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                      Admin Verified
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                    <p className="text-slate-400 font-medium">Affiliation</p>
                    <p className="font-bold text-slate-800">{doctor?.doctorDetails?.hospital || "Metropolitan General Hospital"}</p>
                    <p className="text-slate-400 font-medium pt-1">Medical License</p>
                    <p className="font-mono text-slate-700 font-bold">{doctor?.doctorDetails?.licenseNumber || "MED-CA-98741"}</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ==================== TAB 2: MY PATIENTS ==================== */}
          {activeTab === "patients" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Assigned & Registered Patients</h3>
                  <p className="text-xs text-slate-500">
                    Review assigned patients, request document consent, and inspect health histories.
                  </p>
                </div>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Lock size={15} /> Request Patient Access
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(allRegisteredPatients.length > 0 ? allRegisteredPatients : patients).map((pat) => {
                  const hasConsent = patients.some((p) => p.id === pat.id || p.email === pat.email);
                  return (
                    <div
                      key={pat.id}
                      className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3.5 mb-3">
                        <img
                          src={pat.picture || getPatientPhoto(pat.email)}
                          alt={pat.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-xs shrink-0"
                        />
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{pat.name}</h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                hasConsent
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {hasConsent ? "Consent Granted" : "Access Not Granted"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{pat.email}</p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                            <span><b>Blood:</b> {pat.patientDetails?.bloodGroup || "O+"}</span>
                            <span>&bull;</span>
                            <span><b>Emergency:</b> {pat.patientDetails?.emergencyContact || "+1 (555) 876-5432"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        {hasConsent ? (
                          <button
                            onClick={() => handleTabChange("records")}
                            className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition text-center"
                          >
                            View Records
                          </button>
                        ) : (
                          <button
                            onClick={() => openRequestModalForPatient(pat.email)}
                            className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-center flex items-center justify-center gap-1"
                          >
                            <Lock size={13} /> Request Consent
                          </button>
                        )}

                        <button
                          onClick={() => openRxModalForPatient(pat.id)}
                          className="flex-1 py-2 text-xs font-bold text-[#1e293b] bg-slate-100 hover:bg-slate-200 rounded-xl transition text-center flex items-center justify-center gap-1"
                        >
                          <Pill size={13} /> Prescribe
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== TAB 3: PATIENT RECORDS ==================== */}
          {activeTab === "records" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Authorized Patient Records (E2EE)</h3>
                  <p className="text-xs text-slate-500">
                    Decrypted locally inside your browser using your verified 2048-bit RSA private key. The backend never sees plaintext.
                  </p>
                </div>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Lock size={14} /> Request New Patient File
                </button>
              </div>

              {records.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-200/90 rounded-3xl shadow-2xs">
                  <FileText className="mx-auto text-slate-300 mb-3" size={44} />
                  <h4 className="text-sm font-bold text-slate-800">No authorized medical records available</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-4 max-w-md mx-auto">
                    When patients approve your access request, their client re-encrypts the AES keys for your RSA public key and the records will appear here.
                  </p>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-full shadow-xs"
                  >
                    Request Patient Access
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
                            <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0">
                              <FileText size={18} />
                            </span>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 leading-snug">{rec.title}</h4>
                              <p className="text-[11px] text-slate-500">
                                Patient: <b>{rec.patientName}</b> &bull; {(rec.fileSize / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
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
                          onClick={() => handleVerifyRecordHash(rec)}
                          className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-1"
                        >
                          <ShieldCheck size={14} className="text-emerald-600" /> Verify Hash
                        </button>
                        <button
                          onClick={() => handleDecryptPatientRecord(rec)}
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

          {/* ==================== TAB 4: APPOINTMENTS ==================== */}
          {activeTab === "appointments" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Patient Appointments & Consultations</h3>
                  <p className="text-xs text-slate-500">
                    Review booked visits, manage schedules, and document clinical examination notes.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  All Scheduled Consultations ({appointments.length})
                </h4>

                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No appointments booked with your profile yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {appointments.map((a) => (
                      <div key={a.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={a.patientPicture || getPatientPhoto(a.patientEmail, a.patientId)}
                            alt={a.patientName}
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
                            }}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs sm:text-sm font-bold text-slate-900">{a.patientName}</h5>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  a.status === "Upcoming"
                                    ? "bg-blue-50 text-blue-800 border border-blue-200"
                                    : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                }`}
                              >
                                {a.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5"><b>Reason:</b> {a.reason}</p>
                            <span className="text-[11px] font-bold text-red-600 block mt-0.5">
                              {a.date} at {a.time}
                            </span>
                            {a.consultationNotes && (
                              <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100">
                                <b>Notes:</b> {a.consultationNotes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <button
                            onClick={() => openApptModal(a)}
                            className="px-3.5 py-1.5 bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-bold rounded-xl shadow-2xs transition"
                          >
                            {a.consultationNotes ? "Edit Notes" : "Add Notes"}
                          </button>
                          <button
                            onClick={() => openRxModalForPatient(a.patientId)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-2xs transition"
                          >
                            Prescribe
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 5: PRESCRIPTIONS ==================== */}
          {activeTab === "prescriptions" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Medical Prescriptions Issued</h3>
                  <p className="text-xs text-slate-500">Official prescriptions written for your patients.</p>
                </div>
                <button
                  onClick={() => setShowRxModal(true)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus size={15} /> Write New Prescription
                </button>
              </div>

              {prescriptions.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-200/90 rounded-3xl shadow-2xs">
                  <Pill className="mx-auto text-slate-300 mb-3" size={44} />
                  <h4 className="text-sm font-bold text-slate-800">No prescriptions issued yet</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Create clinical medication schedules for any assigned patient.
                  </p>
                  <button
                    onClick={() => setShowRxModal(true)}
                    className="px-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-full shadow-xs"
                  >
                    Write First Prescription
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={getPatientPhoto(rx.patientEmail)}
                            alt={rx.patientName}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
                          />
                          <div>
                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                              Prescribed to {rx.patientName}
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">Diagnosis: {rx.diagnosis}</h4>
                          </div>
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
                          <b>Clinical Instructions:</b> {rx.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 6: ACCESS REQUESTS ==================== */}
          {activeTab === "requests" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Zero-Knowledge Consent Authorization</h3>
                  <p className="text-xs text-slate-500">
                    Track authorization requests sent to patients under zero-knowledge access rules.
                  </p>
                </div>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Plus size={15} /> Send New Access Request
                </button>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={15} className="text-amber-500" /> Pending Access Requests ({pendingRequestsCount})
                  </h4>
                  <span className="text-[11px] font-bold text-slate-400">Zero-Knowledge Verification</span>
                </div>

                {pendingRequestsCount === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                      <Clock size={28} />
                    </div>
                    <div className="max-w-md">
                      <h5 className="font-bold text-slate-800 text-sm">All Patient Requests Reviewed</h5>
                      <p className="text-xs text-slate-500 mt-1">
                        Zero pending requests awaiting patient approval. When you request medical record access, the patient receives a notification to review and share their encryption key.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="mt-2 px-4 py-2 bg-[#1e293b] hover:bg-[#0f172a] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={15} /> Send New Access Request
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sentRequests
                      .filter((r) => r.status === "pending")
                      .map((req) => (
                        <div
                          key={req.id}
                          className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={getPatientPhoto(req.patientEmail)}
                              alt={req.patientName}
                              className="w-10 h-10 rounded-full object-cover border border-amber-200 shadow-2xs shrink-0"
                            />
                            <div>
                              <h5 className="font-bold text-slate-900">
                                Patient: {req.patientName} <span className="text-slate-500 font-normal">({req.patientEmail})</span>
                              </h5>
                              <p className="text-slate-600 mt-0.5"><b>Reason:</b> {req.reason}</p>
                              <span className="text-[10px] text-slate-400">Requested: {req.requestedAt?.split("T")[0]}</span>
                            </div>
                          </div>

                          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 self-start sm:self-auto">
                            Awaiting Patient Approval
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Approved History with rich cards */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-emerald-600" /> Authorized Access History ({sentRequests.filter((r) => r.status === "approved").length})
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    256-Bit Decryption Active
                  </span>
                </div>

                {sentRequests.filter((r) => r.status === "approved").length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">No active approvals yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sentRequests
                      .filter((r) => r.status === "approved")
                      .map((req) => (
                        <div
                          key={req.id}
                          className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col justify-between gap-3 text-xs hover:border-slate-300 transition"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={getPatientPhoto(req.patientEmail)}
                              alt={req.patientName}
                              className="w-12 h-12 rounded-xl object-cover border border-white shadow-2xs shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-slate-900 truncate">{req.patientName}</h5>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                                  Approved
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 truncate">{req.patientEmail}</p>
                              <p className="text-[11px] text-slate-600 mt-1 font-medium">
                                <b>Authorized Consultation:</b> {req.reason}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Granted on {req.approvedAt ? req.approvedAt.split("T")[0] : "2026-11-15"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80">
                            <button
                              onClick={() => handleTabChange("records")}
                              className="px-3.5 py-1.5 bg-[#1e293b] hover:bg-[#0f172a] text-white text-[11px] font-bold rounded-xl shadow-2xs transition flex items-center gap-1 cursor-pointer"
                            >
                              <Lock size={12} /> View Decrypted Records
                            </button>
                            <button
                              onClick={() => {
                                setRxPatientId(req.patientId);
                                setShowRxModal(true);
                              }}
                              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-xl shadow-2xs transition flex items-center gap-1 cursor-pointer"
                            >
                              <Pill size={12} /> Write Prescription
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 7: DOCTOR PROFILE & VERIFICATION ==================== */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Physician Profile & Credentials</h3>
                  <p className="text-xs text-slate-500">Official medical license verification and clinical hospital affiliations.</p>
                </div>
                {docSuccessMsg && (
                  <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl animate-fade-in flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-600" /> {docSuccessMsg}
                  </span>
                )}
              </div>

              {/* Doctor ID Card Header with Hospital Office Backdrop */}
              <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-2xs">
                <div
                  className="h-36 sm:h-44 relative p-6 flex items-end"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.4)), url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center 35%",
                  }}
                >
                  <div className="flex items-center justify-between w-full text-white">
                    <div>
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold tracking-wider uppercase">
                        {profileHospital || "Metropolitan General Hospital"}
                      </span>
                      <h4 className="text-xl sm:text-2xl font-black mt-2">Attending Clinical Physician</h4>
                    </div>
                    <span className="text-xs font-mono font-bold bg-black/40 px-3 py-1.5 rounded-xl border border-white/20 hidden sm:block">
                      License: {profileLicense || "MED-CA-98741"}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 -mt-12 sm:-mt-14 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-100">
                    <div className="flex items-end gap-4">
                      {/* Doctor Photo with Upload Button */}
                      <div className="relative group shrink-0">
                        <img
                          src={doctor?.picture || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"}
                          alt={doctor?.name}
                          className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-md bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => docFileInputRef.current?.click()}
                          title="Upload photo from computer"
                          className="absolute bottom-1 right-1 p-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-md transition cursor-pointer"
                        >
                          <Camera size={16} />
                        </button>
                        <input
                          type="file"
                          ref={docFileInputRef}
                          onChange={handleDocPhotoFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>

                      <div className="mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xl font-bold text-slate-900">{doctor?.name || "Dr. Michael Smith, MD"}</h4>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Verified Physician
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{doctor?.email}</p>
                        <p className="text-[11px] font-bold text-red-600 mt-0.5">
                          {profileSpecialization || "Cardiology Specialist"} • {profileExperience}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => docFileInputRef.current?.click()}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload size={14} /> Upload New Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDocPhotoModal(true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <ImageIcon size={14} /> Photo URL
                      </button>
                    </div>
                  </div>

                  {/* Doctor Credentials & Hospital Affiliations Form */}
                  <form onSubmit={handleSaveProfile} className="mt-6 space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                        Professional Clinical Credentials
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Name & Title</label>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            required
                            className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Hospital / Clinic Affiliation</label>
                          <input
                            type="text"
                            value={profileHospital}
                            onChange={(e) => setProfileHospital(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Medical Specialization</label>
                          <input
                            type="text"
                            value={profileSpecialization}
                            onChange={(e) => setProfileSpecialization(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Medical License Number</label>
                          <input
                            type="text"
                            value={profileLicense}
                            onChange={(e) => setProfileLicense(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee</label>
                          <input
                            type="text"
                            value={profileFee}
                            onChange={(e) => setProfileFee(e.target.value)}
                            placeholder="e.g. ₹1,200"
                            className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Experience</label>
                          <input
                            type="text"
                            value={profileExperience}
                            onChange={(e) => setProfileExperience(e.target.value)}
                            placeholder="e.g. 15+ Years Experience"
                            className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Biography & Special Interests</label>
                        <textarea
                          rows={2}
                          value={profileBio}
                          onChange={(e) => setProfileBio(e.target.value)}
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
                          {savingProfile ? "Saving Credentials..." : "Save Provider Credentials"}
                        </button>
                      </div>
                    </div>
                  </form>


                </div>
              </div>
            </div>
          )}

          {/* Modal for Doctor Photo Update via URL or Preset */}
          {showDocPhotoModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center">
                      <Camera size={16} />
                    </span>
                    <h4 className="text-base font-bold text-slate-900">Update Doctor Profile Photo</h4>
                  </div>
                  <button onClick={() => setShowDocPhotoModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Upload from Device</label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDocPhotoModal(false);
                        docFileInputRef.current?.click();
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
                      value={docPhotoUrl}
                      onChange={(e) => setDocPhotoUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {docPhotoUrl && (
                    <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                      <img
                        src={docPhotoUrl}
                        alt="Preview"
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80";
                        }}
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-900">Image Preview</p>
                        <p className="text-[10px] text-slate-400 truncate">{docPhotoUrl}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDocPhotoModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!docPhotoUrl || savingDocPhoto}
                      onClick={() => saveDoctorPicture(docPhotoUrl)}
                      className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition cursor-pointer"
                    >
                      {savingDocPhoto ? "Saving..." : "Save Picture"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ==================== WRITE PRESCRIPTION MODAL ==================== */}
      {showRxModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                  <Pill size={17} />
                </span>
                <h3 className="text-base font-extrabold text-slate-900">Issue Medical Prescription</h3>
              </div>
              <button onClick={() => setShowRxModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Patient *</label>
                <select
                  value={rxPatientId}
                  onChange={(e) => setRxPatientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                  required
                >
                  {(allRegisteredPatients.length > 0 ? allRegisteredPatients : patients).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  value={rxDiagnosis}
                  onChange={(e) => setRxDiagnosis(e.target.value)}
                  placeholder="e.g. Mild Hypertension & Cardiovascular Follow-Up"
                  required
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              {/* Medication Rows */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">Medications *</label>
                  <button
                    type="button"
                    onClick={addMedicationRow}
                    className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Medication
                  </button>
                </div>

                <div className="space-y-3">
                  {rxMedications.map((m, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 relative">
                      {rxMedications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedicationRow(idx)}
                          className="absolute top-2 right-2 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Drug Name (e.g. Lisinopril)"
                          value={m.name}
                          onChange={(e) => updateMedicationRow(idx, "name", e.target.value)}
                          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Dosage (e.g. 10mg)"
                          value={m.dosage}
                          onChange={(e) => updateMedicationRow(idx, "dosage", e.target.value)}
                          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Frequency (e.g. Once daily)"
                          value={m.frequency}
                          onChange={(e) => updateMedicationRow(idx, "frequency", e.target.value)}
                          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Duration (e.g. 30 days)"
                          value={m.duration}
                          onChange={(e) => updateMedicationRow(idx, "duration", e.target.value)}
                          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                          required
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Instructions (e.g. Take with morning meal)"
                        value={m.instructions}
                        onChange={(e) => updateMedicationRow(idx, "instructions", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Instructions & Notes</label>
                <textarea
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Maintain low sodium diet. Check blood pressure twice weekly."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rxLoading}
                  className="px-5 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition"
                >
                  {rxLoading ? "Issuing..." : "Issue Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== REQUEST PATIENT ACCESS MODAL ==================== */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-bold">
                  <Lock size={17} />
                </span>
                <h3 className="text-base font-extrabold text-slate-900">Request Patient Record Access</h3>
              </div>
              <button onClick={() => setShowRequestModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {requestError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs mb-4">
                {requestError}
              </div>
            )}

            {requestSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl text-xs mb-4">
                {requestSuccess}
              </div>
            )}

            <form onSubmit={handleSendAccessRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Patient or Enter Email *</label>
                <input
                  type="email"
                  value={requestPatientEmail}
                  onChange={(e) => setRequestPatientEmail(e.target.value)}
                  placeholder="e.g. omsoni2006456@gmail.com"
                  required
                  list="patientEmailList"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <datalist id="patientEmailList">
                  {allRegisteredPatients.map((p) => (
                    <option key={p.id} value={p.email}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Reason for Access *</label>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  rows={2}
                  placeholder="e.g. Cardiovascular follow-up examination and ECG review"
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-[11px] text-blue-800">
                Patient will receive a notification to approve or reject this request. Upon approval, AES document keys are shared with your verified RSA public key.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestLoading}
                  className="px-5 py-2.5 text-xs font-bold bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-full shadow-md transition"
                >
                  {requestLoading ? "Submitting..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CONSULTATION NOTES MODAL ==================== */}
      {selectedAppt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900">Clinical Consultation Notes</h3>
              <button onClick={() => setSelectedAppt(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs mb-4">
              <p><b>Patient:</b> {selectedAppt.patientName}</p>
              <p><b>Reason:</b> {selectedAppt.reason}</p>
              <p><b>Scheduled:</b> {selectedAppt.date} at {selectedAppt.time}</p>
            </div>

            <form onSubmit={handleSaveApptNotes} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Physician Clinical Notes</label>
                <textarea
                  value={consultNotes}
                  onChange={(e) => setConsultNotes(e.target.value)}
                  rows={4}
                  placeholder="Record blood pressure, heart rate, symptoms, diagnosis, and care plan..."
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Status</label>
                <select
                  value={apptStatus}
                  onChange={(e) => setApptStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="Completed">Completed</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAppt(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNotes}
                  className="px-5 py-2.5 text-xs font-bold bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-full shadow-md transition"
                >
                  {savingNotes ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== BLOCKCHAIN VERIFICATION MODAL ==================== */}
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
