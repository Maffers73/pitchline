import { CUP_LEAGUES, LEAGUE_TIER, type LeagueId } from "./types";
import { dayKey, todayKeyNow, tomorrowKeyNow, yesterdayKeyNow } from "./format";
import { fold, isWomensComp, type EspnMatch } from "./espn";

/** Oddschecker paths — Bet365 prices live under bookmaker code B3. */
const OC_PATH: Partial<Record<LeagueId, string>> = {
  EPL: "football/english/premier-league",
  EFLC: "football/english/championship",
  EL1: "football/english/league-1",
  EL2: "football/english/league-2",
  NL: "football/english/national-league",
  SPL: "football/scottish/premiership",
  CHAMP: "football/scottish/championship",
  SL1: "football/scottish/league-1",
  LALIGA: "football/spain/la-liga-primera",
  LL2: "football/spain/la-liga-segunda",
  SA: "football/italy/serie-a",
  SB: "football/italy/serie-b",
  BL: "football/germany/bundesliga",
  BL2: "football/germany/2-bundesliga",
  L1: "football/france/ligue-1",
  L2: "football/france/ligue-2",
  ERE: "football/netherlands/eredivisie",
  POR: "football/portugal/primeira-liga",
  BEL: "football/belgium/jupiler-pro-league",
  TUR: "football/turkey/super-lig",
  GRE: "football/greece/superleague",
  AUT: "football/austria/bundesliga",
  SUI: "football/switzerland/super-league",
  DEN: "football/denmark/superligaen",
  ALLS: "football/sweden/allsvenskan",
  NOR: "football/norway/eliteserien",
  EKE: "football/poland/ekstraklasa",
  CZE: "football/czech-republic/synot-liga",
  IRL: "football/ireland/premier-division",
  IRL2: "football/ireland/first-division",
  HUN: "football/hungary/nb1",
  HUN2: "football/hungary/nb2",
  ROU: "football/romania/liga-i",
  ROU2: "football/romania/liga-ii",
  UKR: "football/ukraine/vischaya-league",
  SVK: "football/slovakia/super-liga",
  SVN: "football/slovenia/1-snl",
  FIN: "football/finland/veikkausliiga",
  FIN2: "football/finland/ykkosliiga",
  ISL: "football/iceland/urvalsdeild",
  ISL2: "football/iceland/1-deild",
  CYP: "football/cyprus/1-division",
  WAL: "football/wales/premier-league",
  NIR: "football/northern-ireland/northern-ireland-premiership",
  ALB: "football/albania/super-league",
  ARM: "football/armenia/premier-league",
  AZE: "football/azerbaijan/premier-league",
  EST: "football/estonia/meistriliiga",
  FRO: "football/faroe-islands/effodeildin",
  KAZ: "football/kazakhstan/premier-league",
  LVA: "football/latvia/virsliga",
  LTU: "football/lithuania/a-lyga",
  LUX: "football/luxembourg/national-division",
  MDA: "football/moldova/divizia-nationala",
  MNE: "football/montenegro/first-league",
  CRO: "football/croatia/1-hnl",
  SRB: "football/serbia/superliga",
  SRB2: "football/serbia/prva-liga",
  BUL: "football/bulgaria/a-pfg",
  POL2: "football/poland/1-liga",
  SUP: "football/sweden/superettan",
  DEN2: "football/denmark/1st-division",
  NOR2: "football/norway/obos-ligaen",
  SUI2: "football/switzerland/challenge-league",
  BEL2: "football/belgium/challenger-pro-league",
  POR2: "football/portugal/segunda-liga",
  TUR2: "football/turkey/1-lig",
  EED: "football/netherlands/eerste-divisie",
  MLS: "football/usa/mls",
  MX: "football/mexico/liga-mx",
  BRA: "football/brazil/serie-a",
  BRA2: "football/brazil/serie-b",
  ARG: "football/argentina/primera-division",
  J1: "football/japan/j-league",
  K1: "football/south-korea/k-league-1",
  CSL: "football/china/super-league",
  AUS: "football/australia/a-league",
  UCL: "football/champions-league",
  UEL: "football/europa-league",
  ECL: "football/europa-conference-league",
  FACUP: "football/english/fa-cup",
  EFLCUP: "football/english/efl-cup",
};

