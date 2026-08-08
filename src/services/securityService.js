import { request } from "./apiClient";
import { getAuditLog } from "../auditStore";
import { isLoggedIn } from "../auth";

// Some security data IS genuinely available client-side (we use it below).
// Some genuinely is NOT possible without a backend:
//   - Real IP addresses: browsers deliberately don't expose the client's
//     public IP to JavaScript for privacy/security reasons. A real backend
//     would read this from the incoming HTTP request headers.
//   - True "blocked user" enforcement: blocking only means something if a
//     server refuses to authenticate that user -- client-side "blocking"
//     can always be bypassed by clearing localStorage.
//   - Failed login attempts: this app only supports Google Sign-In, which
//     doesn't have a "wrong password" failure mode the way a traditional
//     login does, so this genuinely stays at 0 rather than being faked.
//
// TODO (Phase 2 backend): implement `/api/security/overview` that reads
// real IP addresses (from request headers), real failed-login counts (from
// auth attempts logged server-side), and enforces real session/user blocks.

function mockSecurityOverview() {
  return {
    failedLogins: 0, // genuinely accurate -- Google OAuth has no local failure mode to count
    activeSessions: isLoggedIn() ? 1 : 0, // genuinely accurate for this browser
    blockedUsers: 0, // no real blocking exists without a backend yet
    ipAddressAvailable: false, // browsers never expose this to client JS
    suspiciousActivityEvents: getAuditLog().filter((e) =>
      e.action.toLowerCase().includes("deleted")
    ).length, // a real heuristic from real audit data, not fabricated
    simulated: true,
  };
}

export async function getSecurityOverview() {
  return request("/security/overview", { mockResolver: mockSecurityOverview });
}
