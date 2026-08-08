import React, { useRef, useState } from "react";
import { X, UploadCloud, FileText, Image as ImageIcon, Trash2 } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB - localStorage-friendly limit
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

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

export default function PatientFormModal({ initialData, onClose, onSubmit }) {
  const isEdit = !!initialData;
  const [form, setForm] = useState({
    name: initialData?.name || "",
    age: initialData?.age || "",
    gender: initialData?.gender || "",
    contact: initialData?.contact || "",
    bloodGroup: initialData?.bloodGroup || "",
    diagnosis: initialData?.diagnosis || "",
    medicalHistory: initialData?.medicalHistory || "",
    description: initialData?.description || "",
  });
  const [errors, setErrors] = useState({});
  const [pendingFiles, setPendingFiles] = useState([]); // files added in this session
  const [uploadProgress, setUploadProgress] = useState(null);
  const fileInputRef = useRef(null);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.age) e.age = "Age is required";
    else if (isNaN(form.age) || form.age < 0 || form.age > 120)
      e.age = "Enter a valid age (0-120)";
    if (!form.gender) e.gender = "Select a gender";
    if (!form.contact.trim()) e.contact = "Contact number is required";
    else if (!/^\d{10}$/.test(form.contact.trim()))
      e.contact = "Enter a valid 10-digit contact number";
    if (!form.bloodGroup) e.bloodGroup = "Select a blood group";
    if (!form.diagnosis.trim()) e.diagnosis = "Diagnosis is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrors((er) => ({ ...er, file: "Only PDF, JPG, or PNG files are allowed" }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((er) => ({ ...er, file: "File must be smaller than 2MB" }));
      return;
    }
    setErrors((er) => ({ ...er, file: undefined }));
    setUploadProgress(0);
    try {
      const dataUrl = await readFileAsDataUrl(file, setUploadProgress);
      setPendingFiles((pf) => [
        ...pf,
        {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2),
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
          uploadedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePendingFile = (id) => {
    setPendingFiles((pf) => pf.filter((f) => f.id !== id));
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form, pendingFiles);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? "Edit Patient" : "Add New Patient"}
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border ${errors.name ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                placeholder="e.g. David Schulz"
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Age *</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => setField("age", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border ${errors.age ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                placeholder="e.g. 32"
              />
              {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Gender *</label>
              <select
                value={form.gender}
                onChange={(e) => setField("gender", e.target.value)}
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number *</label>
              <input
                type="tel"
                value={form.contact}
                onChange={(e) => setField("contact", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border ${errors.contact ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                placeholder="10-digit number"
              />
              {errors.contact && <p className="text-xs text-red-600 mt-1">{errors.contact}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Group *</label>
              <select
                value={form.bloodGroup}
                onChange={(e) => setField("bloodGroup", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border ${errors.bloodGroup ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500 bg-white`}
              >
                <option value="">Select</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
              {errors.bloodGroup && <p className="text-xs text-red-600 mt-1">{errors.bloodGroup}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Diagnosis *</label>
              <input
                type="text"
                value={form.diagnosis}
                onChange={(e) => setField("diagnosis", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border ${errors.diagnosis ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-red-500`}
                placeholder="e.g. Viral Infection"
              />
              {errors.diagnosis && <p className="text-xs text-red-600 mt-1">{errors.diagnosis}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Medical History</label>
            <textarea
              value={form.medicalHistory}
              onChange={(e) => setField("medicalHistory", e.target.value)}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Past conditions, allergies, ongoing medication..."
            />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Upload Report / Prescription / Image
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-800 transition-colors"
              >
                <UploadCloud size={16} /> Choose file
              </button>
              <span className="text-xs text-gray-400">PDF, JPG, PNG — max 2MB</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />
            {errors.file && <p className="text-xs text-red-600 mt-1">{errors.file}</p>}

            {uploadProgress !== null && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-600 h-2 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            {pendingFiles.length > 0 && (
              <ul className="mt-3 space-y-2">
                {pendingFiles.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                    {f.type.startsWith("image/") ? (
                      <img src={f.dataUrl} alt={f.name} className="w-10 h-10 object-cover rounded-lg" />
                    ) : (
                      <span className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg text-gray-500">
                        <FileText size={18} />
                      </span>
                    )}
                    <span className="text-sm text-gray-700 truncate flex-1">{f.name}</span>
                    <button type="button" onClick={() => removePendingFile(f.id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description / Notes</label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Any additional notes about this patient or the uploaded file..."
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            {isEdit ? "Save Changes" : "Add Patient"}
          </button>
        </div>
      </div>
    </div>
  );
}
