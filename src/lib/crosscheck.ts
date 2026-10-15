import { dayKey } from "./format";
import { fold, type EspnMatch } from "./espn";
import { verifyBet365 } from "./books";
import { LEAGUES, type LeagueId } from "./types";

const GENERIC = new Set([
  "fc", "cf", "fk", "nk", "afc", "sc", "sk", "as", "ss", "ud", "cd", "rc", "sv", "if", "bk", "il", "tb",
  "pfc", "vfl", "vfb", "vsg", "rb", "bsc", "tsv", "club", "calcio", "de", "the", "sa", "ec", "ac", "sporte",
  "of", "and", "hotspur", "wanderers",
]);

const TOKEN_ALIAS: Record<string, string> = {
  vienna: "wien",
  wien: "wien",
  cologne: "koln",
  koln: "koln",
  munchen: "munich",
  muenchen: "munich",
  utd: "united",
  man: "manchester",
  spurs: "tottenham",
  psg: "paris",
  hearts: "heart",
  saint: "st",
  internacional: "inter",
  atletico: "atletico",
  athlethic: "athletic",
  lisbon: "lisboa",
};

const STATE = new Set([
  "ac", "al", "am", "ap", "ba", "ce", "df", "es", "go", "ma", "mg", "ms", "mt", "pa", "pb", "pe", "pi", "pr",
  "rj", "rn", "ro", "rr", "rs", "sc", "se", "sp", "to",
]);

const AMBIGUOUS = new Set([
  "botafogo", "america", "atletico", "sport", "internacional", "operario", "nacional", "uniao", "river",
  "ferroviaria", "ferroviario", "comercial", "guarani", "vitoria", "santa", "paysandu", "united", "city",
  "santos", "sporting", "rangers", "leon", "atlas", "pumas", "tigres", "racing", "independiente",
]);

const CLUB_LABEL: Record<string, string> = {
  "mexico|santos": "Santos Laguna",
  "mexico|america": "Club América",
  "mexico|pumas": "Pumas UNAM",
  "mexico|tigres": "Tigres UANL",
  "mexico|leon": "Club León",
  "mexico|chivas": "Guadalajara",
  "mexico|guadalajara": "Guadalajara",
  "brazil|santos": "Santos",
  "brazil|sport": "Sport Recife",
  "brazil|america": "América-MG",
  "portugal|sporting": "Sporting CP",
  "unitedstates|sporting": "Sporting Kansas City",
  "argentina|river": "River Plate",
  "argentina|racing": "Racing Club",
  "argentina|independiente": "Independiente",
  "uruguay|nacional": "Nacional",
  "colombia|nacional": "Atlético Nacional",
  "paraguay|nacional": "Nacional (PAR)",
  "ecuador|independiente": "Independiente del Valle",
  "scotland|rangers": "Rangers",
};

function countryTag(country?: string) {
  return country ? fold(country).replace(/[^a-z]/g, "").slice(0, 12) : "";
}

export function clubLabel(name: string, league?: LeagueId) {
  if (!league) return name;
  const country = countryTag(LEAGUES[league].country);
  const k = clubKey(name);
  return CLUB_LABEL[`${country}|${k}`] ?? name;
}

function scopedKey(name: string, country?: string) {
  let k = clubKey(name);
  if (!k) return "";
  const tag = countryTag(country);
  if (tag) {
    const label = CLUB_LABEL[`${tag}|${k}`];
    if (label) k = clubKey(label);
  }
  return tag ? `${tag}|${k}` : k;
}

const CLUB_ALIAS: Record<string, string> = {
  "america mineiro": "americamg",
  "atletico mineiro": "atleticomg",
  "atletico goianiense": "atleticogo",
  "athletic club": "athleticmg",
  "athletic mg": "athleticmg",
  "gremio novorizontino": "novorizontino",
  "novorizontino sp": "novorizontino",
  "operario ferroviario": "operariopr",
  "operario pr": "operariopr",
  "vila nova fc": "vilanova",
  "vila nova": "vilanova",
  "sport recife": "sportrecife",
  "sao bernardo": "saobernardo",
  "ponte preta": "pontepreta",
  "heart midlothian": "heart",
  "heart": "heart",
  "rapid wien": "rapidwien",
  "sk rapid wien": "rapidwien",
  "paris st germain": "paris",
  "paris germain": "paris",
  "paris sg": "paris",
  "internazionale": "internazionale",
  "inter milan": "internazionale",
  "brighton hove albion": "brighton",
  "wolverhampton": "wolves",
  "tottenham": "tottenham",
  "nott forest": "nottinghamforest",
  "nottingham forest": "nottinghamforest",
  "nottm forest": "nottinghamforest",
  "beasat kermanshah": "besatkermanshah",
  "besat kermanshah": "besatkermanshah",
};

