import type { Fixture, LeagueId, Team } from "../types";

type Spec = {
  id: string;
  name: string;
  short: string;
  league: LeagueId;
  atk: number;
  def: number;
  elo: number;
  form: string;
  c: string;
  c2: string;
  venue?: string;
};

const AVG: Record<string, { h: number; a: number }> = {
  NL: { h: 1.28, a: 1.14 },
  SL1: { h: 1.32, a: 1.16 },
  SL2: { h: 1.28, a: 1.14 },
  LL2: { h: 1.32, a: 1.08 },
  SB: { h: 1.28, a: 1.06 },
  BL2: { h: 1.48, a: 1.18 },
  L2: { h: 1.32, a: 1.1 },
  EED: { h: 1.46, a: 1.18 },
  BEL2: { h: 1.34, a: 1.12 },
  POR: { h: 1.42, a: 1.12 },
  POR2: { h: 1.3, a: 1.08 },
  TUR: { h: 1.48, a: 1.16 },
  TUR2: { h: 1.34, a: 1.12 },
  POL2: { h: 1.32, a: 1.1 },
  SUP: { h: 1.4, a: 1.16 },
  DEN: { h: 1.5, a: 1.2 },
  DEN2: { h: 1.36, a: 1.14 },
  NOR: { h: 1.52, a: 1.18 },
  NOR2: { h: 1.4, a: 1.16 },
  AUT: { h: 1.46, a: 1.16 },
  AUT2: { h: 1.34, a: 1.12 },
  SUI: { h: 1.44, a: 1.16 },
  SUI2: { h: 1.32, a: 1.12 },
  GRE: { h: 1.4, a: 1.1 },
  GRE2: { h: 1.28, a: 1.06 },
  CZE: { h: 1.42, a: 1.14 },
  CZE2: { h: 1.3, a: 1.1 },
  IRL: { h: 1.46, a: 1.18 },
  IRL2: { h: 1.34, a: 1.14 },
};

function club(s: Spec): Team {
  const avg = AVG[s.league] ?? { h: 1.34, a: 1.12 };
  return {
    id: s.id,
    name: s.name,
    short: s.short,
    league: s.league,
    attack: s.atk,
    defense: s.def,
    elo: s.elo,
    form: s.form.split("") as Team["form"],
    color: s.c,
    color2: s.c2,
    leagueAvgHome: avg.h,
    leagueAvgAway: avg.a,
  };
}

