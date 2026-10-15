import { type MatchView } from "./catalogue";
import type { EspnMatch } from "./espn";
import { isWomensComp } from "./espn";
import {
  todayKeyNow,
  STATS_FROM,
  dayDow,
  dayHeading,
  dayKey,
  dayNum,
  monthKey,
  monthLabel,
  recentMonthKeys,
  rollingDayKeys,
} from "./format";
import { viewFromEspn, hasTableAndForm } from "./live-board";
import { collapseDuplicates, fixtureIdFor, nameKey, teamIdFor } from "./crosscheck";
import { picksOfDay } from "./catalogue";
import { brierScore, outcomeOf, ticketHit, totalsHit, type Ticket } from "./model";
import { LEAGUES, isKnownLeague } from "./types";
import type { LoggedScore } from "./store";

export function matchLookupIds(row: {
  id?: string;
  espnId?: string;
  kickoff: string;
  homeName?: string;
  awayName?: string;
}) {
  const ids: string[] = [];
  if (row.id) ids.push(row.id);
  if (row.espnId) {
    ids.push(`espn-${row.espnId}`);
    ids.push(row.espnId);
  }
  if (row.homeName && row.awayName) {
    ids.push(fixtureIdFor({ kickoff: row.kickoff, homeName: row.homeName, awayName: row.awayName }));
    ids.push(
      `pl-${dayKey(row.kickoff)}-${nameKey(row.homeName).replace(/\s+/g, "")}-${nameKey(row.awayName).replace(/\s+/g, "")}`,
    );
  }
  return [...new Set(ids.filter(Boolean))];
}

export function loggedFor(view: MatchView, logged: Record<string, LoggedScore>) {
  for (const id of matchLookupIds({
    id: view.fixture.id,
    kickoff: view.fixture.kickoff,
    homeName: view.home.name,
    awayName: view.away.name,
  })) {
    const hit = logged[id];
    if (hit) return hit;
  }
  return undefined;
}

export function scoreView(view: MatchView, home: number, away: number): MatchView {
  const actual = outcomeOf(home, away);
  return {
    ...view,
    fixture: {
      ...view.fixture,
      status: "settled",
      actualHome: home,
      actualAway: away,
    },
    actual,
    hit: ticketHit(view.pred.ticket, actual),
    exactScore: home === view.pred.scoreHome && away === view.pred.scoreAway,
    over15Hit: totalsHit(view.pred.totals15, home, away),
    over25Hit: totalsHit(view.pred.totals25, home, away),
    brier: brierScore(view.pred.pHome, view.pred.pDraw, view.pred.pAway, actual),
  };
}

export function trackableViews(espn: EspnMatch[] = []) {
  const live = collapseDuplicates(
    espn.filter((r) => {
      if (!isKnownLeague(r.league) || isWomensComp(r.homeName, r.awayName)) return false;
      if (!r.listed && !hasTableAndForm(r)) return false;
      if (r.homeScore == null || r.awayScore == null) return false;
      if (r.state === "ft") return true;
      const kicked = Date.parse(r.kickoff);
      return Number.isFinite(kicked) && kicked < Date.now() - 2 * 3600_000 && r.state !== "live";
    }),
  )
    .map((r) => viewFromEspn(r.state === "ft" ? r : { ...r, state: "ft", clock: r.clock || "FT" }))
    .filter((m) => dayKey(m.fixture.kickoff) >= STATS_FROM);
  const seen = new Set<string>();
  const out: MatchView[] = [];
  for (const m of live) {
    const stamp = `${dayKey(m.fixture.kickoff)}|${teamIdFor(m.home.name, undefined, LEAGUES[m.fixture.league].country, m.fixture.league)}|${teamIdFor(m.away.name, undefined, LEAGUES[m.fixture.league].country, m.fixture.league)}`;
    if (seen.has(m.fixture.id) || seen.has(stamp)) continue;
    seen.add(m.fixture.id);
    seen.add(stamp);
    out.push(m);
  }
  return out.sort((a, b) => a.fixture.kickoff.localeCompare(b.fixture.kickoff));
}

