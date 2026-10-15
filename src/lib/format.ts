import { parseISO } from "date-fns";
import type { LeagueId } from "./types";
import { countryFlag, LEAGUES } from "./types";

export const STATS_FROM = "2026-08-21";
export const CLOCK_TZ = "Europe/London";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS_SHORT: Record<string, string> = {
  Sunday: "Sun",
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
};
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function appNow() {
  return new Date();
}

type London = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  weekday: string;
  zone: "BST" | "GMT";
  key: string;
};

export function londonParts(d: Date): London {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: CLOCK_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "long",
    hourCycle: "h23",
    timeZoneName: "short",
  });
  const bag: Record<string, string> = {};
  for (const p of fmt.formatToParts(d)) {
    if (p.type !== "literal") bag[p.type] = p.value;
  }
  const zone: "BST" | "GMT" = bag.timeZoneName === "GMT" ? "GMT" : "BST";
  return {
    year: bag.year,
    month: bag.month,
    day: bag.day,
    hour: bag.hour,
    minute: bag.minute,
    weekday: bag.weekday,
    zone,
    key: `${bag.year}-${bag.month}-${bag.day}`,
  };
}

export function dayKey(iso: string) {
  return londonParts(parseISO(iso)).key;
}

export function monthKey(iso: string) {
  return dayKey(iso).slice(0, 7);
}

export function todayKeyNow(now = appNow()) {
  return londonParts(now).key;
}

function shiftKey(key: string, days: number) {
  const [y, m, d] = key.split("-").map(Number);
  return londonParts(new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0))).key;
}

export function shiftDayKey(key: string, days: number) {
  return shiftKey(key, days);
}

export function eachDayKeys(from: string, to: string) {
  const out: string[] = [];
  let k = from;
  while (k <= to) {
    out.push(k);
    k = shiftKey(k, 1);
    if (out.length > 40) break;
  }
  return out;
}

export function yesterdayKeyNow(now = appNow()) {
  return shiftKey(todayKeyNow(now), -1);
}

export function tomorrowKeyNow(now = appNow()) {
  return shiftKey(todayKeyNow(now), 1);
}

export function historyKeys(now = appNow()) {
  const today = todayKeyNow(now);
  return [shiftKey(today, -2), shiftKey(today, -1), today, tomorrowKeyNow(now)];
}

export function formHistoryKeys(now = appNow()) {
  const today = todayKeyNow(now);
  const keys: string[] = [];
  for (let i = 12; i >= 1; i -= 1) keys.push(shiftKey(today, -i));
  return keys;
}

export function rollingDayKeys(now = appNow(), count = 3) {
  const today = todayKeyNow(now);
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) keys.push(shiftKey(today, -i));
  return keys;
}

export function recentMonthKeys(now = appNow(), count = 3) {
  let y = Number(londonParts(now).year);
  let m = Number(londonParts(now).month);
  const keys: string[] = [];
  for (let i = 0; i < count; i += 1) {
    keys.push(`${y}-${String(m).padStart(2, "0")}`);
    m -= 1;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
  }
  return keys;
}

export function isBoardDay(iso: string, now = appNow()) {
  const k = dayKey(iso);
  return k === todayKeyNow(now) || k === tomorrowKeyNow(now);
}

export function londonDateHeading(now = appNow()) {
  const p = londonParts(now);
  const monthIdx = Number(p.month) - 1;
  return `${p.weekday} ${Number(p.day)} ${MONTHS[monthIdx]} ${p.year}`;
}

export function gmtDateHeading(now = appNow()) {
  return londonDateHeading(now);
}

export function monthLabel(key: string) {
  const [ys, ms] = key.split("-");
  const y = Number(ys);
  const m = Number(ms) - 1;
  return `${MONTHS[m]} ${y}`;
}

export function kickoffZone(iso: string) {
  return londonParts(parseISO(iso)).zone;
}

export function kickoffLabel(iso: string) {
  const p = londonParts(parseISO(iso));
  return `${p.hour}:${p.minute}`;
}

export function kickoffLong(iso: string) {
  const p = londonParts(parseISO(iso));
  const monthIdx = Number(p.month) - 1;
  return `${WEEKDAYS_SHORT[p.weekday]} ${Number(p.day)} ${MONTHS_SHORT[monthIdx]} · ${p.hour}:${p.minute} ${p.zone}`;
}

export function dayShort(iso: string) {
  const p = londonParts(parseISO(iso));
  return `${WEEKDAYS_SHORT[p.weekday]} ${Number(p.day)}`;
}

export function dayDow(iso: string) {
  return WEEKDAYS_SHORT[londonParts(parseISO(iso)).weekday];
}

export function dayNum(iso: string) {
  return String(Number(londonParts(parseISO(iso)).day));
}

export function dayHeading(iso: string, now = appNow()) {
  const k = dayKey(iso);
  if (k === todayKeyNow(now)) return "Today";
  if (k === yesterdayKeyNow(now)) return "Yesterday";
  if (k === tomorrowKeyNow(now)) return "Tomorrow";
  const p = londonParts(parseISO(iso));
  return `${p.weekday} ${Number(p.day)} ${MONTHS[Number(p.month) - 1]}`;
}

export function leagueName(id: LeagueId) {
  return LEAGUES[id].name;
}

export function leagueWithCountry(id: LeagueId) {
  const l = LEAGUES[id];
  const flag = countryFlag(l.country);
  return flag ? `${flag} ${l.country} · ${l.name}` : `${l.country} · ${l.name}`;
}

export function decimalOdds(n: number) {
  return n.toFixed(2);
}

export function matchPhase(kickoff: string, now = appNow()): "upcoming" | "live" | "ended" {
  const t = parseISO(kickoff).getTime();
  const n = now.getTime();
  if (n < t) return "upcoming";
  if (n < t + 115 * 60 * 1000) return "live";
  return "ended";
}

export type KickoffState = "upcoming" | "live" | "ft";

export function kickoffState(
  fixture: { status: string; feedState?: string },
  live?: { state: "live" | "ft" } | null,
  logged?: unknown,
): KickoffState {
  if (logged || live?.state === "ft" || fixture.feedState === "ft" || fixture.status === "settled") return "ft";
  if (live?.state === "live" || fixture.feedState === "live") return "live";
  return "upcoming";
}

export function elapsedClock(kickoff: string, now = appNow()): string {
  const elapsed = Math.floor((now.getTime() - parseISO(kickoff).getTime()) / 60000);
  if (elapsed < 0) return "KO";
  if (elapsed <= 45) return `${elapsed}'`;
  if (elapsed < 47) return "45+'";
  if (elapsed < 62) return "HT";
  const second = elapsed - 17;
  if (second <= 90) return `${second}'`;
  if (second <= 105) return `90+${second - 90}'`;
  return "FT";
}

export function displayClock(kickoff: string, feedClock?: string, now = appNow()): string {
  const raw = (feedClock ?? "").trim();
  if (raw && raw !== "LIVE" && raw !== "0:00" && raw !== "0'") {
    if (/^\d+:\d+/.test(raw)) return `${parseInt(raw, 10)}'`;
    return raw;
  }
  if (matchPhase(kickoff, now) === "live") return elapsedClock(kickoff, now);
  if (matchPhase(kickoff, now) === "ended") return "FT";
  return kickoffLabel(kickoff);
}

export { WEEKDAYS };
