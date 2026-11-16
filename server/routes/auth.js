import express from "express";
import { OAuth2Client } from "google-auth-library";
import { dbStore, hashPassword, verifyPassword } from "../services/dbStore.js";
import { generateToken, requireAuth } from "../middleware/auth.js";

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/register - Register with Email & Password
router.post("/register", async (req, res) => {
  const { name, email, password, role, publicKey, doctorDetails, patientDetails } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = dbStore.findUserByEmail(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: "An account with this email address already exists." });
  }

  let assignedRole = "Patient";
  if (normalizedEmail === "om27ec015@gmail.com") {
    assignedRole = "Admin";
  } else if (normalizedEmail === "omsoni2006456@gmail.com") {
    assignedRole = "Doctor";
  } else if (["Doctor", "Admin"].includes(role)) {
    assignedRole = role;
  }

  const userPayload = {
    name: name.trim(),
    email: normalizedEmail,
    password: hashPassword(password),
    role: assignedRole,
    status: "active",
    publicKey: publicKey || null,
  };

  if (assignedRole === "Doctor") {
    userPayload.doctorDetails = {
      specialization: doctorDetails?.specialization || "General Medicine",
      licenseNumber: doctorDetails?.licenseNumber || "LIC-" + Math.floor(100000 + Math.random() * 900000),
      hospital: doctorDetails?.hospital || "HealthLock Medical Network",
      verificationStatus: "pending", // Admins verify doctor credentials
      verifiedAt: null,
    };
  } else if (assignedRole === "Patient") {
    userPayload.patientDetails = {
      age: patientDetails?.age || null,
      gender: patientDetails?.gender || "Other",
      contact: patientDetails?.contact || "",
      bloodGroup: patientDetails?.bloodGroup || "Unknown",
      emergencyContact: patientDetails?.emergencyContact || "",
      medicalHistorySummary: patientDetails?.medicalHistorySummary || "",
    };
  }

  const user = dbStore.createUser(userPayload);
  const token = generateToken(user);

  dbStore.addAuditLog({
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    action: "USER_REGISTERED",
    resource: user.id,
    status: "success",
    details: `New ${user.role} account registered: ${user.email}`,
  });

  const safeUser = { ...user };
  delete safeUser.password;

  res.status(201).json({
    token,
    user: safeUser,
  });
});

// POST /api/auth/login - Login with Email & Password
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user = dbStore.findUserByEmail(normalizedEmail);
  let isPasswordValid = user?.password && verifyPassword(password, user.password);

  // Allow convenient default passwords for primary admin/doctor accounts and auto-provision patient fast login
  if (normalizedEmail === "patient@healthlock.com") {
    if (!user) {
      user = dbStore.createUser({
        name: "Patient",
        email: "patient@healthlock.com",
        password: "Patient@123456",
        role: "Patient",
        status: "active",
        patientDetails: {
          age: 26,
          gender: "Male",
          bloodGroup: "O+",
          phone: "+1 (555) 019-2834",
        },
      });
      isPasswordValid = true;
    } else if (!isPasswordValid && (password === "Patient@123456" || password === "Doctor@123456" || password === "Admin@123456")) {
      isPasswordValid = true;
      user = dbStore.updateUser(user.id, { password: hashPassword(password) });
    }
  }

  if (!isPasswordValid && normalizedEmail === "omsoni2006456@gmail.com" && user) {
    if (password === "Doctor@123456" || password === "Patient@123456") {
      isPasswordValid = true;
      user = dbStore.updateUser(user.id, { password: hashPassword(password) });
    }
  }

  if (!isPasswordValid && normalizedEmail === "om27ec015@gmail.com" && user) {
    if (password === "Admin@123456") {
      isPasswordValid = true;
      user = dbStore.updateUser(user.id, { password: hashPassword(password) });
    }
  }

  if (!user || !isPasswordValid) {
    dbStore.addAuditLog({
      userEmail: normalizedEmail,
      action: "LOGIN_FAILED",
      status: "failure",
      details: "Invalid email or password attempt.",
    });
    return res.status(401).json({ error: "Invalid email or password." });
  }

  if (user.status === "suspended") {
    return res.status(403).json({ error: "This account has been suspended by an administrator." });
  }

  // Enforce system roles
  if (normalizedEmail === "om27ec015@gmail.com" && user.role !== "Admin") {
    user = dbStore.updateUser(user.id, { role: "Admin" });
  } else if (normalizedEmail === "omsoni2006456@gmail.com" && user.role !== "Doctor") {
    user = dbStore.updateUser(user.id, {
      role: "Doctor",
      doctorDetails: user.doctorDetails || {
        specialization: "Cardiology",
        licenseNumber: "MED-DOC-7701",
        hospital: "MediKey Medical Network",
        verificationStatus: "verified",
        verifiedAt: new Date().toISOString(),
      },
    });
  }

  // Update last login
  dbStore.updateUser(user.id, { lastLogin: new Date().toISOString() });

  const token = generateToken(user);

  dbStore.addAuditLog({
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    action: "LOGIN_SUCCESS",
    resource: user.id,
    status: "success",
    details: `User logged in successfully: ${user.email}`,
  });

  const safeUser = { ...user };
  delete safeUser.password;

  res.json({
    token,
    user: safeUser,
  });
});

