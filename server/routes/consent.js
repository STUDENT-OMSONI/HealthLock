import express from "express";
import { dbStore } from "../services/dbStore.js";
import { blockchainService } from "../services/blockchain.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

// POST /api/consent/request - Doctor requests access to patient records
router.post("/request", async (req, res) => {
  if (req.user.role !== "Doctor") {
    return res.status(403).json({ error: "Only licensed doctors can request record access." });
  }

  const { patientId, patientEmail, reason } = req.body;
  let targetPatient = null;

  if (patientId) {
    targetPatient = dbStore.findUserById(patientId);
  } else if (patientEmail) {
    targetPatient = dbStore.findUserByEmail(patientEmail);
  }

  if (!targetPatient || targetPatient.role !== "Patient") {
    return res.status(404).json({ error: "Patient not found. Check the Patient ID or registered email." });
  }

  const doctorUser = dbStore.findUserById(req.user.id);
  const existing = dbStore.findConsent(targetPatient.id, req.user.id);

  if (existing && existing.status === "approved") {
    return res.status(409).json({ error: "You already have active authorized access to this patient's records." });
  }

  if (existing && existing.status === "pending") {
    return res.status(409).json({ error: "An access request is already pending approval by this patient." });
  }

  const newRequest = dbStore.createConsentRequest({
    patientId: targetPatient.id,
    patientName: targetPatient.name,
    patientEmail: targetPatient.email,
    doctorId: req.user.id,
    doctorName: req.user.name,
    doctorEmail: req.user.email,
    doctorSpecialization: doctorUser?.doctorDetails?.specialization || "General Medicine",
    doctorHospital: doctorUser?.doctorDetails?.hospital || "HealthLock Network",
    reason: reason || "Medical consultation and treatment plan evaluation",
  });

  dbStore.addAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: "CONSENT_REQUEST_SENT",
    resource: newRequest.id,
    status: "success",
    details: `Doctor ${req.user.name} requested access to patient ${targetPatient.name} records.`,
  });

  res.status(201).json({ consentRequest: newRequest });
});

// GET /api/consent/patient - Patient views their incoming requests and active consents
router.get("/patient", async (req, res) => {
  if (req.user.role !== "Patient") {
    return res.status(403).json({ error: "Access restricted to patients." });
  }

  const consents = dbStore.getConsents({ patientId: req.user.id }).map((c) => {
    const doctor = dbStore.findUserById(c.doctorId);
    return {
      ...c,
      doctorName: doctor?.name || c.doctorName,
      doctorEmail: doctor?.email || c.doctorEmail,
      doctorPicture: doctor?.picture || null,
      doctorSpecialization: doctor?.doctorDetails?.specialization || c.doctorSpecialization,
      doctorHospital: doctor?.doctorDetails?.hospital || c.doctorHospital,
    };
  });
  res.json({ consents });
});

// GET /api/consent/doctor - Doctor views their requests and consented patients
router.get("/doctor", async (req, res) => {
  if (req.user.role !== "Doctor") {
    return res.status(403).json({ error: "Access restricted to doctors." });
  }

  const consents = dbStore.getConsents({ doctorId: req.user.id }).map((c) => {
    const patient = dbStore.findUserById(c.patientId);
    return {
      ...c,
      patientName: patient?.name || c.patientName,
      patientEmail: patient?.email || c.patientEmail,
      patientPicture: patient?.picture || null,
      patientDetails: patient?.patientDetails || {},
    };
  });
  res.json({ consents });
});