export function applyLogged(views: MatchView[], logged: Record<string, LoggedScore>) {
  const pending: MatchView[] = [];
  const settled: MatchView[] = [];
  for (const v of views) {
    const r = loggedFor(v, logged);
    if (r) {
      settled.push(scoreView(v, r.home, r.away));
    } else if (v.fixture.status === "settled" && v.fixture.actualHome != null && v.fixture.actualAway != null) {
      settled.push(v);
    } else {
      pending.push(v);
    }
  }
  return { pending, settled };
}

export interface DayBook {
  key: string;
  label: string;
  dow: string;
  num: string;
  pending: MatchView[];
  settled: MatchView[];
  published: number;
  logged: number;
  hits: number;
  exact: number;
  hitRate: number;
}

export function dailyBooks(views: MatchView[], logged: Record<string, LoggedScore>): DayBook[] {
  const { pending, settled } = applyLogged(views, logged);
  const map = new Map<string, { pending: MatchView[]; settled: MatchView[] }>();
  const ensure = (iso: string) => {
    const k = dayKey(iso);
    if (!map.has(k)) map.set(k, { pending: [], settled: [] });
    return map.get(k)!;
  };
  for (const m of pending) ensure(m.fixture.kickoff).pending.push(m);
  for (const m of settled) ensure(m.fixture.kickoff).settled.push(m);
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, bucket]) => {
      const sample = bucket.pending[0] ?? bucket.settled[0]!;
      const iso = sample.fixture.kickoff;
      const loggedN = bucket.settled.length;
      const hits = bucket.settled.filter((r) => r.hit).length;
      const exact = bucket.settled.filter((r) => r.exactScore).length;
      const published = bucket.pending.length + loggedN;
      return {
        key,
        label: dayHeading(iso),
        dow: dayDow(iso),
        num: dayNum(iso),
        pending: bucket.pending,
        settled: bucket.settled,
        published,
        logged: loggedN,
        hits,
        exact,
        hitRate: loggedN ? hits / loggedN : 0,
      };
    });
}

export const DAILY_ROLL = 3;
export const MONTH_KEEP = 3;

export function emptyDayBook(key: string): DayBook {
  const iso = `${key}T12:00:00.000Z`;
  return {
    key,
    label: dayHeading(iso),
    dow: dayDow(iso),
    num: dayNum(iso),
    pending: [],
    settled: [],
    published: 0,
    logged: 0,
    hits: 0,
    exact: 0,
    hitRate: 0,
  };
}

export function rollingDayBooks(views: MatchView[], logged: Record<string, LoggedScore>, count = DAILY_ROLL): DayBook[] {
  const map = new Map(dailyBooks(views, logged).map((d) => [d.key, d]));
  return rollingDayKeys(undefined, count).map((k) => map.get(k) ?? emptyDayBook(k));
}

export interface MonthBook {
  key: string;
  label: string;
  days: DayBook[];
  settled: MatchView[];
  n: number;
  hits: number;
  exact: number;
  hitRate: number;
  exactRate: number;
}

export function monthlyBooks(views: MatchView[], logged: Record<string, LoggedScore>): MonthBook[] {
  const days = dailyBooks(views, logged).filter((d) => d.logged > 0);
  const map = new Map<string, DayBook[]>();
  for (const d of days) {
    const mk = monthKey(`${d.key}T12:00:00.000Z`);
    const arr = map.get(mk) ?? [];
    arr.push(d);
    map.set(mk, arr);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, monthDays]) => {
      const settled = monthDays.flatMap((d) => d.settled);
      const n = settled.length;
      const hits = settled.filter((r) => r.hit).length;
      const exact = settled.filter((r) => r.exactScore).length;
      return {
        key,
        label: monthLabel(key),
        days: monthDays,
        settled,
        n,
        hits,
        exact,
        hitRate: n ? hits / n : 0,
        exactRate: n ? exact / n : 0,
      };
    });
}

