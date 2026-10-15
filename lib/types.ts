export type Outcome = "1" | "X" | "2";
export type FormResult = "W" | "D" | "L";

export type LeagueId =
  | "EPL"
  | "EFLC"
  | "EL1"
  | "EL2"
  | "NL"
  | "SPL"
  | "CHAMP"
  | "SL1"
  | "SL2"
  | "LALIGA"
  | "LL2"
  | "SA"
  | "SB"
  | "BL"
  | "BL2"
  | "L1"
  | "L2"
  | "ERE"
  | "EED"
  | "BEL"
  | "BEL2"
  | "POR"
  | "POR2"
  | "TUR"
  | "TUR2"
  | "EKE"
  | "POL2"
  | "ALLS"
  | "SUP"
  | "DEN"
  | "DEN2"
  | "NOR"
  | "NOR2"
  | "AUT"
  | "AUT2"
  | "SUI"
  | "SUI2"
  | "GRE"
  | "GRE2"
  | "CZE"
  | "CZE2"
  | "IRL"
  | "IRL2"
  | "HUN"
  | "HUN2"
  | "ROU"
  | "ROU2"
  | "UKR"
  | "SVK"
  | "SVK2"
  | "SVN"
  | "FIN"
  | "FIN2"
  | "ISL"
  | "ISL2"
  | "CYP"
  | "CYP2"
  | "WAL"
  | "NIR"
  | "ALB"
  | "ARM"
  | "AZE"
  | "EST"
  | "FRO"
  | "KAZ"
  | "LVA"
  | "LTU"
  | "LUX"
  | "MDA"
  | "MNE"
  | "DFB"
  | "GERSC"
  | "FACUP"
  | "EFLCUP"
  | "EFLT"
  | "SCCUP"
  | "SLCUP"
  | "CDR"
  | "SUCUP"
  | "CIT"
  | "SCI"
  | "CDF"
  | "NEDC"
  | "BELC"
  | "PORC"
  | "TURC"
  | "POLC"
  | "SWEC"
  | "DENC"
  | "NORC"
  | "AUTC"
  | "SUIC"
  | "GREC"
  | "CZEC"
  | "IRLC"
  | "UCL"
  | "UCLQ"
  | "UEL"
  | "UELQ"
  | "ECL"
  | "ECLQ"
  | "USC"
  | "ISR"
  | "ISR2"
  | "ISRC"
  | "BUL"
  | "BUL2"
  | "BULC"
  | "CRO"
  | "CROC"
  | "SRB"
  | "SRB2"
  | "SRBC"
  | "MLS"
  | "USL"
  | "USAC"
  | "MX"
  | "MX2"
  | "MEXC"
  | "CPL"
  | "CANC"
  | "CRC"
  | "CRCC"
  | "HON"
  | "GUA"
  | "SLV"
  | "PAN"
  | "BRA"
  | "BRA2"
  | "BRAC"
  | "ARG"
  | "ARG2"
  | "ARGC"
  | "COL"
  | "COL2"
  | "COLC"
  | "CHI"
  | "CHI2"
  | "CHIC"
  | "URU"
  | "URU2"
  | "URUC"
  | "ECU"
  | "ECUC"
  | "PER"
  | "PAR"
  | "PARC"
  | "BOL"
  | "VEN"
  | "J1"
  | "J2"
  | "JLEC"
  | "K1"
  | "K2"
  | "KORC"
  | "CSL"
  | "CHN2"
  | "CHNC"
  | "KSA"
  | "KSA2"
  | "KSAC"
  | "UAE"
  | "UAEC"
  | "QAT"
  | "QAT2"
  | "QATC"
  | "AUS"
  | "AUS2"
  | "AUSC"
  | "IND"
  | "IND2"
  | "INDC"
  | "THA"
  | "THA2"
  | "THAC"
  | "IDN"
  | "IDN2"
  | "IDNC"
  | "MYS"
  | "IRN"
  | "IRNC"
  | "ALG"
  | "ALG2"
  | "BHR"
  | "BHR2"
  | "IRQ"
  | "IRQ2"
  | "EGY"
  | "EGY2"
  | "EGYC"
  | "ACL"
  | "ACL2";

export interface Team {
  id: string;
  name: string;
  short: string;
  league: LeagueId;
  attack: number;
  defense: number;
  elo: number;
  form: FormResult[];
  formHome?: FormResult[];
  formAway?: FormResult[];
  color: string;
  color2: string;
  badge?: string;
  homeAdv?: number;
  leagueAvgHome?: number;
  leagueAvgAway?: number;
  div?: LeagueId;
}

