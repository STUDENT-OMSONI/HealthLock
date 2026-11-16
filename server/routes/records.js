import express from "express";
import { dbStore } from "../services/dbStore.js";
import { blockchainService } from "./../services/blockchain.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

// POST /api/records - Upload new client-side encrypted medical document
router.post("/", async (req, res) => {
  if (req.user.role !== "Patient") {
    return res.status(403).json({ error: "Only patients can upload personal medical records." });
  }

  const {
    title,
    category,
    description,
    fileName,
    fileType,
    fileSize,
    encryptedData,
    iv,
    documentHash,
    patientEncryptedKey,
  } = req.body;

  if (!title || !encryptedData || !iv || !documentHash || !patientEncryptedKey) {
    return res.status(400).json({
      error: "Missing required encrypted document payload (encryptedData, iv, documentHash, patientEncryptedKey).",
    });
  }

  // 1. Create Record with zero plaintext stored
  const record = dbStore.createRecord({
    patientId: req.user.id,
    patientName: req.user.name,
    title: title.trim(),
    category: category || "Other",
    description: description || "",
    fileName: fileName || "encrypted_document.bin",
    fileType: fileType || "application/octet-stream",
    fileSize: fileSize || 0,
    encryptedData, // Base64 AES-256-GCM ciphertext
    iv, // Base64 12-byte IV
    documentHash, // Cryptographic SHA-256 hash
    patientEncryptedKey, // RSA-OAEP encrypted AES key for patient
    doctorKeys: {}, // Maps doctorId -> doctorEncryptedKey
    uploadedAt: new Date().toISOString(),
  });

  // 2. Register Document Hash on the Blockchain Ledger
  // Rule: NEVER store patient names or personal data on the blockchain
  const block = blockchainService.addBlock(
    "DOCUMENT_REGISTERED",
    record.id,
    documentHash,
    req.user.id, // pseudonymous actor ID
    {
      recordType: category || "Other",
      fileSize: fileSize || 0,
      timestamp: new Date().toISOString(),
    }
  );

  // Link transaction hash to record
  dbStore.updateRecord(record.id, {
    blockchainTxId: block.hash,
    blockNumber: block.index,
    verified: true,
  });

  dbStore.syncBlockchain();

  dbStore.addAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: "RECORD_UPLOAD_E2EE",
    resource: record.id,
    status: "success",
    details: `Encrypted record '${title}' uploaded. Document hash: ${documentHash.slice(0, 16)}... Block #${block.index}`,
  });

  res.status(201).json({
    record: {
      ...record,
      blockchainTxId: block.hash,
      blockNumber: block.index,
    },
    blockchainBlock: block,
  });
});

// GET /api/records - Retrieve authorized records
router.get("/", async (req, res) => {
  const user = req.user;

  if (user.role === "Patient") {
    // Patient sees all of their own encrypted records
    const records = dbStore.getRecords({ patientId: user.id });
    return res.json({ records });
  }

  if (user.role === "Doctor") {
    // Doctor only sees records of patients who explicitly approved consent
    const activeConsents = dbStore.getConsents({ doctorId: user.id, status: "approved" });
    const consentedPatientIds = activeConsents.map((c) => c.patientId);

    // Fetch records for these consented patients
    const allConsentedRecords = dbStore
      .getRecords()
      .filter((r) => consentedPatientIds.includes(r.patientId))
      .map((r) => {
        const patient = dbStore.findUserById(r.patientId);
        // Attach doctor's specific encrypted key for local client decryption
        const doctorKey = r.doctorKeys?.[user.id] || null;
        return {
          ...r,
          patientName: patient?.name || r.patientName,
          patientPicture: patient?.picture || null,
          doctorEncryptedKey: doctorKey,
        };
      });

    return res.json({ records: allConsentedRecords });
  }

  if (user.role === "Admin") {
    // Admin cannot read encrypted data or keys -- only non-sensitive audit metadata
    const metadataOnly = dbStore.getRecords().map((r) => ({
      id: r.id,
      patientId: r.patientId,
      title: r.title,
      category: r.category,
      fileName: r.fileName,
      fileSize: r.fileSize,
      documentHash: r.documentHash,
      blockchainTxId: r.blockchainTxId,
      blockNumber: r.blockNumber,
      uploadedAt: r.uploadedAt,
    }));
    return res.json({ records: metadataOnly, note: "Admin restricted: Ciphertext and keys are omitted." });
  }

  res.status(403).json({ error: "Unauthorized access" });
});

