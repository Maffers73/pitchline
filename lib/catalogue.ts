import { FIXTURES, getFixture } from "./data/fixtures";
import { getTeam, TEAMS } from "./data/teams";
import { dayHeading, dayKey, todayKeyNow, tomorrowKeyNow, STATS_FROM } from "./format";
import {
  brierScore,
  outcomeOf,
  predict,
  ticketHit,
  totalsHit,
  type Prediction,
} from "./model";
import { clubsMatch } from "./crosscheck";
import type { Fixture, Outcome, Team } from "./types";
import { CONTINENT_COUNTRIES, COUNTRY_ORDER, LEAGUES, type Continent, type LeagueId } from "./types";

export type BoardTab = "today" | "tomorrow";

export interface MatchView {
  fixture: Fixture;
  home: Team;
  away: Team;
  pred: Prediction;
  actual?: Outcome;
  hit?: boolean;
  exactScore?: boolean;
  over15Hit?: boolean;
  over25Hit?: boolean;
  brier?: number;
}

export function viewOf(fixture: Fixture): MatchView {
  const home = getTeam(fixture.homeId);
  const away = getTeam(fixture.awayId);
  const pred = predict(home, away, {
    odds: { home: fixture.oddsHome, draw: fixture.oddsDraw, away: fixture.oddsAway },
  });
  const view: MatchView = { fixture, home, away, pred };
  if (fixture.status === "settled" && fixture.actualHome != null && fixture.actualAway != null) {
    const actual = outcomeOf(fixture.actualHome, fixture.actualAway);
    view.actual = actual;
    view.hit = ticketHit(pred.ticket, actual);
    view.exactScore = fixture.actualHome === pred.scoreHome && fixture.actualAway === pred.scoreAway;
    view.over15Hit = totalsHit(pred.totals15, fixture.actualHome, fixture.actualAway);
    view.over25Hit = totalsHit(pred.totals25, fixture.actualHome, fixture.actualAway);
    view.brier = brierScore(pred.pHome, pred.pDraw, pred.pAway, actual);
  }
  return view;
}

export function allViews() {
  return FIXTURES.map(viewOf);
}

export function tabDayKey(tab: BoardTab) {
  return tab === "tomorrow" ? tomorrowKeyNow() : todayKeyNow();
}

export function upcomingViews(league?: LeagueId | "all" | LeagueId[], tab: BoardTab | "both" = "both") {
  const allow = Array.isArray(league) ? league : league && league !== "all" ? [league] : [];
  const keys = tab === "both" ? [todayKeyNow(), tomorrowKeyNow()] : [tabDayKey(tab)];
  return allViews()
    .filter(
      (m) =>
        m.fixture.status === "upcoming" &&
        keys.includes(dayKey(m.fixture.kickoff)) &&
        (allow.length === 0 || allow.includes(m.fixture.league)),
    )
    .sort((a, b) => a.fixture.kickoff.localeCompare(b.fixture.kickoff));
}

export function settledViews(leagues: LeagueId[] = []) {
  return allViews().filter(
    (m) =>
      m.fixture.status === "settled" &&
      dayKey(m.fixture.kickoff) >= STATS_FROM &&
      (leagues.length === 0 || leagues.includes(m.fixture.league)),
  );
}

