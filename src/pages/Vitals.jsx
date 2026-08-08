import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, Trash2, Activity } from "lucide-react";
import { getVitalTypes, getEntries, addEntry, deleteEntry } from "../vitalsStore";
import { useToast } from "../Components/Toast";

export default function Vitals() {
  const showToast = useToast();
  const vitalTypes = getVitalTypes();
  const [entries, setEntries] = useState([]);
  const [selectedType, setSelectedType] = useState(vitalTypes[0].id);
  const [form, setForm] = useState({ value: "", date: new Date().toISOString().slice(0, 10) });
  const [errors, setErrors] = useState({});

  const refresh = () => setEntries(getEntries());

  useEffect(() => {
    refresh();
  }, []);

  const chartData = useMemo(() => {
    return entries
      .filter((e) => e.type === selectedType)
      .map((e) => ({ date: e.date, value: e.value, id: e.id }));
  }, [entries, selectedType]);

  const selectedTypeInfo = vitalTypes.find((t) => t.id === selectedType);

  const handleAdd = () => {
    const errs = {};
    if (!form.value || isNaN(form.value)) errs.value = "Enter a valid number";
    if (!form.date) errs.date = "Pick a date";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    addEntry({ type: selectedType, value: form.value, date: form.date });
    setForm({ value: "", date: new Date().toISOString().slice(0, 10) });
    showToast(`${selectedTypeInfo.label} entry added`, "success");
    refresh();
  };

  const handleDelete = (id) => {
    deleteEntry(id);
    showToast("Entry removed", "info");
    refresh();
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center">
            <Activity size={20} />
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Health Vitals</h1>
        </div>

        {/* Type tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {vitalTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedType === t.id
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Add entry form */}
        <div className="border border-gray-200 rounded-2xl p-5 mb-8">
          <p className="font-semibold text-gray-900 mb-3">
            Add {selectedTypeInfo.label} entry {selectedTypeInfo.unit && `(${selectedTypeInfo.unit})`}
          </p>
          <div className="flex flex-wrap gap-3 items-start">
            <div>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder="Value"
                className={`px-3 py-2 rounded-xl border ${errors.value ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500 w-32`}
              />
              {errors.value && <p className="text-xs text-red-600 mt-1">{errors.value}</p>}
            </div>
            <div>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={`px-3 py-2 rounded-xl border ${errors.date ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
            </div>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="border border-gray-200 rounded-2xl p-5 mb-8">
          {chartData.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-sm">
              No {selectedTypeInfo.label} entries yet — add one above.
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Entry list */}
        {chartData.length > 0 && (
          <div className="border border-gray-200 rounded-2xl divide-y divide-gray-100">
            {chartData.slice().reverse().map((e) => (
              <div key={e.id} className="flex justify-between items-center px-5 py-3">
                <span className="text-sm text-gray-700">{e.date}</span>
                <span className="font-semibold text-gray-900">{e.value} {selectedTypeInfo.unit}</span>
                <button onClick={() => handleDelete(e.id)} className="text-gray-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
