import { teamIdFor } from "./crosscheck";
import type { LeagueId } from "./types";

const TEAM_BADGES = new Map<string, string>();
const LEAGUE_LOGO: Partial<Record<LeagueId, number>> = {};

export function registerLeagueLogos(ids: Partial<Record<LeagueId, number>>) {
  Object.assign(LEAGUE_LOGO, ids);
}

export function fotmobTeamBadge(id?: string | number) {
  const n = String(id ?? "");
  if (!/^\d+$/.test(n)) return undefined;
  return `https://images.fotmob.com/image_resources/logo/teamlogo/${n}.png`;
}

export function espnTeamBadge(id?: string | number) {
  const n = String(id ?? "");
  if (!/^\d+$/.test(n)) return undefined;
  return `https://a.espncdn.com/i/teamlogos/soccer/500/${n}.png`;
}

export function leagueBadge(league: LeagueId) {
  const id = LEAGUE_LOGO[league];
  if (!id) return undefined;
  return `https://images.fotmob.com/image_resources/logo/leaguelogo/${id}.png`;
}

export function rememberBadge(name: string, url?: string, prefer = false, league?: LeagueId) {
  if (!url || !name) return;
  const id = teamIdFor(name, undefined, undefined, league);
  if (!prefer && TEAM_BADGES.has(id)) return;
  TEAM_BADGES.set(id, url);
}

export function badgeFor(name: string, league?: LeagueId) {
  return TEAM_BADGES.get(teamIdFor(name, undefined, undefined, league));
}