export const LEAGUE_ORDER: LeagueId[] = [
  "EPL",
  "EFLC",
  "EL1",
  "EL2",
  "NL",
  "SPL",
  "CHAMP",
  "SL1",
  "SL2",
  "LALIGA",
  "LL2",
  "SA",
  "SB",
  "BL",
  "BL2",
  "L1",
  "L2",
  "ERE",
  "EED",
  "BEL",
  "BEL2",
  "POR",
  "POR2",
  "TUR",
  "TUR2",
  "EKE",
  "POL2",
  "ALLS",
  "SUP",
  "DEN",
  "DEN2",
  "NOR",
  "NOR2",
  "AUT",
  "AUT2",
  "SUI",
  "SUI2",
  "GRE",
  "GRE2",
  "CZE",
  "CZE2",
  "IRL",
  "IRL2",
  "HUN",
  "HUN2",
  "ROU",
  "ROU2",
  "UKR",
  "SVK",
  "SVK2",
  "SVN",
  "FIN",
  "FIN2",
  "ISL",
  "ISL2",
  "CYP",
  "CYP2",
  "WAL",
  "NIR",
  "ALB",
  "ARM",
  "AZE",
  "EST",
  "FRO",
  "KAZ",
  "LVA",
  "LTU",
  "LUX",
  "MDA",
  "MNE",
  "FACUP",
  "EFLCUP",
  "EFLT",
  "SCCUP",
  "SLCUP",
  "CDR",
  "SUCUP",
  "CIT",
  "SCI",
  "DFB",
  "GERSC",
  "CDF",
  "NEDC",
  "BELC",
  "PORC",
  "TURC",
  "POLC",
  "SWEC",
  "DENC",
  "NORC",
  "AUTC",
  "SUIC",
  "GREC",
  "CZEC",
  "IRLC",
  "UCL",
  "UCLQ",
  "UEL",
  "UELQ",
  "ECL",
  "ECLQ",
  "USC",
  "ISR",
  "ISR2",
  "ISRC",
  "BUL",
  "BUL2",
  "BULC",
  "CRO",
  "CROC",
  "SRB",
  "SRB2",
  "SRBC",
  "MLS",
  "USL",
  "USAC",
  "MX",
  "MX2",
  "MEXC",
  "CPL",
  "CANC",
  "CRC",
  "CRCC",
  "HON",
  "GUA",
  "SLV",
  "PAN",
  "BRA",
  "BRA2",
  "BRAC",
  "ARG",
  "ARG2",
  "ARGC",
  "COL",
  "COL2",
  "COLC",
  "CHI",
  "CHI2",
  "CHIC",
  "URU",
  "URU2",
  "URUC",
  "ECU",
  "ECUC",
  "PER",
  "PAR",
  "PARC",
  "BOL",
  "VEN",
  "J1",
  "J2",
  "JLEC",
  "K1",
  "K2",
  "KORC",
  "CSL",
  "CHN2",
  "CHNC",
  "KSA",
  "KSA2",
  "KSAC",
  "UAE",
  "UAEC",
  "QAT",
  "QAT2",
  "QATC",
  "AUS",
  "AUS2",
  "AUSC",
  "IND",
  "IND2",
  "INDC",
  "THA",
  "THA2",
  "THAC",
  "IDN",
  "IDN2",
  "IDNC",
  "MYS",
  "IRN",
  "IRNC",
  "ALG",
  "ALG2",
  "BHR",
  "BHR2",
  "IRQ",
  "IRQ2",
  "EGY",
  "EGY2",
  "EGYC",
  "ACL",
  "ACL2",
];

export function leaguesByCountry(ids: LeagueId[]) {
  const present = new Set(ids);
  return COUNTRY_ORDER.map((country) => ({
    country,
    leagues: LEAGUE_ORDER.filter((id) => LEAGUES[id].country === country && present.has(id)),
  })).filter((g) => g.leagues.length > 0);
}

export function leaguesOnContinent(ids: LeagueId[], continent: Continent) {
  const countries = new Set(CONTINENT_COUNTRIES[continent]);
  return ids.filter((id) => countries.has(LEAGUES[id].country));
}

export function leaguesOfCountry(country: string): LeagueId[] {
  return LEAGUE_ORDER.filter((id) => LEAGUES[id].country === country);
}

export function mergeLabRoster(extra: Team[] = []) {
  const byLeague = new Map<LeagueId, Map<string, Team>>();
  const better = (a: Team, b: Team) => {
    const score = (t: Team) => (t.form?.some((r) => r === "W" || r === "L") ? 2 : 0) + (t.elo > 0 ? 1 : 0);
    return score(b) > score(a) ? b : a;
  };
  const add = (t: Team, league = t.league) => {
    let m = byLeague.get(league);
    if (!m) {
      m = new Map();
      byLeague.set(league, m);
    }
    for (const [id, prev] of m) {
      if (prev.id === t.id || clubsMatch(prev.name, t.name)) {
        const pick = better(prev, t);
        m.set(id, { ...pick, id, league, name: pick.name.length >= prev.name.length ? pick.name : prev.name });
        return;
      }
    }
    if (!m.has(t.id)) m.set(t.id, { ...t, league });
  };
  for (const t of TEAMS) add(t);
  for (const t of extra) {
    add(t);
    if (t.div && t.div !== t.league) add(t, t.div);
  }
  const out = new Map<LeagueId, Team[]>();
  for (const [league, map] of byLeague) {
    out.set(
      league,
      [...map.values()].sort((a, b) => a.name.localeCompare(b.name)),
    );
  }
  return out;
}

