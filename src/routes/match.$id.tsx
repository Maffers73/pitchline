import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Bookmark } from "lucide-react";
import { CallChip } from "@/components/call-chip";
import { FormStrip } from "@/components/form-strip";
import { PickToggle } from "@/components/pick-toggle";
import { ProbBar } from "@/components/prob-bar";
import { ScoreGrid } from "@/components/score-grid";
import { TeamBadge, CompBadge } from "@/components/team-badge";
import { Badge } from "@/components/ui/badge";
import { TotalsMarket } from "@/components/totals-chip";
import { EngineMixTable } from "@/components/engine-mix";
import { matchView } from "@/lib/catalogue";
import { findFeedView } from "@/lib/live-board";
import {
  decimalOdds,
  displayClock,
  kickoffLabel,
  kickoffLong,
  kickoffState,
  kickoffZone,
  leagueWithCountry,
} from "@/lib/format";
import { impliedFromDecimal, isValue, pct, reasonsFor, strengthCopy, ticketLabel, totalsShort } from "@/lib/model";
import { useSlip } from "@/lib/store";
import { scoreView } from "@/lib/tracking";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/match/$id")({
  component: MatchPage,
  notFoundComponent: () => (
    <div className="py-16 text-center">
      <h1 className="font-display text-3xl">Match not on the board</h1>
      <Link to="/" className="mt-4 inline-flex h-11 items-center text-accent">
        Back to the board
      </Link>
    </div>
  ),
});