export interface Fixture {
  id: string;
  league: LeagueId;
  kickoff: string;
  venue: string;
  homeId: string;
  awayId: string;
  oddsHome: number;
  oddsDraw: number;
  oddsAway: number;
  status: "upcoming" | "settled";
  actualHome?: number;
  actualAway?: number;
  note?: string;
  clock?: string;
  feedState?: "scheduled" | "live" | "ft";
  sources?: { espn?: boolean; fotmob?: boolean; flashscore?: boolean; forebet?: boolean; books?: boolean };
}

export const LEAGUES: Record<LeagueId, { name: string; short: string; country: string }> = {
  EPL: { name: "Premier League", short: "EPL", country: "England" },
  EFLC: { name: "Championship", short: "EFLC", country: "England" },
  EL1: { name: "League One", short: "EL1", country: "England" },
  EL2: { name: "League Two", short: "EL2", country: "England" },
  NL: { name: "National League", short: "NL", country: "England" },
  SPL: { name: "Premiership", short: "SPL", country: "Scotland" },
  CHAMP: { name: "Championship", short: "SCH", country: "Scotland" },
  SL1: { name: "League One", short: "SL1", country: "Scotland" },
  SL2: { name: "League Two", short: "SL2", country: "Scotland" },
  LALIGA: { name: "La Liga", short: "LaLiga", country: "Spain" },
  LL2: { name: "Segunda", short: "LL2", country: "Spain" },
  SA: { name: "Serie A", short: "Serie A", country: "Italy" },
  SB: { name: "Serie B", short: "Serie B", country: "Italy" },
  BL: { name: "Bundesliga", short: "BL", country: "Germany" },
  BL2: { name: "2. Bundesliga", short: "2.BL", country: "Germany" },
  L1: { name: "Ligue 1", short: "L1", country: "France" },
  L2: { name: "Ligue 2", short: "L2", country: "France" },
  ERE: { name: "Eredivisie", short: "ERE", country: "Netherlands" },
  EED: { name: "Eerste Divisie", short: "EED", country: "Netherlands" },
  BEL: { name: "Pro League", short: "Pro", country: "Belgium" },
  BEL2: { name: "Challenger Pro", short: "CPL", country: "Belgium" },
  POR: { name: "Primeira Liga", short: "Liga", country: "Portugal" },
  POR2: { name: "Liga Portugal 2", short: "LP2", country: "Portugal" },
  TUR: { name: "Süper Lig", short: "SL", country: "Turkey" },
  TUR2: { name: "1. Lig", short: "1.Lig", country: "Turkey" },
  EKE: { name: "Ekstraklasa", short: "EKE", country: "Poland" },
  POL2: { name: "I Liga", short: "I Liga", country: "Poland" },
  ALLS: { name: "Allsvenskan", short: "ALLS", country: "Sweden" },
  SUP: { name: "Superettan", short: "Super", country: "Sweden" },
  DEN: { name: "Superliga", short: "DSL", country: "Denmark" },
  DEN2: { name: "1. Division", short: "1.Div", country: "Denmark" },
  NOR: { name: "Eliteserien", short: "ELI", country: "Norway" },
  NOR2: { name: "1. divisjon", short: "OBOS", country: "Norway" },
  AUT: { name: "Bundesliga", short: "ABL", country: "Austria" },
  AUT2: { name: "2. Liga", short: "2.Liga", country: "Austria" },
  SUI: { name: "Super League", short: "SSL", country: "Switzerland" },
  SUI2: { name: "Challenge League", short: "ChL", country: "Switzerland" },
  GRE: { name: "Super League", short: "GSL", country: "Greece" },
  GRE2: { name: "Super League 2", short: "GSL2", country: "Greece" },
  CZE: { name: "Chance Liga", short: "CZ", country: "Czechia" },
  CZE2: { name: "FNL", short: "FNL", country: "Czechia" },
  IRL: { name: "Premier Division", short: "LOI", country: "Ireland" },
  IRL2: { name: "First Division", short: "LOI2", country: "Ireland" },
  HUN: { name: "NB I", short: "NB I", country: "Hungary" },
  HUN2: { name: "NB II", short: "NB II", country: "Hungary" },
  ROU: { name: "Liga I", short: "Liga I", country: "Romania" },
  ROU2: { name: "Liga II", short: "Liga II", country: "Romania" },
  UKR: { name: "Premier League", short: "UPL", country: "Ukraine" },
  SVK: { name: "Super Liga", short: "SVK", country: "Slovakia" },
  SVK2: { name: "2. Liga", short: "SVK2", country: "Slovakia" },
  SVN: { name: "Prva Liga", short: "SVN", country: "Slovenia" },
  FIN: { name: "Veikkausliiga", short: "VEI", country: "Finland" },
  FIN2: { name: "Ykkösliiga", short: "YKK", country: "Finland" },
  ISL: { name: "Besta deild", short: "ISL", country: "Iceland" },
  ISL2: { name: "1. Deild", short: "1D", country: "Iceland" },
  CYP: { name: "1. Division", short: "CYP", country: "Cyprus" },
  CYP2: { name: "2. Division", short: "CYP2", country: "Cyprus" },
  WAL: { name: "Cymru Premier", short: "CYM", country: "Wales" },
  NIR: { name: "Premiership", short: "NIFL", country: "Northern Ireland" },
  ALB: { name: "Kategoria Superiore", short: "ALB", country: "Albania" },
  ARM: { name: "Premier League", short: "ARM", country: "Armenia" },
  AZE: { name: "Premier League", short: "AZE", country: "Azerbaijan" },
  EST: { name: "Meistriliiga", short: "EST", country: "Estonia" },
  FRO: { name: "Premier League", short: "FRO", country: "Faroe Islands" },
  KAZ: { name: "Premier League", short: "KAZ", country: "Kazakhstan" },
  LVA: { name: "Virsliga", short: "LVA", country: "Latvia" },
  LTU: { name: "A Lyga", short: "LTU", country: "Lithuania" },
  LUX: { name: "National Division", short: "LUX", country: "Luxembourg" },
  MDA: { name: "Super Liga", short: "MDA", country: "Moldova" },
  MNE: { name: "1. CFL", short: "MNE", country: "Montenegro" },
  DFB: { name: "DFB-Pokal", short: "Pokal", country: "Germany" },
  GERSC: { name: "DFL-Supercup", short: "DFL", country: "Germany" },
  FACUP: { name: "FA Cup", short: "FA Cup", country: "England" },
  EFLCUP: { name: "EFL Cup", short: "EFL Cup", country: "England" },
  EFLT: { name: "EFL Trophy", short: "Trophy", country: "England" },
  SCCUP: { name: "Scottish Cup", short: "SFA", country: "Scotland" },
  SLCUP: { name: "League Cup", short: "SLC", country: "Scotland" },
  CDR: { name: "Copa del Rey", short: "Copa", country: "Spain" },
  SUCUP: { name: "Supercopa", short: "Super", country: "Spain" },
  CIT: { name: "Coppa Italia", short: "Coppa", country: "Italy" },
  SCI: { name: "Supercoppa", short: "SCI", country: "Italy" },
  CDF: { name: "Coupe de France", short: "CdF", country: "France" },
  NEDC: { name: "KNVB Cup", short: "KNVB", country: "Netherlands" },
  BELC: { name: "Belgian Cup", short: "Cup", country: "Belgium" },
  PORC: { name: "Taça de Portugal", short: "Taça", country: "Portugal" },
  TURC: { name: "Turkish Cup", short: "Cup", country: "Turkey" },
  POLC: { name: "Polish Cup", short: "Puchar", country: "Poland" },
  SWEC: { name: "Svenska Cupen", short: "Cupen", country: "Sweden" },
  DENC: { name: "DBU Pokalen", short: "Pokal", country: "Denmark" },
  NORC: { name: "NM Cupen", short: "NM", country: "Norway" },
  AUTC: { name: "Austrian Cup", short: "Cup", country: "Austria" },
  SUIC: { name: "Swiss Cup", short: "Cup", country: "Switzerland" },
  GREC: { name: "Greek Cup", short: "Cup", country: "Greece" },
  CZEC: { name: "Czech Cup", short: "Cup", country: "Czechia" },
  IRLC: { name: "FAI Cup", short: "FAI", country: "Ireland" },
  UCL: { name: "Champions League", short: "UCL", country: "UEFA" },
  UCLQ: { name: "UCL Qualifying", short: "UCLQ", country: "UEFA" },
  UEL: { name: "Europa League", short: "UEL", country: "UEFA" },
  UELQ: { name: "Europa Qualifying", short: "UELQ", country: "UEFA" },
  ECL: { name: "Conference League", short: "UECL", country: "UEFA" },
  ECLQ: { name: "Conference Qualifying", short: "UECLQ", country: "UEFA" },
  USC: { name: "Super Cup", short: "USC", country: "UEFA" },
  ISR: { name: "Premier League", short: "Ligat", country: "Israel" },
  ISR2: { name: "Leumit League", short: "Leumit", country: "Israel" },
  ISRC: { name: "State Cup", short: "State", country: "Israel" },
  BUL: { name: "First League", short: "efbet", country: "Bulgaria" },
  BUL2: { name: "Second League", short: "2nd", country: "Bulgaria" },
  BULC: { name: "Bulgarian Cup", short: "Cup", country: "Bulgaria" },
  CRO: { name: "HNL", short: "HNL", country: "Croatia" },
  CROC: { name: "Croatian Cup", short: "Cup", country: "Croatia" },
  SRB: { name: "SuperLiga", short: "SLiga", country: "Serbia" },
  SRB2: { name: "Prva Liga", short: "Prva", country: "Serbia" },
  SRBC: { name: "Serbian Cup", short: "Kup", country: "Serbia" },
  MLS: { name: "MLS", short: "MLS", country: "USA" },
  USL: { name: "USL Championship", short: "USL", country: "USA" },
  USAC: { name: "US Open Cup", short: "Open", country: "USA" },
  MX: { name: "Liga MX", short: "MX", country: "Mexico" },
  MX2: { name: "Expansión MX", short: "MX2", country: "Mexico" },
  MEXC: { name: "Campeón de Campeones", short: "CdC", country: "Mexico" },
  CPL: { name: "Premier League", short: "CPL", country: "Canada" },
  CANC: { name: "Canadian Championship", short: "CanChamp", country: "Canada" },
  CRC: { name: "Primera División", short: "CRC", country: "Costa Rica" },
  CRCC: { name: "Supercopa", short: "Super", country: "Costa Rica" },
  HON: { name: "Liga Nacional", short: "HON", country: "Honduras" },
  GUA: { name: "Liga Nacional", short: "GUA", country: "Guatemala" },
  SLV: { name: "Primera División", short: "SLV", country: "El Salvador" },
  PAN: { name: "LPF", short: "PAN", country: "Panama" },
  BRA: { name: "Série A", short: "BRA", country: "Brazil" },
  BRA2: { name: "Série B", short: "BRA2", country: "Brazil" },
  BRAC: { name: "Copa do Brasil", short: "Copa", country: "Brazil" },
  ARG: { name: "Liga Profesional", short: "ARG", country: "Argentina" },
  ARG2: { name: "Primera Nacional", short: "ARG2", country: "Argentina" },
  ARGC: { name: "Copa Argentina", short: "Copa", country: "Argentina" },
  COL: { name: "Primera A", short: "COL", country: "Colombia" },
  COL2: { name: "Primera B", short: "COL2", country: "Colombia" },
  COLC: { name: "Copa Colombia", short: "Copa", country: "Colombia" },
  CHI: { name: "Primera División", short: "CHI", country: "Chile" },
  CHI2: { name: "Primera B", short: "CHI2", country: "Chile" },
  CHIC: { name: "Copa Chile", short: "Copa", country: "Chile" },
  URU: { name: "Primera División", short: "URU", country: "Uruguay" },
  URU2: { name: "Segunda División", short: "URU2", country: "Uruguay" },
  URUC: { name: "Copa Uruguay", short: "Copa", country: "Uruguay" },
  ECU: { name: "LigaPro", short: "ECU", country: "Ecuador" },
  ECUC: { name: "Copa Ecuador", short: "Copa", country: "Ecuador" },
  PER: { name: "Liga 1", short: "PER", country: "Peru" },
  PAR: { name: "Primera División", short: "PAR", country: "Paraguay" },
  PARC: { name: "Copa Paraguay", short: "Copa", country: "Paraguay" },
  BOL: { name: "División Profesional", short: "BOL", country: "Bolivia" },
  VEN: { name: "Primera División", short: "VEN", country: "Venezuela" },
  J1: { name: "J1 League", short: "J1", country: "Japan" },
  J2: { name: "J2 League", short: "J2", country: "Japan" },
  JLEC: { name: "Emperor Cup", short: "Emperor", country: "Japan" },
  K1: { name: "K League 1", short: "K1", country: "South Korea" },
  K2: { name: "K League 2", short: "K2", country: "South Korea" },
  KORC: { name: "FA Cup", short: "FA Cup", country: "South Korea" },
  CSL: { name: "Super League", short: "CSL", country: "China" },
  CHN2: { name: "League One", short: "CHN2", country: "China" },
  CHNC: { name: "FA Cup", short: "FA Cup", country: "China" },
  KSA: { name: "Pro League", short: "KSA", country: "Saudi Arabia" },
  KSA2: { name: "Division 1", short: "KSA2", country: "Saudi Arabia" },
  KSAC: { name: "King's Cup", short: "King", country: "Saudi Arabia" },
  UAE: { name: "Pro League", short: "UAE", country: "UAE" },
  UAEC: { name: "President's Cup", short: "Cup", country: "UAE" },
  QAT: { name: "Stars League", short: "QAT", country: "Qatar" },
  QAT2: { name: "Second Division", short: "QAT2", country: "Qatar" },
  QATC: { name: "Amir Cup", short: "Amir", country: "Qatar" },
  AUS: { name: "A-League", short: "A-Lge", country: "Australia" },
  AUS2: { name: "Championship", short: "AUS2", country: "Australia" },
  AUSC: { name: "Australia Cup", short: "Cup", country: "Australia" },
  IND: { name: "Super League", short: "ISL", country: "India" },
  IND2: { name: "I-League", short: "IL", country: "India" },
  INDC: { name: "Super Cup", short: "Super", country: "India" },
  THA: { name: "Thai League 1", short: "T1", country: "Thailand" },
  THA2: { name: "Thai League 2", short: "T2", country: "Thailand" },
  THAC: { name: "FA Cup", short: "FA Cup", country: "Thailand" },
  IDN: { name: "Super League", short: "IDN", country: "Indonesia" },
  IDN2: { name: "Liga 2", short: "IDN2", country: "Indonesia" },
  IDNC: { name: "President's Cup", short: "Cup", country: "Indonesia" },
  MYS: { name: "Super League", short: "MYS", country: "Malaysia" },
  IRN: { name: "Persian Gulf Pro", short: "IRN", country: "Iran" },
  IRNC: { name: "Hazfi Cup", short: "Hazfi", country: "Iran" },
  ALG: { name: "Ligue 1", short: "ALG", country: "Algeria" },
  ALG2: { name: "Ligue 2", short: "ALG2", country: "Algeria" },
  BHR: { name: "Premier League", short: "BHR", country: "Bahrain" },
  BHR2: { name: "Second Division", short: "BHR2", country: "Bahrain" },
  IRQ: { name: "Stars League", short: "IRQ", country: "Iraq" },
  IRQ2: { name: "Premier Division", short: "IRQ2", country: "Iraq" },
  EGY: { name: "Premier League", short: "EGY", country: "Egypt" },
  EGY2: { name: "Second Division", short: "EGY2", country: "Egypt" },
  EGYC: { name: "Egypt Cup", short: "Cup", country: "Egypt" },
  ACL: { name: "Champions League", short: "AFC", country: "AFC" },
  ACL2: { name: "Champions League Two", short: "AFC2", country: "AFC" },
};