export interface DaySnap {
  key: string;
  n: number;
  hits: number;
  exact: number;
  strongN: number;
  strongHits: number;
  strongDraws?: number;
  strongLosses?: number;
  leanN: number;
  leanHits: number;
  leanWins?: number;
  leanDraws?: number;
  tossN: number;
  tossHits: number;
  tossWins?: number;
  tossDraws?: number;
  over15N: number;
  over15Hits: number;
  over25N: number;
  over25Hits: number;
  pickN: number;
  pickHits: number;
}

export interface MonthCard {
  key: string;
  label: string;
  n: number;
  hits: number;
  exact: number;
  hitRate: number;
  exactRate: number;
  strongN: number;
  strongHits: number;
  strongDraws?: number;
  strongLosses?: number;
  leanN: number;
  leanHits: number;
  leanWins?: number;
  leanDraws?: number;
  tossN: number;
  tossHits: number;
  tossWins?: number;
  tossDraws?: number;
  over15N: number;
  over15Hits: number;
  over25N: number;
  over25Hits: number;
  pickN: number;
  pickHits: number;
  days?: Record<string, DaySnap>;
}

function snapFromRows(key: string, rows: MatchView[], pickIds?: string[]): DaySnap {
  const s = accuracyStats(rows);
  const picks = pickIds?.length
    ? rows.filter((m) => pickIds.includes(m.fixture.id))
    : picksOfDay(rows, 5);
  return {
    key,
    n: s.n,
    hits: s.hits,
    exact: s.exact,
    strongN: s.byStrength.strong.n,
    strongHits: s.byStrength.strong.hits,
    strongDraws: s.byStrength.strong.draws ?? 0,
    strongLosses: s.byStrength.strong.losses ?? 0,
    leanN: s.byStrength.lean.n,
    leanHits: s.byStrength.lean.hits,
    leanWins: s.byStrength.lean.wins ?? 0,
    leanDraws: s.byStrength.lean.draws ?? 0,
    tossN: s.byStrength["toss-up"].n,
    tossHits: s.byStrength["toss-up"].hits,
    tossWins: s.byStrength["toss-up"].wins ?? 0,
    tossDraws: s.byStrength["toss-up"].draws ?? 0,
    over15N: s.over15.n,
    over15Hits: s.over15.hits,
    over25N: s.over25.n,
    over25Hits: s.over25.hits,
    pickN: picks.length,
    pickHits: picks.filter((m) => m.hit).length,
  };
}

function sumSnaps(days: Record<string, DaySnap>): Omit<MonthCard, "key" | "label" | "days"> {
  const list = Object.values(days);
  const n = list.reduce((s, d) => s + d.n, 0);
  const hits = list.reduce((s, d) => s + d.hits, 0);
  const exact = list.reduce((s, d) => s + d.exact, 0);
  return {
    n,
    hits,
    exact,
    hitRate: n ? hits / n : 0,
    exactRate: n ? exact / n : 0,
    strongN: list.reduce((s, d) => s + d.strongN, 0),
    strongHits: list.reduce((s, d) => s + d.strongHits, 0),
    strongDraws: list.some((d) => d.strongDraws != null)
      ? list.reduce((s, d) => s + (d.strongDraws ?? 0), 0)
      : undefined,
    strongLosses: list.some((d) => d.strongLosses != null)
      ? list.reduce((s, d) => s + (d.strongLosses ?? 0), 0)
      : undefined,
    leanN: list.reduce((s, d) => s + d.leanN, 0),
    leanHits: list.reduce((s, d) => s + d.leanHits, 0),
    leanWins: list.some((d) => d.leanWins != null) ? list.reduce((s, d) => s + (d.leanWins ?? 0), 0) : undefined,
    leanDraws: list.some((d) => d.leanDraws != null) ? list.reduce((s, d) => s + (d.leanDraws ?? 0), 0) : undefined,
    tossN: list.reduce((s, d) => s + d.tossN, 0),
    tossHits: list.reduce((s, d) => s + d.tossHits, 0),
    tossWins: list.some((d) => d.tossWins != null) ? list.reduce((s, d) => s + (d.tossWins ?? 0), 0) : undefined,
    tossDraws: list.some((d) => d.tossDraws != null) ? list.reduce((s, d) => s + (d.tossDraws ?? 0), 0) : undefined,
    over15N: list.reduce((s, d) => s + d.over15N, 0),
    over15Hits: list.reduce((s, d) => s + d.over15Hits, 0),
    over25N: list.reduce((s, d) => s + d.over25N, 0),
    over25Hits: list.reduce((s, d) => s + d.over25Hits, 0),
    pickN: list.reduce((s, d) => s + (d.pickN ?? 0), 0),
    pickHits: list.reduce((s, d) => s + (d.pickHits ?? 0), 0),
  };
}

