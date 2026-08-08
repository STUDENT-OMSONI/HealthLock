// Appointment data store -- REAL backend now (Phase 4).
import { apiFetch } from "./auth";

function normalize(appt) {
  if (!appt) return appt;
  return { ...appt, id: appt._id };
}

export async function getAppointments() {
  const data = await apiFetch("/api/appointments");
  return data.appointments.map(normalize);
}

export async function addAppointment(data) {
  const res = await apiFetch("/api/appointments", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return normalize(res.appointment);
}

export async function updateAppointment(id, updates) {
  const res = await apiFetch(`/api/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return normalize(res.appointment);
}

export async function cancelAppointment(id) {
  return updateAppointment(id, { status: "Cancelled" });
}

export async function deleteAppointment(id) {
  await apiFetch(`/api/appointments/${id}`, { method: "DELETE" });
}