export const CUP_LEAGUES = new Set<LeagueId>([
  "FACUP",
  "EFLCUP",
  "EFLT",
  "SCCUP",
  "SLCUP",
  "CDR",
  "SUCUP",
  "CIT",
  "SCI",
  "DFB",
  "GERSC",
  "CDF",
  "NEDC",
  "BELC",
  "PORC",
  "TURC",
  "POLC",
  "SWEC",
  "DENC",
  "NORC",
  "AUTC",
  "SUIC",
  "GREC",
  "CZEC",
  "IRLC",
  "ISRC",
  "BULC",
  "CROC",
  "SRBC",
  "USAC",
  "MEXC",
  "CANC",
  "CRCC",
  "BRAC",
  "ARGC",
  "COLC",
  "CHIC",
  "URUC",
  "ECUC",
  "PARC",
  "JLEC",
  "KORC",
  "CHNC",
  "KSAC",
  "UAEC",
  "QATC",
  "AUSC",
  "INDC",
  "THAC",
  "IDNC",
  "IRNC",
  "EGYC",
  "UCL",
  "UCLQ",
  "UEL",
  "UELQ",
  "ECL",
  "ECLQ",
  "USC",
  "ACL",
  "ACL2",
]);

/** Pyramid quality. Top-flight ~100; two divisions down ~40. Cups are 0 — use the club's real division. */
export const LEAGUE_TIER: Record<LeagueId, number> = {
  EPL: 100,
  LALIGA: 97,
  BL: 95,
  SA: 94,
  L1: 92,
  ERE: 82,
  POR: 80,
  BEL: 78,
  TUR: 76,
  SPL: 74,
  EFLC: 72,
  BL2: 70,
  SB: 69,
  L2: 68,
  LL2: 66,
  EED: 61,
  BEL2: 58,
  POR2: 58,
  TUR2: 56,
  EL1: 54,
  CHAMP: 52,
  EKE: 72,
  POL2: 52,
  ALLS: 68,
  SUP: 50,
  DEN: 70,
  DEN2: 50,
  NOR: 68,
  NOR2: 48,
  AUT: 70,
  AUT2: 50,
  SUI: 72,
  SUI2: 52,
  GRE: 68,
  GRE2: 46,
  CZE: 70,
  CZE2: 50,
  IRL: 52,
  IRL2: 38,
  HUN: 64,
  HUN2: 44,
  ROU: 64,
  ROU2: 44,
  UKR: 66,
  SVK: 58,
  SVK2: 40,
  SVN: 56,
  FIN: 58,
  FIN2: 40,
  ISL: 48,
  ISL2: 34,
  CYP: 52,
  CYP2: 36,
  WAL: 40,
  NIR: 44,
  ALB: 46,
  ARM: 42,
  AZE: 44,
  EST: 40,
  FRO: 36,
  KAZ: 48,
  LVA: 42,
  LTU: 42,
  LUX: 40,
  MDA: 42,
  MNE: 40,
  ISR: 64,
  ISR2: 46,
  BUL: 62,
  BUL2: 42,
  CRO: 66,
  SRB: 64,
  SRB2: 46,
  EL2: 40,
  SL1: 36,
  NL: 30,
  SL2: 26,
  FACUP: 0,
  EFLCUP: 0,
  EFLT: 0,
  SCCUP: 0,
  SLCUP: 0,
  CDR: 0,
  SUCUP: 0,
  CIT: 0,
  SCI: 0,
  DFB: 0,
  GERSC: 0,
  CDF: 0,
  NEDC: 0,
  BELC: 0,
  PORC: 0,
  TURC: 0,
  POLC: 0,
  SWEC: 0,
  DENC: 0,
  NORC: 0,
  AUTC: 0,
  SUIC: 0,
  GREC: 0,
  CZEC: 0,
  IRLC: 0,
  ISRC: 0,
  BULC: 0,
  CROC: 0,
  SRBC: 0,
  USAC: 0,
  MEXC: 0,
  CANC: 0,
  CRCC: 0,
  BRAC: 0,
  ARGC: 0,
  COLC: 0,
  CHIC: 0,
  URUC: 0,
  ECUC: 0,
  PARC: 0,
  JLEC: 0,
  KORC: 0,
  CHNC: 0,
  KSAC: 0,
  UAEC: 0,
  QATC: 0,
  AUSC: 0,
  INDC: 0,
  THAC: 0,
  IDNC: 0,
  IRNC: 0,
  EGYC: 0,
  UCL: 98,
  UCLQ: 80,
  UEL: 86,
  UELQ: 72,
  ECL: 76,
  ECLQ: 64,
  USC: 90,
  MLS: 78,
  USL: 48,
  MX: 80,
  MX2: 54,
  CPL: 46,
  CRC: 50,
  HON: 46,
  GUA: 44,
  SLV: 42,
  PAN: 44,
  BRA: 86,
  BRA2: 62,
  ARG: 84,
  ARG2: 58,
  COL: 70,
  COL2: 48,
  CHI: 68,
  CHI2: 46,
  URU: 66,
  URU2: 44,
  ECU: 62,
  PER: 60,
  PAR: 58,
  BOL: 50,
  VEN: 52,
  J1: 74,
  J2: 54,
  K1: 72,
  K2: 50,
  CSL: 70,
  CHN2: 48,
  KSA: 82,
  KSA2: 52,
  UAE: 64,
  QAT: 62,
  QAT2: 40,
  AUS: 64,
  AUS2: 44,
  IND: 56,
  IND2: 40,
  THA: 58,
  THA2: 40,
  IDN: 54,
  IDN2: 38,
  MYS: 50,
  IRN: 66,
  ALG: 60,
  ALG2: 42,
  BHR: 48,
  BHR2: 34,
  IRQ: 52,
  IRQ2: 36,
  EGY: 68,
  EGY2: 46,
  ACL: 0,
  ACL2: 0,
};