function rawTokens(name: string) {
  return fold(name)
    .replace(/-/g, " ")
    .replace(/\b(19|20)\d{2}\b/g, " ")
    .replace(/\b\d+\.?\b/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !GENERIC.has(t))
    .map((t) => TOKEN_ALIAS[t] ?? t);
}

function tokens(name: string) {
  return rawTokens(name);
}

export function clubKey(name: string) {
  if (!name) return "";
  const t = rawTokens(name);
  if (t.length >= 2 && STATE.has(t[t.length - 1]!)) {
    const st = t.pop()!;
    t[t.length - 1] = `${t[t.length - 1]}${st}`;
  }
  const joined = t.join(" ");
  return CLUB_ALIAS[joined] ?? joined.replace(/\s+/g, "");
}

export function nameKey(name: string) {
  return clubKey(name) || tokens(name).join(" ");
}

function baseKey(key: string) {
  for (const st of STATE) {
    if (key.endsWith(st) && key.length > st.length + 3) return key.slice(0, -st.length);
  }
  return key;
}

export function clubsMatch(a: string, b: string) {
  const ka = clubKey(a);
  const kb = clubKey(b);
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  if (ka.includes(kb) || kb.includes(ka)) {
    const short = ka.length <= kb.length ? ka : kb;
    const long = ka.length <= kb.length ? kb : ka;
    if (short.length >= 5 && long.includes(short)) {
      const extra = long.replace(short, "");
      if (!extra) return true;
      if (STATE.has(extra) && !AMBIGUOUS.has(short)) return true;
      if (TAIL.has(extra) && !AMBIGUOUS.has(short) && !KEEP_TAIL.has(short)) return true;
      if (short.length >= 8 && !AMBIGUOUS.has(short) && !KEEP_TAIL.has(short) && !LEAD.has(short)) return true;
      return false;
    }
  }
  const ba = baseKey(ka);
  const bb = baseKey(kb);
  if (nearKey(ka, kb)) return true;
  if (ba !== bb || ba.length < 4) return false;
  const sa = ka.slice(ba.length);
  const sb = kb.slice(bb.length);
  if (sa && sb) return sa === sb;
  if (AMBIGUOUS.has(ba)) return false;
  return true;
}

/** One inserted, dropped or swapped letter. Beasat and Besat are the same club. */
function nearKey(a: string, b: string) {
  if (!a || !b || a === b) return a === b;
  const [s, l] = a.length <= b.length ? [a, b] : [b, a];
  if (s.length < 8 || l.length - s.length > 1) return false;
  let diffs = 0;
  let i = 0;
  let j = 0;
  while (i < s.length && j < l.length) {
    if (s[i] === l[j]) {
      i += 1;
      j += 1;
      continue;
    }
    diffs += 1;
    if (diffs > 1) return false;
    if (s.length === l.length) {
      i += 1;
      j += 1;
    } else {
      j += 1;
    }
  }
  return diffs + (l.length - j) === 1;
}

const TAIL = new Set([
  "united",
  "town",
  "city",
  "rovers",
  "harriers",
  "athletic",
  "wanderers",
  "albion",
  "hotspur",
  "county",
  "alexandra",
  "argyle",
  "orient",
]);
const KEEP_TAIL = new Set([
  "manchester",
  "sheffield",
  "bristol",
  "dundee",
  "nottingham",
  "notts",
  "real",
  "atletico",
  "inter",
  "milan",
  "dynamo",
  "sparta",
  "rapid",
  "olympique",
  "paris",
  "sporting",
  "santos",
  "racing",
  "nacional",
  "junior",
  "america",
]);
const LEAD = new Set([
  "deportivo",
  "atletico",
  "athletic",
  "sporting",
  "club",
  "real",
  "inter",
  "union",
  "uniao",
  "asociacion",
  "association",
]);

function coreTokens(name: string) {
  let t = rawTokens(name).map((w) => (w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w));
  const keep = t.some((w) => KEEP_TAIL.has(w) || AMBIGUOUS.has(w));
  if (!keep && t.length >= 2 && TAIL.has(t[t.length - 1]!) && t.slice(0, -1).join("").length >= 5) {
    t = t.slice(0, -1);
  }
  const lead = t[0];
  if (
    t.length >= 2 &&
    lead &&
    lead.length >= 8 &&
    !AMBIGUOUS.has(lead) &&
    !KEEP_TAIL.has(lead) &&
    !LEAD.has(lead)
  ) {
    t = [lead];
  }
  return t;
}

function phonetic(token: string) {
  return token
    .replace(/ph/g, "f")
    .replace(/kh/g, "h")
    .replace(/gh/g, "g")
    .replace(/q/g, "k")
    .replace(/w/g, "v")
    .replace(/(.)\1+/g, "$1");
}

