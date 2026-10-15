import type { LeagueId, Team } from "../types";
import { EXTRA_TEAMS } from "./extra";

const epl = { leagueAvgHome: 1.42, leagueAvgAway: 1.16 } as const;
const euro = { leagueAvgHome: 1.48, leagueAvgAway: 1.12 } as const;
const pokal = { leagueAvgHome: 1.35, leagueAvgAway: 1.22 } as const;
const eflc = { leagueAvgHome: 1.32, leagueAvgAway: 1.14 } as const;
const el1 = { leagueAvgHome: 1.34, leagueAvgAway: 1.18 } as const;
const el2 = { leagueAvgHome: 1.3, leagueAvgAway: 1.16 } as const;
const spl = { leagueAvgHome: 1.4, leagueAvgAway: 1.18 } as const;
const laliga = { leagueAvgHome: 1.4, leagueAvgAway: 1.1 } as const;
const sa = { leagueAvgHome: 1.36, leagueAvgAway: 1.12 } as const;
const bl = { leagueAvgHome: 1.62, leagueAvgAway: 1.28 } as const;
const ere = { leagueAvgHome: 1.55, leagueAvgAway: 1.22 } as const;

export const TEAMS: Team[] = [
  { id: "ars", name: "Arsenal", short: "ARS", league: "EPL", attack: 1.58, defense: 0.62, elo: 1935, form: ["W", "W", "W", "D", "W"], color: "#ef0107", color2: "#063672", ...epl },
  { id: "mci", name: "Manchester City", short: "MCI", league: "EPL", attack: 1.72, defense: 0.68, elo: 1950, form: ["W", "W", "D", "W", "W"], color: "#6cabdd", color2: "#1c2c5b", ...epl },
  { id: "liv", name: "Liverpool", short: "LIV", league: "EPL", attack: 1.62, defense: 0.72, elo: 1918, form: ["W", "W", "W", "W", "D"], color: "#c8102e", color2: "#00b2a9", ...epl },
  { id: "che", name: "Chelsea", short: "CHE", league: "EPL", attack: 1.44, defense: 0.78, elo: 1844, form: ["W", "D", "W", "W", "L"], color: "#034694", color2: "#dba111", ...epl },
  { id: "new", name: "Newcastle", short: "NEW", league: "EPL", attack: 1.38, defense: 0.84, elo: 1798, form: ["W", "L", "W", "D", "W"], color: "#241f20", color2: "#ffffff", ...epl },
  { id: "avl", name: "Aston Villa", short: "AVL", league: "EPL", attack: 1.34, defense: 0.86, elo: 1782, form: ["D", "W", "W", "L", "W"], color: "#670e36", color2: "#95bfe5", ...epl },
  { id: "tot", name: "Tottenham", short: "TOT", league: "EPL", attack: 1.4, defense: 0.94, elo: 1766, form: ["W", "L", "W", "W", "D"], color: "#132257", color2: "#ffffff", ...epl },
  { id: "mun", name: "Manchester United", short: "MUN", league: "EPL", attack: 1.26, defense: 0.96, elo: 1724, form: ["D", "W", "L", "W", "D"], color: "#da291c", color2: "#fbe122", ...epl },
  { id: "nfo", name: "Nott'm Forest", short: "NFO", league: "EPL", attack: 1.18, defense: 0.9, elo: 1694, form: ["W", "D", "L", "W", "W"], color: "#dd0000", color2: "#ffffff", ...epl },
  { id: "bha", name: "Brighton", short: "BHA", league: "EPL", attack: 1.22, defense: 0.98, elo: 1688, form: ["D", "W", "D", "W", "L"], color: "#005daa", color2: "#ffffff", ...epl },
  { id: "cry", name: "Crystal Palace", short: "CRY", league: "EPL", attack: 1.12, defense: 0.92, elo: 1662, form: ["W", "D", "W", "L", "D"], color: "#1b458f", color2: "#c4122e", ...epl },
  { id: "bou", name: "Bournemouth", short: "BOU", league: "EPL", attack: 1.16, defense: 1.04, elo: 1648, form: ["L", "W", "W", "D", "L"], color: "#b50e12", color2: "#000000", ...epl },
  { id: "bre", name: "Brentford", short: "BRE", league: "EPL", attack: 1.14, defense: 1.0, elo: 1640, form: ["W", "L", "D", "W", "D"], color: "#e30613", color2: "#fbb800", ...epl },
  { id: "ful", name: "Fulham", short: "FUL", league: "EPL", attack: 1.1, defense: 0.98, elo: 1632, form: ["D", "D", "W", "L", "W"], color: "#000000", color2: "#ffffff", ...epl },
  { id: "eve", name: "Everton", short: "EVE", league: "EPL", attack: 1.02, defense: 0.88, elo: 1620, form: ["D", "W", "D", "L", "W"], color: "#003399", color2: "#ffffff", ...epl },
  { id: "lee", name: "Leeds United", short: "LEE", league: "EPL", attack: 1.16, defense: 1.06, elo: 1608, form: ["W", "W", "L", "D", "W"], color: "#1d428a", color2: "#ffcd00", ...epl },
  { id: "sun", name: "Sunderland", short: "SUN", league: "EPL", attack: 0.96, defense: 1.08, elo: 1564, form: ["L", "W", "D", "W", "L"], color: "#eb172b", color2: "#ffffff", ...epl },
  { id: "ips", name: "Ipswich Town", short: "IPS", league: "EPL", attack: 0.94, defense: 1.14, elo: 1522, form: ["W", "D", "L", "W", "L"], color: "#0033a0", color2: "#de071c", ...epl, homeAdv: 1.06 },
  { id: "cov", name: "Coventry City", short: "COV", league: "EPL", attack: 0.92, defense: 1.1, elo: 1504, form: ["W", "W", "D", "L", "W"], color: "#77b3d4", color2: "#1d3c6e", ...epl, homeAdv: 1.04 },
  { id: "hul", name: "Hull City", short: "HUL", league: "EPL", attack: 0.88, defense: 1.16, elo: 1478, form: ["D", "W", "L", "D", "W"], color: "#f18a00", color2: "#000000", ...epl, homeAdv: 1.08 },

  { id: "bet", name: "Real Betis", short: "BET", league: "LALIGA", attack: 1.28, defense: 0.92, elo: 1710, form: ["W", "D", "W", "L", "W"], color: "#00954c", color2: "#ffffff", leagueAvgHome: 1.4, leagueAvgAway: 1.1 },
  { id: "rso", name: "Real Sociedad", short: "RSO", league: "LALIGA", attack: 1.22, defense: 0.9, elo: 1702, form: ["D", "W", "D", "W", "L"], color: "#0067b1", color2: "#ffffff", leagueAvgHome: 1.4, leagueAvgAway: 1.1 },

  { id: "om", name: "Marseille", short: "OM", league: "L1", attack: 1.4, defense: 0.88, elo: 1760, form: ["W", "W", "D", "W", "L"], color: "#2faeea", color2: "#ffffff", leagueAvgHome: 1.44, leagueAvgAway: 1.14 },
  { id: "rcs", name: "Strasbourg", short: "STR", league: "L1", attack: 1.18, defense: 0.96, elo: 1668, form: ["W", "D", "W", "W", "D"], color: "#009fe3", color2: "#e30613", leagueAvgHome: 1.44, leagueAvgAway: 1.14 },

  { id: "vfb", name: "Stuttgart", short: "VFB", league: "DFB", attack: 1.46, defense: 0.86, elo: 1744, form: ["W", "W", "L", "W", "W"], color: "#e32219", color2: "#ffffff", ...pokal },
  { id: "sge", name: "Eintracht Frankfurt", short: "SGE", league: "DFB", attack: 1.5, defense: 0.9, elo: 1758, form: ["W", "D", "W", "W", "L"], color: "#e1000f", color2: "#000000", ...pokal },
  { id: "fck", name: "Kaiserslautern", short: "FCK", league: "DFB", attack: 1.12, defense: 1.02, elo: 1540, form: ["W", "L", "W", "D", "W"], color: "#e30613", color2: "#ffffff", ...pokal },
  { id: "ksc", name: "Karlsruher SC", short: "KSC", league: "DFB", attack: 1.08, defense: 1.04, elo: 1508, form: ["D", "W", "L", "W", "D"], color: "#0075bf", color2: "#ffffff", ...pokal },
  { id: "fch", name: "Hansa Rostock", short: "FCH", league: "DFB", attack: 0.9, defense: 1.12, elo: 1390, form: ["L", "W", "D", "L", "W"], color: "#005ca9", color2: "#ffffff", ...pokal, homeAdv: 1.12 },
  { id: "wma", name: "Waldhof Mannheim", short: "WMA", league: "DFB", attack: 0.86, defense: 1.14, elo: 1320, form: ["W", "L", "W", "D", "L"], color: "#007a33", color2: "#000000", ...pokal, homeAdv: 1.14 },
  { id: "prm", name: "Preußen Münster", short: "PRM", league: "DFB", attack: 0.94, defense: 1.08, elo: 1410, form: ["W", "D", "W", "L", "D"], color: "#009639", color2: "#ffffff", ...pokal, homeAdv: 1.1 },
  { id: "sto", name: "St. Tönis", short: "STO", league: "DFB", attack: 0.62, defense: 1.32, elo: 1120, form: ["W", "W", "L", "W", "D"], color: "#1a3d8f", color2: "#ffffff", ...pokal, homeAdv: 1.18 },

  { id: "and", name: "Anderlecht", short: "AND", league: "UEL", attack: 1.36, defense: 0.86, elo: 1688, form: ["W", "W", "D", "W", "W"], color: "#5b2d8e", color2: "#ffffff", ...euro },
  { id: "kai", name: "Kairat Almaty", short: "KAI", league: "UEL", attack: 1.08, defense: 1.04, elo: 1490, form: ["W", "D", "W", "L", "W"], color: "#f6c90e", color2: "#000000", ...euro },
  { id: "jag", name: "Jagiellonia", short: "JAG", league: "UEL", attack: 1.32, defense: 0.92, elo: 1604, form: ["W", "W", "W", "D", "W"], color: "#d2232a", color2: "#f5c400", ...euro },
  { id: "ibe", name: "Iberia 1999", short: "IBE", league: "UEL", attack: 0.92, defense: 1.16, elo: 1410, form: ["D", "W", "L", "W", "L"], color: "#e30613", color2: "#ffffff", ...euro },
  { id: "mja", name: "Mjällby", short: "MJA", league: "UEL", attack: 1.04, defense: 0.98, elo: 1518, form: ["W", "W", "D", "W", "L"], color: "#f5c400", color2: "#000000", ...euro },
  { id: "rbs", name: "Salzburg", short: "RBS", league: "UEL", attack: 1.52, defense: 0.82, elo: 1730, form: ["W", "W", "W", "D", "W"], color: "#d50032", color2: "#ffffff", ...euro },
  { id: "bjk", name: "Beşiktaş", short: "BJK", league: "UEL", attack: 1.38, defense: 0.9, elo: 1674, form: ["W", "D", "W", "W", "L"], color: "#000000", color2: "#ffffff", ...euro },
  { id: "zal", name: "Kauno Žalgiris", short: "ZAL", league: "UEL", attack: 0.88, defense: 1.14, elo: 1388, form: ["W", "L", "D", "W", "L"], color: "#007a33", color2: "#ffffff", ...euro },
  { id: "egn", name: "Egnatia", short: "EGN", league: "UEL", attack: 0.98, defense: 1.02, elo: 1440, form: ["D", "W", "D", "L", "W"], color: "#0b3d91", color2: "#ffffff", ...euro },
  { id: "lil", name: "Lillestrøm", short: "LIL", league: "UEL", attack: 1.08, defense: 0.96, elo: 1502, form: ["W", "D", "W", "L", "D"], color: "#f5c400", color2: "#000000", ...euro },
  { id: "lpo", name: "Lech Poznań", short: "LPO", league: "UEL", attack: 1.42, defense: 0.84, elo: 1658, form: ["W", "W", "W", "W", "D"], color: "#0a3d91", color2: "#ffffff", ...euro },
  { id: "thu", name: "Thun", short: "THU", league: "UEL", attack: 0.9, defense: 1.12, elo: 1404, form: ["W", "L", "W", "D", "L"], color: "#d2232a", color2: "#ffffff", ...euro },
  { id: "trb", name: "Trabzonspor", short: "TRB", league: "UEL", attack: 1.24, defense: 0.94, elo: 1610, form: ["W", "D", "L", "W", "W"], color: "#830051", color2: "#6bb8e5", ...euro },
  { id: "fer", name: "Ferencváros", short: "FER", league: "UEL", attack: 1.34, defense: 0.88, elo: 1660, form: ["W", "W", "D", "W", "W"], color: "#007a33", color2: "#ffffff", ...euro },
  { id: "crv", name: "Crvena Zvezda", short: "CRV", league: "UEL", attack: 1.4, defense: 0.86, elo: 1680, form: ["W", "W", "W", "D", "W"], color: "#d2232a", color2: "#ffffff", ...euro },
  { id: "plz", name: "Viktoria Plzeň", short: "PLZ", league: "UEL", attack: 1.26, defense: 0.92, elo: 1622, form: ["W", "L", "W", "W", "D"], color: "#d2232a", color2: "#003087", ...euro },
  { id: "ofi", name: "OFI Crete", short: "OFI", league: "UEL", attack: 1.06, defense: 1.02, elo: 1476, form: ["D", "W", "L", "W", "D"], color: "#000000", color2: "#ffffff", ...euro },
  { id: "csk", name: "CSKA Sofia", short: "CSK", league: "UEL", attack: 1.12, defense: 0.96, elo: 1514, form: ["W", "D", "W", "L", "W"], color: "#d2232a", color2: "#ffffff", ...euro },

  { id: "std", name: "Standard Liège", short: "STD", league: "BEL", attack: 1.16, defense: 0.98, elo: 1566, form: ["W", "L", "D", "W", "W"], color: "#d2232a", color2: "#ffffff", leagueAvgHome: 1.4, leagueAvgAway: 1.14 },
  { id: "lou", name: "La Louvière", short: "LOU", league: "BEL", attack: 0.92, defense: 1.12, elo: 1398, form: ["L", "W", "D", "L", "W"], color: "#0a3d91", color2: "#ffffff", leagueAvgHome: 1.4, leagueAvgAway: 1.14 },

  { id: "cra", name: "Cracovia", short: "CRA", league: "EKE", attack: 1.14, defense: 0.96, elo: 1520, form: ["W", "D", "W", "L", "W"], color: "#d2232a", color2: "#ffffff", leagueAvgHome: 1.38, leagueAvgAway: 1.16 },
  { id: "wie", name: "Wieczysta Kraków", short: "WIE", league: "EKE", attack: 1.02, defense: 1.06, elo: 1444, form: ["D", "W", "L", "W", "D"], color: "#f5c400", color2: "#000000", leagueAvgHome: 1.38, leagueAvgAway: 1.16 },

  { id: "sir", name: "IK Sirius", short: "SIR", league: "ALLS", attack: 1.08, defense: 1.02, elo: 1488, form: ["W", "L", "D", "W", "L"], color: "#0a3d91", color2: "#000000", leagueAvgHome: 1.46, leagueAvgAway: 1.22 },
  { id: "hack", name: "Häcken", short: "BKH", league: "ALLS", attack: 1.28, defense: 0.94, elo: 1580, form: ["W", "W", "L", "W", "D"], color: "#f5c400", color2: "#000000", leagueAvgHome: 1.46, leagueAvgAway: 1.22 },

  { id: "inv", name: "Inverness CT", short: "ICT", league: "CHAMP", attack: 1.02, defense: 1.04, elo: 1380, form: ["W", "D", "L", "W", "D"], color: "#005eb8", color2: "#d2232a", leagueAvgHome: 1.36, leagueAvgAway: 1.18 },
  { id: "par", name: "Partick Thistle", short: "PAR", league: "CHAMP", attack: 1.1, defense: 1.0, elo: 1412, form: ["W", "W", "D", "L", "W"], color: "#d2232a", color2: "#f5c400", leagueAvgHome: 1.36, leagueAvgAway: 1.18 },

  { id: "lrn", name: "Larne", short: "LRN", league: "ECL", attack: 0.94, defense: 1.08, elo: 1360, form: ["W", "D", "W", "L", "D"], color: "#d2232a", color2: "#000000", ...euro },
  { id: "sha", name: "Shakhtar", short: "SHA", league: "ECL", attack: 1.34, defense: 0.88, elo: 1644, form: ["W", "W", "D", "W", "W"], color: "#f5c400", color2: "#000000", ...euro },

  { id: "bir", name: "Birmingham", short: "BIR", league: "EFLC", attack: 1.18, defense: 0.92, elo: 1580, form: ["W", "W", "D", "W", "L"], color: "#0033a0", color2: "#ffffff", ...eflc },
  { id: "brc", name: "Bristol City", short: "BRC", league: "EFLC", attack: 1.08, defense: 1.0, elo: 1520, form: ["L", "W", "D", "L", "W"], color: "#e30613", color2: "#ffffff", ...eflc },
  { id: "lcn", name: "Lincoln City", short: "LCN", league: "EFLC", attack: 1.02, defense: 1.04, elo: 1460, form: ["W", "D", "W", "L", "D"], color: "#e30613", color2: "#ffffff", ...eflc, homeAdv: 1.08 },
  { id: "pom", name: "Portsmouth", short: "POR", league: "EFLC", attack: 1.1, defense: 1.02, elo: 1510, form: ["W", "L", "W", "D", "W"], color: "#003087", color2: "#ffffff", ...eflc },
  { id: "milw", name: "Millwall", short: "MIL", league: "EFLC", attack: 1.06, defense: 0.96, elo: 1508, form: ["W", "W", "L", "W", "D"], color: "#003087", color2: "#ffffff", ...eflc, homeAdv: 1.1 },
  { id: "nor", name: "Norwich City", short: "NOR", league: "EFLC", attack: 1.16, defense: 1.06, elo: 1544, form: ["L", "W", "D", "L", "W"], color: "#fff200", color2: "#00a650", ...eflc },
  { id: "blb", name: "Blackburn", short: "BLB", league: "EFLC", attack: 1.08, defense: 1.02, elo: 1496, form: ["D", "W", "L", "W", "D"], color: "#009ee0", color2: "#ffffff", ...eflc },
  { id: "mid", name: "Middlesbrough", short: "MID", league: "EFLC", attack: 1.22, defense: 0.94, elo: 1572, form: ["W", "W", "D", "W", "L"], color: "#e30613", color2: "#ffffff", ...eflc },
  { id: "der", name: "Derby County", short: "DER", league: "EFLC", attack: 1.04, defense: 1.04, elo: 1488, form: ["L", "W", "D", "L", "W"], color: "#000000", color2: "#ffffff", ...eflc },
  { id: "car", name: "Cardiff City", short: "CAR", league: "EFLC", attack: 1.0, defense: 1.06, elo: 1466, form: ["D", "L", "W", "D", "W"], color: "#0070ba", color2: "#ffffff", ...eflc },
  { id: "pne", name: "Preston", short: "PNE", league: "EFLC", attack: 1.02, defense: 0.98, elo: 1490, form: ["W", "D", "L", "W", "D"], color: "#00205b", color2: "#ffffff", ...eflc },
  { id: "wol", name: "Wolves", short: "WOL", league: "EFLC", attack: 1.24, defense: 0.9, elo: 1620, form: ["L", "W", "L", "D", "W"], color: "#fdb913", color2: "#000000", ...eflc },
  { id: "qpr", name: "QPR", short: "QPR", league: "EFLC", attack: 1.1, defense: 1.04, elo: 1502, form: ["W", "L", "W", "D", "L"], color: "#1d5ba9", color2: "#ffffff", ...eflc },
  { id: "bol", name: "Bolton", short: "BOL", league: "EFLC", attack: 1.12, defense: 0.98, elo: 1524, form: ["W", "W", "D", "W", "L"], color: "#ffffff", color2: "#1d5ba9", ...eflc },
  { id: "sou", name: "Southampton", short: "SOU", league: "EFLC", attack: 1.2, defense: 0.94, elo: 1588, form: ["W", "D", "W", "L", "W"], color: "#d71920", color2: "#ffffff", ...eflc },
  { id: "stk", name: "Stoke City", short: "STK", league: "EFLC", attack: 1.04, defense: 1.02, elo: 1484, form: ["L", "D", "W", "L", "W"], color: "#e03a3e", color2: "#ffffff", ...eflc },
  { id: "swa", name: "Swansea", short: "SWA", league: "EFLC", attack: 1.08, defense: 1.0, elo: 1500, form: ["W", "L", "W", "D", "W"], color: "#ffffff", color2: "#000000", ...eflc },
  { id: "shu", name: "Sheffield Utd", short: "SHU", league: "EFLC", attack: 1.14, defense: 0.96, elo: 1548, form: ["D", "W", "L", "W", "W"], color: "#e31c23", color2: "#ffffff", ...eflc },
  { id: "whu", name: "West Ham", short: "WHU", league: "EFLC", attack: 1.18, defense: 0.98, elo: 1596, form: ["L", "D", "W", "L", "D"], color: "#7a263a", color2: "#1bb1e7", ...eflc },
  { id: "cha", name: "Charlton", short: "CHA", league: "EFLC", attack: 1.0, defense: 1.02, elo: 1458, form: ["W", "W", "L", "D", "W"], color: "#d0041d", color2: "#ffffff", ...eflc },
  { id: "wrx", name: "Wrexham", short: "WRX", league: "EFLC", attack: 1.14, defense: 1.0, elo: 1530, form: ["W", "D", "W", "W", "L"], color: "#ed1a3b", color2: "#ffffff", ...eflc, homeAdv: 1.08 },
  { id: "wat", name: "Watford", short: "WAT", league: "EFLC", attack: 1.1, defense: 1.04, elo: 1506, form: ["D", "L", "W", "D", "W"], color: "#fbee23", color2: "#000000", ...eflc },
  { id: "wba", name: "West Brom", short: "WBA", league: "EFLC", attack: 1.16, defense: 0.94, elo: 1560, form: ["W", "W", "D", "L", "W"], color: "#122b5a", color2: "#ffffff", ...eflc },
  { id: "bur", name: "Burnley", short: "BUR", league: "EFLC", attack: 1.12, defense: 0.88, elo: 1578, form: ["D", "W", "D", "W", "L"], color: "#6c1d45", color2: "#99d6ea", ...eflc },

  { id: "don", name: "Doncaster", short: "DON", league: "EL1", attack: 1.08, defense: 1.0, elo: 1440, form: ["W", "D", "W", "L", "W"], color: "#e30613", color2: "#ffffff", ...el1, homeAdv: 1.08 },
  { id: "brs", name: "Barnsley", short: "BAR", league: "EL1", attack: 1.12, defense: 1.02, elo: 1454, form: ["W", "L", "W", "D", "W"], color: "#e30613", color2: "#ffffff", ...el1 },
  { id: "lut", name: "Luton Town", short: "LUT", league: "EL1", attack: 1.2, defense: 0.92, elo: 1528, form: ["W", "W", "D", "W", "L"], color: "#f68712", color2: "#002d62", ...el1 },
  { id: "ntc", name: "Notts County", short: "NTC", league: "EL1", attack: 1.04, defense: 1.06, elo: 1410, form: ["D", "W", "L", "W", "D"], color: "#000000", color2: "#ffffff", ...el1 },
  { id: "wim", name: "AFC Wimbledon", short: "WIM", league: "EL1", attack: 0.98, defense: 1.04, elo: 1396, form: ["W", "D", "L", "W", "D"], color: "#0033a0", color2: "#f5c400", ...el1 },
  { id: "rdg", name: "Reading", short: "RDG", league: "EL1", attack: 1.1, defense: 1.02, elo: 1448, form: ["W", "L", "W", "D", "L"], color: "#004494", color2: "#ffffff", ...el1 },
  { id: "lei", name: "Leicester", short: "LEI", league: "EL1", attack: 1.28, defense: 0.9, elo: 1580, form: ["W", "W", "L", "W", "D"], color: "#003090", color2: "#fdb913", ...el1 },
  { id: "brt", name: "Burton Albion", short: "BRT", league: "EL1", attack: 0.92, defense: 1.1, elo: 1360, form: ["L", "W", "D", "L", "W"], color: "#f5c400", color2: "#000000", ...el1 },

  { id: "sal", name: "Salford City", short: "SAL", league: "EL2", attack: 1.06, defense: 1.02, elo: 1388, form: ["W", "D", "W", "L", "W"], color: "#e30613", color2: "#ffffff", ...el2 },
  { id: "chf", name: "Chesterfield", short: "CHF", league: "EL2", attack: 1.1, defense: 1.0, elo: 1404, form: ["W", "W", "D", "W", "L"], color: "#0033a0", color2: "#ffffff", ...el2 },
  { id: "wal", name: "Walsall", short: "WAL", league: "EL2", attack: 1.02, defense: 0.98, elo: 1392, form: ["D", "W", "W", "L", "D"], color: "#e30613", color2: "#ffffff", ...el2 },
  { id: "gri", name: "Grimsby", short: "GRI", league: "EL2", attack: 1.04, defense: 1.04, elo: 1376, form: ["W", "L", "D", "W", "W"], color: "#000000", color2: "#ffffff", ...el2 },
  { id: "swi", name: "Swindon", short: "SWI", league: "EL2", attack: 1.08, defense: 1.02, elo: 1400, form: ["W", "D", "L", "W", "D"], color: "#e30613", color2: "#ffffff", ...el2 },
  { id: "cht", name: "Cheltenham", short: "CHT", league: "EL2", attack: 0.94, defense: 1.08, elo: 1340, form: ["L", "W", "D", "L", "W"], color: "#e30613", color2: "#ffffff", ...el2 },

  { id: "dund", name: "Dundee United", short: "DUFC", league: "SPL", attack: 1.16, defense: 0.96, elo: 1520, form: ["W", "D", "W", "L", "W"], color: "#f5a81c", color2: "#000000", ...spl, homeAdv: 1.08 },
  { id: "ddee", name: "Dundee", short: "DDE", league: "SPL", attack: 1.02, defense: 1.08, elo: 1440, form: ["L", "W", "D", "L", "W"], color: "#003087", color2: "#ffffff", ...spl },

  { id: "ath", name: "Athletic Club", short: "ATH", league: "LALIGA", attack: 1.26, defense: 0.82, elo: 1768, form: ["W", "D", "W", "W", "L"], color: "#ee2523", color2: "#ffffff", ...laliga },
  { id: "sev", name: "Sevilla", short: "SEV", league: "LALIGA", attack: 1.18, defense: 0.96, elo: 1688, form: ["D", "W", "L", "W", "D"], color: "#d60d0d", color2: "#ffffff", ...laliga },
  { id: "val", name: "Valencia", short: "VAL", league: "LALIGA", attack: 1.12, defense: 0.94, elo: 1660, form: ["W", "L", "D", "W", "L"], color: "#ee3524", color2: "#ffffff", ...laliga },
  { id: "cel", name: "Celta Vigo", short: "CEL", league: "LALIGA", attack: 1.2, defense: 1.0, elo: 1672, form: ["W", "W", "D", "L", "W"], color: "#8ac3e6", color2: "#e20613", ...laliga },
  { id: "esp", name: "Espanyol", short: "ESP", league: "LALIGA", attack: 1.08, defense: 0.98, elo: 1624, form: ["D", "W", "L", "W", "D"], color: "#1b4e9b", color2: "#ffffff", ...laliga },
  { id: "rma", name: "Real Madrid", short: "RMA", league: "LALIGA", attack: 1.78, defense: 0.72, elo: 1968, form: ["W", "W", "W", "D", "W"], color: "#ffffff", color2: "#febe10", ...laliga },

  { id: "int", name: "Inter", short: "INT", league: "SA", attack: 1.62, defense: 0.68, elo: 1920, form: ["W", "W", "D", "W", "W"], color: "#010e80", color2: "#000000", ...sa },
  { id: "mnz", name: "Monza", short: "MNZ", league: "SA", attack: 0.96, defense: 1.12, elo: 1488, form: ["L", "D", "W", "L", "D"], color: "#e30613", color2: "#ffffff", ...sa },
  { id: "udi", name: "Udinese", short: "UDI", league: "SA", attack: 1.08, defense: 0.98, elo: 1608, form: ["D", "W", "L", "W", "D"], color: "#000000", color2: "#ffffff", ...sa },
  { id: "com", name: "Como", short: "COM", league: "SA", attack: 1.14, defense: 0.94, elo: 1630, form: ["W", "D", "W", "L", "W"], color: "#0033a0", color2: "#ffffff", ...sa },
  { id: "gen", name: "Genoa", short: "GEN", league: "SA", attack: 1.02, defense: 0.96, elo: 1588, form: ["D", "L", "W", "D", "W"], color: "#c8102e", color2: "#003087", ...sa },
  { id: "nap", name: "Napoli", short: "NAP", league: "SA", attack: 1.52, defense: 0.76, elo: 1860, form: ["W", "W", "W", "D", "W"], color: "#12a0d7", color2: "#ffffff", ...sa },
  { id: "pmc", name: "Parma", short: "PMA", league: "SA", attack: 1.04, defense: 1.04, elo: 1540, form: ["L", "W", "D", "L", "W"], color: "#ffd100", color2: "#003087", ...sa },
  { id: "cag", name: "Cagliari", short: "CAG", league: "SA", attack: 1.0, defense: 1.08, elo: 1518, form: ["D", "L", "W", "D", "L"], color: "#d2232a", color2: "#003087", ...sa },
  { id: "fro", name: "Frosinone", short: "FRO", league: "SA", attack: 0.98, defense: 1.1, elo: 1496, form: ["W", "L", "D", "W", "L"], color: "#f5c400", color2: "#003087", ...sa },
  { id: "juv", name: "Juventus", short: "JUV", league: "SA", attack: 1.44, defense: 0.74, elo: 1848, form: ["W", "D", "W", "W", "L"], color: "#000000", color2: "#ffffff", ...sa },
  { id: "tor", name: "Torino", short: "TOR", league: "SA", attack: 1.1, defense: 0.92, elo: 1640, form: ["D", "W", "L", "W", "D"], color: "#8b1a1a", color2: "#ffffff", ...sa },
  { id: "acm", name: "Milan", short: "MIL", league: "SA", attack: 1.5, defense: 0.78, elo: 1856, form: ["W", "W", "D", "W", "W"], color: "#fb090b", color2: "#000000", ...sa },

  { id: "bvb", name: "Dortmund", short: "BVB", league: "BL", attack: 1.56, defense: 0.84, elo: 1840, form: ["W", "W", "L", "W", "W"], color: "#fde100", color2: "#000000", ...bl },
  { id: "fcb", name: "Bayern Munich", short: "FCB", league: "BL", attack: 1.86, defense: 0.7, elo: 1988, form: ["W", "W", "W", "W", "D"], color: "#dc052d", color2: "#0066b2", ...bl },

  { id: "rcl", name: "Lens", short: "RCL", league: "L1", attack: 1.28, defense: 0.9, elo: 1708, form: ["W", "D", "W", "W", "L"], color: "#e30613", color2: "#f5c400", leagueAvgHome: 1.44, leagueAvgAway: 1.14 },
  { id: "aux", name: "Auxerre", short: "AUX", league: "L1", attack: 1.02, defense: 1.06, elo: 1540, form: ["L", "W", "D", "L", "W"], color: "#d4a017", color2: "#ffffff", leagueAvgHome: 1.44, leagueAvgAway: 1.14 },
  { id: "nic", name: "Nice", short: "NIC", league: "L1", attack: 1.24, defense: 0.88, elo: 1716, form: ["W", "W", "D", "L", "W"], color: "#000000", color2: "#e30613", leagueAvgHome: 1.44, leagueAvgAway: 1.14 },
  { id: "lor", name: "Lorient", short: "LOR", league: "L1", attack: 1.08, defense: 1.04, elo: 1566, form: ["D", "W", "L", "W", "D"], color: "#e87722", color2: "#000000", leagueAvgHome: 1.44, leagueAvgAway: 1.14 },
  { id: "tfc", name: "Toulouse", short: "TFC", league: "L1", attack: 1.12, defense: 0.98, elo: 1610, form: ["W", "L", "D", "W", "L"], color: "#4b116f", color2: "#ffffff", leagueAvgHome: 1.44, leagueAvgAway: 1.14 },
  { id: "ol", name: "Lyon", short: "OL", league: "L1", attack: 1.36, defense: 0.9, elo: 1744, form: ["W", "W", "D", "W", "L"], color: "#003087", color2: "#d2232a", leagueAvgHome: 1.44, leagueAvgAway: 1.14 },

  { id: "sit", name: "Fortuna Sittard", short: "FOR", league: "ERE", attack: 1.04, defense: 1.08, elo: 1488, form: ["L", "W", "D", "L", "W"], color: "#f5c400", color2: "#007a33", ...ere },
  { id: "az", name: "AZ Alkmaar", short: "AZ", league: "ERE", attack: 1.42, defense: 0.86, elo: 1688, form: ["W", "W", "D", "W", "L"], color: "#e30613", color2: "#ffffff", ...ere },
  { id: "spa", name: "Sparta Rotterdam", short: "SPA", league: "ERE", attack: 1.12, defense: 1.0, elo: 1544, form: ["W", "D", "L", "W", "D"], color: "#e30613", color2: "#ffffff", ...ere },
  { id: "utr", name: "Utrecht", short: "UTR", league: "ERE", attack: 1.24, defense: 0.92, elo: 1608, form: ["W", "W", "L", "W", "D"], color: "#e30613", color2: "#ffffff", ...ere },
  { id: "hee", name: "Heerenveen", short: "HEE", league: "ERE", attack: 1.18, defense: 1.04, elo: 1540, form: ["D", "W", "L", "W", "L"], color: "#0033a0", color2: "#ffffff", ...ere },
  { id: "zwl", name: "PEC Zwolle", short: "ZWO", league: "ERE", attack: 1.06, defense: 1.1, elo: 1472, form: ["L", "D", "W", "L", "W"], color: "#0033a0", color2: "#ffffff", ...ere },

  { id: "crl", name: "Charleroi", short: "CRL", league: "BEL", attack: 1.1, defense: 1.02, elo: 1508, form: ["W", "L", "D", "W", "D"], color: "#000000", color2: "#ffffff", leagueAvgHome: 1.4, leagueAvgAway: 1.14 },
  { id: "mec", name: "Mechelen", short: "MEC", league: "BEL", attack: 1.14, defense: 1.0, elo: 1522, form: ["W", "D", "W", "L", "W"], color: "#f5c400", color2: "#e30613", leagueAvgHome: 1.4, leagueAvgAway: 1.14 },
  { id: "ant", name: "Antwerp", short: "ANT", league: "BEL", attack: 1.22, defense: 0.94, elo: 1588, form: ["W", "W", "D", "L", "W"], color: "#e30613", color2: "#ffffff", leagueAvgHome: 1.4, leagueAvgAway: 1.14 },
  { id: "gnk", name: "Genk", short: "GNK", league: "BEL", attack: 1.34, defense: 0.9, elo: 1644, form: ["W", "W", "W", "D", "L"], color: "#0033a0", color2: "#ffffff", leagueAvgHome: 1.4, leagueAvgAway: 1.14 },

  { id: "lev", name: "Leverkusen", short: "B04", league: "BL", attack: 1.54, defense: 0.8, elo: 1820, form: ["W", "D", "W", "W", "L"], color: "#e32219", color2: "#000000", ...bl },
  { id: "rbl", name: "RB Leipzig", short: "RBL", league: "BL", attack: 1.5, defense: 0.82, elo: 1804, form: ["W", "W", "D", "W", "L"], color: "#dd0741", color2: "#ffffff", ...bl },
  { id: "bmg", name: "M'gladbach", short: "BMG", league: "BL", attack: 1.28, defense: 1.0, elo: 1688, form: ["D", "W", "L", "W", "D"], color: "#000000", color2: "#ffffff", ...bl },
  { id: "wob", name: "Wolfsburg", short: "WOB", league: "BL", attack: 1.24, defense: 0.96, elo: 1670, form: ["W", "L", "D", "W", "L"], color: "#65b32e", color2: "#ffffff", ...bl },
  { id: "fcu", name: "Union Berlin", short: "FCU", league: "BL", attack: 1.12, defense: 0.9, elo: 1654, form: ["D", "W", "L", "D", "W"], color: "#eb1923", color2: "#ffffff", ...bl },
  { id: "scf", name: "Freiburg", short: "SCF", league: "BL", attack: 1.22, defense: 0.92, elo: 1696, form: ["W", "D", "W", "L", "W"], color: "#000000", color2: "#e30613", ...bl },
  { id: "hsv", name: "Hamburg", short: "HSV", league: "BL", attack: 1.18, defense: 1.02, elo: 1620, form: ["W", "W", "L", "D", "W"], color: "#0a3d91", color2: "#ffffff", ...bl },
  { id: "kln", name: "Köln", short: "KOE", league: "BL", attack: 1.16, defense: 1.04, elo: 1608, form: ["L", "W", "D", "W", "L"], color: "#e30613", color2: "#ffffff", ...bl },
  { id: "stp", name: "St. Pauli", short: "STP", league: "BL", attack: 1.1, defense: 1.06, elo: 1566, form: ["D", "L", "W", "D", "W"], color: "#614b2a", color2: "#ffffff", ...bl },
  { id: "hei", name: "Heidenheim", short: "HDH", league: "BL", attack: 1.08, defense: 1.08, elo: 1544, form: ["L", "W", "D", "L", "W"], color: "#e30613", color2: "#003087", ...bl },

  { id: "bar", name: "Barcelona", short: "BAR", league: "LALIGA", attack: 1.74, defense: 0.76, elo: 1936, form: ["W", "W", "W", "D", "W"], color: "#a50044", color2: "#004d98", ...laliga },
  { id: "atm", name: "Atlético Madrid", short: "ATM", league: "LALIGA", attack: 1.42, defense: 0.7, elo: 1848, form: ["W", "D", "W", "W", "L"], color: "#cb3524", color2: "#ffffff", ...laliga },
  { id: "vil", name: "Villarreal", short: "VIL", league: "LALIGA", attack: 1.34, defense: 0.9, elo: 1744, form: ["W", "L", "W", "D", "W"], color: "#f6eb16", color2: "#0057b8", ...laliga },
  { id: "gir", name: "Girona", short: "GIR", league: "LALIGA", attack: 1.26, defense: 0.98, elo: 1688, form: ["D", "W", "L", "W", "D"], color: "#cd2534", color2: "#ffffff", ...laliga },

  { id: "psg", name: "Paris SG", short: "PSG", league: "L1", attack: 1.82, defense: 0.68, elo: 1960, form: ["W", "W", "W", "W", "D"], color: "#004170", color2: "#da0812", leagueAvgHome: 1.44, leagueAvgAway: 1.14 },
  { id: "asm", name: "Monaco", short: "ASM", league: "L1", attack: 1.48, defense: 0.86, elo: 1788, form: ["W", "W", "D", "W", "L"], color: "#e30613", color2: "#ffffff", leagueAvgHome: 1.44, leagueAvgAway: 1.14 },
  { id: "losc", name: "Lille", short: "LOSC", league: "L1", attack: 1.32, defense: 0.84, elo: 1740, form: ["W", "D", "W", "W", "L"], color: "#e01e13", color2: "#003087", leagueAvgHome: 1.44, leagueAvgAway: 1.14 },
  { id: "ren", name: "Rennes", short: "REN", league: "L1", attack: 1.22, defense: 0.96, elo: 1672, form: ["D", "W", "L", "W", "D"], color: "#e30613", color2: "#000000", leagueAvgHome: 1.44, leagueAvgAway: 1.14 },
  { id: "lem", name: "Le Mans", short: "LEM", league: "L1", attack: 0.96, defense: 1.12, elo: 1488, form: ["W", "L", "D", "W", "L"], color: "#e30613", color2: "#f5c400", leagueAvgHome: 1.44, leagueAvgAway: 1.14 },
  { id: "bst", name: "Brest", short: "SB29", league: "L1", attack: 1.14, defense: 0.98, elo: 1620, form: ["W", "D", "L", "W", "D"], color: "#e30613", color2: "#ffffff", leagueAvgHome: 1.44, leagueAvgAway: 1.14 },
  { id: "tro", name: "Troyes", short: "EST", league: "L1", attack: 1.0, defense: 1.08, elo: 1510, form: ["L", "W", "D", "L", "W"], color: "#0033a0", color2: "#ffffff", leagueAvgHome: 1.44, leagueAvgAway: 1.14 },
  { id: "pfc", name: "Paris FC", short: "PFC", league: "L1", attack: 1.08, defense: 1.02, elo: 1566, form: ["W", "D", "W", "L", "D"], color: "#003087", color2: "#e30613", leagueAvgHome: 1.44, leagueAvgAway: 1.14 },

  { id: "ata", name: "Atalanta", short: "ATA", league: "SA", attack: 1.48, defense: 0.86, elo: 1788, form: ["W", "W", "D", "W", "L"], color: "#1e71b8", color2: "#000000", ...sa },
  { id: "sas", name: "Sassuolo", short: "SAS", league: "SA", attack: 1.12, defense: 1.04, elo: 1588, form: ["D", "W", "L", "W", "D"], color: "#00a651", color2: "#000000", ...sa },
  { id: "ven", name: "Venezia", short: "VEN", league: "SA", attack: 1.02, defense: 1.08, elo: 1522, form: ["L", "D", "W", "L", "W"], color: "#f5c400", color2: "#000000", ...sa },
  { id: "lec", name: "Lecce", short: "LEC", league: "SA", attack: 1.0, defense: 1.06, elo: 1510, form: ["D", "L", "W", "D", "L"], color: "#e30613", color2: "#f5c400", ...sa },
  { id: "rom", name: "Roma", short: "ROM", league: "SA", attack: 1.38, defense: 0.84, elo: 1766, form: ["W", "D", "W", "L", "W"], color: "#8e1f2f", color2: "#f5c400", ...sa },
  { id: "laz", name: "Lazio", short: "LAZ", league: "SA", attack: 1.32, defense: 0.88, elo: 1730, form: ["W", "L", "W", "D", "W"], color: "#87d8f7", color2: "#ffffff", ...sa },
  { id: "fio", name: "Fiorentina", short: "FIO", league: "SA", attack: 1.28, defense: 0.92, elo: 1708, form: ["D", "W", "W", "L", "D"], color: "#482e92", color2: "#ffffff", ...sa },
  { id: "bgna", name: "Bologna", short: "BFC", league: "SA", attack: 1.24, defense: 0.9, elo: 1694, form: ["W", "W", "D", "L", "W"], color: "#a32020", color2: "#003087", ...sa },

  { id: "aja", name: "Ajax", short: "AJA", league: "ERE", attack: 1.52, defense: 0.88, elo: 1744, form: ["W", "W", "D", "W", "L"], color: "#d2122e", color2: "#ffffff", ...ere },
  { id: "psv", name: "PSV", short: "PSV", league: "ERE", attack: 1.68, defense: 0.8, elo: 1810, form: ["W", "W", "W", "D", "W"], color: "#e30613", color2: "#ffffff", ...ere },
  { id: "fey", name: "Feyenoord", short: "FEY", league: "ERE", attack: 1.5, defense: 0.84, elo: 1766, form: ["W", "D", "W", "W", "L"], color: "#e30613", color2: "#ffffff", ...ere },

  { id: "celt", name: "Celtic", short: "CEL", league: "SPL", attack: 1.56, defense: 0.78, elo: 1720, form: ["W", "W", "W", "D", "W"], color: "#018749", color2: "#ffffff", ...spl },
  { id: "rfc", name: "Rangers", short: "RFC", league: "SPL", attack: 1.44, defense: 0.84, elo: 1688, form: ["W", "D", "W", "W", "L"], color: "#0546a0", color2: "#ffffff", ...spl },
  { id: "hrt", name: "Hearts", short: "HRT", league: "SPL", attack: 1.22, defense: 0.94, elo: 1566, form: ["W", "W", "L", "D", "W"], color: "#8b1a1a", color2: "#ffffff", ...spl },
  { id: "hib", name: "Hibernian", short: "HIB", league: "SPL", attack: 1.16, defense: 1.0, elo: 1522, form: ["D", "W", "L", "W", "D"], color: "#008752", color2: "#ffffff", ...spl },
  { id: "abe", name: "Aberdeen", short: "ABE", league: "SPL", attack: 1.14, defense: 0.98, elo: 1510, form: ["W", "L", "D", "W", "L"], color: "#e30613", color2: "#ffffff", ...spl },
  { id: "mot", name: "Motherwell", short: "MOT", league: "SPL", attack: 1.06, defense: 1.04, elo: 1466, form: ["L", "W", "D", "L", "W"], color: "#f5c400", color2: "#8b1a1a", ...spl },
  { id: "fal", name: "Falkirk", short: "FAL", league: "SPL", attack: 1.02, defense: 1.08, elo: 1430, form: ["W", "D", "L", "W", "D"], color: "#003087", color2: "#ffffff", ...spl },
  { id: "stm", name: "St Mirren", short: "STM", league: "SPL", attack: 1.04, defense: 1.02, elo: 1444, form: ["D", "L", "W", "D", "W"], color: "#000000", color2: "#ffffff", ...spl },

  { id: "livs", name: "Livingston", short: "LIV", league: "CHAMP", attack: 1.12, defense: 0.96, elo: 1460, form: ["W", "W", "D", "L", "W"], color: "#f5c400", color2: "#000000", leagueAvgHome: 1.36, leagueAvgAway: 1.18 },
  { id: "dnf", name: "Dunfermline", short: "DFC", league: "CHAMP", attack: 1.0, defense: 1.04, elo: 1396, form: ["L", "W", "D", "W", "L"], color: "#000000", color2: "#ffffff", leagueAvgHome: 1.36, leagueAvgAway: 1.18 },
  { id: "mtn", name: "Morton", short: "GMO", league: "CHAMP", attack: 0.98, defense: 1.06, elo: 1370, form: ["D", "L", "W", "D", "W"], color: "#003087", color2: "#ffffff", leagueAvgHome: 1.36, leagueAvgAway: 1.18 },
  { id: "arb", name: "Arbroath", short: "ARB", league: "CHAMP", attack: 0.94, defense: 1.1, elo: 1344, form: ["L", "D", "W", "L", "D"], color: "#8b1a1a", color2: "#ffffff", leagueAvgHome: 1.36, leagueAvgAway: 1.18 },
  { id: "qpk", name: "Queen's Park", short: "QPA", league: "CHAMP", attack: 1.02, defense: 1.04, elo: 1388, form: ["W", "L", "D", "W", "L"], color: "#000000", color2: "#ffffff", leagueAvgHome: 1.36, leagueAvgAway: 1.18 },
  { id: "rth", name: "Raith Rovers", short: "RAI", league: "CHAMP", attack: 1.06, defense: 1.0, elo: 1410, form: ["W", "D", "W", "L", "W"], color: "#003087", color2: "#ffffff", leagueAvgHome: 1.36, leagueAvgAway: 1.18 },
  { id: "ayr", name: "Ayr United", short: "AYR", league: "CHAMP", attack: 1.04, defense: 1.02, elo: 1400, form: ["D", "W", "L", "W", "D"], color: "#ffffff", color2: "#000000", leagueAvgHome: 1.36, leagueAvgAway: 1.18 },

  { id: "brom", name: "Bromley", short: "BRO", league: "EL1", attack: 1.0, defense: 1.06, elo: 1388, form: ["W", "D", "L", "W", "D"], color: "#ffffff", color2: "#003087", ...el1 },
  { id: "camb", name: "Cambridge Utd", short: "CAM", league: "EL1", attack: 0.96, defense: 1.08, elo: 1366, form: ["L", "W", "D", "L", "W"], color: "#f5c400", color2: "#000000", ...el1 },
  { id: "mkd", name: "MK Dons", short: "MKD", league: "EL1", attack: 1.08, defense: 1.02, elo: 1430, form: ["W", "L", "W", "D", "L"], color: "#ffffff", color2: "#e30613", ...el1 },
  { id: "hud", name: "Huddersfield", short: "HUD", league: "EL1", attack: 1.14, defense: 0.98, elo: 1476, form: ["W", "W", "D", "L", "W"], color: "#0b56a4", color2: "#ffffff", ...el1 },
  { id: "posh", name: "Peterborough", short: "POS", league: "EL1", attack: 1.16, defense: 1.04, elo: 1460, form: ["W", "L", "W", "D", "W"], color: "#003087", color2: "#ffffff", ...el1 },
  { id: "mans", name: "Mansfield", short: "MAN", league: "EL1", attack: 1.02, defense: 1.04, elo: 1408, form: ["D", "W", "L", "W", "D"], color: "#f5c400", color2: "#003087", ...el1 },
  { id: "stv", name: "Stevenage", short: "STE", league: "EL1", attack: 1.0, defense: 0.98, elo: 1416, form: ["W", "D", "W", "L", "D"], color: "#e30613", color2: "#ffffff", ...el1 },
  { id: "oxu", name: "Oxford Utd", short: "OXF", league: "EL1", attack: 1.12, defense: 1.0, elo: 1454, form: ["L", "W", "D", "W", "L"], color: "#f5c400", color2: "#000000", ...el1 },
  { id: "skp", name: "Stockport", short: "SKP", league: "EL1", attack: 1.1, defense: 0.96, elo: 1450, form: ["W", "W", "L", "D", "W"], color: "#003087", color2: "#ffffff", ...el1 },
  { id: "blp", name: "Blackpool", short: "BPL", league: "EL1", attack: 1.08, defense: 1.02, elo: 1436, form: ["D", "L", "W", "D", "W"], color: "#f68712", color2: "#ffffff", ...el1 },
  { id: "wig", name: "Wigan", short: "WIG", league: "EL1", attack: 1.06, defense: 1.0, elo: 1428, form: ["W", "L", "D", "W", "L"], color: "#003087", color2: "#ffffff", ...el1 },
  { id: "ley", name: "Leyton Orient", short: "LEY", league: "EL1", attack: 1.04, defense: 1.02, elo: 1418, form: ["D", "W", "L", "W", "D"], color: "#e30613", color2: "#ffffff", ...el1 },
  { id: "wyc", name: "Wycombe", short: "WYC", league: "EL1", attack: 1.1, defense: 0.98, elo: 1444, form: ["W", "D", "W", "L", "W"], color: "#003087", color2: "#87ceeb", ...el1 },
  { id: "ply", name: "Plymouth", short: "PLY", league: "EL1", attack: 1.12, defense: 1.04, elo: 1448, form: ["L", "W", "D", "L", "W"], color: "#005eb8", color2: "#007a33", ...el1 },

  { id: "brv", name: "Bristol Rovers", short: "BRR", league: "EL2", attack: 1.04, defense: 1.04, elo: 1390, form: ["W", "L", "D", "W", "L"], color: "#003087", color2: "#ffffff", ...el2 },
  { id: "nwp", name: "Newport County", short: "NWP", league: "EL2", attack: 0.96, defense: 1.08, elo: 1348, form: ["L", "D", "W", "L", "D"], color: "#f5c400", color2: "#000000", ...el2 },
  { id: "col", name: "Colchester", short: "COL", league: "EL2", attack: 1.02, defense: 1.02, elo: 1376, form: ["D", "W", "L", "W", "D"], color: "#003087", color2: "#ffffff", ...el2 },
  { id: "old", name: "Oldham", short: "OLD", league: "EL2", attack: 1.0, defense: 1.04, elo: 1366, form: ["W", "D", "W", "L", "L"], color: "#003087", color2: "#ffffff", ...el2 },
  { id: "exe", name: "Exeter", short: "EXE", league: "EL2", attack: 1.06, defense: 1.0, elo: 1396, form: ["W", "W", "D", "L", "W"], color: "#e30613", color2: "#000000", ...el2 },
  { id: "acc", name: "Accrington", short: "ACC", league: "EL2", attack: 0.94, defense: 1.08, elo: 1338, form: ["L", "W", "D", "L", "W"], color: "#e30613", color2: "#ffffff", ...el2 },
  { id: "fle", name: "Fleetwood", short: "FLE", league: "EL2", attack: 1.02, defense: 1.02, elo: 1370, form: ["D", "L", "W", "D", "W"], color: "#e30613", color2: "#ffffff", ...el2 },
  { id: "gil", name: "Gillingham", short: "GIL", league: "EL2", attack: 0.98, defense: 1.0, elo: 1360, form: ["W", "L", "D", "W", "L"], color: "#003087", color2: "#ffffff", ...el2 },
  { id: "pva", name: "Port Vale", short: "PVA", league: "EL2", attack: 1.04, defense: 1.0, elo: 1384, form: ["W", "D", "L", "W", "D"], color: "#000000", color2: "#ffffff", ...el2 },
  { id: "tra", name: "Tranmere", short: "TRA", league: "EL2", attack: 1.0, defense: 1.04, elo: 1368, form: ["L", "W", "D", "L", "W"], color: "#ffffff", color2: "#003087", ...el2 },
  ...EXTRA_TEAMS,
];

export const TEAM_BY_ID = Object.fromEntries(TEAMS.map((t) => [t.id, t])) as Record<string, Team>;

export function getTeam(id: string): Team {
  const t = TEAM_BY_ID[id];
  if (!t) throw new Error(`Unknown team ${id}`);
  return t;
}

export const EPL_TEAMS = TEAMS.filter((t) => t.league === "EPL");

export function teamsInLeague(id: LeagueId) {
  return TEAMS.filter((t) => t.league === id).sort((a, b) => a.name.localeCompare(b.name));
}
