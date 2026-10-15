import { dayKey, elapsedClock, todayKeyNow } from "./format";
import { espnTeamBadge, rememberBadge } from "./badges";
import type { FormResult, LeagueId } from "./types";

export const ESPN_SLUG: Partial<Record<LeagueId, string>> = {
  EPL: "eng.1",
  EFLC: "eng.2",
  EL1: "eng.3",
  EL2: "eng.4",
  NL: "eng.5",
  SPL: "sco.1",
  CHAMP: "sco.2",
  SL1: "sco.3",
  SL2: "sco.4",
  LALIGA: "esp.1",
  LL2: "esp.2",
  SA: "ita.1",
  SB: "ita.2",
  BL: "ger.1",
  BL2: "ger.2",
  L1: "fra.1",
  L2: "fra.2",
  ERE: "ned.1",
  EED: "ned.2",
  BEL: "bel.1",
  BEL2: "bel.2",
  POR: "por.1",
  POR2: "por.2",
  TUR: "tur.1",
  TUR2: "tur.2",
  EKE: "pol.1",
  POL2: "pol.2",
  ALLS: "swe.1",
  SUP: "swe.2",
  DEN: "den.1",
  DEN2: "den.2",
  NOR: "nor.1",
  NOR2: "nor.2",
  AUT: "aut.1",
  AUT2: "aut.2",
  SUI: "sui.1",
  SUI2: "sui.2",
  GRE: "gre.1",
  GRE2: "gre.2",
  CZE: "cze.1",
  CZE2: "cze.2",
  IRL: "irl.1",
  IRL2: "irl.2",
  FACUP: "eng.fa",
  EFLCUP: "eng.league_cup",
  SCCUP: "sco.tennents",
  SLCUP: "sco.cis",
  CDR: "esp.copa_del_rey",
  SUCUP: "esp.super_cup",
  CIT: "ita.coppa_italia",
  SCI: "ita.super_cup",
  DFB: "ger.dfb_pokal",
  GERSC: "ger.super_cup",
  CDF: "fra.coupe_de_france",
  NEDC: "ned.cup",
  USAC: "usa.open",
  MEXC: "mex.campeon",
  ARGC: "arg.copa",
  COLC: "col.copa",
  UCL: "uefa.champions",
  UCLQ: "uefa.champions_qual",
  UEL: "uefa.europa",
  UELQ: "uefa.europa_qual",
  ECL: "uefa.europa.conf",
  ECLQ: "uefa.europa.conf_qual",
  USC: "uefa.super_cup",
  ACL: "afc.champions",
  ACL2: "afc.cup",
  ISR: "isr.1",
  BUL: "bul.1",
  CRO: "cro.1",
  SRB: "srb.1",
  MLS: "usa.1",
  USL: "usa.usl.1",
  MX: "mex.1",
  MX2: "mex.2",
  CPL: "can.1",
  CRC: "crc.1",
  HON: "hon.1",
  GUA: "gua.1",
  SLV: "slv.1",
  PAN: "pan.1",
  BRA: "bra.1",
  BRA2: "bra.2",
  ARG: "arg.1",
  ARG2: "arg.2",
  COL: "col.1",
  COL2: "col.2",
  CHI: "chi.1",
  CHI2: "chi.2",
  URU: "uru.1",
  URU2: "uru.2",
  ECU: "ecu.1",
  PER: "per.1",
  PAR: "par.1",
  BOL: "bol.1",
  VEN: "ven.1",
  J1: "jpn.1",
  J2: "jpn.2",
  K1: "kor.1",
  K2: "kor.2",
  CSL: "chn.1",
  CHN2: "chn.2",
  KSA: "ksa.1",
  KSA2: "ksa.2",
  UAE: "uae.1",
  QAT: "qat.1",
  AUS: "aus.1",
  IND: "ind.1",
  IND2: "ind.2",
  THA: "tha.1",
  THA2: "tha.2",
  IDN: "idn.1",
  MYS: "mas.1",
  IRN: "irn.1",
  ALG: "alg.1",
  ALG2: "alg.2",
  BHR: "bhr.1",
  BHR2: "bhr.2",
  IRQ: "irq.1",
  IRQ2: "irq.2",
  EGY: "egy.1",
  EGY2: "egy.2",
};

