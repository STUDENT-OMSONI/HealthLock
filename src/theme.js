const KEY = "healthlock_theme"; // "light" | "dark"

export function getTheme() {
  return localStorage.getItem(KEY) || "light";
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem(KEY, theme);
}

export function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

// Call this once when the app first loads so the saved preference applies
// immediately (e.g. from main.jsx).
export function initTheme() {
  applyTheme(getTheme());
}