export function cardFromStats(key: string, rows: MatchView[]): MonthCard {
  const snap = snapFromRows(key, rows);
  const s = accuracyStats(rows);
  return {
    key,
    label: monthLabel(key),
    n: s.n,
    hits: s.hits,
    exact: s.exact,
    hitRate: s.hitRate,
    exactRate: s.exactRate,
    strongN: snap.strongN,
    strongHits: snap.strongHits,
    strongDraws: snap.strongDraws ?? 0,
    strongLosses: snap.strongLosses ?? 0,
    leanN: snap.leanN,
    leanHits: snap.leanHits,
    leanWins: snap.leanWins ?? 0,
    leanDraws: snap.leanDraws ?? 0,
    tossN: snap.tossN,
    tossHits: snap.tossHits,
    tossWins: snap.tossWins ?? 0,
    tossDraws: snap.tossDraws ?? 0,
    over15N: snap.over15N,
    over15Hits: snap.over15Hits,
    over25N: snap.over25N,
    over25Hits: snap.over25Hits,
    pickN: snap.pickN,
    pickHits: snap.pickHits,
    days: rows.length ? { [key]: snap } : {},
  };
}

function cardFromDays(key: string, days: Record<string, DaySnap>, floor?: MonthCard): MonthCard {
  const summed = sumSnaps(days);
  const hasDays = Object.keys(days).length > 0;
  const useFloor = Boolean(floor && (!hasDays || floor.n >= summed.n));
  const base = useFloor ? floor! : { ...summed, key, label: monthLabel(key) };
  return {
    key,
    label: monthLabel(key),
    n: base.n,
    hits: base.hits,
    exact: base.exact,
    hitRate: base.n ? base.hits / base.n : 0,
    exactRate: base.n ? base.exact / base.n : 0,
    strongN: base.strongN,
    strongHits: base.strongHits,
    strongDraws: base.strongDraws,
    strongLosses: base.strongLosses,
    leanN: base.leanN,
    leanHits: base.leanHits,
    leanWins: base.leanWins,
    leanDraws: base.leanDraws,
    tossN: base.tossN,
    tossHits: base.tossHits,
    tossWins: base.tossWins,
    tossDraws: base.tossDraws,
    over15N: base.over15N,
    over15Hits: base.over15Hits,
    over25N: base.over25N,
    over25Hits: base.over25Hits,
    pickN: base.pickN ?? 0,
    pickHits: base.pickHits ?? 0,
    days,
  };
}

export function mergeMonthCards(a: MonthCard, b: MonthCard): MonthCard {
  const days = { ...(a.days ?? {}), ...(b.days ?? {}) };
  return cardFromDays(a.key, days, a.n >= b.n ? a : b);
}

export function sealMonthCards(next: MonthCard[], prev: MonthCard[] = []): MonthCard[] {
  const keep = recentMonthKeys(undefined, MONTH_KEEP);
  const keepSet = new Set(keep);
  const current = todayKeyNow().slice(0, 7);
  const byPrev = new Map(prev.filter((c) => keepSet.has(c.key)).map((c) => [c.key, c]));
  const byNext = new Map(next.filter((c) => keepSet.has(c.key)).map((c) => [c.key, c]));
  const out: MonthCard[] = [];
  for (const k of keep) {
    const a = byNext.get(k);
    const b = byPrev.get(k);
    if (!a && !b) continue;
    if (!a) {
      out.push(b!);
      continue;
    }
    if (!b) {
      out.push(a);
      continue;
    }
    if (k !== current) out.push(a.n >= b.n ? a : b);
    else out.push(a.n >= b.n ? mergeMonthCards(a, b) : mergeMonthCards(b, a));
  }
  return out;
}

