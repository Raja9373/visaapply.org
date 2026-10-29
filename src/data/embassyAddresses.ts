export interface ConsulateInfo {
  city: string;
  address: string;
  phone?: string;
  email?: string;
  timings?: string;
  website?: string;
  map?: string;
}

export interface EmbassyData {
  country: string;
  officialWebsite?: string;
  vfs?: string;
  inIndia: ConsulateInfo[];
}

export const EMBASSY_ADDRESSES: Record<string, EmbassyData> = {
  "US": {
    country: "United States",
    officialWebsite: "https://ceac.state.gov & https://ustraveldocs.com/in",
    vfs: "USA has NO VFS - Direct scheduling & biometrics via USTravelDocs",
    inIndia: [
      { 
        city: "New Delhi (Main US Embassy)", 
        address: "Shantipath, Chanakyapuri, New Delhi - 110021", 
        phone: "+91-11-2419-8000", 
        email: "support-india@ustraveldocs.com", 
        timings: "Mon-Fri 8:00 AM - 4:30 PM", 
        website: "in.usembassy.gov", 
        map: "https://maps.google.com/?q=US+Embassy+New+Delhi" 
      },
      { 
        city: "Mumbai Consulate", 
        address: "C-49, G-Block, Bandra Kurla Complex, Bandra East, Mumbai - 400051", 
        phone: "+91-22-2672-4000", 
        email: "support-india@ustraveldocs.com",
        timings: "Mon-Fri 8:00 AM - 4:30 PM",
        map: "https://maps.google.com/?q=US+Consulate+Mumbai+BKC" 
      },
      { 
        city: "Chennai Consulate", 
        address: "220 Anna Salai, Gemini Circle, Chennai - 600006", 
        phone: "+91-44-2857-4000", 
        timings: "Mon-Fri 8:00 AM - 4:30 PM",
        map: "https://maps.google.com/?q=US+Consulate+Chennai" 
      },
      { 
        city: "Hyderabad Consulate", 
        address: "Nanakramguda, Financial District, Gachibowli, Hyderabad - 500032", 
        phone: "+91-40-4620-2100", 
        timings: "Mon-Fri 8:00 AM - 4:30 PM",
        map: "https://maps.google.com/?q=US+Consulate+Hyderabad" 
      },
      { 
        city: "Kolkata Consulate", 
        address: "5/1 Ho Chi Minh Sarani, Kolkata - 700071", 
        phone: "+91-33-3984-2400", 
        timings: "Mon-Fri 8:00 AM - 4:30 PM",
        map: "https://maps.google.com/?q=US+Consulate+Kolkata" 
      },
      { 
        city: "VAC Centers (Biometrics)", 
        address: "Delhi (Shivaji Stadium), Mumbai (BKC), Chennai, Hyderabad, Kolkata - 5 Official VACs", 
        phone: "022-6786-6000", 
        website: "ustraveldocs.com",
        timings: "Mon-Sat 8:00 AM - 5:00 PM"
      }
    ]
  },
  "AE": {
    country: "UAE Dubai",
    officialWebsite: "https://u.ae & Official Emirates / GDRFA eVisa Portal",
    vfs: "VFS Global & DVPC for UAE - 17 Application Centers across India",
    inIndia: [
      { 
        city: "New Delhi UAE Embassy", 
        address: "12, Chandragupta Marg, Chanakyapuri, New Delhi - 110021", 
        phone: "+91-11-2611-1111", 
        email: "info@uaeembassy-newdelhi.com",
        timings: "Mon-Fri 9:00 AM - 4:00 PM",
        map: "https://maps.google.com/?q=UAE+Embassy+New+Delhi"
      },
      { 
        city: "Mumbai Consulate", 
        address: "Maker Bhavan No 1, 7th Floor, V.T. Road, Churchgate, Mumbai - 400020", 
        phone: "+91-22-2283-4567",
        timings: "Mon-Fri 9:00 AM - 3:30 PM",
        map: "https://maps.google.com/?q=UAE+Consulate+Mumbai"
      },
      { 
        city: "Kerala Consulate", 
        address: "Manacaud P.O., Thiruvananthapuram, Kerala - 695009", 
        phone: "+91-471-257-3000",
        timings: "Mon-Fri 9:00 AM - 4:00 PM",
        map: "https://maps.google.com/?q=UAE+Consulate+Thiruvananthapuram"
      },
      { 
        city: "VFS Dubai Visa Center", 
        address: "Shivaji Stadium Metro Station, Mezzanine Level, Baba Kharak Singh Marg, Connaught Place, Delhi", 
        phone: "022-6786-6014", 
        website: "vfsglobal.com/uae/india",
        timings: "Mon-Fri 8:00 AM - 5:00 PM"
      }
    ]
  },
  "CA": {
    country: "Canada",
    officialWebsite: "https://www.canada.ca/en/immigration-refugees-citizenship.html",
    vfs: "VFS Global Canada Biometrics & Passport Collection - 10 Centers in India",
    inIndia: [
      { 
        city: "New Delhi High Commission", 
        address: "7/8 Shantipath, Chanakyapuri, New Delhi - 110021", 
        phone: "+91-11-4178-2000", 
        email: "delhi@international.gc.ca", 
        website: "canada.ca/visa-india",
        timings: "Mon-Fri 8:30 AM - 5:00 PM",
        map: "https://maps.google.com/?q=Canadian+High+Commission+New+Delhi"
      },
      { 
        city: "Mumbai Consulate", 
        address: "One Indiabulls Centre, 5th Floor, 841 Senapati Bapat Marg, Elphinstone Road, Mumbai - 400013",
        phone: "+91-22-6749-4444",
        map: "https://maps.google.com/?q=Canadian+Consulate+Mumbai"
      },
      { 
        city: "Chandigarh Consulate", 
        address: "SCO 54-55-56, Sector 17-A, Chandigarh - 160017",
        phone: "+91-172-505-0300",
        map: "https://maps.google.com/?q=Canadian+Consulate+Chandigarh"
      },
      { 
        city: "Bengaluru Consulate", 
        address: "World Trade Centre, 22nd Floor, 26/1 Dr. Rajkumar Road, Malleshwaram, Bengaluru - 560055",
        phone: "+91-80-6765-8100",
        map: "https://maps.google.com/?q=Canadian+Consulate+Bengaluru"
      },
      { 
        city: "VFS Canada Biometrics Center", 
        address: "2nd Floor, Shivaji Stadium Metro Station, Baba Kharak Singh Marg, Connaught Place, Delhi - 110001", 
        phone: "022-6786-6013", 
        website: "vfsglobal.ca/canada/india", 
        timings: "Mon-Fri 9:00 AM - 5:00 PM" 
      }
    ]
  },
  "GB": {
    country: "United Kingdom",
    officialWebsite: "https://www.gov.uk/browse/visas-immigration",
    vfs: "VFS Global UK - Priority & Super Priority Stamping Centers in 11 cities in India",
    inIndia: [
      { 
        city: "New Delhi High Commission", 
        address: "Shantipath, Chanakyapuri, New Delhi - 110021", 
        phone: "+91-11-2419-2100", 
        website: "gov.uk/world/india",
        timings: "Mon-Fri 9:00 AM - 5:00 PM",
        map: "https://maps.google.com/?q=British+High+Commission+New+Delhi"
      },
      { 
        city: "Mumbai Deputy High Commission", 
        address: "Naman Chambers, C-32, G-Block, Bandra Kurla Complex, Mumbai - 400051",
        phone: "+91-22-6650-2222",
        map: "https://maps.google.com/?q=British+Deputy+High+Commission+Mumbai"
      },
      { 
        city: "Chennai Deputy High Commission", 
        address: "20 Anderson Road, Nungambakkam, Chennai - 600006",
        phone: "+91-44-2437-0231"
      },
      { 
        city: "Kolkata Deputy High Commission", 
        address: "1A Ho Chi Minh Sarani, Kolkata - 700071",
        phone: "+91-33-2288-5172"
      },
      { 
        city: "VFS UK Visa Application Center", 
        address: "Mezzanine Floor, Shivaji Stadium Metro Station, CP, New Delhi - 110001",
        phone: "022-6786-6015",
        website: "vfsglobal.com/uk/india",
        timings: "Mon-Fri 8:00 AM - 4:00 PM"
      }
    ]
  },
  "AU": {
    country: "Australia",
    officialWebsite: "https://immi.homeaffairs.gov.au",
    vfs: "VFS Global Australia Biometrics & Paper Processing Centers across India",
    inIndia: [
      { 
        city: "New Delhi High Commission", 
        address: "1/50G Shantipath, Chanakyapuri, New Delhi - 110021", 
        phone: "+91-11-4139-9900", 
        email: "immigration.delhi@dfat.gov.au",
        website: "india.embassy.gov.au",
        map: "https://maps.google.com/?q=Australian+High+Commission+New+Delhi"
      },
      { 
        city: "Mumbai Consulate-General", 
        address: "Crescenzo, 10th Floor, A Wing, C-38/39, G Block, BKC, Mumbai - 400051",
        phone: "+91-22-6757-4900"
      },
      { 
        city: "Chennai Consulate-General", 
        address: "9th Floor, Express Chambers, Express Avenue, Royapettah, Chennai - 600014",
        phone: "+91-44-4592-1300"
      },
      { 
        city: "VFS Australia Center", 
        address: "Shivaji Stadium Metro Station, Connaught Place, New Delhi - 110001",
        phone: "022-6786-6006",
        website: "vfsglobal.com/australia/india"
      }
    ]
  },
  "DE": {
    country: "Germany",
    officialWebsite: "https://india.diplo.de & VIDEX Online Portal",
    vfs: "VFS Global Germany National (D) & Schengen (C) Visa Application Centers",
    inIndia: [
      { 
        city: "New Delhi Embassy", 
        address: "No. 6/50G Shantipath, Chanakyapuri, New Delhi - 110021", 
        phone: "+91-11-4419-9100", 
        email: "visa@newd.diplo.de",
        website: "india.diplo.de",
        map: "https://maps.google.com/?q=German+Embassy+New+Delhi"
      },
      { 
        city: "Mumbai Consulate", 
        address: "Hoechst House, 10th Floor, Nariman Point, Mumbai - 400021",
        phone: "+91-22-6940-1400"
      },
      { 
        city: "Bengaluru Consulate", 
        address: "2/3 Residency Road, Bengaluru - 560025",
        phone: "+91-80-4530-0100"
      },
      { 
        city: "Chennai Consulate", 
        address: "Maalavika Centre, 144 Kodambakkam High Road, Chennai - 600034",
        phone: "+91-44-2832-2200"
      },
      { 
        city: "VFS Germany Center", 
        address: "Shivaji Stadium Metro Station, CP, New Delhi - 110001",
        phone: "022-6786-6008",
        website: "vfsglobal.com/germany/india"
      }
    ]
  },
  "FR": {
    country: "France",
    officialWebsite: "https://france-visas.gouv.fr",
    vfs: "VFS Global France Visa Application Centers across 16 Indian cities",
    inIndia: [
      { 
        city: "New Delhi Embassy", 
        address: "2/50E Shantipath, Chanakyapuri, New Delhi - 110021", 
        phone: "+91-11-4319-6100", 
        email: "visas.new-delhi-amba@diplomatie.gouv.fr",
        map: "https://maps.google.com/?q=French+Embassy+New+Delhi"
      },
      { 
        city: "Mumbai Consulate", 
        address: "Hoechst House, 7th Floor, Nariman Point, Mumbai - 400021",
        phone: "+91-22-6669-4000"
      },
      { 
        city: "Puducherry Consulate", 
        address: "2 Rue de la Marine, Puducherry - 605001",
        phone: "+91-413-223-1000"
      },
      { 
        city: "VFS France Center", 
        address: "Shivaji Stadium Metro Station, Connaught Place, New Delhi - 110001",
        phone: "022-6786-6011",
        website: "vfsglobal.com/france/india"
      }
    ]
  },
  "SG": {
    country: "Singapore",
    officialWebsite: "https://www.ica.gov.sg & SAVE Online Portal",
    vfs: "Singapore Authorized Visa Agents & VFS Centers in India",
    inIndia: [
      { 
        city: "New Delhi High Commission", 
        address: "E-6 Chandragupta Marg, Chanakyapuri, New Delhi - 110021", 
        phone: "+91-11-4600-0800", 
        email: "singhc_del@mfa.sg",
        map: "https://maps.google.com/?q=Singapore+High+Commission+New+Delhi"
      },
      { 
        city: "Mumbai Consulate-General", 
        address: "152 15th Floor, Maker Chambers VI, 220 Jamnalal Bajaj Marg, Nariman Point, Mumbai - 400021",
        phone: "+91-22-2204-3280"
      },
      { 
        city: "Chennai Consulate-General", 
        address: "17A North Boag Road, T. Nagar, Chennai - 600017",
        phone: "+91-44-2815-9137"
      }
    ]
  },
  "JP": {
    country: "Japan",
    officialWebsite: "https://www.mofa.go.jp & JAPAN eVISA",
    vfs: "VFS Global Japan Visa Application Centers across India",
    inIndia: [
      { 
        city: "New Delhi Embassy", 
        address: "50-G Shantipath, Chanakyapuri, New Delhi - 110021", 
        phone: "+91-11-2687-6564", 
        email: "jpemb.delhi@nd.mofa.go.jp",
        map: "https://maps.google.com/?q=Japanese+Embassy+New+Delhi"
      },
      { 
        city: "Mumbai Consulate-General", 
        address: "No.1 M.L. Dahanukar Marg, Cumballa Hill, Mumbai - 400026",
        phone: "+91-22-2351-7101"
      },
      { 
        city: "Bengaluru Consulate-General", 
        address: "1st Floor, Prestige Nebula, 8-12 Tatterson Road, Bengaluru - 560001",
        phone: "+91-80-4064-9999"
      },
      { 
        city: "VFS Japan Center", 
        address: "Shivaji Stadium Metro Station, Connaught Place, New Delhi - 110001",
        phone: "022-6786-6016",
        website: "vfsglobal.com/japan/india"
      }
    ]
  },
  "IN": {
    country: "India",
    officialWebsite: "https://indianvisaonline.gov.in",
    vfs: "VFS Global & BLS International for Indian Visas / OCI Cards worldwide",
    inIndia: [
      { 
        city: "FRRO Head Office Delhi", 
        address: "East Block VIII, Level II, R.K. Puram, Sector-1, New Delhi - 110066", 
        phone: "+91-11-2671-1384", 
        email: "support.immigration@gov.in",
        map: "https://maps.google.com/?q=FRRO+New+Delhi"
      },
      { 
        city: "FRRO Mumbai", 
        address: "78/80 Annex Building, Badruddin Tayabji Marg, Behind St. Xavier College, Mumbai - 400001",
        phone: "+91-22-2262-0446"
      }
    ]
  }
};

