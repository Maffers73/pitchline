import { dayKey, todayKeyNow, tomorrowKeyNow, yesterdayKeyNow } from "./format";
import { fold, isWomensComp, type EspnMatch } from "./espn";
import type { LeagueId } from "./types";

const PAGES = [
  "https://www.forebet.com/en/football-tips-and-predictions-for-today",
  "https://www.forebet.com/en/football-tips-and-predictions-for-tomorrow",
];

const TAG: Record<string, LeagueId> = {
  epl: "EPL",
  eng: "EPL",
  efl: "EFLC",
  el1: "EL1",
  el2: "EL2",
  nl: "NL",
  nls: "NL",
  scp: "SPL",
  sch: "CHAMP",
  ll: "LALIGA",
  ll2: "LL2",
  sa: "SA",
  sb: "SB",
  bl: "BL",
  bl2: "BL2",
  l1: "L1",
  l2: "L2",
  ere: "ERE",
  bel: "BEL",
  por: "POR",
  tur: "TUR",
  spl: "SPL",
  ucl: "UCL",
  uel: "UEL",
  ecl: "ECL",
  mls: "MLS",
  mx: "MX",
  bra: "BRA",
  arg: "ARG",
  j1: "J1",
  k1: "K1",
  csl: "CSL",
  ksa: "KSA",
  uae: "UAE",
  qat: "QAT",
  irn: "IRN",
  egy: "EGY",
  acl: "ACL",
};

function americanToDecimal(ml: number) {
  if (!Number.isFinite(ml) || ml === 0) return undefined;
  const d = ml > 0 ? 1 + ml / 100 : 1 + 100 / Math.abs(ml);
  return Math.round(d * 100) / 100;
}

function parseAmerican(raw: string) {
  const n = Number(raw.replace(/^\+/, "").replace(/,/g, "").trim());
  if (!Number.isFinite(n) || n === 0) return undefined;
  if (Math.abs(n) < 20) return n; // already decimal
  return americanToDecimal(n);
}

function abbr(name: string) {
  const t = name.replace(/[^A-Za-z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (t.length >= 2) return `${t[0]!.slice(0, 3)}${t[1]!.slice(0, 1)}`.toUpperCase().slice(0, 4);
  return (t[0] ?? "FC").slice(0, 4).toUpperCase();
}

function leagueOf(tag: string): LeagueId | undefined {
  const t = tag.toLowerCase().replace(/[^a-z0-9]/g, "");
  return TAG[t];
}

function decode(s: string) {
  return s
    .replace(/&/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePage(html: string): EspnMatch[] {
  const out: EspnMatch[] = [];
  const chunks = html.split(/class="[^"]*\brcnt\b/);
  for (const chunk of chunks.slice(1)) {
    const home = decode((chunk.match(/class="[^"]*homeTeam[^"]*"[\s\S]{0,400}?>([^<]{2,60})</i) ?? [])[1] ?? "");
    const away = decode((chunk.match(/class="[^"]*awayTeam[^"]*"[\s\S]{0,400}?>([^<]{2,60})</i) ?? [])[1] ?? "");
    if (!home || !away) continue;
    if (isWomensComp(home, away)) continue;
    const tag = decode((chunk.match(/class="[^"]*shortTag[^"]*"[\s\S]{0,200}?>([^<]{1,12})</i) ?? [])[1] ?? "");
    const league = leagueOf(tag);
    if (!league) continue;
    const tsRaw = (chunk.match(/data-time="(\d{9,13})"/) ?? chunk.match(/data-utc="(\d{9,13})"/) ?? [])[1];
    const ts = Number(tsRaw);
    if (!Number.isFinite(ts) || ts <= 0) continue;
    const kickoff = new Date(ts > 1e12 ? ts : ts * 1000).toISOString();
    const odds = [...chunk.matchAll(/([+-]\d{3,4}|\d+\.\d{2})/g)].map((m) => parseAmerican(m[1]!)).filter(Boolean) as number[];
    const perc = [...chunk.matchAll(/\b([1-9]\d?)\s*%/g)].map((m) => Number(m[1])).filter((n) => n <= 90);
    let forebetHome: number | undefined;
    let forebetDraw: number | undefined;
    let forebetAway: number | undefined;
    if (perc.length >= 3) {
      const h = perc[0]!;
      const d = perc[1]!;
      const a = perc[2]!;
      const s = h + d + a;
      if (s >= 90 && s <= 110) {
        forebetHome = h / s;
        forebetDraw = d / s;
        forebetAway = a / s;
      }
    }
    const live = /class="[^"]*lscr_td[^"]*"[\s\S]{0,80}?(\d+)\s*[-–]\s*(\d+)/.exec(chunk);
    const finished = /ft|full time|final/i.test(chunk.slice(0, 400));
    const state = live ? (finished ? "ft" : "live") : "scheduled";
    out.push({
      espnId: `fb${fold(home)}-${fold(away)}-${kickoff}`,
      league,
      kickoff,
      venue: "",
      homeName: home,
      awayName: away,
      homeAbbr: abbr(home),
      awayAbbr: abbr(away),
      homeEspnId: fold(home),
      awayEspnId: fold(away),
      homeScore: live ? Number(live[1]) : null,
      awayScore: live ? Number(live[2]) : null,
      state,
      clock: state === "ft" ? "FT" : "",
      oddsHome: odds[0],
      oddsDraw: odds[1],
      oddsAway: odds[2],
      forebetHome,
      forebetDraw,
      forebetAway,
      sources: { forebet: true },
    });
  }
  return out;
}

async function fetchPage(url: string): Promise<EspnMatch[]> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-GB,en;q=0.9",
        Referer: "https://www.google.com/",
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    if (html.length < 4000 || /just a moment/i.test(html)) return [];
    return parsePage(html);
  } catch {
    return [];
  }
}

export async function fetchForebetBoard(): Promise<EspnMatch[]> {
  const batches = await Promise.all(PAGES.map(fetchPage));
  const allow = new Set([yesterdayKeyNow(), todayKeyNow(), tomorrowKeyNow()]);
  const out: EspnMatch[] = [];
  const seen = new Set<string>();
  for (const row of batches.flat()) {
    if (!allow.has(dayKey(row.kickoff))) continue;
    const k = `${row.league}|${row.espnId}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(row);
  }
  return out;
}