export const EUROPE_COUNTRIES = [
  "England",
  "Scotland",
  "Spain",
  "Italy",
  "Germany",
  "France",
  "Netherlands",
  "Belgium",
  "Portugal",
  "Turkey",
  "Poland",
  "Sweden",
  "Denmark",
  "Norway",
  "Austria",
  "Switzerland",
  "Greece",
  "Czechia",
  "Ireland",
  "Hungary",
  "Romania",
  "Ukraine",
  "Slovakia",
  "Slovenia",
  "Finland",
  "Iceland",
  "Cyprus",
  "Wales",
  "Northern Ireland",
  "Albania",
  "Armenia",
  "Azerbaijan",
  "Estonia",
  "Faroe Islands",
  "Kazakhstan",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Moldova",
  "Montenegro",
  "Israel",
  "Bulgaria",
  "Croatia",
  "Serbia",
  "UEFA",
] as const;

export const ASIA_COUNTRIES = [
  "China",
  "Japan",
  "Iran",
  "UAE",
  "Qatar",
  "Bahrain",
  "Iraq",
  "Egypt",
  "Algeria",
  "South Korea",
  "Saudi Arabia",
  "Australia",
  "India",
  "Thailand",
  "Indonesia",
  "Malaysia",
  "AFC",
] as const;

