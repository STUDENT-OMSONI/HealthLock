import React, { useEffect, useState } from "react";
import { UserCog, Plus, X, Check, Ban, Trash2 } from "lucide-react";
import { getDoctors, addDoctor, setDoctorStatus, deleteDoctor } from "../doctorStore";
import { useToast } from "../Components/Toast";

function statusStyle(status) {
  if (status === "Approved") return "bg-green-100 text-green-700";
  if (status === "Rejected") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
}

export default function AdminDoctors() {
  const showToast = useToast();
  const [doctors, setDoctors] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", specialization: "", license: "", experience: "" });
  const [errors, setErrors] = useState({});

  const refresh = () => setDoctors(getDoctors());

  useEffect(() => {
    refresh();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.specialization.trim()) e.specialization = "Specialization is required";
    if (!form.license.trim()) e.license = "Medical license number is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    addDoctor(form);
    setForm({ name: "", specialization: "", license: "", experience: "" });
    setFormOpen(false);
    showToast("Doctor submitted for verification", "success");
    refresh();
  };

  const handleApprove = (id) => {
    setDoctorStatus(id, "Approved");
    showToast("Doctor approved", "success");
    refresh();
  };

  const handleReject = (id) => {
    setDoctorStatus(id, "Rejected");
    showToast("Doctor rejected", "info");
    refresh();
  };

  const handleDelete = (id) => {
    deleteDoctor(id);
    showToast("Doctor removed", "info");
    refresh();
  };

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
              <UserCog size={20} />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Doctor Verification</h1>
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
          >
            <Plus size={18} /> Add Doctor
          </button>
        </div>

        {doctors.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl">
            <UserCog className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium">No doctors submitted for verification yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {doctors.map((d) => (
              <div key={d.id} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">Dr. {d.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{d.specialization} · License: {d.license}</p>
                  {d.experience && <p className="text-xs text-gray-400">{d.experience} years experience</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle(d.status)}`}>
                    {d.status}
                  </span>
                  {d.status === "Pending" && (
                    <>
                      <button onClick={() => handleApprove(d.id)} title="Approve" className="p-2 rounded-full hover:bg-green-50 text-green-600">
                        <Check size={16} />
                      </button>
                      <button onClick={() => handleReject(d.id)} title="Reject" className="p-2 rounded-full hover:bg-red-50 text-red-600">
                        <Ban size={16} />
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDelete(d.id)} title="Delete" className="p-2 rounded-full hover:bg-red-50 text-red-600">
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
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Doctor for Verification</h2>
              <button onClick={() => setFormOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl border ${errors.name ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white`}
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Specialization *</label>
                <input
                  type="text"
                  value={form.specialization}
                  onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl border ${errors.specialization ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white`}
                  placeholder="e.g. Cardiologist"
                />
                {errors.specialization && <p className="text-xs text-red-600 mt-1">{errors.specialization}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">License No. *</label>
                  <input
                    type="text"
                    value={form.license}
                    onChange={(e) => setForm((f) => ({ ...f, license: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl border ${errors.license ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white`}
                  />
                  {errors.license && <p className="text-xs text-red-600 mt-1">{errors.license}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Experience (yrs)</label>
                  <input
                    type="number"
                    value={form.experience}
                    onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setFormOpen(false)}
                className="px-5 py-2.5 rounded-full font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-6 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
