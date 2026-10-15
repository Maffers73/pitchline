// @ts-nocheck
import { appNow, dayKey, eachDayKeys, elapsedClock, formHistoryKeys, todayKeyNow, tomorrowKeyNow, yesterdayKeyNow } from "./format";
import { fold, isWomensComp, type EspnMatch, type EspnState } from "./espn";
import { clubLabel, clubsMatch, collapseDuplicates } from "./crosscheck";
import { fotmobTeamBadge, registerLeagueLogos, rememberBadge } from "./badges";
import { CUP_LEAGUES, LEAGUES, type FormResult, type LeagueId, type Team } from "./types";

const PRIMARY = {
  47: "EPL",
  48: "EFLC",
  108: "EL1",
  109: "EL2",
  117: "NL",
  113: "AUS",
  8938: "AUS2",
  11030: "QAT2",
  10056: "IDN2",
  132: "FACUP",
  133: "EFLCUP",
  142: "EFLT",
  137: "SCCUP",
  180: "SLCUP",
  138: "CDR",
  139: "SUCUP",
  141: "CIT",
  222: "SCI",
  134: "CDF",
  209: "DFB",
  8924: "GERSC",
  235: "NEDC",
  149: "BELC",
  186: "PORC",
  151: "TURC",
  198: "POLC",
  171: "SWEC",
  242: "DENC",
  206: "NORC",
  278: "AUTC",
  164: "SUIC",
  145: "GREC",
  254: "CZEC",
  219: "IRLC",
  9097: "ISRC",
  271: "BULC",
  275: "CROC",
  183: "SRBC",
  9441: "USAC",
  11039: "MEXC",
  9837: "CANC",
  10223: "CRCC",
  9067: "BRAC",
  9305: "ARGC",
  9490: "COLC",
  9091: "CHIC",
  10342: "URUC",
  10046: "ECUC",
  10230: "PARC",
  9011: "JLEC",
  9551: "KORC",
  9550: "CHNC",
  9942: "KSAC",
  9943: "UAEC",
  11018: "QATC",
  9471: "AUSC",
  10366: "INDC",
  11023: "THAC",
  10059: "IDNC",
  9487: "IRNC",
  9941: "EGYC",
  64: "SPL",
  36: "SPL",
  123: "CHAMP",
  124: "SL1",
  125: "SL2",
  87: "LALIGA",
  140: "LL2",
  55: "SA",
  86: "SB",
  54: "BL",
  146: "BL2",
  53: "L1",
  110: "L2",
  57: "ERE",
  111: "EED",
  40: "BEL",
  264: "BEL2",
  61: "POR",
  185: "POR2",
  71: "TUR",
  165: "TUR2",
  196: "EKE",
  197: "POL2",
  67: "ALLS",
  168: "SUP",
  46: "DEN",
  85: "DEN2",
  59: "NOR",
  203: "NOR2",
  38: "AUT",
  119: "AUT2",
  69: "SUI",
  163: "SUI2",
  135: "GRE",
  8815: "GRE2",
  122: "CZE",
  253: "CZE2",
  126: "IRL",
  218: "IRL2",
  212: "HUN",
  9117: "HUN2",
  189: "ROU",
  9113: "ROU2",
  441: "UKR",
  176: "SVK",
  8973: "SVK2",
  173: "SVN",
  51: "FIN",
  251: "FIN2",
  215: "ISL",
  216: "ISL2",
  136: "CYP",
  9100: "CYP2",
  116: "WAL",
  129: "NIR",
  260: "ALB",
  118: "ARM",
  262: "AZE",
  248: "EST",
  250: "FRO",
  225: "KAZ",
  226: "LVA",
  228: "LTU",
  229: "LUX",
  231: "MDA",
  232: "MNE",
  127: "ISR",
  128: "ISR2",
  270: "BUL",
  9096: "BUL2",
  252: "CRO",
  182: "SRB",
  42: "UCL",
  10611: "UCLQ",
  73: "UEL",
  10216: "ECL",
  525: "ACL",
  9469: "ACL2",
  130: "MLS",
  8972: "USL",
  230: "MX",
  9986: "CPL",
  121: "CRC",
  337: "HON",
  336: "GUA",
  335: "SLV",
  268: "BRA",
  8814: "BRA2",
  112: "ARG",
  8965: "ARG2",
  274: "COL",
  9125: "COL2",
  273: "CHI",
  9126: "CHI2",
  161: "URU",
  9122: "URU2",
  246: "ECU",
  131: "PER",
  199: "PAR",
  144: "BOL",
  339: "VEN",
  81: "J1",
  9080: "K1",
  9116: "K2",
  536: "KSA"
};

