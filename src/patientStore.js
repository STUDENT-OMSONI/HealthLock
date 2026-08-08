// Patient data store -- REAL backend now (Phase 4).
//
// Every function here calls the real Express + MongoDB API instead of
// localStorage. Function names are unchanged from before, but every
// function is now async (returns a Promise) since it's real network I/O --
// callers need to `await` these and handle loading/error states.

import { apiFetch } from "./auth";

// MongoDB documents use `_id`; the rest of the frontend (built before the
// real backend existed) expects `.id`. Normalizing here means every other
// file (Patients.jsx, DoctorDashboard.jsx, modals) keeps working unchanged.
function normalize(patient) {
  if (!patient) return patient;
  return { ...patient, id: patient._id };
}

export async function getPatients(query = "") {
  const qs = query ? `?q=${encodeURIComponent(query)}` : "";
  const data = await apiFetch(`/api/patients${qs}`);
  return data.patients.map(normalize);
}

export async function getPatientByToken(qrToken) {
  try {
    const data = await apiFetch(`/api/patients/by-token/${encodeURIComponent(qrToken)}`);
    return normalize(data.patient);
  } catch (err) {
    if (err.status === 404) return null; // genuinely no match -- not an error
    throw err; // 401/403/500 etc. are real problems the caller should show
  }
}

export async function addPatient(data) {
  const res = await apiFetch("/api/patients", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return normalize(res.patient);
}

export async function updatePatient(id, updates) {
  const res = await apiFetch(`/api/patients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return normalize(res.patient);
}

export async function deletePatient(id) {
  await apiFetch(`/api/patients/${id}`, { method: "DELETE" });
}

export async function addFileToPatient(id, file) {
  const res = await apiFetch(`/api/patients/${id}/files`, {
    method: "POST",
    body: JSON.stringify(file),
  });
  return normalize(res.patient);
}
