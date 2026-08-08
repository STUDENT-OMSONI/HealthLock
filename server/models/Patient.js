import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    size: Number,
    dataUrl: String, // TODO (Phase 2b): move to Cloudinary/Firebase, store URL instead of base64
    description: String,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const patientSchema = new mongoose.Schema(
  {
    qrToken: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    contact: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    diagnosis: { type: String, required: true },
    medicalHistory: { type: String, default: "" },
    description: { type: String, default: "" },
    files: [fileSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // which staff account created this record
  },
  { timestamps: true } // createdAt / updatedAt
);

export default mongoose.model("Patient", patientSchema);
