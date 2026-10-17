import type { Fixture, Outcome, Team } from "./types";
import { CUP_LEAGUES, LEAGUE_TIER } from "./types";

const MAX_GOALS = 8;
const RHO = -0.11;
const HOME_ADV = 1.28;

const fact = [1];
function factorial(n: number) {
  while (fact.length <= n) {
    fact.push(fact[fact.length - 1]! * fact.length);
  }
  return fact[n]!;
}

function poissonPmf(k: number, lambda: number) {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
}

function dixonColesTau(i: number, j: number, lh: number, la: number, rho: number) {
  if (i === 0 && j === 0) return 1 - lh * la * rho;
  if (i === 0 && j === 1) return 1 + lh * rho;
  if (i === 1 && j === 0) return 1 + la * rho;
  if (i === 1 && j === 1) return 1 - rho;
  return 1;
}

function formAttackMod(form: Team["form"], venue?: Team["form"]) {
  let m = 1;
  form.forEach((r, i) => {
    const w = Math.max(0.014, 0.066 * Math.pow(0.74, i));
    if (r === "W") m += w;
    if (r === "L") m -= w * 0.9;
  });
  if (venue?.length) {
    let v = 1;
    venue.forEach((r, i) => {
      const w = Math.max(0.014, 0.07 * Math.pow(0.74, i));
      if (r === "W") v += w;
      if (r === "L") v -= w * 0.9;
    });
    m = m * 0.38 + v * 0.62;
  }
  return Math.max(0.8, Math.min(1.26, m));
}

function formDefenseMod(form: Team["form"], venue?: Team["form"]) {
  let m = 1;
  form.forEach((r, i) => {
    const w = Math.max(0.012, 0.044 * Math.pow(0.74, i));
    if (r === "W") m -= w * 0.55;
    if (r === "L") m += w;
  });
  if (venue?.length) {
    let v = 1;
    venue.forEach((r, i) => {
      const w = Math.max(0.012, 0.048 * Math.pow(0.74, i));
      if (r === "W") v -= w * 0.55;
      if (r === "L") v += w;
    });
    m = m * 0.38 + v * 0.62;
  }
  return Math.max(0.82, Math.min(1.24, m));
}

function formElo(form: Team["form"] | undefined, venue?: Team["form"]) {
  const score = (seq: Team["form"] | undefined) => {
    if (!seq?.length) return 0;
    let pts = 0;
    seq.forEach((r, i) => {
      const w = Math.pow(0.74, i);
      if (r === "W") pts += 20 * w;
      else if (r === "L") pts -= 18 * w;
    });
    return pts;
  };
  const overall = score(form);
  const mixed = venue?.length ? overall * 0.38 + score(venue) * 0.62 : overall;
  return clamp(mixed, -70, 70);
}

function normTrio(t: Trio): Trio {
  const s = t.pHome + t.pDraw + t.pAway || 1;
  return { pHome: t.pHome / s, pDraw: t.pDraw / s, pAway: t.pAway / s };
}

export function eloTrio(homeElo: number, awayElo: number, homeAdv = 65): Trio {
  const d = homeElo - awayElo + homeAdv;
  const we = 1 / (1 + 10 ** (-d / 400));
  const pDraw = Math.max(0.07, 0.22 * Math.exp(-((d / 220) ** 2)));
  const rest = 1 - pDraw;
  return normTrio({ pHome: rest * we, pDraw, pAway: rest * (1 - we) });
}

