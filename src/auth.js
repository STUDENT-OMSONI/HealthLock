// Real backend auth helper.
//
// The frontend sends the Google credential to our own backend, which
// verifies it with Google, looks up (or creates) the user in the real
// database, and returns OUR OWN session token + the user's REAL role from
// the database. That token is then attached to every future API call so
// the backend can enforce permissions for real.

const USER_KEY = "healthlock_user";
const TOKEN_KEY = "healthlock_token";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Sends the raw Google ID token to the backend for real verification.
// Throws if the backend rejects it (e.g. suspended account, invalid token).
export async function loginWithGoogle(googleCredential) {
  const res = await fetch(`${API_BASE}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential: googleCredential }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

export function hasRole(...roles) {
  const user = getUser();
  return !!user && roles.includes(user.role);
}

// Helper for calling protected backend routes -- automatically attaches
// the real session token so the server can enforce role checks.
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status; // reliable status check, not fragile string matching
    throw err;
  }
  return data;
}