function MatchPage() {
  const { id } = Route.useParams();
  const liveFeed = useSlip((s) => s.feed);
  const archive = useSlip((s) => s.archive);
  const feed = liveFeed.length ? liveFeed : archive;
  const match = findFeedView(feed, id) ?? matchView(id);
  if (!match) throw notFound();

  const logged = useSlip((s) => s.results[id]);
  const live = useSlip((s) => s.live[id]);
  useSlip((s) => s.beat);
  const scored = logged ? scoreView(match, logged.home, logged.away) : match;
  const { fixture, home, away, pred } = scored;
  const saved = useSlip((s) => s.saved.includes(id));
  const toggle = useSlip((s) => s.toggleSaved);
  const reasons = reasonsFor(home, away, pred);
  const strength = strengthCopy(pred.strength);
  const state = kickoffState(fixture, live, logged);
  const isFt = state === "ft";
  const inPlay = state === "live";
  const clock = inPlay
    ? live?.clock || fixture.clock || displayClock(fixture.kickoff, live?.clock)
    : kickoffLabel(fixture.kickoff);
  const homeGoals = live?.home ?? fixture.actualHome;
  const awayGoals = live?.away ?? fixture.actualAway;
  const market = [
    { k: "1" as const, p: pred.pHome, odds: fixture.oddsHome, label: home.name },
    { k: "X" as const, p: pred.pDraw, odds: fixture.oddsDraw, label: "Draw" },
    { k: "2" as const, p: pred.pAway, odds: fixture.oddsAway, label: away.name },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex h-11 items-center gap-2 text-sm text-muted hover:text-fg">
          <ArrowLeft className="size-4" /> Board
        </Link>
        <button
          type="button"
          onClick={() => toggle(id)}
          className={cn("inline-flex h-11 items-center gap-2 text-sm text-muted hover:text-fg", saved && "text-accent")}
        >
          <Bookmark className="size-4" fill={saved ? "currentColor" : "none"} />
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      <header className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <time
            dateTime={fixture.kickoff}
            className="font-display text-4xl leading-none tabular-nums tracking-tight sm:text-5xl"
          >
            {clock}
          </time>
          <div className="pb-1">
            <div className="text-xs uppercase tracking-widest text-subtle">
              {isFt ? "full time" : inPlay ? "live" : `kick-off ${kickoffZone(fixture.kickoff)}`}
            </div>
            <div className="text-sm text-muted">{kickoffLong(fixture.kickoff)}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="inline-flex items-center gap-1.5">
            <CompBadge league={fixture.league} />
            {leagueWithCountry(fixture.league)}
          </Badge>
          {fixture.note && <span className="text-xs text-subtle">{fixture.note}</span>}
        </div>
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <TeamBadge team={home} size="lg" />
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl tracking-tight sm:text-3xl">{home.name}</h1>
              <FormStrip form={home.form} />
            </div>
          </div>
          <div className="order-first text-center sm:order-none">
            <div className="font-display text-5xl tabular-nums leading-none tracking-tight">
              {isFt || inPlay
                ? `${homeGoals ?? 0}–${awayGoals ?? 0}`
                : `${pred.scoreHome}–${pred.scoreAway}`}
            </div>
            <div className="mt-2 text-xs uppercase tracking-widest text-subtle">
              {isFt ? "full time" : inPlay ? clock : "predicted score"}
            </div>
            {pred.cells.length > 0 && (
              <div className="mt-1 text-[11px] tabular-nums text-subtle">
                {[...pred.cells]
                  .sort((a, b) => b.p - a.p)
                  .filter((c) => !(c.home === pred.scoreHome && c.away === pred.scoreAway))
                  .slice(0, 2)
                  .map((c) => `${c.home}–${c.away}`)
                  .join("  ·  ")}
              </div>
            )}
          </div>
          <div className="flex min-w-0 items-center gap-3 sm:flex-row-reverse">
            <TeamBadge team={away} size="lg" />
            <div className="min-w-0 sm:text-right">
              <h1 className="truncate font-display text-2xl tracking-tight sm:text-3xl">{away.name}</h1>
              <div className="flex sm:justify-end">
                <FormStrip form={away.form} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <CallChip pred={pred} />
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              tone={pred.strength === "strong" ? "home" : pred.strength === "lean" ? "draw" : "muted"}
            >
              {strength.label}
            </Badge>
            <span className="text-sm text-muted">{strength.blurb}</span>
          </div>
        </div>
      </header>

      {isFt ? (
        <div
          className={cn(
            "rounded-lg px-4 py-3 text-sm font-medium",
            scored.hit ? "bg-home/18 text-home ring-1 ring-home/40" : "bg-away/10 text-away",
          )}
        >
          Finished {fixture.actualHome}–{fixture.actualAway}. {strength.label} ticket {pred.ticket} (
          {ticketLabel(pred.ticket)}) — {scored.exactScore ? "exact hit" : scored.hit ? "hit" : "miss"}.{" "}
          {totalsShort(pred.totals15)} {scored.over15Hit ? "hit" : "miss"} · {totalsShort(pred.totals25)}{" "}
          {scored.over25Hit ? "hit" : "miss"}.
        </div>
      ) : inPlay ? (
        <div className="rounded-lg bg-accent/10 px-4 py-3 text-sm text-accent">
          Live {live?.home ?? 0}–{live?.away ?? 0} · {clock}. Full time logs itself.
        </div>
      ) : (
        <div className="rounded-lg bg-raised px-4 py-3 text-sm text-muted">
          Kick-off {kickoffLabel(fixture.kickoff)} {kickoffZone(fixture.kickoff)}. The live score and match clock
          appear when it starts — leave Pitchline open and it updates itself.
        </div>
      )}

      <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="mb-4 font-display text-xl tracking-tight">1X2</h2>
        <ProbBar pred={pred} />
        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          {market.map((row) => {
            const implied = impliedFromDecimal(row.odds);
            const value = isValue(row.p, row.odds);
            return (
              <div key={row.k} className="rounded-md bg-raised p-3">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>
                    {row.k} · {row.label}
                  </span>
                  {value && <Badge tone="accent">Value</Badge>}
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <div className="text-2xs uppercase tracking-widest text-subtle">Model</div>
                    <div className="font-display text-2xl tabular-nums">{pct(row.p)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xs uppercase tracking-widest text-subtle">Market</div>
                    <div className="tabular-nums text-muted">
                      {decimalOdds(row.odds)} · {pct(implied)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-medium">How this call is built</h3>
          <p className="mb-3 text-xs text-muted">
            Predicted score and over/under come from each side’s expected goals. The 1X2 ticket also weighs club
            strength and, when a price is on the feed, the book.
          </p>
          <EngineMixTable pred={pred} homeElo={home.elo} awayElo={away.elo} />
        </div>
      </section>

      <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="mb-4 font-display text-xl tracking-tight">Over / under</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <TotalsMarket
            call={pred.totals15}
            homeGoals={isFt ? fixture.actualHome : undefined}
            awayGoals={isFt ? fixture.actualAway : undefined}
          />
          <TotalsMarket
            call={pred.totals25}
            homeGoals={isFt ? fixture.actualHome : undefined}
            awayGoals={isFt ? fixture.actualAway : undefined}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-6">
          <ScoreGrid pred={pred} />
        </div>
        <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-6">
          <h2 className="mb-3 font-display text-xl tracking-tight">Why this call</h2>
          <ol className="space-y-3">
            {reasons.map((line, i) => (
              <li key={line} className="flex gap-3 text-sm text-muted">
                <span className="font-mono text-xs tabular-nums text-subtle">{String(i + 1).padStart(2, "0")}</span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <Stat label="BTTS" value={pct(pred.btts)} />
            <Stat label="xG" value={`${pred.lambdaHome.toFixed(2)} – ${pred.lambdaAway.toFixed(2)}`} />
            <Stat label="Attack H / A" value={`${home.attack.toFixed(2)} / ${away.attack.toFixed(2)}`} />
            <Stat label="Defence H / A" value={`${home.defense.toFixed(2)} / ${away.defense.toFixed(2)}`} />
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-6">
        <h2 className="mb-1 font-display text-xl tracking-tight">Your 1X2</h2>
        <p className="mb-4 text-sm text-muted">Lock a column for the slip. Stored on this device only.</p>
        <PickToggle matchId={id} />
      </section>

      <p className="text-xs text-subtle">{fixture.venue}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-raised p-3">
      <div className="text-2xs uppercase tracking-widest text-subtle">{label}</div>
      <div className="mt-1 font-medium tabular-nums">{value}</div>
    </div>
  );
}
