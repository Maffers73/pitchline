import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CallChip } from "@/components/call-chip";
import { FormStrip } from "@/components/form-strip";
import { ProbBar } from "@/components/prob-bar";
import { ScoreGrid } from "@/components/score-grid";
import { TeamBadge } from "@/components/team-badge";
import { TotalsChip, TotalsMarket } from "@/components/totals-chip";
import { EngineMixTable } from "@/components/engine-mix";
import { Button } from "@/components/ui/button";
import { TEAMS } from "@/lib/data/teams";
import { labTeamsFor, leaguesByCountry, mergeLabRoster, LEAGUE_ORDER } from "@/lib/catalogue";
import { viewFromEspn } from "@/lib/live-board";
import { predict, reasonsFor } from "@/lib/model";
import { useSlip } from "@/lib/store";
import { LEAGUES, type LeagueId, type Team } from "@/lib/types";

export const Route = createFileRoute("/lab")({
  beforeLoad: async () => {
    // TODO: wire real session + checkSubscription
    // For locked lab: throw redirect({ to: "/pricing" });
  },
  component: LabPage,
});

function LabPage() {
  const feed = useSlip((s) => s.feed);
  const roster = useMemo(() => {
    const extra: Team[] = [];
    const seen = new Set<string>();
    for (const row of feed) {
      const view = viewFromEspn(row);
      for (const t of [view.home, view.away]) {
        if (seen.has(t.id)) continue;
        seen.add(t.id);
        extra.push(t);
      }
    }
    return mergeLabRoster(extra);
  }, [feed]);
  const leagues = useMemo(() => {
    const have = new Set<LeagueId>();
    for (const id of LEAGUE_ORDER) {
      if (labTeamsFor(id, roster).length) have.add(id);
    }
    return LEAGUE_ORDER.filter((id) => have.has(id));
  }, [roster]);

  const [homeLeague, setHomeLeague] = useState<LeagueId>("EPL");
  const [awayLeague, setAwayLeague] = useState<LeagueId>("EPL");
  const [homeId, setHomeId] = useState("ars");
  const [awayId, setAwayId] = useState("cov");
  const [neutral, setNeutral] = useState(false);

  const homeList = labTeamsFor(homeLeague, roster);
  const awayList = labTeamsFor(awayLeague, roster);
  const home = homeList.find((t) => t.id === homeId) ?? TEAMS.find((t) => t.id === homeId) ?? homeList[0]!;
  const away = awayList.find((t) => t.id === awayId) ?? TEAMS.find((t) => t.id === awayId) ?? awayList[0]!;

  const pred = useMemo(() => predict(home, away, { neutral }), [home, away, neutral]);
  const reasons = reasonsFor(home, away, pred);
  const same = home.id === away.id;

  function firstIn(league: LeagueId, skip?: string) {
    const list = labTeamsFor(league, roster);
    return list.find((t) => t.id !== skip)?.id ?? list[0]?.id ?? "";
  }

  function changeHomeLeague(id: LeagueId) {
    setHomeLeague(id);
    setHomeId(firstIn(id, awayId));
  }

  function changeAwayLeague(id: LeagueId) {
    setAwayLeague(id);
    setAwayId(firstIn(id, homeId));
  }

  function swap() {
    setHomeLeague(awayLeague);
    setAwayLeague(homeLeague);
    setHomeId(away.id);
    setAwayId(home.id);
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Lab</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Any league, any club</h1>
        <p className="mt-2 max-w-xl text-muted">
          Pick any two European clubs and see the same kind of call as the board: 1X2, predicted score, and over/under.
          Clubs from today’s board are included alongside the catalogue.
        </p>
      </header>

      <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-3">
            <LeagueSelect label="Home league" value={homeLeague} onChange={changeHomeLeague} leagues={leagues} />
            <TeamSelect label="Home" value={home.id} onChange={setHomeId} teams={homeList} />
          </div>
          <div className="flex items-end justify-center">
            <Button variant="secondary" onClick={swap} className="w-full sm:w-auto">
              Swap
            </Button>
          </div>
          <div className="space-y-3">
            <LeagueSelect label="Away league" value={awayLeague} onChange={changeAwayLeague} leagues={leagues} />
            <TeamSelect label="Away" value={away.id} onChange={setAwayId} teams={awayList} />
          </div>
        </div>
        <label className="mt-4 flex h-11 items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={neutral}
            onChange={(e) => setNeutral(e.target.checked)}
            className="size-4 accent-accent"
          />
          Neutral venue — strip the home multiplier
        </label>
      </section>

      {same || !homeList.length || !awayList.length ? (
        <p className="rounded-lg bg-raised px-4 py-6 text-center text-muted">
          {!homeList.length || !awayList.length ? "No clubs in that competition yet." : "Pick two different clubs."}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <TeamBadge team={home} size="lg" />
              <div className="min-w-0">
                <div className="truncate font-display text-2xl tracking-tight">{home.name}</div>
                <div className="text-xs text-subtle">
                  {LEAGUES[home.league].country} · {LEAGUES[home.league].name}
                </div>
                <FormStrip form={home.form} />
              </div>
            </div>
            <div className="order-first text-center sm:order-none">
              <div className="font-display text-5xl tabular-nums leading-none">
                {pred.scoreHome}–{pred.scoreAway}
              </div>
              <div className="mt-2 text-xs uppercase tracking-widest text-subtle">predicted</div>
            </div>
            <div className="flex min-w-0 items-center gap-3 sm:flex-row-reverse">
              <TeamBadge team={away} size="lg" />
              <div className="min-w-0 sm:text-right">
                <div className="truncate font-display text-2xl tracking-tight">{away.name}</div>
                <div className="text-xs text-subtle">
                  {LEAGUES[away.league].country} · {LEAGUES[away.league].name}
                </div>
                <div className="flex sm:justify-end">
                  <FormStrip form={away.form} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CallChip pred={pred} />
            <TotalsChip call={pred.totals15} size="md" />
            <TotalsChip call={pred.totals25} size="md" />
          </div>
          <ProbBar pred={pred} />
          <EngineMixTable pred={pred} homeElo={home.elo} awayElo={away.elo} />
          <div className="grid gap-3 sm:grid-cols-2">
            <TotalsMarket call={pred.totals15} />
            <TotalsMarket call={pred.totals25} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-6">
              <ScoreGrid pred={pred} />
            </div>
            <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-6">
              <h2 className="mb-3 font-display text-xl tracking-tight">Why this call</h2>
              <ol className="space-y-2 text-sm text-muted">
                {reasons.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    <span>{line}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LeagueSelect({
  label,
  value,
  onChange,
  leagues,
}: {
  label: string;
  value: LeagueId;
  onChange: (id: LeagueId) => void;
  leagues: LeagueId[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-subtle">{label}</span>
      <select
        value={leagues.includes(value) ? value : leagues[0]}
        onChange={(e) => onChange(e.target.value as LeagueId)}
        className="h-12 w-full rounded-sm bg-raised px-3 text-sm text-fg shadow-[var(--shadow-border)] outline-none focus:ring-2 focus:ring-ring/70"
      >
        {leaguesByCountry(leagues).map((group) => (
          <optgroup key={group.country} label={group.country}>
            {group.leagues.map((id) => (
              <option key={id} value={id}>
                {LEAGUES[id].name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

function TeamSelect({
  label,
  value,
  onChange,
  teams,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  teams: Team[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-subtle">{label}</span>
      <select
        value={teams.some((t) => t.id === value) ? value : teams[0]?.id}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-sm bg-raised px-3 text-sm text-fg shadow-[var(--shadow-border)] outline-none focus:ring-2 focus:ring-ring/70"
      >
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </label>
  );
}