function looseKey(name: string) {
  const k = coreTokens(name).map(phonetic).sort().join("");
  if (k.length < 4) return clubKey(name);
  return k[0] + k.slice(1).replace(/[aeiou]/g, "");
}

const TEAM_IDS = new Map<string, string>();
const TEAM_BASE = new Map<string, string>();
const TOKEN_INDEX = new Map<string, Set<string>>();
const TEAM_ALIASES = new Map<string, string[]>();

function indexClubKey(k: string) {
  const parts = k.replace(/([a-z]{4,})/g, " $1 ").split(/\s+/).filter((t) => t.length >= 4);
  const toks = parts.length ? parts : k.length >= 4 ? [k] : [];
  for (const t of toks) {
    const set = TOKEN_INDEX.get(t) ?? new Set<string>();
    set.add(k);
    TOKEN_INDEX.set(t, set);
  }
}

function aliasKeys(name: string, league?: LeagueId, country?: string) {
  const ck = clubKey(name);
  const lk = looseKey(name);
  const raw = fold(name).replace(/[^a-z0-9]+/g, "");
  const keys: string[] = [];
  if (league) {
    if (lk) keys.push(`${league}|~${lk}`);
    if (ck) keys.push(`${league}|${ck}`);
    if (raw && raw !== ck) keys.push(`${league}|@${raw}`);
  } else if (country) {
    const tag = countryTag(country);
    if (tag && lk) keys.push(`${tag}|~${lk}`);
    if (tag && ck) keys.push(`${tag}|${ck}`);
  } else if (lk) {
    keys.push(`~${lk}`);
    if (ck && ck !== lk) keys.push(ck);
  }
  return keys;
}

function noteAlias(id: string, name: string) {
  if (!id || !name) return;
  const list = TEAM_ALIASES.get(id) ?? [];
  if (!list.includes(name)) {
    list.push(name);
    TEAM_ALIASES.set(id, list);
  }
}

function bindId(keys: string[], id: string, name: string) {
  for (const key of keys) {
    TEAM_IDS.set(key, id);
    indexClubKey(key);
  }
  noteAlias(id, name);
}

function findInLeague(name: string, league: LeagueId) {
  const prefix = `${league}|`;
  const ck = clubKey(name);
  const lk = looseKey(name);
  for (const [key, id] of TEAM_IDS) {
    if (!key.startsWith(prefix)) continue;
    const marked = key.slice(prefix.length);
    const bare = marked.replace(/^@/, "").replace(/^~/, "");
    if (!bare) continue;
    if (marked.startsWith("~")) {
      if (bare === lk) return id;
      continue;
    }
    if (bare === ck || bare === lk || looseKey(bare) === lk || clubsMatch(name, bare)) return id;
  }
  return undefined;
}

function candidatesFor(k: string) {
  const out = new Set<string>();
  const parts = k.replace(/([a-z]{4,})/g, " $1 ").split(/\s+/).filter((t) => t.length >= 4);
  for (const t of parts.length ? parts : [k]) {
    for (const key of TOKEN_INDEX.get(t) ?? []) out.add(key);
  }
  return out;
}

export function loadTeamIds(raw?: Record<string, string>) {
  if (!raw) return;
  for (const [k, v] of Object.entries(raw)) {
    if (k && v) {
      TEAM_IDS.set(k, v);
      indexClubKey(k);
      const b = baseKey(k);
      if (b.length >= 4 && !AMBIGUOUS.has(b)) TEAM_BASE.set(b, TEAM_BASE.get(b) ?? v);
    }
  }
}

export function dumpTeamIds() {
  return Object.fromEntries(TEAM_IDS);
}

export function teamAliases(id: string) {
  return TEAM_ALIASES.get(id) ?? [];
}

const TEAM_COLORS = new Map<string, { color: string; color2: string }>();

export function rememberColor(name: string, color?: string, color2?: string) {
  if (!color) return;
  const id = teamIdFor(name);
  const prev = TEAM_COLORS.get(id);
  TEAM_COLORS.set(id, { color: prev?.color ?? color, color2: color2 || prev?.color2 || "#e8eee9" });
}

export function colorFor(name: string) {
  return TEAM_COLORS.get(teamIdFor(name));
}

export function loadTeamColors(raw?: Record<string, { color?: string; color2?: string }>) {
  if (!raw) return;
  for (const [id, v] of Object.entries(raw)) {
    if (id && v?.color) TEAM_COLORS.set(id, { color: v.color, color2: v.color2 || "#e8eee9" });
  }
}

export function dumpTeamColors() {
  return Object.fromEntries(TEAM_COLORS);
}