const SPECS: Spec[] = [
  { id: "fyld", name: "AFC Fylde", short: "FYL", league: "NL", atk: 0.96, def: 1.08, elo: 1320, form: "WDWLW", c: "#6b1d3a", c2: "#ffffff" },
  { id: "ald", name: "Aldershot", short: "ALD", league: "NL", atk: 0.98, def: 1.06, elo: 1334, form: "LWDWL", c: "#e30613", c2: "#003087" },
  { id: "altr", name: "Altrincham", short: "ALT", league: "NL", atk: 1.02, def: 1.04, elo: 1366, form: "WDLWW", c: "#e30613", c2: "#ffffff" },
  { id: "brw", name: "Barrow", short: "BRW", league: "NL", atk: 1.04, def: 1.02, elo: 1378, form: "DLWWL", c: "#ffffff", c2: "#003087" },
  { id: "bwd", name: "Boreham Wood", short: "BWD", league: "NL", atk: 1.0, def: 1.04, elo: 1350, form: "WDLDW", c: "#000000", c2: "#ffffff" },
  { id: "bosu", name: "Boston United", short: "BOS", league: "NL", atk: 0.98, def: 1.06, elo: 1338, form: "LWDLW", c: "#f5c400", c2: "#000000" },
  { id: "caru", name: "Carlisle", short: "CAR", league: "NL", atk: 1.1, def: 0.98, elo: 1410, form: "WWDLW", c: "#003087", c2: "#e30613" },
  { id: "elh", name: "Eastleigh", short: "ELH", league: "NL", atk: 0.96, def: 1.08, elo: 1330, form: "DLWWD", c: "#003087", c2: "#ffffff" },
  { id: "hfx", name: "FC Halifax", short: "HFX", league: "NL", atk: 1.02, def: 1.04, elo: 1360, form: "DWWLL", c: "#003087", c2: "#ffffff" },
  { id: "fgrn", name: "Forest Green", short: "FGR", league: "NL", atk: 1.08, def: 0.98, elo: 1396, form: "WWDLW", c: "#018749", c2: "#000000" },
  { id: "gate", name: "Gateshead", short: "GAT", league: "NL", atk: 1.04, def: 1.02, elo: 1370, form: "DWWLL", c: "#000000", c2: "#ffffff" },
  { id: "hgt", name: "Harrogate", short: "HGT", league: "NL", atk: 1.02, def: 1.04, elo: 1368, form: "WLDWD", c: "#f5c400", c2: "#000000" },
  { id: "hart", name: "Hartlepool", short: "HAR", league: "NL", atk: 1.0, def: 1.04, elo: 1360, form: "LDWDL", c: "#003087", c2: "#ffffff" },
  { id: "hrc", name: "Hornchurch", short: "HRC", league: "NL", atk: 0.92, def: 1.1, elo: 1288, form: "WLDLW", c: "#e30613", c2: "#ffffff" },
  { id: "kidd", name: "Kidderminster", short: "KID", league: "NL", atk: 0.96, def: 1.08, elo: 1324, form: "DLWLW", c: "#e30613", c2: "#ffffff" },
  { id: "scu", name: "Scunthorpe", short: "SCU", league: "NL", atk: 1.06, def: 1.0, elo: 1388, form: "WWDWL", c: "#6b1d3a", c2: "#003087" },
  { id: "sol", name: "Solihull Moors", short: "SOL", league: "NL", atk: 0.98, def: 1.06, elo: 1340, form: "LWDWL", c: "#f5c400", c2: "#003087" },
  { id: "send", name: "Southend", short: "SND", league: "NL", atk: 1.1, def: 0.98, elo: 1404, form: "DWWLD", c: "#003087", c2: "#ffffff" },
  { id: "sut", name: "Sutton United", short: "SUT", league: "NL", atk: 1.04, def: 1.02, elo: 1374, form: "WWDLW", c: "#f5c400", c2: "#5c3317" },
  { id: "tam", name: "Tamworth", short: "TAM", league: "NL", atk: 0.94, def: 1.08, elo: 1316, form: "LWDLW", c: "#e30613", c2: "#000000" },
  { id: "wea", name: "Wealdstone", short: "WEA", league: "NL", atk: 0.96, def: 1.06, elo: 1328, form: "DLWLW", c: "#003087", c2: "#ffffff" },
  { id: "wok", name: "Woking", short: "WOK", league: "NL", atk: 0.98, def: 1.06, elo: 1344, form: "WLDLW", c: "#e30613", c2: "#ffffff" },
  { id: "wor", name: "Worthing", short: "WOR", league: "NL", atk: 0.94, def: 1.1, elo: 1296, form: "WDLWL", c: "#e30613", c2: "#ffffff" },
  { id: "yeov", name: "Yeovil", short: "YEO", league: "NL", atk: 0.94, def: 1.1, elo: 1318, form: "LWDLW", c: "#008752", c2: "#ffffff" },
  { id: "brnt", name: "Barnet", short: "BNT", league: "EL2", atk: 1.12, def: 0.96, elo: 1420, form: "WWDWL", c: "#000000", c2: "#f5c400" },
  { id: "rchd", name: "Rochdale", short: "ROC", league: "EL2", atk: 1.08, def: 1.0, elo: 1408, form: "WLDWW", c: "#003087", c2: "#ffffff" },

  { id: "cvr", name: "Cove Rangers", short: "CVR", league: "SL1", atk: 1.08, def: 1.0, elo: 1340, form: "WWDWL", c: "#003087", c2: "#ffffff" },
  { id: "hamil", name: "Hamilton", short: "HAM", league: "SL1", atk: 1.12, def: 0.98, elo: 1366, form: "WDWWL", c: "#e30613", c2: "#ffffff" },
  { id: "kelty", name: "Kelty Hearts", short: "KEL", league: "SL1", atk: 0.98, def: 1.06, elo: 1298, form: "LDLWW", c: "#8b1a1a", c2: "#ffffff" },
  { id: "monr", name: "Montrose", short: "MON", league: "SL1", atk: 1.0, def: 1.04, elo: 1310, form: "WDLDW", c: "#003087", c2: "#ffffff" },
  { id: "qos", name: "Queen of the South", short: "QOS", league: "SL1", atk: 1.04, def: 1.02, elo: 1328, form: "DWWLL", c: "#003087", c2: "#ffffff" },
  { id: "aloa", name: "Alloa", short: "ALO", league: "SL1", atk: 0.96, def: 1.06, elo: 1288, form: "LWDLW", c: "#f5c400", c2: "#000000" },

  { id: "efi", name: "East Fife", short: "EFI", league: "SL2", atk: 1.02, def: 1.02, elo: 1260, form: "WWDDL", c: "#000000", c2: "#f5c400" },
  { id: "elgn", name: "Elgin City", short: "ELG", league: "SL2", atk: 0.94, def: 1.08, elo: 1220, form: "LDLWW", c: "#000000", c2: "#ffffff" },
  { id: "phd", name: "Peterhead", short: "PHD", league: "SL2", atk: 1.06, def: 1.0, elo: 1284, form: "WWDLW", c: "#003087", c2: "#e30613" },
  { id: "sab", name: "Stirling Albion", short: "SAB", league: "SL2", atk: 0.98, def: 1.06, elo: 1238, form: "DLWLW", c: "#e30613", c2: "#ffffff" },
  { id: "bonn", name: "Bonnyrigg", short: "BON", league: "SL2", atk: 0.92, def: 1.1, elo: 1204, form: "WLLDW", c: "#e30613", c2: "#ffffff" },
  { id: "stnr", name: "Stranraer", short: "STN", league: "SL2", atk: 0.96, def: 1.08, elo: 1218, form: "LWDWL", c: "#003087", c2: "#ffffff" },

  { id: "zar", name: "Zaragoza", short: "ZAR", league: "LL2", atk: 1.18, def: 0.96, elo: 1588, form: "WWDWL", c: "#ffffff", c2: "#003087" },
  { id: "ovi", name: "Oviedo", short: "OVI", league: "LL2", atk: 1.14, def: 0.98, elo: 1566, form: "DWWLL", c: "#003087", c2: "#ffffff" },
  { id: "racs", name: "Racing Santander", short: "RAC", league: "LL2", atk: 1.12, def: 1.0, elo: 1544, form: "WDWLW", c: "#007a33", c2: "#ffffff" },
  { id: "sport", name: "Sporting Gijón", short: "SPO", league: "LL2", atk: 1.1, def: 1.02, elo: 1530, form: "LWDWW", c: "#e30613", c2: "#ffffff" },
  { id: "lega", name: "Leganés", short: "LEG", league: "LL2", atk: 1.08, def: 0.94, elo: 1558, form: "DWDLW", c: "#003087", c2: "#ffffff" },
  { id: "eib", name: "Eibar", short: "EIB", league: "LL2", atk: 1.06, def: 0.96, elo: 1540, form: "WLDWD", c: "#003087", c2: "#e30613" },

  { id: "palermo", name: "Palermo", short: "PAL", league: "SB", atk: 1.22, def: 0.94, elo: 1610, form: "WWDWL", c: "#f5c400", c2: "#e30613" },
  { id: "bari", name: "Bari", short: "BRI", league: "SB", atk: 1.12, def: 1.0, elo: 1548, form: "DWLWW", c: "#ffffff", c2: "#e30613" },
  { id: "spezia", name: "Spezia", short: "SPE", league: "SB", atk: 1.14, def: 0.98, elo: 1566, form: "WDWLW", c: "#ffffff", c2: "#000000" },
  { id: "pisa", name: "Pisa", short: "PSA", league: "SB", atk: 1.1, def: 1.02, elo: 1536, form: "LWDDW", c: "#003087", c2: "#000000" },
  { id: "cesena", name: "Cesena", short: "CES", league: "SB", atk: 1.08, def: 1.04, elo: 1510, form: "WDLWL", c: "#ffffff", c2: "#000000" },
  { id: "crem", name: "Cremonese", short: "CRE", league: "SB", atk: 1.16, def: 0.96, elo: 1578, form: "WWDLW", c: "#c4122e", c2: "#c9a227" },

  { id: "s04", name: "Schalke", short: "S04", league: "BL2", atk: 1.28, def: 0.98, elo: 1620, form: "WWDLL", c: "#003087", c2: "#ffffff" },
  { id: "hertha", name: "Hertha BSC", short: "BSC", league: "BL2", atk: 1.24, def: 1.0, elo: 1604, form: "DWWLW", c: "#003087", c2: "#ffffff" },
  { id: "h96", name: "Hannover", short: "H96", league: "BL2", atk: 1.2, def: 0.96, elo: 1590, form: "WDWLW", c: "#007a33", c2: "#000000" },
  { id: "fcn", name: "Nürnberg", short: "FCN", league: "BL2", atk: 1.16, def: 1.02, elo: 1566, form: "LWDWD", c: "#8b1a1a", c2: "#ffffff" },
  { id: "fcmg", name: "Magdeburg", short: "FCM", league: "BL2", atk: 1.14, def: 1.04, elo: 1544, form: "WDLWL", c: "#003087", c2: "#ffffff" },
  { id: "elv", name: "Elversberg", short: "ELV", league: "BL2", atk: 1.18, def: 1.0, elo: 1558, form: "WWDLW", c: "#000000", c2: "#ffffff" },

  { id: "metz", name: "Metz", short: "MET", league: "L2", atk: 1.2, def: 0.96, elo: 1588, form: "WWDWL", c: "#8b1a1a", c2: "#ffffff" },
  { id: "amiens", name: "Amiens", short: "ASC", league: "L2", atk: 1.1, def: 1.02, elo: 1522, form: "DWLWW", c: "#ffffff", c2: "#000000" },
  { id: "caen", name: "Caen", short: "SMC", league: "L2", atk: 1.08, def: 1.04, elo: 1504, form: "LWDWD", c: "#e30613", c2: "#003087" },
  { id: "gui", name: "Guingamp", short: "EAG", league: "L2", atk: 1.14, def: 0.98, elo: 1540, form: "WDWLW", c: "#e30613", c2: "#000000" },
  { id: "greb", name: "Grenoble", short: "GF38", league: "L2", atk: 1.06, def: 1.0, elo: 1496, form: "DWDLW", c: "#003087", c2: "#ffffff" },
  { id: "lavl", name: "Laval", short: "LAV", league: "L2", atk: 1.04, def: 1.04, elo: 1478, form: "WLLDW", c: "#f5c400", c2: "#e30613" },

  { id: "wii", name: "Willem II", short: "WII", league: "EED", atk: 1.22, def: 0.98, elo: 1544, form: "WWDWL", c: "#e30613", c2: "#003087" },
  { id: "gro", name: "Groningen", short: "GRO", league: "EED", atk: 1.26, def: 0.94, elo: 1570, form: "WWDLW", c: "#007a33", c2: "#ffffff" },
  { id: "nacb", name: "NAC Breda", short: "NAC", league: "EED", atk: 1.16, def: 1.02, elo: 1518, form: "DWLWW", c: "#f5c400", c2: "#000000" },
  { id: "camu", name: "Cambuur", short: "CBU", league: "EED", atk: 1.14, def: 1.04, elo: 1502, form: "LWDWD", c: "#f5c400", c2: "#003087" },
  { id: "dgr", name: "De Graafschap", short: "DGR", league: "EED", atk: 1.12, def: 1.02, elo: 1490, form: "WDWLW", c: "#003087", c2: "#ffffff" },
  { id: "emm", name: "Emmen", short: "EMM", league: "EED", atk: 1.08, def: 1.06, elo: 1466, form: "LWDLW", c: "#e30613", c2: "#ffffff" },

  { id: "rwdm", name: "RWDM", short: "RWDM", league: "BEL2", atk: 1.18, def: 0.98, elo: 1510, form: "WWDWL", c: "#000000", c2: "#ffffff" },
  { id: "beers", name: "Beerschot", short: "BEE", league: "BEL2", atk: 1.14, def: 1.02, elo: 1488, form: "DWLWW", c: "#8b1a1a", c2: "#ffffff" },
  { id: "lom", name: "Lommel", short: "LOM", league: "BEL2", atk: 1.08, def: 1.04, elo: 1454, form: "WDWLL", c: "#007a33", c2: "#ffffff" },
  { id: "frb", name: "Francs Borains", short: "FRB", league: "BEL2", atk: 1.02, def: 1.08, elo: 1410, form: "LDLWW", c: "#e30613", c2: "#ffffff" },

  { id: "slb", name: "Benfica", short: "SLB", league: "POR", atk: 1.68, def: 0.72, elo: 1866, form: "WWWDW", c: "#e30613", c2: "#ffffff" },
  { id: "fcp", name: "Porto", short: "FCP", league: "POR", atk: 1.58, def: 0.76, elo: 1830, form: "WDWWW", c: "#003087", c2: "#ffffff" },
  { id: "scp", name: "Sporting", short: "SCP", league: "POR", atk: 1.62, def: 0.74, elo: 1844, form: "WWWDW", c: "#007a33", c2: "#ffffff" },
  { id: "scb", name: "Braga", short: "SCB", league: "POR", atk: 1.38, def: 0.88, elo: 1720, form: "WDLWW", c: "#e30613", c2: "#ffffff" },
  { id: "vgu", name: "Guimarães", short: "VGU", league: "POR", atk: 1.22, def: 0.94, elo: 1644, form: "DWWLL", c: "#ffffff", c2: "#000000" },
  { id: "boa", name: "Boavista", short: "BOA", league: "POR", atk: 1.08, def: 1.06, elo: 1540, form: "LWDLW", c: "#000000", c2: "#ffffff" },

  { id: "madn", name: "Nacional", short: "CDN", league: "POR2", atk: 1.12, def: 1.0, elo: 1466, form: "WWDWL", c: "#000000", c2: "#ffffff" },
  { id: "torr", name: "Torreense", short: "TORR", league: "POR2", atk: 1.06, def: 1.04, elo: 1428, form: "DWLWW", c: "#e30613", c2: "#ffffff" },
  { id: "pen", name: "Penafiel", short: "PEN", league: "POR2", atk: 1.04, def: 1.06, elo: 1410, form: "LWDWD", c: "#e30613", c2: "#003087" },
  { id: "fei", name: "Feirense", short: "FEI", league: "POR2", atk: 1.02, def: 1.08, elo: 1396, form: "WDLWL", c: "#003087", c2: "#ffffff" },

  { id: "gala", name: "Galatasaray", short: "GAL", league: "TUR", atk: 1.64, def: 0.8, elo: 1810, form: "WWWDW", c: "#f5c400", c2: "#e30613" },
  { id: "fener", name: "Fenerbahçe", short: "FEN", league: "TUR", atk: 1.58, def: 0.82, elo: 1794, form: "WDWWW", c: "#003087", c2: "#f5c400" },
  { id: "ibfk", name: "Başakşehir", short: "IBS", league: "TUR", atk: 1.28, def: 0.94, elo: 1660, form: "DWLWW", c: "#f68712", c2: "#003087" },
  { id: "kas", name: "Kasımpaşa", short: "KAS", league: "TUR", atk: 1.18, def: 1.04, elo: 1588, form: "LWDLW", c: "#003087", c2: "#ffffff" },

  { id: "eyu", name: "Eyüpspor", short: "EYU", league: "TUR2", atk: 1.16, def: 0.98, elo: 1510, form: "WWDWL", c: "#f5c400", c2: "#8b1a1a" },
  { id: "goz", name: "Göztepe", short: "GOZ", league: "TUR2", atk: 1.2, def: 0.96, elo: 1534, form: "WWDLW", c: "#f5c400", c2: "#e30613" },
  { id: "koc", name: "Kocaelispor", short: "KOC", league: "TUR2", atk: 1.12, def: 1.02, elo: 1488, form: "DWLWW", c: "#007a33", c2: "#000000" },
  { id: "band", name: "Bandırmaspor", short: "BND", league: "TUR2", atk: 1.08, def: 1.04, elo: 1460, form: "LWDWD", c: "#e30613", c2: "#ffffff" },

  { id: "wis", name: "Wisła Kraków", short: "WIS", league: "POL2", atk: 1.22, def: 0.96, elo: 1544, form: "WWDWL", c: "#e30613", c2: "#ffffff" },
  { id: "mie", name: "Miedź", short: "MIE", league: "POL2", atk: 1.1, def: 1.02, elo: 1478, form: "DWLWW", c: "#003087", c2: "#ffffff" },
  { id: "arka", name: "Arka Gdynia", short: "ARK", league: "POL2", atk: 1.14, def: 1.0, elo: 1496, form: "WDWLW", c: "#f5c400", c2: "#003087" },
  { id: "ruch", name: "Ruch Chorzów", short: "RUC", league: "POL2", atk: 1.08, def: 1.04, elo: 1454, form: "LWDLW", c: "#003087", c2: "#ffffff" },

  { id: "hbg", name: "Helsingborg", short: "HBG", league: "SUP", atk: 1.16, def: 1.0, elo: 1488, form: "WWDWL", c: "#e30613", c2: "#003087" },
  { id: "oreb", name: "Örebro", short: "ORE", league: "SUP", atk: 1.1, def: 1.04, elo: 1450, form: "DWLWW", c: "#ffffff", c2: "#000000" },
  { id: "lskn", name: "Landskrona", short: "LSK", league: "SUP", atk: 1.08, def: 1.06, elo: 1432, form: "LWDWD", c: "#000000", c2: "#ffffff" },
  { id: "brag", name: "Brage", short: "BRG", league: "SUP", atk: 1.12, def: 1.02, elo: 1460, form: "WDWLW", c: "#007a33", c2: "#ffffff" },

  { id: "fckh", name: "Copenhagen", short: "KOB", league: "DEN", atk: 1.5, def: 0.82, elo: 1744, form: "WWWDW", c: "#ffffff", c2: "#003087" },
  { id: "bif", name: "Brøndby", short: "BIF", league: "DEN", atk: 1.36, def: 0.9, elo: 1688, form: "WDWWW", c: "#f5c400", c2: "#003087" },
  { id: "fcmj", name: "Midtjylland", short: "FCJ", league: "DEN", atk: 1.4, def: 0.88, elo: 1704, form: "WWDWL", c: "#000000", c2: "#e30613" },
  { id: "agf", name: "Aarhus", short: "AGF", league: "DEN", atk: 1.22, def: 0.98, elo: 1610, form: "DWLWW", c: "#ffffff", c2: "#e30613" },

  { id: "aab", name: "Aalborg", short: "AAB", league: "DEN2", atk: 1.18, def: 0.98, elo: 1522, form: "WWDWL", c: "#e30613", c2: "#ffffff" },
  { id: "vej", name: "Vejle", short: "VEJ", league: "DEN2", atk: 1.12, def: 1.02, elo: 1488, form: "DWLWW", c: "#e30613", c2: "#ffffff" },
  { id: "ach", name: "Horsens", short: "ACH", league: "DEN2", atk: 1.08, def: 1.04, elo: 1460, form: "LWDWD", c: "#f5c400", c2: "#000000" },
  { id: "fred", name: "Fredericia", short: "FRE", league: "DEN2", atk: 1.06, def: 1.06, elo: 1444, form: "WDWLW", c: "#003087", c2: "#ffffff" },

  { id: "bog", name: "Bodø/Glimt", short: "BOG", league: "NOR", atk: 1.62, def: 0.84, elo: 1766, form: "WWWDW", c: "#f5c400", c2: "#000000" },
  { id: "mol", name: "Molde", short: "MOL", league: "NOR", atk: 1.4, def: 0.9, elo: 1688, form: "WDWWW", c: "#003087", c2: "#ffffff" },
  { id: "rbk", name: "Rosenborg", short: "RBK", league: "NOR", atk: 1.28, def: 0.96, elo: 1620, form: "DWLWW", c: "#ffffff", c2: "#000000" },
  { id: "skb", name: "Brann", short: "SKB", league: "NOR", atk: 1.32, def: 0.94, elo: 1644, form: "WWDWL", c: "#e30613", c2: "#ffffff" },

  { id: "ikst", name: "Start", short: "STA", league: "NOR2", atk: 1.16, def: 1.0, elo: 1466, form: "WWDWL", c: "#f5c400", c2: "#000000" },
  { id: "aale", name: "Aalesund", short: "AAL", league: "NOR2", atk: 1.2, def: 0.98, elo: 1488, form: "WWDLW", c: "#f68712", c2: "#003087" },
  { id: "sanu", name: "Sandnes", short: "SAN", league: "NOR2", atk: 1.08, def: 1.06, elo: 1420, form: "LDLWW", c: "#003087", c2: "#ffffff" },
  { id: "kong", name: "Kongsvinger", short: "KON", league: "NOR2", atk: 1.12, def: 1.02, elo: 1444, form: "WDWLW", c: "#e30613", c2: "#ffffff" },

  { id: "rap", name: "Rapid Wien", short: "RAP", league: "AUT", atk: 1.34, def: 0.9, elo: 1666, form: "WWDWL", c: "#007a33", c2: "#ffffff" },
  { id: "stg", name: "Sturm Graz", short: "STG", league: "AUT", atk: 1.4, def: 0.86, elo: 1702, form: "WWDLW", c: "#000000", c2: "#ffffff" },
  { id: "auw", name: "Austria Wien", short: "AUW", league: "AUT", atk: 1.24, def: 0.96, elo: 1620, form: "DWLWW", c: "#8b1a1a", c2: "#ffffff" },
  { id: "lask", name: "LASK", short: "LASK", league: "AUT", atk: 1.28, def: 0.92, elo: 1644, form: "WDWLW", c: "#000000", c2: "#ffffff" },

  { id: "adm", name: "Admira", short: "ADM", league: "AUT2", atk: 1.12, def: 1.0, elo: 1454, form: "WWDWL", c: "#000000", c2: "#ffffff" },
  { id: "fvi", name: "First Vienna", short: "FVI", league: "AUT2", atk: 1.08, def: 1.04, elo: 1428, form: "DWLWW", c: "#f5c400", c2: "#003087" },
  { id: "svr", name: "Ried", short: "RIE", league: "AUT2", atk: 1.16, def: 0.98, elo: 1478, form: "WWDLW", c: "#007a33", c2: "#000000" },
  { id: "lie", name: "Liefering", short: "LIE", league: "AUT2", atk: 1.1, def: 1.02, elo: 1444, form: "LWDWD", c: "#e30613", c2: "#ffffff" },

  { id: "yb", name: "Young Boys", short: "YB", league: "SUI", atk: 1.46, def: 0.88, elo: 1720, form: "WWDWL", c: "#f5c400", c2: "#000000" },
  { id: "fcbsl", name: "Basel", short: "BSL", league: "SUI", atk: 1.38, def: 0.9, elo: 1694, form: "WDWWW", c: "#e30613", c2: "#003087" },
  { id: "fcz", name: "Zürich", short: "FCZ", league: "SUI", atk: 1.24, def: 0.96, elo: 1622, form: "DWLWW", c: "#003087", c2: "#ffffff" },
  { id: "lug", name: "Lugano", short: "LUG", league: "SUI", atk: 1.22, def: 0.94, elo: 1610, form: "WDWLW", c: "#000000", c2: "#ffffff" },

  { id: "arau", name: "Aarau", short: "AAR", league: "SUI2", atk: 1.14, def: 1.0, elo: 1466, form: "WWDWL", c: "#000000", c2: "#e30613" },
  { id: "fcsh", name: "Schaffhausen", short: "FCS", league: "SUI2", atk: 1.06, def: 1.06, elo: 1410, form: "LDLWW", c: "#003087", c2: "#ffffff" },
  { id: "vad", name: "Vaduz", short: "VAD", league: "SUI2", atk: 1.12, def: 1.02, elo: 1444, form: "WDWLW", c: "#e30613", c2: "#ffffff" },
  { id: "wil", name: "Wil", short: "WIL", league: "SUI2", atk: 1.08, def: 1.04, elo: 1420, form: "LWDWD", c: "#ffffff", c2: "#000000" },

  { id: "oly", name: "Olympiacos", short: "OLY", league: "GRE", atk: 1.52, def: 0.8, elo: 1744, form: "WWWDW", c: "#e30613", c2: "#ffffff" },
  { id: "paok", name: "PAOK", short: "PAOK", league: "GRE", atk: 1.4, def: 0.86, elo: 1696, form: "WDWWW", c: "#000000", c2: "#ffffff" },
  { id: "aek", name: "AEK Athens", short: "AEK", league: "GRE", atk: 1.38, def: 0.88, elo: 1682, form: "WWDWL", c: "#f5c400", c2: "#000000" },
  { id: "pao", name: "Panathinaikos", short: "PAO", league: "GRE", atk: 1.34, def: 0.9, elo: 1666, form: "DWLWW", c: "#007a33", c2: "#ffffff" },

  { id: "vol", name: "Volos", short: "VOL", league: "GRE2", atk: 1.1, def: 1.02, elo: 1444, form: "WWDWL", c: "#003087", c2: "#ffffff" },
  { id: "lam", name: "Lamia", short: "LAM", league: "GRE2", atk: 1.04, def: 1.06, elo: 1408, form: "LDLWW", c: "#003087", c2: "#ffffff" },
  { id: "ion", name: "Ionikos", short: "ION", league: "GRE2", atk: 1.08, def: 1.04, elo: 1422, form: "WDWLW", c: "#003087", c2: "#ffffff" },
  { id: "leva", name: "Levadiakos", short: "LVD", league: "GRE2", atk: 1.12, def: 1.0, elo: 1454, form: "WWDLW", c: "#007a33", c2: "#ffffff" },

  { id: "sprg", name: "Sparta Prague", short: "SPP", league: "CZE", atk: 1.48, def: 0.84, elo: 1722, form: "WWWDW", c: "#8b1a1a", c2: "#ffffff" },
  { id: "slav", name: "Slavia Prague", short: "SLA", league: "CZE", atk: 1.5, def: 0.8, elo: 1740, form: "WDWWW", c: "#e30613", c2: "#ffffff" },
  { id: "jabl", name: "Jablonec", short: "JAB", league: "CZE", atk: 1.18, def: 0.98, elo: 1566, form: "DWLWW", c: "#007a33", c2: "#ffffff" },
  { id: "banik", name: "Baník Ostrava", short: "BAN", league: "CZE", atk: 1.22, def: 0.96, elo: 1588, form: "WDWLW", c: "#003087", c2: "#ffffff" },

  { id: "duk", name: "Dukla Prague", short: "DUK", league: "CZE2", atk: 1.1, def: 1.02, elo: 1440, form: "WWDWL", c: "#f5c400", c2: "#e30613" },
  { id: "zbr", name: "Zbrojovka Brno", short: "ZBR", league: "CZE2", atk: 1.14, def: 1.0, elo: 1466, form: "WWDLW", c: "#e30613", c2: "#ffffff" },
  { id: "tab", name: "Táborsko", short: "TAB", league: "CZE2", atk: 1.06, def: 1.06, elo: 1418, form: "LWDWD", c: "#007a33", c2: "#ffffff" },
  { id: "opa", name: "Opava", short: "OPA", league: "CZE2", atk: 1.04, def: 1.08, elo: 1402, form: "DLWLW", c: "#003087", c2: "#ffffff" },

  { id: "sham", name: "Shamrock Rovers", short: "SHM", league: "IRL", atk: 1.36, def: 0.88, elo: 1566, form: "WWWDW", c: "#007a33", c2: "#ffffff" },
  { id: "boh", name: "Bohemians", short: "BOH", league: "IRL", atk: 1.18, def: 1.0, elo: 1488, form: "DWLWW", c: "#e30613", c2: "#000000" },
  { id: "derr", name: "Derry City", short: "DRY", league: "IRL", atk: 1.22, def: 0.94, elo: 1510, form: "WDWLW", c: "#e30613", c2: "#ffffff" },
  { id: "sli", name: "Sligo Rovers", short: "SLI", league: "IRL", atk: 1.08, def: 1.04, elo: 1444, form: "LWDLW", c: "#e30613", c2: "#ffffff" },

  { id: "ucd", name: "UCD", short: "UCD", league: "IRL2", atk: 1.1, def: 1.02, elo: 1388, form: "WWDWL", c: "#003087", c2: "#ffffff" },
  { id: "trea", name: "Treaty United", short: "TRE", league: "IRL2", atk: 1.06, def: 1.06, elo: 1360, form: "DWLWW", c: "#007a33", c2: "#ffffff" },
  { id: "cobh", name: "Cobh Ramblers", short: "COB", league: "IRL2", atk: 1.02, def: 1.08, elo: 1338, form: "LWDWD", c: "#f5c400", c2: "#003087" },
  { id: "athl", name: "Athlone Town", short: "ATL", league: "IRL2", atk: 1.0, def: 1.1, elo: 1320, form: "WDLWL", c: "#003087", c2: "#ffffff" },
];