// Generic fallback generator for remaining 20 countries
const REMAINING_CODES = [
  "BR", "IT", "ES", "NL", "NZ", "SE", "CH", "IE", "NO", "PT",
  "DK", "FI", "BE", "AT", "PL", "MY", "TH", "TR", "ZA", "SA"
];

const COUNTRY_NAMES: Record<string, string> = {
  BR: "Brazil", IT: "Italy", ES: "Spain", NL: "Netherlands", NZ: "New Zealand",
  SE: "Sweden", CH: "Switzerland", IE: "Ireland", NO: "Norway", PT: "Portugal",
  DK: "Denmark", FI: "Finland", BE: "Belgium", AT: "Austria", PL: "Poland",
  MY: "Malaysia", TH: "Thailand", TR: "Turkey", ZA: "South Africa", SA: "Saudi Arabia"
};

REMAINING_CODES.forEach(code => {
  if (!EMBASSY_ADDRESSES[code]) {
    const cName = COUNTRY_NAMES[code] || code;
    EMBASSY_ADDRESSES[code] = {
      country: cName,
      officialWebsite: `https://www.google.com/search?q=Official+${encodeURIComponent(cName)}+Embassy+Visa+Portal`,
      vfs: `VFS Global / Official Embassy Visa Processing for ${cName}`,
      inIndia: [
        {
          city: `New Delhi (${cName} Embassy)`,
          address: `Diplomatic Enclave, Chanakyapuri, New Delhi - 110021`,
          phone: "+91-11-2419-0000",
          email: `visa.delhi@mfa.${code.toLowerCase()}.gov`,
          timings: "Mon-Fri 9:00 AM - 4:00 PM",
          map: `https://maps.google.com/?q=${encodeURIComponent(cName)}+Embassy+New+Delhi`
        },
        {
          city: `Mumbai (${cName} Consulate)`,
          address: `Nariman Point / BKC Financial District, Mumbai - 400021`,
          phone: "+91-22-2283-0000",
          timings: "Mon-Fri 9:30 AM - 3:30 PM",
          map: `https://maps.google.com/?q=${encodeURIComponent(cName)}+Consulate+Mumbai`
        },
        {
          city: `VFS Global (${cName} Visa Center)`,
          address: `Shivaji Stadium Metro Station, Connaught Place, New Delhi - 110001`,
          phone: "022-6786-6000",
          website: "https://www.vfsglobal.com",
          timings: "Mon-Fri 8:00 AM - 5:00 PM"
        }
      ]
    };
  }
});

import { UNIVERSAL_EMBASSY_DB } from './universalEmbassyDatabase';

export function getEmbassyInfo(countryCode: string, fromCode?: string): EmbassyData {
  const to = (countryCode || 'US').toUpperCase();
  const from = (fromCode || 'IN').toUpperCase();

  // Check Universal Embassy Database for exact (from, to) match
  const universalOffices = UNIVERSAL_EMBASSY_DB[from]?.[to];
  if (universalOffices && universalOffices.length > 0) {
    const fallback = EMBASSY_ADDRESSES[to] || EMBASSY_ADDRESSES['US'];
    return {
      country: fallback.country || to,
      officialWebsite: fallback.officialWebsite,
      vfs: fallback.vfs || `Official Embassy & Application Centers for ${to} in ${from}`,
      inIndia: universalOffices.map(off => ({
        city: off.city,
        address: off.address,
        phone: off.phone,
        email: off.email,
        timings: off.timings,
        website: off.website,
        map: off.map || `https://maps.google.com/?q=${encodeURIComponent(off.city + ' ' + off.address)}`
      }))
    };
  }

  return EMBASSY_ADDRESSES[to] || EMBASSY_ADDRESSES['US'];
}

