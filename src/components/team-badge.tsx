import { useState } from "react";
import { leagueBadge } from "@/lib/badges";
import { cn } from "@/lib/utils";
import { countryFlag, LEAGUES, type LeagueId, type Team } from "@/lib/types";

const SIZE = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
} as const;

export function TeamBadge({ team, size = "md" }: { team: Team; size?: "sm" | "md" | "lg" }) {
  const [failed, setFailed] = useState(false);
  const src = !failed ? team.badge : undefined;
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-raised",
        SIZE[size],
      )}
      aria-hidden
    >
      {src ? (
        <img
          src={src}
          alt=""
          width={48}
          height={48}
          className="size-full object-contain p-0.5"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className={cn(
            "font-medium text-muted",
            size === "sm" ? "text-[9px]" : size === "lg" ? "text-xs" : "text-[10px]",
          )}
        >
          {team.short.slice(0, 3)}
        </span>
      )}
    </span>
  );
}

export function CompBadge({ league, size = "sm" }: { league: LeagueId; size?: "sm" | "md" }) {
  const [failed, setFailed] = useState(false);
  const src = !failed ? leagueBadge(league) : undefined;
  const dim = size === "md" ? "size-6" : "size-5";
  const flag = countryFlag(LEAGUES[league].country);
  if (!src) {
    if (!flag) return null;
    return (
      <span
        aria-hidden
        className={cn(
          "inline-flex shrink-0 items-center justify-center leading-none",
          dim,
          size === "md" ? "text-lg" : "text-base",
        )}
      >
        {flag}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      width={24}
      height={24}
      className={cn("inline-block shrink-0 object-contain", dim)}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
