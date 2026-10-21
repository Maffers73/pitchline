import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { StrengthChip } from "@/components/strength-chip";
import { TeamBadge, CompBadge } from "@/components/team-badge";
import { TotalsChip } from "@/components/totals-chip";
import { Badge } from "@/components/ui/badge";
import { kickoffLabel, monthLabel, recentMonthKeys, todayKeyNow } from "@/lib/format";
import { isLeagueId, LEAGUE_ORDER, type MatchView } from "@/lib/catalogue";
import { isStrength, pct, strengthCopy, STRENGTHS, ticketLabel, type Strength } from "@/lib/model";
import { useSlip } from "@/lib/store";
import {
  accuracyStats,
  monthlyBooks,
  pickViews,
  rollingDayBooks,
  trackableViews,
  MONTH_KEEP,
  type DayBook,
  type MonthBook,
  type MonthCard,
} from "@/lib/tracking";
import {
  CONTINENT_COUNTRIES,
  CONTINENT_ORDER,
  COUNTRY_ORDER,
  LEAGUES,
  continentChipLabel,
  continentOfCountry,
  countryFlag,
  isContinent,
  type Continent,
  type LeagueId,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type Search = { month?: string; day?: string; strength?: string; continent?: string; country?: string; league?: string };

function scopeViews(rows: MatchView[], continent?: Continent, country?: string, league?: LeagueId) {
  return rows.filter((m) => {
    const place = LEAGUES[m.fixture.league].country;
    if (league) return m.fixture.league === league;
    if (country) return place === country;
    if (continent) return (CONTINENT_COUNTRIES[continent] as readonly string[]).includes(place);
    return true;
  });
}

function monthTabs(months: MonthBook[], cards: MonthCard[]) {
  const keys = recentMonthKeys(undefined, MONTH_KEEP).slice().reverse();
  const byMonth = new Map(months.map((m) => [m.key, m]));
  const byCard = new Map(cards.map((c) => [c.key, c]));
  return keys.map((key) => {
    const detail = byMonth.get(key);
    const card = byCard.get(key);
    const n = card?.n ?? detail?.n ?? 0;
    const hits = card?.hits ?? detail?.hits ?? 0;
    return {
      key,
      label: card?.label ?? detail?.label ?? monthLabel(key),
      n,
      hits,
      hitRate: n ? hits / n : 0,
      detail,
      card,
    };
  });
}

export const Route = createFileRoute("/outcomes")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    month: typeof s.month === "string" ? s.month : undefined,
    day: typeof s.day === "string" ? s.day : undefined,
    strength: typeof s.strength === "string" && isStrength(s.strength) ? s.strength : undefined,
    continent: typeof s.continent === "string" && isContinent(s.continent) ? s.continent : undefined,
    country: typeof s.country === "string" && COUNTRY_ORDER.includes(s.country as (typeof COUNTRY_ORDER)[number]) ? s.country : undefined,
    league: typeof s.league === "string" && isLeagueId(s.league) ? s.league : undefined,
  }),
  component: OutcomesPage,
});