export function fold(s: string) {
  return s
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const WOMENS =
  /\b(women|woman|womens|wsl|nwsl|swpl|femenil|femminile|feminin|feminine|feminino|feminina|femenina|frauen|damen|dames|vrouwen|damallsvenskan|ladies|kvinde|kvindeliga|kvinner|toppserien|weiblich|naisten|uwcl|girls)\b|\b(wfc|wsl)\b|(?:^|\s)w$/;

export function isWomensComp(...names: Array<string | undefined>) {
  return names.some((n) => Boolean(n && WOMENS.test(fold(n))));
}

export type EspnState = "scheduled" | "live" | "ft";

export interface EspnMatch {
  espnId: string;
  league: LeagueId;
  kickoff: string;
  venue: string;
  homeName: string;
  awayName: string;
  homeAbbr: string;
  awayAbbr: string;
  homeEspnId: string;
  awayEspnId: string;
  homeColor?: string;
  awayColor?: string;
  homeColor2?: string;
  awayColor2?: string;
  homeBadge?: string;
  awayBadge?: string;
  homeScore: number | null;
  awayScore: number | null;
  state: EspnState;
  clock: string;
  oddsHome?: number;
  oddsDraw?: number;
  oddsAway?: number;
  homeForm?: FormResult[];
  awayForm?: FormResult[];
  homeVenueForm?: FormResult[];
  awayVenueForm?: FormResult[];
  overLine?: number;
  oddsOver?: number;
  oddsUnder?: number;
  homeAttack?: number;
  homeDefense?: number;
  homeElo?: number;
  awayAttack?: number;
  awayDefense?: number;
  awayElo?: number;
  tableAvgHome?: number;
  tableAvgAway?: number;
  homeDiv?: LeagueId;
  awayDiv?: LeagueId;
  oddsBook?: "bet365" | "espn" | "market";
  listed?: boolean;
  oddsChecks?: { home: number; draw: number; away: number }[];
  espnOddsHome?: number;
  espnOddsDraw?: number;
  espnOddsAway?: number;
  forebetHome?: number;
  forebetDraw?: number;
  forebetAway?: number;
  sources?: { espn?: boolean; fotmob?: boolean; flashscore?: boolean; forebet?: boolean; books?: boolean };
}

export interface FeedScore {
  id: string;
  home: number;
  away: number;
  state: "live" | "ft";
  clock: string;
}

type EspnLine = { close?: { odds?: unknown }; open?: { odds?: unknown } };
type EspnOdds = {
  moneyline?: { home?: EspnLine; draw?: EspnLine; away?: EspnLine };
  total?: { over?: EspnLine; under?: EspnLine };
  overUnder?: number;
  homeTeamOdds?: { moneyLine?: number };
  drawOdds?: { moneyLine?: number };
  awayTeamOdds?: { moneyLine?: number };
};
type EspnCompetitor = {
  homeAway: string;
  score?: string;
  form?: string;
  team: {
    id?: string;
    displayName: string;
    abbreviation?: string;
    color?: string;
    alternateColor?: string;
  };
};
type EspnEvent = {
  id?: string;
  date?: string;
  name?: string;
  shortName?: string;
  competitions: Array<{
    date?: string;
    venue?: { fullName?: string };
    status: {
      type: { name?: string; state?: string; completed?: boolean; shortDetail?: string; detail?: string };
      displayClock?: string;
    };
    competitors: EspnCompetitor[];
    odds?: EspnOdds[];
  }>;
};

async function fetchBoard(slug: string, ymd: string): Promise<EspnEvent[]> {
  const url = `https://site.web.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard?dates=${ymd}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 Pitchline", Accept: "application/json" },
    signal: AbortSignal.timeout(2800),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { events?: EspnEvent[] };
  return data.events ?? [];
}

function americanToDecimal(ml?: number) {
  if (ml == null || !Number.isFinite(ml) || ml === 0) return undefined;
  const d = ml > 0 ? 1 + ml / 100 : 1 + 100 / Math.abs(ml);
  return Math.round(d * 100) / 100;
}

function americanFrom(raw: unknown): number | undefined {
  if (typeof raw === "number") return americanToDecimal(raw);
  if (typeof raw === "string") {
    const n = Number(raw.replace(/^\+/, "").trim());
    if (Number.isFinite(n) && n !== 0) return americanToDecimal(n);
  }
  return undefined;
}

function lineOdds(block?: EspnLine) {
  return americanFrom(block?.close?.odds) ?? americanFrom(block?.open?.odds);
}

export function parseForm(raw?: string): FormResult[] | undefined {
  if (!raw) return undefined;
  const out: FormResult[] = [];
  for (const ch of raw.toUpperCase()) {
    if (ch === "W" || ch === "D" || ch === "L") out.push(ch);
    if (out.length === 5) break;
  }
  return out.length ? out : undefined;
}

function readOdds(raw: EspnOdds | undefined) {
  if (!raw) return {};
  const oddsHome = lineOdds(raw.moneyline?.home) ?? americanToDecimal(raw.homeTeamOdds?.moneyLine);
  const oddsDraw = lineOdds(raw.moneyline?.draw) ?? americanToDecimal(raw.drawOdds?.moneyLine);
  const oddsAway = lineOdds(raw.moneyline?.away) ?? americanToDecimal(raw.awayTeamOdds?.moneyLine);
  const overLine = typeof raw.overUnder === "number" && raw.overUnder > 0 ? raw.overUnder : undefined;
  const oddsOver = lineOdds(raw.total?.over);
  const oddsUnder = lineOdds(raw.total?.under);
  return { oddsHome, oddsDraw, oddsAway, overLine, oddsOver, oddsUnder };
}

function clockOf(
  kickoff: string,
  status: EspnEvent["competitions"][0]["status"],
  completed: boolean,
) {
  if (completed) {
    const name = status.type.name ?? "";
    if (name.includes("AET")) return "AET";
    if (name.includes("PEN")) return "PEN";
    return "FT";
  }
  if ((status.type.name ?? "").includes("HALFTIME")) return "HT";
  const dc = (status.displayClock ?? "").trim();
  if (dc && dc !== "0:00" && dc !== "0'" && dc !== "LIVE") {
    if (/^\d+:\d+/.test(dc)) return `${Number.parseInt(dc, 10)}'`;
    return dc;
  }
  const short = status.type.shortDetail || status.type.detail || "";
  if (short && short !== "LIVE") return short;
  return elapsedClock(kickoff);
}

