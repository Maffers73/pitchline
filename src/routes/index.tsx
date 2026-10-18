import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo } from "react";
import { KickoffRow } from "@/components/kickoff-row";
import { CompBadge } from "@/components/team-badge";
import { Badge } from "@/components/ui/badge";
import { isLeagueId, leaguesOfCountry, leaguesOnContinent, countriesOnContinent, picksOfDay, type BoardTab, type MatchView } from "@/lib/catalogue";
import { boardFromFeed, feedLeagues } from "@/lib/live-board";
import { kickoffZone, kickoffState, kickoffLabel, londonDateHeading, todayKeyNow, tomorrowKeyNow, yesterdayKeyNow } from "@/lib/format";
import { isStrength, pct, strengthCopy, STRENGTHS, type Strength, type TotalsSide } from "@/lib/model";
import { useSlip, type LiveScore, type LoggedScore } from "@/lib/store";
import { monthlyBooks, scoreView, trackableViews } from "@/lib/tracking";
import { CONTINENT_ORDER, COUNTRY_ORDER, LEAGUES, compareBoard, continentChipLabel, countryFlag, isContinent, type Continent, type LeagueId } from "@/lib/types";
import { cn } from "@/lib/utils";

type Search = {
  leagues?: string;
  country?: string;
  continent?: string;
  day?: string;
  strength?: string;
  list?: string;
  o15?: string;
  o25?: string;
  btts?: string;
  minp?: string;
  picks?: string;
};

const MIN_P = [60, 70, 80] as const;

function parseSide(raw?: string): TotalsSide | undefined {
  return raw === "over" || raw === "under" ? raw : undefined;
}

function parseBtts(raw?: string): "yes" | "no" | undefined {
  return raw === "yes" || raw === "no" ? raw : undefined;
}

function parseMinP(raw?: string): number | undefined {
  const n = Number(raw);
  return MIN_P.includes(n as (typeof MIN_P)[number]) ? n : undefined;
}

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    leagues: typeof s.leagues === "string" ? s.leagues : undefined,
    country: typeof s.country === "string" ? s.country : undefined,
    continent: typeof s.continent === "string" ? s.continent : undefined,
    day: s.day === "tomorrow" ? "tomorrow" : s.day === "today" ? "today" : undefined,
    strength: typeof s.strength === "string" && isStrength(s.strength) ? s.strength : undefined,
    list: typeof s.list === "string" ? s.list : undefined,
    o15: parseSide(typeof s.o15 === "string" ? s.o15 : undefined),
    o25: parseSide(typeof s.o25 === "string" ? s.o25 : undefined),
    btts: parseBtts(typeof s.btts === "string" ? s.btts : undefined),
    minp: typeof s.minp === "string" ? s.minp : undefined,
    picks: s.picks === "1" ? "1" : undefined,
  }),
  component: Home,
});

function parseLeagues(raw?: string): LeagueId[] {
  if (!raw) return [];
  const seen = new Set<LeagueId>();
  for (const part of raw.split(",")) {
    const id = part.trim();
    if (isLeagueId(id)) seen.add(id);
  }
  return [...seen];
}

function classify(
  source: MatchView[],
  results: Record<string, LoggedScore>,
  liveMap: Record<string, LiveScore>,
) {
  const liveRows: MatchView[] = [];
  const ftRows: MatchView[] = [];
  const upcomingRows: MatchView[] = [];
  for (const m of source) {
    const logged = results[m.fixture.id];
    const live = liveMap[m.fixture.id];
    const state = kickoffState(m.fixture, live, logged);
    const view = logged ? scoreView(m, logged.home, logged.away) : m;
    if (state === "live") liveRows.push(view);
    else if (state === "ft") ftRows.push(view);
    else upcomingRows.push(view);
  }
  const byBoard = (a: MatchView, b: MatchView) => compareBoard(a.fixture, b.fixture);
  liveRows.sort(byBoard);
  ftRows.sort(byBoard);
  upcomingRows.sort(byBoard);
  return { liveRows, ftRows, upcomingRows };
}

