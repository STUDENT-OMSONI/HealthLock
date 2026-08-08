import { logAction } from "./auditStore";

const KEY = "healthlock_doctors";

function uid() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getDoctors() {
  return readAll();
}

export function addDoctor(data) {
  const list = readAll();
  const doctor = {
    id: uid(),
    name: data.name,
    specialization: data.specialization,
    license: data.license,
    experience: data.experience,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };
  list.push(doctor);
  writeAll(list);
  logAction("Doctor registration submitted", doctor.name);
  return doctor;
}

export function setDoctorStatus(id, status) {
  const list = readAll();
  const idx = list.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  list[idx].status = status;
  writeAll(list);
  logAction(`Doctor ${status.toLowerCase()}`, list[idx].name);
  return list[idx];
}

export function deleteDoctor(id) {
  const doctor = readAll().find((d) => d.id === id);
  writeAll(readAll().filter((d) => d.id !== id));
  if (doctor) logAction("Doctor removed", doctor.name);
}
