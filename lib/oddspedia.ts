import { fold, isWomensComp, type EspnMatch } from "./espn";
import type { LeagueId } from "./types";

const PATH: Partial<Record<LeagueId, string>> = {
  EPL: "football/england/premier-league",
  EFLC: "football/england/championship",
  LALIGA: "football/spain/laliga",
  SA: "football/italy/serie-a",
  BL: "football/germany/bundesliga",
  L1: "football/france/ligue-1",
  ERE: "football/netherlands/eredivisie",
  POR: "football/portugal/liga-portugal",
  MLS: "football/usa/mls",
  UCL: "football/europe/champions-league",
  UEL: "football/europe/europa-league",
};

const cache = new Map<string, { at: number; rows: EspnMatch[] }>();
const TTL = 120_000;

function valid(n: number) {
  return Number.isFinite(n) && n >= 1.08 && n <= 81;
}

function asMatch(league: LeagueId, home: string, away: string, homeOdd: number, drawOdd: number, awayOdd: number): EspnMatch {
  return {
    espnId: `od${fold(home)}-${fold(away)}`,
    league,
    kickoff: new Date().toISOString(),
    venue: "",
    homeName: home,
    awayName: away,
    homeAbbr: home.slice(0, 3).toUpperCase(),
    awayAbbr: away.slice(0, 3).toUpperCase(),
    homeEspnId: fold(home),
    awayEspnId: fold(away),
    homeScore: null,
    awayScore: null,
    state: "scheduled",
    clock: "",
    oddsHome: homeOdd,
    oddsDraw: drawOdd,
    oddsAway: awayOdd,
    sources: { books: true },
  };
}

function parsePage(html: string, league: LeagueId): EspnMatch[] {
  const raw = html.replace(/\\"/g, '"');
  const out: EspnMatch[] = [];
  const re =
    /"homeTeam"[^}]{0,180}"name":"([^"]+)"[\s\S]{0,320}?"awayTeam"[^}]{0,180}"name":"([^"]+)"[\s\S]{0,500}?"(?:odds|prices)":\[([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const home = m[1]!.trim();
    const away = m[2]!.trim();
    const odds = [Number(m[3]), Number(m[4]), Number(m[5])];
    if (!home || !away || isWomensComp(home, away)) continue;
    if (!valid(odds[0]!) || !valid(odds[1]!) || !valid(odds[2]!)) continue;
    out.push(asMatch(league, home, away, odds[0]!, odds[1]!, odds[2]!));
  }
  return out;
}

export async function fetchOddspedia(leagues: LeagueId[] = [], budgetMs = 2500): Promise<EspnMatch[]> {
  const wanted = (leagues.length ? leagues : (Object.keys(PATH) as LeagueId[])).filter((id) => PATH[id]);
  const deadline = Date.now() + budgetMs;
  const quotes: EspnMatch[] = [];
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
        const res = await fetch(`https://oddspedia.com/${PATH[id]}`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
            Accept: "text/html",
            "Accept-Language": "en-GB,en;q=0.9",
          },
          signal: AbortSignal.timeout(3500),
        });
        const html = res.ok ? await res.text() : "";
        const rows = html && !html.includes("Just a moment") ? parsePage(html, id) : [];
        cache.set(id, { at: Date.now(), rows });
        quotes.push(...rows);
      } catch {
        cache.set(id, { at: Date.now(), rows: [] });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, Math.max(1, wanted.length)) }, () => worker()));
  return quotes;
}
