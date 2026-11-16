import express from "express";
import { blockchainService } from "../services/blockchain.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

// GET /api/blockchain/chain - Full cryptographic block ledger
router.get("/chain", (req, res) => {
  res.json({
    chain: blockchainService.chain,
    length: blockchainService.chain.length,
    latestBlock: blockchainService.getLatestBlock(),
  });
});

// GET /api/blockchain/status - Cryptographic chain integrity check
router.get("/status", (req, res) => {
  const result = blockchainService.verifyChain();
  res.json({
    ...result,
    network: "HealthLock-Permissioned-Ledger",
    consensus: "Proof-of-Authority (Multi-Node SHA-256 Chained)",
    timestamp: new Date().toISOString(),
  });
});

// POST /api/blockchain/verify-hash - Verify any document hash against the immutable ledger
router.post("/verify-hash", (req, res) => {
  const { hash } = req.body;
  if (!hash) {
    return res.status(400).json({ error: "Cryptographic SHA-256 hash is required for verification." });
  }

  const block = blockchainService.findBlockByHash(hash.trim().toLowerCase());
  const chainStatus = blockchainService.verifyChain();

  if (!block) {
    return res.json({
      verified: false,
      submittedHash: hash,
      status: "UNREGISTERED_OR_TAMPERED",
      message: "This hash does not exist in the HealthLock blockchain ledger. The file may have been altered or not registered.",
      chainValid: chainStatus.isValid,
    });
  }

  res.json({
    verified: true,
    status: "TAMPER-PROOF & VERIFIED",
    documentId: block.documentId,
    action: block.action,
    blockNumber: block.index,
    blockHash: block.hash,
    previousHash: block.previousHash,
    registeredAt: block.timestamp,
    validator: block.validator,
    chainValid: chainStatus.isValid,
  });
});

// GET /api/blockchain/document/:docId - History for a single document
router.get("/document/:docId", (req, res) => {
  const history = blockchainService.getDocumentHistory(req.params.docId);
  res.json({
    documentId: req.params.docId,
    history,
  });
});

export default router;
