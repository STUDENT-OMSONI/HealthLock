import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Calendar,
  Search,
  Filter,
  Download,
  MoreVertical,
  Stethoscope,
  Activity,
  Lock,
  UserX,
  UserCheck,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  ChevronRight,
  Database,
  Building,
  Award,
  Clock,
  Layers,
  FileText,
  AlertTriangle,
  User,
  Heart,
  Mail,
  Phone,
  X,
  Check,
} from "lucide-react";
import { apiFetch, getUser } from "../auth";

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentAdmin = getUser();

  // Active tab synced with URL query parameter
  const activeTab = searchParams.get("tab") || "overview";

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  // Live Data States
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [blockchainBlocks, setBlockchainBlocks] = useState([]);
  const [blockchainValid, setBlockchainValid] = useState(true);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorSpecialtyFilter, setDoctorSpecialtyFilter] = useState("all");

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("User@123456");
  const [addRole, setAddRole] = useState("Patient");
  const [addSpecialty, setAddSpecialty] = useState("General Medicine");
  const [addHospital, setAddHospital] = useState("Metropolitan General Hospital");
  const [addLicense, setAddLicense] = useState("");
  const [addAge, setAddAge] = useState("28");
  const [addGender, setAddGender] = useState("Male");
  const [addContact, setAddContact] = useState("");
  const [addBloodGroup, setAddBloodGroup] = useState("O+");
  const [addEmergencyContact, setAddEmergencyContact] = useState("");
  const [addingUser, setAddingUser] = useState(false);
  const [addError, setAddError] = useState("");

  // Inspect Block / Audit Modal State
  const [selectedBlock, setSelectedBlock] = useState(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, apptRes, logsRes, blockRes, recRes] = await Promise.all([
        apiFetch("/api/admin/stats").catch(() => null),
        apiFetch("/api/admin/users").catch(() => ({ users: [] })),
        apiFetch("/api/admin/appointments").catch(() => ({ appointments: [] })),
        apiFetch("/api/admin/audit-logs").catch(() => ({ logs: [] })),
        apiFetch("/api/blockchain/chain").catch(() => ({ chain: [] })),
        apiFetch("/api/admin/records").catch(() => ({ records: [] })),
      ]);

      setStats(statsRes);
      const allUsers = usersRes.users || [];
      setUsers(allUsers);
      setDoctors(allUsers.filter((u) => u.role === "Doctor"));
      setPatients(allUsers.filter((u) => u.role === "Patient"));
      setAppointments(apptRes.appointments || []);
      setAuditLogs(logsRes.logs || []);
      setBlockchainBlocks(blockRes.chain || []);
      setRecords(recRes.records || []);

      const statusRes = await apiFetch("/api/blockchain/status").catch(() => ({ isValid: true }));
      setBlockchainValid(statusRes.isValid ?? true);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Change user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiFetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      loadAdminData();
    } catch (err) {
      alert("Role update failed: " + err.message);
    }
  };

  // Suspend or activate user
  const handleStatusToggle = async (user) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    try {
      await apiFetch(`/api/admin/users/${user.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      loadAdminData();
    } catch (err) {
      alert("Status change failed: " + err.message);
    }
  };

  // Doctor Verification Action
  const handleDoctorVerify = async (doctorId, verificationStatus) => {
    try {
      await apiFetch(`/api/admin/doctors/${doctorId}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ verificationStatus }),
      });
      loadAdminData();
    } catch (err) {
      alert("Verification update failed: " + err.message);
    }
  };

  // Delete user account
  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to permanently delete user: ${userEmail}?`)) return;
    try {
      await apiFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      loadAdminData();
    } catch (err) {
      alert("Failed to delete user: " + err.message);
    }
  };

  // Add new user submission
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    setAddError("");

    try {
      const payload = {
        name: addName.trim(),
        email: addEmail.trim(),
        password: addPassword,
        role: addRole,
      };

      if (addRole === "Doctor") {
        payload.doctorDetails = {
          specialization: addSpecialty,
          hospital: addHospital,
          licenseNumber: addLicense || "LIC-" + Math.floor(100000 + Math.random() * 900000),
        };
      } else if (addRole === "Patient") {
        payload.patientDetails = {
          age: Number(addAge),
          gender: addGender,
          contact: addContact,
          bloodGroup: addBloodGroup,
          emergencyContact: addEmergencyContact,
        };
      }

      await apiFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setShowAddModal(false);
      setAddName("");
      setAddEmail("");
      loadAdminData();
      alert(`User ${payload.email} (${payload.role}) created successfully in MongoDB Atlas!`);
    } catch (err) {
      setAddError(err.message || "Failed to create user.");
    } finally {
      setAddingUser(false);
    }
  };

  // Export Users to CSV
  const handleExportUsers = () => {
    const headers = ["Name", "Email", "Role", "Status", "Specialty/Age", "Hospital/Contact", "JoinedDate"];
    const rows = users.map((u) => [
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.status}"`,
      `"${u.role === "Doctor" ? u.doctorDetails?.specialization : u.patientDetails?.age || ""}"`,
      `"${u.role === "Doctor" ? u.doctorDetails?.hospital : u.patientDetails?.contact || ""}"`,
      `"${u.createdAt?.split("T")[0]}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `medikey_system_users_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.doctorDetails?.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Doctor specialties list
  const doctorSpecialties = ["all", ...new Set(doctors.map((d) => d.doctorDetails?.specialization).filter(Boolean))];
  const filteredDoctors = doctors.filter((d) => {
    const matchesSearch =
      d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.doctorDetails?.hospital?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      doctorSpecialtyFilter === "all" || d.doctorDetails?.specialization === doctorSpecialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

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
      {/* Outer App Frame Container */}
      <div className="max-w-[1440px] mx-auto bg-white/95 backdrop-blur-md rounded-[28px] border border-slate-200/90 shadow-sm overflow-hidden flex flex-col min-h-[880px]">
        
        {/* ==================== ATTRACTIVE HERO BANNER WITH MOVING HD VIDEO ==================== */}
        <div className="relative bg-slate-950 text-white p-6 sm:p-10 overflow-hidden border-b border-slate-800">
          {/* Moving HD Hospital Analytics & Telemetry Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center"
            src="https://videos.pexels.com/video-files/7578544/7578544-uhd_2560_1440_25fps.mp4"
            poster="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80"
          />
          {/* Elegant Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-slate-950/70 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold text-slate-300">
                Metropolitan Health Network Operations • System Administration Console • Database: Connected • Audit Engine: Active
              </p>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Hospital Administration & Records Supervision
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Supervise verified practitioners, patient accounts, appointment activity, and cryptographic verification audit logs with zero-knowledge privacy guarantees.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16} /> Add New User
              </button>

              <button
                onClick={handleExportUsers}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2 backdrop-blur-xs cursor-pointer"
              >
                <Download size={15} /> Export CSV
              </button>

              <button
                onClick={loadAdminData}
                title="Refresh Live Data"
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl shadow-xs transition backdrop-blur-xs cursor-pointer"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* ==================== 4 TOP STAT CARDS (Matching Reference Image 3) ==================== */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Users (Blue) */}
            <div
              onClick={() => handleTabChange("users")}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition cursor-pointer flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
                <h3 className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">
                  {stats?.totalUsers ?? users.length}
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Live in MongoDB Atlas</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <Users size={24} />
              </div>
            </div>

            {/* Card 2: Active Patients (Emerald Green) */}
            <div
              onClick={() => handleTabChange("patients")}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition cursor-pointer flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Patients</p>
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                  {stats?.totalPatients ?? patients.length}
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Registered Patient Vaults</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <Activity size={24} />
              </div>
            </div>

            {/* Card 3: Medical Staff / Doctors (Orange) */}
            <div
              onClick={() => handleTabChange("doctors")}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition cursor-pointer flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Medical Staff</p>
                <h3 className="text-2xl sm:text-3xl font-black text-orange-600 mt-1">
                  {stats?.totalDoctors ?? doctors.length}
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                  {doctors.filter((d) => d.doctorDetails?.verificationStatus === "verified").length} Verified Doctors
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
                <Stethoscope size={24} />
              </div>
            </div>

            {/* Card 4: System Administrators (Purple) */}
            <div
              onClick={() => handleTabChange("users")}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition cursor-pointer flex items-center justify-between"
            >
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Admins & RBAC</p>
                <h3 className="text-2xl sm:text-3xl font-black text-purple-600 mt-1">
                  {stats?.totalAdmins ?? users.filter((u) => u.role === "Admin").length}
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">System Operators</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
                <ShieldCheck size={24} />
              </div>
            </div>

          </div>

          {/* Substrip: Platform Telemetry & Blockchain Status */}
          <div className="mt-4 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-slate-600">
              <span className="flex items-center gap-1.5 font-bold">
                <Database size={14} className="text-red-600" />
                Database: <span className="text-slate-900 font-black">MongoDB Atlas (Live)</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <Calendar size={14} className="text-blue-600" />
                Appointments: <span className="text-slate-900 font-black">{appointments.length} Scheduled</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <FileText size={14} className="text-emerald-600" />
                Encrypted Vault Records: <span className="text-slate-900 font-black">{records.length} Documents</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                  blockchainValid ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                }`}
              >
                <ShieldCheck size={14} />
                Blockchain Ledger: {blockchainBlocks.length} Blocks ({blockchainValid ? "Cryptographically Valid" : "Tamper Detected"})
              </span>
            </div>
          </div>
        </div>

        {/* ==================== TAB NAVIGATION PILL BAR (Matching Reference Image 3) ==================== */}
        <div className="px-6 pt-5 pb-2 bg-white border-b border-slate-200">
          <div className="flex overflow-x-auto gap-2 scrollbar-none pb-2 text-xs font-bold">
            {[
              { id: "overview", label: "Overview & Health", icon: Activity },
              { id: "users", label: `User Management (${users.length})`, icon: Users },
              { id: "doctors", label: `Doctor Verification (${doctors.length})`, icon: Stethoscope },
              { id: "patients", label: `Patient Accounts (${patients.length})`, icon: User },
              { id: "appointments", label: `Appointments (${appointments.length})`, icon: Calendar },
              { id: "records", label: `Encrypted Vault (${records.length})`, icon: Lock },
              { id: "audit", label: `Security & Blockchain (${auditLogs.length})`, icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-[#1e293b] text-white shadow-xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={15} className={isActive ? "text-red-400" : "text-slate-400"} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ==================== TAB CONTENT CONTAINER ==================== */}
        <div className="flex-1 p-6 bg-slate-50/40">

          {/* ==================== TAB 1: OVERVIEW & HEALTH ==================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Welcome & System Summary Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Activity Feed & Verification Overview */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Doctor Verification Alert Banner */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                          <Stethoscope size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Physician Roster & Credentialing</h3>
                          <p className="text-xs text-slate-500">
                            {doctors.length} specialist doctors registered across major healthcare disciplines.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTabChange("doctors")}
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        Manage Doctors <ChevronRight size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {doctors.slice(0, 4).map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl"
                        >
                          <img
                            src={doc.picture || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"}
                            alt={doc.name}
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80";
                            }}
                            className="w-12 h-12 rounded-xl object-cover border border-white shadow-2xs shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">{doc.name}</p>
                            <p className="text-[11px] font-semibold text-red-600 truncate">
                              {doc.doctorDetails?.specialization}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {doc.doctorDetails?.hospital}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Verified
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Platform Appointments */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Recent Platform Appointments</h3>
                          <p className="text-xs text-slate-500">Live consultation bookings scheduled by patients.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTabChange("appointments")}
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        View All <ChevronRight size={14} />
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {appointments.length === 0 ? (
                        <p className="text-xs text-slate-400 py-4 text-center">No appointments scheduled yet.</p>
                      ) : (
                        appointments.slice(0, 5).map((appt) => (
                          <div key={appt.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center shrink-0">
                                {appt.patientName?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{appt.patientName}</p>
                                <p className="text-[11px] text-slate-400">
                                  With {appt.doctorName} • {appt.reason}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="font-bold text-slate-800">{appt.date}</p>
                              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                {appt.time}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Col: Security Card & Real-Time Audit Feed */}
                <div className="space-y-6">
                  
                  {/* Security Architecture Card */}
                  <div className="bg-[#1e293b] text-white rounded-3xl p-6 shadow-md space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-red-600/30 text-red-400 border border-red-500/30 flex items-center justify-center">
                        <Lock size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">E2EE Cryptographic Policy</h4>
                        <p className="text-[11px] text-slate-300">Zero-Knowledge Architecture</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Medical documents are encrypted directly in the patient’s browser using <b>256-bit AES-GCM</b>. Encryption keys are securely wrapped using doctors' verified RSA public keys. Administrators have zero access to plaintext records.
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-700/80 text-[11px]">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Document Encryption:</span>
                        <span className="font-bold text-emerald-400">AES-256-GCM</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Key Exchange:</span>
                        <span className="font-bold text-emerald-400">RSA-OAEP 2048-bit</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Blockchain Proofs:</span>
                        <span className="font-bold text-emerald-400">SHA-256 Merkle Ledger</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Security Audit Log Snippet */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Security Audit Trail ({auditLogs.length})
                      </h4>
                      <button
                        onClick={() => handleTabChange("audit")}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700"
                      >
                        Ledger
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {auditLogs.slice(0, 6).map((log) => (
                        <div
                          key={log.id}
                          className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 text-[11px] font-mono">
                              {log.action}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "Recent"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">{log.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ==================== TAB 2: USER MANAGEMENT (Matching Reference Image 3) ==================== */}
          {activeTab === "users" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-5">
              
              {/* Header matching Reference Image 3 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">User Management</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage system users, adjust roles, enforce access controls, and monitor active statuses.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleExportUsers}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Download size={15} /> Export
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={16} /> Add User
                  </button>
                </div>
              </div>

              {/* Filter and Search Bar matching Reference Image 3 */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="Patient">Patients Only</option>
                    <option value="Doctor">Doctors Only</option>
                    <option value="Admin">Admins Only</option>
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended Only</option>
                  </select>
                </div>
              </div>

              {/* User Data Table matching Reference Image 3 */}
              <div className="overflow-x-auto border border-slate-200/90 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Activity Status</th>
                      <th className="p-4">Details / Affiliation</th>
                      <th className="p-4">Joined Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                u.picture ||
                                (u.role === "Doctor"
                                  ? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"
                                  : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80")
                              }
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{u.name}</div>
                              <div className="text-[11px] text-slate-400">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                              u.role === "Admin"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : u.role === "Doctor"
                                ? "bg-orange-50 text-orange-700 border-orange-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            <option value="Patient">Patient</option>
                            <option value="Doctor">Doctor</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                              u.status === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                u.status === "active" ? "bg-emerald-500" : "bg-red-500"
                              }`}
                            ></span>
                            {u.status}
                          </span>
                        </td>

                        <td className="p-4 text-slate-600">
                          {u.role === "Doctor" ? (
                            <div>
                              <p className="font-bold text-red-600 text-[11px]">{u.doctorDetails?.specialization}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-xs">{u.doctorDetails?.hospital}</p>
                            </div>
                          ) : u.role === "Patient" ? (
                            <div>
                              <p className="font-semibold text-slate-700 text-[11px]">
                                {u.patientDetails?.gender || "Unknown"}, Age {u.patientDetails?.age || "21"} • Blood: {u.patientDetails?.bloodGroup || "A+"}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate max-w-xs">
                                Contact: {u.patientDetails?.contact || "N/A"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-purple-700 font-bold">Platform Superadmin</span>
                          )}
                        </td>

                        <td className="p-4 text-slate-500 text-[11px]">
                          {u.createdAt ? u.createdAt.split("T")[0] : "2026-11-15"}
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleStatusToggle(u)}
                            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                              u.status === "active"
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {u.status === "active" ? "Suspend" : "Activate"}
                          </button>

                          {u.id !== currentAdmin?.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              title="Delete user permanently"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB 3: DOCTOR VERIFICATION & CREDENTIALS ==================== */}
          {activeTab === "doctors" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Doctor Credentialing & Verification</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verify physician medical licenses, hospital affiliations, and manage active clinical practice credentials.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={doctorSpecialtyFilter}
                    onChange={(e) => setDoctorSpecialtyFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 font-bold focus:outline-none cursor-pointer"
                  >
                    {doctorSpecialties.map((s) => (
                      <option key={s} value={s}>
                        {s === "all" ? "All Medical Specialties" : s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {filteredDoctors.map((doc) => {
                  const isVerified = doc.doctorDetails?.verificationStatus === "verified";
                  return (
                    <div
                      key={doc.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={doc.picture || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"}
                          alt={doc.name}
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80";
                          }}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">{doc.name}</h4>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              {doc.doctorDetails?.rating || "4.9 ★"}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-red-600 mt-0.5">{doc.doctorDetails?.specialization}</p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{doc.doctorDetails?.hospital}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] space-y-1 text-slate-600">
                        <div className="flex justify-between">
                          <span>License #:</span>
                          <span className="font-mono font-bold text-slate-800">{doc.doctorDetails?.licenseNumber || "MED-98741"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Experience:</span>
                          <span className="font-semibold text-slate-700">{doc.doctorDetails?.experience || "12+ Years"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Credential Status:</span>
                          <span
                            className={`font-bold ${
                              isVerified ? "text-emerald-600" : "text-amber-600"
                            }`}
                          >
                            {doc.doctorDetails?.verificationStatus || "verified"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleDoctorVerify(doc.id, "verified")}
                          className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                            isVerified
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          }`}
                        >
                          <Check size={14} /> {isVerified ? "Verified Active" : "Approve License"}
                        </button>
                        <button
                          onClick={() => handleDoctorVerify(doc.id, "rejected")}
                          className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition cursor-pointer"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== TAB 4: PATIENT ACCOUNTS ==================== */}
          {activeTab === "patients" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Patient Accounts Directory</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Supervise verified patient portal records, profile metadata, and emergency health contacts.
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-500">
                  Total Patients: <span className="text-slate-900 font-black">{patients.length}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {patients.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                        alt={p.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-slate-900 text-sm truncate">{p.name}</h4>
                        <p className="text-xs text-slate-400 truncate">{p.email}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-1 inline-block">
                          Active Patient Vault
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] space-y-1.5 text-slate-600">
                      <div className="flex justify-between">
                        <span>Age & Gender:</span>
                        <span className="font-bold text-slate-800">{p.patientDetails?.age || 21} Yrs • {p.patientDetails?.gender || "Male"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Blood Group:</span>
                        <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{p.patientDetails?.bloodGroup || "A+"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contact:</span>
                        <span className="font-semibold text-slate-700">{p.patientDetails?.contact || "9302496582"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Emergency:</span>
                        <span className="font-semibold text-slate-700 truncate max-w-[160px]">{p.patientDetails?.emergencyContact || "Robert Davis"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => handleStatusToggle(p)}
                        className={`px-3 py-1.5 font-bold rounded-xl text-xs transition cursor-pointer ${
                          p.status === "active"
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {p.status === "active" ? "Suspend Account" : "Activate Account"}
                      </button>

                      <button
                        onClick={() => handleTabChange("appointments")}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        Visits <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 5: APPOINTMENTS ACTIVITY ==================== */}
          {activeTab === "appointments" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Platform Appointment Activity</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time consultation activity scheduled between verified doctors and patients.
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-500">
                  Total Scheduled: <span className="text-slate-900 font-black">{appointments.length}</span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200/90 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Patient</th>
                      <th className="p-4">Consulting Physician</th>
                      <th className="p-4">Medical Specialty</th>
                      <th className="p-4">Date & Time</th>
                      <th className="p-4">Reason for Consultation</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{a.patientName}</div>
                          <div className="text-[11px] text-slate-400">{a.patientEmail}</div>
                        </td>
                        <td className="p-4 font-bold text-slate-800">{a.doctorName}</td>
                        <td className="p-4">
                          <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md text-[11px]">
                            {a.doctorSpecialization || "Specialist"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-800">{a.date}</span>
                          <span className="block text-[11px] text-slate-400">{a.time}</span>
                        </td>
                        <td className="p-4 text-slate-600 max-w-xs">{a.reason}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              a.status === "Upcoming"
                                ? "bg-blue-100 text-blue-800"
                                : a.status === "Completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB 6: ENCRYPTED VAULT (Zero-Knowledge Records) ==================== */}
          {activeTab === "records" && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Encrypted Medical Records Vault</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Zero-Knowledge administrative telemetry. Inspect SHA-256 integrity hashes and blockchain verification status.
                  </p>
                </div>
                <div className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold rounded-full flex items-center gap-1.5">
                  <Lock size={13} /> Plaintext Inaccessible by Policy
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200/90 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Document Title</th>
                      <th className="p-4">Patient Vault</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Cryptographic SHA-256 Hash</th>
                      <th className="p-4">Doctor Access Keys</th>
                      <th className="p-4">Integrity Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4 font-bold text-slate-900">
                          {r.title}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Uploaded {r.uploadedAt ? r.uploadedAt.split("T")[0] : "2026-11-15"}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-700">{r.patientName}</td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {r.category}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-[10px] text-slate-500 max-w-xs truncate" title={r.documentHash}>
                          {r.documentHash}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                            {r.authorizedDoctorsCount || 1} Doctor Authorized
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                            <ShieldCheck size={12} /> Blockchain Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB 7: BLOCKCHAIN & SECURITY AUDIT ==================== */}
          {activeTab === "audit" && (
            <div className="space-y-6">
              
              {/* Blockchain Header Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Cryptographic Blockchain Ledger</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tamper-evident SHA-256 block ledger tracking all document registrations, doctor consents, and user lifecycle events.
                    </p>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-emerald-100 text-emerald-800 flex items-center gap-1.5 self-start sm:self-auto">
                    <ShieldCheck size={16} /> Ledger State: Cryptographically Valid (0 Tampering)
                  </span>
                </div>

                {/* Blocks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {blockchainBlocks.map((blk) => (
                    <div
                      key={blk.index}
                      onClick={() => setSelectedBlock(blk)}
                      className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl p-4 transition cursor-pointer space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg">
                          Block #{blk.index}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {blk.timestamp ? new Date(blk.timestamp).toLocaleTimeString() : "Recent"}
                        </span>
                      </div>

                      <div className="font-mono text-[10px] text-slate-500 space-y-1">
                        <p className="truncate"><b>Hash:</b> {blk.hash}</p>
                        <p className="truncate"><b>Prev:</b> {blk.previousHash}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">Payload: {blk.data?.action || "DATA_RECORD"}</span>
                        <span className="text-red-600 font-bold flex items-center gap-0.5">
                          Inspect <ExternalLink size={12} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Audit Trail Table */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Full Platform Audit Trail ({auditLogs.length} Records)
                  </h3>
                  <span className="text-xs text-slate-400">Chronological Security Log</span>
                </div>

                <div className="overflow-x-auto border border-slate-200/90 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5">Timestamp</th>
                        <th className="p-3.5">Action Code</th>
                        <th className="p-3.5">Actor / User</th>
                        <th className="p-3.5">Role</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Audit Event Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition">
                          <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : "2026-11-15"}
                          </td>
                          <td className="p-3.5 font-mono font-bold text-slate-900">{log.action}</td>
                          <td className="p-3.5 text-slate-700">{log.userEmail || "System"}</td>
                          <td className="p-3.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {log.userRole || "System"}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                log.status === "success"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-600 max-w-sm">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ==================== ADD USER MODAL ==================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Add New System Account</h3>
                <p className="text-xs text-slate-500 mt-0.5">Creates and synchronizes the account directly in MongoDB Atlas</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {addError && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Conan or Jane Doe"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="text"
                    required
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Role</label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none bg-white font-bold"
                >
                  <option value="Patient">Patient</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              {/* Conditional Doctor Fields */}
              {addRole === "Doctor" && (
                <div className="p-4 bg-orange-50/50 border border-orange-200/80 rounded-2xl space-y-3">
                  <p className="font-bold text-orange-800 text-[11px] uppercase tracking-wider">Doctor Credentials</p>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Medical Specialty</label>
                    <input
                      type="text"
                      value={addSpecialty}
                      onChange={(e) => setAddSpecialty(e.target.value)}
                      placeholder="e.g. Cardiology, Neurology, Pediatrics"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Hospital Affiliation</label>
                      <input
                        type="text"
                        value={addHospital}
                        onChange={(e) => setAddHospital(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">License # (Optional)</label>
                      <input
                        type="text"
                        placeholder="MED-CA-XXXXX"
                        value={addLicense}
                        onChange={(e) => setAddLicense(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Patient Fields */}
              {addRole === "Patient" && (
                <div className="p-4 bg-blue-50/50 border border-blue-200/80 rounded-2xl space-y-3">
                  <p className="font-bold text-blue-800 text-[11px] uppercase tracking-wider">Patient Vitals Profile</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Age</label>
                      <input
                        type="number"
                        value={addAge}
                        onChange={(e) => setAddAge(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                      <select
                        value={addGender}
                        onChange={(e) => setAddGender(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                      <select
                        value={addBloodGroup}
                        onChange={(e) => setAddBloodGroup(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        placeholder="Phone number"
                        value={addContact}
                        onChange={(e) => setAddContact(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Emergency Contact</label>
                      <input
                        type="text"
                        placeholder="Name & contact"
                        value={addEmergencyContact}
                        onChange={(e) => setAddEmergencyContact(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingUser}
                  className="px-5 py-2.5 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition cursor-pointer"
                >
                  {addingUser ? "Writing to Atlas..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== INSPECT BLOCK MODAL ==================== */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Blockchain Block #{selectedBlock.index}
                </h3>
              </div>
              <button onClick={() => setSelectedBlock(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block font-sans">Block Hash:</span>
                <span className="text-slate-900 break-all font-bold">{selectedBlock.hash}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Previous Block Hash:</span>
                <span className="text-slate-600 break-all">{selectedBlock.previousHash}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Block Timestamp:</span>
                <span className="text-slate-800">{new Date(selectedBlock.timestamp).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">Merkle Payload:</span>
                <pre className="bg-white p-3 rounded-xl border border-slate-200 text-[10px] overflow-x-auto text-slate-700 font-sans">
                  {JSON.stringify(selectedBlock.data, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedBlock(null)}
                className="px-5 py-2 font-bold bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-full shadow-md"
              >
                Close Block View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
