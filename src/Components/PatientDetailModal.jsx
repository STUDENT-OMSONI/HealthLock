import React, { useRef } from "react";
import { X, FileText, Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
}

export default function PatientDetailModal({ patient, onClose }) {
  const qrRef = useRef(null);

  const handleDownloadQr = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${patient.name.replace(/\s+/g, "_")}_QR.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-lg font-bold text-gray-900">Patient Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 grid md:grid-cols-3 gap-6">
          {/* QR + core info */}
          <div className="md:col-span-1 flex flex-col items-center text-center border border-gray-200 rounded-2xl p-5 h-fit">
            <div ref={qrRef} className="bg-white p-3 rounded-xl border border-gray-200">
              <QRCodeCanvas value={patient.qrToken} size={160} />
            </div>
            <button
              onClick={handleDownloadQr}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
            >
              <Download size={14} /> Download QR
            </button>
            <p className="text-xs text-gray-400 mt-3 break-all">{patient.qrToken}</p>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-2xl font-extrabold text-gray-900">{patient.name}</h3>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <p><span className="font-semibold text-gray-900">Patient ID:</span> <span className="text-gray-600">{patient.id}</span></p>
              <p><span className="font-semibold text-gray-900">Age:</span> <span className="text-gray-600">{patient.age}</span></p>
              <p><span className="font-semibold text-gray-900">Gender:</span> <span className="text-gray-600">{patient.gender}</span></p>
              <p><span className="font-semibold text-gray-900">Contact:</span> <span className="text-gray-600">{patient.contact}</span></p>
              <p><span className="font-semibold text-gray-900">Blood Group:</span> <span className="text-gray-600">{patient.bloodGroup}</span></p>
              <p><span className="font-semibold text-gray-900">Diagnosis:</span> <span className="text-gray-600">{patient.diagnosis}</span></p>
            </div>

            {patient.medicalHistory && (
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Medical History</p>
                <p className="text-gray-600 text-sm bg-gray-50 border border-gray-200 rounded-xl p-3">{patient.medicalHistory}</p>
              </div>
            )}

            {patient.description && (
              <div>
                <p className="font-semibold text-gray-900 text-sm mb-1">Description / Notes</p>
                <p className="text-gray-600 text-sm bg-gray-50 border border-gray-200 rounded-xl p-3">{patient.description}</p>
              </div>
            )}

            <div>
              <p className="font-semibold text-gray-900 text-sm mb-2">Uploaded Files</p>
              {patient.files && patient.files.length > 0 ? (
                <ul className="space-y-2">
                  {patient.files.map((f) => (
                    <li key={f.id} className="flex items-center gap-3 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                      {f.type.startsWith("image/") ? (
                        <img src={f.dataUrl} alt={f.name} className="w-10 h-10 object-cover rounded-lg" />
                      ) : (
                        <span className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg text-gray-500">
                          <FileText size={18} />
                        </span>
                      )}
                      <a
                        href={f.dataUrl}
                        download={f.name}
                        className="text-sm text-red-600 font-medium hover:underline truncate flex-1"
                      >
                        {f.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No files uploaded yet.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400 pt-2 border-t border-gray-100">
              <span>Created: {formatDate(patient.createdAt)}</span>
              <span>Last Updated: {formatDate(patient.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
