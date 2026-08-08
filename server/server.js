import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import doctorRoutes from "./routes/doctor.js";
import patientRoutes from "./routes/patients.js";
import appointmentRoutes from "./routes/appointments.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("HealthLock backend is running. Try /api/health for a status check.");
});

// Simple health check -- open this URL in a browser to confirm the server
// is actually running: http://localhost:5000/api/health
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    databaseConnected: mongoose.connection.readyState === 1,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000, // fail fast instead of hanging silently
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection FAILED:", err.message);
    console.error("Check your MONGODB_URI in server/.env -- server will keep running but database calls will fail.");
  }

  app.listen(PORT, () => {
    console.log(`HealthLock backend running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

start();
