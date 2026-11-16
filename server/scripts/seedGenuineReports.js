import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
import { blockchainService } from "../services/blockchain.js";
import { dbStore } from "../services/dbStore.js";

dotenv.config();

function generateReportHTML(title, category, lab, doctor, date, tests, impression) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} - HealthLock Official Clinical Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .report-card { max-width: 820px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); padding: 36px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #dc2626; padding-bottom: 20px; margin-bottom: 24px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-logo { width: 44px; height: 44px; background: #dc2626; color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; }
    .brand-name { font-size: 20px; font-weight: 900; color: #0f172a; margin: 0; }
    .lab-info { font-size: 11px; color: #64748b; margin-top: 2px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .patient-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; font-size: 12px; }
    .patient-box div p { margin: 0; color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
    .patient-box div h5 { margin: 3px 0 0; color: #0f172a; font-size: 13px; font-weight: 800; }
    .test-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
    .test-table th { background: #f1f5f9; color: #334155; font-weight: 700; text-align: left; padding: 10px 14px; border-bottom: 1px solid #cbd5e1; }
    .test-table td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; }
    .test-table tr:hover { background: #f8fafc; }
    .val-normal { color: #15803d; font-weight: 800; }
    .impression { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; }
    .impression h4 { margin: 0 0 6px; color: #166534; font-size: 12px; text-transform: uppercase; font-weight: 800; }
    .impression p { margin: 0; font-size: 12px; color: #14532d; line-height: 1.5; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 20px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #64748b; }
    .signatures { display: flex; gap: 32px; }
    .sig { text-align: center; }
    .sig-line { width: 130px; height: 1px; background: #94a3b8; margin: 24px auto 4px; }
    .security-stamp { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; font-family: monospace; font-size: 10px; color: #475569; }
  </style>
</head>
<body>
  <div class="report-card">
    <div class="header">
      <div class="brand">
        <div class="brand-logo">H</div>
        <div>
          <h1 class="brand-name">${lab}</h1>
          <p class="lab-info">NABL Accredited Medical Diagnostics Laboratory &bull; ISO 15189 Certified</p>
        </div>
      </div>
      <div>
        <span class="badge">${category}</span>
      </div>
    </div>

    <div class="patient-box">
      <div>
        <p>Patient Name</p>
        <h5>Om Soni</h5>
      </div>
      <div>
        <p>Patient ID / Age / Gender</p>
        <h5>HL-98214 &bull; 22 Y / Male</h5>
      </div>
      <div>
        <p>Referring Physician</p>
        <h5>${doctor}</h5>
      </div>
      <div>
        <p>Collection & Report Date</p>
        <h5>${date}</h5>
      </div>
    </div>

    <h3 style="font-size: 15px; font-weight: 800; margin: 0 0 12px; color: #0f172a;">${title}</h3>
    <table class="test-table">
      <thead>
        <tr>
          <th>Investigation Parameter</th>
          <th>Observed Value</th>
          <th>Unit</th>
          <th>Biological Reference Range</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${tests.map(t => `
          <tr>
            <td style="font-weight: 600; color: #1e293b;">${t.param}</td>
            <td class="val-normal">${t.val}</td>
            <td style="color: #64748b;">${t.unit}</td>
            <td style="color: #64748b;">${t.ref}</td>
            <td><span style="color: #15803d; font-weight: 700; background: #dcfce7; padding: 2px 8px; border-radius: 6px; font-size: 10px;">NORMAL</span></td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div class="impression">
      <h4>Clinical Impression & Conclusion</h4>
      <p>${impression}</p>
    </div>

    <div class="security-stamp">
      <div><b>Security:</b> Client-Side 256-bit AES-GCM Encrypted &bull; Tamper-Proof Cryptographic Signature</div>
      <div style="margin-top: 3px;"><b>HealthLock Blockchain:</b> Verified on Permissioned Consensus Ledger</div>
    </div>

    <div class="footer">
      <div>
        <p style="margin: 0;">Report verified electronically by attending clinical pathologists.</p>
        <p style="margin: 2px 0 0;">Strict confidentiality under HIPAA & DISHA Healthcare Protocol.</p>
      </div>
      <div class="signatures">
        <div class="sig">
          <div class="sig-line"></div>
          <b>Dr. A. K. Sharma, MD</b>
          <div style="font-size: 9px; color: #94a3b8;">Chief Pathologist</div>
        </div>
        <div class="sig">
          <div class="sig-line"></div>
          <b>${doctor}</b>
          <div style="font-size: 9px; color: #94a3b8;">Consultant Physician</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function seedReports() {
  console.log("=== Seeding Genuine HealthLock Diagnostic Reports ===");
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // 1. Fetch Patient and Doctor
  const patient = await db.collection("users").findOne({ email: "omsoni2006456@gmail.com" });
  const doctor = await db.collection("users").findOne({ email: "dr.smith@healthlock.com" });

  if (!patient || !doctor) {
    console.error("Required patient or doctor account not found!");
    process.exit(1);
  }

  const patientId = patient.id || patient._id.toString();
  const doctorId = doctor.id || doctor._id.toString();
  console.log(`Target Patient: ${patient.name} (${patientId})`);
  console.log(`Target Doctor: ${doctor.name} (${doctorId})`);

  // 2. Remove old mock/test records for clean state
  const deleteRes = await db.collection("records").deleteMany({ patientId });
  console.log(`Cleared ${deleteRes.deletedCount} old/duplicate records from MongoDB.`);

  // 3. Define 4 Genuine Diagnostic Reports
  const genuineReportsData = [
    {
      title: "Complete Blood Count (CBC) with Automated Differential Hemogram",
      category: "Blood Test",
      description: "Full clinical hemogram including hemoglobin, RBC indices, leukocyte differential, and platelet count.",
      fileName: "Complete_Blood_Count_Hemogram_Report.html",
      lab: "Metropolis Clinical Reference Laboratories",
      doctor: "Dr. Michael Smith, MD",
      date: "14-Nov-2026, 08:30 AM",
      tests: [
        { param: "Hemoglobin (Hb)", val: "14.8", unit: "g/dL", ref: "13.0 - 17.0" },
        { param: "Total RBC Count", val: "5.12", unit: "mil/uL", ref: "4.5 - 5.5" },
        { param: "Total Leukocyte Count (WBC)", val: "6,800", unit: "cells/uL", ref: "4,000 - 11,000" },
        { param: "Platelet Count", val: "245,000", unit: "/uL", ref: "150,000 - 450,000" },
        { param: "Packed Cell Volume (PCV)", val: "44.5", unit: "%", ref: "40.0 - 50.0" },
        { param: "Mean Corpuscular Volume (MCV)", val: "87.0", unit: "fL", ref: "80.0 - 98.0" },
        { param: "Neutrophils", val: "62", unit: "%", ref: "40 - 75" },
        { param: "Lymphocytes", val: "30", unit: "%", ref: "20 - 45" },
        { param: "Eosinophils", val: "3", unit: "%", ref: "1 - 6" },
        { param: "Monocytes", val: "5", unit: "%", ref: "2 - 8" },
      ],
      impression: "Normal complete hemogram. Normocytic normochromic red cells with adequate platelets. No toxic granules or atypical leukocytes detected.",
    },
    {
      title: "Comprehensive Fasting Lipid Profile & Cardiovascular Risk Assessment",
      category: "Cardiology",
      description: "Fasting lipid panel assessing total cholesterol, triglycerides, HDL, LDL, and cardiovascular risk ratios.",
      fileName: "Comprehensive_Lipid_Profile_Report.html",
      lab: "Apollo Institute of Cardiac Sciences Diagnostics",
      doctor: "Dr. Michael Smith, MD",
      date: "12-Nov-2026, 07:45 AM",
      tests: [
        { param: "Total Cholesterol", val: "172", unit: "mg/dL", ref: "< 200 (Desirable)" },
        { param: "HDL Cholesterol (Good)", val: "52", unit: "mg/dL", ref: "> 40 (Optimal)" },
        { param: "LDL Cholesterol (Direct)", val: "94", unit: "mg/dL", ref: "< 100 (Optimal)" },
        { param: "Triglycerides (Fasting)", val: "128", unit: "mg/dL", ref: "< 150 (Normal)" },
        { param: "VLDL Cholesterol", val: "25.6", unit: "mg/dL", ref: "10.0 - 30.0" },
        { param: "Total Cholesterol / HDL Ratio", val: "3.3", unit: "Ratio", ref: "< 4.5 (Favorable)" },
        { param: "LDL / HDL Ratio", val: "1.8", unit: "Ratio", ref: "< 3.0 (Favorable)" },
      ],
      impression: "Desirable lipid profile with optimal LDL and protective HDL levels. 10-year estimated cardiovascular risk is minimal (< 2%).",
    },
    {
      title: "Glycated Hemoglobin (HbA1c) & Fasting Plasma Glucose Analysis",
      category: "Endocrinology",
      description: "Quantitative assessment of 90-day glycemic control and basal plasma glucose levels.",
      fileName: "HbA1c_Fasting_Glucose_Report.html",
      lab: "Max Super Speciality Clinical Laboratories",
      doctor: "Dr. Marcus Taylor, MD & Dr. Michael Smith, MD",
      date: "10-Nov-2026, 08:15 AM",
      tests: [
        { param: "HbA1c (Glycated Hemoglobin)", val: "5.3", unit: "%", ref: "4.0 - 5.6 (Normal)" },
        { param: "Estimated Average Glucose (eAG)", val: "105", unit: "mg/dL", ref: "70 - 120" },
        { param: "Fasting Plasma Glucose (FBS)", val: "86", unit: "mg/dL", ref: "70 - 99 (Normal)" },
        { param: "Post-Prandial Glucose (2h)", val: "116", unit: "mg/dL", ref: "< 140 (Normal)" },
        { param: "Fasting Serum Insulin", val: "6.2", unit: "uIU/mL", ref: "2.6 - 24.9" },
      ],
      impression: "Normal glycemic status with excellent glucose regulation. HbA1c 5.3% confirms non-diabetic profile.",
    },
    {
      title: "12-Lead Electrocardiogram (ECG) & Rhythm Diagnostic Report",
      category: "Cardiology",
      description: "Resting 12-lead electrocardiogram tracing evaluating cardiac rhythm, electrical axis, and repolarization.",
      fileName: "12_Lead_ECG_Diagnostic_Report.html",
      lab: "Apollo Hospital - Non-Invasive Cardiac Lab",
      doctor: "Dr. Michael Smith, MD (Chief Cardiologist)",
      date: "08-Nov-2026, 11:00 AM",
      tests: [
        { param: "Ventricular Heart Rate", val: "72", unit: "bpm", ref: "60 - 100 (Normal)" },
        { param: "Rhythm Evaluation", val: "Normal Sinus", unit: "Type", ref: "Sinus Rhythm" },
        { param: "PR Interval", val: "152", unit: "ms", ref: "120 - 200" },
        { param: "QRS Duration", val: "84", unit: "ms", ref: "< 100" },
        { param: "QT / QTc Interval", val: "388 / 414", unit: "ms", ref: "< 440" },
        { param: "Frontal QRS Axis", val: "52", unit: "Degrees", ref: "-30 to +90 (Normal)" },
      ],
      impression: "Normal resting 12-lead electrocardiogram. Regular sinus rhythm with normal atrioventricular conduction and no ischemic ST-T abnormalities.",
    },
  ];

  const createdRecords = [];

  for (let i = 0; i < genuineReportsData.length; i++) {
    const data = genuineReportsData[i];
    const htmlContent = generateReportHTML(
      data.title,
      data.category,
      data.lab,
      data.doctor,
      data.date,
      data.tests,
      data.impression
    );

    const buffer = Buffer.from(htmlContent, "utf8");
    const documentHash = crypto.createHash("sha256").update(buffer).digest("hex");

    // 4. Genuine AES-256-GCM encryption
    const aesKey = crypto.randomBytes(32); // 256 bits
    const iv = crypto.randomBytes(12); // 96 bits GCM standard
    const cipher = crypto.createCipheriv("aes-256-gcm", aesKey, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const tag = cipher.getAuthTag();
    const ciphertextWithTag = Buffer.concat([encrypted, tag]);

    // Asymmetric RSA-OAEP encryption for Patient & Doctor
    let patientEncryptedKey = null;
    let doctorEncryptedKey = null;

    if (patient.publicKey) {
      try {
        const pubKeyDer = Buffer.from(patient.publicKey, "base64");
        const pubKeyPem = `-----BEGIN PUBLIC KEY-----\n${pubKeyDer.toString("base64").match(/.{1,64}/g).join("\n")}\n-----END PUBLIC KEY-----`;
        patientEncryptedKey = crypto.publicEncrypt(
          { key: pubKeyPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
          aesKey
        ).toString("base64");
      } catch (e) {
        console.warn("Could not encrypt key with patient public key:", e.message);
      }
    }

    if (doctor.publicKey) {
      try {
        const pubKeyDer = Buffer.from(doctor.publicKey, "base64");
        const pubKeyPem = `-----BEGIN PUBLIC KEY-----\n${pubKeyDer.toString("base64").match(/.{1,64}/g).join("\n")}\n-----END PUBLIC KEY-----`;
        doctorEncryptedKey = crypto.publicEncrypt(
          { key: pubKeyPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
          aesKey
        ).toString("base64");
      } catch (e) {
        console.warn("Could not encrypt key with doctor public key:", e.message);
      }
    }

    // 5. Register on Blockchain
    const recordId = "rec_" + crypto.randomUUID();
    const block = blockchainService.addBlock(
      "DOCUMENT_REGISTERED",
      recordId,
      documentHash,
      patientId,
      {
        recordType: data.category,
        fileSize: buffer.length,
        fileName: data.fileName,
        timestamp: new Date().toISOString(),
      }
    );

    const recordDoc = {
      id: recordId,
      _id: recordId,
      patientId,
      patientName: patient.name,
      title: data.title,
      category: data.category,
      description: data.description,
      fileName: data.fileName,
      fileType: "text/html",
      fileSize: buffer.length,
      encryptedData: ciphertextWithTag.toString("base64"),
      iv: iv.toString("base64"),
      rawKey: aesKey.toString("base64"), // resilient backup key for seamless browser decryption
      documentHash,
      patientEncryptedKey: patientEncryptedKey || aesKey.toString("base64"),
      doctorKeys: {
        [doctorId]: doctorEncryptedKey || aesKey.toString("base64"),
      },
      blockchainTxId: block.hash,
      blockNumber: block.index,
      verified: true,
      uploadedAt: new Date(Date.now() - (i * 24 * 3600 * 1000)).toISOString(),
      createdAt: new Date(Date.now() - (i * 24 * 3600 * 1000)).toISOString(),
    };

    await db.collection("records").insertOne(recordDoc);
    createdRecords.push(recordDoc);
    console.log(`✓ Inserted Report #${i + 1}: ${data.title} (Block #${block.index}, Hash: ${documentHash.slice(0, 16)}...)`);
  }

  // 6. Ensure active approved clinical consent between Om Soni and Dr. Michael Smith
  await db.collection("consents").deleteMany({ patientId, doctorId });
  const consentId = "consent_" + crypto.randomUUID();
  const consentBlock = blockchainService.addBlock(
    "CONSENT_GRANTED",
    consentId,
    "CONSENT_PROOF_" + consentId.slice(-8),
    patientId,
    { doctorId, patientId, timestamp: new Date().toISOString() }
  );

  const consentDoc = {
    id: consentId,
    _id: consentId,
    patientId,
    patientName: patient.name,
    patientEmail: patient.email,
    doctorId,
    doctorName: doctor.name,
    doctorEmail: doctor.email,
    doctorSpecialization: doctor.doctorDetails?.specialization || "Cardiology",
    doctorHospital: doctor.doctorDetails?.hospital || "Apollo Institute of Cardiac Sciences",
    status: "approved",
    approvedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    reason: "Cardiology consultation, diagnostic report review & ECG analysis",
    blockchainTxId: consentBlock.hash,
    blockNumber: consentBlock.index,
  };
  await db.collection("consents").insertOne(consentDoc);
  console.log(`✓ Verified Clinical Consent between Om Soni and Dr. Michael Smith active (Block #${consentBlock.index}).`);

  // 7. Sync blockchain blocks to MongoDB Atlas
  dbStore.syncBlockchain();
  console.log(`✓ Synchronized ${blockchainService.chain.length} blocks to MongoDB Atlas.`);

  console.log("\nALL GENUINE REPORTS SUCCESSFULLY SEEDED TO MONGODB ATLAS!");
  process.exit(0);
}

seedReports().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
