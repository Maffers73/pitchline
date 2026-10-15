import { cn } from "@/lib/utils";
import type { Outcome } from "@/lib/types";
import { useSlip } from "@/lib/store";

const OPTIONS: { id: Outcome; label: string }[] = [
  { id: "1", label: "Home" },
  { id: "X", label: "Draw" },
  { id: "2", label: "Away" },
];

export function PickToggle({ matchId }: { matchId: string }) {
  const pick = useSlip((s) => s.picks[matchId]);
  const setPick = useSlip((s) => s.setPick);
  return (
    <div className="flex rounded-md bg-raised p-1 shadow-[var(--shadow-border)]">
      {OPTIONS.map((o) => {
        const on = pick === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => setPick(matchId, on ? null : o.id)}
            className={cn(
              "h-11 flex-1 rounded-sm text-sm font-medium transition-colors",
              on ? "bg-primary text-primary-fg" : "text-muted hover:text-fg",
            )}
          >
            {o.id} · {o.label}
          </button>
        );
      })}
    </div>
  );
}
