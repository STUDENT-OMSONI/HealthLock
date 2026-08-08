import jwt from "jsonwebtoken";

// This is the REAL enforcement point. Every protected route runs this
// first. If the token is missing, invalid, or expired, the request is
// rejected here -- before any route logic runs, and before any data is
// touched. This cannot be bypassed by editing frontend code, because it
// runs on the server, not in the browser.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Role guard -- use AFTER requireAuth. Genuinely returns 403 Forbidden if
// the authenticated user's role isn't in the allowed list.
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden -- insufficient role" });
    }
    next();
  };
}