const TABLE_IDS = {
  EPL: 47,
  EFLC: 48,
  EL1: 108,
  EL2: 109,
  NL: 117,
  SPL: 64,
  CHAMP: 123,
  SL1: 124,
  SL2: 125,
  LALIGA: 87,
  LL2: 140,
  SA: 55,
  SB: 86,
  BL: 54,
  BL2: 146,
  L1: 53,
  L2: 110,
  ERE: 57,
  EED: 111,
  BEL: 40,
  BEL2: 264,
  POR: 61,
  POR2: 185,
  TUR: 71,
  TUR2: 165,
  EKE: 196,
  POL2: 197,
  ALLS: 67,
  SUP: 168,
  DEN: 46,
  DEN2: 85,
  NOR: 59,
  NOR2: 203,
  AUT: 38,
  AUT2: 119,
  SUI: 69,
  SUI2: 163,
  GRE: 135,
  GRE2: 8815,
  CZE: 122,
  CZE2: 253,
  IRL: 126,
  IRL2: 218,
  HUN: 212,
  HUN2: 9117,
  ROU: 189,
  ROU2: 9113,
  UKR: 441,
  SVK: 176,
  SVK2: 8973,
  SVN: 173,
  FIN: 51,
  FIN2: 251,
  ISL: 215,
  ISL2: 216,
  CYP: 136,
  CYP2: 9100,
  WAL: 116,
  NIR: 129,
  ALB: 260,
  ARM: 118,
  AZE: 262,
  EST: 248,
  FRO: 250,
  KAZ: 225,
  LVA: 226,
  LTU: 228,
  LUX: 229,
  MDA: 231,
  MNE: 232,
  ISR: 127,
  ISR2: 128,
  BUL: 270,
  BUL2: 9096,
  CRO: 252,
  SRB: 182,
  UCL: 42,
  UEL: 73,
  ACL: 525,
  ACL2: 9469,
  MLS: 130,
  USL: 8972,
  MX: 230,
  CPL: 9986,
  CRC: 121,
  HON: 337,
  GUA: 336,
  SLV: 335,
  BRA: 268,
  BRA2: 8814,
  ARG: 112,
  ARG2: 8965,
  COL: 274,
  COL2: 9125,
  CHI: 273,
  CHI2: 9126,
  URU: 161,
  URU2: 9122,
  ECU: 246,
  PER: 131,
  PAR: 199,
  BOL: 144,
  VEN: 339,
  J1: 81,
  J2: 8974,
  K1: 9080,
  K2: 9116,
  CSL: 120,
  CHN2: 9137,
  KSA: 536,
  KSA2: 10721,
  UAE: 538,
  QAT: 535,
  QAT2: 11030,
  AUS: 113,
  AUS2: 8938,
  IND: 9478,
  IND2: 8982,
  THA: 8984,
  THA2: 9498,
  IDN: 8983,
  IDN2: 10056,
  MYS: 8985,
  IRN: 523,
  ALG: 516,
  IRQ: 524,
  EGY: 519,
  MX2: 8976,
  PAN: 9039
};

for (const [league, id] of Object.entries(TABLE_IDS)) {
  if (id != null && PRIMARY[id] == null) PRIMARY[id] = league;
}
registerLeagueLogos(TABLE_IDS);


































let tableCache = { at: 0, byId: new Map(), byName: new Map(), fetched: new Set() };
const TABLE_TTL = 30 * 60_000;
const TABLE_DISK = "/tmp/pitchline-tables.json";
let recentFt = [];

async function loadTableDisk() {
  if (tableCache.byName.size) return;
  try {
    const fs = await Promise.resolve().then(() => jitiImport("node:fs").then((m) => _interopRequireWildcard(m)));
    if (!fs.existsSync(TABLE_DISK)) return;
    const parsed = JSON.parse(fs.readFileSync(TABLE_DISK, "utf8"));




    if (Date.now() - (parsed.at ?? 0) > TABLE_TTL) return;
    for (const row of parsed.rows ?? []) {
      tableCache.byName.set(row.key, row.signal);
      if (row.signal) tableCache.byId.set(row.key, row.signal);
    }
    for (const id of parsed.fetched ?? []) {
      if ((parsed.rows ?? []).some((row) => (row.league || String(row.key).split("|")[0]) === id)) tableCache.fetched.add(id);
    }
    tableCache.at = parsed.at ?? Date.now();
  } catch {

    /* ignore */}
}

async function saveTableDisk() {
  try {
    const fs = await Promise.resolve().then(() => jitiImport("node:fs").then((m) => _interopRequireWildcard(m)));
    const rows = [...tableCache.byName.entries()].map(([key, signal]) => ({
      key,
      league: key.split("|")[0],
      signal
    }));
    fs.writeFileSync(
      TABLE_DISK,
      JSON.stringify({ at: tableCache.at, fetched: [...tableCache.fetched], rows }),
      "utf8"
    );
  } catch {

    /* ignore */}
}

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function parseScores(s) {
  const m = /(\d+)\s*-\s*(\d+)/.exec(s ?? "");
  if (!m) return undefined;
  return { gf: Number(m[1]), ga: Number(m[2]) };
}

function asRow(row)









{
  const scores = parseScores(row.scoresStr);
  if (!row.name) return null;
  return {
    id: String(row.id ?? ""),
    name: row.name,
    played: row.played ?? 0,
    pts: row.pts ?? 0,
    idx: row.idx ?? 0,
    gf: scores?.gf ?? 0,
    ga: scores?.ga ?? 0,
    wins: row.wins ?? 0,
    draws: row.draws ?? 0,
    losses: row.losses ?? 0
  };
}

function wdl(gf, ga) {
  if (gf > ga) return "W";
  if (gf < ga) return "L";
  return "D";
}




















function indexRows(rows) {
  const byId = new Map();
  const byName = new Map();
  for (const r of rows) {
    if (r.id) byId.set(r.id, r);
    byName.set(fold(r.name), r);
  }
  return { byId, byName };
}

function takeForm(list, n) {
  return list.slice(0, n);
}

function dedupeRows(rows) {
  const best = new Map();
  for (const r of rows) {
    const id = String(r?.id ?? r?.name ?? "");
    if (!id) continue;
    const prev = best.get(id);
    if (!prev || (r.played ?? 0) >= (prev.played ?? 0)) best.set(id, r);
  }
  return [...best.values()];
}

function standingsBundle(body) {
  const direct = body?.table;
  if (direct?.all?.length) return direct;
  const annual = body?.annualTable?.table;
  if (Array.isArray(annual) && annual.length) return { all: annual, home: [], away: [] };
  const groups = Array.isArray(body?.tables) ? body.tables : [];
  if (!groups.length) return direct ?? {};
  const take = (key) => dedupeRows(groups.flatMap((g) => g?.table?.[key] ?? []));
  return { all: take("all"), home: take("home"), away: take("away") };
}

function linesFromTeamForm(entry) {
  const games = [...(entry ?? [])].sort(
    (a, b) => Date.parse(b?.tooltipText?.utcTime ?? 0) - Date.parse(a?.tooltipText?.utcTime ?? 0),
  );
  const all = [];
  const home = [];
  const away = [];
  for (const g of games) {
    const r = g?.resultString;
    if (r !== "W" && r !== "D" && r !== "L") continue;
    if (all.length < 8) all.push(r);
    if (g?.home?.isOurTeam) {
      if (home.length < 6) home.push(r);
    } else if (away.length < 6) away.push(r);
  }
  return { all, home, away };
}

