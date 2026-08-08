const KEY = "healthlock_vitals";

const VITAL_TYPES = [
  { id: "bp", label: "Blood Pressure", unit: "mmHg" },
  { id: "sugar", label: "Blood Sugar", unit: "mg/dL" },
  { id: "weight", label: "Weight", unit: "kg" },
  { id: "bmi", label: "BMI", unit: "" },
  { id: "heartRate", label: "Heart Rate", unit: "bpm" },
  { id: "oxygen", label: "Oxygen Level", unit: "%" },
];

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

export function getVitalTypes() {
  return VITAL_TYPES;
}

export function getEntries() {
  return readAll().sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function getEntriesByType(typeId) {
  return getEntries().filter((e) => e.type === typeId);
}

export function addEntry({ type, value, date }) {
  const list = readAll();
  const entry = { id: uid(), type, value: Number(value), date };
  list.push(entry);
  writeAll(list);
  return entry;
}

export function deleteEntry(id) {
  writeAll(readAll().filter((e) => e.id !== id));
}
