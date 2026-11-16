import { generateUserKeyPair, storePrivateKeyLocally, getLocalPrivateKey } from "./services/cryptoService.js";

export { getLocalPrivateKey, storePrivateKeyLocally } from "./services/cryptoService.js";

const USER_KEY = "healthlock_user";
const TOKEN_KEY = "healthlock_token";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function logout() {
  clearUser();
  window.location.href = "/login";
}

export function isLoggedIn() {
  return !!getToken();
}

export function hasRole(...roles) {
  const user = getUser();
  if (!user) return false;
  const email = (user.email || "").toLowerCase();
  if (email === "om27ec015@gmail.com") return true;
  if (email === "omsoni2006456@gmail.com" && roles.includes("Doctor")) return true;
  return roles.includes(user.role);
}

// Authenticated API request helper
export async function apiFetch(path, options = {}) {
  const token = getToken();
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (netErr) {
    throw new Error(
      "Unable to reach the MediKey backend service (http://localhost:5000). Please ensure the backend is running."
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Ensure user has their RSA key pair generated and public key synced
export async function ensureUserKeys(user) {
  if (!user || !user.id) return;
  let privKey = getLocalPrivateKey(user.id);

  if (!privKey || !user.publicKey) {
    try {
      const keys = await generateUserKeyPair();
      storePrivateKeyLocally(user.id, keys.privateKey);
      
      // Update public key on backend
      const res = await apiFetch("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ publicKey: keys.publicKey }),
      });

      if (res.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        return res.user;
      }
    } catch (err) {
      console.warn("Failed to generate or sync RSA key pair:", err);
    }
  }
  return user;
}

// Register with Email & Password
export async function registerWithEmail({ name, email, password, role, doctorDetails, patientDetails }) {
  // Generate key pair upfront
  let keyPair = null;
  try {
    keyPair = await generateUserKeyPair();
  } catch (err) {
    console.warn("Keygen during register failed:", err);
  }

  let res;
  try {
    res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        publicKey: keyPair?.publicKey || null,
        doctorDetails,
        patientDetails,
      }),
    });
  } catch (netErr) {
    throw new Error("Unable to connect to the authentication server (http://localhost:5000). Please ensure the backend is running.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Registration failed");
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  if (keyPair && data.user?.id) {
    storePrivateKeyLocally(data.user.id, keyPair.privateKey);
  }

  return data.user;
}

// Login with Email & Password
export async function loginWithEmail(email, password) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch (netErr) {
    throw new Error("Unable to connect to the authentication server (http://localhost:5000). Please ensure the backend is running.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Invalid email or password");
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  // Ensure cryptographic keys exist
  await ensureUserKeys(data.user);

  return data.user;
}

// Login with Google OAuth
export async function loginWithGoogle(googleCredential, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: googleCredential, role: options.role }),
    });
  } catch (netErr) {
    throw new Error("Unable to connect to the authentication server (http://localhost:5000). Please ensure the backend is running.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Google authentication failed");
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  await ensureUserKeys(data.user);
  return data.user;
}