export function labTeamsFor(league: LeagueId, roster: Map<LeagueId, Team[]>) {
  const own = roster.get(league);
  if (own?.length) return own;
  const country = LEAGUES[league].country;
  const seen = new Set<string>();
  const all: Team[] = [];
  for (const id of LEAGUE_ORDER) {
    if (LEAGUES[id].country !== country) continue;
    for (const t of roster.get(id) ?? []) {
      if (seen.has(t.id)) continue;
      seen.add(t.id);
      all.push(t);
    }
  }
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export function countriesOnContinent(continent: Continent) {
  return CONTINENT_COUNTRIES[continent];
}

export function leaguesOnBoard(tab: BoardTab | "both" = "both"): LeagueId[] {
  const keys = tab === "both" ? [todayKeyNow(), tomorrowKeyNow()] : [tabDayKey(tab)];
  const present = new Set(
    FIXTURES.filter((f) => f.status === "upcoming" && keys.includes(dayKey(f.kickoff))).map((f) => f.league),
  );
  return LEAGUE_ORDER.filter((id) => present.has(id));
}

export function boardViews(leagues: LeagueId[] = [], tab: BoardTab = "today") {
  return upcomingViews(leagues, tab);
}

export function isLeagueId(id: string): id is LeagueId {
  return id in LEAGUES;
}

export function matchView(id: string) {
  const f = getFixture(id);
  return f ? viewOf(f) : undefined;
}

export function pickScore(m: MatchView) {
  const boost = m.pred.strength === "strong" ? 3 : m.pred.strength === "lean" ? 1 : 0;
  return m.pred.confidence * (m.pred.call === "X" ? 0.9 : 1) + m.pred.gap + boost;
}

export function pickOfDay(tab: BoardTab = "today") {
  return picksOfDay(upcomingViews(undefined, tab), 1)[0];
}

export function picksOfDay(board: MatchView[], n = 5) {
  return [...board]
    .filter((m) => m.pred.strength === "strong")
    .sort((a, b) => pickScore(b) - pickScore(a))
    .slice(0, n);
}

export function outcomeStats() {
  const rows = settledViews();
  const n = rows.length || 1;
  const hits = rows.filter((r) => r.hit).length;
  const exact = rows.filter((r) => r.exactScore).length;
  const brier = rows.reduce((s, r) => s + (r.brier ?? 0), 0) / n;
  const byCall: Record<Outcome, { n: number; hits: number }> = {
    "1": { n: 0, hits: 0 },
    X: { n: 0, hits: 0 },
    "2": { n: 0, hits: 0 },
  };
  for (const r of rows) {
    byCall[r.pred.call].n += 1;
    if (r.hit) byCall[r.pred.call].hits += 1;
  }
  const buckets = [
    { label: "50–59", min: 0.5, max: 0.6, n: 0, hits: 0 },
    { label: "60–69", min: 0.6, max: 0.7, n: 0, hits: 0 },
    { label: "70+", min: 0.7, max: 1.01, n: 0, hits: 0 },
  ];
  for (const r of rows) {
    const b = buckets.find((x) => r.pred.confidence >= x.min && r.pred.confidence < x.max);
    if (b) {
      b.n += 1;
      if (r.hit) b.hits += 1;
    }
  }
  const dayMap = new Map<string, MatchView[]>();
  for (const r of rows) {
    const k = dayKey(r.fixture.kickoff);
    const arr = dayMap.get(k) ?? [];
    arr.push(r);
    dayMap.set(k, arr);
  }
  const byDay = [...dayMap.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, list]) => {
      const sorted = list.sort((a, b) => a.fixture.kickoff.localeCompare(b.fixture.kickoff));
      const dayHits = sorted.filter((r) => r.hit).length;
      const dayExact = sorted.filter((r) => r.exactScore).length;
      return {
        key,
        label: dayHeading(sorted[0]!.fixture.kickoff),
        n: sorted.length,
        hits: dayHits,
        exact: dayExact,
        hitRate: dayHits / (sorted.length || 1),
        rows: sorted,
      };
    });
  return { n: rows.length, hits, exact, hitRate: hits / n, exactRate: exact / n, brier, byCall, buckets, rows, byDay };
}

export function previousDays() {
  return outcomeStats().byDay;
}