function countryTally(
  source: MatchView[],
  results: Record<string, LoggedScore>,
  liveMap: Record<string, LiveScore>,
) {
  const out = new Map<string, { live: number; left: number }>();
  for (const m of source) {
    const meta = LEAGUES[m.fixture.league];
    if (!meta) continue;
    const country = meta.country;
    const rec = out.get(country) ?? { live: 0, left: 0 };
    const state = kickoffState(m.fixture, liveMap[m.fixture.id], results[m.fixture.id]);
    if (state === "live") rec.live += 1;
    else if (state !== "ft") rec.left += 1;
    else continue;
    out.set(country, rec);
  }
  return out;
}

function playLabel(live: number, left: number) {
  const bits: string[] = [];
  if (live) bits.push(`${live} in play`);
  if (left) bits.push(`${left} to play`);
  if (!bits.length) return "done";
  return bits.join(" · ");
}

function Home() {
  const {
    leagues: raw,
    country: rawCountry,
    continent: rawContinent,
    day: rawDay,
    strength: rawStrength,
    o15: rawO15,
    o25: rawO25,
    btts: rawBtts,
    minp: rawMinP,
    picks: rawPicks,
  } = Route.useSearch();
  const liveFeed = useSlip((s) => s.feed);
  const archive = useSlip((s) => s.archive);
  const watching = useSlip((s) => s.watching);
  const rememberPicks = useSlip((s) => s.rememberPicks);
  const dayPicks = useSlip((s) => s.dayPicks);
  const feed = liveFeed.length ? liveFeed : archive;
  const espnRows = [...archive, ...feed];
  const tab: BoardTab = rawDay === "tomorrow" ? "tomorrow" : "today";
  const strengthFilter: Strength | undefined = rawStrength && isStrength(rawStrength) ? rawStrength : undefined;
  const o15Filter = parseSide(rawO15);
  const o25Filter = parseSide(rawO25);
  const bttsFilter = parseBtts(rawBtts);
  const minP = parseMinP(rawMinP);
  const picksFilter = rawPicks === "1";
  const selected = parseLeagues(raw);
  const available = feed.length ? feedLeagues(feed, tab) : [];
  const continentFilter: Continent | undefined = isContinent(rawContinent)
    ? rawContinent
    : rawCountry === "Europe"
      ? "Europe"
      : undefined;
  const countryFilter = COUNTRY_ORDER.includes(rawCountry as (typeof COUNTRY_ORDER)[number])
    ? (rawCountry as string)
    : undefined;
  const continentLeagues = continentFilter ? leaguesOnContinent(available, continentFilter) : available;
  const continentCountries = continentFilter ? [...countriesOnContinent(continentFilter)] : [];
  const countryLeagues = countryFilter
    ? continentFilter
      ? leaguesOfCountry(countryFilter)
      : continentLeagues.filter((id) => LEAGUES[id].country === countryFilter)
    : continentLeagues;
  const filterLeagues = selected.length
    ? selected.filter((id) => countryLeagues.includes(id))
    : continentFilter || countryFilter
      ? countryLeagues
      : [];
  const results = useSlip((s) => s.results);
  const liveMap = useSlip((s) => s.live);
  const savedIds = useSlip((s) => s.saved);
  const listIds = watching === "bookmarked" ? new Set(savedIds) : null;
  const listLabel = watching === "bookmarked" ? "Bookmarked" : null;
  const months = useMemo(() => monthlyBooks(trackableViews(espnRows), results), [archive, liveFeed, results]);
  const yesterdayBook = months
    .flatMap((m) => m.days)
    .find((b) => b.key === yesterdayKeyNow());

  const leagueFilter = watching === "bookmarked" ? [] : filterLeagues;
  const todayBase = useMemo(() => (feed.length ? boardFromFeed(feed, [], "today") : []), [feed]);
  const tomorrowBase = useMemo(() => (feed.length ? boardFromFeed(feed, [], "tomorrow") : []), [feed]);
  const todayPool = leagueFilter.length
    ? todayBase.filter((m) => leagueFilter.includes(m.fixture.league))
    : todayBase;
  const tomorrowPool = leagueFilter.length
    ? tomorrowBase.filter((m) => leagueFilter.includes(m.fixture.league))
    : tomorrowBase;
  const todayAll = listIds ? todayPool.filter((m) => listIds.has(m.fixture.id)) : todayPool;
  const tomorrowAll = listIds ? tomorrowPool.filter((m) => listIds.has(m.fixture.id)) : tomorrowPool;
  const countSource = tab === "tomorrow" ? tomorrowBase : todayBase;
  const tally = countryTally(countSource, results, liveMap);
  const todayClassified = classify(todayAll, results, liveMap);
  const tomorrowClassified = classify(tomorrowAll, results, liveMap);
  const tabAll = tab === "tomorrow" ? tomorrowAll : todayAll;
  const pickPool = (tab === "tomorrow" ? tomorrowBase : todayBase).filter((m) => m.pred.strength === "strong");
  const tabKey = tab === "tomorrow" ? tomorrowKeyNow() : todayKeyNow();
  const frozenIds = dayPicks[tabKey];
  const computedPicks = picksOfDay(pickPool, 5);
  const boardForTab = tab === "tomorrow" ? tomorrowBase : todayBase;
  const frozenPicks = frozenIds?.length
    ? boardForTab
        .filter((m) => frozenIds.includes(m.fixture.id) && m.pred.strength === "strong")
        .sort((a, b) => frozenIds.indexOf(a.fixture.id) - frozenIds.indexOf(b.fixture.id))
    : [];
  const picks = frozenPicks.length === frozenIds?.length ? frozenPicks : computedPicks;
  useEffect(() => {
    const todayIds = picksOfDay(
      todayBase.filter((m) => m.pred.strength === "strong"),
      5,
    ).map((m) => m.fixture.id);
    const tomorrowIds = picksOfDay(
      tomorrowBase.filter((m) => m.pred.strength === "strong"),
      5,
    ).map((m) => m.fixture.id);
    const stale = (key: string, rows: MatchView[]) => {
      const stored = useSlip.getState().dayPicks[key];
      if (!stored?.length) return false;
      return stored.some((id) => {
        const match = rows.find((m) => m.fixture.id === id);
        return match != null && match.pred.strength !== "strong";
      });
    };
    rememberPicks(todayKeyNow(), todayIds, stale(todayKeyNow(), todayBase));
    rememberPicks(tomorrowKeyNow(), tomorrowIds, stale(tomorrowKeyNow(), tomorrowBase));
  }, [todayBase, tomorrowBase, rememberPicks]);
  const pickRank: Record<string, number> = {};
  picks.forEach((m, i) => {
    pickRank[m.fixture.id] = i + 1;
  });
  const pickIds = new Set(picks.map((m) => m.fixture.id));
  const afterStrength = strengthFilter ? tabAll.filter((m) => m.pred.strength === strengthFilter) : tabAll;
  const filtered = afterStrength.filter((m) => {
    if (picksFilter && !pickIds.has(m.fixture.id)) return false;
    if (o15Filter && m.pred.totals15.side !== o15Filter) return false;
    if (o25Filter && m.pred.totals25.side !== o25Filter) return false;
    if (bttsFilter === "yes" && m.pred.btts < 0.5) return false;
    if (bttsFilter === "no" && m.pred.btts >= 0.5) return false;
    if (minP) {
      if (o15Filter || o25Filter || bttsFilter) {
        if (o15Filter && m.pred.totals15.p * 100 < minP) return false;
        if (o25Filter && m.pred.totals25.p * 100 < minP) return false;
        if (bttsFilter === "yes" && m.pred.btts * 100 < minP) return false;
        if (bttsFilter === "no" && (1 - m.pred.btts) * 100 < minP) return false;
      } else if (m.pred.ticketP * 100 < minP) return false;
    }
    return true;
  });
  const { liveRows, upcomingRows } = classify(filtered, results, liveMap);
  const todayN = todayClassified.liveRows.length + todayClassified.upcomingRows.length;
  const tomorrowN = tomorrowClassified.liveRows.length + tomorrowClassified.upcomingRows.length;
  const strengthCounts = {
    strong: tabAll.filter((m) => m.pred.strength === "strong").length,
    lean: tabAll.filter((m) => m.pred.strength === "lean").length,
    "toss-up": tabAll.filter((m) => m.pred.strength === "toss-up").length,
  };
  const ou15Counts = {
    over: afterStrength.filter((m) => m.pred.totals15.side === "over").length,
    under: afterStrength.filter((m) => m.pred.totals15.side === "under").length,
  };
  const ou25Counts = {
    over: afterStrength.filter((m) => m.pred.totals25.side === "over").length,
    under: afterStrength.filter((m) => m.pred.totals25.side === "under").length,
  };
  const bttsCounts = {
    yes: afterStrength.filter((m) => m.pred.btts >= 0.5).length,
    no: afterStrength.filter((m) => m.pred.btts < 0.5).length,
  };

  const countryComps = countryFilter ? leaguesOfCountry(countryFilter) : [];
  const zone = upcomingRows[0]
    ? kickoffZone(upcomingRows[0].fixture.kickoff)
    : liveRows[0]
      ? kickoffZone(liveRows[0].fixture.kickoff)
      : "BST";

  function toggle(id: LeagueId) {
    const pool = selected.filter((x) => countryLeagues.includes(x));
    const next = pool.includes(id) ? pool.filter((x) => x !== id) : [...pool, id];
    return next;
  }

  function searchFor(
    ids: LeagueId[],
    country?: string,
    day: BoardTab = tab,
    strength?: Strength,
    continent: string | undefined = continentFilter,
    extras?: { o15?: TotalsSide | null; o25?: TotalsSide | null; btts?: "yes" | "no" | null; minp?: number | null; picks?: boolean | null },
  ) {
    const next: Search = { day };
    if (continent) next.continent = continent;
    if (country) next.country = country;
    if (ids.length) next.leagues = ids.join(",");
    if (strength) next.strength = strength;
    const o15 = extras && "o15" in extras ? extras.o15 : o15Filter;
    const o25 = extras && "o25" in extras ? extras.o25 : o25Filter;
    const btts = extras && "btts" in extras ? extras.btts : bttsFilter;
    const keepMin = extras && "minp" in extras ? extras.minp : minP;
    const keepPicks = extras && "picks" in extras ? extras.picks : picksFilter;
    if (o15) next.o15 = o15;
    if (o25) next.o25 = o25;
    if (btts) next.btts = btts;
    if (keepMin) next.minp = String(keepMin);
    if (keepPicks) next.picks = "1";
    return next;
  }

  return (
    <div className="space-y-8">
      <section className="rise-in">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">
          {londonDateHeading()} · {zone}
        </p>
        <h1 className="mt-2 max-w-2xl font-display text-4xl leading-tight tracking-tight sm:text-5xl">
          Pitchline: Football 1X2 Predictor App
        </h1>
        <p className="mt-3 max-w-xl text-muted">
          Today and tomorrow’s fixtures, each with a 1X2 ticket, a predicted score and over/under. Kick-off times in{" "}
          {zone}. Live scores and the clock fill in while a game is on — full times write themselves to Accuracy.
        </p>
      </section>

      {yesterdayBook && yesterdayBook.logged > 0 && tab === "today" && (
        <Link
          to="/outcomes"
          search={{ month: yesterdayBook.key.slice(0, 7), day: yesterdayBook.key }}
          className="block rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] transition-[box-shadow] hover:shadow-[var(--shadow-border-hover)]"
        >
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-widest text-subtle">Yesterday</div>
              <div className="mt-0.5 font-display text-2xl tracking-tight">
                {yesterdayBook.hits}/{yesterdayBook.logged} tickets
                <span className="ml-2 text-lg text-muted">{pct(yesterdayBook.hitRate)}</span>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm text-accent">
              Book <ArrowRight className="size-4" />
            </span>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {yesterdayBook.settled.map((m) => (
              <div
                key={m.fixture.id}
                className={cn(
                  "min-w-24 shrink-0 rounded-md px-2.5 py-2",
                  m.hit
                    ? m.exactScore
                      ? "bg-home/25 ring-1 ring-home/55"
                      : "bg-home/18 ring-1 ring-home/40"
                    : "bg-raised",
                )}
              >
                <div className="truncate text-2xs text-subtle">
                  {m.home.name} v {m.away.name}
                </div>
                <div
                  className={cn(
                    "font-display text-lg tabular-nums leading-none",
                    m.hit && "text-home",
                  )}
                >
                  {m.fixture.actualHome}–{m.fixture.actualAway}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={cn(
                      "text-2xs font-medium",
                      m.hit ? "text-home" : "text-away",
                    )}
                  >
                    {m.exactScore ? "Exact" : m.hit ? "Hit" : "Miss"}
                  </span>
                  <span className="text-2xs text-subtle">{strengthCopy(m.pred.strength).label}</span>
                </div>
              </div>
            ))}
          </div>
        </Link>
      )}

      <section className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/"
            search={searchFor(selected, countryFilter, "today", strengthFilter)}
            aria-pressed={tab === "today"}
            className={cn(
              "flex h-14 flex-col items-center justify-center rounded-lg transition-colors",
              tab === "today" ? "bg-primary text-primary-fg" : "bg-raised text-muted hover:text-fg",
            )}
          >
            <span className="font-display text-lg leading-none tracking-tight">Today</span>
            <span className={cn("mt-1 text-2xs tabular-nums", tab === "today" ? "text-primary-fg/70" : "text-subtle")}>
              {todayN} fixtures
              {todayClassified.liveRows.length ? ` · ${todayClassified.liveRows.length} live` : ""}
            </span>
          </Link>
          <Link
            to="/"
            search={searchFor(selected, countryFilter, "tomorrow", strengthFilter)}
            aria-pressed={tab === "tomorrow"}
            className={cn(
              "flex h-14 flex-col items-center justify-center rounded-lg transition-colors",
              tab === "tomorrow" ? "bg-primary text-primary-fg" : "bg-raised text-muted hover:text-fg",
            )}
          >
            <span className="font-display text-lg leading-none tracking-tight">Tomorrow</span>
            <span className={cn("mt-1 text-2xs tabular-nums", tab === "tomorrow" ? "text-primary-fg/70" : "text-subtle")}>
              {tomorrowN} fixtures
            </span>
          </Link>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-2xl tracking-tight">
            {listLabel ? `${listLabel} · ${tab === "tomorrow" ? "Tomorrow" : "Today"}` : tab === "tomorrow" ? "Tomorrow" : "Today"}
          </h2>
          <p className="text-sm text-muted">
            {upcomingRows.length} to play
            {liveRows.length ? ` · ${liveRows.length} in play` : ""}
            {picksFilter ? " · picks of the day" : ""}
            {strengthFilter ? ` · ${strengthCopy(strengthFilter).label}` : ""}
            {o15Filter ? ` · ${o15Filter === "over" ? "O" : "U"} 1.5` : ""}
            {o25Filter ? ` · ${o25Filter === "over" ? "O" : "U"} 2.5` : ""}
            {bttsFilter ? ` · BTTS ${bttsFilter === "yes" ? "Yes" : "No"}` : ""}
            {minP ? ` · ${minP}%+` : ""}
            {countryFilter
              ? ` · ${countryFilter} ${playLabel(tally.get(countryFilter)?.live ?? 0, tally.get(countryFilter)?.left ?? 0)}`
              : ""}
            {` · ${zone}`}
          </p>
        </div>
        <div role="group" aria-label="Continents" className="flex flex-wrap gap-2">
          <Link
            to="/"
            search={searchFor([], undefined, tab, strengthFilter, undefined)}
            aria-pressed={!continentFilter && !countryFilter && selected.length === 0}
            className={cn(
              "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors",
              !continentFilter && !countryFilter && selected.length === 0
                ? "bg-accent text-bg"
                : "bg-raised text-muted hover:text-fg",
            )}
          >
            All continents
          </Link>
          {CONTINENT_ORDER.map((continent) => {
            const on = continentFilter === continent && !countryFilter && selected.length === 0;
            let liveN = 0;
            let leftN = 0;
            let any = false;
            for (const country of countriesOnContinent(continent)) {
              const rec = tally.get(country);
              if (!rec) continue;
              any = true;
              liveN += rec.live;
              leftN += rec.left;
            }
            if (!any && !on) return null;
            return (
              <Link
                key={continent}
                to="/"
                search={searchFor([], undefined, tab, strengthFilter, continent)}
                aria-pressed={on}
                className={cn(
                  "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors",
                  continentFilter === continent ? "bg-accent text-bg" : "bg-raised text-muted hover:text-fg",
                )}
              >
                {continentChipLabel(continent)}
                <span className={cn("ml-1.5 text-2xs tabular-nums", on ? "text-bg/70" : "text-subtle")}>
                  {playLabel(liveN, leftN)}
                </span>
              </Link>
            );
          })}
        </div>
        {continentFilter && (
          <div role="group" aria-label={`${continentFilter} countries`} className="flex flex-wrap gap-2">
            <Link
              to="/"
              search={searchFor([], undefined, tab, strengthFilter, continentFilter)}
              aria-pressed={!countryFilter && selected.length === 0}
              className={cn(
                "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors",
                !countryFilter && selected.length === 0
                  ? "bg-primary text-primary-fg"
                  : "bg-raised text-muted hover:text-fg",
              )}
            >
              All {continentChipLabel(continentFilter)}
              <span
                className={cn(
                  "ml-1.5 text-2xs tabular-nums",
                  !countryFilter && selected.length === 0 ? "text-primary-fg/70" : "text-subtle",
                )}
              >
                {playLabel(
                  continentCountries.reduce((n, c) => n + (tally.get(c)?.live ?? 0), 0),
                  continentCountries.reduce((n, c) => n + (tally.get(c)?.left ?? 0), 0),
                )}
              </span>
            </Link>
            {continentCountries.map((country) => {
              const on = countryFilter === country;
              const rec = tally.get(country);
              if ((!rec || rec.live + rec.left === 0) && !on) return null;
              const counts = rec ?? { live: 0, left: 0 };
              return (
                <Link
                  key={country}
                  to="/"
                  search={searchFor([], country, tab, strengthFilter, continentFilter)}
                  aria-pressed={on}
                  className={cn(
                    "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors",
                    on ? "bg-primary text-primary-fg" : "bg-raised text-muted hover:text-fg",
                  )}
                >
                  {countryFlag(country) ? `${countryFlag(country)} ${country}` : country}
                  <span className={cn("ml-1.5 text-2xs tabular-nums", on ? "text-primary-fg/70" : "text-subtle")}>
                    {playLabel(counts.live, counts.left)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
        {countryFilter && countryComps.length > 0 && (
          <div role="group" aria-label={`${countryFilter} competitions`} className="flex flex-wrap gap-2">
            {countryComps.map((id) => {
              const on = selected.includes(id);
              const live = available.includes(id);
              return (
                <Link
                  key={id}
                  to="/"
                  search={searchFor(toggle(id), countryFilter, tab, strengthFilter, continentFilter)}
                  aria-pressed={on}
                  title={`${LEAGUES[id].country} · ${LEAGUES[id].name}`}
                  className={cn(
                    "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors",
                    on ? "bg-primary text-primary-fg" : "bg-raised text-muted hover:text-fg",
                    !live && !on && "opacity-70",
                  )}
                >
                  <span aria-hidden>{countryFlag(LEAGUES[id].country)}</span>
                  <CompBadge league={id} />
                  <span className="ml-1.5">{LEAGUES[id].name}</span>
                </Link>
              );
            })}
          </div>
        )}
        {(continentFilter || countryFilter) && (
          <p className="text-xs text-subtle">
            {continentFilter ?? "All"}
            {countryFilter ? ` · ${countryFilter}` : ""}
            {selected.length > 0
              ? ` · ${selected.map((id) => LEAGUES[id].name).join(" · ")}`
              : countryFilter
                ? ` · all ${countryComps.length} competitions · ${playLabel(tally.get(countryFilter)?.live ?? 0, tally.get(countryFilter)?.left ?? 0)}`
                : ` · all ${countryLeagues.length} competitions`}
            . Tap a country or UEFA to narrow.
          </p>
        )}
        <div role="group" aria-label="Call strength" className="flex flex-wrap gap-2">
          <Link
            to="/"
            search={searchFor(selected, countryFilter, tab, undefined, continentFilter, { picks: null })}
            aria-pressed={!strengthFilter && !picksFilter}
            className={cn(
              "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors",
              !strengthFilter && !picksFilter ? "bg-primary text-primary-fg" : "bg-raised text-muted hover:text-fg",
            )}
          >
            All calls
            <span className={cn("ml-1.5 tabular-nums", !strengthFilter && !picksFilter ? "text-primary-fg/70" : "text-subtle")}>
              {tabAll.length}
            </span>
          </Link>
          {STRENGTHS.map((s) => {
            const on = strengthFilter === s && !picksFilter;
            const copy = strengthCopy(s);
            return (
              <Link
                key={s}
                to="/"
                search={searchFor(selected, countryFilter, tab, s, continentFilter, { picks: null })}
                aria-pressed={on}
                title={copy.blurb}
                className={cn(
                  "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors",
                  on && s === "strong" && "bg-home text-bg",
                  on && s === "lean" && "bg-draw text-bg",
                  on && s === "toss-up" && "bg-primary text-primary-fg",
                  !on && "bg-raised text-muted hover:text-fg",
                )}
              >
                {copy.label}
                <span className={cn("ml-1.5 tabular-nums", on ? "opacity-80" : "text-subtle")}>
                  {strengthCounts[s]}
                </span>
              </Link>
            );
          })}
        </div>
        <div role="group" aria-label="Over under" className="flex flex-wrap gap-2">
          {(
            [
              { line: "15" as const, side: "over" as const, label: "O 1.5", count: ou15Counts.over },
              { line: "15" as const, side: "under" as const, label: "U 1.5", count: ou15Counts.under },
              { line: "25" as const, side: "over" as const, label: "O 2.5", count: ou25Counts.over },
              { line: "25" as const, side: "under" as const, label: "U 2.5", count: ou25Counts.under },
            ]
          ).map((opt) => {
            const current = opt.line === "15" ? o15Filter : o25Filter;
            const on = current === opt.side;
            return (
              <Link
                key={opt.label}
                to="/"
                search={searchFor(
                  selected,
                  countryFilter,
                  tab,
                  strengthFilter,
                  continentFilter,
                  opt.line === "15"
                    ? { o15: on ? null : opt.side }
                    : { o25: on ? null : opt.side },
                )}
                aria-pressed={on}
                className={cn(
                  "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors",
                  on && opt.side === "over" && "bg-home text-bg",
                  on && opt.side === "under" && "bg-away text-bg",
                  !on && "bg-raised text-muted hover:text-fg",
                )}
              >
                {opt.label}
                <span className={cn("ml-1.5 tabular-nums", on ? "opacity-80" : "text-subtle")}>{opt.count}</span>
              </Link>
            );
          })}
          {(
            [
              { side: "yes" as const, label: "BTTS Yes", count: bttsCounts.yes },
              { side: "no" as const, label: "BTTS No", count: bttsCounts.no },
            ]
          ).map((opt) => {
            const on = bttsFilter === opt.side;
            return (
              <Link
                key={opt.label}
                to="/"
                search={searchFor(selected, countryFilter, tab, strengthFilter, continentFilter, {
                  btts: on ? null : opt.side,
                })}
                aria-pressed={on}
                className={cn(
                  "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors",
                  on && opt.side === "yes" && "bg-home text-bg",
                  on && opt.side === "no" && "bg-away text-bg",
                  !on && "bg-raised text-muted hover:text-fg",
                )}
              >
                {opt.label}
                <span className={cn("ml-1.5 tabular-nums", on ? "opacity-80" : "text-subtle")}>{opt.count}</span>
              </Link>
            );
          })}
        </div>
        <div role="group" aria-label="Minimum percent" className="flex flex-wrap gap-2">
          <Link
            to="/"
            search={searchFor(selected, countryFilter, tab, strengthFilter, continentFilter, { minp: null })}
            aria-pressed={!minP}
            className={cn(
              "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors",
              !minP ? "bg-primary text-primary-fg" : "bg-raised text-muted hover:text-fg",
            )}
          >
            Any %
          </Link>
          {MIN_P.map((n) => {
            const on = minP === n;
            return (
              <Link
                key={n}
                to="/"
                search={searchFor(selected, countryFilter, tab, strengthFilter, continentFilter, {
                  minp: on ? null : n,
                })}
                aria-pressed={on}
                className={cn(
                  "inline-flex h-11 items-center rounded-full px-4 text-sm tabular-nums transition-colors",
                  on ? "bg-accent text-bg" : "bg-raised text-muted hover:text-fg",
                )}
              >
                {n}%+
              </Link>
            );
          })}
        </div>
        <p className="text-xs leading-relaxed text-muted">
          <span className="font-medium text-fg">Strong</span> — a straight home or away win (not 1X / X2). The
          board win and the score chance use the same bar in every league: 70%+, and at least 22 points clear of both the draw
          and the other result. Ratings, recent form and the books, when we have a price, still have to agree. Picks of the day are the five best strong calls. Leans and toss-ups are left out.{" "}
          <span className="font-medium text-fg">Lean</span> — the two-way ticket,{" "}
          <span className="font-medium text-fg">1X</span> or <span className="font-medium text-fg">X2</span>,
          sitting around 80%. <span className="font-medium text-fg">Toss-up</span> — closer than that. Tap one
          to filter the board.{" "}
          <span className="font-medium text-fg">O 1.5 / U 1.5</span> and{" "}
          <span className="font-medium text-fg">O 2.5 / U 2.5</span> filter the total.{" "}
          <span className="font-medium text-fg">BTTS Yes / No</span> filters both teams to score.{" "}
          <span className="font-medium text-fg">60%+</span> is the ticket % — or the O/U % if a total is selected.
        </p>
      </section>

      <section className="space-y-4">
        {liveRows.length > 0 && (
          <MatchBlock label="Live" count={liveRows.length} matches={liveRows} pickRank={picksFilter ? pickRank : undefined} listId={watching === "bookmarked" ? "bookmarked" : "auto"} />
        )}
        {upcomingRows.length > 0 && (
          <MatchBlock label="Kick-off" count={upcomingRows.length} matches={upcomingRows} pickRank={picksFilter ? pickRank : undefined} listId={watching === "bookmarked" ? "bookmarked" : "auto"} />
        )}
        {liveRows.length === 0 && upcomingRows.length === 0 && (
          <p className="rounded-lg bg-surface px-4 py-8 text-center text-muted">
            {feed.length === 0
              ? "Fetching today’s real kick-off list…"
              : watching === "bookmarked"
                ? "No bookmarked matches on this card. Tap the bookmark on a game, then open Bookmarked again."
                : `No ${strengthFilter ? `${strengthCopy(strengthFilter).label.toLowerCase()} ` : ""}${o15Filter ? `${o15Filter === "over" ? "O" : "U"} 1.5 ` : ""}${o25Filter ? `${o25Filter === "over" ? "O" : "U"} 2.5 ` : ""}${bttsFilter ? `BTTS ${bttsFilter === "yes" ? "Yes" : "No"} ` : ""}${minP ? `${minP}%+ ` : ""}matches ${tab === "tomorrow" ? "tomorrow" : "today"} in the selected leagues.`}
          </p>
        )}
      </section>

      <p className="text-xs text-subtle">
        {upcomingRows.length} still to kick off
        {picksFilter ? " · picks of the day" : ""}
        {strengthFilter ? ` · ${strengthCopy(strengthFilter).label}` : ""}
        {o15Filter ? ` · ${o15Filter === "over" ? "O" : "U"} 1.5` : ""}
        {o25Filter ? ` · ${o25Filter === "over" ? "O" : "U"} 2.5` : ""}
        {bttsFilter ? ` · BTTS ${bttsFilter === "yes" ? "Yes" : "No"}` : ""}
        {minP ? ` · ${minP}%+` : ""}
        {countryFilter ? ` in ${countryFilter}` : ` across ${available.length} competitions`}. Times in {zone}. Keep
        this page open for live scores — full times write themselves to Accuracy.
      </p>
    </div>
  );
}

function MatchBlock({
  label,
  count,
  matches,
  pickRank,
  listId,
}: {
  label: string;
  count: number;
  matches: MatchView[];
  pickRank?: Record<string, number>;
  listId?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 pt-2">
        <h3 className="text-sm font-medium text-muted">{label}</h3>
        <div className="h-px flex-1 bg-border" />
        <Badge>{count}</Badge>
      </div>
      <ol className="grid min-w-0 gap-2">
        {matches.map((m, i) => {
          const prev = matches[i - 1];
          const clock = kickoffLabel(m.fixture.kickoff);
          const showTime = label !== "Picks of the day" && (!prev || kickoffLabel(prev.fixture.kickoff) !== clock);
          return (
            <li key={m.fixture.id} className="space-y-2">
              {showTime && (
                <div className="pt-1 text-xs font-medium tabular-nums text-muted">{clock}</div>
              )}
              <KickoffRow match={m} pickRank={pickRank?.[m.fixture.id]} featured={pickRank?.[m.fixture.id] === 1} listId={listId} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