function paint(hex?: string) {
  if (!hex) return undefined;
  const h = hex.replace("#", "").trim();
  if (/^[0-9a-fA-F]{3}$/.test(h)) return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toLowerCase();
  if (/^[0-9a-fA-F]{6}$/.test(h)) return `#${h}`.toLowerCase();
  return undefined;
}

function parseEvent(ev: EspnEvent, league: LeagueId): EspnMatch | null {
  const comp = ev.competitions[0];
  if (!comp) return null;
  if (isWomensComp(ev.name, ev.shortName)) return null;
  const st = comp.status.type;
  const name = (st.name ?? "").toUpperCase();
  if (name.includes("POSTPONE") || name.includes("CANCEL") || name.includes("ABANDON") || st.state === "postponed") {
    return null;
  }
  const h = comp.competitors.find((c) => c.homeAway === "home");
  const a = comp.competitors.find((c) => c.homeAway === "away");
  if (!h || !a) return null;
  if (isWomensComp(h.team.displayName, a.team.displayName)) return null;
  const rawDate = ev.date || comp.date;
  if (!rawDate) return null;
  const kickoff = new Date(rawDate).toISOString();
  if (Number.isNaN(Date.parse(kickoff))) return null;
  const completed = Boolean(st.completed) || name.includes("FULL_TIME") || name.includes("FINAL");
  const inPlay =
    !completed &&
    (st.state === "in" ||
      name.includes("HALFTIME") ||
      name.includes("FIRST_HALF") ||
      name.includes("SECOND_HALF") ||
      name.includes("IN_PROGRESS"));
  const hs = Number(h.score);
  const as = Number(a.score);
  const odds = readOdds((comp.odds ?? []).find(Boolean));
  const state: EspnState = completed ? "ft" : inPlay ? "live" : "scheduled";
  rememberBadge(h.team.displayName, espnTeamBadge(h.team.id));
  rememberBadge(a.team.displayName, espnTeamBadge(a.team.id));
  return {
    espnId: String(ev.id ?? `${fold(h.team.displayName)}-${fold(a.team.displayName)}-${kickoff}`),
    league,
    kickoff,
    venue: comp.venue?.fullName || "",
    homeName: h.team.displayName,
    awayName: a.team.displayName,
    homeAbbr: h.team.abbreviation || h.team.displayName.slice(0, 3).toUpperCase(),
    awayAbbr: a.team.abbreviation || a.team.displayName.slice(0, 3).toUpperCase(),
    homeEspnId: String(h.team.id ?? fold(h.team.displayName)),
    awayEspnId: String(a.team.id ?? fold(a.team.displayName)),
    homeBadge: espnTeamBadge(h.team.id),
    awayBadge: espnTeamBadge(a.team.id),
    homeColor: paint(h.team.color),
    awayColor: paint(a.team.color),
    homeColor2: paint(h.team.alternateColor),
    awayColor2: paint(a.team.alternateColor),
    homeScore: Number.isFinite(hs) ? hs : state === "scheduled" ? null : 0,
    awayScore: Number.isFinite(as) ? as : state === "scheduled" ? null : 0,
    state,
    clock: clockOf(kickoff, comp.status, completed),
    homeForm: parseForm(h.form),
    awayForm: parseForm(a.form),
    oddsHome: undefined,
    oddsDraw: undefined,
    oddsAway: undefined,
    espnOddsHome: odds.oddsHome,
    espnOddsDraw: odds.oddsDraw,
    espnOddsAway: odds.oddsAway,
    overLine: odds.overLine,
    oddsOver: odds.oddsOver,
    oddsUnder: odds.oddsUnder,
    oddsBook: undefined,
    sources: { espn: true },
  };
}