export type BookQuote = {
  league: LeagueId;
  home: string;
  away: string;
  kickoff?: string;
  oddsHome: number;
  oddsDraw: number;
  oddsAway: number;
  checks?: { home: number; draw: number; away: number }[];
  book?: "bet365" | "market";
};

type CacheEntry = { at: number; rows: BookQuote[] };
const cache = new Map<LeagueId, CacheEntry>();
const TTL = 90_000;
const BET365 = "B3";

function valid(n: number) {
  return Number.isFinite(n) && n >= 1.08 && n <= 81;
}

function unwrapJson(raw: string) {
  let s = raw.trim();
  if (s.startsWith("<!--")) s = s.slice(4);
  if (s.endsWith("-->")) s = s.slice(0, -3);
  return s.trim();
}

function jsonBlocks(html: string): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  const re = /<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const d = JSON.parse(unwrapJson(m[1] ?? ""));
      if (d && typeof d === "object") out.push(d as Record<string, unknown>);
    } catch {
      /* skip */
    }
  }
  return out;
}

type OcSub = { homeTeamName?: string; awayTeamName?: string; startTime?: string; urlMap?: string };
type OcBet = { ocBetId?: number; betName?: string; marketId?: number; genericName?: string };
type OcMkt = { ocMarketId?: number; marketName?: string; marketTypeName?: string; sequenceName?: string };
type OcPrice = { oddsDecimal?: number; bookmakerCode?: string; status?: string };

function parseCoupon(html: string): Array<{ home: string; away: string; homeOdd: number; drawOdd: number; awayOdd: number }> {
  const out: Array<{ home: string; away: string; homeOdd: number; drawOdd: number; awayOdd: number }> = [];
  const re =
    /fixtures-bet-name[^>]*>([^<]+)<\/p>\s*<p class="fixtures-bet-name[^>]*>([^<]+)<\/p>[\s\S]{0,900}?data-best-dig="([0-9.]+)"[\s\S]{0,500}?data-best-dig="([0-9.]+)"[\s\S]{0,500}?data-best-dig="([0-9.]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const homeOdd = Number(m[3]);
    const drawOdd = Number(m[4]);
    const awayOdd = Number(m[5]);
    if (!valid(homeOdd) || !valid(drawOdd) || !valid(awayOdd)) continue;
    const home = m[1]!.trim();
    const away = m[2]!.trim();
    if (!home || !away || isWomensComp(home, away)) continue;
    out.push({ home, away, homeOdd, drawOdd, awayOdd });
  }
  return out;
}

function parseLeagueEvents(html: string): OcSub[] {
  const out: OcSub[] = [];
  for (const d of jsonBlocks(html)) {
    const subs = (d.subevents as { entities?: Record<string, OcSub> } | undefined)?.entities;
    if (!subs) continue;
    for (const sub of Object.values(subs)) {
      if (sub?.homeTeamName && sub.awayTeamName && sub.urlMap) out.push(sub);
    }
  }
  return out;
}

const CHECK_BOOKS = ["WH", "BF", "UN", "LD", "VC", "PUP", "CE", "OE", "BY", "FR", "MA", "SKB", "QN", "KN"];

export function impliedShare(home: number, draw: number, away: number) {
  const qh = 1 / home;
  const qd = 1 / draw;
  const qa = 1 / away;
  const s = qh + qd + qa;
  return { home: qh / s, draw: qd / s, away: qa / s };
}

export function oddsAgree(
  a: { home: number; draw: number; away: number },
  b: { home: number; draw: number; away: number },
) {
  const ia = impliedShare(a.home, a.draw, a.away);
  const ib = impliedShare(b.home, b.draw, b.away);
  const favA = ia.home >= ia.away ? 1 : 2;
  const favB = ib.home >= ib.away ? 1 : 2;
  if (favA !== favB) return false;
  return Math.abs(ia.home - ib.home) <= 0.08 && Math.abs(ia.away - ib.away) <= 0.08 && Math.abs(ia.draw - ib.draw) <= 0.1;
}

