export const CONTINENT_MAP_249: Record<string, { label: string; icon: string; count: number; subregions: Record<string, string[]>; countries: string[] }> = {
  // EUROPE - 50+ countries (Schengen, EU, Balkans, etc)
  europe: {
    label: "Europe",
    icon: "🇪🇺",
    count: 0,
    subregions: {
      schengen: ["at","be","cz","dk","ee","fi","fr","de","gr","hu","is","it","lv","li","lt","lu","mt","nl","no","pl","pt","sk","si","es","se","ch","hr","ro","bg","cy","sc","eu"],
      western_europe: ["gb","ie","fr","de","nl","be","lu","ch","at","mc","li","ad","sm","va"],
      eastern_europe: ["pl","cz","sk","hu","ro","bg","hr","si","rs","ba","me","mk","al","by","md","ua","ru"],
      northern_europe: ["no","se","dk","fi","is","ee","lv","lt","gb","ie","fo","gl","im","je","gg","ax","sj"],
      southern_europe: ["it","es","pt","gr","cy","mt","ad","sm","va","gi"]
    },
    countries: ["al","ad","at","by","be","ba","bg","hr","cy","cz","dk","ee","fo","fi","fr","de","gi","gr","va","hu","is","ie","im","it","je","xk","lv","li","lt","lu","mt","md","mc","me","nl","mk","no","pl","pt","ro","ru","sm","rs","sk","si","es","se","ch","ua","gb","ax","gg","gl","sj","eu","sc"]
  },
  
  // ASIA - 50+ countries
  asia: {
    label: "Asia",
    icon: "🌏",
    count: 0,
    subregions: {
      east_asia: ["cn","hk","mo","tw","jp","kr","kp","mn"],
      south_asia: ["in","pk","bd","np","bt","lk","mv","af"],
      southeast_asia: ["th","vn","my","id","ph","sg","kh","la","mm","bn","tl"],
      central_asia: ["kz","uz","tm","tj","kg"]
    },
    countries: ["af","am","az","bh","bd","bt","bn","kh","cn","cy","ge","hk","in","id","ir","iq","il","jp","jo","kz","kp","kr","kw","kg","la","lb","mo","my","mv","mn","mm","np","om","pk","ps","ph","qa","sa","sg","lk","sy","tw","tj","th","tl","tr","tm","ae","uz","vn","ye"]
  },
  
  // MIDDLE EAST / GULF - 15+ countries
  middle_east: {
    label: "Middle East",
    icon: "🕌",
    count: 0,
    subregions: {
      gcc: ["sa","ae","qa","kw","bh","om"],
      levant: ["jo","lb","sy","iq","il","ps"]
    },
    countries: ["ae","bh","eg","ir","iq","il","jo","kw","lb","om","ps","qa","sa","sy","tr","ye","cy","ge","am","az"]
  },
  
  // AFRICA - 54+ countries
  africa: {
    label: "Africa",
    icon: "🌍",
    count: 0,
    subregions: {
      north_africa: ["eg","ly","tn","dz","ma","eh","sd"],
      west_africa: ["ng","gh","ci","sn","ml","bf","ne","bj","tg","sl","lr","gm","gn","gw","cv","mr"],
      east_africa: ["ke","et","tz","ug","rw","bi","dj","er","so","ss","mu","sc","km","mg","mw","zm","mz"],
      central_africa: ["cm","cf","td","cg","cd","ao","gq","ga","st","bw","na","za","sz","ls","zw"],
      southern_africa: ["za","bw","na","sz","ls","zm","zw","mz","mg","mu","sc"]
    },
    countries: ["dz","ao","bj","bw","bf","bi","cv","cm","cf","td","km","cg","cd","dj","eg","gq","er","sz","et","ga","gm","gh","gn","gw","ci","ke","ls","lr","ly","mg","mw","ml","mr","mu","ma","mz","na","ne","ng","rw","st","sn","sc","sl","so","za","ss","sd","tz","tg","tn","ug","zm","zw","eh","re","yt","sh","io"]
  },
  
  // NORTH AMERICA - 23+ countries
  north_america: {
    label: "North America",
    icon: "🌎",
    count: 0,
    subregions: {
      usa_canada: ["us","ca"],
      central_america: ["mx","gt","bz","sv","hn","ni","cr","pa"],
      caribbean: ["cu","do","ht","jm","bs","bb","ag","dm","gd","kn","lc","vc","tt","pr","vi","vg","ky","bm","ai","aw","cw","sx","bq","bl","mf","tc","ms"]
    },
    countries: ["ag","ai","aw","bs","bb","bz","bm","ca","ky","cr","cu","cw","dm","do","sv","gd","gt","ht","hn","jm","mq","mx","ms","ni","pa","pr","kn","lc","pm","vc","tt","tc","us","vg","vi","bq","bl","mf","sx","gp"]
  },
  
  // SOUTH AMERICA - 12+ countries
  south_america: {
    label: "South America",
    icon: "🌎",
    count: 0,
    subregions: {
      andes: ["co","ve","ec","pe","bo","cl"],
      southern_cone: ["ar","uy","py","br","cl"],
      guianas: ["gy","sr","gf"]
    },
    countries: ["ar","bo","br","cl","co","ec","fk","gf","gy","py","pe","sr","uy","ve","gs"]
  },
  
  // OCEANIA - 20+ countries
  oceania: {
    label: "Oceania & Pacific",
    icon: "🌊",
    count: 0,
    subregions: {
      australia_nz: ["au","nz"],
      pacific_islands: ["fj","pg","sb","vu","ws","to","tv","ki","mh","fm","pw","nr","ck","nu","tk","wf","nc","pf","gu","mp","as","um"],
      territories: ["nc","pf","gu","mp","as","um","ck","nu","tk","wf","nf","pn","cx","cc","hm","aq","bv","io","gs","tf"]
    },
    countries: ["au","nz","fj","pg","sb","vu","ws","to","tv","ki","mh","fm","pw","nr","ck","nu","tk","wf","nc","pf","gu","mp","as","um","nf","pn","cx","cc","hm","aq","bv","tf"]
  },
  
  // SPECIAL CATEGORIES
  special: {
    label: "Special Categories",
    icon: "⭐",
    count: 0,
    subregions: {
      schengen: ["at","be","cz","dk","ee","fi","fr","de","gr","hu","is","it","lv","li","lt","lu","mt","nl","no","pl","pt","sk","si","es","se","ch","hr","ro","bg","cy","eu","sc"],
      digital_nomad: ["pt","es","ee","hr","gr","hu","is","de","no","cz","ro","mt","cy","ae","th","id","my","vn","kr","jp","mx","cr","co","br","ar","za","mu","sc","bb","bm","ag","dm","kn","lc","vc","bs","bz","pa","uy","ge","al","me","mk","rs","tr","il"],
      golden_visa: ["pt","es","gr","mt","cy","it","ie","gb","us","ca","au","nz","ae","tr","my","th","kh","vn","pa","cr","uy","lv"],
      no_interview: ["th","my","id","vn","kh","la","mm","np","lk","mv","sc","mu","ke","tz","ug","rw","zm","bw","fj","ws","to","vu","ki","mh","fm","nr","tv","ck","sg","hk","mo","tw","kr","jp","ae","qa","bh","om","jo","lb","ge","am","az","kz","uz","kg","tj","tm"],
      eu_blue_card: ["de","fr","nl","se","fi","dk","at","be","lu","ie","pt","es","it","gr","cy","mt","ee","lv","lt","pl","cz","sk","si","hr","ro","bg","hu"]
    },
    countries: []
  }
};

