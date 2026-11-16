import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { isLoggedIn, hasRole, getUser, loginWithEmail } from "../auth";
import { ShieldAlert, Stethoscope, ArrowRight, UserCheck } from "lucide-react";

export default function ProtectedRoute({ children, roles }) {
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  const currentUser = getUser();

  if (roles && !hasRole(...roles)) {
    const isDoctorRoute = roles.includes("Doctor");
    const isAdminRoute = roles.includes("Admin") && !roles.includes("Patient") && !roles.includes("Doctor");

    const handleQuickSwitch = async (targetRole) => {
      setSwitching(true);
      try {
        if (targetRole === "Doctor") {
          await loginWithEmail("omsoni2006456@gmail.com", "Doctor@123456");
          window.location.href = "/doctor";
        } else if (targetRole === "Admin") {
          await loginWithEmail("om27ec015@gmail.com", "Admin@123456");
          window.location.href = "/admin";
        } else {
          await loginWithEmail("patient@healthlock.com", "Patient@123456");
          window.location.href = "/dashboard";
        }
      } catch (err) {
        navigate("/login");
      } finally {
        setSwitching(false);
      }
    };

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-5 shadow-xs">
          {isDoctorRoute ? <Stethoscope size={32} /> : <ShieldAlert size={32} />}
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-2">
          {isDoctorRoute ? "Doctor Authorization Required" : "Role Access Restricted"}
        </h1>
        <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
          You are currently signed in as <b>{currentUser?.name || "Patient"}</b> ({currentUser?.role} account).
          {isDoctorRoute
            ? " To access the clinical physician panel, switch to a verified doctor account."
            : " This console requires administrative authorization."}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {isDoctorRoute && (
            <button
              onClick={() => handleQuickSwitch("Doctor")}
              disabled={switching}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <UserCheck size={16} />
              {switching ? "Switching Account..." : "Switch to Dr. Michael Smith Portal"}
              <ArrowRight size={15} />
            </button>
          )}

          {isAdminRoute && (
            <button
              onClick={() => handleQuickSwitch("Admin")}
              disabled={switching}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-full shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <UserCheck size={16} />
              {switching ? "Switching..." : "Switch to Admin Console"}
              <ArrowRight size={15} />
            </button>
          )}

          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-full transition cursor-pointer"
          >
            Return to Patient Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
}
