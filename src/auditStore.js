const KEY = "healthlock_audit_log";
const MAX_ENTRIES = 500; // keep it from growing forever

function uid() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  // Trim to the most recent MAX_ENTRIES so localStorage doesn't fill up
  const trimmed = list.slice(-MAX_ENTRIES);
  localStorage.setItem(KEY, JSON.stringify(trimmed));
}

// Records a real action with real, honestly-labeled context.
// NOTE: this can only capture what the browser actually knows -- there is
// no real IP address or server session without a backend, so we log the
// browser's user agent string instead of pretending to have IP/device info
// we don't actually have.
export function logAction(action, details = "") {
  const list = readAll();
  list.push({
    id: uid(),
    action,
    details,
    time: new Date().toISOString(),
    browser: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
  });
  writeAll(list);
}

export function getAuditLog() {
  return readAll().sort((a, b) => new Date(b.time) - new Date(a.time));
}

export function clearAuditLog() {
  writeAll([]);
}
