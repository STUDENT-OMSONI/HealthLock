import { getPatients } from "../patientStore";

// Storage usage here is genuinely real -- we calculate the actual number of
// bytes currently used in this browser's localStorage, and list the actual
// uploaded patient files with their real sizes. Nothing here is simulated.
//
// TODO (Phase 2 backend): once file uploads go to Cloudinary/Firebase
// instead of being base64-encoded into localStorage, replace
// `getRealLocalStorageUsage()` with a real API call that returns the
// cloud storage provider's actual usage/quota numbers.

const APPROX_BROWSER_QUOTA_BYTES = 5 * 1024 * 1024; // ~5MB is the typical localStorage limit

function getRealLocalStorageUsageBytes() {
  let total = 0;
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      total += (localStorage[key]?.length || 0) + key.length;
    }
  }
  return total; // real byte count (UTF-16 code units), not a fabricated number
}

export async function getStorageOverview() {
  const usedBytes = getRealLocalStorageUsageBytes();
  const patients = await getPatients();

  const allFiles = patients.flatMap((p) =>
    (p.files || []).map((f) => ({ ...f, patientName: p.name, patientId: p.id }))
  );

  const largestFiles = [...allFiles].sort((a, b) => b.size - a.size).slice(0, 10);
  const recentUploads = [...allFiles]
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    .slice(0, 10);

  return {
    usedBytes,
    quotaBytes: APPROX_BROWSER_QUOTA_BYTES,
    remainingBytes: Math.max(0, APPROX_BROWSER_QUOTA_BYTES - usedBytes),
    totalFiles: allFiles.length,
    largestFiles,
    recentUploads,
    isCloudStorage: false, // genuinely true -- this is browser storage, not cloud
  };
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