export function teamIdFor(name: string, hint?: string, country?: string, league?: LeagueId) {
  const keys = aliasKeys(name, league, country);
  const k = keys[0];
  if (!k) return hint || "tunk";
  for (const key of keys) {
    const hit = TEAM_IDS.get(key);
    if (hit) {
      bindId(keys, hit, name);
      return hit;
    }
  }
  if (league) {
    const inLeague = findInLeague(name, league);
    if (inLeague) {
      bindId(keys, inLeague, name);
      return inLeague;
    }
  }
  if (country) {
    const legacy = TEAM_IDS.get(`${countryTag(country)}|${clubKey(name)}`);
    if (legacy) {
      bindId(keys, legacy, name);
      return legacy;
    }
  }
  const bare = clubKey(name);
  const base = baseKey(bare);
  const via = league || country || AMBIGUOUS.has(base) ? undefined : TEAM_BASE.get(base);
  if (via) {
    bindId(keys, via, name);
    return via;
  }
  const id = hint && /^[a-z][a-z0-9]{1,16}$/.test(hint) ? hint : `t${(league ?? countryTag(country) ?? "")}${bare}`.replace(/[^a-z0-9]/g, "").slice(0, 32);
  bindId(keys, id, name);
  if (!league && !country && base.length >= 4 && !AMBIGUOUS.has(base)) TEAM_BASE.set(base, TEAM_BASE.get(base) ?? id);
  return id;
}

export function rememberTeamId(name: string, id: string, country?: string, league?: LeagueId) {
  const keys = aliasKeys(name, league, country);
  if (!keys.length || !id) return;
  const existing = league ? findInLeague(name, league) : keys.map((key) => TEAM_IDS.get(key)).find(Boolean);
  bindId(keys, existing ?? id, name);
}

export function lockTeamsFrom(rows: EspnMatch[]) {
  const ordered = [...rows].sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  for (const r of ordered) {
    const country = LEAGUES[r.league]?.country;
    teamIdFor(r.homeName, undefined, country, r.league);
    teamIdFor(r.awayName, undefined, country, r.league);
  }
}

export function fixtureIdFor(row: { kickoff: string; homeName: string; awayName: string; league?: LeagueId }) {
  const country = row.league && row.league in LEAGUES ? LEAGUES[row.league].country : undefined;
  const hid = teamIdFor(row.homeName, undefined, country, row.league);
  const aid = teamIdFor(row.awayName, undefined, country, row.league);
  return `fx-${dayKey(row.kickoff)}-${hid}-${aid}`;
}

export function namesMatch(a: string, b: string) {
  if (clubsMatch(a, b)) return true;
  const fa = fold(a);
  const fb = fold(b);
  if (fa === fb) return true;
  const ta = tokens(a);
  const tb = tokens(b);
  if (!ta.length || !tb.length) return false;
  if (ta.join(" ") === tb.join(" ")) return true;
  const [short, long] = fa.length <= fb.length ? [fa, fb] : [fb, fa];
  if (short.length >= 12 && long.includes(short)) return true;
  const setB = new Set(tb);
  const hit = ta.filter((t) => setB.has(t) || [...setB].some((x) => x.startsWith(t) || t.startsWith(x))).length;
  const min = Math.min(ta.length, tb.length);
  if (min === 1) {
    const one = ta.length === 1 ? ta[0]! : tb[0]!;
    const other = ta.length === 1 ? tb : ta;
    return one.length >= 5 && (other[0] === one || other[other.length - 1] === one);
  }
  return hit / min >= 0.7 && hit >= 1;
}

export function sameFixture(a: EspnMatch, b: EspnMatch) {
  const dt = Math.abs(Date.parse(a.kickoff) - Date.parse(b.kickoff));
  if (!Number.isFinite(dt) || dt > 30 * 3600_000) return false;
  const homes =
    clubsMatch(a.homeName, b.homeName) || namesMatch(a.homeName, b.homeName);
  const aways =
    clubsMatch(a.awayName, b.awayName) || namesMatch(a.awayName, b.awayName);
  if (homes && aways) return true;
  const swapped =
    (clubsMatch(a.homeName, b.awayName) || namesMatch(a.homeName, b.awayName)) &&
    (clubsMatch(a.awayName, b.homeName) || namesMatch(a.awayName, b.homeName));
  return swapped;
}

function stamp(row: EspnMatch) {
  return `${dayKey(row.kickoff)}|${clubKey(row.homeName)}|${clubKey(row.awayName)}`;
}

type Bucket = {
  espn?: EspnMatch;
  fotmob?: EspnMatch;
  flashscore?: EspnMatch;
  forebet?: EspnMatch;
  books?: EspnMatch;
};