function shinFair(q: number[]): number[] {
  const Q = q.reduce((a, b) => a + b, 0);
  if (Q <= 1.002) return q.map((x) => x / (Q || 1));
  let z = Math.min(0.4, Math.max(0.01, (Q - 1) / 2));
  for (let n = 0; n < 16; n += 1) {
    let f = -1;
    let df = 0;
    for (const qi of q) {
      const inside = Math.max(1e-12, z * z + (4 * (1 - z) * qi * qi) / Q);
      const root = Math.sqrt(inside);
      f += (root - z) / 2;
      const din = 2 * z - (4 * qi * qi) / Q;
      df += (din / (2 * root) - 1) / 2;
    }
    z -= f / (df || 1e-6);
    z = Math.min(0.49, Math.max(0, z));
  }
  const p = q.map((qi) => {
    const root = Math.sqrt(Math.max(1e-12, z * z + (4 * (1 - z) * qi * qi) / Q));
    return (root - z) / (2 * Math.max(1e-6, 1 - z));
  });
  const s = p.reduce((a, b) => a + b, 0) || 1;
  return p.map((x) => x / s);
}

export function marketTrio(odds?: { home: number; draw: number; away: number }): Trio | undefined {
  if (!odds) return undefined;
  const { home, draw, away } = odds;
  if (home < 1.08 || draw < 1.08 || away < 1.08) return undefined;
  const q = [1 / home, 1 / draw, 1 / away];
  const overround = q[0]! + q[1]! + q[2]!;
  if (overround < 1.02 || overround > 1.28) return undefined;
  const [pHome, pDraw, pAway] = shinFair(q);
  return normTrio({ pHome: pHome!, pDraw: pDraw!, pAway: pAway! });
}

function topCall(t: Trio): Outcome {
  if (t.pHome >= t.pDraw && t.pHome >= t.pAway) return "1";
  if (t.pAway >= t.pDraw && t.pAway >= t.pHome) return "2";
  return "X";
}

function sharpenTrio(t: Trio, power = 2.35): Trio {
  return normTrio({
    pHome: t.pHome ** power,
    pDraw: t.pDraw ** power,
    pAway: t.pAway ** power,
  });
}

export interface ScoreCell {
  home: number;
  away: number;
  p: number;
}

export interface TotalsQuote {
  line: number;
  over: number;
  under: number;
}

function overMass(cells: ScoreCell[], line: number) {
  let p = 0;
  for (const c of cells) if (c.home + c.away > line) p += c.p;
  return p;
}

function buildMatrix(lambdaHome: number, lambdaAway: number) {
  const cells: ScoreCell[] = [];
  let total = 0;
  for (let i = 0; i <= MAX_GOALS; i++) {
    for (let j = 0; j <= MAX_GOALS; j++) {
      const p =
        poissonPmf(i, lambdaHome) *
        poissonPmf(j, lambdaAway) *
        dixonColesTau(i, j, lambdaHome, lambdaAway, RHO);
      cells.push({ home: i, away: j, p });
      total += p;
    }
  }
  for (const c of cells) c.p /= total || 1;
  let pHome = 0;
  let pDraw = 0;
  let pAway = 0;
  let btts = 0;
  let best = cells[0]!;
  for (const c of cells) {
    if (c.home > c.away) pHome += c.p;
    else if (c.home === c.away) pDraw += c.p;
    else pAway += c.p;
    if (c.home > 0 && c.away > 0) btts += c.p;
    if (c.p > best.p) best = c;
  }
  return {
    cells,
    pHome,
    pDraw,
    pAway,
    btts,
    over15: overMass(cells, 1.5),
    over25: overMass(cells, 2.5),
    best,
  };
}

export function twoWayOver(overOdds: number, underOdds: number) {
  if (overOdds < 1.08 || underOdds < 1.08) return undefined;
  const qO = 1 / overOdds;
  const qU = 1 / underOdds;
  const s = qO + qU;
  if (s < 0.9 || s > 1.35) return undefined;
  return qO / s;
}

function poissonCdf(k: number, lambda: number) {
  let s = 0;
  for (let i = 0; i <= k; i++) s += poissonPmf(i, lambda);
  return s;
}

