import crypto from "crypto";

/**
 * HealthLock Permissioned Cryptographic Ledger (Blockchain)
 * 
 * Rules:
 * - Tamper-evident, cryptographically chained blocks.
 * - Stores ONLY pseudonymous identifiers, cryptographic hashes (SHA-256), timestamps, and audit actions.
 * - NEVER stores patient names, medical file contents, diagnoses, or private keys.
 */
class Block {
  constructor(index, timestamp, previousHash, action, documentId, documentHash, actorId, metadata = {}, nonce = 0) {
    this.index = index;
    this.timestamp = timestamp;
    this.previousHash = previousHash;
    this.action = action; // 'DOCUMENT_REGISTERED', 'CONSENT_GRANTED', 'CONSENT_REVOKED', 'RECORD_ACCESSED'
    this.documentId = documentId || null;
    this.documentHash = documentHash || null; // Cryptographic SHA-256
    this.actorId = actorId || "SYSTEM"; // Pseudonymous ID
    this.metadata = metadata; // E.g., { fileName, recordType } without PII
    this.nonce = nonce;
    this.validator = "HealthLock-Node-01";
    this.hash = this.calculateHash();
  }

  calculateHash() {
    const raw = `${this.index}${this.timestamp}${this.previousHash}${this.action}${this.documentId}${this.documentHash}${this.actorId}${JSON.stringify(this.metadata)}${this.nonce}${this.validator}`;
    return crypto.createHash("sha256").update(raw).digest("hex");
  }
}

class Blockchain {
  constructor() {
    this.chain = [];
    this.init();
  }

  init() {
    if (this.chain.length === 0) {
      const genesis = new Block(
        0,
        new Date("2026-01-01T00:00:00.000Z").toISOString(),
        "0000000000000000000000000000000000000000000000000000000000000000",
        "GENESIS_BLOCK",
        "GENESIS",
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "HEALTHLOCK_NETWORK_INIT",
        { network: "HealthLock-Permissioned-Ledger-v1" },
        0
      );
      this.chain.push(genesis);
    }
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  loadChain(blocks) {
    if (Array.isArray(blocks) && blocks.length > 0) {
      this.chain = blocks.map(
        (b) =>
          new Block(
            b.index,
            b.timestamp,
            b.previousHash,
            b.action,
            b.documentId,
            b.documentHash,
            b.actorId,
            b.metadata,
            b.nonce
          )
      );
    }
  }

  addBlock(action, documentId, documentHash, actorId, metadata = {}) {
    const prevBlock = this.getLatestBlock();
    const index = this.chain.length;
    const timestamp = new Date().toISOString();
    const previousHash = prevBlock.hash;

    // Simple proof-of-authority / verifiable nonce
    let nonce = 0;
    let block = new Block(index, timestamp, previousHash, action, documentId, documentHash, actorId, metadata, nonce);
    
    // In a permissioned healthcare ledger, blocks are validated immediately with SHA-256 chain integrity
    this.chain.push(block);
    return block;
  }

  verifyChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      // Re-calculate block hash
      if (current.hash !== current.calculateHash()) {
        return {
          isValid: false,
          brokenBlockIndex: current.index,
          error: `Block #${current.index} hash is invalid. Calculated ${current.calculateHash()} but found ${current.hash}`,
        };
      }

      // Check linkage
      if (current.previousHash !== previous.hash) {
        return {
          isValid: false,
          brokenBlockIndex: current.index,
          error: `Block #${current.index} previousHash does not match Block #${previous.index} hash.`,
        };
      }
    }

    return {
      isValid: true,
      totalBlocks: this.chain.length,
      latestBlockHash: this.getLatestBlock().hash,
    };
  }

  findDocumentBlock(documentId) {
    // Find the latest registration or access block for this document
    for (let i = this.chain.length - 1; i >= 0; i--) {
      if (this.chain[i].documentId === documentId && this.chain[i].action === "DOCUMENT_REGISTERED") {
        return this.chain[i];
      }
    }
    return null;
  }

  findBlockByHash(documentHash) {
    for (let i = this.chain.length - 1; i >= 0; i--) {
      if (this.chain[i].documentHash === documentHash) {
        return this.chain[i];
      }
    }
    return null;
  }

  getDocumentHistory(documentId) {
    return this.chain.filter((b) => b.documentId === documentId);
  }
}

export const blockchainService = new Blockchain();
