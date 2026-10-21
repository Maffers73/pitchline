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
