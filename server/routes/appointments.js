import express from "express";
import { dbStore } from "../services/dbStore.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth);

// GET /api/appointments
router.get("/", async (req, res) => {
  const user = req.user;

  const enrich = (appt) => {
    const patient = dbStore.findUserById(appt.patientId) || {};
    const doctor = dbStore.findUserById(appt.doctorId) || {};
    return {
      ...appt,
      patientName: patient.name || appt.patientName,
      patientEmail: patient.email || appt.patientEmail,
      patientPicture: patient.picture || appt.patientPicture || null,
      patientDetails: patient.patientDetails || {},
      doctorName: doctor.name || appt.doctorName,
      doctorEmail: doctor.email || appt.doctorEmail,
      doctorPicture: doctor.picture || appt.doctorPicture || null,
      doctorSpecialization: doctor.doctorDetails?.specialization || appt.doctorSpecialization,
      doctorHospital: doctor.doctorDetails?.hospital || appt.doctorHospital || "Metropolitan Health",
      doctorFee: doctor.doctorDetails?.consultationFee || appt.doctorFee || "₹1,200",
    };
  };

  if (user.role === "Patient") {
    const list = dbStore.getAppointments({ patientId: user.id }).map(enrich);
    return res.json({ appointments: list });
  }

  if (user.role === "Doctor") {
    const list = dbStore.getAppointments({ doctorId: user.id }).map(enrich);
    return res.json({ appointments: list });
  }

  if (user.role === "Admin") {
    const list = dbStore.getAppointments().map(enrich);
    return res.json({ appointments: list });
  }

  res.status(403).json({ error: "Unauthorized" });
});

// POST /api/appointments - Book appointment
router.post("/", async (req, res) => {
  const { doctorId, date, time, reason } = req.body;

  if (!doctorId || !date || !time || !reason) {
    return res.status(400).json({ error: "Doctor, date, time and reason are required." });
  }

  const doctor = dbStore.findUserById(doctorId);
  if (!doctor || doctor.role !== "Doctor") {
    return res.status(404).json({ error: "Selected doctor was not found." });
  }

  const appointment = dbStore.createAppointment({
    patientId: req.user.id,
    patientName: req.user.name,
    patientEmail: req.user.email,
    patientPicture: req.user.picture || null,
    doctorId: doctor.id || doctor._id,
    doctorName: doctor.name,
    doctorPicture: doctor.picture || null,
    doctorSpecialization: doctor.doctorDetails?.specialization || "General Medicine",
    doctorHospital: doctor.doctorDetails?.hospital || "Metropolitan General Hospital",
    doctorFee: doctor.doctorDetails?.consultationFee || "₹1,200",
    date,
    time,
    reason: reason.trim(),
    status: "Upcoming",
    consultationNotes: "",
  });

  dbStore.addAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: "APPOINTMENT_BOOKED",
    resource: appointment.id,
    status: "success",
    details: `Patient booked appointment with ${doctor.name} on ${date} at ${time}.`,
  });

  res.status(201).json({ appointment });
});

// PATCH /api/appointments/:id - Update status or notes
router.patch("/:id", async (req, res) => {
  const appt = dbStore.findAppointmentById(req.params.id);
  if (!appt) return res.status(404).json({ error: "Appointment not found." });

  const isOwner = appt.patientId === req.user.id;
  const isDoctor = appt.doctorId === req.user.id;
  const isAdmin = req.user.role === "Admin";

  if (!isOwner && !isDoctor && !isAdmin) {
    return res.status(403).json({ error: "Forbidden: Not your appointment." });
  }

  const allowedUpdates = {};
  if (req.body.status) allowedUpdates.status = req.body.status;
  if (req.body.consultationNotes && (isDoctor || isAdmin)) {
    allowedUpdates.consultationNotes = req.body.consultationNotes;
  }
  if (req.body.date && (isDoctor || isAdmin)) allowedUpdates.date = req.body.date;
  if (req.body.time && (isDoctor || isAdmin)) allowedUpdates.time = req.body.time;

  const updated = dbStore.updateAppointment(req.params.id, allowedUpdates);

  dbStore.addAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: "APPOINTMENT_UPDATED",
    resource: appt.id,
    status: "success",
    details: `Appointment ${appt.id} updated (status: ${updated.status}).`,
  });

  res.json({ appointment: updated });
});

// DELETE /api/appointments/:id - Cancel appointment
router.delete("/:id", async (req, res) => {
  const appt = dbStore.findAppointmentById(req.params.id);
  if (!appt) return res.status(404).json({ error: "Appointment not found." });

  const isOwner = appt.patientId === req.user.id;
  const isDoctor = appt.doctorId === req.user.id;
  const isAdmin = req.user.role === "Admin";

  if (!isOwner && !isDoctor && !isAdmin) {
    return res.status(403).json({ error: "Forbidden: Not your appointment." });
  }

  dbStore.deleteAppointment(req.params.id);

  dbStore.addAuditLog({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: "APPOINTMENT_CANCELLED",
    resource: appt.id,
    status: "success",
    details: `Appointment with ${appt.doctorName} on ${appt.date} cancelled.`,
  });

  res.json({ success: true, message: "Appointment cancelled." });
});

export default router;
