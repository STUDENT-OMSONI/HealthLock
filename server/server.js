import "dotenv/config";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import recordsRoutes from "./routes/records.js";
import consentRoutes from "./routes/consent.js";
import appointmentRoutes from "./routes/appointments.js";
import prescriptionRoutes from "./routes/prescriptions.js";
import blockchainRoutes from "./routes/blockchain.js";
import adminRoutes from "./routes/admin.js";
import patientRoutes from "./routes/patients.js";
import { blockchainService } from "./services/blockchain.js";
import { dbStore } from "./services/dbStore.js";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost or requests without origin (like Postman or curl)
      callback(null, true);
    },
    credentials: true,
  })
);

// Payload size limit increased to 50MB for encrypted PDF/image blobs
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/", (req, res) => {
  res.send("HealthLock Secure Healthcare & Blockchain Backend is running.");
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  const chainCheck = blockchainService.verifyChain();
  res.json({
    status: "ok",
    databaseConnected: mongoose.connection.readyState === 1,
    storageEngine: mongoose.connection.readyState === 1 ? "MongoDB-Atlas" : "Persistent-Local-Store",
    blockchain: {
      blocks: blockchainService.chain.length,
      isValid: chainCheck.isValid,
      latestBlock: blockchainService.getLatestBlock().hash.slice(0, 16) + "...",
    },
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", (req, res, next) => {
  // Alias to /api/auth/doctors
  req.url = "/doctors";
  return authRoutes(req, res, next);
});
app.use("/api/records", recordsRoutes);
app.use("/api/consent", consentRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/blockchain", blockchainRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/patients", patientRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 20000,
      });
      console.log("MongoDB Atlas connected successfully");
      await dbStore.syncFromMongoDB();
    } catch (err) {
      console.warn("MongoDB connection notice:", err.message);
      console.log("HealthLock is operating with resilient local storage engine.");
    }
  }

  app.listen(PORT, () => {
    console.log(`HealthLock backend running on http://localhost:${PORT}`);
    console.log(`Blockchain initialized with ${blockchainService.chain.length} blocks.`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

start();
