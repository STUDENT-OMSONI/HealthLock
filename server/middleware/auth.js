import jwt from "jsonwebtoken";
import { dbStore } from "../services/dbStore.js";

const JWT_SECRET = process.env.JWT_SECRET || "healthlock-super-secure-jwt-secret-key-2026";

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Access denied. Authentication token required." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = dbStore.findUserById(payload.id);

    if (!user) {
      return res.status(401).json({ error: "User session is no longer valid." });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ error: "Your account has been suspended by an administrator." });
    }

    req.user = {
      id: user.id || user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      publicKey: user.publicKey,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session token." });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted. Required role: [${allowedRoles.join(", ")}], but account has role: [${req.user.role}].`,
      });
    }
    next();
  };
}