function findBucket(map: Map<string, Bucket>, byDay: Map<string, string[]>, row: EspnMatch) {
  const exact = stamp(row);
  if (map.has(exact)) return exact;
  const day = dayKey(row.kickoff);
  const nearby = [day];
  const t = Date.parse(row.kickoff);
  if (Number.isFinite(t)) {
    nearby.push(dayKey(new Date(t - 18 * 3600_000).toISOString()));
    nearby.push(dayKey(new Date(t + 18 * 3600_000).toISOString()));
  }
  const seen = new Set<string>();
  for (const d of nearby) {
    for (const k of byDay.get(d) ?? []) {
      if (seen.has(k)) continue;
      seen.add(k);
      const b = map.get(k);
      const sample = b?.espn ?? b?.fotmob ?? b?.flashscore ?? b?.forebet ?? b?.books;
      if (!sample) continue;
      if (sameFixture(sample, row)) return k;
    }
  }
  return exact;
}

function rowRank(r: EspnMatch) {
  const uefa: Record<string, number> = {
    UCL: 6,
    UCLQ: 5,
    UEL: 4,
    UELQ: 3,
    ECL: 2,
    ECLQ: 1,
    USC: 4,
    ACL: 8,
    ACL2: 5,
  };
  let s = uefa[r.league] ?? 0;
  if (r.state === "live") s += 100;
  if (r.state === "ft") s += 50;
  if (r.oddsHome) s += 8;
  const id = String(r.espnId);
  if (!id.startsWith("fm") && !id.startsWith("fs") && !id.startsWith("fb") && !id.startsWith("bk")) s += 12;
  if (r.sources?.fotmob) s += 4;
  return s;
}

function pickKickoff(rows: EspnMatch[]) {
  const times = rows.map((r) => Date.parse(r.kickoff)).filter((n) => Number.isFinite(n));
  if (!times.length) return rows[0]!.kickoff;
  times.sort((a, b) => a - b);
  return new Date(times[Math.floor(times.length / 2)]!).toISOString();
}

function pickName(rows: EspnMatch[], side: "home" | "away") {
  const espn = rows.find((r) => r.sources?.espn);
  const fotmob = rows.find((r) => r.sources?.fotmob);
  const preferred = espn ?? fotmob;
  if (preferred) return side === "home" ? preferred.homeName : preferred.awayName;
  const names = rows.map((r) => (side === "home" ? r.homeName : r.awayName)).filter(Boolean);
  return names.sort((a, b) => b.length - a.length)[0] ?? rows[0]![side === "home" ? "homeName" : "awayName"];
}

function pickColor(rows: EspnMatch[], side: "home" | "away") {
  const espn = rows.find((r) => r.sources?.espn);
  const fotmob = rows.find((r) => r.sources?.fotmob);
  const from = espn ?? fotmob ?? rows.find((r) => (side === "home" ? r.homeColor : r.awayColor));
  return side === "home" ? from?.homeColor : from?.awayColor;
}

function pickColor2(rows: EspnMatch[], side: "home" | "away") {
  const espn = rows.find((r) => r.sources?.espn);
  const from = espn ?? rows.find((r) => (side === "home" ? r.homeColor2 : r.awayColor2));
  return side === "home" ? from?.homeColor2 : from?.awayColor2;
}

function pickScore(rows: EspnMatch[]) {
  const scored = rows.filter((r) => r.homeScore != null && r.awayScore != null);
  if (scored.length >= 2) {
    const key = (r: EspnMatch) => `${r.homeScore}-${r.awayScore}`;
    const counts = new Map<string, EspnMatch[]>();
    for (const r of scored) {
      const k = key(r);
      const arr = counts.get(k) ?? [];
      arr.push(r);
      counts.set(k, arr);
    }
    const agreed = [...counts.values()].sort((a, b) => b.length - a.length)[0];
    if (agreed && agreed.length >= 2) return { home: agreed[0]!.homeScore, away: agreed[0]!.awayScore };
  }
  const live = rows.find((r) => r.state === "live" && r.homeScore != null);
  if (live) return { home: live.homeScore, away: live.awayScore };
  const ft = rows.find((r) => r.state === "ft" && r.homeScore != null);
  if (ft) return { home: ft.homeScore, away: ft.awayScore };
  const any = scored[0];
  return { home: any?.homeScore ?? null, away: any?.awayScore ?? null };
}

function pickState(rows: EspnMatch[]): EspnMatch["state"] {
  if (rows.some((r) => r.state === "live")) return "live";
  const ft = rows.filter((r) => r.state === "ft").length;
  if (ft >= 2 || (ft === 1 && rows.length === 1)) return "ft";
  if (ft === 1 && rows.every((r) => r.state === "ft" || Date.parse(r.kickoff) < Date.now() - 2 * 3600_000)) return "ft";
  return "scheduled";
}

function meanOdds(rows: EspnMatch[], key: "oddsHome" | "oddsDraw" | "oddsAway" | "oddsOver" | "oddsUnder") {
  const xs = rows.map((r) => r[key]).filter((n): n is number => typeof n === "number" && n > 1.01 && n < 81);
  if (!xs.length) return undefined;
  return Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100;
}

