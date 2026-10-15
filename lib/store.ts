import { create } from "zustand";
import { FIXTURES } from "./data/fixtures";
import type { EspnMatch } from "./espn";
import { dayKey, recentMonthKeys, todayKeyNow, tomorrowKeyNow, yesterdayKeyNow } from "./format";
import { mergeArchive, mergeBoard, boardPool } from "./live-board";
import { dumpTeamColors, dumpTeamIds, loadTeamColors, loadTeamIds, lockTeamsFrom } from "./crosscheck";
import { rollArchive, sealMonthCards, snapshotMonthCards, trackableViews, matchLookupIds, type MonthCard } from "./tracking";
import type { Outcome } from "./types";
import { isKnownLeague } from "./types";

export interface LoggedScore {
  home: number;
  away: number;
}

export interface LiveScore {
  home: number;
  away: number;
  clock: string;
  state: "live" | "ft";
}

export interface WatchList {
  id: string;
  name: string;
  ids: string[];
}

function dropFinished(
  saved: string[],
  lists: WatchList[],
  finishedIds: Set<string>,
) {
  if (!finishedIds.size) return { saved, lists, changed: false };
  const nextSaved = saved.filter((id) => !finishedIds.has(id));
  let listsChanged = false;
  const nextLists = lists.map((l) => {
    const ids = l.ids.filter((id) => !finishedIds.has(id));
    if (ids.length === l.ids.length) return l;
    listsChanged = true;
    return { ...l, ids };
  });
  return {
    saved: nextSaved,
    lists: nextLists,
    changed: nextSaved.length !== saved.length || listsChanged,
  };
}

function cleanLists(raw: unknown): WatchList[] {
  if (!Array.isArray(raw)) return [];
  const out: WatchList[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as { id?: unknown; name?: unknown; ids?: unknown };
    if (typeof row.id !== "string" || typeof row.name !== "string") continue;
    const name = row.name.trim().slice(0, 28);
    if (!name || seen.has(row.id)) continue;
    seen.add(row.id);
    const ids = Array.isArray(row.ids) ? row.ids.filter((x): x is string => typeof x === "string") : [];
    out.push({ id: row.id, name, ids });
  }
  return out;
}

interface SlipState {
  hydrated: boolean;
  picks: Record<string, Outcome>;
  saved: string[];
  lists: WatchList[];
  results: Record<string, LoggedScore>;
  live: Record<string, LiveScore>;
  feed: EspnMatch[];
  archive: EspnMatch[];
  cards: MonthCard[];
  beat: number;
  lastSync: number | null;
  watching: "all" | "bookmarked";
  dayPicks: Record<string, string[]>;
  hydrate: () => void;
  setPick: (matchId: string, call: Outcome | null) => void;
  toggleSaved: (matchId: string) => void;
  toggleWatching: () => void;
  createList: (name: string) => string | null;
  renameList: (id: string, name: string) => void;
  deleteList: (id: string) => void;
  toggleInList: (listId: string, matchId: string) => void;
  applyFeed: (rows: Array<LiveScore & { id: string }>) => void;
  setBoard: (rows: EspnMatch[]) => void;
  ingestArchive: (rows: EspnMatch[]) => void;
  rememberPicks: (day: string, ids: string[], replace?: boolean) => void;
  nudge: () => void;
}

const KEY = "pitchline-slip";
const BOARD_KEY = "pitchline-board";
const MONTHS_KEY = "pitchline-months";

