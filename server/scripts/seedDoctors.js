import "dotenv/config";
import mongoose from "mongoose";
import dns from "node:dns";
import crypto from "crypto";
import fs from "fs";
import path from "path";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const defaultPassword = hashPassword("Doctor@123456");

export const doctorsList = [
  {
    id: "user_doctor_smith_01",
    _id: "user_doctor_smith_01",
    name: "Dr. Michael Smith, MD",
    email: "dr.smith@healthlock.com",
    password: defaultPassword,
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
    password: defaultPassword,
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
    password: defaultPassword,
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
    password: defaultPassword,
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
    password: defaultPassword,
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
    password: defaultPassword,
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
    password: defaultPassword,
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
    password: defaultPassword,
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
    password: defaultPassword,
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
    password: defaultPassword,
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
    password: defaultPassword,
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

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    for (const doc of doctorsList) {
      await db.collection("users").updateOne(
        { email: doc.email },
        { $set: doc },
        { upsert: true }
      );
      console.log(`[Seed] Doctor upserted in MongoDB Atlas: ${doc.name} (${doc.doctorDetails.specialization})`);
    }

    // Sync to local healthlock-db.json
    const dbFilePath = path.resolve("data/healthlock-db.json");
    if (fs.existsSync(dbFilePath)) {
      const raw = JSON.parse(fs.readFileSync(dbFilePath, "utf8"));
      const nonDoctors = (raw.users || []).filter((u) => u.role !== "Doctor");
      raw.users = [...nonDoctors, ...doctorsList];
      fs.writeFileSync(dbFilePath, JSON.stringify(raw, null, 2), "utf8");
      console.log(`[Seed] Updated local healthlock-db.json with ${doctorsList.length} doctors`);
    }

    const doctorCount = await db.collection("users").countDocuments({ role: "Doctor" });
    console.log(`[Seed] Total doctors now verified in MongoDB Atlas: ${doctorCount}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("[Seed] Error seeding doctors:", err);
    process.exit(1);
  }
}

seed();
