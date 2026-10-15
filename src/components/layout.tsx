import type { ReactNode } from "react";
import { useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { FlaskConical, LayoutGrid, LineChart } from "lucide-react";
import { ScoreSync } from "@/components/score-sync";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSlip } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Board", icon: LayoutGrid },
  { to: "/lab", label: "Lab", icon: FlaskConical },
  { to: "/outcomes", label: "Accuracy", icon: LineChart },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hydrate = useSlip((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="flex min-h-dvh flex-col">
      <ScoreSync />
      <header className="sticky top-0 z-30 border-b border-border/80 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="relative inline-flex size-8 items-center justify-center rounded-sm bg-raised shadow-[var(--shadow-border)]">
              <span className="absolute inset-x-1.5 top-1/2 h-px bg-fg" />
              <span className="size-2 rounded-full bg-accent" />
            </span>
            <span className="font-display text-xl tracking-tight">Pitchline</span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-sm px-3 text-sm transition-colors",
                    active ? "bg-raised text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 text-xs tabular-nums text-muted sm:gap-3">
            <LivePill />
            <BookmarkLink />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 sm:pt-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 backdrop-blur-md sm:hidden">
        <div className="grid grid-cols-3">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-xs",
                  active ? "text-fg" : "text-muted",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <footer className="hidden border-t border-border py-6 text-center text-xs text-subtle sm:block">
        Today and tomorrow’s 1X2 calls. Kick-offs in BST. Live scores update themselves. No sign-in.
      </footer>
    </div>
  );
}

function LivePill() {
  const lastSync = useSlip((s) => s.lastSync);
  const liveN = useSlip((s) => Object.values(s.live).filter((r) => r.state === "live").length);
  const on = lastSync != null && Date.now() - lastSync < 45_000;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-2xs uppercase tracking-widest",
        on ? "bg-accent/15 text-accent" : "text-subtle",
      )}
      title="Live scores refresh on their own every few seconds while this page is open"
    >
      <span className="relative inline-flex size-1.5">
        {on && <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-50" />}
        <span className={cn("relative inline-flex size-1.5 rounded-full", on ? "bg-accent" : "bg-subtle")} />
      </span>
      {liveN ? `${liveN} live` : "Auto"}
    </span>
  );
}

function BookmarkLink() {
  const saved = useSlip((s) => s.saved.length);
  const watching = useSlip((s) => s.watching);
  const toggleWatching = useSlip((s) => s.toggleWatching);
  const on = watching === "bookmarked";
  return (
    <button
      type="button"
      aria-pressed={on}
      title={on ? "Show all games" : "Show bookmarked matches"}
      onClick={toggleWatching}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-2xs uppercase tracking-widest",
        on ? "bg-accent/15 text-accent" : "text-muted hover:text-fg",
      )}
    >
      Bookmarked
      <span className={cn("tabular-nums", on ? "text-accent/80" : "text-subtle")}>{saved}</span>
    </button>
  );
}
