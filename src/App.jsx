import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";
import { getUser } from "./auth";

// Role-based root dashboard redirector
function DashboardDispatcher() {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  const email = (user.email || "").toLowerCase();
  if (user.role === "Admin" || email === "om27ec015@gmail.com") return <Navigate to="/admin" replace />;
  if (user.role === "Doctor" || email === "omsoni2006456@gmail.com") return <Navigate to="/doctor" replace />;
  return <Dashboard />;
}

function AppointmentsDispatcher() {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  const email = (user.email || "").toLowerCase();
  if (user.role === "Doctor" || email === "omsoni2006456@gmail.com") return <Navigate to="/doctor?tab=appointments" replace />;
  if (user.role === "Admin" || email === "om27ec015@gmail.com") return <Navigate to="/admin?tab=appointments" replace />;
  return <Navigate to="/dashboard?tab=appointments" replace />;
}

function RecordsDispatcher() {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  const email = (user.email || "").toLowerCase();
  if (user.role === "Doctor" || email === "omsoni2006456@gmail.com") return <Navigate to="/doctor?tab=records" replace />;
  if (user.role === "Admin" || email === "om27ec015@gmail.com") return <Navigate to="/admin?tab=records" replace />;
  return <Navigate to="/dashboard?tab=records" replace />;
}

function PrescriptionsDispatcher() {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  const email = (user.email || "").toLowerCase();
  if (user.role === "Doctor" || email === "omsoni2006456@gmail.com") return <Navigate to="/doctor?tab=prescriptions" replace />;
  if (user.role === "Admin" || email === "om27ec015@gmail.com") return <Navigate to="/admin?tab=prescriptions" replace />;
  return <Navigate to="/dashboard?tab=prescriptions" replace />;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("MediKey Error Boundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Application Notice</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              An unexpected view state occurred. Click below to return to the clinical home portal.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = "/";
              }}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-md transition cursor-pointer"
            >
              Return to MediKey Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          <Navbar />
          <div className="flex-1">
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />

            {/* Smart Dashboard Dispatcher */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardDispatcher />
                </ProtectedRoute>
              }
            />

            {/* Dedicated Patient Dashboard */}
            <Route
              path="/patient"
              element={
                <ProtectedRoute roles={["Patient"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Dedicated Doctor Dashboard */}
            <Route
              path="/doctor"
              element={
                <ProtectedRoute roles={["Doctor"]}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Dedicated Admin Dashboard */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["Admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Smart shortcuts that map to each role's panel */}
            <Route path="/records" element={<RecordsDispatcher />} />
            <Route path="/appointments" element={<AppointmentsDispatcher />} />
            <Route path="/consent" element={<Navigate to="/dashboard?tab=consent" replace />} />
            <Route path="/prescriptions" element={<PrescriptionsDispatcher />} />
            <Route path="/blockchain" element={<Navigate to="/dashboard?tab=blockchain" replace />} />
            <Route path="/patients" element={<Navigate to="/doctor?tab=patients" replace />} />
            <Route path="/doctor/records" element={<Navigate to="/doctor?tab=records" replace />} />
            <Route path="/doctor/appointments" element={<Navigate to="/doctor?tab=appointments" replace />} />
            <Route path="/doctor/prescriptions" element={<Navigate to="/doctor?tab=prescriptions" replace />} />
            <Route path="/doctor/requests" element={<Navigate to="/doctor?tab=requests" replace />} />
            <Route path="/doctor/profile" element={<Navigate to="/doctor?tab=profile" replace />} />
            <Route path="/admin/doctors" element={<Navigate to="/admin?tab=doctors" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  </ErrorBoundary>
  );
}

export default App;
