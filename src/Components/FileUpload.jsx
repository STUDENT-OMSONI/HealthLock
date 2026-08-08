import React, { useRef, useState, useEffect, useCallback } from "react";
import { UploadCloud, FileText, Trash2, Check, X } from "lucide-react";
import { useToast } from "./Toast";

const STORAGE_KEY = "healthlock_my_files";
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const CATEGORIES = [
  "Prescription",
  "Lab Report",
  "Blood Test",
  "X-Ray",
  "MRI",
  "CT Scan",
  "Vaccination",
  "Insurance",
  "Other",
];

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStored(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function readFileAsDataUrl(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function FileUpload() {
  const showToast = useToast();
  const [files, setFiles] = useState([]);
  const [pending, setPending] = useState(null); // { file, dataUrl } staged, not yet saved
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setFiles(readStored());
  }, []);

  const stageFile = async (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only PDF, JPG, or PNG files are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File must be smaller than 2MB.");
      return;
    }
    setError("");
    setProgress(0);
    try {
      const dataUrl = await readFileAsDataUrl(file, setProgress);
      setPending({ file, dataUrl });
    } finally {
      setProgress(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) stageFile(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) stageFile(file);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = () => setDragActive(false);

  const handleCancel = () => {
    setPending(null);
    setDescription("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSave = () => {
    if (!pending) return;
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      name: pending.file.name,
      type: pending.file.type,
      size: pending.file.size,
      dataUrl: pending.dataUrl,
      category,
      description,
      uploadedAt: new Date().toISOString(),
    };
    const updated = [entry, ...files];
    setFiles(updated);
    writeStored(updated);
    showToast(`${category} saved successfully`, "success");
    handleCancel();
  };

  const handleDelete = (id) => {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    writeStored(updated);
    showToast("File removed", "info");
  };

  return (
    <div className="space-y-4">
      {/* Drag & drop zone */}
      {!pending && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
            dragActive ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-red-400"
          }`}
        >
          <UploadCloud className="mx-auto mb-2 text-gray-400" size={28} />
          <p className="text-sm font-semibold text-gray-700">
            Drag & drop a file here, or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — max 2MB</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        className="hidden"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}

      {progress !== null && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-red-600 h-2 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Staged file: preview + category + description + Save/Cancel */}
      {pending && (
        <div className="border border-gray-200 rounded-2xl p-4 space-y-3 bg-gray-50">
          <div className="flex items-center gap-3">
            {pending.file.type.startsWith("image/") ? (
              <img src={pending.dataUrl} alt={pending.file.name} className="w-14 h-14 object-cover rounded-lg" />
            ) : (
              <span className="w-14 h-14 flex items-center justify-center bg-gray-200 rounded-lg text-gray-500">
                <FileText size={22} />
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{pending.file.name}</p>
              <p className="text-xs text-gray-400">{(pending.file.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description / Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional notes about this file..."
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 transition-colors"
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
            >
              <Check size={14} /> Save
            </button>
          </div>
        </div>
      )}

      {/* Saved files list */}
      {files.length > 0 && (
        <ul className="space-y-2 pt-2">
          {files.map((f) => (
            <li key={f.id} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
              {f.type.startsWith("image/") ? (
                <img src={f.dataUrl} alt={f.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
              ) : (
                <span className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg text-gray-500 shrink-0">
                  <FileText size={18} />
                </span>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <a href={f.dataUrl} download={f.name} className="text-sm font-medium text-red-600 hover:underline truncate">
                    {f.name}
                  </a>
                  {f.category && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 shrink-0">
                      {f.category}
                    </span>
                  )}
                </div>
                {f.description && <p className="text-xs text-gray-500 mt-0.5">{f.description}</p>}
              </div>
              <button onClick={() => handleDelete(f.id)} className="text-gray-400 hover:text-red-600 shrink-0">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FileUpload;