function OutcomesPage() {
  const { month: rawMonth, day: rawDay, strength: rawStrength, continent: rawContinent, country: rawCountry, league: rawLeague } =
    Route.useSearch();
  const navigate = Route.useNavigate();
  const [level, setLevel] = useState<{ continent?: string; country?: string; league?: string } | null>(null);
  const strengthFilter: Strength | undefined = rawStrength && isStrength(rawStrength) ? rawStrength : undefined;
  const countrySource = level ? level.country : rawCountry;
  const continentSource = level ? level.continent : rawContinent;
  const leagueSource = level ? level.league : rawLeague;
  const countryFilter = countrySource;
  const continentFilter: Continent | undefined = isContinent(continentSource)
    ? continentSource
    : countryFilter
      ? continentOfCountry(countryFilter)
      : undefined;
  const leagueFilter: LeagueId | undefined =
    leagueSource && isLeagueId(leagueSource) && (!countryFilter || LEAGUES[leagueSource].country === countryFilter)
      ? leagueSource
      : undefined;
  const results = useSlip((s) => s.results);
  const liveFeed = useSlip((s) => s.feed);
  const archive = useSlip((s) => s.archive);
  const cards = useSlip((s) => s.cards);
  const dayPicks = useSlip((s) => s.dayPicks);
  const espnRows = useMemo(() => [...archive, ...liveFeed], [archive, liveFeed]);
  const views = useMemo(() => trackableViews(espnRows), [espnRows]);
  const months = useMemo(() => monthlyBooks(views, results), [views, results]);
  const currentKey = todayKeyNow().slice(0, 7);
  const tabs = monthTabs(months, cards);
  const rolling = rollingDayBooks(views, results, 3);
  const selectedTab =
    tabs.find((t) => t.key === rawMonth) ??
    tabs.find((t) => t.key === currentKey) ??
    [...tabs].reverse()[0];
  const selectedMonth = selectedTab?.detail;
  const selectedCard = selectedTab?.card;
  const selectedDay =
    rolling.find((d) => d.key === rawDay) ??
    rolling.find((d) => d.key === todayKeyNow()) ??
    rolling[rolling.length - 1];
  const monthRows = scopeViews(selectedMonth?.settled ?? [], continentFilter, countryFilter, leagueFilter);
  const monthStats = accuracyStats(monthRows);
  const useCard = Boolean(selectedCard && !selectedMonth);
  const strong = useCard
    ? {
        n: selectedCard!.strongN,
        hits: selectedCard!.strongHits,
        draws: selectedCard!.strongDraws,
        losses: selectedCard!.strongLosses,
      }
    : monthStats.byStrength.strong;
  const lean = useCard
    ? { n: selectedCard!.leanN, hits: selectedCard!.leanHits, wins: selectedCard!.leanWins, draws: selectedCard!.leanDraws }
    : monthStats.byStrength.lean;
  const toss = useCard
    ? { n: selectedCard!.tossN, hits: selectedCard!.tossHits, wins: selectedCard!.tossWins, draws: selectedCard!.tossDraws }
    : monthStats.byStrength["toss-up"];
  const monthN = useCard ? selectedCard!.n : monthStats.n;
  const monthHits = useCard ? selectedCard!.hits : monthStats.hits;
  const monthHitRate = useCard ? selectedCard!.hitRate : monthStats.hitRate;
  const monthExact = useCard ? selectedCard!.exact : monthStats.exact;
  const monthExactRate = useCard ? selectedCard!.exactRate : monthStats.exactRate;
  const over15 = useCard
    ? {
        n: selectedCard!.over15N,
        hits: selectedCard!.over15Hits,
        overN: selectedCard!.over15OverN,
        overHits: selectedCard!.over15OverHits,
        underN: selectedCard!.over15UnderN,
        underHits: selectedCard!.over15UnderHits,
      }
    : monthStats.over15;
  const over25 = useCard
    ? {
        n: selectedCard!.over25N,
        hits: selectedCard!.over25Hits,
        overN: selectedCard!.over25OverN,
        overHits: selectedCard!.over25OverHits,
        underN: selectedCard!.over25UnderN,
        underHits: selectedCard!.over25UnderHits,
      }
    : monthStats.over25;
  const btts = useCard
    ? {
        n: selectedCard!.bttsN ?? 0,
        hits: selectedCard!.bttsHits ?? 0,
        yesN: selectedCard!.bttsYesN,
        yesHits: selectedCard!.bttsYesHits,
        noN: selectedCard!.bttsNoN,
        noHits: selectedCard!.bttsNoHits,
      }
    : monthStats.btts;
  const pickSet = useCard
    ? { n: selectedCard!.pickN ?? 0, hits: selectedCard!.pickHits ?? 0 }
    : (() => {
        const rows = pickViews(monthRows, dayPicks);
        return { n: rows.length, hits: rows.filter((m) => m.hit).length };
      })();
  const tabSource = selectedMonth?.settled ?? [];
  const sourceStats = accuracyStats(tabSource);
  const countryTabs = COUNTRY_ORDER.filter(
    (c) =>
      (!continentFilter || (CONTINENT_COUNTRIES[continentFilter] as readonly string[]).includes(c)) &&
      tabSource.some((m) => LEAGUES[m.fixture.league].country === c),
  );
  const leagueTabs = LEAGUE_ORDER.filter(
    (id) =>
      (!countryFilter || LEAGUES[id].country === countryFilter) &&
      tabSource.some((m) => m.fixture.league === id),
  );
  const continentTabs = CONTINENT_ORDER.filter((c) =>
    tabSource.some((m) => continentOfCountry(LEAGUES[m.fixture.league].country) === c),
  );
  const flag = countryFilter ? countryFlag(countryFilter) : "";
  const heading = leagueFilter
    ? `${LEAGUES[leagueFilter].country} · ${LEAGUES[leagueFilter].name}`
    : countryFilter
      ? `${countryFilter} · all leagues`
      : continentFilter
        ? continentChipLabel(continentFilter)
        : "All continents";

  function searchFor(over: {
    month?: string;
    day?: string | false;
    strength?: Strength | false;
    continent?: string | false;
    country?: string | false;
    league?: string | false;
  } = {}): Search {
    const month = over.month ?? selectedTab?.key;
    const day = over.day === false ? undefined : over.day ?? (month === currentKey ? selectedDay?.key : undefined);
    const strength = over.strength === false ? undefined : over.strength ?? strengthFilter;
    const continent =
      over.continent === false ? undefined : over.continent ?? continentFilter;
    const country =
      over.country === false || over.continent === false ? undefined : over.country ?? countryFilter;
    const league =
      over.league === false || over.country === false || over.continent === false
        ? undefined
        : over.league ?? leagueFilter;
    const next: Search = {};
    if (month) next.month = month;
    if (day) next.day = day;
    if (strength) next.strength = strength;
    if (continent) next.continent = continent;
    if (country) next.country = country;
    if (league) next.league = league;
    return next;
  }

  function jump(over: {
    continent?: string | false;
    country?: string | false;
    league?: string | false;
  }) {
    const next = searchFor(over);
    setLevel({ continent: next.continent, country: next.country, league: next.league });
    void navigate({ to: "/outcomes", search: next, replace: true });
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Accuracy</p>
        <h1 className="flex flex-wrap items-center gap-2 font-display text-4xl tracking-tight">
          {flag ? <span aria-hidden className="text-3xl leading-none">{flag}</span> : null}
          {leagueFilter ? <CompBadge league={leagueFilter} size="md" /> : null}
          {heading}
        </h1>
        {tabSource.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => jump({ continent: false, country: false, league: false })}
              aria-pressed={!continentFilter}
              className={cn(
                "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors",
                !continentFilter ? "bg-accent text-bg" : "bg-raised text-muted hover:text-fg",
              )}
            >
              All continents
              <span className={cn("ml-1.5 text-2xs tabular-nums", !continentFilter ? "text-bg/70" : "text-subtle")}>
                {sourceStats.n ? pct(sourceStats.hitRate) : "—"}
              </span>
            </button>
            {continentTabs.map((continent) => {
              const on = continentFilter === continent && !countryFilter;
              const rec = accuracyStats(scopeViews(tabSource, continent));
              return (
                <button
                  key={continent}
                  type="button"
                  onClick={() => jump({ continent, country: false, league: false })}
                  aria-pressed={on}
                  className={cn(
                    "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors",
                    continentFilter === continent ? "bg-accent text-bg" : "bg-raised text-muted hover:text-fg",
                  )}
                >
                  {continentChipLabel(continent)}
                  <span className={cn("ml-1.5 text-2xs tabular-nums", continentFilter === continent ? "text-bg/70" : "text-subtle")}>
                    {rec.n ? `${rec.hits}/${rec.n} · ${pct(rec.hitRate)}` : "—"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {continentFilter && countryTabs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => jump({ continent: continentFilter, country: false, league: false })}
              aria-pressed={!countryFilter}
              className={cn(
                "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors",
                !countryFilter ? "bg-primary text-primary-fg" : "bg-raised text-muted hover:text-fg",
              )}
            >
              All {continentChipLabel(continentFilter)}
              <span className={cn("ml-1.5 text-2xs tabular-nums", !countryFilter ? "text-primary-fg/70" : "text-subtle")}>
                {(() => {
                  const rec = accuracyStats(scopeViews(tabSource, continentFilter));
                  return rec.n ? pct(rec.hitRate) : "—";
                })()}
              </span>
            </button>
            {countryTabs.map((country) => {
              const on = countryFilter === country && !leagueFilter;
              const rec = sourceStats.byCountry.find((c) => c.country === country);
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => jump({ continent: continentFilter, country, league: false })}
                  aria-pressed={on}
                  className={cn(
                    "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors",
                    countryFilter === country ? "bg-primary text-primary-fg" : "bg-raised text-muted hover:text-fg",
                  )}
                >
                  {countryFlag(country) ? `${countryFlag(country)} ${country}` : country}
                  <span className={cn("ml-1.5 text-2xs tabular-nums", countryFilter === country ? "text-primary-fg/70" : "text-subtle")}>
                    {rec ? `${rec.hits}/${rec.n} · ${pct(rec.hitRate)}` : "—"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {countryFilter && leagueTabs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => jump({ continent: continentFilter, country: countryFilter, league: false })}
              aria-pressed={!leagueFilter}
              className={cn(
                "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors",
                !leagueFilter ? "bg-primary text-primary-fg" : "bg-raised text-muted hover:text-fg",
              )}
            >
              All leagues
              <span className={cn("ml-1.5 text-2xs tabular-nums", !leagueFilter ? "text-primary-fg/70" : "text-subtle")}>
                {monthN && !leagueFilter ? pct(monthHitRate) : (() => {
                  const rec = accuracyStats(scopeViews(tabSource, continentFilter, countryFilter));
                  return rec.n ? pct(rec.hitRate) : "—";
                })()}
              </span>
            </button>
            {leagueTabs.map((id) => {
              const on = leagueFilter === id;
              const rec = sourceStats.byLeague.find((l) => l.league === id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    jump({
                      continent: continentOfCountry(LEAGUES[id].country),
                      country: LEAGUES[id].country,
                      league: id,
                    })
                  }
                  aria-pressed={on}
                  className={cn(
                    "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors",
                    on ? "bg-primary text-primary-fg" : "bg-raised text-muted hover:text-fg",
                  )}
                >
                  <span aria-hidden>{countryFlag(LEAGUES[id].country)}</span>
                  <CompBadge league={id} />
                  <span className="ml-1.5">{LEAGUES[id].name}</span>
                  <span className={cn("ml-1.5 text-2xs tabular-nums", on ? "text-primary-fg/70" : "text-subtle")}>
                    {rec ? `${rec.hits}/${rec.n} · ${pct(rec.hitRate)}` : "—"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        <p className="max-w-xl text-muted">
          Daily is today and the previous two days. This month adds every finished day. When a month ends, only the
          scorecard is kept — plus the previous two months.
        </p>
      </header>

      <section className="-mx-1">
        <div className="flex gap-2 overflow-x-auto px-1 pb-1">
          {tabs.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted">Waiting on this month’s full times…</p>
          )}
          {tabs.map((m) => {
            const on = selectedTab?.key === m.key;
            return (
              <Link
                key={m.key}
                to="/outcomes"
                search={searchFor({ month: m.key, day: false })}
                className={cn(
                  "flex min-w-28 shrink-0 flex-col rounded-lg px-3 py-2.5 transition-colors",
                  on ? "bg-accent text-bg" : "bg-raised text-muted hover:text-fg",
                )}
              >
                <span className={cn("text-2xs uppercase tracking-widest", on ? "text-bg/70" : "text-subtle")}>
                  {m.label.split(" ")[1]}
                  {m.key === currentKey ? " · saving" : " · stored"}
                </span>
                <span className="font-display text-xl leading-none tracking-tight">{m.label.split(" ")[0]}</span>
                <span className={cn("mt-1 text-2xs tabular-nums", on ? "text-bg/80" : "text-subtle")}>
                  {m.hits}/{m.n} · {pct(m.hitRate)}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {selectedTab && (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label={`${selectedTab.label} total`}
              value={monthN ? `${monthHits}/${monthN}` : "—"}
              hint={
                monthN
                  ? selectedTab.key === currentKey
                    ? `${pct(monthHitRate)} · every ticket this month`
                    : `${pct(monthHitRate)} · full month`
                  : "Waiting on full times"
              }
              hits={monthHits}
              n={monthN}
            />
            <StatCard
              label="Strong"
              value={strong.n ? `${strong.hits}/${strong.n}` : "—"}
              hint={strong.n ? `${pct(strong.hits / strong.n)} · 1X2 picks` : "Straight 1 / X / 2"}
              note={
                strong.n && strong.draws != null && strong.losses != null
                  ? `Drew ${pct(strong.draws / strong.n)} · Lost ${pct(strong.losses / strong.n)}`
                  : undefined
              }
              hits={strong.hits}
              n={strong.n}
            />
            <StatCard
              label="Lean"
              value={lean.n ? `${lean.hits}/${lean.n}` : "—"}
              hint={lean.n ? `${pct(lean.hits / lean.n)} · 1X / X2` : "Two-way tickets"}
              note={
                lean.n && lean.wins != null && lean.draws != null
                  ? `Won ${pct(lean.wins / lean.n)} · Drew ${pct(lean.draws / lean.n)}`
                  : undefined
              }
              hits={lean.hits}
              n={lean.n}
            />
            <StatCard
              label="Toss-up"
              value={toss.n ? `${toss.hits}/${toss.n}` : "—"}
              hint={toss.n ? `${pct(toss.hits / toss.n)} · 1X / X2` : "Even games"}
              note={
                toss.n && toss.wins != null && toss.draws != null
                  ? `Won ${pct(toss.wins / toss.n)} · Drew ${pct(toss.draws / toss.n)}`
                  : undefined
              }
              hits={toss.hits}
              n={toss.n}
            />
            <StatCard
              label="Picks of the day"
              value={pickSet.n ? `${pickSet.hits}/${pickSet.n}` : "—"}
              hint={pickSet.n ? `${pct(pickSet.hits / pickSet.n)} · top 5 strong` : "Five strong tickets a day"}
              hits={pickSet.hits}
              n={pickSet.n}
            />
            <StatCard
              label="Exact"
              value={monthN ? `${monthExact}/${monthN}` : "—"}
              hint={monthN ? pct(monthExactRate) : "Finished only"}
              hits={monthExact}
              n={monthN}
            />
            <StatCard
              label="Over / under 1.5"
              value={over15.n ? pct(over15.hits / over15.n) : "—"}
              hint={over15.n ? `${over15.hits}/${over15.n} of all games` : "Finished only"}
              note={sideNote(over15.overN, over15.overHits, "Overs", over15.underN, over15.underHits, "Unders")}
              hits={over15.hits}
              n={over15.n}
            />
            <StatCard
              label="Over / under 2.5"
              value={over25.n ? pct(over25.hits / over25.n) : "—"}
              hint={over25.n ? `${over25.hits}/${over25.n} of all games` : "Finished only"}
              note={sideNote(over25.overN, over25.overHits, "Overs", over25.underN, over25.underHits, "Unders")}
              hits={over25.hits}
              n={over25.n}
            />
            <StatCard
              label="BTTS"
              value={btts.n ? pct(btts.hits / btts.n) : "—"}
              hint={btts.n ? `${btts.hits}/${btts.n} of all games` : "Finished only"}
              note={sideNote(btts.yesN, btts.yesHits, "Yes", btts.noN, btts.noHits, "No")}
              hits={btts.hits}
              n={btts.n}
            />
          </section>
        </>
      )}

      {selectedTab?.key === currentKey && (
      <section className="space-y-2">
        <div className="flex items-end justify-between gap-3 px-1">
          <h2 className="text-sm font-medium text-muted">Daily accuracy</h2>
          <p className="text-xs tabular-nums text-subtle">Today and the previous two days</p>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {rolling.map((b) => {
            const on = selectedDay?.key === b.key;
            return (
              <Link
                key={b.key}
                to="/outcomes"
                search={searchFor({ month: currentKey, day: b.key })}
                className={cn(
                  "flex min-w-24 shrink-0 flex-col rounded-lg px-3 py-2.5 transition-colors",
                  on ? "bg-primary text-primary-fg" : "bg-raised text-muted hover:text-fg",
                )}
              >
                <span className={cn("text-2xs uppercase tracking-widest", on ? "text-primary-fg/70" : "text-subtle")}>
                  {b.dow}
                </span>
                <span className="font-display text-2xl leading-none tracking-tight">{b.num}</span>
                <span className={cn("mt-1 text-2xs tabular-nums", on ? "text-primary-fg/80" : "text-subtle")}>
                  {b.logged ? `${b.hits}/${b.logged} · ${pct(b.hitRate)}` : "—"}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
      )}

      {selectedTab?.key === currentKey && selectedDay && (
        <DayPanel
          book={selectedDay}
          monthKey={currentKey}
          strengthFilter={strengthFilter}
          continentFilter={continentFilter}
          countryFilter={countryFilter}
          leagueFilter={leagueFilter}
          searchFor={searchFor}
          pickIds={dayPicks[selectedDay.key]}
        />
      )}
    </div>
  );
}

function DayPanel({
  book,
  monthKey,
  strengthFilter,
  continentFilter,
  countryFilter,
  leagueFilter,
  searchFor,
  pickIds,
}: {
  book: DayBook;
  monthKey: string;
  strengthFilter?: Strength;
  continentFilter?: Continent;
  countryFilter?: string;
  leagueFilter?: LeagueId;
  searchFor: (over?: {
    month?: string;
    day?: string | false;
    strength?: Strength | false;
    continent?: string | false;
    country?: string | false;
    league?: string | false;
  }) => Search;
  pickIds?: string[];
}) {
  const scoped = scopeViews(book.settled, continentFilter, countryFilter, leagueFilter);
  const dayStats = accuracyStats(scoped);
  const strong = dayStats.byStrength.strong;
  const lean = dayStats.byStrength.lean;
  const toss = dayStats.byStrength["toss-up"];
  const counts = {
    strong: strong.n,
    lean: lean.n,
    "toss-up": toss.n,
  };
  const hits = {
    strong: strong.hits,
    lean: lean.hits,
    "toss-up": toss.hits,
  };
  const rows = strengthFilter ? scoped.filter((m) => m.pred.strength === strengthFilter) : scoped;
  const pickRows = pickViews(scoped, pickIds?.length ? { [book.key]: pickIds } : {});
  const pickHits = pickRows.filter((m) => m.hit).length;
  const pickRank = new Map(pickRows.map((m, i) => [m.fixture.id, i + 1]));
  const flag = countryFilter ? countryFlag(countryFilter) : "";
  const place = leagueFilter
    ? `${LEAGUES[leagueFilter].country} · ${LEAGUES[leagueFilter].name}`
    : countryFilter
      ? `${countryFilter} · all leagues`
      : continentFilter
        ? continentChipLabel(continentFilter)
        : "All continents";

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex flex-wrap items-center gap-2 font-display text-2xl tracking-tight">
            {flag ? <span aria-hidden>{flag}</span> : null}
            {leagueFilter ? <CompBadge league={leagueFilter} /> : null}
            {book.label}
            <span className="text-lg font-normal text-muted">{place}</span>
          </h2>
          <p className="text-sm text-muted">
            {place}
            {" · "}
            This day {scoped.length ? `${dayStats.hits}/${scoped.length} · ${pct(dayStats.hitRate)}` : "no full times yet"}
            {scoped.length
              ? ` · ${dayStats.exact} exact · O/U 1.5 ${dayStats.over15.hits}/${dayStats.over15.n} · O/U 2.5 ${dayStats.over25.hits}/${dayStats.over25.n}`
              : ""}{" "}
            · BST
          </p>
        </div>
        {scoped.length > 0 && (
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <div className="text-2xs uppercase tracking-widest text-subtle">Hit</div>
              <div className="font-display text-2xl tabular-nums text-home">
                {dayStats.hits}/{scoped.length}
              </div>
            </div>
            <div>
              <div className="text-2xs uppercase tracking-widest text-subtle">Strong</div>
              <div className="font-display text-2xl tabular-nums">
                {strong.n ? `${strong.hits}/${strong.n}` : "—"}
              </div>
              {strong.n ? (
                <div className="text-2xs tabular-nums text-subtle">
                  Drew {pct((strong.draws ?? 0) / strong.n)} · Lost {pct((strong.losses ?? 0) / strong.n)}
                </div>
              ) : null}
            </div>
            <div>
              <div className="text-2xs uppercase tracking-widest text-subtle">Lean</div>
              <div className="font-display text-2xl tabular-nums">
                {lean.n ? `${lean.hits}/${lean.n}` : "—"}
              </div>
              {lean.n ? (
                <div className="text-2xs tabular-nums text-subtle">
                  Won {pct((lean.wins ?? 0) / lean.n)} · Drew {pct((lean.draws ?? 0) / lean.n)}
                </div>
              ) : null}
            </div>
            <div>
              <div className="text-2xs uppercase tracking-widest text-subtle">Toss-up</div>
              <div className="font-display text-2xl tabular-nums">
                {toss.n ? `${toss.hits}/${toss.n}` : "—"}
              </div>
              {toss.n ? (
                <div className="text-2xs tabular-nums text-subtle">
                  Won {pct((toss.wins ?? 0) / toss.n)} · Drew {pct((toss.draws ?? 0) / toss.n)}
                </div>
              ) : null}
            </div>
            <div>
              <div className="text-2xs uppercase tracking-widest text-subtle">Picks of the day</div>
              <div className="font-display text-2xl tabular-nums">
                {pickRows.length ? `${pickHits}/${pickRows.length}` : "—"}
              </div>
            </div>
            <div>
              <div className="text-2xs uppercase tracking-widest text-subtle">Exact</div>
              <div className="font-display text-2xl tabular-nums">
                {dayStats.exact}/{scoped.length}
              </div>
            </div>
          </div>
        )}
      </div>

      <div role="group" aria-label="Call strength" className="flex flex-wrap gap-2">
        <Link
          to="/outcomes"
          search={searchFor({ month: monthKey, day: book.key, strength: false })}
          aria-pressed={!strengthFilter}
          className={cn(
            "inline-flex h-11 items-center rounded-full px-4 text-sm transition-colors",
            !strengthFilter ? "bg-primary text-primary-fg" : "bg-raised text-muted hover:text-fg",
          )}
        >
          All calls
          <span className={cn("ml-1.5 tabular-nums", !strengthFilter ? "text-primary-fg/70" : "text-subtle")}>
            {scoped.length ? `${dayStats.hits}/${scoped.length}` : "0"}
          </span>
        </Link>
        {STRENGTHS.map((s) => {
          const on = strengthFilter === s;
          const copy = strengthCopy(s);
          const n = counts[s];
          const h = hits[s];
          return (
            <Link
              key={s}
              to="/outcomes"
              search={searchFor({ month: monthKey, day: book.key, strength: s })}
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
                {n ? `${h}/${n}` : "0"}
              </span>
            </Link>
          );
        })}
      </div>

      {scoped.length === 0 ? (
        <p className="rounded-lg bg-surface px-4 py-8 text-center text-muted">
          No finished matches on this card{countryFilter ? ` for ${place}` : ""} yet.
        </p>
      ) : rows.length === 0 ? (
        <p className="rounded-lg bg-surface px-4 py-8 text-center text-muted">
          No {strengthFilter ? strengthCopy(strengthFilter).label.toLowerCase() : ""} tickets on this card.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
          <div className="hidden grid-cols-[4.5rem_1.3fr_0.85fr_0.8fr_0.8fr_0.55fr] gap-2 border-b border-border px-4 py-2 text-xs uppercase tracking-widest text-subtle sm:grid">
            <span>BST</span>
            <span className="text-center">Match</span>
            <span>Ticket</span>
            <span>Predicted score</span>
            <span>Full time</span>
            <span className="text-right">Hit</span>
          </div>
          {rows.map((m) => (
            <div
              key={m.fixture.id}
              className={cn(
                "border-b border-border px-4 py-3 last:border-0",
                m.hit && "bg-home/12",
                m.exactScore && "bg-home/18",
              )}
            >
              <div className="mb-1.5 flex min-w-0 flex-wrap items-center justify-center gap-1.5 text-xs text-muted">
                {countryFlag(LEAGUES[m.fixture.league].country) ? (
                  <span aria-hidden>{countryFlag(LEAGUES[m.fixture.league].country)}</span>
                ) : null}
                <CompBadge league={m.fixture.league} />
                <span className="truncate font-medium">
                  {LEAGUES[m.fixture.league].country}
                  <span className="font-normal text-subtle"> · {LEAGUES[m.fixture.league].name}</span>
                </span>
                {pickRank.get(m.fixture.id) ? <Badge tone="accent">Pick {pickRank.get(m.fixture.id)}</Badge> : null}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[4.5rem_1.3fr_0.85fr_0.8fr_0.8fr_0.55fr] sm:items-center">
              <div className="font-mono text-sm tabular-nums text-muted">{kickoffLabel(m.fixture.kickoff)}</div>
              <Link
                to="/match/$id"
                params={{ id: m.fixture.id }}
                className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-1 hover:text-accent"
              >
                <div className="flex min-w-0 flex-col items-center text-center">
                  <TeamBadge team={m.home} size="sm" />
                  <div className="mt-1 w-full text-xs font-medium leading-snug [overflow-wrap:anywhere]">{m.home.name}</div>
                </div>
                <div className="self-center px-1.5 text-xs font-medium uppercase tracking-widest text-subtle">v</div>
                <div className="flex min-w-0 flex-col items-center text-center">
                  <TeamBadge team={m.away} size="sm" />
                  <div className="mt-1 w-full text-xs font-medium leading-snug [overflow-wrap:anywhere]">{m.away.name}</div>
                </div>
              </Link>
              <div className="flex flex-wrap items-center gap-1.5">
                <div>
                  <div className="text-sm">
                    {m.pred.ticket} · {pct(m.pred.ticketP)}
                  </div>
                  <div className="text-2xs capitalize text-subtle">{ticketLabel(m.pred.ticket)}</div>
                </div>
                <StrengthChip strength={m.pred.strength} />
              </div>
              <div>
                <div className="text-2xs uppercase tracking-widest text-subtle sm:hidden">Predicted score</div>
                <div className="font-display text-lg tabular-nums">
                  {m.pred.scoreHome}–{m.pred.scoreAway}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  <TotalsChip call={m.pred.totals15} hit={m.over15Hit} />
                  <TotalsChip call={m.pred.totals25} hit={m.over25Hit} />
                </div>
              </div>
              <div>
                <div className="text-2xs uppercase tracking-widest text-subtle sm:hidden">Full time</div>
                <div className={cn("font-display text-lg tabular-nums", m.hit && "text-home")}>
                  {m.fixture.actualHome}–{m.fixture.actualAway}
                </div>
              </div>
              <div className="flex justify-end">
                <Badge
                  tone={m.hit ? "home" : "away"}
                  className={m.hit ? "bg-home text-bg" : undefined}
                >
                  {m.exactScore ? "Exact" : m.hit ? "Hit" : "Miss"}
                </Badge>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function sideNote(aN: number | undefined, aHits: number | undefined, aLabel: string, bN: number | undefined, bHits: number | undefined, bLabel: string) {
  const parts: string[] = [];
  if (aN) parts.push(`${aLabel} ${aHits ?? 0}/${aN}`);
  if (bN) parts.push(`${bLabel} ${bHits ?? 0}/${bN}`);
  return parts.length ? parts.join(" · ") : undefined;
}

function StatCard({
  label,
  value,
  hint,
  note,
  hits,
  n,
}: {
  label: string;
  value: string;
  hint: string;
  note?: string;
  hits?: number;
  n?: number;
}) {
  const rate = n && n > 0 ? hits! / n : 0;
  return (
    <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="text-2xs uppercase tracking-widest text-subtle">{label}</div>
      <div className="mt-1 font-display text-3xl tabular-nums tracking-tight">{value}</div>
      {n && n > 0 ? (
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-raised"
          role="img"
          aria-label={`${label} ${pct(rate)} from ${hits} of ${n}`}
        >
          <div className="h-full bg-accent" style={{ width: `${Math.round(rate * 100)}%` }} />
        </div>
      ) : null}
      <div className="mt-1 truncate text-xs text-muted">{hint}</div>
      {note ? <div className="mt-0.5 text-2xs text-subtle">{note}</div> : null}
    </div>
  );
}