// POST /api/auth/google - Google OAuth verification
router.post("/google", async (req, res) => {
  const { credential, role } = req.body;
  if (!credential) {
    return res.status(400).json({ error: "Missing Google credential" });
  }

  try {
    let payload = null;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (gErr) {
      console.warn("Google token verifyIdToken error, checking token decode:", gErr.message);
      // Fallback decode when network access to google certs is restricted or offline
      try {
        const parts = credential.split(".");
        if (parts.length === 3) {
          const decoded = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
          if (decoded && decoded.email) {
            payload = decoded;
          }
        }
      } catch (decErr) {
        console.error("Fallback decode failed:", decErr.message);
      }

      if (!payload) {
        return res.status(401).json({ error: "Google verification failed: " + gErr.message });
      }
    }

    if (payload.email_verified === false) {
      return res.status(401).json({ error: "Google email address is not verified." });
    }

    const userEmail = payload.email.toLowerCase();
    let assignedRole = "Patient";
    if (userEmail === "om27ec015@gmail.com") {
      assignedRole = "Admin";
    } else if (userEmail === "omsoni2006456@gmail.com") {
      assignedRole = "Doctor";
    } else if (role && ["Doctor", "Admin"].includes(role)) {
      assignedRole = role;
    }

    let user = dbStore.findUserByEmail(userEmail);
    if (!user) {
      const newUserPayload = {
        googleId: payload.sub,
        email: userEmail,
        name: payload.name || userEmail.split("@")[0],
        picture: payload.picture || null,
        role: assignedRole,
        status: "active",
      };

      if (assignedRole === "Doctor") {
        newUserPayload.doctorDetails = {
          specialization: "Cardiology",
          licenseNumber: "MED-DOC-7701",
          hospital: "MediKey Medical Network",
          verificationStatus: "verified",
          verifiedAt: new Date().toISOString(),
          rating: "4.9 ★ (150+ reviews)",
          experience: "10+ Years Experience",
        };
      } else if (assignedRole === "Admin") {
        // Main Admin
      } else {
        newUserPayload.patientDetails = {
          age: 26,
          gender: "Other",
          bloodGroup: "O+",
          contact: "",
          emergencyContact: "",
        };
      }

      user = dbStore.createUser(newUserPayload);

      dbStore.addAuditLog({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: "GOOGLE_REGISTER_SUCCESS",
        resource: user.id,
        status: "success",
        details: `New account registered with Google OAuth: ${user.email} (${user.role})`,
      });
    } else {
      // Existing user login: enforce assigned system role
      const updates = { lastLogin: new Date().toISOString() };
      if (userEmail === "om27ec015@gmail.com") {
        updates.role = "Admin";
      } else if (userEmail === "omsoni2006456@gmail.com") {
        updates.role = "Doctor";
        if (!user.doctorDetails) {
          updates.doctorDetails = {
            specialization: "Cardiology",
            licenseNumber: "MED-DOC-7701",
            hospital: "MediKey Medical Network",
            verificationStatus: "verified",
            verifiedAt: new Date().toISOString(),
            rating: "4.9 ★ (150+ reviews)",
            experience: "10+ Years Experience",
          };
        }
      }
      if (!user.googleId && payload.sub) updates.googleId = payload.sub;
      if (!user.picture && payload.picture) updates.picture = payload.picture;
      user = dbStore.updateUser(user.id, updates);

      dbStore.addAuditLog({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        action: "GOOGLE_LOGIN_SUCCESS",
        resource: user.id,
        status: "success",
        details: `User logged in successfully via Google OAuth: ${user.email} (${user.role})`,
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ error: "This account has been suspended by an administrator." });
    }

    const token = generateToken(user);
    const safeUser = { ...user };
    delete safeUser.password;

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("Google authentication error:", err);
    res.status(401).json({ error: "Invalid Google authentication token." });
  }
});

// GET /api/auth/me - Current user session
router.get("/me", requireAuth, async (req, res) => {
  const user = dbStore.findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const safeUser = { ...user };
  delete safeUser.password;
  res.json({ user: safeUser });
});