export function verifyBet365(
  primary: { home: number; draw: number; away: number },
  checks: { home: number; draw: number; away: number }[],
) {
  if (!checks.length) return false;
  const ok = checks.filter((c) => oddsAgree(primary, c));
  return ok.length >= 2 || (checks.length === 1 && ok.length === 1);
}

function parseWinMarket(
  html: string,
  home: string,
  away: string,
): { bet365?: { home: number; draw: number; away: number }; checks: { home: number; draw: number; away: number }[] } {
  const empty = { checks: [] as { home: number; draw: number; away: number }[] };
  for (const d of jsonBlocks(html)) {
    const bo = d.bestOdds as
      | {
          bets?: { entities?: Record<string, OcBet> };
          markets?: { entities?: Record<string, OcMkt> };
          odds?: Record<string, Record<string, OcPrice>>;
        }
      | undefined;
    if (!bo?.odds || !bo.bets?.entities || !bo.markets?.entities) continue;
    const bets = Object.values(bo.bets.entities);
    const mkts = Object.values(bo.markets.entities);
    for (const mkt of mkts) {
      const label = `${mkt.marketTypeName ?? ""} ${mkt.marketName ?? ""} ${mkt.sequenceName ?? ""}`.toLowerCase();
      if (!/win market|home\|draw\|away|1x2|full time result|match result/.test(label)) continue;
      const trio = bets.filter((b) => String(b.marketId) === String(mkt.ocMarketId));
      if (trio.length < 3) continue;
      const isHome = (b: OcBet) => fold(b.betName ?? "") === fold(home) || b.genericName === "HOME";
      const isAway = (b: OcBet) => fold(b.betName ?? "") === fold(away) || b.genericName === "AWAY";
      const isDraw = (b: OcBet) => /draw/i.test(b.betName ?? "") || b.genericName === "DRAW";
      const hb = trio.find(isHome);
      const db = trio.find(isDraw);
      const ab = trio.find(isAway);
      if (!hb || !db || !ab) continue;
      const price = (bet: OcBet, code: string) => {
        const cell = bo.odds?.[String(bet.ocBetId)]?.[code];
        if (!cell || (cell.status && cell.status !== "ACTIVE")) return undefined;
        const n = Number(cell.oddsDecimal);
        return valid(n) ? n : undefined;
      };
      const pack = (code: string) => {
        const h = price(hb, code);
        const d = price(db, code);
        const a = price(ab, code);
        return h && d && a ? { home: h, draw: d, away: a } : undefined;
      };
      const bet365 = pack(BET365);
      const checks = CHECK_BOOKS.map(pack).filter(Boolean) as { home: number; draw: number; away: number }[];
      if (bet365 || checks.length) return { bet365, checks };
    }
  }
  return empty;
}

async function getHtml(url: string, ms = 2800) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      Accept: "text/html",
      "Accept-Language": "en-GB,en;q=0.9",
    },
    signal: AbortSignal.timeout(ms),
  });
  if (!res.ok) return "";
  return res.text();
}

