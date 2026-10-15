import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "muted",
  children,
}: {
  className?: string;
  tone?: "muted" | "home" | "draw" | "away" | "accent";
  children: ReactNode;
}) {
  const tones = {
    muted: "bg-raised text-muted",
    home: "bg-home/15 text-home",
    draw: "bg-draw/15 text-draw",
    away: "bg-away/15 text-away",
    accent: "bg-accent/15 text-accent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