function amalgamate(rows: EspnMatch[]): EspnMatch {
  const ranked = [...rows].sort((a, b) => rowRank(b) - rowRank(a));
  const base = ranked[0]!;
  const score = pickScore(rows);
  const state = pickState(rows);
  const clock =
    rows.find((r) => r.state === "live" && r.clock)?.clock ||
    (state === "ft" ? "FT" : state === "live" ? rows.find((r) => r.clock)?.clock ?? "" : "");
  const afc = rows.find((g) => g.league === "ACL" || g.league === "ACL2");
  const espn = rows.find((r) => r.sources?.espn);
  const fotmob = rows.find((r) => r.sources?.fotmob);
  const homeName = clubLabel(pickName(rows, "home"), base.league);
  const awayName = clubLabel(pickName(rows, "away"), base.league);
  const country = LEAGUES[base.league]?.country;
  const hid = teamIdFor(homeName, undefined, country, base.league);
  const aid = teamIdFor(awayName, undefined, country, base.league);
  for (const r of rows) {
    rememberTeamId(r.homeName, hid, country, base.league);
    rememberTeamId(r.awayName, aid, country, base.league);
    rememberTeamId(homeName, hid, country, base.league);
    rememberTeamId(awayName, aid, country, base.league);
  }
  rememberColor(homeName, pickColor(rows, "home"), pickColor2(rows, "home"));
  rememberColor(awayName, pickColor(rows, "away"), pickColor2(rows, "away"));
  const bet365 = rows.find((r) => r.oddsBook === "bet365" && r.oddsHome && r.oddsDraw && r.oddsAway);
  return {
    ...base,
    league: afc?.league ?? base.league,
    espnId: espn?.espnId ?? fotmob?.espnId ?? base.espnId,
    kickoff: pickKickoff(rows),
    homeName,
    awayName,
    homeColor: pickColor(rows, "home"),
    awayColor: pickColor(rows, "away"),
    homeColor2: pickColor2(rows, "home"),
    awayColor2: pickColor2(rows, "away"),
    homeBadge: fotmob?.homeBadge || espn?.homeBadge || rows.find((r) => r.homeBadge)?.homeBadge,
    awayBadge: fotmob?.awayBadge || espn?.awayBadge || rows.find((r) => r.awayBadge)?.awayBadge,
    homeEspnId: /^\d+$/.test(fotmob?.homeEspnId ?? "") ? fotmob!.homeEspnId : hid,
    awayEspnId: /^\d+$/.test(fotmob?.awayEspnId ?? "") ? fotmob!.awayEspnId : aid,
    homeScore: score.home,
    awayScore: score.away,
    state,
    clock,
    oddsHome: bet365?.oddsHome,
    oddsDraw: bet365?.oddsDraw,
    oddsAway: bet365?.oddsAway,
    oddsBook: bet365 ? "bet365" : undefined,
    espnOddsHome: rows.find((r) => r.espnOddsHome != null)?.espnOddsHome,
    espnOddsDraw: rows.find((r) => r.espnOddsDraw != null)?.espnOddsDraw,
    espnOddsAway: rows.find((r) => r.espnOddsAway != null)?.espnOddsAway,
    oddsChecks: rows.find((r) => r.oddsChecks?.length)?.oddsChecks,
    overLine: rows.find((r) => r.overLine)?.overLine,
    oddsOver: meanOdds(rows, "oddsOver"),
    oddsUnder: meanOdds(rows, "oddsUnder"),
    homeForm: rows.find((r) => r.homeForm?.length)?.homeForm ?? base.homeForm,
    awayForm: rows.find((r) => r.awayForm?.length)?.awayForm ?? base.awayForm,
    homeVenueForm: rows.find((r) => r.homeVenueForm?.length)?.homeVenueForm,
    awayVenueForm: rows.find((r) => r.awayVenueForm?.length)?.awayVenueForm,
    homeAttack: rows.find((r) => r.homeAttack != null)?.homeAttack,
    homeDefense: rows.find((r) => r.homeDefense != null)?.homeDefense,
    homeElo: rows.find((r) => r.homeElo != null)?.homeElo,
    awayAttack: rows.find((r) => r.awayAttack != null)?.awayAttack,
    awayDefense: rows.find((r) => r.awayDefense != null)?.awayDefense,
    awayElo: rows.find((r) => r.awayElo != null)?.awayElo,
    forebetHome: rows.find((r) => r.forebetHome != null)?.forebetHome,
    forebetDraw: rows.find((r) => r.forebetDraw != null)?.forebetDraw,
    forebetAway: rows.find((r) => r.forebetAway != null)?.forebetAway,
    sources: {
      espn: rows.some((g) => g.sources?.espn || (!String(g.espnId).startsWith("fm") && !String(g.espnId).startsWith("fs") && !String(g.espnId).startsWith("fb") && !String(g.espnId).startsWith("bk"))),
      fotmob: rows.some((g) => g.sources?.fotmob || String(g.espnId).startsWith("fm")),
      flashscore: rows.some((g) => g.sources?.flashscore || String(g.espnId).startsWith("fs")),
      forebet: rows.some((g) => g.sources?.forebet || String(g.espnId).startsWith("fb")),
      books: rows.some((g) => g.sources?.books || String(g.espnId).startsWith("bk")),
    },
    listed: rows.some((r) => r.listed) || base.listed,
  };
}