export function snapshotMonthCards(
  views: MatchView[],
  logged: Record<string, LoggedScore>,
  existing: MonthCard[] = [],
  pickMap: Record<string, string[]> = {},
): MonthCard[] {
  const current = todayKeyNow().slice(0, 7);
  const keep = recentMonthKeys(undefined, MONTH_KEEP);
  const keepSet = new Set(keep);
  const byMonth = new Map<string, { days: Record<string, DaySnap>; floor?: MonthCard }>();
  for (const c of existing) {
    if (!keepSet.has(c.key) || (c.n <= 0 && !c.days)) continue;
    byMonth.set(c.key, { days: { ...(c.days ?? {}) }, floor: c });
  }
  for (const d of dailyBooks(views, logged)) {
    if (d.logged === 0) continue;
    const mk = d.key.slice(0, 7);
    if (!keepSet.has(mk)) continue;
    const slot = byMonth.get(mk) ?? { days: {} };
    const next = snapFromRows(d.key, d.settled, pickMap[d.key]);
    const prev = slot.days[d.key];
    if (!prev || next.n >= prev.n) slot.days[d.key] = next;
    byMonth.set(mk, slot);
  }
  return keep
    .filter((k) => {
      const slot = byMonth.get(k);
      return slot && (slot.floor?.n || Object.keys(slot.days).length);
    })
    .map((k) => {
      const slot = byMonth.get(k)!;
      const card = cardFromDays(k, slot.days, slot.floor);
      if (k !== current && slot.floor && slot.floor.n >= card.n) return slot.floor;
      if (k === current && slot.floor && slot.floor.n > card.n) {
        return { ...card, n: slot.floor.n, hits: slot.floor.hits, exact: slot.floor.exact, hitRate: slot.floor.hitRate, exactRate: slot.floor.exactRate, strongN: slot.floor.strongN, strongHits: slot.floor.strongHits, strongDraws: slot.floor.strongDraws ?? card.strongDraws, strongLosses: slot.floor.strongLosses ?? card.strongLosses, leanN: slot.floor.leanN, leanHits: slot.floor.leanHits, leanWins: slot.floor.leanWins ?? card.leanWins, leanDraws: slot.floor.leanDraws ?? card.leanDraws, tossN: slot.floor.tossN, tossHits: slot.floor.tossHits, tossWins: slot.floor.tossWins ?? card.tossWins, tossDraws: slot.floor.tossDraws ?? card.tossDraws, over15N: slot.floor.over15N, over15Hits: slot.floor.over15Hits, over25N: slot.floor.over25N, over25Hits: slot.floor.over25Hits, pickN: slot.floor.pickN ?? card.pickN, pickHits: slot.floor.pickHits ?? card.pickHits, days: { ...(slot.floor.days ?? {}), ...slot.days } };
      }
      return card;
    });
}

export function rollArchive(archive: EspnMatch[], cards: MonthCard[]) {
  const keepMonths = new Set(recentMonthKeys(undefined, MONTH_KEEP));
  const currentMonth = todayKeyNow().slice(0, 7);
  const keepDays = new Set(rollingDayKeys(undefined, DAILY_ROLL));
  const keep = archive
    .filter((r) => {
      if (r.state !== "ft" || r.homeScore == null || r.awayScore == null) return false;
      const day = dayKey(r.kickoff);
      if (keepDays.has(day)) return true;
      return monthKey(r.kickoff) === currentMonth;
    })
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  return { archive: keep, cards: cards.filter((c) => keepMonths.has(c.key)) };
}

type Count = { n: number; hits: number; wins?: number; draws?: number; losses?: number };

function emptyCount(): Count {
  return { n: 0, hits: 0 };
}

