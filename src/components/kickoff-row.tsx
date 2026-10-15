import { Bookmark } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CallChip } from "./call-chip";
import { ProbBar } from "./prob-bar";
import { StrengthChip } from "./strength-chip";
import { TeamBadge, CompBadge } from "./team-badge";
import { BttsChip, TotalsChip } from "./totals-chip";
import { Badge } from "./ui/badge";
import { displayClock, kickoffLabel, kickoffState, kickoffZone } from "@/lib/format";
import { countryFlag, LEAGUES } from "@/lib/types";
import { useSlip } from "@/lib/store";
import { scoreView } from "@/lib/tracking";
import { cn } from "@/lib/utils";
import type { MatchView } from "@/lib/catalogue";

export function KickoffRow({
  match,
  featured = false,
  pickRank,
  listId,
}: {
  match: MatchView;
  featured?: boolean;
  pickRank?: number;
  listId?: string;
}) {
  const bookmarks = useSlip((s) => s.saved);
  const lists = useSlip((s) => s.lists) ?? [];
  const toggleSaved = useSlip((s) => s.toggleSaved);
  const toggleInList = useSlip((s) => s.toggleInList);
  const inCustom = Boolean(listId && listId !== "auto" && listId !== "bookmarked");
  const saved = inCustom
    ? Boolean(lists.find((l) => l.id === listId)?.ids.includes(match.fixture.id))
    : bookmarks.includes(match.fixture.id);
  const toggle = () => {
    if (inCustom && listId) toggleInList(listId, match.fixture.id);
    else toggleSaved(match.fixture.id);
  };
  const live = useSlip((s) => s.live[match.fixture.id]);
  const logged = useSlip((s) => s.results[match.fixture.id]);
  useSlip((s) => s.beat);
  const overlay =
    logged
      ? scoreView(match, logged.home, logged.away)
      : match.fixture.status === "settled" && match.fixture.actualHome != null && match.fixture.actualAway != null
        ? match
        : null;
  const { fixture, home, away, pred } = overlay ?? match;
  const state = kickoffState(match.fixture, live, logged);
  const settled = state === "ft";
  const hit = Boolean(overlay?.hit);
  const exact = Boolean(overlay?.exactScore);
  const inPlay = state === "live";
  const clock = inPlay
    ? live?.clock || fixture.clock || displayClock(match.fixture.kickoff, live?.clock)
    : kickoffLabel(fixture.kickoff);
  const homeGoals = live?.home ?? fixture.actualHome;
  const awayGoals = live?.away ?? fixture.actualAway;
  const scoreText =
    settled || inPlay
      ? `${homeGoals ?? 0}–${awayGoals ?? 0}`
      : `${pred.scoreHome}–${pred.scoreAway}`;
  const scoreHint = settled
    ? `model ${pred.scoreHome}–${pred.scoreAway}`
    : inPlay
      ? `pred ${pred.scoreHome}–${pred.scoreAway}`
      : "predicted";
  const nextScores = [...pred.cells]
    .sort((a, b) => b.p - a.p)
    .filter((c) => !(c.home === pred.scoreHome && c.away === pred.scoreAway))
    .slice(0, 2);

  const meta = LEAGUES[fixture.league];
  if (!meta) return null;
  const flag = countryFlag(meta.country);

  return (
    <article
      className={cn(
        "relative min-w-0 rounded-lg bg-surface px-2 py-2 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)] sm:px-2.5 sm:py-2.5",
        featured && "ring-1 ring-accent/40",
        inPlay && "ring-1 ring-accent/35",
        settled && hit && "bg-home/12 ring-1 ring-home/45",
        settled && exact && "bg-home/18 ring-1 ring-home/60",
      )}
    >
      <div className="flex min-w-0 items-start gap-1.5 sm:gap-2">
        <div
          className={cn(
            "inline-flex min-w-12 shrink-0 flex-col items-center justify-center rounded-full px-2 py-1.5",
            inPlay ? "bg-home/25 text-home" : settled && hit ? "bg-home/20 text-home" : "bg-raised text-fg",
          )}
        >
          <time
            dateTime={fixture.kickoff}
            className="block font-display text-base leading-none tabular-nums tracking-tight sm:text-lg"
          >
            {clock}
          </time>
          <span className={cn("mt-0.5 text-2xs font-medium uppercase tracking-widest", inPlay ? "text-home/80" : "text-subtle")}>
            {settled ? "ft" : inPlay ? "live" : kickoffZone(fixture.kickoff)}
          </span>
        </div>

        <Link
          to="/match/$id"
          params={{ id: fixture.id }}
          className="min-w-0 flex-1 overflow-hidden rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
        >
          <div className="mb-1 flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-muted">
            <CompBadge league={fixture.league} />
            {flag ? <span aria-hidden>{flag}</span> : null}
            <span className="truncate font-medium">
              {meta.country}
              <span className="font-normal text-subtle"> · {meta.name}</span>
            </span>
            {pickRank ? (
              <Badge tone="accent">Pick {pickRank}</Badge>
            ) : featured ? (
              <Badge tone="accent">Pick of the day</Badge>
            ) : null}
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-1">
            <div className="flex min-w-0 flex-col items-center text-center">
              <TeamBadge team={home} size="sm" />
              <div className="mt-1 w-full text-xs font-medium leading-snug [overflow-wrap:anywhere]">{home.name}</div>
            </div>
            <div className="self-center px-1.5 text-xs font-medium uppercase tracking-widest text-subtle">v</div>
            <div className="flex min-w-0 flex-col items-center text-center">
              <TeamBadge team={away} size="sm" />
              <div className="mt-1 w-full text-xs font-medium leading-snug [overflow-wrap:anywhere]">{away.name}</div>
            </div>
          </div>
          {settled && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              <Badge tone={hit ? "home" : "away"} className={hit ? "bg-home text-bg" : undefined}>
                {exact ? "Exact" : hit ? "1X2 hit" : "1X2 miss"}
              </Badge>
            </div>
          )}
          <div className="mt-2 text-center">
            <div
              className={cn(
                "font-display text-xl tabular-nums leading-none tracking-tight",
                inPlay && "text-accent",
                settled && hit && "text-home",
              )}
            >
              {scoreText}
            </div>
            <div className="mt-0.5 text-2xs uppercase tracking-widest text-subtle">{scoreHint}</div>
            {nextScores.length > 0 && (
              <div className="mt-0.5 text-[10px] tabular-nums leading-none text-subtle/80">
                {nextScores.map((c) => `${c.home}–${c.away}`).join("  ·  ")}
              </div>
            )}
          </div>

          <div className="mt-2">
            <ProbBar pred={pred} board />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <CallChip pred={pred} size="lg" />
            <StrengthChip strength={pred.strength} />
            <TotalsChip call={pred.totals15} hit={settled ? overlay?.over15Hit : undefined} />
            <TotalsChip call={pred.totals25} hit={settled ? overlay?.over25Hit : undefined} />
            <BttsChip p={pred.btts} />
          </div>
        </Link>

        <button
          type="button"
          aria-label={
            saved
              ? inCustom
                ? "Remove from this list"
                : "Remove from bookmarked"
              : inCustom
                ? "Add to this list"
                : "Save to bookmarked"
          }
          onClick={() => toggle()}
          className={cn(
            "relative size-8 shrink-0 rounded-sm text-muted transition-colors after:absolute after:inset-1/2 after:size-10 after:-translate-x-1/2 after:-translate-y-1/2 hover:text-fg",
            saved && "text-accent",
          )}
        >
          <Bookmark className="mx-auto size-4" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
    </article>
  );
}
