import { fold, isWomensComp, type EspnMatch } from "./espn";
import type { LeagueId } from "./types";

const PATH: Partial<Record<LeagueId, string>> = {
  EPL: "football/england/premier-league/",
  EFLC: "football/england/championship/",
  EL1: "football/england/league-one/",
  EL2: "football/england/league-two/",
  SPL: "football/scotland/premiership/",
  LALIGA: "football/spain/laliga/",
  SA: "football/italy/serie-a/",
  BL: "football/germany/bundesliga/",
  L1: "football/france/ligue-1/",
  ERE: "football/netherlands/eredivisie/",
  POR: "football/portugal/liga-portugal/",
  BEL: "football/belgium/jupiler-pro-league/",
  TUR: "football/turkey/super-lig/",
  MLS: "football/usa/mls/",
  BRA: "football/brazil/serie-a/",
  ARG: "football/argentina/liga-profesional/",
  J1: "football/japan/j1-league/",
  UCL: "football/europe/champions-league/",
  UEL: "football/europe/europa-league/",
};

export type PortalQuote = { league: LeagueId; home: string; away: string; homeOdd: number; drawOdd: number; awayOdd: number };

const cache = new Map<string, { at: number; rows: PortalQuote[] }>();
const TTL = 120_000;

function valid(n: number) {
  return Number.isFinite(n) && n >= 1.08 && n <= 81;
}

async function getHtml(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      Accept: "text/html",
      "Accept-Language": "en-GB,en;q=0.9",
    },
    signal: AbortSignal.timeout(3500),
  });
  if (!res.ok) return "";
  return res.text();
}

function parsePage(html: string, league: LeagueId): PortalQuote[] {
  const raw = html.replace(/\\"/g, '"');
  const events = new Map<string, { home: string; away: string }>();
  for (const m of raw.matchAll(
    /"id":(\d+),"is-double":false(?:(?!"is-double")[\s\S]){0,500}?"home-name":"([^"]+)","away-name":"([^"]+)"/g,
  )) {
    events.set(m[1]!, { home: m[2]!, away: m[3]! });
  }
  const out: PortalQuote[] = [];
  for (const m of raw.matchAll(/"event":(\d+),"odds":\[/g)) {
    const ev = events.get(m[1]!);
    if (!ev || isWomensComp(ev.home, ev.away)) continue;
    const start = m.index ?? 0;
    const next = raw.indexOf('"event":', start + 12);
    const chunk = raw.slice(start, next > start ? next : start + 900);
    const avgs = [...chunk.matchAll(/"avgOdds":([0-9.]+),"bettingTypeId":1,"scopeId":2/g)].map((x) => Number(x[1]));
    if (avgs.length < 3 || !valid(avgs[0]!) || !valid(avgs[1]!) || !valid(avgs[2]!)) continue;
    out.push({ league, home: ev.home, away: ev.away, homeOdd: avgs[0]!, drawOdd: avgs[1]!, awayOdd: avgs[2]! });
  }
  return out;
}

export async function fetchOddsportal(leagues: LeagueId[] = [], budgetMs = 2800): Promise<EspnMatch[]> {
  const wanted = (leagues.length ? leagues : (Object.keys(PATH) as LeagueId[])).filter((id) => PATH[id]);
  const deadline = Date.now() + budgetMs;
  const quotes: PortalQuote[] = [];
  let i = 0;
  async function worker() {
    while (i < wanted.length && Date.now() < deadline) {
      const id = wanted[i++]!;
      const hit = cache.get(id);
      if (hit && Date.now() - hit.at < TTL) {
        quotes.push(...hit.rows);
        continue;
      }
      try {
        const html = await getHtml(`https://www.oddsportal.com/${PATH[id]}`);
        const rows = html ? parsePage(html, id) : [];
        cache.set(id, { at: Date.now(), rows });
        quotes.push(...rows);
      } catch {
        cache.set(id, { at: Date.now(), rows: [] });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, wanted.length) }, () => worker()));
  return quotes.map((q) => ({
    espnId: `op${fold(q.home)}-${fold(q.away)}`,
    league: q.league,
    kickoff: new Date().toISOString(),
    venue: "",
    homeName: q.home,
    awayName: q.away,
    homeAbbr: q.home.slice(0, 3).toUpperCase(),
    awayAbbr: q.away.slice(0, 3).toUpperCase(),
    homeEspnId: fold(q.home),
    awayEspnId: fold(q.away),
    homeScore: null,
    awayScore: null,
    state: "scheduled" as const,
    clock: "",
    oddsHome: q.homeOdd,
    oddsDraw: q.drawOdd,
    oddsAway: q.awayOdd,
    oddsBook: undefined,
    sources: { books: true },
  }));
}

export { PATH as PORTAL_PATH };