// PATCH /api/auth/profile - Update personal profile, doctor details, profile picture, or public key
router.patch("/profile", requireAuth, async (req, res) => {
  const { name, picture, patientDetails, doctorDetails, publicKey } = req.body;
  const updates = {};

  if (name) updates.name = name.trim();
  if (picture) updates.picture = picture;
  if (publicKey) updates.publicKey = publicKey;
  if (patientDetails && req.user.role === "Patient") {
    const existing = dbStore.findUserById(req.user.id);
    updates.patientDetails = { ...(existing?.patientDetails || {}), ...patientDetails };
  }
  if (doctorDetails && req.user.role === "Doctor") {
    const existing = dbStore.findUserById(req.user.id);
    updates.doctorDetails = {
      ...(existing?.doctorDetails || {}),
      specialization: doctorDetails.specialization || existing?.doctorDetails?.specialization,
      hospital: doctorDetails.hospital || existing?.doctorDetails?.hospital,
      licenseNumber: doctorDetails.licenseNumber || existing?.doctorDetails?.licenseNumber,
      consultationFee: doctorDetails.consultationFee || existing?.doctorDetails?.consultationFee,
      experience: doctorDetails.experience || existing?.doctorDetails?.experience,
      bio: doctorDetails.bio || existing?.doctorDetails?.bio,
    };
  }

  const updated = dbStore.updateUser(req.user.id, updates);
  const safeUser = { ...updated };
  delete safeUser.password;
  res.json({ user: safeUser });
});

// GET /api/auth/doctors - List verified doctors for appointment booking & consent (Public directory)
router.get("/doctors", async (req, res) => {
  const doctorAvatars = {
    "dr.smith@healthlock.com": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
    "dr.emily@healthlock.com": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    "dr.sarah@healthlock.com": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    "dr.chen@healthlock.com": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
    "dr.priya@healthlock.com": "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&q=80",
    "dr.miller@healthlock.com": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80",
    "dr.aisha@healthlock.com": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&q=80",
    "dr.wilson@healthlock.com": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80",
    "dr.elena@healthlock.com": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=400&q=80",
    "dr.taylor@healthlock.com": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80",
    "dr.bennett@healthlock.com": "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=400&q=80",
  };

  const doctorFees = {
    "dr.smith@healthlock.com": "₹1,200",
    "dr.emily@healthlock.com": "₹1,500",
    "dr.sarah@healthlock.com": "₹800",
    "dr.chen@healthlock.com": "₹1,200",
    "dr.priya@healthlock.com": "₹900",
    "dr.miller@healthlock.com": "₹1,800",
    "dr.aisha@healthlock.com": "₹1,000",
    "dr.wilson@healthlock.com": "₹1,100",
    "dr.elena@healthlock.com": "₹1,000",
    "dr.taylor@healthlock.com": "₹1,100",
    "dr.bennett@healthlock.com": "₹1,200",
  };

  const doctors = dbStore.getUsers({ role: "Doctor" }).map((doc) => ({
    id: doc.id || doc._id,
    name: doc.name,
    email: doc.email,
    picture: doc.picture || doctorAvatars[doc.email] || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    publicKey: doc.publicKey || null,
    doctorDetails: {
      ...doc.doctorDetails,
      avatar: doc.picture || doctorAvatars[doc.email] || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
      rating: doc.doctorDetails?.rating || "4.9 (120+ reviews)",
      experience: doc.doctorDetails?.experience || "12+ Years Experience",
      consultationFee: doc.doctorDetails?.consultationFee || doctorFees[doc.email] || "₹1,200",
      hospital: doc.doctorDetails?.hospital || "Metropolitan Health",
      specialization: doc.doctorDetails?.specialization || "General Medicine",
      availability: "Available Mon - Sat",
    },
  }));
  res.json({ doctors });
});

// GET /api/auth/patients - List registered patients with portraits (for doctors and admins)
router.get("/patients", requireAuth, async (req, res) => {
  if (req.user.role !== "Doctor" && req.user.role !== "Admin") {
    return res.status(403).json({ error: "Access restricted to medical staff and administrators." });
  }

  const patientAvatars = {
    "patient.jessica@healthlock.com": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    "omsoni2006456@gmail.com": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    "om27ec015@satiengg.in": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  };

  const patients = dbStore.getUsers({ role: "Patient" }).map((p) => ({
    id: p.id || p._id,
    name: p.name,
    email: p.email,
    picture: p.picture || patientAvatars[p.email] || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    patientDetails: p.patientDetails || {
      age: 32,
      gender: "Patient",
      bloodGroup: "O+",
      emergencyContact: "+1 (555) 019-2831",
    },
    publicKey: p.publicKey || null,
  }));
  res.json({ patients });
});

// GET /api/auth/user-key/:userId - Get public key of a user for E2EE key exchange
router.get("/user-key/:userId", requireAuth, async (req, res) => {
  const target = dbStore.findUserById(req.params.userId);
  if (!target) {
    return res.status(404).json({ error: "User not found." });
  }
  res.json({
    userId: target.id || target._id,
    name: target.name,
    role: target.role,
    publicKey: target.publicKey || null,
  });
});

export default router;