export const NORTH_AMERICA_COUNTRIES = ["USA", "Mexico", "Canada"] as const;

export const CENTRAL_AMERICA_COUNTRIES = [
  "Costa Rica",
  "Honduras",
  "Guatemala",
  "El Salvador",
  "Panama",
] as const;

export const SOUTH_AMERICA_COUNTRIES = [
  "Brazil",
  "Argentina",
  "Colombia",
  "Chile",
  "Uruguay",
  "Ecuador",
  "Peru",
  "Paraguay",
  "Bolivia",
  "Venezuela",
] as const;

export const COUNTRY_ORDER = [
  ...EUROPE_COUNTRIES,
  ...ASIA_COUNTRIES,
  ...NORTH_AMERICA_COUNTRIES,
  ...CENTRAL_AMERICA_COUNTRIES,
  ...SOUTH_AMERICA_COUNTRIES,
] as const;

export type Continent = "Europe" | "Asia" | "North America" | "Central America" | "South America";

export const CONTINENT_ORDER: Continent[] = [
  "Europe",
  "Asia",
  "North America",
  "Central America",
  "South America",
];

export const CONTINENT_COUNTRIES: Record<Continent, readonly string[]> = {
  Europe: EUROPE_COUNTRIES,
  Asia: ASIA_COUNTRIES,
  "North America": NORTH_AMERICA_COUNTRIES,
  "Central America": CENTRAL_AMERICA_COUNTRIES,
  "South America": SOUTH_AMERICA_COUNTRIES,
};

