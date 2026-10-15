import { cn } from "@/lib/utils";
import {
  pct,
  totalsHit,
  totalsLabel,
  totalsShort,
  type TotalsCall,
} from "@/lib/model";

export function TotalsChip({
  call,
  size = "sm",
  hit,
}: {
  call: TotalsCall;
  size?: "sm" | "md";
  hit?: boolean;
}) {
  return (
    <span
      title={totalsLabel(call)}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium tabular-nums",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        hit === true && "bg-home text-bg",
        hit === false && "bg-away/80 text-bg",
        hit == null && call.side === "over" && "bg-home/15 text-home",
        hit == null && call.side === "under" && "bg-away/15 text-away",
      )}
    >
      <span>{totalsShort(call)}</span>
      <span className="opacity-80">{pct(call.p)}</span>
    </span>
  );
}

export function BttsChip({ p, size = "sm" }: { p: number; size?: "sm" | "md" }) {
  const yes = p >= 0.5;
  const shown = yes ? p : 1 - p;
  return (
    <span
      title={yes ? "Both teams to score" : "Not both teams to score"}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium tabular-nums",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        yes ? "bg-home/15 text-home" : "bg-away/15 text-away",
      )}
    >
      <span>BTTS {yes ? "Yes" : "No"}</span>
      <span className="opacity-80">{pct(shown)}</span>
    </span>
  );
}

export function TotalsMarket({
  call,
  homeGoals,
  awayGoals,
}: {
  call: TotalsCall;
  homeGoals?: number;
  awayGoals?: number;
}) {
  const settled = homeGoals != null && awayGoals != null;
  const hit = settled ? totalsHit(call, homeGoals, awayGoals) : undefined;
  const overOn = call.side === "over";
  return (
    <div className="rounded-md bg-raised p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs uppercase tracking-widest text-subtle">Over / under {call.line}</div>
        {settled && (
          <span className={cn("text-2xs font-medium", hit ? "text-home" : "text-away")}>
            {hit ? "Hit" : "Miss"}
          </span>
        )}
      </div>
      <div className="mt-2 font-display text-2xl tabular-nums tracking-tight">
        {totalsLabel(call)} <span className="text-lg text-muted">{pct(call.p)}</span>
      </div>
      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-surface">
        <div
          className={cn("h-full", overOn ? "bg-home" : "bg-home/35")}
          style={{ width: `${Math.round(call.overP * 100)}%` }}
        />
        <div
          className={cn("h-full", overOn ? "bg-away/35" : "bg-away")}
          style={{ width: `${Math.round((1 - call.overP) * 100)}%` }}
        />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs tabular-nums">
        <div>
          <div className="text-muted">Over {call.line}</div>
          <div className={cn("font-medium", overOn && "text-home")}>{pct(call.overP)}</div>
        </div>
        <div className="text-right">
          <div className="text-muted">Under {call.line}</div>
          <div className={cn("font-medium", !overOn && "text-away")}>{pct(1 - call.overP)}</div>
        </div>
      </div>
    </div>
  );
}
