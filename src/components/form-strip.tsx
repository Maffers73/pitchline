import { cn } from "@/lib/utils";
import type { FormResult } from "@/lib/types";

export function FormStrip({ form, size = "md" }: { form: FormResult[]; size?: "md" | "xs" }) {
  const shown = form.slice(0, 5);
  if (!shown.length) return null;
  return (
    <div className="flex items-center gap-0.5" aria-label={`Form ${shown.join(" ")}`}>
      {shown.map((r, i) => (
        <span
          key={`${r}-${i}`}
          className={cn(
            "inline-flex items-center justify-center rounded-xs font-semibold tabular-nums",
            size === "xs" ? "size-4 text-[10px]" : "size-5 text-2xs",
            r === "W" && "bg-home/20 text-home",
            r === "D" && "bg-draw/20 text-draw",
            r === "L" && "bg-away/20 text-away",
          )}
        >
          {r}
        </span>
      ))}
    </div>
  );
}
