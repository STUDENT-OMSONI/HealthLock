import fs from "fs";
import path from "path";
import crypto from "crypto";
import mongoose from "mongoose";
import { blockchainService } from "./blockchain.js";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "healthlock-db.json");

// Helper for secure password hashing using Node native scrypt
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, originalHash] = stored.split(":");
  const testHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(testHash, "hex"), Buffer.from(originalHash, "hex"));
}

class DbStore {
  constructor() {
    this.data = {
      users: [],
      records: [],
      consents: [],
      appointments: [],
      prescriptions: [],
      auditLogs: [],
      blockchain: [],
    };
    this.ensureInitialized();
  }

  ensureInitialized() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
      } else {
        this.seedDefaults();
        this.save();
      }
    } catch (err) {
      console.warn("DB initialization warning:", err.message);
      this.seedDefaults();
    }

    // Initialize blockchain from persisted store if any
    if (this.data.blockchain && this.data.blockchain.length > 0) {
      blockchainService.loadChain(this.data.blockchain);
    } else {
      this.data.blockchain = blockchainService.chain;
      this.save();
    }
  }

  seedDefaults() {
    const adminId = "user_admin_01";
    const patientId = "user_patient_om_01";
    const doctorId = "user_doctor_smith_01";
    const defaultDoctorPassword = hashPassword("Doctor@123456");

    const defaultDoctors = [
      {
        id: "user_doctor_smith_01",
        _id: "user_doctor_smith_01",
        name: "Dr. Michael Smith, MD",
        email: "dr.smith@healthlock.com",
        password: defaultDoctorPassword,
        role: "Doctor",
        picture: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
        status: "active",
        doctorDetails: {
          specialization: "Cardiology",
          licenseNumber: "MED-CA-98741",
          hospital: "Metropolitan General Hospital",
          verificationStatus: "verified",
          verifiedAt: new Date().toISOString(),
          rating: "4.9 ★ (140+ reviews)",
          experience: "15+ Years Experience",
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "user_doctor_emily_02",
        _id: "user_doctor_emily_02",
        name: "Dr. Emily Davis, MD",
        email: "dr.emily@healthlock.com",
        password: defaultDoctorPassword,
        role: "Doctor",
        picture: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
        status: "active",
        doctorDetails: {
          specialization: "Neurology",
          licenseNumber: "MED-NY-54210",
          hospital: "Johns Hopkins Medical Center",
          verificationStatus: "verified",
          verifiedAt: new Date().toISOString(),
          rating: "4.9 ★ (128+ reviews)",
          experience: "12+ Years Experience",
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "user_doctor_sarah_03",
        _id: "user_doctor_sarah_03",
        name: "Dr. Sarah Johnson, MD",
        email: "dr.sarah@healthlock.com",
        password: defaultDoctorPassword,
        role: "Doctor",
        picture: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
        status: "active",
        doctorDetails: {
          specialization: "Pediatrics",
          licenseNumber: "MED-IL-33901",
          hospital: "Boston Children's Hospital",
          verificationStatus: "verified",
          verifiedAt: new Date().toISOString(),
          rating: "4.8 ★ (195+ reviews)",
          experience: "10+ Years Experience",
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "user_doctor_chen_04",
        _id: "user_doctor_chen_04",
        name: "Dr. Robert Chen, MD",
        email: "dr.chen@healthlock.com",
        password: defaultDoctorPassword,
        role: "Doctor",
        picture: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
        status: "active",
        doctorDetails: {
          specialization: "Orthopedics",
          licenseNumber: "MED-TX-77142",
          hospital: "Hospital for Special Surgery",
          verificationStatus: "verified",
          verifiedAt: new Date().toISOString(),
          rating: "4.9 ★ (210+ reviews)",
          experience: "16+ Years Experience",
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "user_doctor_priya_05",
        _id: "user_doctor_priya_05",
        name: "Dr. Priya Patel, MD",
        email: "dr.priya@healthlock.com",
        password: defaultDoctorPassword,
        role: "Doctor",
        picture: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&q=80",
        status: "active",
        doctorDetails: {
          specialization: "Dermatology",
          licenseNumber: "MED-CA-61209",
          hospital: "Stanford Health Care",
          verificationStatus: "verified",
          verifiedAt: new Date().toISOString(),
          rating: "4.9 ★ (165+ reviews)",
          experience: "11+ Years Experience",
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "user_doctor_miller_06",
        _id: "user_doctor_miller_06",
        name: "Dr. David Miller, MD",
        email: "dr.miller@healthlock.com",
        password: defaultDoctorPassword,
        role: "Doctor",
        picture: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80",
        status: "active",
        doctorDetails: {
          specialization: "Oncology",
          licenseNumber: "MED-NY-88320",
          hospital: "Memorial Sloan Kettering Cancer Center",
          verificationStatus: "verified",
          verifiedAt: new Date().toISOString(),
          rating: "5.0 ★ (180+ reviews)",
          experience: "18+ Years Experience",
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "user_doctor_aisha_07",
        _id: "user_doctor_aisha_07",
        name: "Dr. Aisha Al-Mansoor, MD",
        email: "dr.aisha@healthlock.com",
        password: defaultDoctorPassword,
        role: "Doctor",
        picture: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80",
        status: "active",
        doctorDetails: {
          specialization: "Psychiatry",
          licenseNumber: "MED-MA-44910",
          hospital: "Mount Sinai Medical Center",
          verificationStatus: "verified",
          verifiedAt: new Date().toISOString(),
          rating: "4.8 ★ (110+ reviews)",
          experience: "9+ Years Experience",
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "user_doctor_wilson_08",
        _id: "user_doctor_wilson_08",
        name: "Dr. James Wilson, MD",
        email: "dr.wilson@healthlock.com",
        password: defaultDoctorPassword,
        role: "Doctor",
        picture: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80",
        status: "active",
        doctorDetails: {
          specialization: "Gastroenterology",
          licenseNumber: "MED-MN-22874",
          hospital: "Mayo Clinic Health System",
          verificationStatus: "verified",
          verifiedAt: new Date().toISOString(),
          rating: "4.9 ★ (155+ reviews)",
          experience: "14+ Years Experience",
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "user_doctor_elena_09",
        _id: "user_doctor_elena_09",
        name: "Dr. Elena Rostova, MD",
        email: "dr.elena@healthlock.com",
        password: defaultDoctorPassword,
        role: "Doctor",
        picture: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80",
        status: "active",
        doctorDetails: {
          specialization: "Ophthalmology",
          licenseNumber: "MED-PA-99318",
          hospital: "Wills Eye Hospital",
          verificationStatus: "verified",
          verifiedAt: new Date().toISOString(),
          rating: "4.9 ★ (142+ reviews)",
          experience: "13+ Years Experience",
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "user_doctor_taylor_10",
        _id: "user_doctor_taylor_10",
        name: "Dr. Marcus Taylor, MD",
        email: "dr.taylor@healthlock.com",
        password: defaultDoctorPassword,
        role: "Doctor",
        picture: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80",
        status: "active",
        doctorDetails: {
          specialization: "Endocrinology",
          licenseNumber: "MED-OH-33019",
          hospital: "Cleveland Clinic Foundation",
          verificationStatus: "verified",
          verifiedAt: new Date().toISOString(),
          rating: "4.8 ★ (130+ reviews)",
          experience: "15+ Years Experience",
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "user_doctor_bennett_11",
        _id: "user_doctor_bennett_11",
        name: "Dr. Olivia Bennett, MD",
        email: "dr.bennett@healthlock.com",
        password: defaultDoctorPassword,
        role: "Doctor",
        picture: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=400&q=80",
        status: "active",
        doctorDetails: {
          specialization: "Pulmonology",
          licenseNumber: "MED-CA-55198",
          hospital: "UCSF Medical Center",
          verificationStatus: "verified",
          verifiedAt: new Date().toISOString(),
          rating: "4.9 ★ (175+ reviews)",
          experience: "14+ Years Experience",
        },
        createdAt: new Date().toISOString(),
      },
    ];

    this.data.users = [
      {
        id: "user_admin_main",
        _id: "user_admin_main",
        name: "Om Admin",
        email: "om27ec015@gmail.com",
        password: hashPassword("Admin@123456"),
        role: "Admin",
        status: "active",
        createdAt: new Date().toISOString(),
      },
      {
        id: adminId,
        _id: adminId,
        name: "System Administrator",
        email: "admin@healthlock.com",
        password: hashPassword("Admin@123456"),
        role: "Admin",
        status: "active",
        createdAt: new Date().toISOString(),
      },
      ...defaultDoctors,
      {
        id: "user_doctor_omsoni",
        _id: "user_doctor_omsoni",
        name: "Dr. Om Soni, MD",
        email: "omsoni2006456@gmail.com",
        password: hashPassword("Doctor@123456"),
        role: "Doctor",
        picture: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
        status: "active",
        doctorDetails: {
          specialization: "Cardiology",
          licenseNumber: "MED-DOC-7701",
          hospital: "MediKey Medical Network",
          verificationStatus: "verified",
          verifiedAt: new Date().toISOString(),
          rating: "4.9 ★ (150+ reviews)",
          experience: "10+ Years Experience",
        },
        createdAt: new Date().toISOString(),
      },
    ];

    this.data.appointments = [];
    this.data.prescriptions = [];
    this.data.consents = [];
    this.data.records = [];
    this.data.auditLogs = [];
  }

  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to persist database:", err.message);
    }
  }
  

  // --- MongoDB Atlas Synchronization ---
  async syncFromMongoDB() {
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const db = mongoose.connection.db;
        const users = await db.collection("users").find({}).toArray();
        const records = await db.collection("records").find({}).toArray();
        const consents = await db.collection("consents").find({}).toArray();
        const appointments = await db.collection("appointments").find({}).toArray();
        const prescriptions = await db.collection("prescriptions").find({}).toArray();
        const auditLogs = await db.collection("auditlogs").find({}).toArray();

        if (users && users.length > 0) {
          this.data.users = users.map((u) => ({ ...u, _id: u._id.toString() }));
          this.data.records = records.map((r) => ({ ...r, _id: r._id.toString() }));
          this.data.consents = consents.map((c) => ({ ...c, _id: c._id.toString() }));
          this.data.appointments = appointments.map((a) => ({ ...a, _id: a._id.toString() }));
          this.data.prescriptions = prescriptions.map((p) => ({ ...p, _id: p._id.toString() }));
          this.data.auditLogs = auditLogs.map((l) => ({ ...l, _id: l._id.toString() }));

          // Always enforce om27ec015@gmail.com as Main Admin
          let mainAdmin = this.data.users.find((u) => u.email.toLowerCase() === "om27ec015@gmail.com");
          if (!mainAdmin) {
            mainAdmin = {
              id: "user_admin_main",
              _id: "user_admin_main",
              name: "Om Admin",
              email: "om27ec015@gmail.com",
              password: hashPassword("Admin@123456"),
              role: "Admin",
              status: "active",
              createdAt: new Date().toISOString(),
            };
            this.data.users.unshift(mainAdmin);
            await db.collection("users").updateOne({ email: mainAdmin.email }, { $set: mainAdmin }, { upsert: true });
          } else if (mainAdmin.role !== "Admin") {
            mainAdmin.role = "Admin";
            await db.collection("users").updateOne({ email: mainAdmin.email }, { $set: { role: "Admin" } });
          }

          // Always enforce omsoni2006456@gmail.com as Doctor
          let docUser = this.data.users.find((u) => u.email.toLowerCase() === "omsoni2006456@gmail.com");
          if (!docUser) {
            docUser = {
              id: "user_doctor_omsoni",
              _id: "user_doctor_omsoni",
              name: "Dr. Om Soni, MD",
              email: "omsoni2006456@gmail.com",
              password: hashPassword("Doctor@123456"),
              role: "Doctor",
              picture: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
              status: "active",
              doctorDetails: {
                specialization: "Cardiology",
                licenseNumber: "MED-DOC-7701",
                hospital: "MediKey Medical Network",
                verificationStatus: "verified",
                verifiedAt: new Date().toISOString(),
                rating: "4.9 ★ (150+ reviews)",
                experience: "10+ Years Experience",
              },
              createdAt: new Date().toISOString(),
            };
            this.data.users.push(docUser);
            await db.collection("users").updateOne({ email: docUser.email }, { $set: docUser }, { upsert: true });
          } else if (docUser.role !== "Doctor") {
            docUser.role = "Doctor";
            if (!docUser.doctorDetails) {
              docUser.doctorDetails = {
                specialization: "Cardiology",
                licenseNumber: "MED-DOC-7701",
                hospital: "MediKey Medical Network",
                verificationStatus: "verified",
                verifiedAt: new Date().toISOString(),
                rating: "4.9 ★ (150+ reviews)",
                experience: "10+ Years Experience",
              };
            }
            await db.collection("users").updateOne({ email: docUser.email }, { $set: { role: "Doctor", doctorDetails: docUser.doctorDetails } });
          }

          this.save();
          console.log(
            `[dbStore] Synced live data from MongoDB Atlas (${this.data.users.length} users, ${this.data.records.length} records, ${this.data.appointments.length} appointments).`
          );
        } else {
          // If MongoDB collection is empty, seed defaults into MongoDB
          console.log("[dbStore] Seeding default clean records to MongoDB Atlas...");
          for (const u of this.data.users) {
            await db.collection("users").updateOne({ email: u.email }, { $set: u }, { upsert: true });
          }
          for (const a of this.data.appointments) {
            await db.collection("appointments").updateOne({ id: a.id }, { $set: a }, { upsert: true });
          }
          for (const p of this.data.prescriptions) {
            await db.collection("prescriptions").updateOne({ id: p.id }, { $set: p }, { upsert: true });
          }
          for (const c of this.data.consents) {
            await db.collection("consents").updateOne({ id: c.id }, { $set: c }, { upsert: true });
          }
          console.log("[dbStore] Successfully seeded default records to MongoDB Atlas.");
        }
      }
    } catch (err) {
      console.warn("[dbStore] syncFromMongoDB error:", err.message);
    }
  }

  async writeToMongo(collectionName, action, doc, filter) {
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const col = mongoose.connection.db.collection(collectionName);
        if (action === "insert" && doc) {
          await col.insertOne({ ...doc });
        } else if (action === "update" && doc && filter) {
          await col.updateOne(filter, { $set: doc });
        } else if (action === "delete" && filter) {
          await col.deleteOne(filter);
        }
      }
    } catch (err) {
      console.warn(`[dbStore] MongoDB write-through notice (${collectionName} ${action}):`, err.message);
    }
  }

  // --- Collection Helpers ---

  // Users
  getUsers(filter = {}) {
    return this.data.users.filter((u) => {
      for (const key of Object.keys(filter)) {
        if (u[key] !== filter[key]) return false;
      }
      return true;
    });
  }

  findUserById(id) {
    return this.data.users.find((u) => u.id === id || u._id === id);
  }

  findUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData) {
    const id = "user_" + crypto.randomUUID();
    const newUser = {
      id,
      _id: id,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    this.writeToMongo("users", "insert", newUser);
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex((u) => u.id === id || u._id === id);
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    this.writeToMongo("users", "update", updates, { $or: [{ id }, { _id: id }] });
    return this.data.users[idx];
  }

  deleteUser(id) {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter((u) => u.id !== id && u._id !== id);
    this.save();
    this.writeToMongo("users", "delete", null, { $or: [{ id }, { _id: id }] });
    return this.data.users.length < initialLen;
  }

  // Medical Records (E2EE)
  getRecords(filter = {}) {
    return this.data.records.filter((r) => {
      for (const key of Object.keys(filter)) {
        if (r[key] !== filter[key]) return false;
      }
      return true;
    });
  }

  findRecordById(id) {
    return this.data.records.find((r) => r.id === id || r._id === id);
  }

  createRecord(recordData) {
    const id = "rec_" + crypto.randomUUID();
    const newRecord = {
      id,
      _id: id,
      ...recordData,
      doctorKeys: recordData.doctorKeys || {}, // Map doctorId -> encryptedKey
      createdAt: new Date().toISOString(),
    };
    this.data.records.push(newRecord);
    this.save();
    this.writeToMongo("records", "insert", newRecord);
    return newRecord;
  }

  updateRecord(id, updates) {
    const idx = this.data.records.findIndex((r) => r.id === id || r._id === id);
    if (idx === -1) return null;
    this.data.records[idx] = {
      ...this.data.records[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    this.writeToMongo("records", "update", updates, { $or: [{ id }, { _id: id }] });
    return this.data.records[idx];
  }

  deleteRecord(id) {
    const initialLen = this.data.records.length;
    this.data.records = this.data.records.filter((r) => r.id !== id && r._id !== id);
    this.save();
    this.writeToMongo("records", "delete", null, { $or: [{ id }, { _id: id }] });
    return this.data.records.length < initialLen;
  }

  // Consents & Access Requests
  getConsents(filter = {}) {
    return this.data.consents.filter((c) => {
      for (const key of Object.keys(filter)) {
        if (c[key] !== filter[key]) return false;
      }
      return true;
    });
  }

  findConsent(patientId, doctorId) {
    return this.data.consents.find((c) => c.patientId === patientId && c.doctorId === doctorId);
  }

  findConsentById(id) {
    return this.data.consents.find((c) => c.id === id || c._id === id);
  }

  createConsentRequest(requestData) {
    const id = "req_" + crypto.randomUUID();
    const newReq = {
      id,
      _id: id,
      ...requestData,
      status: "pending",
      requestedAt: new Date().toISOString(),
    };
    this.data.consents.push(newReq);
    this.save();
    this.writeToMongo("consents", "insert", newReq);
    return newReq;
  }

  updateConsent(id, updates) {
    const idx = this.data.consents.findIndex((c) => c.id === id || c._id === id);
    if (idx === -1) return null;
    this.data.consents[idx] = {
      ...this.data.consents[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    this.writeToMongo("consents", "update", updates, { $or: [{ id }, { _id: id }] });
    return this.data.consents[idx];
  }

  // Appointments
  getAppointments(filter = {}) {
    return this.data.appointments.filter((a) => {
      for (const key of Object.keys(filter)) {
        if (a[key] !== filter[key]) return false;
      }
      return true;
    });
  }

  findAppointmentById(id) {
    return this.data.appointments.find((a) => a.id === id || a._id === id);
  }

  createAppointment(apptData) {
    const id = "appt_" + crypto.randomUUID();
    const appt = {
      id,
      _id: id,
      ...apptData,
      createdAt: new Date().toISOString(),
    };
    this.data.appointments.push(appt);
    this.save();
    this.writeToMongo("appointments", "insert", appt);
    return appt;
  }

  updateAppointment(id, updates) {
    const idx = this.data.appointments.findIndex((a) => a.id === id || a._id === id);
    if (idx === -1) return null;
    this.data.appointments[idx] = {
      ...this.data.appointments[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    this.writeToMongo("appointments", "update", updates, { $or: [{ id }, { _id: id }] });
    return this.data.appointments[idx];
  }

  deleteAppointment(id) {
    this.data.appointments = this.data.appointments.filter((a) => a.id !== id && a._id !== id);
    this.save();
    this.writeToMongo("appointments", "delete", null, { $or: [{ id }, { _id: id }] });
    return true;
  }

  // Prescriptions
  getPrescriptions(filter = {}) {
    return this.data.prescriptions.filter((p) => {
      for (const key of Object.keys(filter)) {
        if (p[key] !== filter[key]) return false;
      }
      return true;
    });
  }

  createPrescription(rxData) {
    const id = "rx_" + crypto.randomUUID();
    const rx = {
      id,
      _id: id,
      ...rxData,
      issuedDate: rxData.issuedDate || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };
    this.data.prescriptions.push(rx);
    this.save();
    this.writeToMongo("prescriptions", "insert", rx);
    return rx;
  }

  // Audit Logs
  addAuditLog(entry) {
    const log = {
      id: "log_" + crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
    this.writeToMongo("auditlogs", "insert", log);
    return log;
  }

  getAuditLogs(limit = 100) {
    return this.data.auditLogs.slice(0, limit);
  }

  // Blockchain persistence sync
  syncBlockchain() {
    this.data.blockchain = blockchainService.chain;
    this.save();
  }
}

export const dbStore = new DbStore();