async function fetchLeagueSignals(league, lid) {
  const res = await fetch(`https://www.fotmob.com/api/data/leagues?id=${lid}`, {
    headers: { "User-Agent": "Mozilla/5.0 Pitchline", Accept: "application/json" },
    signal: AbortSignal.timeout(7000)
  });
  if (!res.ok) return [];
  const data = await res.json();
  const pack = data.table?.[0] ?? {};
  const table = standingsBundle(pack.data);
  const teamForm = pack.teamForm ?? {};
  const all = (table?.all ?? []).map(asRow).filter((r) => Boolean(r));
  const home = indexRows((table?.home ?? []).map(asRow).filter((r) => Boolean(r)));
  const away = indexRows((table?.away ?? []).map(asRow).filter((r) => Boolean(r)));
  const forms = new Map();
  const bump = (id, name) => {
    const k = id || fold(name);
    if (!forms.has(k)) forms.set(k, { all: [], home: [], away: [] });
    return forms.get(k);
  };
  const matches = [...(data.fixtures?.allMatches ?? [])].
  filter((m) => m.status?.finished && !m.status?.cancelled && m.status?.scoreStr).
  sort((a, b) => Date.parse(b.status?.utcTime ?? "0") - Date.parse(a.status?.utcTime ?? "0"));
  for (const m of matches) {
    const score = parseScores(m.status?.scoreStr);
    if (!score || !m.home?.name || !m.away?.name) continue;
    const hr = wdl(score.gf, score.ga);
    const ar = wdl(score.ga, score.gf);
    const h = bump(String(m.home.id ?? ""), m.home.name);
    const a = bump(String(m.away.id ?? ""), m.away.name);
    if (h.all.length < 8) h.all.push(hr);
    if (h.home.length < 6) h.home.push(hr);
    if (a.all.length < 8) a.all.push(ar);
    if (a.away.length < 6) a.away.push(ar);
  }
  const usable = all.filter((r) => r.played > 0);
  if (!usable.length) return [];
  const gfpg = usable.reduce((s, r) => s + r.gf / r.played, 0) / usable.length;
  const gapg = usable.reduce((s, r) => s + r.ga / r.played, 0) / usable.length;
  const avgH = clamp(gfpg * 1.14, 0.9, 1.85);
  const avgA = clamp(gfpg * 0.9, 0.7, 1.5);
  const n = usable.length;
  const base = usable.map((r) => {
    const ppg = r.pts / r.played;
    const gd = (r.gf - r.ga) / r.played;
    const elo = Math.round(1500 + (ppg - 1.38) * 230 + gd * 28 - (r.idx - 1) * (170 / Math.max(8, n)));
    return { ...r, elo };
  });
  const eloOf = new Map();
  for (const r of base) {
    eloOf.set(r.id, r.elo);
    eloOf.set(fold(r.name), r.elo);
  }
  const recentOpp = new Map();
  const note = (id, name, oppId, oppName, act) => {
    const k = id || fold(name);
    const list = recentOpp.get(k) ?? [];
    if (list.length >= 6) return;
    const opp = eloOf.get(oppId) ?? eloOf.get(fold(oppName));
    if (opp == null) return;
    list.push({ opp, act });
    recentOpp.set(k, list);
  };
  for (const m of matches) {
    const score = parseScores(m.status?.scoreStr);
    if (!score || !m.home?.name || !m.away?.name) continue;
    const homeAct = score.gf > score.ga ? 1 : score.gf === score.ga ? 0.5 : 0;
    note(String(m.home.id ?? ""), m.home.name, String(m.away.id ?? ""), m.away.name, homeAct);
    note(String(m.away.id ?? ""), m.away.name, String(m.home.id ?? ""), m.home.name, 1 - homeAct);
  }
  const oppAdj = (own, id, name) => {
    const list = recentOpp.get(id) ?? recentOpp.get(fold(name)) ?? [];
    let adj = 0;
    let w = 1;
    for (const g of list) {
      const exp = 1 / (1 + 10 ** ((g.opp - own) / 400));
      adj += (g.act - exp) * 32 * w;
      w *= 0.74;
    }
    return adj;
  };
  return base.map((r) => {
    const attack = clamp(r.gf / r.played / (gfpg || 1), 0.7, 1.48);
    const defense = clamp(r.ga / r.played / (gapg || 1), 0.65, 1.4);
    const ppg = r.pts / r.played;
    const hs = home.byId.get(r.id) ?? home.byName.get(fold(r.name));
    const as = away.byId.get(r.id) ?? away.byName.get(fold(r.name));
    const homePpg = hs && hs.played ? hs.pts / hs.played : ppg;
    const awayPpg = as && as.played ? as.pts / as.played : ppg;
    const homeAdv = clamp(1 + (homePpg - awayPpg) * 0.14, 0.88, 1.22);
    const seq = forms.get(r.id) ?? forms.get(fold(r.name));
    const listed = linesFromTeamForm(teamForm[r.id] ?? teamForm[String(r.id)]);
    const form = (seq?.all?.length ?? 0) >= 3 ? takeForm(seq.all, 8) : listed.all.length ? listed.all : takeForm(seq?.all ?? [], 8);
    const formHome = (seq?.home?.length ?? 0) >= 2 ? takeForm(seq.home, 6) : listed.home.length ? listed.home : takeForm(seq?.home ?? [], 6);
    const formAway = (seq?.away?.length ?? 0) >= 2 ? takeForm(seq.away, 6) : listed.away.length ? listed.away : takeForm(seq?.away ?? [], 6);
    const elo = clamp(Math.round(r.elo + oppAdj(r.elo, r.id, r.name)), 1280, 2050);
    const signal = {
      attack,
      defense,
      elo,
      form,
      formHome,
      formAway,
      homeAdv,
      avgH,
      avgA,
      trust: clamp(r.played / 8, 0, 0.5)
    };
    return { league, id: r.id, name: r.name, signal };
  });
}

