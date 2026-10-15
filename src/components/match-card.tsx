import { Bookmark } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CallChip } from "./call-chip";
import { FormStrip } from "./form-strip";
import { ProbBar } from "./prob-bar";
import { TeamBadge, CompBadge } from "./team-badge";
import { TotalsChip } from "./totals-chip";
import { Badge } from "./ui/badge";
import { kickoffLong, leagueWithCountry } from "@/lib/format";
import { strengthCopy } from "@/lib/model";
import { useSlip } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { MatchView } from "@/lib/catalogue";

export function MatchCard({
  match,
  featured = false,
  pickRank,
}: {
  match: MatchView;
  featured?: boolean;
  pickRank?: number;
}) {
  const saved = useSlip((s) => s.saved.includes(match.fixture.id));
  const toggle = useSlip((s) => s.toggleSaved);
  const { fixture, home, away, pred } = match;
  const settled = fixture.status === "settled" && fixture.actualHome != null && fixture.actualAway != null;

  return (
    <article
      className={cn(
        "group relative rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)] sm:p-5",
        featured && "ring-1 ring-accent/40",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="inline-flex items-center gap-1.5">
            <CompBadge league={fixture.league} />
            {leagueWithCountry(fixture.league)}
          </Badge>
          <span className="text-xs tabular-nums text-muted">{kickoffLong(fixture.kickoff)}</span>
          {settled && (
            <Badge tone={match.hit ? "home" : "away"}>{match.hit ? "1X2 hit" : "1X2 miss"}</Badge>
          )}
          {pickRank ? (
            <Badge tone="accent">Pick {pickRank}</Badge>
          ) : featured ? (
            <Badge tone="accent">Pick of the day</Badge>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={saved ? "Remove from watchlist" : "Save to watchlist"}
          onClick={() => toggle(fixture.id)}
          className={cn(
            "relative size-11 shrink-0 rounded-sm text-muted transition-colors after:absolute after:inset-1/2 after:size-10 after:-translate-x-1/2 after:-translate-y-1/2 hover:text-fg",
            saved && "text-accent",
          )}
        >
          <Bookmark className="mx-auto size-4" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <Link
        to="/match/$id"
        params={{ id: fixture.id }}
        className="block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
      >
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <TeamBadge team={home} />
            <div className="min-w-0">
              <div className="truncate font-medium">{home.name}</div>
              <FormStrip form={home.form} />
            </div>
          </div>
          <div className="order-first text-center sm:order-none">
            {settled ? (
              <>
                <div className="font-display text-3xl tabular-nums leading-none tracking-tight">
                  {fixture.actualHome}–{fixture.actualAway}
                </div>
                <div className="mt-1 text-2xs uppercase tracking-widest text-subtle">
                  full time · model {pred.scoreHome}–{pred.scoreAway}
                </div>
              </>
            ) : (
              <>
                <div className="font-display text-3xl tabular-nums leading-none tracking-tight">
                  {pred.scoreHome}–{pred.scoreAway}
                </div>
                <div className="mt-1 text-2xs uppercase tracking-widest text-subtle">predicted</div>
              </>
            )}
          </div>
          <div className="flex min-w-0 items-center gap-3 sm:flex-row-reverse">
            <TeamBadge team={away} />
            <div className="min-w-0 sm:text-right">
              <div className="truncate font-medium">{away.name}</div>
              <div className="flex sm:justify-end">
                <FormStrip form={away.form} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <ProbBar pred={pred} />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <CallChip pred={pred} />
            <TotalsChip call={pred.totals15} />
            <TotalsChip call={pred.totals25} />
          </div>
          <div className="text-xs tabular-nums text-muted">
            xG {pred.lambdaHome.toFixed(2)} – {pred.lambdaAway.toFixed(2)}
            <span className="mx-2 text-subtle">·</span>
            {strengthCopy(pred.strength).label}
          </div>
        </div>
      </Link>
    </article>
  );
}
