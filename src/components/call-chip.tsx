import { cn } from "@/lib/utils";
import { pct, ticketLabel, type Prediction, type Ticket } from "@/lib/model";

const tone: Record<Ticket, string> = {
  "1": "bg-home/15 text-home",
  X: "bg-draw/15 text-draw",
  "2": "bg-away/15 text-away",
  "1X": "bg-home/15 text-home",
  X2: "bg-away/15 text-away",
};

export function CallChip({ pred, size = "md" }: { pred: Prediction; size?: "sm" | "md" | "lg" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        tone[pred.ticket],
        size === "lg" ? "gap-2 px-3.5 py-1.5 text-sm" : size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
      )}
    >
      <span className="tabular-nums">{pred.ticket}</span>
      <span className="hidden capitalize sm:inline">{ticketLabel(pred.ticket)}</span>
      <span className="tabular-nums opacity-80">{pct(pred.ticketP)}</span>
      {pred.ticket !== pred.call && (
        <span className="tabular-nums opacity-55">
          {pred.call} {pct(pred.confidence)}
        </span>
      )}
    </span>
  );
}