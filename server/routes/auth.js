import express from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google
// The frontend sends the raw Google ID token it got from the Google Sign-In
// button. We verify it directly with Google's servers here -- this is the
// real check that the token genuinely came from Google and wasn't forged.
router.post("/google", async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: "Missing Google credential" });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload.email_verified) {
      return res.status(401).json({ error: "Google email not verified" });
    }

    // Find or create the user in the real database.
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        role: "Patient", // default role for new sign-ups
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ error: "This account has been suspended" });
    }

    user.lastLogin = new Date();
    await user.save();

    // Issue OUR OWN token -- this is what the frontend will send on every
    // future request. It encodes the user's real role from the database.
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Google auth error:", err.message);
    res.status(401).json({ error: "Invalid Google token" });
  }
});

// GET /api/auth/me - lets the frontend re-check who's logged in using the
// token it already has, without asking Google again.
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-__v");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

export default router;
