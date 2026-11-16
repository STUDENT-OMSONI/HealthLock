# HealthLock — Secure Healthcare Management System

[![Security](https://img.shields.io/badge/Encryption-AES--256--GCM-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)
[![Key Exchange](https://img.shields.io/badge/Key%20Exchange-RSA--OAEP%202048-purple.svg)](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)
[![Integrity](https://img.shields.io/badge/Blockchain-SHA--256%20Chained%20Ledger-emerald.svg)](/)
[![Status](https://img.shields.io/badge/Status-Active%20%26%20Verified-success.svg)](/)

HealthLock is a modern, responsive, and secure healthcare management platform engineered with **genuine Client-Side End-to-End Encryption (E2EE)**, **Permissioned Blockchain-Based Data Integrity**, and **Strict Patient-Controlled Access Permissions**.

---

## 1. System Architecture Overview

```
                      +-------------------------------------------------+
                      |            PATIENT BROWSER / DEVICE             |
                      |                                                 |
                      | 1. Generates unique AES-256 key (K_doc) + IV    |
                      | 2. Encrypts PDF/Image -> AES-GCM Ciphertext     |
                      | 3. Computes SHA-256 Document Hash               |
                      | 4. Encrypts K_doc with Patient's RSA Public Key |
                      +-------------------------------------------------+
                                     |                     |
                   [Ciphertext + Hash + Encrypted Key]     |
                                     v                     | [Re-encrypted K_doc
                      +---------------------------------+  |  using Doctor's Public Key
                      |    HEALTHLOCK BACKEND & API     |  |  upon Consent Approval]
                      |                                 |  |
                      | - Zero plaintext medical files  |  |
                      | - Zero plaintext AES keys       |<-+
                      | - Enforces JWT sessions & RBAC  |
                      | - Records SHA-256 on Blockchain |
                      +---------------------------------+
                                     |
               +---------------------+---------------------+
               v                                           v
+-------------------------------+       +------------------------------------+
|  PERMISSIONED BLOCKCHAIN      |       |          STORAGE LAYER             |
|                               |       |                                    |
| - Tamper-evident block chain  |       | - MongoDB Atlas (Primary)          |
| - SHA-256 block hash linking  |       | - Auto-resilient JSON fallback     |
| - Records: Document Registr., |       | - Stores Ciphertext & Metadata     |
|   Consent Grants, Revocations |       | - Zero Plaintext Stored            |
+-------------------------------+       +------------------------------------+
               ^
               | [Integrity Query]
               |
+-------------------------------------------------------+
|             DOCTOR BROWSER / DEVICE                   |
|                                                       |
| 1. Requests patient consent                           |
| 2. Downloads Ciphertext + Doctor-Encrypted AES Key    |
| 3. Decrypts AES Key using Doctor's Private RSA Key    |
| 4. Decrypts Ciphertext using AES-256-GCM locally     |
| 5. Verifies SHA-256 hash against Blockchain Ledger    |
+-------------------------------------------------------+
```

---

## 2. Core Security Pillars

### A. Genuine Client-Side End-to-End Encryption (E2EE)
- **Document Encryption**: Each medical document is encrypted using **AES-256-GCM** with a cryptographically secure random 256-bit symmetric key (`K_doc`) and a unique 12-byte initialization vector (`iv`).
- **Asymmetric Key Exchange**: Every user generates an **RSA-OAEP 2048-bit** key pair (SHA-256 hash). The user's public key is shared on their profile; their private key **never leaves their browser**.
- **Doctor Key Sharing**: When a patient approves a doctor's access request, the patient's device decrypts `K_doc` using their own private key, re-encrypts `K_doc` using the doctor's verified RSA public key, and publishes the encrypted key.
- **Zero-Knowledge Backend**: The server only receives and stores ciphertext, IVs, document hashes, and asymmetric encrypted key envelopes. The backend cannot read medical documents in plaintext.

### B. Permissioned Blockchain & Tamper-Evident Ledger
- **SHA-256 Document Registration**: When a document is uploaded, its cryptographic SHA-256 hash is computed in the browser and registered on the blockchain.
- **Cryptographic Chaining**: Each block contains:
  $$\text{Block Hash} = \text{SHA256}(\text{Index} + \text{Timestamp} + \text{PreviousHash} + \text{Action} + \text{DocumentHash} + \text{ActorId} + \text{Metadata} + \text{Nonce})$$
- **Tamper Detection**: If even 1 byte of a medical file is altered off-chain, its calculated hash will not match the registered hash on the blockchain ledger, triggering an immediate integrity alert.
- **Privacy Guarantee**: Patient names, diagnoses, prescriptions, and medical files are **never** stored on the blockchain. Only pseudonymous identifiers, document hashes, and audit action types are recorded.

### C. Zero-Knowledge Admin Access
- Administrators manage users, monitor appointments, verify doctor credentials, and audit security events.
- **Strict Rule**: Admin privileges do **not** grant access to decrypted patient medical records. Document ciphertext and decryption keys remain inaccessible to administrative accounts.

---

## 3. Dedicated Role Dashboards

### 1. Patient Dashboard (`/dashboard` or `/patient`)
- **Overview**: Next appointment, active medications, pending doctor requests, and blockchain verification status.
- **My Medical Records**: Upload PDF and image records with client-side AES-256-GCM encryption; decrypt and view records locally; verify document integrity against the blockchain ledger.
- **Appointments**: View upcoming visits and schedule consultations with verified doctors.
- **Prescriptions**: View prescriptions issued by consulting doctors with medication names, dosages, frequencies, and durations.
- **Doctor Access & Consent**: Review doctor access requests, grant consent with automatic cryptographic key exchange, or immediately revoke access.
- **Blockchain Verification**: Interactive tool to verify any document file against the immutable blockchain ledger and view block transaction proofs.
- **Profile**: Manage personal health profile (blood group, age, contact, emergency person).

### 2. Doctor Dashboard (`/doctor`)
- **Overview**: Authorized patients count, decryptable records count, upcoming visits, and pending requests.
- **Authorized Patients**: Directory of patients who have explicitly granted access.
- **Patient Records**: View and decrypt patient medical records locally using the doctor's private RSA key.
- **Appointments**: Manage consultation schedule, complete visits, and enter clinical consultation notes.
- **Prescriptions**: Create structured prescriptions (patient, diagnosis, medications array with dosage/duration, dietary instructions).
- **Access Requests**: Request access to a patient's records using their registered email address.

### 3. Admin Dashboard (`/admin`)
- **Overview & Telemetry (`?tab=overview`)**: Real-time platform metrics, live MongoDB Atlas status, verified doctor quick roster, and recent appointment feeds.
- **User Management (`?tab=users`)**: Search, filter, modify roles (`Patient`, `Doctor`, `Admin`), suspend or activate accounts, and add new users directly into MongoDB Atlas.
- **Doctor Verification (`?tab=doctors`)**: Review medical licenses, hospital affiliations, ratings, and approve (`verified`) or reject doctor practice credentials.
- **Patient Accounts (`?tab=patients`)**: Manage patient profiles, blood groups, age, contact information, and emergency contacts.
- **Platform Appointments (`?tab=appointments`)**: Monitor scheduling and visit activity across all medical disciplines.
- **Encrypted Records Vault (`?tab=records`)**: Zero-Knowledge view of document titles, upload timestamps, patient vaults, and cryptographic SHA-256 integrity hashes without exposing plaintext medical data or private keys.
- **Blockchain & Security Audit (`?tab=audit`)**: Inspect cryptographic SHA-256 block ledger, previous block hash chaining, and tamper-evident audit logs.

---

## 4. Default Accounts for Instant Testing

The system is connected live to **MongoDB Atlas** with pre-seeded, verified accounts across all roles:

| Role | Name | Email Address | Password | Permissions & Category |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | System Administrator | `admin@healthlock.com` | `Admin@123456` | Platform administration, Doctor verification, Zero-Knowledge Vault, Audit logs |
| **Patient** | Om Soni | `omsoni2006456@gmail.com` | `Patient@123456` | Upload encrypted records, approve/revoke doctor consent, book consultations |
| **Doctor** | Dr. Michael Smith, MD | `dr.smith@healthlock.com` | `Doctor@123456` | **Cardiology** — View consented patients, decrypt records, issue prescriptions |
| **Doctor** | Dr. Emily Davis, MD | `dr.emily@healthlock.com` | `Doctor@123456` | **Neurology** — Johns Hopkins Medical Center |
| **Doctor** | Dr. Sarah Johnson, MD | `dr.sarah@healthlock.com` | `Doctor@123456` | **Pediatrics** — Boston Children's Hospital |
| **Doctor** | Dr. Robert Chen, MD | `dr.chen@healthlock.com` | `Doctor@123456` | **Orthopedics** — Hospital for Special Surgery |
| **Doctor** | Dr. Priya Patel, MD | `dr.priya@healthlock.com` | `Doctor@123456` | **Dermatology** — Stanford Health Care |
| **Doctor** | Dr. David Miller, MD | `dr.miller@healthlock.com` | `Doctor@123456` | **Oncology** — Memorial Sloan Kettering Cancer Center |
| **Doctor** | Dr. Aisha Al-Mansoor, MD | `dr.aisha@healthlock.com` | `Doctor@123456` | **Psychiatry** — Mount Sinai Medical Center |
| **Doctor** | Dr. James Wilson, MD | `dr.wilson@healthlock.com` | `Doctor@123456` | **Gastroenterology** — Mayo Clinic Health System |
| **Doctor** | Dr. Elena Rostova, MD | `dr.elena@healthlock.com` | `Doctor@123456` | **Ophthalmology** — Wills Eye Hospital |
| **Doctor** | Dr. Marcus Taylor, MD | `dr.taylor@healthlock.com` | `Doctor@123456` | **Endocrinology** — Cleveland Clinic Foundation |
| **Doctor** | Dr. Olivia Bennett, MD | `dr.bennett@healthlock.com` | `Doctor@123456` | **Pulmonology** — UCSF Medical Center |

*(All doctor accounts are pre-verified with license numbers and default password `Doctor@123456`. You can also register brand-new Patient or Doctor accounts directly from the Register page.)*

---

## 5. Technology Stack

- **Frontend**: React 19, Vite 7, Tailwind CSS 4, Lucide React, Framer Motion, Recharts.
- **Cryptography**: Web Crypto API (`window.crypto.subtle`) — Native AES-256-GCM, RSA-OAEP 2048-bit, SHA-256.
- **Backend**: Node.js 22, Express 4, JWT (`jsonwebtoken`), Scrypt password hashing (`node:crypto`).
- **Database**: Dual-Mode Resilient Data Engine:
  - MongoDB Atlas (production connection via `MONGODB_URI`)
  - Auto-fallback to local persistent JSON store (`server/data/healthlock-db.json`) when offline.
- **Blockchain**: Permissioned Cryptographic Block Ledger (`server/services/blockchain.js`).

---

## 6. How to Run the Project

### Running Both Services

**Terminal 1 — Backend Server:**
```powershell
cd server
npm run dev
```
*Backend runs on `http://localhost:5000` with health check at `http://localhost:5000/api/health`.*

**Terminal 2 — Frontend Dev Server:**
```powershell
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 7. Security Verification Checklist

- [x] **Client-Side E2EE**: Documents are encrypted with AES-256-GCM before upload.
- [x] **Zero Plaintext on Server**: Server stores only ciphertext, IV, and asymmetric key envelopes.
- [x] **Blockchain SHA-256 Integrity**: Documents have SHA-256 hashes anchored in chained blocks.
- [x] **Tamper Detection**: Altering file bytes fails hash verification with `TAMPER DETECTED / HASH MISMATCH`.
- [x] **Patient-Controlled Consent**: Doctors cannot access records without approved patient consent.
- [x] **Consent Revocation**: Revoking consent removes the doctor's key and records a `CONSENT_REVOKED` block.
- [x] **Admin Zero-Knowledge**: Admins cannot decrypt patient medical records.
- [x] **Password Hashing**: Passwords hashed using memory-hard `scrypt` with random cryptographic salts.
