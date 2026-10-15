import { useEffect } from "react";
import { scoresFromFeed } from "@/lib/live-board";
import { pullBoard } from "@/lib/pull-scores";
import { useSlip } from "@/lib/store";
import type { EspnMatch } from "@/lib/espn";
import { dayKey, tomorrowKeyNow } from "@/lib/format";

const empty: EspnMatch[] = [];

export function ScoreSync() {
  const hydrated = useSlip((s) => s.hydrated);
  const applyFeed = useSlip((s) => s.applyFeed);
  const setBoard = useSlip((s) => s.setBoard);

  useEffect(() => {
    if (!hydrated) return;
    let on = true;
    let timer = 0;
    let delay = 400;
    let first = true;
    let inflight = false;

    async function tick() {
      if (inflight) return;
      inflight = true;
      const refresh = first;
      first = false;
      try {
        const rows = await Promise.race([
          pullBoard({ data: { refresh } }),
          new Promise<typeof empty>((resolve) => setTimeout(() => resolve(empty), refresh ? 22_000 : 12_000)),
        ]);
        if (!on) return;
        const have = useSlip.getState().feed;
        if (!rows.length) {
          delay = have.length ? 8_000 : 1200;
          if (!have.length) first = true;
        } else if (!have.length) {
          setBoard(rows);
          applyFeed(scoresFromFeed(rows));
          const thin =
            rows.filter((r) => r.homeAttack == null && r.awayAttack == null).length > rows.length * 0.35;
          delay = rows.some((r) => r.state === "live") ? 8_000 : thin ? 2_000 : 45_000;
        } else {
          applyFeed(scoresFromFeed(rows));
          const known = new Set(have.map((r) => `${r.league}|${r.espnId}`));
          const extras = rows.some((r) => !known.has(`${r.league}|${r.espnId}`));
          const needTables =
            have.some((r) => r.homeAttack == null && r.awayAttack == null) &&
            rows.some((r) => r.homeAttack != null || r.awayAttack != null);
          const needForm =
            have.some((r) => !r.homeForm?.length || !r.awayForm?.length) &&
            rows.some((r) => (r.homeForm?.length ?? 0) > 0 || (r.awayForm?.length ?? 0) > 0);
          const tomorrow = tomorrowKeyNow();
          const needTomorrow =
            !have.some((r) => dayKey(r.kickoff) === tomorrow) && rows.some((r) => dayKey(r.kickoff) === tomorrow);
          const needOdds =
            have.some((r) => r.oddsBook !== "bet365" && r.oddsBook !== "market") &&
            rows.some((r) => r.oddsBook === "bet365" || r.oddsBook === "market");
          const needColors =
            have.some((r) => !r.homeColor) && rows.some((r) => Boolean(r.homeColor));
          if (refresh || extras || needTables || needForm || needTomorrow || needOdds || needColors) setBoard(rows);
          const thin =
            rows.filter((r) => r.homeAttack == null && r.awayAttack == null).length > rows.length * 0.35;
          delay = rows.some((r) => r.state === "live") ? 8_000 : thin ? 2_000 : 45_000;
        }
      } catch {
        delay = 3000;
      } finally {
        inflight = false;
      }
      if (on) timer = window.setTimeout(tick, delay);
    }

    tick();
    const onVis = () => {
      if (document.visibilityState === "visible") {
        first = true;
        tick();
      }
    };
    const onFocus = () => {
      first = true;
      tick();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onFocus);
    return () => {
      on = false;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onFocus);
    };
  }, [hydrated, applyFeed, setBoard]);

  return null;
}