async function pool(items, size, fn) {
  const out = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const cur = items[i++];
      out.push(await fn(cur));
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, Math.max(1, items.length)) }, worker));
  return out;
}

export async function ensureTables(leagues) {
  await loadTableDisk();
  const wanted = (leagues?.length ? leagues : Object.keys(TABLE_IDS)).filter((id) => TABLE_IDS[id]);
  const fresh = Date.now() - tableCache.at < TABLE_TTL;
  const missing = wanted.filter((id) => !fresh || !tableCache.fetched.has(id));
  if (!missing.length) return tableCache;
  const groups = await pool(missing, 12, async (league) => {
    try {
      return await fetchLeagueSignals(league, TABLE_IDS[league]);
    } catch {
      return [];
    }
  });
  if (!fresh) {
    tableCache.byId.clear();
    tableCache.byName.clear();
    tableCache.fetched.clear();
  }
  const filled = new Set();
  for (const rows of groups) {
    for (const row of rows) {
      if (row.id) tableCache.byId.set(`${row.league}|${row.id}`, row.signal);
      tableCache.byName.set(`${row.league}|${fold(row.name)}`, row.signal);
      tableCache.fetched.add(row.league);
      filled.add(row.league);
    }
  }
  for (const league of missing) {
    if (filled.has(league)) tableCache.fetched.add(league);
  }
  tableCache.at = Date.now();
  await saveTableDisk();
  return tableCache;
}

function rememberTableId(league, id) {
  if (!id) return;
  TABLE_IDS[league] = id;
}

export function hasTable(id) {
  return Boolean(TABLE_IDS[id]);
}

export function ingestFormRows(rows) {
  if (!rows.length) return;
  const seen = new Set(recentFt.map((r) => `${r.league}|${r.espnId}`));
  for (const r of rows) {
    if (r.state !== "ft" || r.homeScore == null || r.awayScore == null) continue;
    const k = `${r.league}|${r.espnId}`;
    if (seen.has(k)) continue;
    seen.add(k);
    recentFt.push(r);
  }
}

export function clubSignalHit(league, teamId, name) {
  const folded = fold(name);
  const direct =
  (teamId ? tableCache.byId.get(`${league}|${teamId}`) : undefined) ?? (
  folded ? tableCache.byName.get(`${league}|${folded}`) : undefined);
  if (direct) return { signal: direct, league };
  if (!folded) return undefined;
  const prefix = `${league}|`;
  for (const [key, sig] of tableCache.byName) {
    if (!key.startsWith(prefix)) continue;
    const stored = key.slice(prefix.length);
    if (stored === folded || clubsMatch(name, stored)) return { signal: sig, league };
  }
  const country = LEAGUES[league]?.country;
  for (const [key, sig] of tableCache.byName) {
    if (!key.endsWith(`|${folded}`)) continue;
    const lg = key.slice(0, key.length - folded.length - 1);
    if (lg === league || LEAGUES[lg]?.country === country) return { signal: sig, league: lg };
  }
  if (country && CUP_LEAGUES.has(league)) {
    for (const [key, sig] of tableCache.byName) {
      const bar = key.indexOf("|");
      if (bar < 0) continue;
      const lg = key.slice(0, bar);
      if (LEAGUES[lg]?.country !== country || CUP_LEAGUES.has(lg)) continue;
      const stored = key.slice(bar + 1);
      if (stored === folded || clubsMatch(name, stored)) return { signal: sig, league: lg };
    }
  }
  if (teamId) {
    for (const [key, sig] of tableCache.byId) {
      if (!key.endsWith(`|${teamId}`)) continue;
      const lg = key.slice(0, key.length - teamId.length - 1);
      if (lg === league || LEAGUES[lg]?.country === country) return { signal: sig, league: lg };
    }
  }
  return undefined;
}

export function clubSignal(league, teamId, name) {
  return clubSignalHit(league, teamId, name)?.signal;
}

export function attachClubSignals(rows) {
  return rows.map((r) => {
    const home = clubSignalHit(r.league, r.homeEspnId, r.homeName);
    const away = clubSignalHit(r.league, r.awayEspnId, r.awayName);
    if (!home && !away) return r;
    return {
      ...r,
      homeForm: (home?.signal.form.length ? home.signal.form : r.homeForm) ?? r.homeForm,
      awayForm: (away?.signal.form.length ? away.signal.form : r.awayForm) ?? r.awayForm,
      homeVenueForm: home?.signal.formHome.length ? home.signal.formHome : r.homeVenueForm,
      awayVenueForm: away?.signal.formAway.length ? away.signal.formAway : r.awayVenueForm,
      homeAttack: home?.signal.attack ?? r.homeAttack,
      homeDefense: home?.signal.defense ?? r.homeDefense,
      homeElo: home?.signal.elo ?? r.homeElo,
      awayAttack: away?.signal.attack ?? r.awayAttack,
      awayDefense: away?.signal.defense ?? r.awayDefense,
      awayElo: away?.signal.elo ?? r.awayElo,
      tableAvgHome: home?.signal.avgH ?? away?.signal.avgH ?? r.tableAvgHome,
      tableAvgAway: home?.signal.avgA ?? away?.signal.avgA ?? r.tableAvgAway,
      homeDiv: home?.league ?? r.homeDiv,
      awayDiv: away?.league ?? r.awayDiv
    };
  });
}

function teamFormKey(league, name) {
  return `${league}|${fold(name)}`;
}