function merge(bucket: Bucket): EspnMatch {
  const rows = [bucket.espn, bucket.fotmob, bucket.flashscore, bucket.forebet, bucket.books].filter(Boolean) as EspnMatch[];
  return amalgamate(rows);
}

export function crossCheck(
  espn: EspnMatch[],
  fotmob: EspnMatch[],
  flashscore: EspnMatch[],
  forebet: EspnMatch[] = [],
  books: EspnMatch[] = [],
) {
  return collapseDuplicates([...espn, ...fotmob, ...flashscore, ...forebet, ...books], true);
}

function groupName(name: string, league?: LeagueId) {
  return teamIdFor(name, undefined, league ? LEAGUES[league].country : undefined, league);
}

/** Same clubs and day → one row. Name matching is server-only; the board stays on ids. */
export function collapseDuplicates(rows: EspnMatch[], fuzzy = false): EspnMatch[] {
  const byPair = new Map<string, EspnMatch[]>();
  for (const r of rows) {
    const country = LEAGUES[r.league]?.country;
    const h = teamIdFor(r.homeName, undefined, country, r.league);
    const a = teamIdFor(r.awayName, undefined, country, r.league);
    if (!h || !a) continue;
    const day = dayKey(r.kickoff);
    const hk = looseKey(r.homeName);
    const ak = looseKey(r.awayName);
    const pair =
      hk.length >= 6 && ak.length >= 6 && hk !== ak
        ? `${day}|${country ?? r.league}|${hk < ak ? `${hk}|${ak}` : `${ak}|${hk}`}`
        : h < a
          ? `${day}|${h}|${a}`
          : `${day}|${a}|${h}`;
    const list = byPair.get(pair) ?? [];
    list.push(r);
    byPair.set(pair, list);
  }
  let groups = [...byPair.values()];
  if (fuzzy) {
    const byDay = new Map<string, EspnMatch[][]>();
    for (const group of groups) {
      const day = dayKey(group[0]!.kickoff);
      const list = byDay.get(day) ?? [];
      list.push(group);
      byDay.set(day, list);
    }
    const merged: EspnMatch[][] = [];
    for (const dayGroups of byDay.values()) {
      const used = new Set<number>();
      for (let i = 0; i < dayGroups.length; i++) {
        if (used.has(i)) continue;
        const acc = dayGroups[i]!.slice();
        used.add(i);
        const head = acc[0]!;
        for (let j = i + 1; j < dayGroups.length; j++) {
          if (used.has(j)) continue;
          if (!sameFixture(head, dayGroups[j]![0]!)) continue;
          acc.push(...dayGroups[j]!);
          used.add(j);
        }
        merged.push(acc);
      }
    }
    groups = merged;
  }
  const out = groups.map((g) => amalgamate(g));
  out.sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  return out;
}

export function overlayLive(base: EspnMatch[], live: EspnMatch[]): EspnMatch[] {
  if (!base.length || !live.length) return base;
  const scored = live.filter((r) => r.state === "live" || r.state === "ft");
  if (!scored.length) return base;
  return base.map((row) => {
    const hit = scored.find((f) => sameFixture(row, f));
    if (!hit) return row;
    return {
      ...row,
      homeScore: hit.homeScore ?? row.homeScore,
      awayScore: hit.awayScore ?? row.awayScore,
      state: hit.state === "live" || (hit.state === "ft" && row.state !== "live") ? hit.state : row.state,
      clock: hit.clock || row.clock,
      sources: { ...row.sources, flashscore: true },
    };
  });
}

function bookNames(row: EspnMatch, other: EspnMatch) {
  if (other.league !== row.league) return false;
  if (other.oddsBook !== "bet365" && other.oddsBook !== "market") return false;
  const home = clubsMatch(row.homeName, other.homeName) || namesMatch(row.homeName, other.homeName);
  const away = clubsMatch(row.awayName, other.awayName) || namesMatch(row.awayName, other.awayName);
  return home && away;
}

