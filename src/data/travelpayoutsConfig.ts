import { COUNTRY_META_249, getCountryMeta } from './countryMetaData';
import { NAME_MAP_249 } from './fullVisaDatabase';

export const TRAVELPAYOUTS_CONFIG = {
  id: '801550',
  marker: '801550', // Your Travelpayouts marker
  bookingComAid: '8119919', // Booking.com Impact ID
  skyscannerId: '8131850', // Skyscanner Impact ID - In Review
  skyscannerEnabled: false, // Will be true when Impact shows Approved
  travelpayoutsEnabled: true, // Now approved - true
};

// Primary international airport / city IATA codes for accurate Aviasales & Skyscanner route searches
export const AIRPORT_IATA_MAP: Record<string, string> = {
  us: 'NYC',
  ca: 'YYZ',
  gb: 'LON',
  au: 'SYD',
  ae: 'DXB',
  de: 'FRA',
  sg: 'SIN',
  th: 'BKK',
  jp: 'TYO',
  in: 'DEL',
  fr: 'PAR',
  it: 'ROM',
  es: 'MAD',
  nl: 'AMS',
  ch: 'ZRH',
  nz: 'AKL',
  br: 'GRU',
  mx: 'MEX',
  kr: 'SEL',
  cn: 'BJS',
  vn: 'HAN',
  my: 'KUL',
  id: 'DPS',
  ph: 'MNL',
  za: 'JNB',
  tr: 'IST',
  sa: 'RUH',
  qa: 'DOH',
  ie: 'DUB',
  se: 'STO',
  no: 'OSL',
  pt: 'LIS',
  dk: 'CPH',
  fi: 'HEL',
  be: 'BRU',
  at: 'VIE',
  pl: 'WAW',
  hk: 'HKG',
  tw: 'TPE',
  kh: 'PNH',
  la: 'VTE',
  mm: 'RGN',
  bn: 'BWN',
  pk: 'KHI',
  bd: 'DAC',
  lk: 'CMB',
  np: 'KTM',
  mn: 'ULN',
  kz: 'ALA',
  om: 'MCT',
  kw: 'KWI',
  bh: 'BAH',
  jo: 'AMM',
  lb: 'BEY',
  eg: 'CAI',
  ma: 'CMN',
  ke: 'NBO',
  ng: 'LOS',
  gh: 'ACC',
  et: 'ADD',
  tz: 'DAR',
  ug: 'EBB',
  rw: 'KGL',
  mu: 'MRU',
  ar: 'BUE',
  cl: 'SCL',
  co: 'BOG',
  pe: 'LIM',
  uy: 'MVD',
  pa: 'PTY',
  cr: 'SJO',
  do: 'SDQ',
  jm: 'KIN',
  is: 'REK',
  lu: 'LUX',
  cz: 'PRG',
  hu: 'BUD',
  gr: 'ATH',
  hr: 'ZAG',
  ro: 'BUH',
  ua: 'IEV',
  cy: 'LCA',
  mt: 'MLA',
  uz: 'TAS',
  az: 'BAK',
  bt: 'PBH',
  mv: 'MLE',
  sc: 'SEZ',
  fj: 'NAN',
  bw: 'GBE',
  zm: 'LUN',
  zw: 'HRE',
  na: 'WDH',
  mz: 'MPM',
  tn: 'TUN',
  il: 'TLV',
  ge: 'TBS',
  am: 'EVN',
  al: 'TIA',
  bg: 'SOF',
  rs: 'BEG',
  sk: 'BTS',
  si: 'LJU',
  ee: 'TLL',
  lv: 'RIX',
  lt: 'VNO',
};

export interface FlightLinkInfo {
  price: string;
  priceINR: string;
  route: string;
  iata: string;
  tpLink: string;
  aviasalesLink: string;
  skyscannerLink: string;
}

const CUSTOM_INR_PRICES: Record<string, string> = {
  us: '₹45,200',
  ca: '₹52,400',
  gb: '₹38,900',
  au: '₹44,500',
  ae: '₹14,800',
  de: '₹36,500',
  sg: '₹15,900',
  th: '₹12,400',
  jp: '₹34,800',
  fr: '₹37,200',
  it: '₹36,900',
  es: '₹39,400',
  nl: '₹38,100',
  ch: '₹41,200',
  nz: '₹54,600',
  my: '₹13,200',
  id: '₹18,500',
  vn: '₹14,200',
  mv: '₹16,400',
  lk: '₹11,800',
  np: '₹7,900',
  om: '₹13,900',
  qa: '₹16,800',
  sa: '₹17,500',
};

function convertFlightPriceToINR(rawPrice: string, code: string): string {
  const lower = code.toLowerCase();
  if (CUSTOM_INR_PRICES[lower]) return CUSTOM_INR_PRICES[lower];
  const match = (rawPrice || '').match(/(\d+)/);
  if (!match) return '₹32,500';
  const usd = parseInt(match[1], 10);
  const inr = Math.round((usd * 84) / 100) * 100;
  return `₹${inr.toLocaleString('en-IN')}`;
}