function invertTotal(line: number, pOver: number) {
  const k = Math.max(0, Math.floor(line));
  const target = Math.min(0.92, Math.max(0.08, 1 - pOver));
  let best = 2.5;
  let err = 1;
  for (let t = 1.05; t <= 4.3; t += 0.05) {
    const e = Math.abs(poissonCdf(k, t) - target);
    if (e < err) {
      err = e;
      best = t;
    }
  }
  return best;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function teamTier(team: Team) {
  const id = team.div ?? team.league;
  if (CUP_LEAGUES.has(id) && LEAGUE_TIER[id] === 0) return 62;
  const n = LEAGUE_TIER[id];
  return n && n > 0 ? n : 62;
}

function applyDivisionGap(home: Team, away: Team, lh: number, la: number) {
  const th = teamTier(home);
  const ta = teamTier(away);
  const d = (th - ta) / 100;
  if (Math.abs(d) < 0.1) return { lh, la, th, ta, d };
  const boost = 1 + Math.abs(d) * 0.55;
  const cut = 1 - Math.abs(d) * 0.32;
  if (d > 0) return { lh: lh * boost, la: la * cut, th, ta, d };
  return { lh: lh * cut, la: la * boost, th, ta, d };
}

function lambdasFromSignals(
  priorH: number,
  priorA: number,
  target?: Trio,
  over?: { line: number; pOver: number },
) {
  if (!target && !over) return undefined;
  let sum = priorH + priorA;
  if (over) sum = invertTotal(over.line, over.pOver);
  else if (target) sum = clamp(2.62 - target.pDraw * 1.4, 1.6, 3.6);
  let diff = priorH - priorA;
  if (target) {
    const edge = target.pHome - target.pAway;
    diff = Math.tanh(edge * 1.75) * Math.min(1.9, sum * 0.72);
  }
  return {
    lh: clamp((sum + diff) / 2, 0.2, 3.2),
    la: clamp((sum - diff) / 2, 0.15, 2.9),
  };
}

export type Ticket = Outcome | "1X" | "X2";
export type TotalsSide = "over" | "under";
export type TotalsLine = 1.5 | 2.5;

export interface TotalsCall {
  line: TotalsLine;
  side: TotalsSide;
  p: number;
  overP: number;
}

export interface Trio {
  pHome: number;
  pDraw: number;
  pAway: number;
}

export interface EngineMix {
  dixon: Trio;
  elo: Trio;
  market?: Trio;
  weights: { dixon: number; elo: number; market: number };
}

export interface Prediction {
  lambdaHome: number;
  lambdaAway: number;
  pHome: number;
  pDraw: number;
  pAway: number;
  call: Outcome;
  ticket: Ticket;
  ticketP: number;
  scoreHome: number;
  scoreAway: number;
  cells: ScoreCell[];
  btts: number;
  over15: number;
  over25: number;
  totals15: TotalsCall;
  totals25: TotalsCall;
  confidence: number;
  gap: number;
  strength: "strong" | "lean" | "toss-up";
  engines: EngineMix;
}

export function predict(
  home: Team,
  away: Team,
  opts?: {
    neutral?: boolean;
    odds?: { home: number; draw: number; away: number };
    totals?: TotalsQuote;
    knownTeams?: number;
    forebet?: Trio;
  },
): Prediction {
  const avgH = home.leagueAvgHome ?? 1.38;
  const avgA = home.leagueAvgAway ?? 1.12;
  const adv = opts?.neutral ? 1 : HOME_ADV;

  let lambdaHome = Math.max(
    0.15,
    avgH * home.attack * away.defense * adv * formAttackMod(home.form, home.formHome) * formDefenseMod(away.form, away.formAway),
  );
  let lambdaAway = Math.max(
    0.12,
    avgA * away.attack * home.defense * formAttackMod(away.form, away.formAway) * formDefenseMod(home.form, home.formHome),
  );
  const split = applyDivisionGap(home, away, lambdaHome, lambdaAway);
  lambdaHome = clamp(split.lh, 0.2, 3.2);
  lambdaAway = clamp(split.la, 0.15, 2.9);

  const market = marketTrio(opts?.odds);
  const forebet = opts?.forebet && opts.forebet.pHome + opts.forebet.pDraw + opts.forebet.pAway > 0.9
    ? normTrio(opts.forebet)
    : undefined;
  const pOverMkt =
    opts?.totals && opts.totals.line > 0 ? twoWayOver(opts.totals.over, opts.totals.under) : undefined;
  const fitted = lambdasFromSignals(
    lambdaHome,
    lambdaAway,
    market,
    pOverMkt != null && opts?.totals ? { line: opts.totals.line, pOver: pOverMkt } : undefined,
  );
  if (fitted) {
    const w = market ? 0.7 : 0.55;
    lambdaHome = (1 - w) * lambdaHome + w * fitted.lh;
    lambdaAway = (1 - w) * lambdaAway + w * fitted.la;
  }

  const matrix = buildMatrix(lambdaHome, lambdaAway);
  const cells = matrix.cells;
  const dixon = normTrio({ pHome: matrix.pHome, pDraw: matrix.pDraw, pAway: matrix.pAway });
  const elo = eloTrio(
    home.elo + split.th * 4 + formElo(home.form, home.formHome),
    away.elo + split.ta * 4 + formElo(away.form, away.formAway),
    opts?.neutral ? 0 : 65,
  );
  const weights = market
    ? forebet
      ? { dixon: 0.42, elo: 0.14, market: 0.28, forebet: 0.16 }
      : { dixon: 0.52, elo: 0.16, market: 0.32, forebet: 0 }
    : forebet
      ? { dixon: 0.58, elo: 0.2, market: 0, forebet: 0.22 }
      : { dixon: 0.76, elo: 0.24, market: 0, forebet: 0 };
  const raw = normTrio({
    pHome: weights.dixon * dixon.pHome + weights.elo * elo.pHome + weights.market * (market?.pHome ?? 0) + weights.forebet * (forebet?.pHome ?? 0),
    pDraw: weights.dixon * dixon.pDraw + weights.elo * elo.pDraw + weights.market * (market?.pDraw ?? 0) + weights.forebet * (forebet?.pDraw ?? 0),
    pAway: weights.dixon * dixon.pAway + weights.elo * elo.pAway + weights.market * (market?.pAway ?? 0) + weights.forebet * (forebet?.pAway ?? 0),
  });
  const side = topCall(raw);
  const agreed =
    side !== "X" &&
    topCall(dixon) === side &&
    topCall(elo) === side &&
    (!market || topCall(market) === side) &&
    (!forebet || topCall(forebet) === side);
  const blended = agreed ? sharpenTrio(raw, 1.35) : sharpenTrio(raw, 1.15);
  const pHome = blended.pHome;
  const pDraw = blended.pDraw;
  const pAway = blended.pAway;

  const trio: { call: Outcome; p: number }[] = [
    { call: "1", p: pHome },
    { call: "X", p: pDraw },
    { call: "2", p: pAway },
  ];
  trio.sort((a, b) => b.p - a.p);
  let call = trio[0]!.call;
  let confidence = trio[0]!.p;
  const gap = trio[0]!.p - trio[1]!.p;
  const homeStrong = allowStrong("1", pHome, pDraw, pAway, home, away, market, dixon, agreed && topCall(dixon) === "1" && topCall(elo) === "1");
  const awayStrong = allowStrong("2", pAway, pDraw, pHome, home, away, market, dixon, agreed && topCall(dixon) === "2" && topCall(elo) === "2");
  if (homeStrong || awayStrong) {
    if (homeStrong && (!awayStrong || pHome >= pAway)) {
      call = "1";
      confidence = pHome;
    } else {
      call = "2";
      confidence = pAway;
    }
  }
  const p1X = pHome + pDraw;
  const pX2 = pAway + pDraw;
  const twoWay = Math.max(p1X, pX2);
  const pOtherSide = call === "1" ? pAway : call === "2" ? pHome : Math.max(pHome, pAway);
  let strength: Prediction["strength"] =
    homeStrong || awayStrong
      ? "strong"
      : (call === "1" || call === "2") && twoWay >= 0.78 && confidence >= 0.48 && confidence - pDraw >= 0.08 && confidence - pOtherSide >= 0.08
        ? "lean"
        : "toss-up";

  const blowout = matrix.best;
  const blowMargin = Math.abs(blowout.home - blowout.away);
  const blowCall: Outcome =
    blowout.home > blowout.away ? "1" : blowout.away > blowout.home ? "2" : "X";
  if (strength !== "strong" && blowMargin >= 2 && blowCall !== "X") {
    const pWin = blowCall === "1" ? pHome : pAway;
    const pOth = blowCall === "1" ? pAway : pHome;
    if (allowStrong(blowCall, pWin, pDraw, pOth, home, away, market, dixon, agreed && topCall(dixon) === blowCall && topCall(elo) === blowCall)) {
      strength = "strong";
      call = blowCall;
      confidence = pWin;
    }
  }

  const ticket: Ticket = strength === "strong" ? call : p1X >= pX2 ? "1X" : "X2";
  const ticketP = strength === "strong" ? confidence : Math.max(p1X, pX2);
  const ranked = [...cells].sort((a, b) => b.p - a.p);
  const score = ranked[0] ?? matrix.best;

  return {
    lambdaHome,
    lambdaAway,
    pHome,
    pDraw,
    pAway,
    call,
    ticket,
    ticketP,
    scoreHome: score.home,
    scoreAway: score.away,
    cells,
    btts: matrix.btts,
    over15: matrix.over15,
    over25: matrix.over25,
    totals15: totalsFromOver(1.5, matrix.over15),
    totals25: totalsFromOver(2.5, matrix.over25),
    confidence,
    gap,
    strength,
    engines: { dixon, elo, market, weights: { dixon: weights.dixon, elo: weights.elo, market: weights.market } },
  };
}

export type Strength = Prediction["strength"];
export const STRENGTHS = ["strong", "lean", "toss-up"] as const;

export function isStrength(value: string): value is Strength {
  return value === "strong" || value === "lean" || value === "toss-up";
}

export function impliedFromDecimal(odds: number) {
  return 1 / odds;
}

export function isValue(modelP: number, decimalOdds: number, edge = 0.04) {
  return modelP - impliedFromDecimal(decimalOdds) >= edge;
}

export function outcomeOf(homeGoals: number, awayGoals: number): Outcome {
  if (homeGoals > awayGoals) return "1";
  if (homeGoals < awayGoals) return "2";
  return "X";
}

export function callHit(pred: Outcome, actual: Outcome) {
  return pred === actual;
}

export function ticketHit(ticket: Ticket, actual: Outcome) {
  if (ticket === "1X") return actual === "1" || actual === "X";
  if (ticket === "X2") return actual === "2" || actual === "X";
  return ticket === actual;
}

export function brierScore(pHome: number, pDraw: number, pAway: number, actual: Outcome) {
  const y1 = actual === "1" ? 1 : 0;
  const yx = actual === "X" ? 1 : 0;
  const y2 = actual === "2" ? 1 : 0;
  return (pHome - y1) ** 2 + (pDraw - yx) ** 2 + (pAway - y2) ** 2;
}

export function reasonsFor(home: Team, away: Team, pred: Prediction): string[] {
  const lines: string[] = [];
  const xgH = pred.lambdaHome.toFixed(2);
  const xgA = pred.lambdaAway.toFixed(2);
  lines.push(
    `Attack × defence produces ${xgH} expected home goals and ${xgA} away. Most likely score is ${pred.scoreHome}–${pred.scoreAway}.`,
  );

  const attGap = home.attack - away.attack;
  if (attGap > 0.25) {
    lines.push(
      `${home.name} carry a clear attacking edge (${home.attack.toFixed(2)} vs ${away.attack.toFixed(2)}).`,
    );
  } else if (attGap < -0.25) {
    lines.push(
      `${away.name} are the sharper attack on the ratings, even as the away side.`,
    );
  } else {
    lines.push("The two attacks sit close on the ratings — the 1X2 is decided by defence and home edge.");
  }

  const defGap = away.defense - home.defense;
  if (home.defense < 0.8) {
    lines.push(`${home.short} concede at a top-side rate; visitors are marked down.`);
  } else if (defGap > 0.2) {
    lines.push(`${away.name} look leakier at the back, which lifts the home-win column.`);
  }

  const homeWins = home.form.filter((r) => r === "W").length;
  const awayWins = away.form.filter((r) => r === "W").length;
  if (homeWins >= 4) lines.push(`${home.name} arrive on a hot run (${formText(home.form)}).`);
  else if (homeWins <= 1) lines.push(`${home.name} have been stuttering (${formText(home.form)}).`);
  if (awayWins >= 4) lines.push(`${away.name} travel in form (${formText(away.form)}).`);
  else if (awayWins <= 1) lines.push(`${away.name} have taken few wins in the last five (${formText(away.form)}).`);

  if (pred.ticket === "1X" || pred.ticket === "X2") {
    lines.push(
      `Lean, so the published call is ${pred.ticket} (${ticketLabel(pred.ticket)}) at ${pct(pred.ticketP)} — the likelier two-way.`,
    );
  } else if (pred.call === "X") {
    lines.push("The score matrix piles up on the diagonal — a draw is the least-wrong call.");
  } else if (pred.strength === "toss-up") {
    lines.push("Probabilities are bunched. Treat this as a lean, not a conviction.");
  } else if (pred.strength === "strong") {
    lines.push(
      `The model is ${Math.round(pred.confidence * 100)}% on ${callLabel(pred.call)}, ${Math.round((pred.confidence - pred.pDraw) * 100)}pts ahead of the draw.`,
    );
  }

  if (pred.totals15.p >= 0.58) {
    lines.push(`${totalsLabel(pred.totals15)} sits at ${pct(pred.totals15.p)} of the matrix.`);
  }
  if (pred.totals25.p >= 0.55) {
    lines.push(`${totalsLabel(pred.totals25)} is the lean at ${pct(pred.totals25.p)}.`);
  }
  if (pred.btts > 0.55) lines.push(`Both teams to score is ${pct(pred.btts)}.`);

  const { dixon, elo, market } = pred.engines;
  const dCall = topCall(dixon);
  const eCall = topCall(elo);
  if (market) {
    const mCall = topCall(market);
    if (dCall === eCall && eCall === mCall) {
      lines.push(`Expected goals, club strength and the book all lean ${callLabel(dCall)}.`);
    } else {
      lines.push(
        `The three views split: expected goals ${callLabel(dCall)}, club strength ${callLabel(eCall)}, book ${callLabel(mCall)}. The published ticket is the mix.`,
      );
    }
  } else if (dCall === eCall) {
    lines.push(`Expected goals and club strength agree on ${callLabel(dCall)}.`);
  } else {
    lines.push(
      `Expected goals lean ${callLabel(dCall)}; club strength leans ${callLabel(eCall)}. The published ticket sits between them.`,
    );
  }

  return lines.slice(0, 7);
}

export function callLabel(call: Outcome) {
  if (call === "1") return "home win";
  if (call === "2") return "away win";
  return "draw";
}

export function ticketLabel(ticket: Ticket) {
  if (ticket === "1X") return "home or draw";
  if (ticket === "X2") return "away or draw";
  return callLabel(ticket);
}

export function totalsFromOver(line: TotalsLine, overP: number): TotalsCall {
  const side: TotalsSide = overP >= 0.5 ? "over" : "under";
  return { line, side, p: side === "over" ? overP : 1 - overP, overP };
}

export function totalsHit(call: TotalsCall, homeGoals: number, awayGoals: number) {
  const over = homeGoals + awayGoals > call.line;
  return call.side === "over" ? over : !over;
}

export function totalsLabel(call: TotalsCall) {
  return call.side === "over" ? `Over ${call.line}` : `Under ${call.line}`;
}

export function totalsShort(call: TotalsCall) {
  return call.side === "over" ? `O ${call.line}` : `U ${call.line}`;
}

export function strengthCopy(s: Prediction["strength"]) {
  if (s === "strong") {
    return {
      label: "Strong",
      blurb: "Straight 1 or 2 in any league. Board win and score chance are both 70%+, and 22 points clear of the draw and the other side.",
    };
  }
  if (s === "lean") {
    return {
      label: "Lean",
      blurb: "Two-way 1X or X2 sitting around 80%. The win leads, but the draw is still in the ticket.",
    };
  }
  return {
    label: "Toss-up",
    blurb: "Too close for a straight win. Published as the likelier two-way, 1X or X2.",
  };
}

export function callShort(call: Outcome) {
  if (call === "1") return "1";
  if (call === "2") return "2";
  return "X";
}

export function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

/** Same bar for the board win and the score chance, in every league. */
export function meetsStrong(pWin: number, pDraw: number, pOther?: number) {
  const w = Math.round(pWin * 100);
  const d = Math.round(pDraw * 100);
  const o = pOther == null ? Math.max(0, 100 - w - d) : Math.round(pOther * 100);
  return w >= 70 && w - d >= 22 && w - o >= 22;
}

function isCupSide(team: Team) {
  return CUP_LEAGUES.has(team.league);
}

function marketAgrees(call: Outcome, market?: Trio) {
  if (!market) return false;
  if (call !== "1" && call !== "2") return false;
  const mWin = call === "1" ? market.pHome : market.pAway;
  const mFav: Outcome = market.pHome >= market.pAway ? "1" : "2";
  return mFav === call && Math.round(mWin * 100) >= 60;
}

function formSupports(form: Team["form"] | undefined) {
  if (!form?.length) return false;
  const recent = form.slice(0, 5);
  const wins = recent.filter((r) => r === "W").length;
  const losses = recent.filter((r) => r === "L").length;
  if (recent.slice(0, 3).every((r) => r === "L")) return false;
  return wins >= losses;
}

function eloSupports(call: Outcome, home: Team, away: Team) {
  const d = home.elo - away.elo;
  if (call === "1") return d + 65 >= 120;
  return d <= -140;
}

function allowStrong(
  call: Outcome,
  pWin: number,
  pDraw: number,
  pOther: number,
  home: Team,
  away: Team,
  market: Trio | undefined,
  dixon: Trio,
  agreed: boolean,
) {
  if (call !== "1" && call !== "2") return false;
  if (!agreed) return false;
  if (isCupSide(home) || isCupSide(away)) return false;
  if (!eloSupports(call, home, away)) return false;
  const fav = call === "1" ? home : away;
  if (!formSupports(fav.form)) return false;
  if (market && !marketAgrees(call, market)) return false;
  const dWin = call === "1" ? dixon.pHome : dixon.pAway;
  const dOth = call === "1" ? dixon.pAway : dixon.pHome;
  if (!meetsStrong(dWin, dixon.pDraw, dOth)) return false;
  return meetsStrong(pWin, pDraw, pOther);
}

export function formText(form: Team["form"]) {
  return form.join("·");
}

export function attachPrediction(fixture: Fixture, home: Team, away: Team) {
  return { ...fixture, pred: predict(home, away) };
}
