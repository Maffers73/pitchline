import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { applyTheme, preferredTheme, type Theme } from "@/lib/theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const next = preferredTheme();
    applyTheme(next);
    setTheme(next);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      className="inline-flex size-11 items-center justify-center rounded-sm text-muted transition-colors hover:bg-raised hover:text-fg"
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