export function attachRecentForm(rows) {
  const all = {};
  const homeV = {};
  const awayV = {};
  const bump = (map, key, result, cap) => {
    const cur = map[key] ?? [];
    if (cur.length >= cap) return;
    cur.push(result);
    map[key] = cur;
  };
  const finished = [...recentFt, ...rows].
  filter((r) => r.state === "ft" && r.homeScore != null && r.awayScore != null).
  sort((a, b) => Date.parse(b.kickoff) - Date.parse(a.kickoff));
  const seen = new Set();
  for (const r of finished) {
    const id = `${r.league}|${r.espnId}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const hk = teamFormKey(r.league, r.homeName);
    const ak = teamFormKey(r.league, r.awayName);
    const hr = wdl(r.homeScore, r.awayScore);
    const ar = wdl(r.awayScore, r.homeScore);
    bump(all, hk, hr, 8);
    bump(all, ak, ar, 8);
    bump(homeV, hk, hr, 6);
    bump(awayV, ak, ar, 6);
  }
  return rows.map((r) => {
    const hk = teamFormKey(r.league, r.homeName);
    const ak = teamFormKey(r.league, r.awayName);
    return {
      ...r,
      homeForm: r.homeForm?.length ? r.homeForm : all[hk],
      awayForm: r.awayForm?.length ? r.awayForm : all[ak],
      homeVenueForm: r.homeVenueForm?.length ? r.homeVenueForm : homeV[hk],
      awayVenueForm: r.awayVenueForm?.length ? r.awayVenueForm : awayV[ak]
    };
  });
}

export function catalogueTeam(
league,
teamId,
name,
abbr,
color)
{
  const hit = clubSignalHit(league, teamId, name);
  if (!hit) return undefined;
  const sig = hit.signal;
  const t = name.replace(/[^A-Za-z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  const short =
  abbr && abbr.length >= 2 ?
  abbr :
  t.length >= 2 ?
  `${t[0].slice(0, 3)}${t[1].slice(0, 1)}`.toUpperCase().slice(0, 4) :
  (t[0] ?? "FC").slice(0, 4).toUpperCase();
  return {
    id: `c${hit.league}${teamId || fold(name)}`,
    name,
    short,
    league: hit.league,
    div: hit.league,
    attack: sig.attack,
    defense: sig.defense,
    elo: sig.elo,
    form: sig.form.length ? sig.form : ["D", "D", "D", "D", "D"],
    formHome: sig.formHome.length ? sig.formHome : undefined,
    formAway: sig.formAway.length ? sig.formAway : undefined,
    color: color ?? "#5e6861",
    color2: "#e8eee9",
    homeAdv: sig.homeAdv,
    leagueAvgHome: sig.avgH,
    leagueAvgAway: sig.avgA
  };
}

function leagueOf(lg) {
  const n = (lg.name ?? "").toLowerCase();
  if (isWomensComp(lg.name)) return undefined;
  if (/u17|u18|u19|u21|youth|reserve|academy/.test(n)) return undefined;
  if (lg.primaryId && PRIMARY[lg.primaryId]) return PRIMARY[lg.primaryId];
  const c = (lg.ccode ?? "").toUpperCase();
  if (c === "ENG") {
    if (/premier league$/.test(n) && !/2/.test(n)) return "EPL";
    if (/championship/.test(n) && !/play/.test(n)) return "EFLC";
    if (/league one/.test(n)) return "EL1";
    if (/league two/.test(n)) return "EL2";
    if (/national league$/.test(n)) return "NL";
    if (/fa cup/.test(n)) return "FACUP";
    if (/efl cup|carabao/.test(n) || (/\bleague cup\b/.test(n) && !/trophy|national/.test(n))) return "EFLCUP";
    if (/efl trophy|football league trophy|vertu trophy|papa john/.test(n)) return "EFLT";
  }
  if (c === "SCO") {
    if (/premiership/.test(n)) return "SPL";
    if (/scottish cup/.test(n) && !/challenge|swf|swpl/.test(n)) return "SCCUP";
    if (/league cup/.test(n) && !/challenge|swf|swpl/.test(n)) return "SLCUP";
  }
  if (c === "ESP") {
    if (/laliga$|la liga$/.test(n) && !/2|hypermotion/.test(n)) return "LALIGA";
    if (/hypermotion|laliga\s*2|laliga2/.test(n)) return "LL2";
    if (/segunda/.test(n) && !/feder/.test(n)) return "LL2";
    if (/copa del rey/.test(n)) return "CDR";
    if (/supercopa/.test(n) && !/femenina|reina/.test(n)) return "SUCUP";
  }
  if (c === "ITA") {
    if (/serie a$/.test(n)) return "SA";
    if (/serie b$/.test(n)) return "SB";
    if (/coppa italia/.test(n) && !/women/.test(n)) return "CIT";
    if (/supercoppa/.test(n) && !/women/.test(n)) return "SCI";
  }
  if (c === "GER") {
    if (/2\.?\s*bundesliga/.test(n)) return "BL2";
    if (/bundesliga$/.test(n) && !/frauen/.test(n)) return "BL";
    if (/dfb|pokal/.test(n) && !/frauen/.test(n)) return "DFB";
    if (/super\s*cup/.test(n) && !/frauen/.test(n)) return "GERSC";
  }
  if (c === "FRA") {
    if (/ligue 1/.test(n)) return "L1";
    if (/ligue 2/.test(n)) return "L2";
    if (/coupe de france/.test(n)) return "CDF";
  }
  if (c === "NED") {
    if (/eredivisie/.test(n)) return "ERE";
    if (/eerste|keuken/.test(n)) return "EED";
  }
  if (c === "BEL") {
    if (/challenger/.test(n)) return "BEL2";
    if (/pro league|jupiler/.test(n)) return "BEL";
  }
  if (c === "POR") {
    if (/liga portugal 2|segunda/.test(n)) return "POR2";
    if (/liga portugal|primeira/.test(n)) return "POR";
  }
  if (c === "TUR") {
    if (/1\. lig/.test(n)) return "TUR2";
    if (/super lig|süper/.test(n)) return "TUR";
  }
  if (c === "POL") {
    if (/ekstraklasa/.test(n)) return "EKE";
    if (/\bi liga\b/.test(n)) return "POL2";
  }
  if (c === "SWE") {
    if (/allsvenskan/.test(n)) return "ALLS";
    if (/superettan/.test(n)) return "SUP";
  }
  if (c === "DEN") {
    if (/superliga/.test(n)) return "DEN";
    if (/1\. division|nordicbet/.test(n)) return "DEN2";
  }
  if (c === "NOR") {
    if (/eliteserien/.test(n)) return "NOR";
    if (/1\.?\s*div|obos/.test(n)) return "NOR2";
  }
  if (c === "AUT") {
    if (/2\. liga/.test(n)) return "AUT2";
    if (/bundesliga/.test(n)) return "AUT";
  }
  if (c === "SUI") {
    if (/challenge/.test(n)) return "SUI2";
    if (/super league/.test(n)) return "SUI";
  }
  if (c === "GRE") {
    if (/super league 2/.test(n)) return "GRE2";
    if (/super league/.test(n)) return "GRE";
  }
  if (c === "CZE") {
    if (/\bfnl\b/.test(n)) return "CZE2";
    if (/chance liga|fortuna liga/.test(n)) return "CZE";
  }
  if (c === "IRL") {
    if (/first/.test(n)) return "IRL2";
    if (/premier/.test(n)) return "IRL";
  }
  if (c === "ISR") {
    if (/leumit/.test(n)) return "ISR2";
    if (/ligat|premier/.test(n)) return "ISR";
  }
  if (c === "BUL") {
    if (/second|vtora/.test(n)) return "BUL2";
    if (/first/.test(n)) return "BUL";
  }
  if (c === "CRO" && /\bhnl\b|first/.test(n) && !/cup/.test(n)) return "CRO";
  if (c === "SRB") {
    if (/prva/.test(n) && !/super/.test(n)) return "SRB2";
    if (/super/.test(n)) return "SRB";
  }
  if (c === "USA") {
    if (/usl championship|\busl\b/.test(n) && !/league one|super league|next/.test(n)) return "USL";
    if (/major league|\bmls\b/.test(n) && !/next|all-star/.test(n)) return "MLS";
  }
  if (c === "MEX") {
    if (/expansion|expansión/.test(n)) return "MX2";
    if (/liga mx|liga bbva/.test(n) && !/femenil/.test(n)) return "MX";
  }
  if (c === "CAN" && /premier/.test(n) && !/women/.test(n)) return "CPL";
  if (c === "CRC" && /primera|apertura|clausura|liga/.test(n) && !/cup|copa/.test(n)) return "CRC";
  if (c === "HON" && /nacional|liga/.test(n) && !/copa/.test(n)) return "HON";
  if (c === "GUA" && /nacional|liga/.test(n) && !/copa/.test(n)) return "GUA";
  if (c === "SLV" && /primera/.test(n)) return "SLV";
  if (c === "PAN" && /lpf|primera/.test(n)) return "PAN";
  if (c === "BRA") {
    if (/s[eé]rie b/.test(n)) return "BRA2";
    if (/s[eé]rie a|brasileir/.test(n)) return "BRA";
  }
  if (c === "ARG") {
    if (/nacional|primera b nacional/.test(n)) return "ARG2";
    if (/liga profesional|primera divisi[oó]n|liga argentina/.test(n) && !/copa/.test(n)) return "ARG";
  }
  if (c === "COL") {
    if (/primera b|torneo betplay/.test(n) && !/a\b/.test(n)) return "COL2";
    if (/primera a|liga betplay/.test(n)) return "COL";
  }
  if (c === "CHI") {
    if (/primera b/.test(n)) return "CHI2";
    if (/primera/.test(n) && !/b\b/.test(n)) return "CHI";
  }
  if (c === "URU") {
    if (/segunda/.test(n)) return "URU2";
    if (/primera|liga auf/.test(n)) return "URU";
  }
  if (c === "ECU" && /ligapro|serie a|pro/.test(n) && !/serie b/.test(n)) return "ECU";
  if (c === "PER" && /liga 1|primera/.test(n) && !/liga 2/.test(n)) return "PER";
  if (c === "PAR" && /primera/.test(n)) return "PAR";
  if (c === "BOL" && /divisi[oó]n profesional|primera/.test(n)) return "BOL";
  if (c === "VEN" && /primera/.test(n)) return "VEN";
  if (c === "JPN") {
    if (/\bj2\b|j2 league|j\.league 2/.test(n)) return "J2";
    if (/\bj1\b|j1 league|j\.league/.test(n) && !/\b2\b/.test(n)) return "J1";
  }
  if (c === "KOR") {
    if (/k league 2|k-league 2/.test(n)) return "K2";
    if (/k league 1|k-league 1|k league$/.test(n)) return "K1";
  }
  if (c === "CHN") {
    if (/league one|jia b/.test(n)) return "CHN2";
    if (/super league/.test(n)) return "CSL";
  }
  if (c === "KSA" || c === "SAU") {
    if (/division 1|first division/.test(n)) return "KSA2";
    if (/pro league|saudi/.test(n) && !/cup/.test(n)) return "KSA";
  }
  if (c === "UAE" && /pro league/.test(n)) return "UAE";
  if (c === "QAT") {
    if (/second/.test(n)) return "QAT2";
    if (/stars|qatar/.test(n) && !/cup/.test(n)) return "QAT";
  }
  if (c === "AUS") {
    if (/championship/.test(n)) return "AUS2";
    if (/a-league|a league/.test(n) && !/women/.test(n)) return "AUS";
  }
  if (c === "IND") {
    if (/i-league|i league/.test(n)) return "IND2";
    if (/indian super|isl/.test(n)) return "IND";
  }
  if (c === "THA") {
    if (/thai league 2|t2/.test(n)) return "THA2";
    if (/thai league/.test(n)) return "THA";
  }
  if (c === "IDN") {
    if (/liga 2|championship/.test(n)) return "IDN2";
    if (/super league|liga 1/.test(n)) return "IDN";
  }
  if (c === "MYS" && /super league/.test(n)) return "MYS";
  if (c === "IRN" && /persian gulf|pro league/.test(n)) return "IRN";
  if (c === "ALG") {
    if (/ligue 2/.test(n)) return "ALG2";
    if (/ligue 1/.test(n)) return "ALG";
  }
  if (c === "BHR") {
    if (/second/.test(n)) return "BHR2";
    if (/premier/.test(n)) return "BHR";
  }
  if (c === "IRQ") {
    if (/premier division|division 1/.test(n)) return "IRQ2";
    if (/stars|premier/.test(n) && !/division/.test(n)) return "IRQ";
  }
  if (c === "EGY") {
    if (/second/.test(n)) return "EGY2";
    if (/premier/.test(n)) return "EGY";
  }
  if ((c === "AFC" || /\bafc\b/.test(n)) && !/world cup|u19|u17|u23/.test(n)) {
    if (/champions league two|acl two|afc cup/.test(n)) return "ACL2";
    if (/champions/.test(n)) return "ACL";
  }
  if (c === "INT" || c === "UEFA") {
    if (/champions league qualification/.test(n) && !/afc|asian/.test(n)) return "UCLQ";
    if (/champions league/.test(n) && !/women|afc|asian|caf|concacaf/.test(n)) return "UCL";
    if (/europa league qualification/.test(n)) return "UELQ";
    if (/europa league/.test(n) && !/conference/.test(n)) return "UEL";
    if (/conference league qualification/.test(n)) return "ECLQ";
    if (/conference league/.test(n)) return "ECL";
    if (/super cup/.test(n) && !/afc/.test(n)) return "USC";
  }
  if (c === "NED" && /knvb/.test(n) && !/women/.test(n)) return "NEDC";
  if (c === "BEL" && /belgian cup/.test(n)) return "BELC";
  if (c === "POR" && /ta[cç]a de portugal|taca de portugal/.test(n)) return "PORC";
  if (c === "TUR" && /turkish cup/.test(n)) return "TURC";
  if (c === "POL" && /puchar/.test(n) && !/super/.test(n)) return "POLC";
  if (c === "SWE" && /svenska cupen/.test(n) && !/women/.test(n)) return "SWEC";
  if (c === "DEN" && /pokalen/.test(n)) return "DENC";
  if (c === "NOR" && /norgesmesterskapet/.test(n) && !/kvinner|kval/.test(n)) return "NORC";
  if (c === "AUT" && /austrian cup/.test(n)) return "AUTC";
  if (c === "SUI" && /swiss cup/.test(n)) return "SUIC";
  if (c === "GRE" && /greece cup/.test(n)) return "GREC";
  if (c === "CZE" && /czech cup/.test(n)) return "CZEC";
  if (c === "IRL" && /fai cup/.test(n) && !/women/.test(n)) return "IRLC";
  if (c === "HUN") {
    if (/nb ii|nb 2|nemzeti bajnoks[aá]g ii/.test(n)) return "HUN2";
    if (/nb i|nemzeti|otp/.test(n)) return "HUN";
  }
  if (c === "ROU") {
    if (/liga ii|liga 2/.test(n)) return "ROU2";
    if (/liga i|superliga/.test(n)) return "ROU";
  }
  if (c === "UKR" && /premier/.test(n)) return "UKR";
  if (c === "SVK") {
    if (/2\.?\s*liga/.test(n)) return "SVK2";
    if (/1\. liga|super|nike|fortuna/.test(n)) return "SVK";
  }
  if (c === "SVN" && /prva/.test(n)) return "SVN";
  if (c === "FIN") {
    if (/ykk[oö]s/.test(n)) return "FIN2";
    if (/veikkaus/.test(n)) return "FIN";
  }
  if (c === "ISL") {
    if (/1\. deild|lengju/.test(n)) return "ISL2";
    if (/besta|úrvals|urvals|deild/.test(n)) return "ISL";
  }
  if (c === "CYP") {
    if (/2\.?\s*division/.test(n)) return "CYP2";
    if (/1\. division|cyprus league/.test(n)) return "CYP";
  }
  if (c === "WAL" && /cymru premier|welsh premier/.test(n)) return "WAL";
  if (c === "NIR" && /premiership/.test(n)) return "NIR";
  if (c === "ALB" && /superiore|super league/.test(n)) return "ALB";
  if (c === "ARM" && /premier/.test(n)) return "ARM";
  if (c === "AZE" && /premier/.test(n)) return "AZE";
  if (c === "EST" && /meistri|premium|regular/.test(n)) return "EST";
  if (c === "FRO" && /premier|effo|deild/.test(n) && !/1\./.test(n)) return "FRO";
  if (c === "KAZ" && /premier/.test(n)) return "KAZ";
  if (c === "LVA" && /virsliga/.test(n)) return "LVA";
  if (c === "LTU" && /lyga|toplyga/.test(n) && !/1\./.test(n)) return "LTU";
  if (c === "LUX" && /national|bgl/.test(n)) return "LUX";
  if (c === "MDA" && /national|super/.test(n)) return "MDA";
  if (c === "MNE" && /cfl|first|prva/.test(n)) return "MNE";
  if (c === "ISR" && /state cup/.test(n)) return "ISRC";
  if (c === "BUL" && /bulgarian cup/.test(n)) return "BULC";
  if (c === "CRO" && /croatian cup/.test(n)) return "CROC";
  if (c === "SRB" && /kup srbije/.test(n)) return "SRBC";
  if (c === "USA" && /open cup/.test(n)) return "USAC";
  if (c === "MEX" && /campe[oó]n de campeones/.test(n)) return "MEXC";
  if (c === "CAN" && /canadian championship/.test(n)) return "CANC";
  if (c === "CRC" && /super cup/.test(n)) return "CRCC";
  if (c === "BRA" && /copa do brasil/.test(n)) return "BRAC";
  if (c === "ARG" && /copa argentina/.test(n)) return "ARGC";
  if (c === "COL" && /copa colombia/.test(n)) return "COLC";
  if (c === "CHI" && /copa chile/.test(n)) return "CHIC";
  if (c === "URU" && /copa uruguay/.test(n)) return "URUC";
  if (c === "ECU" && /copa ecuador/.test(n)) return "ECUC";
  if (c === "PAR" && /copa paraguay/.test(n)) return "PARC";
  if (c === "JPN" && /emperor cup/.test(n)) return "JLEC";
  if (c === "KOR" && n === "cup") return "KORC";
  if (c === "CHN" && /fa cup/.test(n)) return "CHNC";
  if (c === "KSA" && /king/.test(n)) return "KSAC";
  if (c === "UAE" && n === "cup") return "UAEC";
  if (c === "QAT" && /amir/.test(n)) return "QATC";
  if (c === "AUS" && /australia cup/.test(n)) return "AUSC";
  if (c === "IND" && n === "super cup") return "INDC";
  if (c === "THA" && /fa cup/.test(n)) return "THAC";
  if (c === "IDN" && /president/.test(n)) return "IDNC";
  if (c === "IRN" && /hazfi/.test(n)) return "IRNC";
  if (c === "EGY" && /egypt cup/.test(n)) return "EGYC";
  return undefined;
}

function abbr(name) {
  const t = name.replace(/[^A-Za-z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (t.length >= 2) return `${t[0].slice(0, 3)}${t[1].slice(0, 1)}`.toUpperCase().slice(0, 4);
  return (t[0] ?? "FC").slice(0, 4).toUpperCase();
}

function parseMatch(m, league) {
  const home = m.home;
  const away = m.away;
  const st = m.status;
  if (!home?.name || !away?.name || !st?.utcTime) return null;
  if (isWomensComp(home.name, home.longName, away.name, away.longName)) return null;
  if (st.cancelled) return null;
  const reason = `${st.reason?.short ?? ""} ${st.reason?.long ?? ""}`.toLowerCase();
  if (reason.includes("postpone") || reason.includes("cancel") || reason.includes("abandon")) return null;
  const kickoff = new Date(st.utcTime).toISOString();
  if (Number.isNaN(Date.parse(kickoff))) return null;
  const finished = Boolean(st.finished);
  const inPlay = Boolean(st.started) && !finished;
  const state = finished ? "ft" : inPlay ? "live" : "scheduled";
  const hs = home.score;
  const as = away.score;
  const clock = finished ?
  st.reason?.short || "FT" :
  inPlay ?
  st.liveTime?.short || st.reason?.short || elapsedClock(kickoff) :
  "";
  const homeId = String(home.id ?? fold(home.name));
  const awayId = String(away.id ?? fold(away.name));
  const homeName = clubLabel(home.longName || home.name, league);
  const awayName = clubLabel(away.longName || away.name, league);
  rememberBadge(homeName, fotmobTeamBadge(home.id), true, league);
  rememberBadge(awayName, fotmobTeamBadge(away.id), true, league);
  return {
    espnId: `fm${m.id ?? `${fold(home.name)}-${fold(away.name)}-${kickoff}`}`,
    league,
    kickoff,
    venue: "",
    homeName,
    awayName,
    homeAbbr: abbr(home.name),
    awayAbbr: abbr(away.name),
    homeEspnId: homeId,
    awayEspnId: awayId,
    homeBadge: fotmobTeamBadge(home.id),
    awayBadge: fotmobTeamBadge(away.id),
    homeScore: Number.isFinite(hs) ? Number(hs) : state === "scheduled" ? null : 0,
    awayScore: Number.isFinite(as) ? Number(as) : state === "scheduled" ? null : 0,
    state,
    clock,
    sources: { fotmob: true }
  };
}

async function fetchDay(ymd) {
  const url = `https://www.fotmob.com/api/data/matches?date=${ymd}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 Pitchline", Accept: "application/json" },
      signal: AbortSignal.timeout(3500)
    });
    if (!res.ok) return [];
    const data = await res.json();
    const out = [];
    for (const lg of data.leagues ?? []) {
      const league = leagueOf(lg);
      if (!league) continue;
      rememberTableId(league, lg.primaryId ?? lg.id);
      for (const m of lg.matches ?? []) {
        const row = parseMatch(m, league);
        if (row) out.push(row);
      }
    }
    return out;
  } catch {
    return [];
  }
}