export function getContinentForCountry(code: string): string {
  if (!code) return "other";
  const c = code.trim().toLowerCase();
  const normalized = (c === "uk" ? "gb" : (c === "sch" || c === "schengen" ? "sc" : c));
  // Check middle_east before asia for primary badge display on GCC/Levant countries
  const order = ["europe", "middle_east", "asia", "north_america", "south_america", "africa", "oceania"];
  for (const continent of order) {
    const data = CONTINENT_MAP_249[continent];
    if (data && (data.countries.includes(normalized) || Object.values(data.subregions).some(sub => sub.includes(normalized)))) {
      return continent;
    }
  }
  return "oceania";
}

export function isCountryInContinent(code: string, continentKey: string): boolean {
  if (!continentKey || continentKey === "all") return true;
  if (!code) return false;
  const c = code.trim().toLowerCase();
  const normalized = (c === "uk" ? "gb" : (c === "sch" || c === "schengen" ? "sc" : c));
  const data = CONTINENT_MAP_249[continentKey];
  if (!data) return false;
  return (
    data.countries.includes(normalized) ||
    Object.values(data.subregions).some(sub => sub.includes(normalized)) ||
    getContinentForCountry(normalized) === continentKey
  );
}

export function getAllContinents() {
  return Object.keys(CONTINENT_MAP_249).map(key => ({
    key,
    label: CONTINENT_MAP_249[key].label,
    icon: CONTINENT_MAP_249[key].icon,
    count: CONTINENT_MAP_249[key].countries.length,
    countries: CONTINENT_MAP_249[key].countries
  }));
}
