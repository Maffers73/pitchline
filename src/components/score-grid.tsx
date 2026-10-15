import { cn } from "@/lib/utils";
import type { Prediction } from "@/lib/model";
import { pct } from "@/lib/model";

export function ScoreGrid({ pred, max = 5 }: { pred: Prediction; max?: number }) {
  const cells = pred.cells.filter((c) => c.home <= max && c.away <= max);
  const peak = Math.max(...cells.map((c) => c.p));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted">
        <span>Correct-score matrix</span>
        <span className="tabular-nums">
          Predicted {pred.scoreHome}–{pred.scoreAway} · {pct(cells.find((c) => c.home === pred.scoreHome && c.away === pred.scoreAway)?.p ?? 0)}
        </span>
      </div>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `1.25rem repeat(${max + 1}, minmax(0, 1fr))` }}
      >
        <div />
        {Array.from({ length: max + 1 }, (_, j) => (
          <div key={`h-${j}`} className="text-center text-2xs tabular-nums text-subtle">
            {j}
          </div>
        ))}
        {Array.from({ length: max + 1 }, (_, i) => (
          <div key={`row-${i}`} className="contents">
            <div className="flex items-center text-2xs tabular-nums text-subtle">{i}</div>
            {Array.from({ length: max + 1 }, (_, j) => {
              const cell = cells.find((c) => c.home === i && c.away === j);
              const p = cell?.p ?? 0;
              const isMode = i === pred.scoreHome && j === pred.scoreAway;
              const t = p / peak;
              return (
                <div
                  key={`${i}-${j}`}
                  title={`${i}–${j} ${pct(p)}`}
                  className={cn(
                    "aspect-square rounded-xs text-center text-2xs tabular-nums leading-8",
                    isMode ? "ring-1 ring-primary text-primary-fg" : p > 0.08 ? "text-bg" : "text-fg",
                  )}
                  style={{
                    backgroundColor: `color-mix(in oklab, var(--color-accent) ${Math.round(18 + t * 82)}%, var(--color-raised))`,
                  }}
                >
                  {p >= 0.04 ? Math.round(p * 100) : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="mt-2 text-2xs text-subtle">Rows = home goals, columns = away goals. Darker cells are likelier.</p>
    </div>
  );
}
