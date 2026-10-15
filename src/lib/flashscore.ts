import { dayKey, elapsedClock, todayKeyNow, tomorrowKeyNow, yesterdayKeyNow } from "./format";
import { fold, isWomensComp, type EspnMatch, type EspnState } from "./espn";
import type { LeagueId } from "./types";
import { CUP_LEAGUES, LEAGUE_TIER } from "./types";

export const FS_PATH: Partial<Record<LeagueId, string>> = {
  EPL: "football/england/premier-league",
  EFLC: "football/england/championship",
  EL1: "football/england/league-one",
  EL2: "football/england/league-two",
  NL: "football/england/national-league",
  SPL: "football/scotland/premiership",
  CHAMP: "football/scotland/championship",
  SL1: "football/scotland/league-one",
  SL2: "football/scotland/league-two",
  LALIGA: "football/spain/laliga",
  LL2: "football/spain/laliga2",
  SA: "football/italy/serie-a",
  SB: "football/italy/serie-b",
  BL: "football/germany/bundesliga",
  BL2: "football/germany/2-bundesliga",
  L1: "football/france/ligue-1",
  L2: "football/france/ligue-2",
  ERE: "football/netherlands/eredivisie",
  EED: "football/netherlands/eerste-divisie",
  BEL: "football/belgium/jupiler-pro-league",
  BEL2: "football/belgium/challenger-pro-league",
  POR: "football/portugal/liga-portugal",
  POR2: "football/portugal/liga-portugal-2",
  TUR: "football/turkey/super-lig",
  TUR2: "football/turkey/1-lig",
  EKE: "football/poland/ekstraklasa",
  POL2: "football/poland/division-1",
  ALLS: "football/sweden/allsvenskan",
  SUP: "football/sweden/superettan",
  DEN: "football/denmark/superliga",
  DEN2: "football/denmark/1st-division",
  NOR: "football/norway/eliteserien",
  NOR2: "football/norway/obos-ligaen",
  AUT: "football/austria/bundesliga",
  AUT2: "football/austria/2-liga",
  SUI: "football/switzerland/super-league",
  SUI2: "football/switzerland/challenge-league",
  GRE: "football/greece/super-league",
  GRE2: "football/greece/super-league-2",
  CZE: "football/czech-republic/chance-liga",
  CZE2: "football/czech-republic/fnl",
  IRL: "football/ireland/premier-division",
  IRL2: "football/ireland/first-division",
  HUN: "football/hungary/nb-i",
  HUN2: "football/hungary/nb-ii",
  ROU: "football/romania/superliga",
  ROU2: "football/romania/liga-2",
  UKR: "football/ukraine/premier-league",
  SVK: "football/slovakia/nike-liga",
  SVK2: "football/slovakia/2-liga",
  SVN: "football/slovenia/prva-liga",
  FIN: "football/finland/veikkausliiga",
  FIN2: "football/finland/ykkosliiga",
  ISL: "football/iceland/besta-deild-karla",
  ISL2: "football/iceland/division-1",
  CYP: "football/cyprus/cyprus-league",
  CYP2: "football/cyprus/division-2",
  WAL: "football/wales/cymru-premier",
  NIR: "football/northern-ireland/nifl-premiership",
  ALB: "football/albania/abissnet-superiore",
  ARM: "football/armenia/premier-league",
  AZE: "football/azerbaijan/premier-league",
  EST: "football/estonia/meistriliiga",
  FRO: "football/faroe-islands/premier-league",
  KAZ: "football/kazakhstan/premier-league",
  LVA: "football/latvia/virsliga",
  LTU: "football/lithuania/toplyga",
  LUX: "football/luxembourg/bgl-ligue",
  MDA: "football/moldova/super-liga",
  MNE: "football/montenegro/prva-crnogorska-liga",
  FACUP: "football/england/fa-cup",
  EFLCUP: "football/england/efl-cup",
  EFLT: "football/england/efl-trophy",
  SCCUP: "football/scotland/scottish-cup",
  CDR: "football/spain/copa-del-rey",
  CIT: "football/italy/coppa-italia",
  DFB: "football/germany/dfb-pokal",
  CDF: "football/france/coupe-de-france",
  UCL: "football/europe/champions-league",
  UCLQ: "football/europe/champions-league-qualification",
  UEL: "football/europe/europa-league",
  UELQ: "football/europe/europa-league-qualification",
  ECL: "football/europe/europa-conference-league",
  ECLQ: "football/europe/europa-conference-league-qualification",
  USC: "football/europe/uefa-super-cup",
  ACL: "football/asia/afc-champions-league",
  ACL2: "football/asia/afc-cup",
  ISR: "football/israel/premier-league",
  ISR2: "football/israel/leumit-league",
  BUL: "football/bulgaria/parva-liga",
  BUL2: "football/bulgaria/vtora-liga",
  CRO: "football/croatia/hnl",
  SRB: "football/serbia/super-liga",
  SRB2: "football/serbia/mozzart-bet-prva-liga",
  MLS: "football/usa/mls",
  USL: "football/usa/usl-championship",
  MX: "football/mexico/liga-mx",
  MX2: "football/mexico/liga-de-expansion-mx",
  CPL: "football/canada/canadian-premier-league",
  CRC: "football/costa-rica/primera-division",
  HON: "football/honduras/liga-nacional",
  GUA: "football/guatemala/liga-nacional",
  SLV: "football/el-salvador/primera-division",
  PAN: "football/panama/lpf",
  BRA: "football/brazil/serie-a",
  BRA2: "football/brazil/serie-b",
  ARG: "football/argentina/liga-profesional",
  ARG2: "football/argentina/primera-nacional",
  COL: "football/colombia/primera-a",
  COL2: "football/colombia/primera-b",
  CHI: "football/chile/primera-division",
  CHI2: "football/chile/primera-b",
  URU: "football/uruguay/primera-division",
  URU2: "football/uruguay/segunda-division",
  ECU: "football/ecuador/liga-pro",
  PER: "football/peru/liga-1",
  PAR: "football/paraguay/primera-division",
  BOL: "football/bolivia/division-profesional",
  VEN: "football/venezuela/primera-division",
  J1: "football/japan/j1-league",
  J2: "football/japan/j2-league",
  K1: "football/south-korea/k-league-1",
  K2: "football/south-korea/k-league-2",
  CSL: "football/china/super-league",
  CHN2: "football/china/jia-league",
  KSA: "football/saudi-arabia/saudi-professional-league",
  KSA2: "football/saudi-arabia/division-1",
  UAE: "football/united-arab-emirates/uae-pro-league",
  QAT: "football/qatar/stars-league",
  AUS: "football/australia/a-league",
  AUS2: "football/australia/australian-championship",
  IND: "football/india/indian-super-league",
  IND2: "football/india/i-league",
  THA: "football/thailand/thai-league",
  THA2: "football/thailand/thai-league-2",
  IDN: "football/indonesia/liga-1",
  IDN2: "football/indonesia/championship",
  MYS: "football/malaysia/super-league",
  IRN: "football/iran/persian-gulf-pro-league",
  ALG: "football/algeria/ligue-1",
  ALG2: "football/algeria/ligue-2",
  BHR: "football/bahrain/premier-league",
  BHR2: "football/bahrain/second-division",
  IRQ: "football/iraq/stars-league",
  IRQ2: "football/iraq/premier-division",
  EGY: "football/egypt/premier-league",
  EGY2: "football/egypt/division-2",
};