const kitFetched = new Set<LeagueId>();
let kitsLoaded = false;

async function loadKitDisk() {
  if (kitsLoaded) return;
  kitsLoaded = true;
  try {
    const fs = await import("node:fs");
    const raw = fs.readFileSync("/tmp/pitchline-kits.json", "utf8");
    const parsed = JSON.parse(raw) as {
      at?: number;
      leagues?: LeagueId[];
      colors?: Record<string, { color: string; color2: string }>;
    };
    if (!parsed.colors || Date.now() - (parsed.at ?? 0) > 36 * 3600_000) return;
    const { loadTeamColors } = await import("./crosscheck");
    loadTeamColors(parsed.colors);
    for (const id of parsed.leagues ?? []) kitFetched.add(id);
  } catch {
    /* first run */
  }
}

async function saveKitDisk() {
  try {
    const fs = await import("node:fs");
    const { dumpTeamColors } = await import("./crosscheck");
    fs.writeFileSync(
      "/tmp/pitchline-kits.json",
      JSON.stringify({ at: Date.now(), leagues: [...kitFetched], colors: dumpTeamColors() }),
      "utf8",
    );
  } catch {
    /* ignore */
  }
}

async function fetchLeagueKits(leagues: LeagueId[]) {
  await loadKitDisk();
  const missing = leagues.filter((id) => ESPN_SLUG[id] && !kitFetched.has(id));
  if (!missing.length) return;
  const { rememberColor, rememberTeamId, teamIdFor } = await import("./crosscheck");
  let i = 0;
  async function worker() {
    while (i < missing.length) {
      const league = missing[i++]!;
      const slug = ESPN_SLUG[league];
      if (!slug) continue;
      try {
        const res = await fetch(`https://site.web.api.espn.com/apis/site/v2/sports/soccer/${slug}/teams`, {
          headers: { "User-Agent": "Mozilla/5.0 Pitchline", Accept: "application/json" },
          signal: AbortSignal.timeout(2800),
        });
        if (!res.ok) continue;
        const data = (await res.json()) as {
          sports?: Array<{
            leagues?: Array<{ teams?: Array<{ team?: { displayName?: string; color?: string; alternateColor?: string } }> }>;
          }>;
        };
        const teams = data.sports?.[0]?.leagues?.[0]?.teams ?? [];
        for (const row of teams) {
          const t = row.team;
          if (!t?.displayName) continue;
          rememberTeamId(t.displayName, teamIdFor(t.displayName));
          rememberColor(t.displayName, paint(t.color), paint(t.alternateColor));
        }
        kitFetched.add(league);
      } catch {
        /* skip */
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(6, missing.length) }, () => worker()));
  void saveKitDisk();
}