// POST /api/consent/approve - Patient approves doctor request and attaches re-encrypted keys
router.post("/approve", async (req, res) => {
  if (req.user.role !== "Patient") {
    return res.status(403).json({ error: "Only patients can approve consent requests." });
  }

  const { requestId, doctorEncryptedKeys } = req.body;
  const request = dbStore.findConsentById(requestId);

  if (!request) {
    return res.status(404).json({ error: "Consent request not found." });
  }

  if (request.patientId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden: Not your consent request." });
  }

  // If doctorEncryptedKeys were provided (map of recordId -> key encrypted for doctor),
  // update the corresponding medical records so doctor can decrypt
  if (doctorEncryptedKeys && typeof doctorEncryptedKeys === "object") {
    for (const [recordId, docKey] of Object.entries(doctorEncryptedKeys)) {
      const rec = dbStore.findRecordById(recordId);
      if (rec && rec.patientId === req.user.id) {
        const updatedDoctorKeys = { ...(rec.doctorKeys || {}), [request.doctorId]: docKey };
        dbStore.updateRecord(recordId, { doctorKeys: updatedDoctorKeys });
      }
    }
  }

  const updatedConsent = dbStore.updateConsent(requestId, {
    status: "approved",
    approvedAt: new Date().toISOString(),
  });

  // Record consent on Blockchain
  const block = blockchainService.addBlock(
    "CONSENT_GRANTED",
    requestId,
    "CONSENT_SHA256_PROOF_" + requestId.slice(-8),
    req.user.id,
    {
      doctorId: request.doctorId,
      patientId: req.user.id,
      timestamp: new Date().toISOString(),
    }
  );
  dbStore.syncBlockchain();

  dbStore.addAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: "CONSENT_APPROVED",
    resource: requestId,
    status: "success",
    details: `Patient granted medical record access to Dr. ${request.doctorName}. Block #${block.index}`,
  });

  res.json({ consent: updatedConsent, blockchainBlock: block });
});

// POST /api/consent/reject - Patient rejects doctor request
router.post("/reject", async (req, res) => {
  if (req.user.role !== "Patient") {
    return res.status(403).json({ error: "Only patients can reject consent requests." });
  }

  const { requestId } = req.body;
  const request = dbStore.findConsentById(requestId);

  if (!request || request.patientId !== req.user.id) {
    return res.status(404).json({ error: "Consent request not found." });
  }

  const updated = dbStore.updateConsent(requestId, {
    status: "rejected",
    rejectedAt: new Date().toISOString(),
  });

  dbStore.addAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: "CONSENT_REJECTED",
    resource: requestId,
    status: "success",
    details: `Patient declined access request from Dr. ${request.doctorName}.`,
  });

  res.json({ consent: updated });
});

// POST /api/consent/revoke - Patient revokes doctor's access
router.post("/revoke", async (req, res) => {
  if (req.user.role !== "Patient") {
    return res.status(403).json({ error: "Only patients can revoke consent." });
  }

  const { consentId, doctorId } = req.body;
  let targetConsent = null;

  if (consentId) {
    targetConsent = dbStore.findConsentById(consentId);
  } else if (doctorId) {
    targetConsent = dbStore.findConsent(req.user.id, doctorId);
  }

  if (!targetConsent || targetConsent.patientId !== req.user.id) {
    return res.status(404).json({ error: "Authorized consent record not found." });
  }

  const targetDoctorId = targetConsent.doctorId;

  // 1. Strip doctor's decryption keys from all of the patient's records
  const patientRecords = dbStore.getRecords({ patientId: req.user.id });
  for (const rec of patientRecords) {
    if (rec.doctorKeys && rec.doctorKeys[targetDoctorId]) {
      const keys = { ...rec.doctorKeys };
      delete keys[targetDoctorId];
      dbStore.updateRecord(rec.id, { doctorKeys: keys });
    }
  }

  // 2. Mark consent as revoked
  const updated = dbStore.updateConsent(targetConsent.id, {
    status: "revoked",
    revokedAt: new Date().toISOString(),
  });

  // 3. Register Revocation on Blockchain
  const block = blockchainService.addBlock(
    "CONSENT_REVOKED",
    targetConsent.id,
    "REVOKE_PROOF_" + targetConsent.id.slice(-8),
    req.user.id,
    {
      doctorId: targetDoctorId,
      patientId: req.user.id,
      timestamp: new Date().toISOString(),
    }
  );
  dbStore.syncBlockchain();

  dbStore.addAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: "CONSENT_REVOKED",
    resource: targetConsent.id,
    status: "success",
    details: `Patient revoked access permissions for Dr. ${targetConsent.doctorName}. Block #${block.index}`,
  });

  res.json({
    success: true,
    consent: updated,
    blockchainBlock: block,
    message: "Consent revoked. Doctor can no longer access or decrypt future records.",
  });
});

export default router;
