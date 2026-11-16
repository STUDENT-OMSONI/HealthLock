import express from "express";
import { dbStore, hashPassword } from "../services/dbStore.js";
import { blockchainService } from "../services/blockchain.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Strict RBAC: All admin routes require Admin role
router.use(requireAuth, requireRole("Admin"));

// GET /api/admin/stats - Overview metrics
router.get("/stats", (req, res) => {
  const users = dbStore.getUsers();
  const patients = users.filter((u) => u.role === "Patient");
  const doctors = users.filter((u) => u.role === "Doctor");
  const verifiedDoctors = doctors.filter((d) => d.doctorDetails?.verificationStatus === "verified");
  const pendingDoctors = doctors.filter((d) => d.doctorDetails?.verificationStatus === "pending");
  const admins = users.filter((u) => u.role === "Admin");

  const records = dbStore.getRecords();
  const appointments = dbStore.getAppointments();
  const chainStatus = blockchainService.verifyChain();

  res.json({
    totalUsers: users.length,
    totalPatients: patients.length,
    totalDoctors: doctors.length,
    verifiedDoctors: verifiedDoctors.length,
    pendingDoctors: pendingDoctors.length,
    totalAdmins: admins.length,
    totalRecords: records.length,
    totalAppointments: appointments.length,
    blockchainBlocks: blockchainService.chain.length,
    blockchainValid: chainStatus.isValid,
  });
});

// GET /api/admin/users - List users with optional filter
router.get("/users", (req, res) => {
  const { role, status, search } = req.query;
  let list = dbStore.getUsers();

  if (role) {
    list = list.filter((u) => u.role === role);
  }
  if (status) {
    list = list.filter((u) => u.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }

  // Sanitize passwords
  const sanitized = list.map((u) => {
    const copy = { ...u };
    delete copy.password;
    return copy;
  });

  res.json({ users: sanitized });
});

// POST /api/admin/users - Admin directly registers a new user
router.post("/users", (req, res) => {
  const { name, email, password, role, doctorDetails, patientDetails } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required." });
  }

  const existing = dbStore.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: "A user with this email already exists." });
  }

  const assignedRole = ["Doctor", "Admin"].includes(role) ? role : "Patient";
  const userPayload = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: hashPassword(password),
    role: assignedRole,
    status: "active",
  };

  if (assignedRole === "Doctor") {
    userPayload.doctorDetails = {
      specialization: doctorDetails?.specialization || "General Medicine",
      licenseNumber: doctorDetails?.licenseNumber || "LIC-" + Math.floor(100000 + Math.random() * 900000),
      hospital: doctorDetails?.hospital || "HealthLock Medical Network",
      verificationStatus: "verified",
      verifiedAt: new Date().toISOString(),
      rating: "5.0 ★",
      experience: "10+ Years Experience",
    };
    userPayload.picture = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80";
  } else if (assignedRole === "Patient") {
    userPayload.patientDetails = {
      age: patientDetails?.age ? Number(patientDetails.age) : 25,
      gender: patientDetails?.gender || "Other",
      contact: patientDetails?.contact || "",
      bloodGroup: patientDetails?.bloodGroup || "O+",
      emergencyContact: patientDetails?.emergencyContact || "",
      medicalHistorySummary: patientDetails?.medicalHistorySummary || "",
    };
    userPayload.picture = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
  }

  const user = dbStore.createUser(userPayload);
  dbStore.addAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: "ADMIN_USER_CREATED",
    resource: user.id,
    status: "success",
    details: `Admin created new ${user.role} account: ${user.email}`,
  });

  const safe = { ...user };
  delete safe.password;
  res.status(201).json({ user: safe });
});

// DELETE /api/admin/users/:id - Delete user account
router.delete("/users/:id", (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: "Cannot delete your own admin account." });
  }
  const target = dbStore.findUserById(req.params.id);
  if (!target) return res.status(404).json({ error: "User not found" });

  dbStore.deleteUser(req.params.id);
  dbStore.addAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: "ADMIN_USER_DELETED",
    resource: req.params.id,
    status: "success",
    details: `Admin deleted user ${target.email} (${target.role})`,
  });
  res.json({ message: "User deleted successfully" });
});

// PATCH /api/admin/users/:id/role - Update user role
router.patch("/users/:id/role", (req, res) => {
  const { role } = req.body;
  if (!["Patient", "Doctor", "Admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role specified." });
  }

  const updated = dbStore.updateUser(req.params.id, { role });
  if (!updated) return res.status(404).json({ error: "User not found" });

  dbStore.addAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: "USER_ROLE_UPDATED",
    resource: req.params.id,
    status: "success",
    details: `Admin changed user ${updated.email} role to ${role}.`,
  });

  const safe = { ...updated };
  delete safe.password;
  res.json({ user: safe });
});

// PATCH /api/admin/users/:id/status - Suspend or activate account
router.patch("/users/:id/status", (req, res) => {
  const { status } = req.body;
  if (!["active", "suspended"].includes(status)) {
    return res.status(400).json({ error: "Status must be 'active' or 'suspended'." });
  }

  const updated = dbStore.updateUser(req.params.id, { status });
  if (!updated) return res.status(404).json({ error: "User not found" });

  dbStore.addAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: "USER_STATUS_UPDATED",
    resource: req.params.id,
    status: "success",
    details: `Admin set status of ${updated.email} to ${status}.`,
  });

  const safe = { ...updated };
  delete safe.password;
  res.json({ user: safe });
});

// PATCH /api/admin/doctors/:id/verify - Approve or reject doctor credentials
router.patch("/doctors/:id/verify", (req, res) => {
  const { verificationStatus } = req.body; // 'verified' | 'rejected' | 'pending'
  if (!["verified", "rejected", "pending"].includes(verificationStatus)) {
    return res.status(400).json({ error: "Invalid doctor verification status." });
  }

  const target = dbStore.findUserById(req.params.id);
  if (!target || target.role !== "Doctor") {
    return res.status(404).json({ error: "Doctor account not found." });
  }

  const doctorDetails = {
    ...(target.doctorDetails || {}),
    verificationStatus,
    verifiedAt: verificationStatus === "verified" ? new Date().toISOString() : null,
  };

  const updated = dbStore.updateUser(req.params.id, { doctorDetails });

  dbStore.addAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: "DOCTOR_VERIFICATION_UPDATED",
    resource: req.params.id,
    status: "success",
    details: `Doctor ${target.name} verification status set to ${verificationStatus}.`,
  });

  const safe = { ...updated };
  delete safe.password;
  res.json({ user: safe });
});

// GET /api/admin/audit-logs - System and security audit logs
router.get("/audit-logs", (req, res) => {
  const logs = dbStore.getAuditLogs(100);
  res.json({ logs });
});

// GET /api/admin/appointments - Monitor all appointment activity
router.get("/appointments", (req, res) => {
  const appts = dbStore.getAppointments();
  res.json({ appointments: appts });
});

// GET /api/admin/records - Monitor encrypted records metadata (Zero-Knowledge)
router.get("/records", (req, res) => {
  const records = dbStore.getRecords().map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    patientId: r.patientId,
    patientName: r.patientName,
    fileName: r.fileName,
    fileType: r.fileType,
    fileSize: r.fileSize,
    documentHash: r.documentHash,
    blockNumber: r.blockNumber,
    verified: r.verified,
    uploadedAt: r.uploadedAt,
    authorizedDoctorsCount: Object.keys(r.doctorKeys || {}).length,
  }));
  res.json({ records });
});

export default router;