function attachKitColors(
  rows: EspnMatch[],
  colorFor: (name: string) => { color: string; color2: string } | undefined,
) {
  return rows.map((r) => {
    const h = colorFor(r.homeName);
    const a = colorFor(r.awayName);
    return {
      ...r,
      homeColor: h?.color ?? r.homeColor,
      homeColor2: h?.color2 ?? r.homeColor2,
      awayColor: a?.color ?? r.awayColor,
      awayColor2: a?.color2 ?? r.awayColor2,
    };
  });
}

export let lastFetchTiming: Record<string, number> = {};

export async function fetchEspnBoard(): Promise<EspnMatch[]> {
  const t0 = Date.now();
  const mark = (k: string) => {
    lastFetchTiming[k] = Date.now() - t0;
  };
  const flashModP = import("./flashscore");
  const srbP = flashModP.then((m) => {
    m.resetFlashscoreForm();
    return m.fetchFlashscoreLeague("SRB2");
  }).catch(() => [] as EspnMatch[]);
  const fotmob = await race(
    import("./fotmob")
      .then((m) => m.fetchFotmobBoard() as Promise<EspnMatch[]>)
      .catch(() => [] as EspnMatch[]),
    8000,
    [] as EspnMatch[],
  );
  mark("fotmob");
  const leagues = [...new Set([...fotmob.map((r) => r.league), "SRB2" as LeagueId])];
  if (leagues.includes("EFLT")) {
    for (const id of ["EPL", "EFLC", "EL1", "EL2", "NL"] as const) {
      if (!leagues.includes(id)) leagues.push(id);
    }
  }
  const tablesP = import("./fotmob")
    .then((m) => m.ensureTables(leagues))
    .catch(() => undefined);
  const grace = fotmob.length > 40 ? 1000 : 4000;
  const booksP = race(
    import("./books")
      .then((m) => m.fetchBooksBoard(2800, leagues))
      .catch(() => [] as EspnMatch[]),
    2800,
    [] as EspnMatch[],
  );
  const portalP = race(
    import("./oddsportal")
      .then((m) => m.fetchOddsportal(leagues, 2500))
      .catch(() => [] as EspnMatch[]),
    2500,
    [] as EspnMatch[],
  );
  const betexP = race(
    import("./betexplorer")
      .then((m) => m.fetchBetexplorer(leagues, 2500))
      .catch(() => [] as EspnMatch[]),
    2500,
    [] as EspnMatch[],
  );
  const oddspediaP = race(
    import("./oddspedia")
      .then((m) => m.fetchOddspedia(leagues, 2500))
      .catch(() => [] as EspnMatch[]),
    2500,
    [] as EspnMatch[],
  );
  const forebetP = race(
    import("./forebet")
      .then((m) => m.fetchForebetBoard())
      .catch(() => [] as EspnMatch[]),
    800,
    [] as EspnMatch[],
  );
  const flashscore = await race(
    import("./flashscore")
      .then((m) => m.fetchFlashscoreBoard(leagues, grace))
      .catch(() => [] as EspnMatch[]),
    grace + 150,
    [] as EspnMatch[],
  );
  mark("sources");
  if (!fotmob.length) {
    lastFetchTiming.total = Date.now() - t0;
    return [];
  }
  try {
    const { collapseDuplicates, overlayLive, overlayModel, verifyMarketOdds } = await import("./crosscheck");
    const { takeFlashscoreForm } = await flashModP;
    const srb = await race(srbP, 400, [] as EspnMatch[]);
    const fot = await import("./fotmob");
    fot.ingestFormRows(takeFlashscoreForm());
    let merged = collapseDuplicates([...fotmob, ...srb], true);
    merged = overlayLive(merged, flashscore);
    const [books, portal, betex, oddspedia, forebet] = await Promise.all([
      race(booksP, 120, [] as EspnMatch[]),
      race(portalP, 120, [] as EspnMatch[]),
      race(betexP, 120, [] as EspnMatch[]),
      race(oddspediaP, 120, [] as EspnMatch[]),
      race(forebetP, 120, [] as EspnMatch[]),
    ]);
    merged = overlayModel(merged, books);
    merged = overlayModel(merged, forebet);
    merged = verifyMarketOdds(merged, [...portal, ...betex, ...oddspedia]);
    merged = await finishBoard(merged, false, tablesP);
    mark("merge");
    lastFetchTiming.espnN = 0;
    lastFetchTiming.fotmobN = fotmob.length;
    lastFetchTiming.flashN = flashscore.length;
    lastFetchTiming.booksN = books.length;
    lastFetchTiming.forebetN = forebet.length;
    lastFetchTiming.portalN = portal.length;
    lastFetchTiming.betexN = betex.length;
    lastFetchTiming.oddspediaN = oddspedia.length;
    lastFetchTiming.outN = merged.length;
    lastFetchTiming.total = Date.now() - t0;
    console.info("[pitchline latency]", lastFetchTiming);
    return merged;
  } catch {
    const rows = await finishBoard(fotmob, false);
    lastFetchTiming.total = Date.now() - t0;
    return rows;
  }
}

