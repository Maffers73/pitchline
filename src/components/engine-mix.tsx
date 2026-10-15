import { pct, type Prediction, type Trio } from "@/lib/model";
import { cn } from "@/lib/utils";

function Row({
  name,
  note,
  t,
  weight,
  strong,
}: {
  name: string;
  note: string;
  t: Trio;
  weight?: number;
  strong?: boolean;
}) {
  return (
    <div className={cn("grid grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr] items-center gap-2 px-3 py-2", strong && "bg-raised")}>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{name}</div>
        <div className="truncate text-2xs text-subtle">
          {weight != null ? `${Math.round(weight * 100)}% mix · ${note}` : note}
        </div>
      </div>
      <div className="text-right font-mono text-sm tabular-nums">{pct(t.pHome)}</div>
      <div className="text-right font-mono text-sm tabular-nums">{pct(t.pDraw)}</div>
      <div className="text-right font-mono text-sm tabular-nums">{pct(t.pAway)}</div>
    </div>
  );
}

export function EngineMixTable({ pred, homeElo, awayElo }: { pred: Prediction; homeElo: number; awayElo: number }) {
  const { dixon, elo, market, weights } = pred.engines;
  return (
    <div className="overflow-hidden rounded-lg bg-raised/60">
      <div className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr] gap-2 px-3 py-2 text-2xs uppercase tracking-widest text-subtle">
        <span>View</span>
        <span className="text-right">1</span>
        <span className="text-right">X</span>
        <span className="text-right">2</span>
      </div>
      <Row name="Expected goals" note="score grid & totals" t={dixon} weight={weights.dixon} />
      <Row name="Club strength" note={`${homeElo} vs ${awayElo}`} t={elo} weight={weights.elo} />
      {market && <Row name="Book" note="fair prices" t={market} weight={weights.market} />}
      <Row
        name="Published call"
        note="ticket + strength"
        t={{ pHome: pred.pHome, pDraw: pred.pDraw, pAway: pred.pAway }}
        strong
      />
    </div>
  );
}
