import React, { useEffect, useMemo, useState } from "react";
import { FileText, Image as ImageIcon, Search, Filter } from "lucide-react";

const STORAGE_KEY = "healthlock_my_files";

const CATEGORY_ICONS = {
  Prescription: "💊",
  "Lab Report": "🧪",
  "Blood Test": "🩸",
  "X-Ray": "🩻",
  MRI: "🧠",
  "CT Scan": "🫁",
  Vaccination: "💉",
  Insurance: "📄",
  Other: "📁",
};

function readFiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function HealthHistory() {
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    // Timeline is built from real uploaded files (Health History = "what
    // actually happened", so it updates the moment a new file is saved via
    // FileUpload -- since both read the same localStorage key).
    setFiles(readFiles());
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(files.map((f) => f.category).filter(Boolean))),
    [files]
  );

  const filtered = useMemo(() => {
    return files
      .filter((f) => {
        const q = query.trim().toLowerCase();
        const matchesQuery = !q || f.name.toLowerCase().includes(q) || (f.description || "").toLowerCase().includes(q);
        const matchesCategory = !categoryFilter || f.category === categoryFilter;
        return matchesQuery && matchesCategory;
      })
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  }, [files, query, categoryFilter]);

  if (files.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        No records yet. Upload a file above to start your medical timeline.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records..."
            className="w-full pl-9 pr-3 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-full border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {/* Timeline */}
      <ol className="relative border-l-2 border-gray-100 ml-2 space-y-6">
        {filtered.map((f) => (
          <li key={f.id} className="ml-5">
            <span className="absolute -left-[11px] flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-red-600 text-[10px]">
              {CATEGORY_ICONS[f.category] || "📁"}
            </span>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="font-semibold text-gray-900 text-sm truncate">{f.name}</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 shrink-0">
                  {f.category || "Other"}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-1">
                {new Date(f.uploadedAt).toLocaleString()}
              </p>
              {f.description && <p className="text-xs text-gray-600">{f.description}</p>}
              <a href={f.dataUrl} download={f.name} className="text-xs text-red-600 font-medium hover:underline mt-1 inline-block">
                View / Download
              </a>
            </div>
          </li>
        ))}
      </ol>

      {filtered.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No records match your search.</p>
      )}
    </div>
  );
}

export default HealthHistory;
