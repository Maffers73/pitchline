import { cn } from "@/lib/utils";
import { pct } from "@/lib/model";
import type { Prediction } from "@/lib/model";

export function ProbBar({
  pred,
  compact = false,
  board = false,
}: {
  pred: Prediction;
  compact?: boolean;
  board?: boolean;
}) {
  const segs = [
    { key: "1" as const, p: pred.pHome, label: "Home", cls: "bg-home" },
    { key: "X" as const, p: pred.pDraw, label: "Draw", cls: "bg-draw" },
    { key: "2" as const, p: pred.pAway, label: "Away", cls: "bg-away" },
  ];
  const summary = `1X2 ${pct(pred.pHome)} home, ${pct(pred.pDraw)} draw, ${pct(pred.pAway)} away. Call ${pred.call}.`;
  return (
    <div className={cn(board ? "space-y-1" : "space-y-2")}>
      <div
        role="img"
        aria-label={summary}
        className={cn("flex overflow-hidden rounded-full bg-raised", board ? "h-2" : "h-2.5")}
      >
        {segs.map((s) => (
          <div
            key={s.key}
            className={cn(
              s.cls,
              "h-full min-w-0 motion-safe:transition-[flex-grow] motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
              pred.call === s.key && "brightness-110",
            )}
            style={{ flexGrow: Math.max(s.p, 0.0001), flexBasis: 0 }}
            title={`${s.label} ${pct(s.p)}`}
          />
        ))}
      </div>
      {board && (
        <div className="grid grid-cols-3 text-2xs tabular-nums tracking-tight">
          <span className={cn("text-home", pred.call === "1" && "font-semibold")}>1 {pct(pred.pHome)}</span>
          <span className={cn("text-center text-draw", pred.call === "X" && "font-semibold")}>X {pct(pred.pDraw)}</span>
          <span className={cn("text-right text-away", pred.call === "2" && "font-semibold")}>2 {pct(pred.pAway)}</span>
        </div>
      )}
      {!compact && !board && (
        <div className="grid grid-cols-3 gap-2 text-xs tabular-nums">
          <div className="min-w-0">
            <div className="text-muted">1 · Home</div>
            <div className={cn("font-medium", pred.call === "1" && "text-home")}>{pct(pred.pHome)}</div>
          </div>
          <div className="min-w-0 text-center">
            <div className="text-muted">X · Draw</div>
            <div className={cn("font-medium", pred.call === "X" && "text-draw")}>{pct(pred.pDraw)}</div>
          </div>
          <div className="min-w-0 text-right">
            <div className="text-muted">2 · Away</div>
            <div className={cn("font-medium", pred.call === "2" && "text-away")}>{pct(pred.pAway)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
