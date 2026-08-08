import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Example: only Doctors (or Admins, who can access everything) can reach
// this. A Patient token gets a real 403 here.
router.get("/ping", requireAuth, requireRole("Doctor", "Admin"), (req, res) => {
  res.json({ message: `Hello Dr. ${req.user.email}, this route is doctor-protected.` });
});

export default router;