export function isKnownLeague(id: string | undefined): id is LeagueId {
  return !!id && Object.prototype.hasOwnProperty.call(LEAGUES, id);
}

export function isContinent(value: string | undefined): value is Continent {
  return !!value && (CONTINENT_ORDER as readonly string[]).includes(value);
}

export function continentOfCountry(country: string): Continent {
  for (const c of CONTINENT_ORDER) {
    if ((CONTINENT_COUNTRIES[c] as readonly string[]).includes(country)) return c;
  }
  return "Europe";
}

const TOP_FLIGHT = new Set<LeagueId>(
  (Object.keys(LEAGUES) as LeagueId[])
    .filter((id) => !CUP_LEAGUES.has(id))
    .reduce<LeagueId[]>((acc, id) => {
      const country = LEAGUES[id].country;
      const best = acc.find((x) => LEAGUES[x].country === country);
      if (!best) return [...acc, id];
      if ((LEAGUE_TIER[id] ?? 0) > (LEAGUE_TIER[best] ?? 0)) {
        return acc.map((x) => (x === best ? id : x));
      }
      return acc;
    }, []),
);

function boardKind(id: LeagueId) {
  if (CUP_LEAGUES.has(id)) return 2;
  if (TOP_FLIGHT.has(id)) return 0;
  return 1;
}

