// Central API client.
//
// Every service file in src/services/ goes through this module instead of
// talking to localStorage directly. Today, `request()` just simulates
// network latency and resolves with mock/local data. When the real
// Node/Express backend exists, this is the ONLY file that needs to change --
// swap the body of `request()` for a real fetch() call, and every service
// file above it keeps working unmodified.
//
// TODO (Phase 2 backend): replace the body below with:
//   const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: { Authorization: `Bearer ${token}` } });
//   if (!res.ok) throw new ApiError(res.status, await res.text());
//   return res.json();

const BASE_URL = import.meta.env.VITE_API_BASE_URL || null; // null = no real backend yet

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Simulates network latency so loading states are visible and realistic,
// without needing a real server. Swap this out once BASE_URL points to a
// real API.
export function request(path, { method = "GET", body, mockResolver } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (!BASE_URL) {
          // No backend configured yet -- resolve using the local mock
          // resolver passed in by the calling service function.
          resolve(mockResolver ? mockResolver() : null);
          return;
        }
        // TODO (Phase 2 backend): real fetch() call goes here.
        reject(new ApiError(501, `Real backend not yet connected for ${method} ${path}`));
      } catch (err) {
        reject(err);
      }
    }, 150 + Math.random() * 250); // realistic small latency
  });
}
