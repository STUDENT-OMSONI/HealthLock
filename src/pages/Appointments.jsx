import React, { useEffect, useState } from "react";
import { CalendarDays, Plus, X, Trash2, Loader2 } from "lucide-react";
import {
  getAppointments,
  addAppointment,
  cancelAppointment,
  deleteAppointment,
} from "../appointmentStore";
import { useToast } from "../Components/Toast";

const TIME_SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "04:00 PM", "05:00 PM"];

function statusStyle(status) {
  if (status === "Upcoming") return "bg-green-100 text-green-700";
  if (status === "Cancelled") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

export default function Appointments() {
  const showToast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ doctorName: "", date: "", time: TIME_SLOTS[0], reason: "" });
  const [errors, setErrors] = useState({});

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      showToast(err.message || "Failed to load appointments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.doctorName.trim()) e.doctorName = "Doctor name is required";
    if (!form.date) e.date = "Pick a date";
    else if (new Date(form.date) < new Date(new Date().toDateString())) e.date = "Date cannot be in the past";
    if (!form.reason.trim()) e.reason = "Reason for visit is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleBook = async () => {
    if (!validate()) return;
    try {
      await addAppointment(form);
      setForm({ doctorName: "", date: "", time: TIME_SLOTS[0], reason: "" });
      setFormOpen(false);
      showToast("Appointment booked successfully", "success");
      await refresh();
    } catch (err) {
      showToast(err.message || "Booking failed", "error");
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      showToast("Appointment cancelled", "info");
    } catch (err) {
      showToast(err.message || "Cancel failed", "error");
    } finally {
      await refresh();
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAppointment(id);
      showToast("Appointment removed", "info");
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      await refresh();
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
              <CalendarDays size={20} />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Appointments</h1>
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
          >
            <Plus size={18} /> Book Appointment
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="mx-auto animate-spin text-red-600 mb-3" size={32} />
            <p className="text-gray-400 text-sm">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded-3xl">
            <CalendarDays className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium">No appointments booked yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((a) => (
              <div key={a.id} className="border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">Dr. {a.doctorName}</p>
                  <p className="text-sm text-gray-500">{a.date} · {a.time}</p>
                  <p className="text-sm text-gray-600 mt-1">{a.reason}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle(a.status)}`}>
                    {a.status}
                  </span>
                  {a.status === "Upcoming" && (
                    <button
                      onClick={() => handleCancel(a.id)}
                      className="text-xs font-semibold text-gray-600 hover:text-red-600 underline"
                    >
                      Cancel
                    </button>
                  )}
                  <button onClick={() => handleDelete(a.id)} className="text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Book Appointment</h2>
              <button onClick={() => setFormOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Doctor Name *</label>
                <input
                  type="text"
                  value={form.doctorName}
                  onChange={(e) => setForm((f) => ({ ...f, doctorName: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl border ${errors.doctorName ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                  placeholder="e.g. Sharma"
                />
                {errors.doctorName && <p className="text-xs text-red-600 mt-1">{errors.doctorName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl border ${errors.date ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                  />
                  {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Time slot</label>
                  <select
                    value={form.time}
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for visit *</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  rows={2}
                  className={`w-full px-3 py-2.5 rounded-xl border ${errors.reason ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                  placeholder="e.g. Regular checkup"
                />
                {errors.reason && <p className="text-xs text-red-600 mt-1">{errors.reason}</p>}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setFormOpen(false)}
                className="px-5 py-2.5 rounded-full font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                className="px-6 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
