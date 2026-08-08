import express from "express";
import Appointment from "../models/Appointment.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth); // every route below requires a valid session

// GET /api/appointments
// Patient role: only sees their own appointments.
// Doctor/Admin: sees everyone's (needed to manage the schedule).
router.get("/", async (req, res) => {
  const filter = req.user.role === "Patient" ? { userId: req.user.id } : {};
  const appointments = await Appointment.find(filter).sort({ date: 1, time: 1 });
  res.json({ appointments });
});

// POST /api/appointments - book one for yourself
router.post("/", async (req, res) => {
  try {
    const appt = await Appointment.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ appointment: appt });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Helper: only the owner OR a Doctor/Admin can modify a given appointment.
async function canModify(req, res, next) {
  const appt = await Appointment.findById(req.params.id);
  if (!appt) return res.status(404).json({ error: "Appointment not found" });
  const isOwner = appt.userId.toString() === req.user.id;
  const isStaff = ["Doctor", "Admin"].includes(req.user.role);
  if (!isOwner && !isStaff) {
    return res.status(403).json({ error: "Forbidden -- not your appointment" });
  }
  req.appointment = appt;
  next();
}

// PATCH /api/appointments/:id - update status (cancel, etc.)
router.patch("/:id", canModify, async (req, res) => {
  Object.assign(req.appointment, req.body);
  await req.appointment.save();
  res.json({ appointment: req.appointment });
});

// DELETE /api/appointments/:id
router.delete("/:id", canModify, async (req, res) => {
  await req.appointment.deleteOne();
  res.json({ success: true });
});

export default router;