async function fetchLeague(league: LeagueId, path: string): Promise<BookQuote[]> {
  const hit = cache.get(league);
  if (hit && Date.now() - hit.at < TTL) return hit.rows;
  try {
    const html = await getHtml(`https://www.oddschecker.com/${path}`);
    if (!html) {
      cache.set(league, { at: Date.now(), rows: [] });
      return [];
    }
    const coupon = parseCoupon(html);
    if (coupon.length) {
      const rows = coupon.map((c) => ({
        league,
        home: c.home,
        away: c.away,
        oddsHome: c.homeOdd,
        oddsDraw: c.drawOdd,
        oddsAway: c.awayOdd,
        book: "market" as const,
      }));
      cache.set(league, { at: Date.now(), rows });
      return rows;
    }
    const allow = new Set([yesterdayKeyNow(), todayKeyNow(), tomorrowKeyNow()]);
    const events = parseLeagueEvents(html).filter(
      (e) => e.startTime && allow.has(dayKey(e.startTime)) && !isWomensComp(e.homeTeamName ?? "", e.awayTeamName ?? ""),
    );
    const rows: BookQuote[] = [];
    let i = 0;
    async function worker() {
      while (i < events.length) {
        const ev = events[i++]!;
        try {
          const page = await getHtml(`https://www.oddschecker.com/${path}/${ev.urlMap}`, 2500);
          const parsed = page ? parseWinMarket(page, ev.homeTeamName!, ev.awayTeamName!) : { checks: [] };
          if (!parsed.bet365) continue;
          if (!verifyBet365(parsed.bet365, parsed.checks) && parsed.checks.length) continue;
          rows.push({
            league,
            home: ev.homeTeamName!,
            away: ev.awayTeamName!,
            kickoff: ev.startTime,
            oddsHome: parsed.bet365.home,
            oddsDraw: parsed.bet365.draw,
            oddsAway: parsed.bet365.away,
            checks: parsed.checks,
          });
        } catch {
          /* skip */
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(4, Math.max(1, events.length)) }, () => worker()));
    cache.set(league, { at: Date.now(), rows });
    return rows;
  } catch {
    cache.set(league, { at: Date.now(), rows: [] });
    return [];
  }
}

export async function fetchBookPrices(leagues: LeagueId[]): Promise<BookQuote[]> {
  const wanted = leagues.filter((id) => OC_PATH[id]);
  const batches = await Promise.all(wanted.slice(0, 12).map((id) => fetchLeague(id, OC_PATH[id]!)));
  return batches.flat();
}

export async function fetchBooksBoard(budgetMs = 5500, leagues: LeagueId[] = []): Promise<EspnMatch[]> {
  const wanted = (leagues.length ? leagues : (Object.keys(OC_PATH) as LeagueId[])).filter((id) => OC_PATH[id]);
  wanted.sort((a, b) => {
    const ra = CUP_LEAGUES.has(a) ? 88 : (LEAGUE_TIER[a] ?? 0);
    const rb = CUP_LEAGUES.has(b) ? 88 : (LEAGUE_TIER[b] ?? 0);
    return rb - ra;
  });
  const deadline = Date.now() + budgetMs;
  const quotes: BookQuote[] = [];
  let i = 0;
  async function worker() {
    while (i < wanted.length && Date.now() < deadline) {
      const id = wanted[i++]!;
      quotes.push(...(await fetchLeague(id, OC_PATH[id]!)));
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, wanted.length) }, () => worker()));
  const allow = new Set([yesterdayKeyNow(), todayKeyNow(), tomorrowKeyNow()]);
  const out: EspnMatch[] = [];
  const seen = new Set<string>();
  for (const b of quotes) {
    if (b.kickoff && !allow.has(dayKey(b.kickoff))) continue;
    const kickoff = b.kickoff ?? new Date().toISOString();
    const espnId = `bk${fold(b.home)}-${fold(b.away)}-${kickoff}`;
    if (seen.has(espnId)) continue;
    seen.add(espnId);
    const short = (name: string) => {
      const p = name.replace(/[^A-Za-z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
      return p.length >= 2
        ? `${p[0]!.slice(0, 3)}${p[1]!.slice(0, 1)}`.toUpperCase().slice(0, 4)
        : (p[0] ?? "FC").slice(0, 4).toUpperCase();
    };
    out.push({
      espnId,
      league: b.league,
      kickoff,
      venue: "",
      homeName: b.home,
      awayName: b.away,
      homeAbbr: short(b.home),
      awayAbbr: short(b.away),
      homeEspnId: fold(b.home),
      awayEspnId: fold(b.away),
      homeScore: null,
      awayScore: null,
      state: "scheduled",
      clock: "",
      oddsHome: b.oddsHome,
      oddsDraw: b.oddsDraw,
      oddsAway: b.oddsAway,
      oddsBook: b.book ?? "bet365",
      oddsChecks: b.checks,
      sources: { books: true },
    });
  }
  return out;
}
