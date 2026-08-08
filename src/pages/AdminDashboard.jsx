import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, CalendarDays, ClipboardList, Download, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { getPatients } from "../patientStore";
import { getAppointments } from "../appointmentStore";
import { getAuditLog } from "../auditStore";
import { getDoctors } from "../doctorStore";

function toCsv(rows, headers) {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  });
  return lines.join("\n");
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function StatCard({ icon: Icon, label, value, to }) {
  const content = (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-900">
      <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
        <Icon size={20} />
      </span>
      <div>
        <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

export default function AdminDashboard() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [log, setLog] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setPatients(await getPatients());
      } catch {
        setPatients([]);
      }
      try {
        setAppointments(await getAppointments());
      } catch {
        setAppointments([]);
      }
      setDoctors(getDoctors());
      setLog(getAuditLog());
    })();
  }, []);

  const todayStr = new Date().toDateString();

  const newPatientsToday = patients.filter((p) => new Date(p.createdAt).toDateString() === todayStr).length;
  const todaysAppointments = appointments.filter((a) => new Date(a.date).toDateString() === todayStr).length;
  const cancelledAppointments = appointments.filter((a) => a.status === "Cancelled").length;
  const pendingDoctors = doctors.filter((d) => d.status === "Pending").length;

  // Real chart: patients registered per day, over the last 14 days actually
  // present in the data (no fabricated numbers).
  const chartData = useMemo(() => {
    const counts = {};
    patients.forEach((p) => {
      const day = new Date(p.createdAt).toLocaleDateString();
      counts[day] = (counts[day] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([day, count]) => ({ day, count }))
      .slice(-14);
  }, [patients]);

  const handleExportPatients = () => {
    const csv = toCsv(patients, ["id", "name", "age", "gender", "contact", "bloodGroup", "diagnosis", "createdAt"]);
    downloadCsv("patients_report.csv", csv);
  };

  const handleExportAppointments = () => {
    const csv = toCsv(appointments, ["id", "doctorName", "date", "time", "reason", "status"]);
    downloadCsv("appointments_report.csv", csv);
  };

  const handleExportAuditLog = () => {
    const csv = toCsv(log, ["id", "action", "details", "time", "browser"]);
    downloadCsv("audit_log.csv", csv);
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
          Admin Dashboard
        </h1>

        {/* Real stat cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Users} label="Total Patients" value={patients.length} to="/patients" />
          <StatCard icon={Users} label="New Today" value={newPatientsToday} />
          <StatCard icon={CalendarDays} label="Total Appointments" value={appointments.length} to="/appointments" />
          <StatCard icon={CalendarDays} label="Today's Appointments" value={todaysAppointments} />
          <StatCard icon={ClipboardList} label="Cancelled Appointments" value={cancelledAppointments} />
          <StatCard icon={ShieldAlert} label="Doctors Pending Verification" value={pendingDoctors} to="/admin/doctors" />
        </div>

        {/* Real chart from real data */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 mb-10">
          <p className="font-semibold text-gray-900 dark:text-white mb-4">Patients Registered (by day)</p>
          {chartData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No patients registered yet.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Export reports */}
        <div className="flex flex-wrap gap-3 mb-10">
          <button
            onClick={handleExportPatients}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-semibold hover:bg-black dark:hover:bg-gray-200 transition-colors"
          >
            <Download size={16} /> Export Patients (CSV)
          </button>
          <button
            onClick={handleExportAppointments}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-semibold hover:bg-black dark:hover:bg-gray-200 transition-colors"
          >
            <Download size={16} /> Export Appointments (CSV)
          </button>
          <button
            onClick={handleExportAuditLog}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-semibold hover:bg-black dark:hover:bg-gray-200 transition-colors"
          >
            <Download size={16} /> Export Audit Log (CSV)
          </button>
        </div>

        {/* Quick links to other admin sections */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <Link to="/admin/system" className="text-center px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors">
            System Monitoring
          </Link>
          <Link to="/admin/security" className="text-center px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors">
            Security Center
          </Link>
          <Link to="/admin/storage" className="text-center px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors">
            Storage Management
          </Link>
          <Link to="/admin/roles" className="text-center px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors">
            Roles & Permissions
          </Link>
        </div>

        {/* Real audit log */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
          <p className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity (Audit Log)</p>
          {log.length === 0 ? (
            <p className="text-sm text-gray-400">No activity recorded yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
              {log.slice(0, 50).map((entry) => (
                <li key={entry.id} className="py-2.5 flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">{entry.action}</span>
                    {entry.details && <span className="text-gray-500 dark:text-gray-400"> — {entry.details}</span>}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">{new Date(entry.time).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
