import express from "express";
import { dbStore } from "../services/dbStore.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

// GET /api/prescriptions
router.get("/", async (req, res) => {
  const user = req.user;

  const enrich = (rx) => {
    const patient = dbStore.findUserById(rx.patientId);
    const doctor = dbStore.findUserById(rx.doctorId);
    return {
      ...rx,
      patientName: patient?.name || rx.patientName,
      patientEmail: patient?.email || rx.patientEmail,
      patientPicture: patient?.picture || null,
      doctorName: doctor?.name || rx.doctorName,
      doctorEmail: doctor?.email || rx.doctorEmail,
      doctorPicture: doctor?.picture || null,
      doctorHospital: doctor?.doctorDetails?.hospital || rx.doctorHospital || "Metropolitan Health",
      doctorSpecialization: doctor?.doctorDetails?.specialization || rx.doctorSpecialization || "Specialist",
    };
  };

  if (user.role === "Patient") {
    const list = dbStore.getPrescriptions({ patientId: user.id }).map(enrich);
    return res.json({ prescriptions: list });
  }

  if (user.role === "Doctor") {
    const list = dbStore.getPrescriptions({ doctorId: user.id }).map(enrich);
    return res.json({ prescriptions: list });
  }

  if (user.role === "Admin") {
    const list = dbStore.getPrescriptions().map(enrich);
    return res.json({ prescriptions: list });
  }

  res.status(403).json({ error: "Unauthorized" });
});

// POST /api/prescriptions - Doctor issues new prescription
router.post("/", async (req, res) => {
  if (req.user.role !== "Doctor") {
    return res.status(403).json({ error: "Only licensed doctors can issue prescriptions." });
  }

  const { patientId, diagnosis, medications, notes } = req.body;

  if (!patientId || !diagnosis || !medications || !Array.isArray(medications) || medications.length === 0) {
    return res.status(400).json({ error: "Patient, diagnosis, and at least one medication item are required." });
  }

  const patient = dbStore.findUserById(patientId);
  if (!patient) {
    return res.status(404).json({ error: "Patient account not found." });
  }

  const prescription = dbStore.createPrescription({
    patientId: patient.id || patient._id,
    patientName: patient.name,
    patientEmail: patient.email,
    doctorId: req.user.id,
    doctorName: req.user.name,
    diagnosis: diagnosis.trim(),
    medications,
    notes: notes || "",
    issuedDate: new Date().toISOString().split("T")[0],
    status: "Active",
  });

  dbStore.addAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: "PRESCRIPTION_CREATED",
    resource: prescription.id,
    status: "success",
    details: `Doctor issued prescription for patient ${patient.name} (${medications.length} items).`,
  });

  res.status(201).json({ prescription });
});

// PATCH /api/prescriptions/:id
router.patch("/:id", async (req, res) => {
  if (req.user.role !== "Doctor" && req.user.role !== "Admin") {
    return res.status(403).json({ error: "Unauthorized to update prescription." });
  }

  const updated = dbStore.updatePrescription?.(req.params.id, req.body);
  res.json({ prescription: updated });
});

export default router;
