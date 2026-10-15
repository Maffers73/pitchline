import { type BoardTab, type MatchView } from "./catalogue";
import { TEAMS } from "./data/teams";
import { fold, isWomensComp, type EspnMatch, type FeedScore } from "./espn";
import { catalogueTeam } from "./fotmob";
import { collapseDuplicates, colorFor, fixtureIdFor, rememberColor, rememberTeamId, sameFixture, teamIdFor, clubLabel } from "./crosscheck";
import { badgeFor, espnTeamBadge, fotmobTeamBadge, rememberBadge } from "./badges";
import { dayKey, todayKeyNow, tomorrowKeyNow, yesterdayKeyNow } from "./format";
import { brierScore, outcomeOf, predict, ticketHit, totalsHit } from "./model";
import type { Fixture, FormResult, LeagueId, Team } from "./types";
import { LEAGUES, isKnownLeague } from "./types";

const SKIP = new Set([
  "fc",
  "cf",
  "sc",
  "afc",
  "ifk",
  "bk",
  "ik",
  "sk",
  "tsv",
  "sv",
  "ac",
  "as",
  "the",
  "de",
  "city",
  "town",
  "hotspur",
  "wanderers",
  "athletic",
  "calcio",
  "club",
  "sporting",
  "real",
  "united",
  "olympic",
  "olympique",
  "ss",
  "ud",
  "cd",
]);

const ALIAS: Record<string, string> = {
  "nottingham forest": "nfo",
  "brighton hove albion": "bha",
  "brighton and hove albion": "bha",
  "tottenham hotspur": "tot",
  "west bromwich albion": "wba",
  "afc bournemouth": "bou",
  "manchester united": "mun",
  "manchester city": "mci",
  "newcastle united": "new",
  "leeds united": "lee",
  "leicester city": "lei",
  "ipswich town": "ips",
  "coventry city": "cov",
  "hull city": "hul",
  "crystal palace": "cry",
  "notts county": "ntc",
  "queens park rangers": "qpr",
  "sheffield united": "shu",
  "sheffield wednesday": "shw",
  "lincoln city": "lcn",
  portsmouth: "pom",
  "west ham united": "whu",
  "wolverhampton wanderers": "wol",
  "bristol city": "brc",
  "bristol rovers": "brv",
  "dundee united": "dund",
  dundee: "ddee",
  "newport county": "nwp",
  "internazionale": "int",
  "inter milan": "int",
  "ac milan": "mil",
  "atletico madrid": "atm",
  "athletic club": "ath",
  "athletic bilbao": "ath",
  "paris saint germain": "psg",
  "paris sg": "psg",
  "bayern munich": "fcb",
  "bayern munchen": "fcb",
  "borussia dortmund": "bvb",
  "eintracht frankfurt": "sge",
  "st pauli": "stp",
  "fc st pauli": "stp",
  "sporting cp": "scp",
  "vitoria de guimaraes": "vgu",
  "vitoria guimaraes": "vgu",
  "ajax amsterdam": "aja",
  "psv eindhoven": "psv",
  "feyenoord rotterdam": "fey",
  "az alkmaar": "az",
  "fortuna sittard": "for",
  "nec nijmegen": "nec",
  "royal antwerp": "ant",
  "club brugge": "clu",
  "racing genk": "gnk",
  "kv mechelen": "kvm",
};

function tokens(name: string) {
  return fold(name)
    .split(" ")
    .filter((w) => w.length > 2 && !SKIP.has(w));
}

