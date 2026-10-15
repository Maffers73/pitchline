import { createServerFn } from "@tanstack/react-start";
import { fetchEspnBoard, type EspnMatch } from "./espn";
import { dayKey, todayKeyNow, tomorrowKeyNow, yesterdayKeyNow } from "./format";
import { mergeBoard } from "./live-board";

const DISK = "/tmp/pitchline-board.json";
let cache: { day: string; at: number; rows: EspnMatch[] } | null = null;
let inflight: Promise<EspnMatch[]> | null = null;

async function fromDisk(): Promise<{ day: string; at: number; rows: EspnMatch[] } | null> {
  try {
    const fs = await import("node:fs");
    if (!fs.existsSync(DISK)) return null;
    const parsed = JSON.parse(fs.readFileSync(DISK, "utf8")) as {
      day?: string;
      at?: number;
      rows?: EspnMatch[];
    };
    const rows = Array.isArray(parsed.rows) ? parsed.rows : [];
    if (!rows.length) return null;
    return { day: parsed.day ?? "", at: parsed.at ?? 0, rows };
  } catch {
    return null;
  }
}

async function toDisk(day: string, rows: EspnMatch[]) {
  try {
    const fs = await import("node:fs");
    fs.writeFileSync(DISK, JSON.stringify({ day, at: Date.now(), rows }), "utf8");
  } catch {
    /* ignore */
  }
}

function hasDay(rows: EspnMatch[], key: string) {
  return rows.some((r) => dayKey(r.kickoff) === key);
}

function needsLiveRefresh(rows: EspnMatch[]) {
  const now = Date.now();
  return rows.some((r) => {
    if (r.state === "live") return true;
    if (r.state === "ft") return false;
    const t = Date.parse(r.kickoff);
    return Number.isFinite(t) && t <= now + 15 * 60_000;
  });
}

function loadBoard() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const rows = await fetchEspnBoard();
      const day = todayKeyNow();
      if (rows.length) {
        const merged = cache?.day === day && cache.rows.length ? mergeBoard(cache.rows, rows) : rows;
        cache = { day, at: Date.now(), rows: merged };
        void toDisk(day, merged);
      }
      return cache?.rows ?? rows;
    } catch {
      return cache?.rows ?? [];
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

export const pullBoard = createServerFn({ method: "GET" })
  .inputValidator((d: { refresh?: boolean } | undefined) => ({ refresh: Boolean(d?.refresh) }))
  .handler(async ({ data }) => {
    const today = todayKeyNow();
    if (!cache) {
      const disk = await fromDisk();
      if (disk) cache = disk;
    }
    if (cache && cache.day !== today) cache = null;

    if (data.refresh) {
      const rows = await loadBoard();
      return rows;
    }

    if (cache && cache.day === today && cache.rows.length) {
      if (!hasDay(cache.rows, tomorrowKeyNow())) {
        const rows = await loadBoard();
        return rows;
      }
      if (!needsLiveRefresh(cache.rows)) return cache.rows;
      const thin =
        cache.rows.filter((r) => r.homeAttack == null && r.awayAttack == null).length > cache.rows.length * 0.35;
      const ttl = cache.rows.some((r) => r.state === "live") ? 8_000 : thin ? 3_000 : 45_000;
      if (Date.now() - cache.at >= ttl) void loadBoard();
      return cache.rows;
    }

    if (!cache || Date.now() - cache.at >= 2_000) void loadBoard();
    return cache?.rows ?? [];
  });

const MONTH_DISK = "/tmp/pitchline-month.json";
let monthCache: { key: string; at: number; rows: EspnMatch[] } | null = null;

export const pullMonth = createServerFn({ method: "GET" }).handler(async () => {
  const key = todayKeyNow().slice(0, 7);
  const from = `${key}-01`;
  const to = yesterdayKeyNow();
  if (to < from) return [] as EspnMatch[];
  if (monthCache && monthCache.key === key && Date.now() - monthCache.at < 6 * 3600_000) return monthCache.rows;
  try {
    const fs = await import("node:fs");
    if (fs.existsSync(MONTH_DISK)) {
      const parsed = JSON.parse(fs.readFileSync(MONTH_DISK, "utf8")) as { key?: string; at?: number; rows?: EspnMatch[] };
      if (parsed.key === key && Array.isArray(parsed.rows) && parsed.rows.length) {
        monthCache = { key, at: parsed.at ?? Date.now(), rows: parsed.rows };
        if (Date.now() - monthCache.at < 6 * 3600_000) return monthCache.rows;
      }
    }
  } catch {
    /* ignore */
  }
  try {
    const { fetchFotmobFinished } = await import("./fotmob");
    const rows = await fetchFotmobFinished(from, to);
    monthCache = { key, at: Date.now(), rows };
    try {
      const fs = await import("node:fs");
      fs.writeFileSync(MONTH_DISK, JSON.stringify(monthCache));
    } catch {
      /* ignore */
    }
    return rows;
  } catch {
    return monthCache?.rows ?? [];
  }
});