export function accuracyStats(rows: MatchView[]) {
  const n = rows.length;
  const hits = rows.filter((r) => r.hit).length;
  const exact = rows.filter((r) => r.exactScore).length;
  const brier = n ? rows.reduce((s, r) => s + (r.brier ?? 0), 0) / n : 0;

  const byTicket: Record<Ticket, Count> = {
    "1": emptyCount(),
    X: emptyCount(),
    "2": emptyCount(),
    "1X": emptyCount(),
    X2: emptyCount(),
  };
  const byStrength: Record<MatchView["pred"]["strength"], Count> = {
    strong: { n: 0, hits: 0, draws: 0, losses: 0 },
    lean: { n: 0, hits: 0, wins: 0, draws: 0 },
    "toss-up": { n: 0, hits: 0, wins: 0, draws: 0 },
  };
  const countryMap = new Map<string, Count>();
  const leagueMap = new Map<string, Count>();

  for (const r of rows) {
    byTicket[r.pred.ticket].n += 1;
    if (r.hit) byTicket[r.pred.ticket].hits += 1;
    byStrength[r.pred.strength].n += 1;
    if (r.hit) byStrength[r.pred.strength].hits += 1;
    if (r.pred.strength === "strong" && r.actual) {
      if (r.actual === "X") byStrength.strong.draws = (byStrength.strong.draws ?? 0) + 1;
      else if (!r.hit) byStrength.strong.losses = (byStrength.strong.losses ?? 0) + 1;
    }
    if ((r.pred.strength === "lean" || r.pred.strength === "toss-up") && r.actual) {
      const bucket = byStrength[r.pred.strength];
      const sideWon =
        (r.pred.ticket === "1X" && r.actual === "1") || (r.pred.ticket === "X2" && r.actual === "2");
      if (r.actual === "X") bucket.draws = (bucket.draws ?? 0) + 1;
      else if (sideWon) bucket.wins = (bucket.wins ?? 0) + 1;
    }
    const country = LEAGUES[r.fixture.league].country;
    const c = countryMap.get(country) ?? emptyCount();
    c.n += 1;
    if (r.hit) c.hits += 1;
    countryMap.set(country, c);
    const lg = leagueMap.get(r.fixture.league) ?? emptyCount();
    lg.n += 1;
    if (r.hit) lg.hits += 1;
    leagueMap.set(r.fixture.league, lg);
  }

  const buckets = [
    { label: "50–59", min: 0.5, max: 0.6, n: 0, hits: 0 },
    { label: "60–69", min: 0.6, max: 0.7, n: 0, hits: 0 },
    { label: "70+", min: 0.7, max: 1.01, n: 0, hits: 0 },
  ];
  for (const r of rows) {
    const b = buckets.find((x) => r.pred.ticketP >= x.min && r.pred.ticketP < x.max);
    if (b) {
      b.n += 1;
      if (r.hit) b.hits += 1;
    }
  }

  const byCountry = [...countryMap.entries()]
    .sort((a, b) => b[1].n - a[1].n)
    .map(([country, c]) => ({ country, ...c, hitRate: c.hits / (c.n || 1) }));
  const byLeague = [...leagueMap.entries()]
    .sort((a, b) => b[1].n - a[1].n)
    .map(([league, c]) => ({ league, ...c, hitRate: c.hits / (c.n || 1) }));

  const over15 = emptyCount();
  const over25 = emptyCount();
  for (const r of rows) {
    over15.n += 1;
    if (r.over15Hit) over15.hits += 1;
    over25.n += 1;
    if (r.over25Hit) over25.hits += 1;
  }

  return {
    n,
    hits,
    exact,
    hitRate: n ? hits / n : 0,
    exactRate: n ? exact / n : 0,
    brier,
    byTicket,
    byStrength,
    byCountry,
    byLeague,
    buckets,
    over15,
    over25,
    rows,
  };
}

export function pickViews(rows: MatchView[], pickMap: Record<string, string[]> = {}) {
  const byDay = new Map<string, MatchView[]>();
  for (const r of rows) {
    const k = dayKey(r.fixture.kickoff);
    const list = byDay.get(k) ?? [];
    list.push(r);
    byDay.set(k, list);
  }
  const out: MatchView[] = [];
  for (const [k, list] of byDay) {
    const ids = pickMap[k];
    out.push(...(ids?.length ? list.filter((m) => ids.includes(m.fixture.id)) : picksOfDay(list, 5)));
  }
  return out;
}
