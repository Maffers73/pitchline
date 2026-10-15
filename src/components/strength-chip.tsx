import { cn } from "@/lib/utils";
import { strengthCopy, type Strength } from "@/lib/model";

export function StrengthChip({
  strength,
  className,
}: {
  strength: Strength;
  className?: string;
}) {
  const copy = strengthCopy(strength);
  return (
    <span
      title={copy.blurb}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        strength === "strong" && "bg-home/15 text-home",
        strength === "lean" && "bg-draw/15 text-draw",
        strength === "toss-up" && "bg-raised text-muted",
        className,
      )}
    >
      {copy.label}
    </span>
  );
}