export const FLIGHT_LINKS_249: Record<string, FlightLinkInfo> = (() => {
  const map: Record<string, FlightLinkInfo> = {};
  const allCodes = Array.from(
    new Set([...Object.keys(NAME_MAP_249), ...Object.keys(COUNTRY_META_249)])
  );

  for (const rawCode of allCodes) {
    const code = rawCode.toLowerCase();
    const meta = getCountryMeta(code);
    const countryName = NAME_MAP_249[code] || code.toUpperCase();
    const countrySlug = countryName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const iata = AIRPORT_IATA_MAP[code] || code.toUpperCase();
    const route = `DEL→${iata}`;
    const priceINR = convertFlightPriceToINR(meta.flightPrice, code);
    const aviasalesLink = `https://www.aviasales.com/search/DEL${iata}?marker=${TRAVELPAYOUTS_CONFIG.marker}&with_request=true&locale=en&currency=inr`;
    const tpLink = `https://www.aviasales.com/search/DEL${iata}?marker=${TRAVELPAYOUTS_CONFIG.marker}&with_request=true&locale=en&currency=inr`;
    const skyscannerLink = `https://www.skyscanner.co.in/routes/del/${code}/new-delhi-to-${countrySlug}.html`;

    map[code] = {
      price: `${priceINR} (${meta.flightPrice})`,
      priceINR,
      route,
      iata,
      tpLink,
      aviasalesLink,
      skyscannerLink,
    };
  }
  return map;
})();

export function getFlightLinkForCountry(code: string, fromCode: string = 'in'): FlightLinkInfo {
  const c = (code || 'us').toLowerCase();
  const f = (fromCode || 'in').toLowerCase();
  if (f === 'in' && FLIGHT_LINKS_249[c]) return FLIGHT_LINKS_249[c];

  const meta = getCountryMeta(c);
  const fromMeta = getCountryMeta(f);
  const fromIata = AIRPORT_IATA_MAP[f] || f.toUpperCase();
  const toIata = AIRPORT_IATA_MAP[c] || c.toUpperCase();
  const priceINR = convertFlightPriceToINR(meta.flightPrice, c);
  const displayPrice = f === 'in' ? priceINR : `${meta.flightPrice} (${priceINR})`;
  const fromCitySlug = (fromMeta.capital || 'new-delhi')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const toCountrySlug = (NAME_MAP_249[c] || c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    price: `${priceINR} (${meta.flightPrice})`,
    priceINR: displayPrice,
    route: `${fromIata}→${toIata}`,
    iata: toIata,
    tpLink: `https://www.aviasales.com/search/${fromIata}${toIata}?marker=${TRAVELPAYOUTS_CONFIG.marker}&with_request=true&locale=en&currency=inr`,
    aviasalesLink: `https://www.aviasales.com/search/${fromIata}${toIata}?marker=${TRAVELPAYOUTS_CONFIG.marker}&with_request=true&locale=en&currency=inr`,
    skyscannerLink: `https://www.skyscanner.co.in/routes/${fromIata.toLowerCase()}/${c}/${fromCitySlug}-to-${toCountrySlug}.html`,
  };
}

export function getFlightWidgetWithTP(code: string, metaArg?: { flightPrice?: string }, fromCode: string = 'in'): string {
  const c = (code || 'us').toLowerCase();
  const flight = getFlightLinkForCountry(c, fromCode);

  return `
  <div style="background:linear-gradient(135deg,#f0f9ff,#e0f7ff); border:1px solid #7dd3fc; border-radius:16px; padding:14px;">
    <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
      <div>
        <div style="font-size:11px; font-weight:800; color:#0369a1;">✈ FLIGHT PRICE - LIVE</div>
        <div style="font-size:14px; font-weight:800; margin-top:4px; color:#0f172a;">${flight.route} From ${flight.priceINR}</div>
        <div style="font-size:10px; color:#64748b; margin-top:2px;">Via Travelpayouts ID ${TRAVELPAYOUTS_CONFIG.id} + Skyscanner ${TRAVELPAYOUTS_CONFIG.skyscannerId}</div>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <a href="${flight.tpLink}" target="_blank" rel="noopener noreferrer" style="background:#10b981; color:white; padding:8px 14px; border-radius:10px; font-size:12px; font-weight:700; text-decoration:none; text-align:center;">Search Flights →</a>
        <a href="${flight.skyscannerLink}" target="_blank" rel="noopener noreferrer" style="background:white; color:#0284c7; border:1px solid #7dd3fc; padding:6px 12px; border-radius:8px; font-size:11px; font-weight:600; text-decoration:none; text-align:center;">Skyscanner →</a>
      </div>
    </div>
  </div>`;
}