export const EXTRA_TEAMS: Team[] = SPECS.map(club);

const VENUE: Record<string, string> = Object.fromEntries(SPECS.map((s) => [s.id, `${s.name} Park`]));

function fx(
  id: string,
  league: LeagueId,
  kickoff: string,
  homeId: string,
  awayId: string,
  odds: [number, number, number],
): Fixture {
  return {
    id,
    league,
    kickoff,
    venue: VENUE[homeId] ?? "Stadium",
    homeId,
    awayId,
    oddsHome: odds[0],
    oddsDraw: odds[1],
    oddsAway: odds[2],
    status: "upcoming",
  };
}

const sat = "2026-08-22T14:00:00.000Z";
const sat17 = "2026-08-22T17:00:00.000Z";
const sat18 = "2026-08-22T18:00:00.000Z";
const sat19 = "2026-08-22T19:00:00.000Z";
const sun16 = "2026-08-23T16:00:00.000Z";
const sun18 = "2026-08-23T18:00:00.000Z";

export const EXTRA_FIXTURES: Fixture[] = [
  fx("send-hart", "NL", sat, "send", "hart", [1.9, 3.4, 4.0]),
  fx("fgrn-yeov", "NL", sat, "fgrn", "yeov", [1.85, 3.5, 4.2]),
  fx("wok-elh", "NL", sat, "wok", "elh", [2.25, 3.25, 3.2]),
  fx("altr-gate", "NL", sat, "altr", "gate", [2.2, 3.3, 3.25]),
  fx("caru-scu", "NL", sat, "caru", "scu", [2.05, 3.3, 3.5]),

  fx("cvr-hamil", "SL1", sat, "cvr", "hamil", [2.6, 3.3, 2.65]),
  fx("kelty-monr", "SL1", sat, "kelty", "monr", [2.45, 3.25, 2.85]),
  fx("qos-aloa", "SL1", sat, "qos", "aloa", [2.05, 3.35, 3.5]),

  fx("efi-elgn", "SL2", sat, "efi", "elgn", [1.95, 3.4, 3.8]),
  fx("phd-sab", "SL2", sat, "phd", "sab", [1.85, 3.45, 4.1]),
  fx("bonn-stnr", "SL2", sat, "bonn", "stnr", [2.35, 3.25, 3.0]),

  fx("zar-ovi", "LL2", sat18, "zar", "ovi", [2.15, 3.2, 3.4]),
  fx("racs-sport", "LL2", sat19, "racs", "sport", [2.25, 3.2, 3.25]),
  fx("lega-eib", "LL2", sun16, "lega", "eib", [2.2, 3.15, 3.4]),

  fx("palermo-bari", "SB", sat18, "palermo", "bari", [1.95, 3.3, 3.9]),
  fx("spezia-pisa", "SB", sat19, "spezia", "pisa", [2.15, 3.2, 3.45]),
  fx("crem-cesena", "SB", sun16, "crem", "cesena", [2.05, 3.25, 3.6]),

  fx("s04-hertha", "BL2", sat17, "s04", "hertha", [2.2, 3.3, 3.25]),
  fx("h96-fcn", "BL2", sat17, "h96", "fcn", [2.05, 3.35, 3.55]),
  fx("fcmg-elv", "BL2", sun16, "fcmg", "elv", [2.4, 3.3, 2.9]),

  fx("metz-amiens", "L2", sat17, "metz", "amiens", [1.95, 3.35, 3.9]),
  fx("caen-gui", "L2", sat17, "caen", "gui", [2.35, 3.2, 3.05]),
  fx("greb-lavl", "L2", sat18, "greb", "lavl", [2.15, 3.25, 3.4]),

  fx("wii-gro", "EED", sat17, "wii", "gro", [2.45, 3.4, 2.7]),
  fx("nacb-camu", "EED", sat17, "nacb", "camu", [2.2, 3.4, 3.15]),
  fx("dgr-emm", "EED", sun16, "dgr", "emm", [2.05, 3.45, 3.4]),

  fx("rwdm-beers", "BEL2", sat17, "rwdm", "beers", [2.15, 3.3, 3.3]),
  fx("lom-frb", "BEL2", sat17, "lom", "frb", [2.05, 3.35, 3.5]),

  fx("slb-scb", "POR", sat19, "slb", "scb", [1.45, 4.4, 6.5]),
  fx("fcp-vgu", "POR", sun18, "fcp", "vgu", [1.4, 4.6, 7.0]),
  fx("scp-boa", "POR", sat18, "scp", "boa", [1.3, 5.0, 9.0]),

  fx("madn-torr", "POR2", sat17, "madn", "torr", [2.2, 3.25, 3.3]),
  fx("pen-fei", "POR2", sat17, "pen", "fei", [2.15, 3.2, 3.45]),

  fx("gala-kas", "TUR", sat18, "gala", "kas", [1.35, 5.0, 8.0]),
  fx("fener-ibfk", "TUR", sun18, "fener", "ibfk", [1.5, 4.2, 6.0]),

  fx("eyu-goz", "TUR2", sat17, "eyu", "goz", [2.4, 3.25, 2.9]),
  fx("koc-band", "TUR2", sat17, "koc", "band", [2.15, 3.3, 3.35]),

  fx("wis-mie", "POL2", sat17, "wis", "mie", [1.85, 3.45, 4.1]),
  fx("arka-ruch", "POL2", sat17, "arka", "ruch", [2.1, 3.3, 3.45]),

  fx("hbg-oreb", "SUP", sat17, "hbg", "oreb", [2.05, 3.35, 3.5]),
  fx("lskn-brag", "SUP", sat17, "lskn", "brag", [2.4, 3.3, 2.9]),

  fx("fckh-bif", "DEN", sat17, "fckh", "bif", [1.85, 3.6, 4.1]),
  fx("fcmj-agf", "DEN", sun16, "fcmj", "agf", [1.75, 3.7, 4.4]),

  fx("aab-vej", "DEN2", sat17, "aab", "vej", [2.1, 3.35, 3.4]),
  fx("ach-fred", "DEN2", sat17, "ach", "fred", [2.25, 3.3, 3.15]),

  fx("bog-mol", "NOR", sat17, "bog", "mol", [1.7, 3.8, 4.6]),
  fx("rbk-skb", "NOR", sun16, "rbk", "skb", [2.25, 3.4, 3.05]),

  fx("ikst-aale", "NOR2", sat17, "ikst", "aale", [2.45, 3.35, 2.75]),
  fx("sanu-kong", "NOR2", sat17, "sanu", "kong", [2.35, 3.3, 2.95]),

  fx("rap-stg", "AUT", sat17, "rap", "stg", [2.4, 3.3, 2.85]),
  fx("auw-lask", "AUT", sun16, "auw", "lask", [2.3, 3.3, 3.05]),

  fx("adm-fvi", "AUT2", sat17, "adm", "fvi", [2.15, 3.3, 3.35]),
  fx("svr-lie", "AUT2", sat17, "svr", "lie", [1.95, 3.4, 3.8]),

  fx("yb-fcbsl", "SUI", sat17, "yb", "fcbsl", [2.15, 3.4, 3.3]),
  fx("fcz-lug", "SUI", sun16, "fcz", "lug", [2.25, 3.3, 3.15]),

  fx("arau-fcsh", "SUI2", sat17, "arau", "fcsh", [1.95, 3.4, 3.8]),
  fx("vad-wil", "SUI2", sat17, "vad", "wil", [2.1, 3.3, 3.45]),

  fx("oly-paok", "GRE", sat18, "oly", "paok", [2.05, 3.3, 3.6]),
  fx("aek-pao", "GRE", sun18, "aek", "pao", [2.2, 3.25, 3.35]),

  fx("vol-lam", "GRE2", sat17, "vol", "lam", [2.1, 3.25, 3.5]),
  fx("ion-leva", "GRE2", sat17, "ion", "leva", [2.4, 3.2, 2.95]),

  fx("sprg-slav", "CZE", sat17, "sprg", "slav", [2.35, 3.25, 3.0]),
  fx("jabl-banik", "CZE", sun16, "jabl", "banik", [2.45, 3.3, 2.8]),

  fx("duk-zbr", "CZE2", sat17, "duk", "zbr", [2.4, 3.25, 2.9]),
  fx("tab-opa", "CZE2", sat17, "tab", "opa", [2.2, 3.25, 3.3]),

  fx("sham-boh", "IRL", sat17, "sham", "boh", [1.7, 3.6, 4.8]),
  fx("derr-sli", "IRL", sat17, "derr", "sli", [1.9, 3.4, 4.0]),

  fx("ucd-trea", "IRL2", sat17, "ucd", "trea", [2.15, 3.3, 3.35]),
  fx("cobh-athl", "IRL2", sat17, "cobh", "athl", [2.2, 3.3, 3.25]),
];
