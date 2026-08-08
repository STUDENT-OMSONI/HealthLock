import React, { useEffect, useState } from "react";
import { Users2, Plus, X, Trash2, User } from "lucide-react";
import { getFamilyMembers, addFamilyMember, deleteFamilyMember } from "../familyStore";
import { useToast } from "../Components/Toast";

const RELATIONS = ["Spouse", "Child", "Parent", "Sibling", "Grandparent", "Other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Family() {
  const showToast = useToast();
  const [members, setMembers] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", relation: "", age: "", gender: "", bloodGroup: "" });
  const [errors, setErrors] = useState({});

  const refresh = () => setMembers(getFamilyMembers());

  useEffect(() => {
    refresh();
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.relation) e.relation = "Select a relation";
    if (!form.age || isNaN(form.age) || form.age < 0 || form.age > 120) e.age = "Enter a valid age";
    if (!form.gender) e.gender = "Select a gender";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    addFamilyMember(form);
    setForm({ name: "", relation: "", age: "", gender: "", bloodGroup: "" });
    setFormOpen(false);
    showToast("Family member added", "success");
    refresh();
  };

  const handleDelete = (id) => {
    deleteFamilyMember(id);
    showToast("Family member removed", "info");
    refresh();
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
              <Users2 size={20} />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Family Management</h1>
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
          >
            <Plus size={18} /> Add Family Member
          </button>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-300 rounded-3xl">
            <Users2 className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium">No family members added yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {members.map((m) => (
              <div key={m.id} className="border border-gray-200 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <User size={18} />
                  </span>
                  <button onClick={() => handleDelete(m.id)} className="text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="font-bold text-gray-900">{m.name}</p>
                <p className="text-xs text-red-600 font-semibold mb-2">{m.relation}</p>
                <p className="text-sm text-gray-600">{m.age} yrs · {m.gender}</p>
                {m.bloodGroup && <p className="text-sm text-gray-600">Blood group: {m.bloodGroup}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Add Family Member</h2>
              <button onClick={() => setFormOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl border ${errors.name ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Relation *</label>
                  <select
                    value={form.relation}
                    onChange={(e) => setForm((f) => ({ ...f, relation: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl border ${errors.relation ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500 bg-white`}
                  >
                    <option value="">Select</option>
                    {RELATIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {errors.relation && <p className="text-xs text-red-600 mt-1">{errors.relation}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Age *</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl border ${errors.age ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                  />
                  {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Gender *</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                    className={`w-full px-3 py-2.5 rounded-xl border ${errors.gender ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500 bg-white`}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-xs text-red-600 mt-1">{errors.gender}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Group</label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm((f) => ({ ...f, bloodGroup: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
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
                onClick={handleAdd}
                className="px-6 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
