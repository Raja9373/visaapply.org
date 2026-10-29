export interface EmbassyOffice {
  city: string;
  address: string;
  phone?: string;
  email?: string;
  timings?: string;
  website?: string;
  map?: string;
  lang?: string;
}

export const UNIVERSAL_EMBASSY_DB: Record<string, Record<string, EmbassyOffice[]>> = {
  // FROM = INDIA (IN)
  "IN": {
    "US": [
      { city: "New Delhi (US Embassy Main)", address: "Shantipath, Chanakyapuri, New Delhi - 110021", phone: "+91-11-2419-8000", email: "support-india@ustraveldocs.com", timings: "Mon-Fri 8:00 AM - 4:30 PM", website: "in.usembassy.gov", map: "US Embassy New Delhi" },
      { city: "Mumbai Consulate General", address: "C-49, G-Block, BKC, Bandra East, Mumbai - 400051", phone: "+91-22-2672-4000", email: "support-india@ustraveldocs.com", timings: "Mon-Fri 8:00 AM - 4:30 PM", website: "in.usembassy.gov", map: "US Consulate Mumbai" },
      { city: "Chennai Consulate General", address: "220 Anna Salai, Gemini Circle, Chennai - 600006", phone: "+91-44-2857-4000", email: "support-india@ustraveldocs.com", timings: "Mon-Fri 8:00 AM - 4:30 PM", website: "in.usembassy.gov", map: "US Consulate Chennai" },
      { city: "Hyderabad Consulate General", address: "Paigah House, 1-8-323, Begumpet, Hyderabad - 500003", phone: "+91-40-4620-2100", email: "support-india@ustraveldocs.com", timings: "Mon-Fri 8:00 AM - 4:30 PM", website: "in.usembassy.gov", map: "US Consulate Hyderabad" },
      { city: "Kolkata Consulate General", address: "5/1 Ho Chi Minh Sarani, Kolkata - 700071", phone: "+91-33-3984-2400", email: "support-india@ustraveldocs.com", timings: "Mon-Fri 8:00 AM - 4:30 PM", website: "in.usembassy.gov", map: "US Consulate Kolkata" }
    ],
    "JP": [
      { city: "New Delhi (Embassy of Japan)", address: "50-G, Chanakyapuri, New Delhi - 110021", phone: "+91-11-4610-4610", email: "jpemb.delhi@nd.mofa.go.jp", timings: "Mon-Fri 9:00 AM - 1:00 PM, 2:00 PM - 5:00 PM", website: "in.emb-japan.go.jp", map: "Embassy of Japan New Delhi" },
      { city: "Mumbai Consulate General", address: "No. 1, M.L. Dahanukar Marg, Cumballa Hill, Mumbai - 400026", phone: "+91-22-2351-7101", email: "cgjumbai@by.mofa.go.jp", timings: "Mon-Fri 9:00 AM - 1:00 PM, 2:00 PM - 5:00 PM", website: "mumbai.in.emb-japan.go.jp", map: "Japan Consulate Mumbai" },
      { city: "Bengaluru Consulate General", address: "1st Floor, Prestige Nebula, 8-14, MG Road, Bengaluru - 560001", phone: "+91-80-4065-6565", email: "cgjbangalore@bg.mofa.go.jp", timings: "Mon-Fri 8:30 AM - 1:00 PM, 2:00 PM - 5:00 PM", website: "bangalore.in.emb-japan.go.jp", map: "Japan Consulate Bengaluru" },
      { city: "Chennai Consulate General", address: "12, No. 1, C.P. Ramaswamy Road, Alwarpet, Chennai - 600018", phone: "+91-44-2498-3100", email: "cgjchennai@ms.mofa.go.jp", timings: "Mon-Fri 8:30 AM - 1:00 PM, 2:00 PM - 5:00 PM", website: "chennai.in.emb-japan.go.jp", map: "Japan Consulate Chennai" },
      { city: "Kolkata Consulate General", address: "55, M.G. Road, Kolkata - 700009", phone: "+91-33-2281-3782", email: "ryoji.kolkata@cc.mofa.go.jp", timings: "Mon-Fri 9:00 AM - 1:00 PM, 2:00 PM - 5:00 PM", website: "kolkata.in.emb-japan.go.jp", map: "Japan Consulate Kolkata" }
    ],
    "AE": [
      { city: "New Delhi (UAE Embassy)", address: "EP-12, Chandragupta Marg, Chanakyapuri, New Delhi - 110021", phone: "+91-11-2419-7000", email: "newdelhiemb@mofaic.gov.ae", timings: "Mon-Fri 9:00 AM - 4:00 PM", website: "mofaic.gov.ae", map: "UAE Embassy New Delhi" },
      { city: "Mumbai Consulate General", address: "Consulate General of UAE, BKC, Mumbai - 400051", phone: "+91-22-6636-9500", email: "mumbaicg@mofaic.gov.ae", timings: "Mon-Fri 9:00 AM - 4:00 PM", website: "mofaic.gov.ae", map: "UAE Consulate Mumbai" },
      { city: "Thiruvananthapuram Consulate", address: "Manacaud, Thiruvananthapuram, Kerala - 695009", phone: "+91-471-338-8888", email: "tvmcon@mofaic.gov.ae", timings: "Mon-Fri 9:00 AM - 4:00 PM", website: "mofaic.gov.ae", map: "UAE Consulate Trivandrum" }
    ],
    "GB": [
      { city: "New Delhi (British High Commission)", address: "Shantipath, Chanakyapuri, New Delhi - 110021", phone: "+91-11-2419-2100", email: "web.newdelhi@fcdo.gov.uk", timings: "Mon-Fri 8:30 AM - 5:00 PM", website: "gov.uk/world/india", map: "British High Commission New Delhi" },
      { city: "Mumbai Deputy High Commission", address: "Naman Chambers, C-32, G-Block, BKC, Mumbai - 400051", phone: "+91-22-6650-2222", timings: "Mon-Fri 8:30 AM - 5:00 PM", website: "gov.uk/world/india" },
      { city: "Bengaluru Deputy High Commission", address: "Prestige TPT, 1, Infantry Rd, Bengaluru - 560001", phone: "+91-80-2210-0200", timings: "Mon-Fri 8:30 AM - 5:00 PM" },
      { city: "Chennai Deputy High Commission", address: "20, Ethiraj Salai, Egmore, Chennai - 600008", phone: "+91-44-4219-2151", timings: "Mon-Fri 8:30 AM - 5:00 PM" }
    ],
    "CA": [
      { city: "New Delhi (High Commission of Canada)", address: "7/8 Shantipath, Chanakyapuri, New Delhi - 110021", phone: "+91-11-4178-2000", email: "delhi-immigration@international.gc.ca", timings: "Mon-Fri 8:30 AM - 4:30 PM", website: "canada.ca/canada-and-india", map: "Canadian High Commission Delhi" },
      { city: "Chandigarh Consulate General", address: "Elante Offices, Industrial Area Phase 1, Chandigarh - 160002", phone: "+91-172-505-0300", timings: "Mon-Fri 8:30 AM - 4:30 PM" },
      { city: "Mumbai Consulate General", address: "Indiabulls Finance Centre, Senapati Bapat Marg, Mumbai - 400013", phone: "+91-22-6749-4444", timings: "Mon-Fri 8:30 AM - 4:30 PM" },
      { city: "Bengaluru Consulate General", address: "World Trade Center, Malleswaram, Bengaluru - 560055", phone: "+91-80-4924-7000", timings: "Mon-Fri 8:30 AM - 4:30 PM" }
    ],
    "DE": [
      { city: "New Delhi (Embassy of Germany)", address: "No. 6/50G, Shantipath, Chanakyapuri, New Delhi - 110021", phone: "+91-11-4901-9000", email: "info@new-delhi.diplo.de", timings: "Mon-Fri 8:00 AM - 3:30 PM", website: "india.diplo.de", map: "German Embassy New Delhi" },
      { city: "Mumbai Consulate General", address: "Hoechst House, Nariman Point, Mumbai - 400021", phone: "+91-22-6665-8300", email: "info@mumbai.diplo.de", timings: "Mon-Fri 8:00 AM - 3:30 PM" },
      { city: "Bengaluru Consulate General", address: "Cash Pharmacy Building, St. Marks Road, Bengaluru - 560001", phone: "+91-80-4530-0100", email: "info@bangalore.diplo.de" },
      { city: "Chennai Consulate General", address: "No. 9, Boat Club Road, Raja Annamalaipuram, Chennai - 600028", phone: "+91-44-2430-1600", email: "info@chennai.diplo.de" }
    ],
    "FR": [
      { city: "New Delhi (Embassy of France)", address: "2/50-E, Shantipath, Chanakyapuri, New Delhi - 110021", phone: "+91-11-4319-6100", email: "admin-francais.new-delhi-amba@diplomatie.gouv.fr", timings: "Mon-Fri 9:00 AM - 5:00 PM", website: "in.ambafrance.org", map: "French Embassy New Delhi" },
      { city: "Mumbai Consulate General", address: "Wockhardt Towers, BKC, Bandra East, Mumbai - 400051", phone: "+91-22-6669-4000" },
      { city: "Bengaluru Consulate General", address: "21, Palace Road, Vasanth Nagar, Bengaluru - 560052", phone: "+91-80-2214-1200" },
      { city: "Puducherry Consulate General", address: "2, Rue de la Marine, Puducherry - 605001", phone: "+91-413-226-1000" }
    ],
    "AU": [
      { city: "New Delhi (Australian High Commission)", address: "1/50G, Shantipath, Chanakyapuri, New Delhi - 110021", phone: "+91-11-4139-9900", email: "ahc.newdelhi@dfat.gov.au", timings: "Mon-Fri 8:30 AM - 5:00 PM", website: "india.highcommission.gov.au", map: "Australian High Commission New Delhi" },
      { city: "Mumbai Consulate General", address: "Crescenzo, 10th Floor, BKC, Mumbai - 400051", phone: "+91-22-6757-4900" },
      { city: "Chennai Consulate General", address: "9th Floor, Express Chambers, Royapettah, Chennai - 600014", phone: "+91-44-4592-1300" }
    ],
    "SG": [
      { city: "New Delhi (High Commission of Singapore)", address: "N-88, Panchsheel Park, New Delhi - 110017", phone: "+91-11-4600-0800", email: "singhc_del@mfa.sg", timings: "Mon-Fri 9:00 AM - 5:00 PM", website: "mfa.gov.sg/newdelhi", map: "Singapore High Commission New Delhi" },
      { city: "Mumbai Consulate General", address: "152, 15th Floor, Maker Chambers VI, Nariman Point, Mumbai - 400021", phone: "+91-22-2204-3205" },
      { city: "Chennai Consulate General", address: "17, A.A.I. Colony, Teynampet, Chennai - 600018", phone: "+91-44-2815-4371" }
    ]
  },

  // FROM = JAPAN (JP)
  "JP": {
    "IN": [
      { city: "Tokyo (Embassy of India Tokyo)", address: "2-2-11 Kudan-minami, Chiyoda-ku, Tokyo 102-0074", phone: "+81-3-3262-2391", email: "visa.tokyo@mea.gov.in", timings: "Mon-Fri 9:00 AM - 11:30 AM (Applications), 4:00 PM - 5:00 PM (Collection)", website: "indembassy-tokyo.gov.in", map: "Embassy of India Tokyo", lang: "ja" },
      { city: "Osaka (Consulate General of India Osaka-Kobe)", address: "Semba I.S. Building 10F, 1-9-26 Kyutaromachi, Chuo-ku, Osaka 541-0056", phone: "+81-6-6261-7299", email: "cg.osaka@mea.gov.in", timings: "Mon-Fri 9:00 AM - 11:30 AM", website: "cgiosaka.gov.in", map: "Indian Consulate Osaka", lang: "ja" }
    ],
    "US": [
      { city: "Tokyo (Embassy of the United States)", address: "1-10-5 Akasaka, Minato-ku, Tokyo 107-8420", phone: "+81-3-3224-5000", email: "support-japan@ustraveldocs.com", timings: "Mon-Fri 8:30 AM - 5:30 PM", website: "jp.usembassy.gov", map: "US Embassy Tokyo", lang: "ja" },
      { city: "Osaka-Kobe US Consulate General", address: "2-11-5 Nishitenma, Kita-ku, Osaka 530-8570", phone: "+81-6-6315-5900", website: "jp.usembassy.gov", map: "US Consulate Osaka", lang: "ja" },
      { city: "Nagoya US Consulate", address: "Nagoya International Center Bldg 6F, 1-47-1 Nagono, Nakamura-ku, Nagoya 450-0001", phone: "+81-52-581-4501", website: "jp.usembassy.gov", lang: "ja" },
      { city: "Fukuoka US Consulate", address: "2-5-26 Ohori, Chuo-ku, Fukuoka 810-0051", phone: "+81-92-751-9331", website: "jp.usembassy.gov", lang: "ja" },
      { city: "Sapporo US Consulate General", address: "Nishi 28-chome, Kita 1-jo, Chuo-ku, Sapporo 064-0821", phone: "+81-11-641-1115", website: "jp.usembassy.gov", lang: "ja" }
    ],
    "GB": [
      { city: "Tokyo (British Embassy)", address: "1 Ichiban-cho, Chiyoda-ku, Tokyo 102-8381", phone: "+81-3-5246-5000", website: "gov.uk/world/japan", map: "British Embassy Tokyo", lang: "ja" },
      { city: "Osaka (British Consulate-General)", address: "Midosuji Grand Tower 19F, 3-5-1 Bakuro-machi, Chuo-ku, Osaka 541-0059", phone: "+81-6-6120-5600", website: "gov.uk/world/japan", lang: "ja" }
    ],
    "CA": [
      { city: "Tokyo (Embassy of Canada)", address: "7-3-38 Akasaka, Minato-ku, Tokyo 107-8503", phone: "+81-3-5412-6200", website: "canadainternational.gc.ca/japan-japon", map: "Canadian Embassy Tokyo", lang: "ja" }
    ],
    "DE": [
      { city: "Tokyo (Embassy of the Federal Republic of Germany)", address: "4-5-10 Minami-Azabu, Minato-ku, Tokyo 106-0047", phone: "+81-3-5798-6000", website: "japan.diplo.de", map: "German Embassy Tokyo", lang: "ja" },
      { city: "Osaka German Consulate General", address: "Umeda Sky Building Tower East 35F, 1-1-88 Oyodonaka, Kita-ku, Osaka 531-6035", phone: "+81-6-6440-5070", lang: "ja" }
    ],
    "FR": [
      { city: "Tokyo (Embassy of France)", address: "4-11-44 Minami-Azabu, Minato-ku, Tokyo 106-8514", phone: "+81-3-5798-6000", website: "jp.ambafrance.org", map: "French Embassy Tokyo", lang: "ja" },
      { city: "Kyoto French Consulate General", address: "Yubinbango 606-8301 Kyoto Sakyo-ku, Yoshida Izumidono-cho 8", phone: "+81-75-761-2980", lang: "ja" }
    ],
    "AU": [
      { city: "Tokyo (Australian Embassy)", address: "2-1-14 Mita, Minato-ku, Tokyo 108-8309", phone: "+81-3-5232-4111", website: "japan.embassy.gov.au", map: "Australian Embassy Tokyo", lang: "ja" },
      { city: "Osaka Australian Consulate General", address: "Twin 21 MID Tower 16F, 2-1-61 Shiromi, Chuo-ku, Osaka 540-6116", phone: "+81-6-6941-9271", lang: "ja" }
    ]
  },

  // FROM = UNITED STATES (US)
  "US": {
    "IN": [
      { city: "Washington D.C. (Embassy of India)", address: "2107 Massachusetts Ave NW, Washington, DC 20008", phone: "+1-202-939-7000", email: "cons1.washington@mea.gov.in", website: "indianembassyusa.gov.in", map: "Embassy of India Washington DC" },
      { city: "New York Consulate General", address: "3 East 64th Street, New York, NY 10065", phone: "+1-212-774-0600", email: "visa.newyork@mea.gov.in", website: "indiainnewyork.gov.in" },
      { city: "San Francisco Consulate General", address: "540 Arguello Blvd, San Francisco, CA 94118", phone: "+1-415-668-0668", email: "visa.sf@mea.gov.in", website: "cgisf.gov.in" },
      { city: "Chicago Consulate General", address: "455 N Cityfront Plaza Dr, Suite 850, Chicago, IL 60611", phone: "+1-312-595-0405", email: "visa.chicago@mea.gov.in", website: "cgichicago.gov.in" },
      { city: "Houston Consulate General", address: "4300 Scotland St, Houston, TX 70707", phone: "+1-713-626-2148", email: "visa.houston@mea.gov.in", website: "cgihouston.gov.in" },
      { city: "Atlanta Consulate General", address: "5540 Glenridge Connector, Atlanta, GA 30342", phone: "+1-404-963-7037", email: "visa.atlanta@mea.gov.in", website: "indiaatlanta.gov.in" }
    ],
    "JP": [
      { city: "Washington D.C. (Embassy of Japan)", address: "2520 Massachusetts Ave NW, Washington, DC 20008", phone: "+1-202-238-6700", website: "us.emb-japan.go.jp", map: "Embassy of Japan Washington" },
      { city: "New York Consulate General", address: "299 Park Ave, 28th Floor, New York, NY 10171", phone: "+1-212-371-8222" },
      { city: "San Francisco Consulate General", address: "275 Battery St, Suite 2100, San Francisco, CA 94111", phone: "+1-415-777-3533" },
      { city: "Los Angeles Consulate General", address: "350 S Grand Ave, Suite 1700, Los Angeles, CA 90071", phone: "+1-213-617-6700" }
    ],
    "GB": [
      { city: "Washington D.C. (British Embassy)", address: "3100 Massachusetts Ave NW, Washington, DC 20008", phone: "+1-202-588-6500", website: "gov.uk/world/usa", map: "British Embassy Washington" },
      { city: "New York Consulate General", address: "885 Second Ave, 11th Floor, New York, NY 10017", phone: "+1-212-745-0200" },
      { city: "Chicago Consulate General", address: "625 N Michigan Ave, Suite 2200, Chicago, IL 60611", phone: "+1-312-970-3800" },
      { city: "San Francisco Consulate General", address: "1 Sansome St, Suite 850, San Francisco, CA 94104", phone: "+1-415-617-1300" }
    ],
    "DE": [
      { city: "Washington D.C. (Embassy of Germany)", address: "4645 Reservoir Rd NW, Washington, DC 20007", phone: "+1-202-298-4000", website: "germany.info", map: "German Embassy Washington" },
      { city: "New York Consulate General", address: "871 United Nations Plaza, New York, NY 10017", phone: "+1-212-610-9700" },
      { city: "Los Angeles Consulate General", address: "6222 Wilshire Blvd, Suite 500, Los Angeles, CA 90048", phone: "+1-323-930-2703" }
    ]
  },

  // FROM = GERMANY (DE)
  "DE": {
    "IN": [
      { city: "Berlin (Embassy of India Berlin)", address: "Tiergartenstraße 17, 10785 Berlin", phone: "+49-30-257950", email: "cons.berlin@mea.gov.in", website: "indianembassyberlin.gov.de", map: "Indian Embassy Berlin", lang: "de" },
      { city: "Frankfurt Consulate General", address: "Friedrich-Ebert-Anlage 26, 60325 Frankfurt am Main", phone: "+49-69-1530050", email: "visa.frankfurt@mea.gov.in", lang: "de" },
      { city: "Munich Consulate General", address: "Widenmayerstraße 15, 80538 München", phone: "+49-89-2102390", email: "visa.munich@mea.gov.in", lang: "de" },
      { city: "Hamburg Consulate General", address: "Kohlhöfen 21, 20355 Hamburg", phone: "+49-40-338071", email: "visa.hamburg@mea.gov.in", lang: "de" }
    ],
    "US": [
      { city: "Berlin (US Embassy Berlin)", address: "Pariser Platz 2, 10117 Berlin", phone: "+49-30-8305-0", email: "support-germany@ustraveldocs.com", website: "de.usembassy.gov", map: "US Embassy Berlin", lang: "de" },
      { city: "Frankfurt US Consulate General", address: "Gießener Str. 30, 60435 Frankfurt am Main", phone: "+49-69-7535-0", lang: "de" },
      { city: "Munich US Consulate General", address: "Königinstraße 5, 80539 München", phone: "+49-89-2888-0", lang: "de" }
    ],
    "JP": [
      { city: "Berlin (Embassy of Japan)", address: "Hiroshimastraße 6, 10785 Berlin", phone: "+49-30-210940", website: "de.emb-japan.go.jp", map: "Japan Embassy Berlin", lang: "de" },
      { city: "Düsseldorf Consulate General", address: "Breite Straße 27, 40213 Düsseldorf", phone: "+49-211-164820", lang: "de" },
      { city: "Munich Consulate General", address: "Pettenkoferstraße 42, 80336 München", phone: "+49-89-517000", lang: "de" },
      { city: "Frankfurt Consulate General", address: "MesseTurm, Friedrich-Ebert-Anlage 49, 60327 Frankfurt am Main", phone: "+49-69-2385730", lang: "de" }
    ]
  },

  // FROM = FRANCE (FR)
  "FR": {
    "IN": [
      { city: "Paris (Embassy of India Paris)", address: "15 Rue Alfred Dehodencq, 75016 Paris", phone: "+33-1-40507070", email: "cons.paris@mea.gov.in", website: "eoiparis.gov.in", map: "Indian Embassy Paris", lang: "fr" }
    ],
    "US": [
      { city: "Paris (US Embassy Paris)", address: "2 Avenue Gabriel, 75008 Paris", phone: "+33-1-4312-2222", email: "support-france@ustraveldocs.com", website: "fr.usembassy.gov", map: "US Embassy Paris", lang: "fr" },
      { city: "Marseille US Consulate General", address: "Place Varian Fry, 13006 Marseille", phone: "+33-1-4312-4700", lang: "fr" },
      { city: "Strasbourg US Consulate General", address: "15 Avenue d'Alsace, 67000 Strasbourg", phone: "+33-3-8835-3104", lang: "fr" }
    ],
    "CA": [
      { city: "Paris (Embassy of Canada)", address: "130 Rue du Faubourg Saint-Honoré, 75008 Paris", phone: "+33-1-4443-2900", website: "canadainternational.gc.ca/france", map: "Canadian Embassy Paris", lang: "fr" }
    ]
  },

  // FROM = UNITED ARAB EMIRATES (AE)
  "AE": {
    "IN": [
      { city: "Abu Dhabi (Embassy of India)", address: "Plot No. 10, Sector W-59/02, Diplomatic Area, Off Airport Road, Abu Dhabi", phone: "+971-2-4492700", email: "cons.abudhabi@mea.gov.in", website: "indembassyuae.gov.in", map: "Indian Embassy Abu Dhabi" },
      { city: "Dubai Consulate General", address: "Al Hamriya, Diplomatic Enclave, Bur Dubai, Dubai", phone: "+971-4-3971222", email: "cons.dubai@mea.gov.in", website: "cgidubai.gov.in" }
    ],
    "US": [
      { city: "Abu Dhabi (US Embassy)", address: "Embassies District, Plot 38, Sector W59-02, Abu Dhabi", phone: "+971-2-414-2200", website: "ae.usembassy.gov", map: "US Embassy Abu Dhabi" },
      { city: "Dubai US Consulate General", address: "Corner of Al Seef Rd and Sheikh Khalifa bin Zayed Rd, Bur Dubai", phone: "+971-4-309-4000", website: "ae.usembassy.gov" }
    ],
    "GB": [
      { city: "Abu Dhabi (British Embassy)", address: "Khalid bin Al Waleed St, Al Khubeirah, Abu Dhabi", phone: "+971-2-610-1100", website: "gov.uk/world/united-arab-emirates", map: "British Embassy Abu Dhabi" },
      { city: "Dubai British Embassy", address: "Al Seef Rd, Bur Dubai", phone: "+971-4-309-4444" }
    ]
  },

  // FROM = UNITED KINGDOM (GB)
  "GB": {
    "IN": [
      { city: "London (High Commission of India)", address: "India House, Aldwych, London WC2B 4NA", phone: "+44-20-7836-9147", email: "inf.london@mea.gov.in", website: "hcilondon.gov.in", map: "India House London" },
      { city: "Birmingham Consulate General", address: "20 Augusta St, Jewellery Quarter, Birmingham B18 6JL", phone: "+44-121-212-2788" },
      { city: "Edinburgh Consulate General", address: "17 Rutland Square, Edinburgh EH1 2BB", phone: "+44-131-229-2144" }
    ],
    "US": [
      { city: "London (US Embassy London)", address: "33 Nine Elms Ln, London SW11 7US", phone: "+44-20-7499-9000", website: "uk.usembassy.gov", map: "US Embassy London" },
      { city: "Belfast US Consulate General", address: "Danesfort House, 223 Stranmillis Rd, Belfast BT9 5GR", phone: "+44-28-9038-6100" },
      { city: "Edinburgh US Consulate General", address: "3 Regent Terrace, Edinburgh EH7 5BW", phone: "+44-131-556-8315" }
    ]
  },

  // FROM = CANADA (CA)
  "CA": {
    "IN": [
      { city: "Ottawa (High Commission of India)", address: "10 Springfield Rd, Ottawa, ON K1M C9", phone: "+1-613-744-3751", email: "cons.ottawa@mea.gov.in", website: "hciottawa.gov.in", map: "Indian High Commission Ottawa" },
      { city: "Toronto Consulate General", address: "365 Bloor St E, Suite 700, Toronto, ON M4W 3L4", phone: "+1-416-960-0751" },
      { city: "Vancouver Consulate General", address: "201-325 Howe St, Vancouver, BC V6C Z7", phone: "+1-604-662-8811" }
    ],
    "US": [
      { city: "Ottawa (US Embassy Ottawa)", address: "490 Sussex Dr, Ottawa, ON K1N 1G8", phone: "+1-613-688-5335", website: "ca.usembassy.gov", map: "US Embassy Ottawa" },
      { city: "Toronto US Consulate General", address: "360 University Ave, Toronto, ON M5G 1S4", phone: "+1-416-595-1700" },
      { city: "Vancouver US Consulate General", address: "1075 W Pender St, Vancouver, BC V6E 2M6", phone: "+1-604-685-4311" },
      { city: "Montreal US Consulate General", address: "1155 Saint-Alexandre St, Montreal, QC H3B 1Z1", phone: "+1-514-398-9695" }
    ]
  },

  // FROM = AUSTRALIA (AU)
  "AU": {
    "IN": [
      { city: "Canberra (High Commission of India)", address: "3-5 Moonah Pl, Yarralumla ACT 2600", phone: "+61-2-6273-3999", email: "hc.canberra@mea.gov.in", website: "hcicanberra.gov.in", map: "Indian High Commission Canberra" },
      { city: "Sydney Consulate General", address: "Level 1, 265 Castlereagh St, Sydney NSW 2000", phone: "+61-2-9223-2702" },
      { city: "Melbourne Consulate General", address: "344 St Kilda Rd, Melbourne VIC 3004", phone: "+61-3-9384-0141" },
      { city: "Perth Consulate General", address: "Level 6, 12 St Georges Terrace, Perth WA 6000", phone: "+61-8-9221-1206" }
    ],
    "US": [
      { city: "Canberra (US Embassy Canberra)", address: "Moonah Pl, Yarralumla ACT 2600", phone: "+61-2-6214-5600", website: "au.usembassy.gov", map: "US Embassy Canberra" },
      { city: "Sydney US Consulate General", address: "Suite 2, Level 16, 19-29 Martin Pl, Sydney NSW 2000", phone: "+61-2-8219-2100" },
      { city: "Melbourne US Consulate General", address: "553 St Kilda Rd, Melbourne VIC 3004", phone: "+61-3-9526-5900" },
      { city: "Perth US Consulate General", address: "4th Floor, 16 St Georges Terrace, Perth WA 6000", phone: "+61-8-9202-0100" }
    ]
  }
};