export async function fetchFotmobBoard() {
  const boardKeys = [yesterdayKeyNow(), todayKeyNow(), tomorrowKeyNow()];
  const boardDates = [...new Set(boardKeys.map((d) => d.replaceAll("-", "")))];
  const formDates = formHistoryKeys(appNow()).
  slice(-6).
  map((d) => d.replaceAll("-", "")).
  filter((d) => !boardDates.includes(d));
  const [boardBatches, formBatches] = await Promise.all([
  Promise.all(boardDates.map((d) => fetchDay(d))),
  Promise.all(formDates.map((d) => fetchDay(d)))]
  );
  const allow = new Set(boardKeys);
  const out = [];
  const seen = new Set();
  const formRows = [];
  const formSeen = new Set();
  for (const row of [...boardBatches.flat(), ...formBatches.flat()]) {
    const k = `${row.league}|${row.espnId}`;
    if (row.state === "ft" && !formSeen.has(k)) {
      formSeen.add(k);
      formRows.push(row);
    }
    if (!allow.has(dayKey(row.kickoff))) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(row);
  }
  recentFt = formRows;
  return out;
}

export async function fetchFotmobFinished(fromKey, toKey) {
  const dates = eachDayKeys(fromKey, toKey).map((d) => d.replaceAll("-", ""));
  const out = [];
  const seen = new Set();
  let i = 0;
  async function worker() {
    while (i < dates.length) {
      const d = dates[i++];
      const rows = await fetchDay(d);
      for (const row of rows) {
        if (row.state !== "ft" || row.homeScore == null || row.awayScore == null) continue;
        const k = `${row.league}|${row.espnId}`;
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(row);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(6, dates.length || 1) }, () => worker()));
  return out;
}

export function mergeBoards(primary, extra) {
  const stamps = new Set(
    primary.map((r) => `${r.league}|${dayKey(r.kickoff)}|${fold(r.homeName)}|${fold(r.awayName)}`)
  );
  const out = [...primary];
  for (const row of extra) {
    const stamp = `${row.league}|${dayKey(row.kickoff)}|${fold(row.homeName)}|${fold(row.awayName)}`;
    if (stamps.has(stamp)) continue;
    stamps.add(stamp);
    out.push(row);
  }
  out.sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  return collapseDuplicates(out);
} 