export function compareBoard(
  a: { league: LeagueId; kickoff: string },
  b: { league: LeagueId; kickoff: string },
) {
  const t = a.kickoff.localeCompare(b.kickoff);
  if (t) return t;
  const ca = LEAGUES[a.league]?.country ?? "";
  const cb = LEAGUES[b.league]?.country ?? "";
  const cont =
    CONTINENT_ORDER.indexOf(continentOfCountry(ca)) - CONTINENT_ORDER.indexOf(continentOfCountry(cb));
  if (cont) return cont;
  const yi = COUNTRY_ORDER.indexOf(ca as (typeof COUNTRY_ORDER)[number]);
  const yj = COUNTRY_ORDER.indexOf(cb as (typeof COUNTRY_ORDER)[number]);
  const country = (yi === -1 ? 99 : yi) - (yj === -1 ? 99 : yj);
  if (country) return country;
  const kind = boardKind(a.league) - boardKind(b.league);
  if (kind) return kind;
  const tier = (LEAGUE_TIER[b.league] ?? 0) - (LEAGUE_TIER[a.league] ?? 0);
  if (tier) return tier;
  return a.league.localeCompare(b.league);
}

export function countryChipLabel(country: string) {
  return country === "UEFA" ? "UEFA" : country === "AFC" ? "AFC" : country;
}

