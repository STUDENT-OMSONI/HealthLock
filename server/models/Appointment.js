import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who booked it
    doctorName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Upcoming", "Cancelled", "Completed"],
      default: "Upcoming",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
