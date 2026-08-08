import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn, hasRole } from "../auth";
import { ShieldAlert } from "lucide-react";

// Wrap any route that should only be visible to signed-in users.
// If nobody is logged in, redirect them to /login instead.
//
// Optional `roles` prop restricts the route further -- e.g.
// <ProtectedRoute roles={["Admin"]}>. This is a client-side UX layer only;
// the REAL enforcement happens on the backend (server/middleware/auth.js),
// which returns a genuine 403 if someone tries to call a protected API
// directly without the right role, regardless of what this component does.
export default function ProtectedRoute({ children, roles }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRole(...roles)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <ShieldAlert size={48} className="text-red-600 mb-4" />
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">403 — Forbidden</h1>
        <p className="text-gray-500 max-w-sm">
          Your account role doesn't have permission to view this page.
        </p>
      </div>
    );
  }

  return children;
}
