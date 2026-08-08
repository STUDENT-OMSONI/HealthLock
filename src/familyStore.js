const KEY = "healthlock_family";

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

export function getFamilyMembers() {
  return readAll();
}

export function addFamilyMember(data) {
  const list = readAll();
  const member = { id: uid(), ...data };
  list.push(member);
  writeAll(list);
  return member;
}

export function deleteFamilyMember(id) {
  writeAll(readAll().filter((m) => m.id !== id));
}