async function finishBoard(
  rows: EspnMatch[],
  collapse = true,
  tablesP?: Promise<unknown>,
) {
  if (!rows.length) return rows;
  let next = rows;
  if (collapse) {
    try {
      const { collapseDuplicates } = await import("./crosscheck");
      next = collapseDuplicates(rows);
    } catch {
      next = rows;
    }
  }
  try {
    const fot = await import("./fotmob");
    const leagues = [...new Set(next.map((r) => r.league))];
    const kitsP = fetchLeagueKits(leagues);
    const tables = tablesP ?? fot.ensureTables(leagues);
    let out = fot.attachClubSignals(fot.attachRecentForm(next)) as EspnMatch[];
    const missing = out.filter(
      (r) => r.homeAttack == null || r.awayAttack == null || !r.homeForm?.length || !r.awayForm?.length,
    );
    if (missing.length) {
      await Promise.race([tables, new Promise((r) => setTimeout(r, 1200))]);
      out = fot.attachClubSignals(fot.attachRecentForm(out)) as EspnMatch[];
    }
    await Promise.race([kitsP, new Promise((r) => setTimeout(r, 600))]);
    const { colorFor } = await import("./crosscheck");
    return attachKitColors(out, colorFor);
  } catch {
    return next;
  }
}

function collect(rows: EspnMatch[], allow: Set<string>) {
  const out: EspnMatch[] = [];
  const ids = new Set<string>();
  for (const row of rows) {
    const k = `${row.league}|${row.espnId}`;
    if (ids.has(k)) continue;
    if (!allow.has(dayKey(row.kickoff))) continue;
    ids.add(k);
    out.push(row);
  }
  out.sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  return out;
}

function race<T>(p: Promise<T>, ms: number, fallback: T) {
  return Promise.race([p, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))]);
}

async function pullEspn(keys: string[], budgetMs: number, leagues?: LeagueId[]) {
  const dates = [...new Set(keys.map((d) => d.replaceAll("-", "")))];
  const allow = leagues?.length ? new Set(leagues) : null;
  const jobs: { d: string; slug: string; league: LeagueId }[] = [];
  const seen = new Set<string>();
  const today = todayKeyNow().replaceAll("-", "");
  const ordered = [...dates].sort((a, b) => (a === today ? -1 : b === today ? 1 : a.localeCompare(b)));
  const slugs = (Object.entries(ESPN_SLUG) as [LeagueId, string][]).filter(([id]) => !allow || allow.has(id));
  for (const d of ordered) {
    for (const [league, slug] of slugs) {
      const key = `${d}|${slug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      jobs.push({ d, slug, league });
    }
  }
  const deadline = Date.now() + budgetMs;
  const out: EspnMatch[] = [];
  let i = 0;
  async function worker() {
    while (i < jobs.length && Date.now() < deadline) {
      const job = jobs[i++]!;
      try {
        const events = await fetchBoard(job.slug, job.d);
        for (const ev of events) {
          const row = parseEvent(ev, job.league);
          if (row) out.push(row);
        }
      } catch {
        /* skip */
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(8, jobs.length) }, () => worker()));
  return out;
}