const COUNTRY_FLAG: Record<string, string> = {
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Spain: "🇪🇸",
  Italy: "🇮🇹",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Netherlands: "🇳🇱",
  Belgium: "🇧🇪",
  Portugal: "🇵🇹",
  Turkey: "🇹🇷",
  Poland: "🇵🇱",
  Sweden: "🇸🇪",
  Denmark: "🇩🇰",
  Norway: "🇳🇴",
  Austria: "🇦🇹",
  Switzerland: "🇨🇭",
  Greece: "🇬🇷",
  Czechia: "🇨🇿",
  Ireland: "🇮🇪",
  Hungary: "🇭🇺",
  Romania: "🇷🇴",
  Ukraine: "🇺🇦",
  Slovakia: "🇸🇰",
  Slovenia: "🇸🇮",
  Finland: "🇫🇮",
  Iceland: "🇮🇸",
  Cyprus: "🇨🇾",
  Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  "Northern Ireland": "🇬🇧",
  Albania: "🇦🇱",
  Armenia: "🇦🇲",
  Azerbaijan: "🇦🇿",
  Estonia: "🇪🇪",
  "Faroe Islands": "🇫🇴",
  Kazakhstan: "🇰🇿",
  Latvia: "🇱🇻",
  Lithuania: "🇱🇹",
  Luxembourg: "🇱🇺",
  Moldova: "🇲🇩",
  Montenegro: "🇲🇪",
  Israel: "🇮🇱",
  Bulgaria: "🇧🇬",
  Croatia: "🇭🇷",
  Serbia: "🇷🇸",
  USA: "🇺🇸",
  Mexico: "🇲🇽",
  Canada: "🇨🇦",
  "Costa Rica": "🇨🇷",
  Honduras: "🇭🇳",
  Guatemala: "🇬🇹",
  "El Salvador": "🇸🇻",
  Panama: "🇵🇦",
  Brazil: "🇧🇷",
  Argentina: "🇦🇷",
  Colombia: "🇨🇴",
  Chile: "🇨🇱",
  Uruguay: "🇺🇾",
  Ecuador: "🇪🇨",
  Peru: "🇵🇪",
  Paraguay: "🇵🇾",
  Bolivia: "🇧🇴",
  Venezuela: "🇻🇪",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  China: "🇨🇳",
  "Saudi Arabia": "🇸🇦",
  UAE: "🇦🇪",
  Qatar: "🇶🇦",
  Australia: "🇦🇺",
  India: "🇮🇳",
  Thailand: "🇹🇭",
  Indonesia: "🇮🇩",
  Malaysia: "🇲🇾",
  Iran: "🇮🇷",
  Algeria: "🇩🇿",
  Bahrain: "🇧🇭",
  Iraq: "🇮🇶",
  Egypt: "🇪🇬",
  UEFA: "🇪🇺",
  AFC: "🌏",
};

export function countryFlag(country: string) {
  return COUNTRY_FLAG[country] ?? "";
}

export function continentChipLabel(continent: Continent) {
  if (continent === "North America") return "N. America";
  if (continent === "Central America") return "C. America";
  if (continent === "South America") return "S. America";
  return continent;
}