export function overlayModel(base: EspnMatch[], extra: EspnMatch[]): EspnMatch[] {
  if (!base.length || !extra.length) return base;
  return base.map((row) => {
    const hit = extra.find((f) => sameFixture(row, f) || bookNames(row, f));
    if (!hit) return row;
    const priced =
      (hit.oddsBook === "bet365" || hit.oddsBook === "market") && hit.oddsHome && hit.oddsDraw && hit.oddsAway
        ? hit
        : (row.oddsBook === "bet365" || row.oddsBook === "market") && row.oddsHome
          ? row
          : undefined;
    return {
      ...row,
      oddsHome: priced?.oddsHome,
      oddsDraw: priced?.oddsDraw,
      oddsAway: priced?.oddsAway,
      oddsBook: priced?.oddsBook,
      oddsChecks: hit.oddsChecks?.length ? hit.oddsChecks : row.oddsChecks,
      espnOddsHome: hit.espnOddsHome ?? row.espnOddsHome,
      espnOddsDraw: hit.espnOddsDraw ?? row.espnOddsDraw,
      espnOddsAway: hit.espnOddsAway ?? row.espnOddsAway,
      forebetHome: hit.forebetHome ?? row.forebetHome,
      forebetDraw: hit.forebetDraw ?? row.forebetDraw,
      forebetAway: hit.forebetAway ?? row.forebetAway,
      sources: {
        ...row.sources,
        forebet: Boolean(row.sources?.forebet || hit.sources?.forebet),
        books: Boolean(row.sources?.books || hit.sources?.books || priced),
      },
    };
  });
}

function findQuotes(row: EspnMatch, extras: EspnMatch[]) {
  return extras.filter(
    (f) =>
      f.oddsHome &&
      f.oddsDraw &&
      f.oddsAway &&
      (sameFixture(row, { ...f, kickoff: row.kickoff }) ||
        ((clubsMatch(row.homeName, f.homeName) || namesMatch(row.homeName, f.homeName)) &&
          (clubsMatch(row.awayName, f.awayName) || namesMatch(row.awayName, f.awayName)))),
  );
}

export function verifyMarketOdds(rows: EspnMatch[], portal: EspnMatch[]): EspnMatch[] {
  if (!rows.length) return rows;
  return rows.map((row) => {
    const quotes = findQuotes(row, portal);
    const quotePx = quotes.map((q) => ({ home: q.oddsHome!, draw: q.oddsDraw!, away: q.oddsAway! }));
    let portalPx = quotePx[0];
    let bestN = -1;
    for (const p of quotePx) {
      const n = quotePx.filter((o) => verifyBet365(p, [o])).length;
      if (n > bestN) {
        portalPx = p;
        bestN = n;
      }
    }
    const espnPx =
      row.espnOddsHome && row.espnOddsDraw && row.espnOddsAway
        ? { home: row.espnOddsHome, draw: row.espnOddsDraw, away: row.espnOddsAway }
        : undefined;
    const bet365 =
      row.oddsBook === "bet365" && row.oddsHome && row.oddsDraw && row.oddsAway
        ? { home: row.oddsHome, draw: row.oddsDraw, away: row.oddsAway }
        : undefined;
    const checks = [...(row.oddsChecks ?? [])];
    if (quotePx.length) checks.push(...quotePx);
    if (espnPx) checks.push(espnPx);
    const listed =
      (row.oddsBook === "bet365" || row.oddsBook === "market") && row.oddsHome && row.oddsDraw && row.oddsAway
        ? { home: row.oddsHome, draw: row.oddsDraw, away: row.oddsAway }
        : undefined;
    if (bet365) {
      if (!checks.length || verifyBet365(bet365, checks)) {
        return {
          ...row,
          oddsHome: bet365.home,
          oddsDraw: bet365.draw,
          oddsAway: bet365.away,
          oddsBook: "bet365" as const,
          oddsChecks: checks,
        };
      }
      return { ...row, oddsHome: undefined, oddsDraw: undefined, oddsAway: undefined, oddsBook: undefined };
    }
    if (portalPx && listed && !verifyBet365(portalPx, [listed])) {
      return { ...row, oddsHome: undefined, oddsDraw: undefined, oddsAway: undefined, oddsBook: undefined };
    }
    if (portalPx && (!espnPx || verifyBet365(portalPx, [espnPx]))) {
      return {
        ...row,
        oddsHome: portalPx.home,
        oddsDraw: portalPx.draw,
        oddsAway: portalPx.away,
        oddsBook: "market" as const,
        oddsChecks: checks,
      };
    }
    if (espnPx) {
      return {
        ...row,
        oddsHome: espnPx.home,
        oddsDraw: espnPx.draw,
        oddsAway: espnPx.away,
        oddsBook: "market" as const,
        oddsChecks: checks,
      };
    }
    if (listed) return { ...row, oddsChecks: checks };
    return { ...row, oddsHome: undefined, oddsDraw: undefined, oddsAway: undefined, oddsBook: undefined };
  });
}
