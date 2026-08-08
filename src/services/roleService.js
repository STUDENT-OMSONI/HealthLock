// Role & Permission definitions.
//
// IMPORTANT: this is a UI-level permission MATRIX EDITOR only. It does not
// and cannot actually enforce anything -- a permission only means something
// when a server checks it on every API request and rejects unauthorized
// ones. Anyone could open the browser dev tools and bypass any check based
// only on this data. This exists so the admin can design/preview the
// permission structure now, ready to send to a real backend later.
//
// TODO (Phase 2 backend): send this permission matrix to the server, store
// it against each user's role in the database, and check it in Express
// middleware on every protected route -- e.g.
//   requirePermission("patients", "delete")
// BEFORE any real enforcement exists, treat every "permission" in this app
// as a UI preference only, never a security boundary.

const KEY = "healthlock_roles";

const DEFAULT_ROLES = ["Super Admin", "Admin", "Doctor", "Patient", "Moderator", "Receptionist"];
const PERMISSIONS = ["view", "create", "edit", "delete", "export", "approve", "assign"];

function defaultMatrix() {
  const matrix = {};
  DEFAULT_ROLES.forEach((role) => {
    matrix[role] = {};
    PERMISSIONS.forEach((perm) => {
      // Sensible starting defaults -- fully editable afterward.
      matrix[role][perm] = role === "Super Admin";
    });
    if (role === "Admin") {
      matrix[role] = { view: true, create: true, edit: true, delete: true, export: true, approve: true, assign: false };
    }
    if (role === "Doctor") {
      matrix[role] = { view: true, create: true, edit: true, delete: false, export: false, approve: false, assign: false };
    }
    if (role === "Patient") {
      matrix[role] = { view: true, create: true, edit: false, delete: false, export: false, approve: false, assign: false };
    }
  });
  return matrix;
}

export function getPermissionKeys() {
  return PERMISSIONS;
}

export function getRoleNames() {
  return DEFAULT_ROLES;
}

export function getRoleMatrix() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : defaultMatrix();
  } catch {
    return defaultMatrix();
  }
}

export function setPermission(role, permission, value) {
  const matrix = getRoleMatrix();
  if (!matrix[role]) matrix[role] = {};
  matrix[role][permission] = value;
  localStorage.setItem(KEY, JSON.stringify(matrix));
  return matrix;
}

export function resetToDefaults() {
  const matrix = defaultMatrix();
  localStorage.setItem(KEY, JSON.stringify(matrix));
  return matrix;
}
