import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    picture: { type: String },
    role: {
      type: String,
      enum: ["Patient", "Doctor", "Admin"],
      default: "Patient", // new sign-ups start as Patient; an Admin promotes them later
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    lastLogin: { type: Date },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

export default mongoose.model("User", userSchema);