// GET /api/records/:id - Retrieve specific encrypted record
router.get("/:id", async (req, res) => {
  const record = dbStore.findRecordById(req.params.id);
  if (!record) return res.status(404).json({ error: "Medical record not found." });

  // Authorization check
  if (req.user.role === "Patient") {
    if (record.patientId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: You do not own this medical record." });
    }
    return res.json({ record });
  }

  if (req.user.role === "Doctor") {
    // Verify consent
    const consent = dbStore.findConsent(record.patientId, req.user.id);
    if (!consent || consent.status !== "approved") {
      dbStore.addAuditLog({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: "UNAUTHORIZED_RECORD_ACCESS_ATTEMPT",
        resource: record.id,
        status: "failure",
        details: `Doctor attempted to access record ${record.id} without active patient consent.`,
      });
      return res.status(403).json({
        error: "Forbidden: No active patient authorization or consent has been granted for this record.",
      });
    }

    // Attach doctor key
    const doctorKey = record.doctorKeys?.[req.user.id] || null;

    // Log authorized access event on the blockchain ledger
    blockchainService.addBlock(
      "RECORD_ACCESSED",
      record.id,
      record.documentHash,
      req.user.id,
      { doctorEmail: req.user.email, accessTime: new Date().toISOString() }
    );
    dbStore.syncBlockchain();

    dbStore.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: "AUTHORIZED_RECORD_ACCESS",
      resource: record.id,
      status: "success",
      details: `Doctor accessed record ${record.title} under active patient consent.`,
    });

    return res.json({
      record: {
        ...record,
        doctorEncryptedKey: doctorKey,
      },
    });
  }

  res.status(403).json({ error: "Forbidden" });
});

// POST /api/records/:id/verify - Verify document hash against immutable blockchain ledger
router.post("/:id/verify", async (req, res) => {
  const { hash } = req.body;
  const record = dbStore.findRecordById(req.params.id);

  if (!record) {
    return res.status(404).json({ error: "Record not found" });
  }

  const testHash = hash || record.documentHash;
  const ledgerBlock = blockchainService.findDocumentBlock(record.id);

  if (!ledgerBlock) {
    return res.status(404).json({
      verified: false,
      message: "No registered blockchain transaction found for this document.",
    });
  }

  const hashMatches = ledgerBlock.documentHash === testHash;
  const chainStatus = blockchainService.verifyChain();

  res.json({
    verified: hashMatches && chainStatus.isValid,
    documentId: record.id,
    registeredHash: ledgerBlock.documentHash,
    submittedHash: testHash,
    blockNumber: ledgerBlock.index,
    transactionId: ledgerBlock.hash,
    previousHash: ledgerBlock.previousHash,
    blockTimestamp: ledgerBlock.timestamp,
    blockchainChainValid: chainStatus.isValid,
    status: hashMatches ? "TAMPER-PROOF & VERIFIED" : "TAMPER DETECTED / HASH MISMATCH",
  });
});

// DELETE /api/records/:id - Patient deletes record
router.delete("/:id", async (req, res) => {
  const record = dbStore.findRecordById(req.params.id);
  if (!record) return res.status(404).json({ error: "Record not found" });

  if (record.patientId !== req.user.id && req.user.role !== "Admin") {
    return res.status(403).json({ error: "Only the record owner can delete this record." });
  }

  dbStore.deleteRecord(req.params.id);

  // Register deletion on blockchain
  blockchainService.addBlock(
    "DOCUMENT_DELETED",
    record.id,
    record.documentHash,
    req.user.id,
    { deletedAt: new Date().toISOString() }
  );
  dbStore.syncBlockchain();

  dbStore.addAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: "RECORD_DELETED",
    resource: record.id,
    status: "success",
    details: `Medical record '${record.title}' deleted.`,
  });

  res.json({ success: true, message: "Record successfully removed." });
});

export default router;