function readSavedCards(): MonthCard[] {
  try {
    const raw = localStorage.getItem(MONTHS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MonthCard[];
    return Array.isArray(parsed) ? parsed.filter((c) => c && typeof c.key === "string") : [];
  } catch {
    return [];
  }
}

function persistCards(cards: MonthCard[]) {
  const sealed = sealMonthCards(cards, readSavedCards());
  try {
    localStorage.setItem(MONTHS_KEY, JSON.stringify(sealed));
  } catch {
    /* ignore */
  }
  return sealed;
}

function bakedScores(): Record<string, LoggedScore> {
  const out: Record<string, LoggedScore> = {};
  for (const f of FIXTURES) {
    if (f.status === "settled" && f.actualHome != null && f.actualAway != null) {
      out[f.id] = { home: f.actualHome, away: f.actualAway };
    }
  }
  return out;
}

function writeSlip(
  picks: Record<string, Outcome>,
  saved: string[],
  results: Record<string, LoggedScore>,
  archive: EspnMatch[],
  cards: MonthCard[],
  lists: WatchList[],
  watching: "all" | "bookmarked",
  dayPicks: Record<string, string[]> = {},
) {
  const sealed = persistCards(cards);
  const keep = recentMonthKeys(undefined, 3);
  const kept: Record<string, string[]> = {};
  for (const [k, ids] of Object.entries(dayPicks)) {
    if (keep.includes(k.slice(0, 7)) && ids.length) kept[k] = ids;
  }
  try {
      localStorage.setItem(KEY, JSON.stringify({ picks, saved, results, archive, cards: sealed, lists, watching, dayPicks: kept, teamIds: dumpTeamIds(), teamColors: dumpTeamColors() }));
  } catch {
    /* ignore */
  }
  return sealed;
}

function writeBoard(board: EspnMatch[]) {
  try {
    localStorage.setItem(BOARD_KEY, JSON.stringify({ day: todayKeyNow(), rows: board }));
  } catch {
    /* ignore */
  }
}

function readBoard(): EspnMatch[] {
  try {
    const rawBoard = localStorage.getItem(BOARD_KEY);
    if (!rawBoard) return [];
    const parsedBoard = JSON.parse(rawBoard) as EspnMatch[] | { day?: string; rows?: EspnMatch[] };
    const rows = Array.isArray(parsedBoard) ? parsedBoard : Array.isArray(parsedBoard.rows) ? parsedBoard.rows : [];
    const keep = new Set([yesterdayKeyNow(), todayKeyNow(), tomorrowKeyNow()]);
    return rows.filter((r) => r && isKnownLeague(r.league) && keep.has(dayKey(r.kickoff)));
  } catch {
    return [];
  }
}

export const useSlip = create<SlipState>()((set, get) => ({
  hydrated: false,
  picks: {},
  saved: [],
  lists: [],
  results: {},
  live: {},
  feed: [],
  archive: [],
  cards: [],
  beat: 0,
  lastSync: null,
  watching: "all",
  dayPicks: {},
  hydrate: () => {
    if (get().hydrated || typeof window === "undefined") return;
    const baked = bakedScores();
    const board = readBoard();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          picks?: Record<string, Outcome>;
          saved?: string[];
          results?: Record<string, LoggedScore>;
          archive?: EspnMatch[];
          cards?: MonthCard[];
          lists?: WatchList[];
          board?: EspnMatch[];
          watching?: "all" | "bookmarked";
          dayPicks?: Record<string, string[]>;
          teamIds?: Record<string, string>;
          teamColors?: Record<string, { color?: string; color2?: string }>;
        };
        loadTeamIds(parsed.teamIds);
        loadTeamColors(parsed.teamColors);
        const results = { ...baked, ...(parsed.results ?? {}) };
        const archive = (Array.isArray(parsed.archive) ? parsed.archive : []).filter((r) => isKnownLeague(r?.league));
        const fromSlip = (!board.length && Array.isArray(parsed.board) ? parsed.board : board).filter((r) => isKnownLeague(r?.league));
        lockTeamsFrom(archive);
        lockTeamsFrom(fromSlip);
        const lists = cleanLists(parsed.lists);
        const watching = "all";
        const views = trackableViews(archive);
        const cards = snapshotMonthCards(
          views,
          results,
          sealMonthCards(Array.isArray(parsed.cards) ? parsed.cards : [], readSavedCards()),
          parsed.dayPicks ?? {},
        );
        const rolled = rollArchive(archive, cards);
        const doneIds = new Set(Object.keys(results));
        for (const r of fromSlip) {
          if (r.state === "ft") doneIds.add(`espn-${r.espnId}`);
        }
        const pruned = dropFinished(parsed.saved ?? [], lists, doneIds);
        const sealed = writeSlip(parsed.picks ?? {}, pruned.saved, results, rolled.archive, rolled.cards, pruned.lists, watching, parsed.dayPicks ?? {});
        set({
          hydrated: true,
          picks: parsed.picks ?? {},
          saved: pruned.saved,
          lists: pruned.lists,
          results,
          feed: fromSlip,
          archive: rolled.archive,
          cards: sealed,
          watching,
          dayPicks: parsed.dayPicks ?? {},
        });
        if (fromSlip.length) writeBoard(fromSlip);
        return;
      }
    } catch {
      /* keep stored months */
    }
    const cards = persistCards(readSavedCards());
    set({ hydrated: true, results: baked, feed: board, cards });
  },
  setPick: (matchId, call) => {
    const picks = { ...get().picks };
    if (!call) delete picks[matchId];
    else picks[matchId] = call;
    writeSlip(picks, get().saved, get().results, get().archive, get().cards, get().lists, get().watching, get().dayPicks);
    set({ picks });
  },
  toggleSaved: (matchId) => {
    const saved = get().saved.includes(matchId)
      ? get().saved.filter((id) => id !== matchId)
      : [...get().saved, matchId];
    writeSlip(get().picks, saved, get().results, get().archive, get().cards, get().lists, get().watching, get().dayPicks);
    set({ saved });
  },
  toggleWatching: () => {
    const watching = get().watching === "bookmarked" ? "all" : "bookmarked";
    writeSlip(get().picks, get().saved, get().results, get().archive, get().cards, get().lists, watching, get().dayPicks);
    set({ watching });
  },
  createList: (name) => {
    const trimmed = name.trim().slice(0, 28);
    if (!trimmed) return null;
    const id = `l${Date.now().toString(36)}`;
    const lists = [...get().lists, { id, name: trimmed, ids: [] }];
    writeSlip(get().picks, get().saved, get().results, get().archive, get().cards, lists, get().watching, get().dayPicks);
    set({ lists });
    return id;
  },
  renameList: (id, name) => {
    const trimmed = name.trim().slice(0, 28);
    if (!trimmed) return;
    const lists = get().lists.map((l) => (l.id === id ? { ...l, name: trimmed } : l));
    writeSlip(get().picks, get().saved, get().results, get().archive, get().cards, lists, get().watching, get().dayPicks);
    set({ lists });
  },
  deleteList: (id) => {
    const lists = get().lists.filter((l) => l.id !== id);
    writeSlip(get().picks, get().saved, get().results, get().archive, get().cards, lists, get().watching, get().dayPicks);
    set({ lists });
  },
  toggleInList: (listId, matchId) => {
    const lists = get().lists.map((l) => {
      if (l.id !== listId) return l;
      const ids = l.ids.includes(matchId) ? l.ids.filter((x) => x !== matchId) : [...l.ids, matchId];
      return { ...l, ids };
    });
    writeSlip(get().picks, get().saved, get().results, get().archive, get().cards, lists, get().watching, get().dayPicks);
    set({ lists });
  },
  applyFeed: (rows) => {
    const live = { ...get().live };
    const results = { ...get().results };
    const feed = get().feed;
    const byFixture = new Map<string, EspnMatch>();
    for (const row of feed) {
      for (const id of matchLookupIds({
        espnId: row.espnId,
        kickoff: row.kickoff,
        homeName: row.homeName,
        awayName: row.awayName,
      })) {
        byFixture.set(id, row);
      }
    }
    let dirty = false;
    const finished: EspnMatch[] = [];
    const visible = new Set(
      boardPool(feed, [yesterdayKeyNow(), todayKeyNow(), tomorrowKeyNow()]).map((row) => `${row.league}|${row.espnId}`),
    );
    for (const r of rows) {
      live[r.id] = { home: r.home, away: r.away, clock: r.clock, state: r.state };
      if (r.state !== "ft") continue;
      const prev = results[r.id];
      if (!prev || prev.home !== r.home || prev.away !== r.away) {
        results[r.id] = { home: r.home, away: r.away };
        const src = byFixture.get(r.id);
        if (src) {
          for (const id of matchLookupIds({
            id: r.id,
            espnId: src.espnId,
            kickoff: src.kickoff,
            homeName: src.homeName,
            awayName: src.awayName,
          })) {
            results[id] = { home: r.home, away: r.away };
          }
        }
        dirty = true;
      }
      const src = byFixture.get(r.id);
      if (src && visible.has(`${src.league}|${src.espnId}`)) {
        finished.push({
          ...src,
          homeScore: r.home,
          awayScore: r.away,
          state: "ft",
          clock: r.clock || "FT",
          listed: true,
        });
      }
    }
    let archive = get().archive;
    if (finished.length) {
      archive = mergeArchive(archive, finished);
      dirty = true;
    }
    let feedNext = feed;
    if (finished.length && feed.length) {
      const done = new Set(finished.map((r) => `${r.league}|${r.espnId}`));
      feedNext = feed.map((r) => {
        if (!done.has(`${r.league}|${r.espnId}`)) return r;
        const src = finished.find((f) => f.league === r.league && f.espnId === r.espnId);
        return src ?? r;
      });
    }
    if (dirty) {
      const doneIds = new Set(finished.map((r) => `espn-${r.espnId}`));
      for (const r of rows) {
        if (r.state === "ft") doneIds.add(r.id);
      }
      const pruned = dropFinished(get().saved, get().lists, doneIds);
      const views = trackableViews([...archive, ...feedNext]);
      const cards = snapshotMonthCards(views, results, get().cards, get().dayPicks);
      const rolled = rollArchive(archive, cards);
      const sealed = writeSlip(get().picks, pruned.saved, results, rolled.archive, rolled.cards, pruned.lists, get().watching, get().dayPicks);
      if (feedNext !== feed) writeBoard(feedNext);
      set({
        live,
        results,
        archive: rolled.archive,
        cards: sealed,
        feed: feedNext,
        saved: pruned.saved,
        lists: pruned.lists,
        beat: get().beat + 1,
        lastSync: Date.now(),
      });
      return;
    }
    set({ live, results, beat: get().beat + 1, lastSync: Date.now() });
  },
  setBoard: (rows) => {
    if (!rows.length) return;
    lockTeamsFrom(get().archive);
    lockTeamsFrom(get().feed);
    lockTeamsFrom(rows);
    const feed = mergeBoard(get().feed, rows);
    const visible = boardPool(rows, [yesterdayKeyNow(), todayKeyNow(), tomorrowKeyNow()]);
    const ft = visible
      .filter((r) => r.state === "ft" && r.homeScore != null)
      .map((r) => ({ ...r, listed: true }));
    const archive = ft.length ? mergeArchive(get().archive, ft) : get().archive;
    const doneIds = new Set(feed.filter((r) => r.state === "ft").map((r) => `espn-${r.espnId}`));
    const pruned = dropFinished(get().saved, get().lists, doneIds);
    writeSlip(get().picks, pruned.saved, get().results, archive, get().cards, pruned.lists, get().watching, get().dayPicks);
    writeBoard(feed);
    set({
      feed,
      archive,
      saved: pruned.saved,
      lists: pruned.lists,
      lastSync: Date.now(),
    });
  },
  ingestArchive: (rows) => {
    if (!rows.length) return;
    lockTeamsFrom(get().archive);
    lockTeamsFrom(get().feed);
    lockTeamsFrom(rows);
    const finished = rows.filter((r) => r.state === "ft" && r.homeScore != null && r.awayScore != null);
    if (!finished.length) return;
    const results = { ...get().results };
    for (const r of finished) {
      const score = { home: r.homeScore!, away: r.awayScore! };
      for (const id of matchLookupIds({
        espnId: r.espnId,
        kickoff: r.kickoff,
        homeName: r.homeName,
        awayName: r.awayName,
      })) {
        if (!results[id]) results[id] = score;
      }
    }
    const merged = mergeArchive(get().archive, finished);
    const views = trackableViews([...merged, ...get().feed]);
    const cards = snapshotMonthCards(views, results, get().cards, get().dayPicks);
    const rolled = rollArchive(merged, cards);
    const sealed = writeSlip(get().picks, get().saved, results, rolled.archive, rolled.cards, get().lists, get().watching, get().dayPicks);
    set({ results, archive: rolled.archive, cards: sealed, lastSync: Date.now(), beat: get().beat + 1 });
  },
  rememberPicks: (day, ids, replace = false) => {
    if (!day || !ids.length) return;
    const next = ids.slice(0, 5);
    const cur = get().dayPicks[day];
    if (cur && cur.join() === next.join()) return;
    if (!replace) {
      if (cur && cur.length >= 5) return;
      if (cur && cur.length >= next.length) return;
    }
    const dayPicks = { ...get().dayPicks, [day]: next };
    writeSlip(get().picks, get().saved, get().results, get().archive, get().cards, get().lists, get().watching, dayPicks);
    set({ dayPicks });
  },
  nudge: () => set({ beat: get().beat + 1, lastSync: get().lastSync ?? Date.now() }),
}));
