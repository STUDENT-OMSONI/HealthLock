import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userEmail: String,
    userRole: String,
    action: { type: String, required: true }, // e.g. "QR_PATIENT_ACCESS"
    resource: String, // e.g. patient id, if applicable
    status: { type: String, enum: ["success", "failure"], required: true },
    details: String,
  },
  { timestamps: true } // createdAt = the real, server-side timestamp
);

export default mongoose.model("AuditLog", auditLogSchema);