type CacheEntry = { at: number; rows: EspnMatch[] };
const cache = new Map<string, CacheEntry>();
const TTL = 90_000;
let fsForm: EspnMatch[] = [];

export function resetFlashscoreForm() {
  fsForm = [];
}

export function takeFlashscoreForm() {
  return fsForm;
}

export function mergeFlashscoreForm(rows: EspnMatch[]) {
  const seen = new Set(fsForm.map((r) => `${r.league}|${r.espnId}`));
  for (const r of rows) {
    if (r.state !== "ft" || r.homeScore == null || r.awayScore == null) continue;
    const k = `${r.league}|${r.espnId}`;
    if (seen.has(k)) continue;
    seen.add(k);
    fsForm.push(r);
  }
}

export async function fetchFlashscoreLeague(league: LeagueId): Promise<EspnMatch[]> {
  const path = FS_PATH[league];
  if (!path) return [];
  const rows = await fetchLeague(league, path);
  mergeFlashscoreForm(rows);
  const allow = new Set([yesterdayKeyNow(), todayKeyNow(), tomorrowKeyNow()]);
  return rows.filter((r) => allow.has(dayKey(r.kickoff)));
}

function abbr(name: string) {
  const t = name.replace(/[^A-Za-z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (t.length >= 2) return `${t[0]!.slice(0, 3)}${t[1]!.slice(0, 1)}`.toUpperCase().slice(0, 4);
  return (t[0] ?? "FC").slice(0, 4).toUpperCase();
}

function parseFields(chunk: string) {
  const fields: Record<string, string> = {};
  for (const tok of chunk.split("¬")) {
    const i = tok.indexOf("÷");
    if (i <= 0) continue;
    fields[tok.slice(0, i)] = tok.slice(i + 1);
  }
  return fields;
}

function stateOf(ab: string): EspnState {
  if (ab === "3") return "ft";
  if (ab === "2") return "live";
  return "scheduled";
}

function parseFeed(data: string, league: LeagueId): EspnMatch[] {
  const out: EspnMatch[] = [];
  let header = "";
  for (const chunk of data.split("¬~")) {
    if (chunk.startsWith("ZA÷")) {
      header = chunk;
      continue;
    }
    if (!chunk.startsWith("AA÷") && !chunk.includes("¬AA÷")) continue;
    if (isWomensComp(header)) continue;
    const body = chunk.startsWith("AA÷") ? chunk : chunk.slice(chunk.indexOf("AA÷"));
    const f = parseFields(body);
    const home = f.AE || f.FH || f.CX;
    const away = f.AF || f.FK;
    const ts = Number(f.AD);
    if (!home || !away || !Number.isFinite(ts) || ts <= 0) continue;
    if (isWomensComp(home, away)) continue;
    const kickoff = new Date(ts * 1000).toISOString();
    const state = stateOf(f.AB ?? "1");
    const hs = f.AG != null && f.AG !== "" ? Number(f.AG) : null;
    const as = f.AH != null && f.AH !== "" ? Number(f.AH) : null;
    out.push({
      espnId: `fs${f.AA ?? `${fold(home)}-${fold(away)}-${ts}`}`,
      league,
      kickoff,
      venue: "",
      homeName: home,
      awayName: away,
      homeAbbr: f.WM || abbr(home),
      awayAbbr: f.WN || abbr(away),
      homeEspnId: f.JA || fold(home),
      awayEspnId: f.JB || fold(away),
      homeScore: Number.isFinite(hs) ? hs : state === "scheduled" ? null : 0,
      awayScore: Number.isFinite(as) ? as : state === "scheduled" ? null : 0,
      state,
      clock: state === "ft" ? "FT" : state === "live" ? elapsedClock(kickoff) : "",
      sources: { flashscore: true },
    });
  }
  return out;
}

function extractFeeds(html: string) {
  const out: string[] = [];
  const re = /cjs\.initialFeeds\['(?:fixtures|results|live)'\]\s*=\s*\{\s*data:\s*`([^`]*)`/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push(m[1] ?? "");
  return out;
}

async function fetchLeague(league: LeagueId, path: string): Promise<EspnMatch[]> {
  const hit = cache.get(league);
  if (hit && Date.now() - hit.at < TTL) return hit.rows;
  try {
    const res = await fetch(`https://www.flashscore.com/${path}/`, {
      headers: {
        "User-Agent": "Mozilla/5.0 Pitchline",
        Accept: "text/html",
        "Accept-Language": "en-GB,en;q=0.9",
      },
      signal: AbortSignal.timeout(1600),
    });
    if (!res.ok) {
      cache.set(league, { at: Date.now(), rows: [] });
      return [];
    }
    const html = await res.text();
    const rows = extractFeeds(html).flatMap((data) => parseFeed(data, league));
    cache.set(league, { at: Date.now(), rows });
    return rows;
  } catch {
    cache.set(league, { at: Date.now(), rows: [] });
    return [];
  }
}

