export type Theme = "dark" | "light";

const KEY = "pitchline-theme";

export function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function preferredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  return "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* ignore */
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#f3f5f1" : "#090c0a");
}

export const THEME_BOOT =
  "(function(){try{var t=localStorage.getItem('pitchline-theme');if(t!=='light'&&t!=='dark')t='light';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})();";