function scoreName(team: Team, espnName: string) {
  const a = fold(team.name);
  const b = fold(espnName);
  if (!a || !b) return 0;
  if (a === b) return 100;
  const strip = (s: string) =>
    s
      .replace(/\b(fc|cf|afc|sc|the)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  if (strip(a) === strip(b) && strip(a)) return 95;
  const aw = tokens(team.name);
  const bw = tokens(espnName);
  if (!aw.length || !bw.length) return 0;
  const onlyA = aw.filter((w) => !bw.includes(w));
  const onlyB = bw.filter((w) => !aw.includes(w));
  if (onlyA.length || onlyB.length) return 0;
  return 82;
}

function shortFromName(name: string, abbr: string) {
  const t = tokens(name);
  if (t.length >= 2) return `${t[0].slice(0, 3)}${t[1].slice(0, 1)}`.toUpperCase().slice(0, 4);
  if (t[0]) return t[0].slice(0, 4).toUpperCase();
  return (abbr || "FC").replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase() || "FC";
}

function hash01(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

function formPulse(form: FormResult[]) {
  if (!form.length) return 0.5;
  let pts = 0;
  let max = 0;
  form.forEach((r, i) => {
    const w = 1 - i * 0.12;
    max += 3 * w;
    if (r === "W") pts += 3 * w;
    else if (r === "D") pts += w;
  });
  return max ? pts / max : 0.5;
}

const KITS: [string, string][] = [
  ["#c8102e", "#ffffff"],
  ["#034694", "#dba111"],
  ["#6cabdd", "#1c2c5b"],
  ["#00954c", "#ffffff"],
  ["#132257", "#ffffff"],
  ["#e30613", "#fbb800"],
  ["#241f20", "#ffffff"],
  ["#f18a00", "#000000"],
  ["#670e36", "#95bfe5"],
  ["#1d428a", "#ffcd00"],
  ["#00a650", "#0a2240"],
  ["#e4002b", "#001f5b"],
  ["#8b0000", "#f5d76e"],
  ["#004d98", "#edbb00"],
  ["#7b2d8e", "#ffffff"],
  ["#00843d", "#ffcd00"],
];

function kitFor(id: string): [string, string] {
  const n = Math.abs(hash01(id) * 997 | 0) % KITS.length;
  return KITS[n]!;
}

function resolveTeam(
  name: string,
  league: LeagueId,
  abbr: string,
  espnId: string,
  color?: string,
  form?: FormResult[],
  ratings?: {
    attack?: number;
    defense?: number;
    elo?: number;
    formHome?: FormResult[];
    formAway?: FormResult[];
    avgH?: number;
    avgA?: number;
    div?: LeagueId;
  },
  color2?: string,
  badge?: string,
): Team {
  const label = clubLabel(name, league);
  const folded = fold(label);
  const aliasId = ALIAS[folded];
  const overlay = form && form.length ? form : undefined;
  let team: Team | undefined;
  if (aliasId) {
    const aliased = TEAMS.find((t) => t.id === aliasId);
    if (aliased) {
      rememberTeamId(label, aliased.id, LEAGUES[league]?.country, league);
      team = paint(aliased, label, color, overlay);
    }
  }
  if (!team) {
    let best: Team | undefined;
    let bestScore = 0;
    const country = LEAGUES[league]?.country ?? "";
    for (const t of TEAMS) {
      if (LEAGUES[t.league].country !== country) continue;
      let s = scoreName(t, label);
      if (s <= 0) continue;
      if (t.league === league) s += 12;
      if (fold(t.short) === fold(abbr)) s += 4;
      if (s > bestScore) {
        best = t;
        bestScore = s;
      }
    }
    if (best && bestScore >= 70) {
      rememberTeamId(label, best.id, country, league);
      team = paint(best, label, color, overlay);
    }
  }
  if (!team) {
    const live = catalogueTeam(league, espnId, label, abbr, color);
    if (live) {
      rememberTeamId(label, live.id, LEAGUES[league]?.country, league);
      team = paint(live, label, color, overlay);
    }
  }
  if (!team) {
    const sample = TEAMS.find((t) => t.league === league);
    const avgH = ratings?.avgH ?? sample?.leagueAvgHome ?? 1.34;
    const avgA = ratings?.avgA ?? sample?.leagueAvgAway ?? 1.12;
    const usedForm = overlay && overlay.length ? overlay : [];
    const pulse = formPulse(usedForm);
    const country = LEAGUES[league]?.country ?? "";
    const tid = teamIdFor(label, undefined, country, league);
    const j = hash01(tid);
    const j2 = hash01(`${tid}|def`);
    team = {
      id: tid,
      name: label,
      short: shortFromName(label, abbr),
      league,
      attack: Math.max(0.72, Math.min(1.42, 0.84 + j * 0.5 + (pulse - 0.5) * 0.55)),
      defense: Math.max(0.72, Math.min(1.36, 0.82 + j2 * 0.42 - (pulse - 0.5) * 0.4)),
      elo: Math.round(1385 + j * 230 + (pulse - 0.5) * 220),
      form: usedForm.length ? usedForm : ["D", "D", "D", "D", "D"],
      color: color ?? "#5e6861",
      color2: "#e8eee9",
      leagueAvgHome: avgH,
      leagueAvgAway: avgA,
      div: ratings?.div ?? league,
    };
  }
  if (!ratings) return finishKit(team, label, color, color2, espnId, badge, league);
  const blend = 0.55;
  const mix = (base: number, next: number | undefined, lo: number, hi: number) => {
    if (next == null || !Number.isFinite(next)) return base;
    return Math.min(hi, Math.max(lo, base * (1 - blend) + next * blend));
  };
  return finishKit(
    {
      ...team,
      attack: mix(team.attack, ratings.attack, 0.72, 1.48),
      defense: mix(team.defense, ratings.defense, 0.68, 1.38),
      elo: ratings.elo != null ? Math.round(team.elo * (1 - blend) + ratings.elo * blend) : team.elo,
      form: overlay ?? team.form,
      formHome: ratings.formHome?.length ? ratings.formHome : team.formHome,
      formAway: ratings.formAway?.length ? ratings.formAway : team.formAway,
      leagueAvgHome: ratings.avgH ?? team.leagueAvgHome,
      leagueAvgAway: ratings.avgA ?? team.leagueAvgAway,
      div: ratings.div ?? team.div ?? team.league,
    },
    label,
    color,
    color2,
    espnId,
    badge,
    league,
  );
}

function finishKit(team: Team, name: string, color?: string, color2?: string, sourceId?: string, badge?: string, league?: LeagueId): Team {
  const country = league ? LEAGUES[league]?.country : undefined;
  const id = teamIdFor(name, undefined, country, league);
  rememberTeamId(name, id, country, league);
  const stored = colorFor(name);
  const catalog = team.color && team.color !== "#5e6861" ? team : undefined;
  const [k1, k2] = kitFor(id);
  const c1 = stored?.color || color || catalog?.color || k1;
  const c2 = stored?.color2 || color2 || (catalog?.color2 && catalog.color2 !== "#e8eee9" ? catalog.color2 : undefined) || k2;
  rememberColor(name, c1, c2);
  const url = badge || fotmobTeamBadge(sourceId) || espnTeamBadge(sourceId) || badgeFor(name, league);
  rememberBadge(name, url, false, league);
  return { ...team, id, name, color: c1, color2: c2, badge: url || team.badge };
}

function paint(team: Team, name: string, color?: string, form?: FormResult[]): Team {
  return {
    ...team,
    name,
    color: color ?? team.color,
    form: form ?? team.form,
    div: team.div ?? team.league,
  };
}

function oddsFromP(p: number) {
  return Math.round((1 / Math.max(0.08, Math.min(0.85, p))) * 100) / 100;
}

function formOk(form?: FormResult[]) {
  return Boolean(form && form.length >= 3);
}

function sideKnown(
  form: FormResult[] | undefined,
  venue: FormResult[] | undefined,
  attack: number | undefined,
  elo: number | undefined,
) {
  if (attack != null || elo != null) return true;
  return formOk(form) || formOk(venue);
}

/** Drop a match only when neither side has a table rating or a real form line. */
export function hasTableAndForm(row: EspnMatch) {
  return (
    sideKnown(row.homeForm, row.homeVenueForm, row.homeAttack, row.homeElo) &&
    sideKnown(row.awayForm, row.awayVenueForm, row.awayAttack, row.awayElo)
  );
}

export function viewFromEspn(row: EspnMatch): MatchView {
  const home = resolveTeam(row.homeName, row.league, row.homeAbbr, row.homeEspnId, row.homeColor, row.homeForm, {
    attack: row.homeAttack,
    defense: row.homeDefense,
    elo: row.homeElo,
    formHome: row.homeVenueForm,
    avgH: row.tableAvgHome,
    avgA: row.tableAvgAway,
    div: row.homeDiv,
  }, row.homeColor2, row.homeBadge);
  const away = resolveTeam(row.awayName, row.league, row.awayAbbr, row.awayEspnId, row.awayColor, row.awayForm, {
    attack: row.awayAttack,
    defense: row.awayDefense,
    elo: row.awayElo,
    formAway: row.awayVenueForm,
    avgH: row.tableAvgHome,
    avgA: row.tableAvgAway,
    div: row.awayDiv,
  }, row.awayColor2, row.awayBadge);
  const pred = predict(home, away, {
    odds:
      (row.oddsBook === "bet365" || row.oddsBook === "market") && row.oddsHome && row.oddsDraw && row.oddsAway
        ? { home: row.oddsHome, draw: row.oddsDraw, away: row.oddsAway }
        : undefined,
    totals:
      row.overLine && row.oddsOver && row.oddsUnder
        ? { line: row.overLine, over: row.oddsOver, under: row.oddsUnder }
        : undefined,
    knownTeams: [home, away].filter((t) => !t.id.startsWith("e")).length,
    forebet:
      row.forebetHome != null && row.forebetDraw != null && row.forebetAway != null
        ? { pHome: row.forebetHome, pDraw: row.forebetDraw, pAway: row.forebetAway }
        : undefined,
  });
  const settled = row.state === "ft" && row.homeScore != null && row.awayScore != null;
  const fixture: Fixture = {
    id: fixtureIdFor(row),
    league: row.league,
    kickoff: row.kickoff,
    venue: row.venue || `${LEAGUES[row.league]?.name ?? ""}`,
    homeId: home.id,
    awayId: away.id,
    oddsHome: row.oddsHome ?? oddsFromP(pred.pHome),
    oddsDraw: row.oddsDraw ?? oddsFromP(pred.pDraw),
    oddsAway: row.oddsAway ?? oddsFromP(pred.pAway),
    status: settled ? "settled" : "upcoming",
    actualHome: row.homeScore ?? undefined,
    actualAway: row.awayScore ?? undefined,
    clock: row.clock,
    feedState: row.state,
    sources: row.sources,
  };
  const view: MatchView = { fixture, home, away, pred };
  if (settled && fixture.actualHome != null && fixture.actualAway != null) {
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

export function boardPool(rows: EspnMatch[], keys: string[]) {
  const allow = new Set(keys);
  const pool = rows.filter(
    (r) => allow.has(dayKey(r.kickoff)) && isKnownLeague(r.league) && !isWomensComp(r.homeName, r.awayName),
  );
  const rated = pool.filter(hasTableAndForm);
  const ratedLeagues = new Set(rated.map((r) => r.league));
  const keep = rated.length ? pool.filter((r) => ratedLeagues.has(r.league) || hasTableAndForm(r)) : pool;
  return collapseDuplicates(keep, true);
}

export function boardFromFeed(rows: EspnMatch[], leagues: LeagueId[] = [], tab: BoardTab | "both" = "both") {
  const keys = tab === "both" ? [todayKeyNow(), tomorrowKeyNow()] : [tab === "tomorrow" ? tomorrowKeyNow() : todayKeyNow()];
  const pool = boardPool(rows, keys).filter((r) => leagues.length === 0 || leagues.includes(r.league));
  return pool.map(viewFromEspn).sort((a, b) => a.fixture.kickoff.localeCompare(b.fixture.kickoff));
}

export function scoresFromFeed(rows: EspnMatch[]): FeedScore[] {
  const out: FeedScore[] = [];
  for (const r of rows) {
    if (r.state === "scheduled") continue;
    if (r.homeScore == null || r.awayScore == null) continue;
    const view = viewFromEspn(r);
    out.push({
      id: view.fixture.id,
      home: r.homeScore,
      away: r.awayScore,
      state: r.state === "ft" ? "ft" : "live",
      clock: r.clock,
    });
  }
  return out;
}

export function findFeedView(rows: EspnMatch[], id: string): MatchView | undefined {
  const needle = id.startsWith("espn-") ? id.slice(5) : id;
  for (const r of rows) {
    const v = viewFromEspn(r);
    if (v.fixture.id === id || r.espnId === id || r.espnId === needle || fixtureIdFor(r) === id) return v;
  }
  return undefined;
}

export function feedLeagues(rows: EspnMatch[], tab: BoardTab | "both" = "both"): LeagueId[] {
  const keys = tab === "both" ? [todayKeyNow(), tomorrowKeyNow()] : [tab === "tomorrow" ? tomorrowKeyNow() : todayKeyNow()];
  const present = new Set<LeagueId>();
  const rated = new Set<LeagueId>();
  for (const r of rows) {
    if (!keys.includes(dayKey(r.kickoff)) || !isKnownLeague(r.league) || isWomensComp(r.homeName, r.awayName)) continue;
    present.add(r.league);
    if (hasTableAndForm(r)) rated.add(r.league);
  }
  const use = rated.size ? rated : present;
  return (Object.keys(LEAGUES) as LeagueId[]).filter((id) => use.has(id));
}

export function mergeArchive(prev: EspnMatch[], rows: EspnMatch[]) {
  const ft = rows.filter(
    (r) => r.state === "ft" && r.homeScore != null && r.awayScore != null && !isWomensComp(r.homeName, r.awayName),
  );
  return collapseDuplicates([...prev.filter((r) => isKnownLeague(r.league) && !isWomensComp(r.homeName, r.awayName)), ...ft.filter((r) => isKnownLeague(r.league))]).sort((a, b) =>
    a.kickoff.localeCompare(b.kickoff),
  );
}

export function mergeBoard(prev: EspnMatch[], next: EspnMatch[]) {
  const keep = new Set([yesterdayKeyNow(), todayKeyNow(), tomorrowKeyNow()]);
  const freshLeagues = new Set(next.map((r) => r.league));
  const keptPrev = prev.filter((r) => {
    if (!isKnownLeague(r.league) || !keep.has(dayKey(r.kickoff)) || isWomensComp(r.homeName, r.awayName)) return false;
    if (next.some((n) => n.league !== r.league && sameFixture(r, n))) return false;
    if (r.league === "K1" && !next.some((n) => n.league === "K1" && sameFixture(r, n))) return false;
    if (!freshLeagues.has(r.league)) return true;
    return next.some((n) => sameFixture(r, n));
  });
  const combined = [...keptPrev, ...next].filter(
    (r) => isKnownLeague(r.league) && keep.has(dayKey(r.kickoff)) && !isWomensComp(r.homeName, r.awayName),
  );
  return collapseDuplicates(combined, true);
}
