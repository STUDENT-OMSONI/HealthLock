import express from "express";
import crypto from "crypto";
import Patient from "../models/Patient.js";
import AuditLog from "../models/AuditLog.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Patient records are managed by hospital staff (Doctor/Admin), not by the
// Patient role directly -- a Patient role in this app is a portal account,
// separate from the hospital's internal patient database. Every route
// below requires Doctor or Admin; a Patient-role token gets a real 403.
router.use(requireAuth, requireRole("Doctor", "Admin"));

function generateQrToken() {
  return "HL-" + crypto.randomUUID();
}

// GET /api/patients - list all, with optional search
router.get("/", async (req, res) => {
  const { q } = req.query;
  const filter = q
    ? {
        $or: [
          { name: new RegExp(q, "i") },
          { diagnosis: new RegExp(q, "i") },
          { contact: new RegExp(q, "i") },
        ],
      }
    : {};
  const patients = await Patient.find(filter).sort({ createdAt: -1 });
  res.json({ patients });
});

// GET /api/patients/by-token/:qrToken - used by the Doctor QR scanner
router.get("/by-token/:qrToken", async (req, res) => {
  const patient = await Patient.findOne({ qrToken: req.params.qrToken });

  // Written server-side, right here, regardless of outcome -- this can't
  // be skipped or forged by the frontend, unlike a client-only audit log.
  await AuditLog.create({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: "QR_PATIENT_ACCESS",
    resource: patient ? patient._id.toString() : req.params.qrToken,
    status: patient ? "success" : "failure",
    details: patient ? `Accessed ${patient.name}` : "QR token did not match any patient",
  });

  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json({ patient });
});

// POST /api/patients - create, with a guaranteed-unique QR token
router.post("/", async (req, res) => {
  try {
    const patient = await Patient.create({
      ...req.body,
      qrToken: generateQrToken(),
      createdBy: req.user.id,
    });
    res.status(201).json({ patient });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/patients/:id - update
router.patch("/:id", async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json({ patient });
});

// DELETE /api/patients/:id
router.delete("/:id", async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json({ success: true });
});

// POST /api/patients/:id/files - add an uploaded file to a patient
router.post("/:id/files", async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  patient.files.push(req.body);
  await patient.save();
  res.json({ patient });
});

export default router;