export async function fetchFlashscoreBoard(leagues: LeagueId[] = [], budgetMs = 5500): Promise<EspnMatch[]> {
  const wanted = (leagues.length ? leagues : (Object.keys(FS_PATH) as LeagueId[])).filter((id) => FS_PATH[id]);
  wanted.sort((a, b) => {
    const ra = CUP_LEAGUES.has(a) ? 88 : (LEAGUE_TIER[a] ?? 0);
    const rb = CUP_LEAGUES.has(b) ? 88 : (LEAGUE_TIER[b] ?? 0);
    return rb - ra;
  });
  const deadline = Date.now() + budgetMs;
  const batches: EspnMatch[][] = [];
  let i = 0;
  async function worker() {
    while (i < wanted.length && Date.now() < deadline) {
      const id = wanted[i++]!;
      batches.push(await fetchLeague(id, FS_PATH[id]!));
    }
  }
  await Promise.all(Array.from({ length: Math.min(8, wanted.length) }, () => worker()));
  const allow = new Set([yesterdayKeyNow(), todayKeyNow(), tomorrowKeyNow()]);
  const out: EspnMatch[] = [];
  const seen = new Set<string>();
  const form: EspnMatch[] = [];
  const formSeen = new Set<string>();
  for (const row of batches.flat()) {
    if (row.state === "ft" && row.homeScore != null && row.awayScore != null) {
      const fk = `${row.league}|${row.espnId}`;
      if (!formSeen.has(fk)) {
        formSeen.add(fk);
        form.push(row);
      }
    }
    if (!allow.has(dayKey(row.kickoff))) continue;
    const k = `${row.league}|${row.espnId}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(row);
  }
  mergeFlashscoreForm(form);
  return out;
}
