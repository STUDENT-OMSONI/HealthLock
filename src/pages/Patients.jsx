import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Eye, Pencil, Trash2, Users, Loader2 } from "lucide-react";
import {
  getPatients,
  addPatient,
  updatePatient,
  deletePatient,
} from "../patientStore";
import PatientFormModal from "../Components/PatientFormModal";
import PatientDetailModal from "../Components/PatientDetailModal";
import { useToast } from "../Components/Toast";

export default function Patients() {
  const showToast = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      showToast(err.message || "Failed to load patients", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.diagnosis.toLowerCase().includes(q) ||
        p.contact.includes(q);
      const matchesGender = !genderFilter || p.gender === genderFilter;
      return matchesQuery && matchesGender;
    });
  }, [patients, query, genderFilter]);

  const handleAddClick = () => {
    setEditingPatient(null);
    setFormOpen(true);
  };

  const handleEditClick = (patient) => {
    setEditingPatient(patient);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData, pendingFiles) => {
    setSaving(true);
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, {
          ...formData,
          files: [...editingPatient.files, ...pendingFiles],
        });
        showToast("Patient updated successfully", "success");
      } else {
        const created = await addPatient(formData);
        if (pendingFiles.length > 0) {
          await updatePatient(created.id, { files: pendingFiles });
        }
        showToast("Patient added with a unique QR code", "success");
      }
      setFormOpen(false);
      setEditingPatient(null);
      await refresh();
    } catch (err) {
      showToast(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirmed = async (id) => {
    try {
      await deletePatient(id);
      showToast("Patient deleted", "info");
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    } finally {
      setConfirmDeleteId(null);
      await refresh();
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
              <Users size={20} />
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Patient Management</h1>
              <p className="text-gray-500 text-sm">{patients.length} patient{patients.length !== 1 ? "s" : ""} on record</p>
            </div>
          </div>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
          >
            <Plus size={18} /> Add Patient
          </button>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, diagnosis, or contact..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="mx-auto animate-spin text-red-600 mb-3" size={32} />
            <p className="text-gray-400 text-sm">Loading patients...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded-3xl">
            <Users className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium">
              {patients.length === 0 ? "No patients added yet." : "No patients match your search."}
            </p>
            {patients.length === 0 && (
              <button
                onClick={handleAddClick}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <Plus size={16} /> Add your first patient
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table on larger screens */}
            <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Age</th>
                    <th className="px-5 py-3">Gender</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Blood Group</th>
                    <th className="px-5 py-3">Diagnosis</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3 font-semibold text-gray-900">{p.name}</td>
                      <td className="px-5 py-3 text-gray-600">{p.age}</td>
                      <td className="px-5 py-3 text-gray-600">{p.gender}</td>
                      <td className="px-5 py-3 text-gray-600">{p.contact}</td>
                      <td className="px-5 py-3 text-gray-600">{p.bloodGroup}</td>
                      <td className="px-5 py-3 text-gray-600">{p.diagnosis}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setViewingPatient(p)} title="View" className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => handleEditClick(p)} title="Edit" className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => setConfirmDeleteId(p.id)} title="Delete" className="p-2 rounded-full hover:bg-red-50 text-red-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards on mobile */}
            <div className="md:hidden space-y-4">
              {filtered.map((p) => (
                <div key={p.id} className="border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.age} yrs · {p.gender} · {p.bloodGroup}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setViewingPatient(p)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleEditClick(p)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setConfirmDeleteId(p.id)} className="p-2 rounded-full hover:bg-red-50 text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600"><span className="font-semibold text-gray-800">Contact:</span> {p.contact}</p>
                  <p className="text-sm text-gray-600"><span className="font-semibold text-gray-800">Diagnosis:</span> {p.diagnosis}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {formOpen && (
        <PatientFormModal
          initialData={editingPatient}
          onClose={() => {
            setFormOpen(false);
            setEditingPatient(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}

      {viewingPatient && (
        <PatientDetailModal patient={viewingPatient} onClose={() => setViewingPatient(null)} />
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <p className="font-bold text-gray-900 mb-2">Delete this patient?</p>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-5 py-2.5 rounded-full font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirmed(confirmDeleteId)}
                className="px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
