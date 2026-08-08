import express from "express";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Every route below requires a valid token (requireAuth) AND the Admin role
// (requireRole("Admin")). A Patient or Doctor token gets a real 403 here --
// try it: call this with a Patient's token and you'll get rejected before
// any user data is touched.

// GET /api/admin/users - list every user (Admin only)
router.get("/users", requireAuth, requireRole("Admin"), async (req, res) => {
  const users = await User.find().select("-__v").sort({ createdAt: -1 });
  res.json({ users });
});

// PATCH /api/admin/users/:id/role - change a user's role (Admin only)
router.patch("/users/:id/role", requireAuth, requireRole("Admin"), async (req, res) => {
  const { role } = req.body;
  if (!["Patient", "Doctor", "Admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

// PATCH /api/admin/users/:id/status - suspend/activate a user (Admin only)
router.patch("/users/:id/status", requireAuth, requireRole("Admin"), async (req, res) => {
  const { status } = req.body;
  if (!["active", "suspended"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

// DELETE /api/admin/users/:id - delete a user (Admin only)
router.delete("/users/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ success: true });
});

// GET /api/admin/stats - real counts from the real database (Admin only)
router.get("/stats", requireAuth, requireRole("Admin"), async (req, res) => {
  const [totalUsers, totalPatients, totalDoctors, totalAdmins] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "Patient" }),
    User.countDocuments({ role: "Doctor" }),
    User.countDocuments({ role: "Admin" }),
  ]);
  res.json({ totalUsers, totalPatients, totalDoctors, totalAdmins });
});

export default router;
