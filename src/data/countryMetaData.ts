import { getContinentForCountry } from './continentMap';
import { NAME_MAP_249 } from './fullVisaDatabase';

export interface CountryMeta {
  capital: string;
  language: string;
  currency: string;
  currencySymbol: string;
  timeZone: string;
  bestTime: string;
  processing: string;
  successRate: string;
  indians: string;
  festivals: string;
  topJobs: string;
  topUnis: string;
  hotelPrice: string;
  flightPrice: string;
  advisory: string;
  lat: number;
  lon: number;
}

const SPECIFIC_COUNTRY_META: Record<string, Partial<CountryMeta>> = {
  "us": {capital:"Washington D.C.", language:"English", currency:"USD", currencySymbol:"$", timeZone:"America/New_York", bestTime:"Mar-May, Sep-Nov", processing:"15-20 Days + Interview", successRate:"92%", indians:"4.5M", festivals:"4th July, Thanksgiving", topJobs:"IT, Healthcare, Engineering", topUnis:"MIT, Stanford, Harvard", hotelPrice:"$120/night", flightPrice:"₹45k", advisory:"Safe", lat:38.9, lon:-77.0},
  "gb": {capital:"London", language:"English", currency:"GBP", currencySymbol:"£", timeZone:"Europe/London", bestTime:"Apr-Jun, Sep-Oct", processing:"15 Days", successRate:"88%", indians:"1.8M", festivals:"Notting Hill Carnival Aug", topJobs:"Finance, IT, Healthcare", topUnis:"Oxford, Cambridge, Imperial", hotelPrice:"£100/night", flightPrice:"₹40k", advisory:"Safe", lat:51.5, lon:-0.1},
  "au": {capital:"Canberra", language:"English", currency:"AUD", currencySymbol:"A$", timeZone:"Australia/Sydney", bestTime:"Sep-Nov, Mar-May", processing:"20-30 Days", successRate:"90%", indians:"800k", festivals:"Sydney Festival Jan", topJobs:"IT, Mining, Healthcare", topUnis:"Melbourne, Sydney, ANU", hotelPrice:"A$150/night", flightPrice:"₹55k", advisory:"Safe", lat:-35.2, lon:149.1},
  "ae": {capital:"Abu Dhabi", language:"Arabic, English", currency:"AED", currencySymbol:"AED", timeZone:"Asia/Dubai", bestTime:"Nov-Mar", processing:"3-5 Days e-Visa", successRate:"95%", indians:"3.5M", festivals:"Dubai Shopping Festival Dec", topJobs:"Hospitality, Construction, IT", topUnis:"UAE University, AUS", hotelPrice:"$80/night", flightPrice:"₹15k", advisory:"Safe", lat:24.4, lon:54.3},
  "de": {capital:"Berlin", language:"German", currency:"EUR", currencySymbol:"€", timeZone:"Europe/Berlin", bestTime:"May-Sep", processing:"15 Days Schengen", successRate:"85%", indians:"200k", festivals:"Oktoberfest Sep", topJobs:"Engineering, Automotive, IT", topUnis:"TU Munich, Heidelberg", hotelPrice:"€90/night", flightPrice:"₹35k", advisory:"Safe", lat:52.5, lon:13.4},
  "ca": {capital:"Ottawa", language:"English, French", currency:"CAD", currencySymbol:"C$", timeZone:"America/Toronto", bestTime:"May-Sep", processing:"20-30 Days", successRate:"87%", indians:"1.8M", festivals:"Canada Day Jul", topJobs:"IT, Healthcare, Engineering", topUnis:"Toronto, UBC, McGill", hotelPrice:"C$130/night", flightPrice:"₹50k", advisory:"Safe", lat:45.4, lon:-75.7},
  "sg": {capital:"Singapore", language:"English, Malay, Tamil", currency:"SGD", currencySymbol:"S$", timeZone:"Asia/Singapore", bestTime:"Dec-Jun", processing:"3-5 Days e-Visa", successRate:"94%", indians:"650k", festivals:"Chinese New Year Jan", topJobs:"Finance, IT, Shipping", topUnis:"NUS, NTU", hotelPrice:"S$120/night", flightPrice:"₹20k", advisory:"Safe", lat:1.3, lon:103.8},
  "th": {capital:"Bangkok", language:"Thai", currency:"THB", currencySymbol:"฿", timeZone:"Asia/Bangkok", bestTime:"Nov-Feb", processing:"Visa Free / 3 Days e-Visa", successRate:"98%", indians:"250k", festivals:"Songkran Apr, Loy Krathong Nov", topJobs:"Tourism, Hospitality, Teaching", topUnis:"Chulalongkorn, Mahidol", hotelPrice:"$45/night", flightPrice:"₹14k", advisory:"Safe", lat:13.75, lon:100.5},
  "jp": {capital:"Tokyo", language:"Japanese", currency:"JPY", currencySymbol:"¥", timeZone:"Asia/Tokyo", bestTime:"Mar-May, Oct-Nov", processing:"5-7 Days e-Visa", successRate:"93%", indians:"45k", festivals:"Cherry Blossom Apr, Gion Matsuri Jul", topJobs:"IT, Robotics, Automotive", topUnis:"University of Tokyo, Kyoto University", hotelPrice:"$95/night", flightPrice:"₹38k", advisory:"Safe", lat:35.68, lon:139.69},
  "fr": {capital:"Paris", language:"French", currency:"EUR", currencySymbol:"€", timeZone:"Europe/Paris", bestTime:"May-Sep", processing:"15 Days Schengen", successRate:"86%", indians:"110k", festivals:"Bastille Day Jul, Cannes May", topJobs:"Aerospace, Luxury, IT, Finance", topUnis:"Sorbonne, HEC Paris, INSEAD", hotelPrice:"€110/night", flightPrice:"₹36k", advisory:"Safe", lat:48.85, lon:2.35},
  "it": {capital:"Rome", language:"Italian", currency:"EUR", currencySymbol:"€", timeZone:"Europe/Rome", bestTime:"Apr-Jun, Sep-Oct", processing:"15 Days Schengen", successRate:"86%", indians:"200k", festivals:"Venice Carnival Feb", topJobs:"Design, Fashion, Engineering, Agriculture", topUnis:"Bologna, Sapienza Rome, Politecnico di Milano", hotelPrice:"€95/night", flightPrice:"₹36k", advisory:"Safe", lat:41.9, lon:12.5},
  "es": {capital:"Madrid", language:"Spanish", currency:"EUR", currencySymbol:"€", timeZone:"Europe/Madrid", bestTime:"Apr-Jun, Sep-Oct", processing:"15 Days Schengen", successRate:"87%", indians:"65k", festivals:"La Tomatina Aug, Feria de Abril", topJobs:"Tourism, Tech, Renewable Energy", topUnis:"UB Barcelona, Autonomous Madrid, IE", hotelPrice:"€85/night", flightPrice:"₹37k", advisory:"Safe", lat:40.41, lon:-3.7},
  "nl": {capital:"Amsterdam", language:"Dutch, English", currency:"EUR", currencySymbol:"€", timeZone:"Europe/Amsterdam", bestTime:"Apr-Sep", processing:"15 Days Schengen", successRate:"88%", indians:"80k", festivals:"King's Day Apr, Tulip Festival", topJobs:"IT, Logistics, FinTech, AgriTech", topUnis:"TU Delft, University of Amsterdam", hotelPrice:"€110/night", flightPrice:"₹36k", advisory:"Safe", lat:52.36, lon:4.9},
  "ch": {capital:"Bern", language:"German, French, Italian", currency:"CHF", currencySymbol:"CHF", timeZone:"Europe/Zurich", bestTime:"May-Sep, Dec-Feb", processing:"15 Days Schengen", successRate:"88%", indians:"30k", festivals:"Montreux Jazz Jul, Fasnacht", topJobs:"Banking, Pharma, Precision Engineering", topUnis:"ETH Zurich, EPFL", hotelPrice:"CHF 140/night", flightPrice:"₹38k", advisory:"Safe", lat:46.94, lon:7.44},
  "nz": {capital:"Wellington", language:"English, Maori", currency:"NZD", currencySymbol:"NZ$", timeZone:"Pacific/Auckland", bestTime:"Nov-Apr", processing:"15-25 Days", successRate:"89%", indians:"250k", festivals:"Matariki Jul, Waitangi Day Feb", topJobs:"Healthcare, Dairy, IT, Construction", topUnis:"University of Auckland, Otago", hotelPrice:"NZ$135/night", flightPrice:"₹60k", advisory:"Safe", lat:-41.28, lon:174.77},
  "br": {capital:"Brasilia", language:"Portuguese", currency:"BRL", currencySymbol:"R$", timeZone:"America/Sao_Paulo", bestTime:"Apr-Oct", processing:"10-15 Days", successRate:"88%", indians:"5k", festivals:"Rio Carnival Feb", topJobs:"Oil & Gas, Agribusiness, IT", topUnis:"USP Sao Paulo, Unicamp", hotelPrice:"$75/night", flightPrice:"₹68k", advisory:"Safe", lat:-15.79, lon:-47.88},
  "mx": {capital:"Mexico City", language:"Spanish", currency:"MXN", currencySymbol:"Mex$", timeZone:"America/Mexico_City", bestTime:"Nov-Apr", processing:"10-15 Days", successRate:"87%", indians:"8k", festivals:"Dia de los Muertos Nov", topJobs:"Manufacturing, Automotive, IT", topUnis:"UNAM, Tecnologico de Monterrey", hotelPrice:"$80/night", flightPrice:"₹62k", advisory:"Safe", lat:19.43, lon:-99.13},
  "kr": {capital:"Seoul", language:"Korean", currency:"KRW", currencySymbol:"₩", timeZone:"Asia/Seoul", bestTime:"Mar-May, Sep-Nov", processing:"7-10 Days", successRate:"90%", indians:"15k", festivals:"Chuseok Sep, Boryeong Mud Jul", topJobs:"Semiconductors, Electronics, Automotive", topUnis:"Seoul National University, KAIST, Yonsei", hotelPrice:"$85/night", flightPrice:"₹35k", advisory:"Safe", lat:37.56, lon:126.97},
  "cn": {capital:"Beijing", language:"Mandarin", currency:"CNY", currencySymbol:"¥", timeZone:"Asia/Shanghai", bestTime:"Apr-May, Sep-Oct", processing:"4-7 Days", successRate:"90%", indians:"45k", festivals:"Lunar New Year Jan/Feb, Mid-Autumn", topJobs:"Trade, Manufacturing, Tech, Teaching", topUnis:"Tsinghua, Peking University, Fudan", hotelPrice:"$70/night", flightPrice:"₹28k", advisory:"Safe", lat:39.9, lon:116.4},
  "vn": {capital:"Hanoi", language:"Vietnamese", currency:"VND", currencySymbol:"₫", timeZone:"Asia/Ho_Chi_Minh", bestTime:"Nov-Apr", processing:"3 Days e-Visa", successRate:"97%", indians:"10k", festivals:"Tet Lunar New Year, Hoi An Lantern", topJobs:"Manufacturing, IT, Supply Chain", topUnis:"VNU Hanoi, RMIT Vietnam", hotelPrice:"$40/night", flightPrice:"₹14k", advisory:"Safe", lat:21.02, lon:105.83},
  "my": {capital:"Kuala Lumpur", language:"Malay, English", currency:"MYR", currencySymbol:"RM", timeZone:"Asia/Kuala_Lumpur", bestTime:"Dec-Apr", processing:"Visa Free / 3 Days e-Visa", successRate:"97%", indians:"2.9M", festivals:"Thaipusam Jan, Hari Raya", topJobs:"IT, Finance, Palm Oil, Electronics", topUnis:"University of Malaya, UKM", hotelPrice:"$45/night", flightPrice:"₹12k", advisory:"Safe", lat:3.13, lon:101.68},
  "id": {capital:"Jakarta", language:"Indonesian", currency:"IDR", currencySymbol:"Rp", timeZone:"Asia/Jakarta", bestTime:"Apr-Oct", processing:"e-VOA Instant / 3 Days", successRate:"98%", indians:"130k", festivals:"Nyepi Bali Mar, Galungan", topJobs:"Mining, Digital Tech, Hospitality", topUnis:"Universitas Indonesia, ITB Bandung", hotelPrice:"$45/night", flightPrice:"₹16k", advisory:"Safe", lat:-6.2, lon:106.84},
  "ph": {capital:"Manila", language:"Filipino, English", currency:"PHP", currencySymbol:"₱", timeZone:"Asia/Manila", bestTime:"Dec-May", processing:"5-7 Days e-Visa", successRate:"92%", indians:"150k", festivals:"Sinulog Jan, Ati-Atihan", topJobs:"BPO, IT, Healthcare, Shipping", topUnis:"UP Diliman, Ateneo de Manila", hotelPrice:"$50/night", flightPrice:"₹22k", advisory:"Safe", lat:14.59, lon:120.98},
  "za": {capital:"Pretoria", language:"English, Afrikaans, Zulu", currency:"ZAR", currencySymbol:"R", timeZone:"Africa/Johannesburg", bestTime:"May-Sep", processing:"7-10 Days e-Visa", successRate:"86%", indians:"1.5M", festivals:"Cape Town Jazz Mar, Arts Festival", topJobs:"Mining, Finance, IT, Telecom", topUnis:"University of Cape Town, Wits", hotelPrice:"$65/night", flightPrice:"₹42k", advisory:"Caution", lat:-25.74, lon:28.18},
  "tr": {capital:"Ankara", language:"Turkish", currency:"TRY", currencySymbol:"₺", timeZone:"Europe/Istanbul", bestTime:"Apr-May, Sep-Oct", processing:"3-5 Days e-Visa / Sticker", successRate:"91%", indians:"5k", festivals:"Istanbul Tulip Apr, Cappadocia Balloon", topJobs:"Tourism, Textiles, Construction", topUnis:"Bogazici, METU, Koc University", hotelPrice:"$65/night", flightPrice:"₹26k", advisory:"Safe", lat:39.93, lon:32.85},
  "sa": {capital:"Riyadh", language:"Arabic", currency:"SAR", currencySymbol:"SAR", timeZone:"Asia/Riyadh", bestTime:"Nov-Mar", processing:"3-5 Days e-Visa", successRate:"93%", indians:"2.6M", festivals:"Riyadh Season Oct-Mar, Eid", topJobs:"Oil & Gas, NEOM Construction, Healthcare, IT", topUnis:"King Saud University, KAUST", hotelPrice:"$85/night", flightPrice:"₹18k", advisory:"Safe", lat:24.71, lon:46.67},
  "qa": {capital:"Doha", language:"Arabic, English", currency:"QAR", currencySymbol:"QAR", timeZone:"Asia/Qatar", bestTime:"Nov-Mar", processing:"VOA / 3 Days Hayya e-Visa", successRate:"95%", indians:"750k", festivals:"Qatar International Food Festival", topJobs:"LNG Energy, Aviation, Construction, Finance", topUnis:"Qatar University, Education City", hotelPrice:"$90/night", flightPrice:"₹17k", advisory:"Safe", lat:25.28, lon:51.53},
  "ie": {capital:"Dublin", language:"English, Irish", currency:"EUR", currencySymbol:"€", timeZone:"Europe/Dublin", bestTime:"May-Sep", processing:"15-20 Days", successRate:"89%", indians:"80k", festivals:"St. Patrick's Day Mar, Galway Arts", topJobs:"Big Tech HQ, Pharma, Finance", topUnis:"Trinity College Dublin, UCD", hotelPrice:"€110/night", flightPrice:"₹42k", advisory:"Safe", lat:53.34, lon:-6.26},
  "se": {capital:"Stockholm", language:"Swedish, English", currency:"SEK", currencySymbol:"kr", timeZone:"Europe/Stockholm", bestTime:"May-Sep", processing:"15 Days Schengen", successRate:"87%", indians:"55k", festivals:"Midsummer Jun, Nobel Week Dec", topJobs:"CleanTech, Telecom, Gaming, Automotive", topUnis:"KTH Royal Institute, Lund, Uppsala", hotelPrice:"€100/night", flightPrice:"₹38k", advisory:"Safe", lat:59.32, lon:18.06},
  "no": {capital:"Oslo", language:"Norwegian, English", currency:"NOK", currencySymbol:"kr", timeZone:"Europe/Oslo", bestTime:"May-Aug", processing:"15 Days Schengen", successRate:"87%", indians:"25k", festivals:"Constitution Day May 17, Northern Lights", topJobs:"Offshore Energy, Maritime, Green Tech", topUnis:"University of Oslo, NTNU", hotelPrice:"€115/night", flightPrice:"₹40k", advisory:"Safe", lat:59.91, lon:10.75},
  "pt": {capital:"Lisbon", language:"Portuguese", currency:"EUR", currencySymbol:"€", timeZone:"Europe/Lisbon", bestTime:"Mar-Oct", processing:"15 Days Schengen", successRate:"88%", indians:"90k", festivals:"Santo Antonio Jun, Web Summit Nov", topJobs:"Tech Startups, Tourism, Remote Work", topUnis:"University of Lisbon, Porto, Nova", hotelPrice:"€85/night", flightPrice:"₹39k", advisory:"Safe", lat:38.72, lon:-9.13},
  "dk": {capital:"Copenhagen", language:"Danish, English", currency:"DKK", currencySymbol:"kr", timeZone:"Europe/Copenhagen", bestTime:"May-Sep", processing:"15 Days Schengen", successRate:"87%", indians:"20k", festivals:"Roskilde Jul, Tivoli Gardens", topJobs:"Wind Energy, Biotech, Shipping", topUnis:"University of Copenhagen, DTU", hotelPrice:"€110/night", flightPrice:"₹38k", advisory:"Safe", lat:55.67, lon:12.56},
  "fi": {capital:"Helsinki", language:"Finnish, Swedish", currency:"EUR", currencySymbol:"€", timeZone:"Europe/Helsinki", bestTime:"Jun-Aug, Dec-Feb", processing:"15 Days Schengen", successRate:"88%", indians:"18k", festivals:"Vappu May, Slush Tech Nov", topJobs:"5G Telecom, Gaming, AI, CleanTech", topUnis:"University of Helsinki, Aalto University", hotelPrice:"€100/night", flightPrice:"₹36k", advisory:"Safe", lat:60.16, lon:24.93},
  "be": {capital:"Brussels", language:"Dutch, French, German", currency:"EUR", currencySymbol:"€", timeZone:"Europe/Brussels", bestTime:"Apr-Sep", processing:"15 Days Schengen", successRate:"86%", indians:"30k", festivals:"Tomorrowland Jul, Flower Carpet Aug", topJobs:"EU Institutions, Diamond Trade, Pharma", topUnis:"KU Leuven, Ghent University", hotelPrice:"€95/night", flightPrice:"₹37k", advisory:"Safe", lat:50.85, lon:4.35},
  "at": {capital:"Vienna", language:"German", currency:"EUR", currencySymbol:"€", timeZone:"Europe/Vienna", bestTime:"Apr-Oct, Dec", processing:"15 Days Schengen", successRate:"87%", indians:"15k", festivals:"Vienna Opera Ball Feb, Christmas Markets", topJobs:"Engineering, Tourism, International Orgs", topUnis:"University of Vienna, TU Wien", hotelPrice:"€95/night", flightPrice:"₹36k", advisory:"Safe", lat:48.2, lon:16.37},
  "pl": {capital:"Warsaw", language:"Polish", currency:"PLN", currencySymbol:"zł", timeZone:"Europe/Warsaw", bestTime:"May-Sep", processing:"15 Days Schengen", successRate:"85%", indians:"45k", festivals:"Krakow Wianki Jun, Chopin Festival", topJobs:"IT Outsourcing, Shared Services, Manufacturing", topUnis:"University of Warsaw, Jagiellonian", hotelPrice:"€75/night", flightPrice:"₹34k", advisory:"Safe", lat:52.22, lon:21.01},
  "in": {capital:"New Delhi", language:"Hindi, English", currency:"INR", currencySymbol:"₹", timeZone:"Asia/Kolkata", bestTime:"Oct-Mar", processing:"3-5 Days e-Visa", successRate:"96%", indians:"1.4B", festivals:"Diwali, Holi, Navratri", topJobs:"IT, FinTech, Pharma, Engineering", topUnis:"IITs, IIMs, IISc Bangalore", hotelPrice:"$50/night", flightPrice:"₹5k", advisory:"Safe", lat:28.61, lon:77.2},
  "hk": {capital:"Hong Kong", language:"Cantonese, English", currency:"HKD", currencySymbol:"HK$", timeZone:"Asia/Hong_Kong", bestTime:"Oct-Dec, Mar-May", processing:"PAR Instant / 2 Weeks", successRate:"94%", indians:"45k", festivals:"Dragon Boat Jun, Mid-Autumn", topJobs:"Investment Banking, Trade, Logistics", topUnis:"HKU, HKUST, CUHK", hotelPrice:"$110/night", flightPrice:"₹22k", advisory:"Safe", lat:22.31, lon:114.16},
  "tw": {capital:"Taipei", language:"Mandarin", currency:"TWD", currencySymbol:"NT$", timeZone:"Asia/Taipei", bestTime:"Oct-Apr", processing:"5-7 Days", successRate:"92%", indians:"6k", festivals:"Pingxi Sky Lantern Feb", topJobs:"Semiconductors (TSMC), Hardware, R&D", topUnis:"National Taiwan University (NTU)", hotelPrice:"$80/night", flightPrice:"₹30k", advisory:"Safe", lat:25.03, lon:121.56},
  "om": {capital:"Muscat", language:"Arabic", currency:"OMR", currencySymbol:"OMR", timeZone:"Asia/Muscat", bestTime:"Oct-Mar", processing:"3-4 Days e-Visa", successRate:"95%", indians:"700k", festivals:"Muscat Festival Jan-Feb, Khareef", topJobs:"Oil & Gas, Healthcare, Engineering", topUnis:"Sultan Qaboos University", hotelPrice:"$75/night", flightPrice:"₹13k", advisory:"Safe", lat:23.58, lon:58.38},
  "kw": {capital:"Kuwait City", language:"Arabic", currency:"KWD", currencySymbol:"KWD", timeZone:"Asia/Kuwait", bestTime:"Nov-Mar", processing:"3-5 Days e-Visa", successRate:"92%", indians:"1M", festivals:"Hala February Festival", topJobs:"Petrochemicals, Banking, Healthcare", topUnis:"Kuwait University, AUK", hotelPrice:"$90/night", flightPrice:"₹16k", advisory:"Safe", lat:29.37, lon:47.97},
  "bh": {capital:"Manama", language:"Arabic, English", currency:"BHD", currencySymbol:"BHD", timeZone:"Asia/Bahrain", bestTime:"Nov-Mar", processing:"3-5 Days e-Visa", successRate:"94%", indians:"350k", festivals:"Bahrain F1 Grand Prix, Spring of Culture", topJobs:"Islamic Banking, FinTech, Hospitality", topUnis:"University of Bahrain", hotelPrice:"$80/night", flightPrice:"₹16k", advisory:"Safe", lat:26.22, lon:50.58},
  "mv": {capital:"Male", language:"Dhivehi, English", currency:"MVR", currencySymbol:"Rf", timeZone:"Indian/Maldives", bestTime:"Nov-Apr", processing:"Free Visa on Arrival", successRate:"99%", indians:"30k", festivals:"Eid, Republic Day Nov", topJobs:"Luxury Resorts, Hospitality, Diving", topUnis:"Maldives National University", hotelPrice:"$120/night", flightPrice:"₹12k", advisory:"Safe", lat:4.17, lon:73.5},
  "mu": {capital:"Port Louis", language:"English, French, Creole", currency:"MUR", currencySymbol:"Rs", timeZone:"Indian/Mauritius", bestTime:"May-Dec", processing:"Free Visa on Arrival", successRate:"98%", indians:"900k", festivals:"Maha Shivaratri, Diwali, Cavadee", topJobs:"Offshore Finance, Tourism, IT", topUnis:"University of Mauritius", hotelPrice:"$85/night", flightPrice:"₹32k", advisory:"Safe", lat:-20.16, lon:57.5},
  "lk": {capital:"Colombo", language:"Sinhala, Tamil, English", currency:"LKR", currencySymbol:"Rs", timeZone:"Asia/Colombo", bestTime:"Dec-Apr", processing:"Free e-Visa / ETA", successRate:"99%", indians:"15k", festivals:"Esala Perahera Aug, Vesak May", topJobs:"Tourism, Tea Exports, IT, Shipping", topUnis:"University of Colombo, Peradeniya", hotelPrice:"$45/night", flightPrice:"₹10k", advisory:"Safe", lat:6.92, lon:79.86},
  "np": {capital:"Kathmandu", language:"Nepali", currency:"NPR", currencySymbol:"Rs", timeZone:"Asia/Kathmandu", bestTime:"Oct-Dec, Mar-May", processing:"Visa Free for Indians", successRate:"100%", indians:"600k", festivals:"Dashain Oct, Tihar Nov", topJobs:"Hydropower, Tourism, Trade", topUnis:"Tribhuvan University, Kathmandu University", hotelPrice:"$35/night", flightPrice:"₹8k", advisory:"Safe", lat:27.71, lon:85.32}
};

const CAPITAL_AND_TZ_249: Record<string, { capital: string; tz: string; curr: string; sym: string; lang: string; lat: number; lon: number }> = {
  "ad": { capital: "Andorra la Vella", tz: "Europe/Andorra", curr: "EUR", sym: "€", lang: "Catalan", lat: 42.5, lon: 1.52 },
  "af": { capital: "Kabul", tz: "Asia/Kabul", curr: "AFN", sym: "؋", lang: "Pashto, Dari", lat: 34.55, lon: 69.2 },
  "ag": { capital: "St. John's", tz: "America/Antigua", curr: "XCD", sym: "EC$", lang: "English", lat: 17.12, lon: -61.84 },
  "ai": { capital: "The Valley", tz: "America/Anguilla", curr: "XCD", sym: "EC$", lang: "English", lat: 18.21, lon: -63.05 },
  "al": { capital: "Tirana", tz: "Europe/Tirane", curr: "ALL", sym: "L", lang: "Albanian", lat: 41.32, lon: 19.81 },
  "am": { capital: "Yerevan", tz: "Asia/Yerevan", curr: "AMD", sym: "֏", lang: "Armenian", lat: 40.18, lon: 44.51 },
  "ao": { capital: "Luanda", tz: "Africa/Luanda", curr: "AOA", sym: "Kz", lang: "Portuguese", lat: -8.83, lon: 13.23 },
  "aq": { capital: "McMurdo Station", tz: "Antarctica/McMurdo", curr: "USD", sym: "$", lang: "English", lat: -77.84, lon: 166.68 },
  "ar": { capital: "Buenos Aires", tz: "America/Argentina/Buenos_Aires", curr: "ARS", sym: "$", lang: "Spanish", lat: -34.6, lon: -58.38 },
  "as": { capital: "Pago Pago", tz: "Pacific/Pago_Pago", curr: "USD", sym: "$", lang: "English, Samoan", lat: -14.27, lon: -170.7 },
  "aw": { capital: "Oranjestad", tz: "America/Aruba", curr: "AWG", sym: "ƒ", lang: "Dutch, Papiamento", lat: 12.52, lon: -70.03 },
  "ax": { capital: "Mariehamn", tz: "Europe/Mariehamn", curr: "EUR", sym: "€", lang: "Swedish", lat: 60.09, lon: 19.93 },
  "az": { capital: "Baku", tz: "Asia/Baku", curr: "AZN", sym: "₼", lang: "Azerbaijani", lat: 40.4, lon: 49.86 },
  "ba": { capital: "Sarajevo", tz: "Europe/Sarajevo", curr: "BAM", sym: "KM", lang: "Bosnian, Croatian, Serbian", lat: 43.85, lon: 18.41 },
  "bb": { capital: "Bridgetown", tz: "America/Barbados", curr: "BBD", sym: "Bds$", lang: "English", lat: 13.1, lon: -59.61 },
  "bd": { capital: "Dhaka", tz: "Asia/Dhaka", curr: "BDT", sym: "৳", lang: "Bengali", lat: 23.81, lon: 90.41 },
  "bf": { capital: "Ouagadougou", tz: "Africa/Ouagadougou", curr: "XOF", sym: "CFA", lang: "French", lat: 12.37, lon: -1.51 },
  "bg": { capital: "Sofia", tz: "Europe/Sofia", curr: "BGN", sym: "лв", lang: "Bulgarian", lat: 42.69, lon: 23.32 },
  "bi": { capital: "Gitega", tz: "Africa/Bujumbura", curr: "BIF", sym: "FBu", lang: "Kirundi, French", lat: -3.42, lon: 29.93 },
  "bj": { capital: "Porto-Novo", tz: "Africa/Porto-Novo", curr: "XOF", sym: "CFA", lang: "French", lat: 6.49, lon: 2.62 },
  "bl": { capital: "Gustavia", tz: "America/St_Barthelemy", curr: "EUR", sym: "€", lang: "French", lat: 17.89, lon: -62.84 },
  "bm": { capital: "Hamilton", tz: "Atlantic/Bermuda", curr: "BMD", sym: "$", lang: "English", lat: 32.29, lon: -64.78 },
  "bn": { capital: "Bandar Seri Begawan", tz: "Asia/Brunei", curr: "BND", sym: "B$", lang: "Malay, English", lat: 4.9, lon: 114.94 },
  "bo": { capital: "La Paz", tz: "America/La_Paz", curr: "BOB", sym: "Bs.", lang: "Spanish", lat: -16.48, lon: -68.11 },
  "bq": { capital: "Kralendijk", tz: "America/Kralendijk", curr: "USD", sym: "$", lang: "Dutch", lat: 12.14, lon: -68.26 },
  "bs": { capital: "Nassau", tz: "America/Nassau", curr: "BSD", sym: "B$", lang: "English", lat: 25.04, lon: -77.35 },
  "bt": { capital: "Thimphu", tz: "Asia/Thimphu", curr: "BTN", sym: "Nu.", lang: "Dzongkha", lat: 27.47, lon: 89.63 },
  "bv": { capital: "Bouvet Island", tz: "Europe/Oslo", curr: "NOK", sym: "kr", lang: "Norwegian", lat: -54.42, lon: 3.35 },
  "bw": { capital: "Gaborone", tz: "Africa/Gaborone", curr: "BWP", sym: "P", lang: "English, Setswana", lat: -24.62, lon: 25.92 },
  "by": { capital: "Minsk", tz: "Europe/Minsk", curr: "BYN", sym: "Br", lang: "Belarusian, Russian", lat: 53.9, lon: 27.56 },
  "bz": { capital: "Belmopan", tz: "America/Belize", curr: "BZD", sym: "BZ$", lang: "English", lat: 17.25, lon: -88.76 },
  "cc": { capital: "West Island", tz: "Indian/Cocos", curr: "AUD", sym: "A$", lang: "English", lat: -12.18, lon: 96.82 },
  "cd": { capital: "Kinshasa", tz: "Africa/Kinshasa", curr: "CDF", sym: "FC", lang: "French", lat: -4.44, lon: 15.26 },
  "cf": { capital: "Bangui", tz: "Africa/Bangui", curr: "XAF", sym: "FCFA", lang: "French, Sango", lat: 4.39, lon: 18.55 },
  "cg": { capital: "Brazzaville", tz: "Africa/Brazzaville", curr: "XAF", sym: "FCFA", lang: "French", lat: -4.26, lon: 15.28 },
  "ci": { capital: "Yamoussoukro", tz: "Africa/Abidjan", curr: "XOF", sym: "CFA", lang: "French", lat: 6.82, lon: -5.27 },
  "ck": { capital: "Avarua", tz: "Pacific/Rarotonga", curr: "NZD", sym: "NZ$", lang: "English", lat: -21.2, lon: -159.77 },
  "cl": { capital: "Santiago", tz: "America/Santiago", curr: "CLP", sym: "$", lang: "Spanish", lat: -33.44, lon: -70.66 },
  "cm": { capital: "Yaounde", tz: "Africa/Douala", curr: "XAF", sym: "FCFA", lang: "French, English", lat: 3.84, lon: 11.5 },
  "co": { capital: "Bogota", tz: "America/Bogota", curr: "COP", sym: "$", lang: "Spanish", lat: 4.71, lon: -74.07 },
  "cr": { capital: "San Jose", tz: "America/Costa_Rica", curr: "CRC", sym: "₡", lang: "Spanish", lat: 9.92, lon: -84.09 },
  "cu": { capital: "Havana", tz: "America/Havana", curr: "CUP", sym: "$", lang: "Spanish", lat: 23.11, lon: -82.36 },
  "cv": { capital: "Praia", tz: "Atlantic/Cape_Verde", curr: "CVE", sym: "$", lang: "Portuguese", lat: 14.93, lon: -23.51 },
  "cw": { capital: "Willemstad", tz: "America/Curacao", curr: "ANG", sym: "ƒ", lang: "Dutch, Papiamento", lat: 12.1, lon: -68.93 },
  "cx": { capital: "Flying Fish Cove", tz: "Indian/Christmas", curr: "AUD", sym: "A$", lang: "English", lat: -10.42, lon: 105.67 },
  "cy": { capital: "Nicosia", tz: "Asia/Nicosia", curr: "EUR", sym: "€", lang: "Greek, Turkish", lat: 35.18, lon: 33.38 },
  "cz": { capital: "Prague", tz: "Europe/Prague", curr: "CZK", sym: "Kč", lang: "Czech", lat: 50.07, lon: 14.43 },
  "dj": { capital: "Djibouti", tz: "Africa/Djibouti", curr: "DJF", sym: "Fdj", lang: "French, Arabic", lat: 11.58, lon: 43.14 },
  "dm": { capital: "Roseau", tz: "America/Dominica", curr: "XCD", sym: "EC$", lang: "English", lat: 15.3, lon: -61.38 },
  "do": { capital: "Santo Domingo", tz: "America/Santo_Domingo", curr: "DOP", sym: "RD$", lang: "Spanish", lat: 18.48, lon: -69.93 },
  "ec": { capital: "Quito", tz: "America/Guayaquil", curr: "USD", sym: "$", lang: "Spanish", lat: -0.18, lon: -78.46 },
  "ee": { capital: "Tallinn", tz: "Europe/Tallinn", curr: "EUR", sym: "€", lang: "Estonian", lat: 59.43, lon: 24.75 },
  "eg": { capital: "Cairo", tz: "Africa/Cairo", curr: "EGP", sym: "E£", lang: "Arabic", lat: 30.04, lon: 31.23 },
  "eh": { capital: "Laayoune", tz: "Africa/El_Aaiun", curr: "MAD", sym: "DH", lang: "Arabic", lat: 27.15, lon: -13.2 },
  "er": { capital: "Asmara", tz: "Africa/Asmara", curr: "ERN", sym: "Nfk", lang: "Tigrinya, Arabic", lat: 15.32, lon: 38.92 },
  "et": { capital: "Addis Ababa", tz: "Africa/Addis_Ababa", curr: "ETB", sym: "Br", lang: "Amharic", lat: 9.03, lon: 38.74 },
  "fj": { capital: "Suva", tz: "Pacific/Fiji", curr: "FJD", sym: "FJ$", lang: "English, Fijian", lat: -18.14, lon: 178.44 },
  "fk": { capital: "Stanley", tz: "Atlantic/Stanley", curr: "FKP", sym: "£", lang: "English", lat: -51.69, lon: -57.85 },
  "fm": { capital: "Palikir", tz: "Pacific/Pohnpei", curr: "USD", sym: "$", lang: "English", lat: 6.91, lon: 158.16 },
  "fo": { capital: "Torshavn", tz: "Atlantic/Faroe", curr: "DKK", sym: "kr", lang: "Faroese, Danish", lat: 62.01, lon: -6.77 },
  "ga": { capital: "Libreville", tz: "Africa/Libreville", curr: "XAF", sym: "FCFA", lang: "French", lat: 0.41, lon: 9.46 },
  "gd": { capital: "St. George's", tz: "America/Grenada", curr: "XCD", sym: "EC$", lang: "English", lat: 12.05, lon: -61.75 },
  "ge": { capital: "Tbilisi", tz: "Asia/Tbilisi", curr: "GEL", sym: "₾", lang: "Georgian", lat: 41.71, lon: 44.82 },
  "gf": { capital: "Cayenne", tz: "America/Cayenne", curr: "EUR", sym: "€", lang: "French", lat: 4.92, lon: -52.31 },
  "gg": { capital: "St. Peter Port", tz: "Europe/Guernsey", curr: "GBP", sym: "£", lang: "English", lat: 49.45, lon: -2.53 },
  "gh": { capital: "Accra", tz: "Africa/Accra", curr: "GHS", sym: "GH₵", lang: "English", lat: 5.6, lon: -0.18 },
  "gi": { capital: "Gibraltar", tz: "Europe/Gibraltar", curr: "GIP", sym: "£", lang: "English", lat: 36.14, lon: -5.35 },
  "gl": { capital: "Nuuk", tz: "America/Nuuk", curr: "DKK", sym: "kr", lang: "Greenlandic, Danish", lat: 64.18, lon: -51.72 },
  "gm": { capital: "Banjul", tz: "Africa/Banjul", curr: "GMD", sym: "D", lang: "English", lat: 13.45, lon: -16.57 },
  "gn": { capital: "Conakry", tz: "Africa/Conakry", curr: "GNF", sym: "FG", lang: "French", lat: 9.64, lon: -13.57 },
  "gp": { capital: "Basse-Terre", tz: "America/Guadeloupe", curr: "EUR", sym: "€", lang: "French", lat: 16.0, lon: -61.7 },
  "gq": { capital: "Malabo", tz: "Africa/Malabo", curr: "XAF", sym: "FCFA", lang: "Spanish, French", lat: 3.75, lon: 8.78 },
  "gr": { capital: "Athens", tz: "Europe/Athens", curr: "EUR", sym: "€", lang: "Greek", lat: 37.98, lon: 23.72 },
  "gs": { capital: "King Edward Point", tz: "Atlantic/South_Georgia", curr: "GBP", sym: "£", lang: "English", lat: -54.28, lon: -36.5 },
  "gt": { capital: "Guatemala City", tz: "America/Guatemala", curr: "GTQ", sym: "Q", lang: "Spanish", lat: 14.63, lon: -90.5 },
  "gu": { capital: "Hagatna", tz: "Pacific/Guam", curr: "USD", sym: "$", lang: "English, Chamorro", lat: 13.47, lon: 144.75 },
  "gw": { capital: "Bissau", tz: "Africa/Bissau", curr: "XOF", sym: "CFA", lang: "Portuguese", lat: 11.86, lon: -15.59 },
  "gy": { capital: "Georgetown", tz: "America/Guyana", curr: "GYD", sym: "G$", lang: "English", lat: 6.8, lon: -58.15 },
  "hm": { capital: "Atlas Cove", tz: "Indian/Kerguelen", curr: "AUD", sym: "A$", lang: "English", lat: -53.08, lon: 73.5 },
  "hn": { capital: "Tegucigalpa", tz: "America/Tegucigalpa", curr: "HNL", sym: "L", lang: "Spanish", lat: 14.07, lon: -87.19 },
  "hr": { capital: "Zagreb", tz: "Europe/Zagreb", curr: "EUR", sym: "€", lang: "Croatian", lat: 45.81, lon: 15.98 },
  "ht": { capital: "Port-au-Prince", tz: "America/Port-au-Prince", curr: "HTG", sym: "G", lang: "French, Creole", lat: 18.59, lon: -72.3 },
  "hu": { capital: "Budapest", tz: "Europe/Budapest", curr: "HUF", sym: "Ft", lang: "Hungarian", lat: 47.49, lon: 19.04 },
  "il": { capital: "Jerusalem", tz: "Asia/Jerusalem", curr: "ILS", sym: "₪", lang: "Hebrew, Arabic", lat: 31.76, lon: 35.21 },
  "im": { capital: "Douglas", tz: "Europe/Isle_of_Man", curr: "GBP", sym: "£", lang: "English", lat: 54.15, lon: -4.48 },
  "io": { capital: "Diego Garcia", tz: "Indian/Chagos", curr: "USD", sym: "$", lang: "English", lat: -7.31, lon: 72.41 },
  "iq": { capital: "Baghdad", tz: "Asia/Baghdad", curr: "IQD", sym: "ع.د", lang: "Arabic, Kurdish", lat: 33.31, lon: 44.36 },
  "ir": { capital: "Tehran", tz: "Asia/Tehran", curr: "IRR", sym: "﷼", lang: "Persian", lat: 35.68, lon: 51.38 },
  "is": { capital: "Reykjavik", tz: "Atlantic/Reykjavik", curr: "ISK", sym: "kr", lang: "Icelandic", lat: 64.14, lon: -21.94 },
  "je": { capital: "St. Helier", tz: "Europe/Jersey", curr: "GBP", sym: "£", lang: "English", lat: 49.18, lon: -2.1 },
  "jm": { capital: "Kingston", tz: "America/Jamaica", curr: "JMD", sym: "J$", lang: "English", lat: 18.01, lon: -76.8 },
  "jo": { capital: "Amman", tz: "Asia/Amman", curr: "JOD", sym: "JD", lang: "Arabic", lat: 31.94, lon: 35.92 },
  "ke": { capital: "Nairobi", tz: "Africa/Nairobi", curr: "KES", sym: "KSh", lang: "Swahili, English", lat: -1.29, lon: 36.82 },
  "kg": { capital: "Bishkek", tz: "Asia/Bishkek", curr: "KGS", sym: "сом", lang: "Kyrgyz, Russian", lat: 42.87, lon: 74.56 },
  "kh": { capital: "Phnom Penh", tz: "Asia/Phnom_Penh", curr: "KHR", sym: "៛", lang: "Khmer", lat: 11.55, lon: 104.92 },
  "ki": { capital: "Tarawa", tz: "Pacific/Tarawa", curr: "AUD", sym: "A$", lang: "English", lat: 1.45, lon: 172.97 },
  "km": { capital: "Moroni", tz: "Indian/Comoro", curr: "KMF", sym: "CF", lang: "Comorian, Arabic, French", lat: -11.71, lon: 43.24 },
  "kn": { capital: "Basseterre", tz: "America/St_Kitts", curr: "XCD", sym: "EC$", lang: "English", lat: 17.3, lon: -62.71 },
  "kz": { capital: "Astana", tz: "Asia/Almaty", curr: "KZT", sym: "₸", lang: "Kazakh, Russian", lat: 51.16, lon: 71.47 },
  "la": { capital: "Vientiane", tz: "Asia/Vientiane", curr: "LAK", sym: "₭", lang: "Lao", lat: 17.97, lon: 102.63 },
  "lb": { capital: "Beirut", tz: "Asia/Beirut", curr: "LBP", sym: "ل.ل", lang: "Arabic, French", lat: 33.89, lon: 35.5 },
  "lc": { capital: "Castries", tz: "America/St_Lucia", curr: "XCD", sym: "EC$", lang: "English", lat: 14.01, lon: -60.98 },
  "li": { capital: "Vaduz", tz: "Europe/Vaduz", curr: "CHF", sym: "CHF", lang: "German", lat: 47.14, lon: 9.52 },
  "lr": { capital: "Monrovia", tz: "Africa/Monrovia", curr: "LRD", sym: "L$", lang: "English", lat: 6.31, lon: -10.8 },
  "ls": { capital: "Maseru", tz: "Africa/Maseru", curr: "LSL", sym: "L", lang: "Sesotho, English", lat: -29.31, lon: 27.48 },
  "lt": { capital: "Vilnius", tz: "Europe/Vilnius", curr: "EUR", sym: "€", lang: "Lithuanian", lat: 54.68, lon: 25.27 },
  "lu": { capital: "Luxembourg City", tz: "Europe/Luxembourg", curr: "EUR", sym: "€", lang: "Luxembourgish, French, German", lat: 49.61, lon: 6.13 },
  "lv": { capital: "Riga", tz: "Europe/Riga", curr: "EUR", sym: "€", lang: "Latvian", lat: 56.94, lon: 24.1 },
  "ly": { capital: "Tripoli", tz: "Africa/Tripoli", curr: "LYD", sym: "ل.د", lang: "Arabic", lat: 32.88, lon: 13.19 },
  "ma": { capital: "Rabat", tz: "Africa/Casablanca", curr: "MAD", sym: "DH", lang: "Arabic, French", lat: 34.02, lon: -6.83 },
  "mc": { capital: "Monaco", tz: "Europe/Monaco", curr: "EUR", sym: "€", lang: "French", lat: 43.73, lon: 7.42 },
  "md": { capital: "Chisinau", tz: "Europe/Chisinau", curr: "MDL", sym: "L", lang: "Romanian", lat: 47.01, lon: 28.86 },
  "me": { capital: "Podgorica", tz: "Europe/Podgorica", curr: "EUR", sym: "€", lang: "Montenegrin", lat: 42.43, lon: 19.25 },
  "mf": { capital: "Marigot", tz: "America/Marigot", curr: "EUR", sym: "€", lang: "French", lat: 18.06, lon: -63.08 },
  "mg": { capital: "Antananarivo", tz: "Indian/Antananarivo", curr: "MGA", sym: "Ar", lang: "Malagasy, French", lat: -18.87, lon: 47.5 },
  "mh": { capital: "Majuro", tz: "Pacific/Majuro", curr: "USD", sym: "$", lang: "Marshallese, English", lat: 7.08, lon: 171.38 },
  "mk": { capital: "Skopje", tz: "Europe/Skopje", curr: "MKD", sym: "ден", lang: "Macedonian", lat: 41.99, lon: 21.42 },
  "ml": { capital: "Bamako", tz: "Africa/Bamako", curr: "XOF", sym: "CFA", lang: "French", lat: 12.63, lon: -8.0 },
  "mm": { capital: "Naypyidaw", tz: "Asia/Yangon", curr: "MMK", sym: "K", lang: "Burmese", lat: 19.76, lon: 96.07 },
  "mn": { capital: "Ulaanbaatar", tz: "Asia/Ulaanbaatar", curr: "MNT", sym: "₮", lang: "Mongolian", lat: 47.92, lon: 106.91 },
  "mo": { capital: "Macao", tz: "Asia/Macau", curr: "MOP", sym: "MOP$", lang: "Cantonese, Portuguese", lat: 22.19, lon: 113.54 },
  "mq": { capital: "Fort-de-France", tz: "America/Martinique", curr: "EUR", sym: "€", lang: "French", lat: 14.61, lon: -61.05 },
  "mr": { capital: "Nouakchott", tz: "Africa/Nouakchott", curr: "MRU", sym: "UM", lang: "Arabic", lat: 18.07, lon: -15.95 },
  "mt": { capital: "Valletta", tz: "Europe/Malta", curr: "EUR", sym: "€", lang: "Maltese, English", lat: 35.89, lon: 14.51 },
  "mw": { capital: "Lilongwe", tz: "Africa/Blantyre", curr: "MWK", sym: "MK", lang: "English, Chichewa", lat: -13.96, lon: 33.78 },
  "mz": { capital: "Maputo", tz: "Africa/Maputo", curr: "MZN", sym: "MT", lang: "Portuguese", lat: -25.96, lon: 32.57 },
  "na": { capital: "Windhoek", tz: "Africa/Windhoek", curr: "NAD", sym: "N$", lang: "English", lat: -22.56, lon: 17.06 },
  "nc": { capital: "Noumea", tz: "Pacific/Noumea", curr: "XPF", sym: "₣", lang: "French", lat: -22.27, lon: 166.45 },
  "ne": { capital: "Niamey", tz: "Africa/Niamey", curr: "XOF", sym: "CFA", lang: "French", lat: 13.51, lon: 2.12 },
  "nf": { capital: "Kingston", tz: "Pacific/Norfolk", curr: "AUD", sym: "A$", lang: "English", lat: -29.05, lon: 167.95 },
  "ng": { capital: "Abuja", tz: "Africa/Lagos", curr: "NGN", sym: "₦", lang: "English", lat: 9.07, lon: 7.39 },
  "ni": { capital: "Managua", tz: "America/Managua", curr: "NIO", sym: "C$", lang: "Spanish", lat: 12.11, lon: -86.23 },
  "nr": { capital: "Yaren", tz: "Pacific/Nauru", curr: "AUD", sym: "A$", lang: "Nauruan, English", lat: -0.54, lon: 166.91 },
  "pa": { capital: "Panama City", tz: "America/Panama", curr: "USD", sym: "$", lang: "Spanish", lat: 8.98, lon: -79.51 },
  "pe": { capital: "Lima", tz: "America/Lima", curr: "PEN", sym: "S/", lang: "Spanish", lat: -12.04, lon: -77.04 },
  "pf": { capital: "Papeete", tz: "Pacific/Tahiti", curr: "XPF", sym: "₣", lang: "French, Tahitian", lat: -17.53, lon: -149.56 },
  "pg": { capital: "Port Moresby", tz: "Pacific/Port_Moresby", curr: "PGK", sym: "K", lang: "English, Tok Pisin", lat: -9.44, lon: 147.18 },
  "pk": { capital: "Islamabad", tz: "Asia/Karachi", curr: "PKR", sym: "₨", lang: "Urdu, English", lat: 33.68, lon: 73.04 },
  "pm": { capital: "Saint-Pierre", tz: "America/Miquelon", curr: "EUR", sym: "€", lang: "French", lat: 46.77, lon: -56.17 },
  "pn": { capital: "Adamstown", tz: "Pacific/Pitcairn", curr: "NZD", sym: "NZ$", lang: "English", lat: -25.06, lon: -130.1 },
  "pr": { capital: "San Juan", tz: "America/Puerto_Rico", curr: "USD", sym: "$", lang: "Spanish, English", lat: 18.46, lon: -66.1 },
  "ps": { capital: "Ramallah", tz: "Asia/Gaza", curr: "ILS", sym: "₪", lang: "Arabic", lat: 31.9, lon: 35.2 },
  "pw": { capital: "Ngerulmud", tz: "Pacific/Palau", curr: "USD", sym: "$", lang: "Palauan, English", lat: 7.5, lon: 134.62 },
  "py": { capital: "Asuncion", tz: "America/Asuncion", curr: "PYG", sym: "₲", lang: "Spanish, Guarani", lat: -25.26, lon: -57.57 },
  "re": { capital: "Saint-Denis", tz: "Indian/Reunion", curr: "EUR", sym: "€", lang: "French", lat: -20.88, lon: 55.45 },
  "ro": { capital: "Bucharest", tz: "Europe/Bucharest", curr: "RON", sym: "lei", lang: "Romanian", lat: 44.42, lon: 26.1 },
  "rs": { capital: "Belgrade", tz: "Europe/Belgrade", curr: "RSD", sym: "дин.", lang: "Serbian", lat: 44.78, lon: 20.44 },
  "rw": { capital: "Kigali", tz: "Africa/Kigali", curr: "RWF", sym: "FRw", lang: "Kinyarwanda, English, French", lat: -1.94, lon: 30.06 },
  "sb": { capital: "Honiara", tz: "Pacific/Guadalcanal", curr: "SBD", sym: "SI$", lang: "English", lat: -9.43, lon: 159.95 },
  "sc": { capital: "Victoria", tz: "Indian/Mahe", curr: "SCR", sym: "SR", lang: "English, French, Creole", lat: -4.61, lon: 55.45 },
  "sd": { capital: "Khartoum", tz: "Africa/Khartoum", curr: "SDG", sym: "ج.س.", lang: "Arabic, English", lat: 15.5, lon: 32.55 },
  "sh": { capital: "Jamestown", tz: "Atlantic/St_Helena", curr: "SHP", sym: "£", lang: "English", lat: -15.92, lon: -5.71 },
  "si": { capital: "Ljubljana", tz: "Europe/Ljubljana", curr: "EUR", sym: "€", lang: "Slovene", lat: 46.05, lon: 14.5 },
  "sj": { capital: "Longyearbyen", tz: "Arctic/Longyearbyen", curr: "NOK", sym: "kr", lang: "Norwegian", lat: 78.22, lon: 15.65 },
  "sk": { capital: "Bratislava", tz: "Europe/Bratislava", curr: "EUR", sym: "€", lang: "Slovak", lat: 48.14, lon: 17.1 },
  "sl": { capital: "Freetown", tz: "Africa/Freetown", curr: "SLE", sym: "Le", lang: "English", lat: 8.46, lon: -13.23 },
  "sm": { capital: "San Marino", tz: "Europe/San_Marino", curr: "EUR", sym: "€", lang: "Italian", lat: 43.93, lon: 12.44 },
  "sn": { capital: "Dakar", tz: "Africa/Dakar", curr: "XOF", sym: "CFA", lang: "French", lat: 14.71, lon: -17.46 },
  "so": { capital: "Mogadishu", tz: "Africa/Mogadishu", curr: "SOS", sym: "Sh.So.", lang: "Somali, Arabic", lat: 2.04, lon: 45.31 },
  "sr": { capital: "Paramaribo", tz: "America/Paramaribo", curr: "SRD", sym: "$", lang: "Dutch", lat: 5.85, lon: -55.2 },
  "ss": { capital: "Juba", tz: "Africa/Juba", curr: "SSP", sym: "£", lang: "English", lat: 4.85, lon: 31.57 },
  "sv": { capital: "San Salvador", tz: "America/El_Salvador", curr: "USD", sym: "$", lang: "Spanish", lat: 13.69, lon: -89.21 },
  "sx": { capital: "Philipsburg", tz: "America/Lower_Princes", curr: "ANG", sym: "ƒ", lang: "Dutch, English", lat: 18.02, lon: -63.04 },
  "sy": { capital: "Damascus", tz: "Asia/Damascus", curr: "SYP", sym: "£S", lang: "Arabic", lat: 33.51, lon: 36.27 },
  "sz": { capital: "Mbabane", tz: "Africa/Mbabane", curr: "SZL", sym: "E", lang: "English, Swazi", lat: -26.3, lon: 31.13 },
  "td": { capital: "N'Djamena", tz: "Africa/Ndjamena", curr: "XAF", sym: "FCFA", lang: "French, Arabic", lat: 12.13, lon: 15.05 },
  "tf": { capital: "Port-aux-Francais", tz: "Indian/Kerguelen", curr: "EUR", sym: "€", lang: "French", lat: -49.35, lon: 70.21 },
  "tg": { capital: "Lome", tz: "Africa/Lome", curr: "XOF", sym: "CFA", lang: "French", lat: 6.13, lon: 1.22 },
  "tj": { capital: "Dushanbe", tz: "Asia/Dushanbe", curr: "TJS", sym: "SM", lang: "Tajik", lat: 38.55, lon: 68.78 },
  "tk": { capital: "Fakaofo", tz: "Pacific/Fakaofo", curr: "NZD", sym: "NZ$", lang: "Tokelauan, English", lat: -9.38, lon: -171.21 },
  "tl": { capital: "Dili", tz: "Asia/Dili", curr: "USD", sym: "$", lang: "Portuguese, Tetum", lat: -8.55, lon: 125.56 },
  "tm": { capital: "Ashgabat", tz: "Asia/Ashgabat", curr: "TMT", sym: "m", lang: "Turkmen", lat: 37.96, lon: 58.32 },
  "tn": { capital: "Tunis", tz: "Africa/Tunis", curr: "TND", sym: "د.ت", lang: "Arabic, French", lat: 36.8, lon: 10.18 },
  "to": { capital: "Nuku'alofa", tz: "Pacific/Tongatapu", curr: "TOP", sym: "T$", lang: "Tongan, English", lat: -21.13, lon: -175.2 },
  "tt": { capital: "Port of Spain", tz: "America/Port_of_Spain", curr: "TTD", sym: "TT$", lang: "English", lat: 10.65, lon: -61.51 },
  "tv": { capital: "Funafuti", tz: "Pacific/Funafuti", curr: "AUD", sym: "A$", lang: "Tuvaluan, English", lat: -8.52, lon: 179.19 },
  "tz": { capital: "Dodoma", tz: "Africa/Dar_es_Salaam", curr: "TZS", sym: "TSh", lang: "Swahili, English", lat: -6.16, lon: 35.75 },
  "ua": { capital: "Kyiv", tz: "Europe/Kyiv", curr: "UAH", sym: "₴", lang: "Ukrainian", lat: 50.45, lon: 30.52 },
  "ug": { capital: "Kampala", tz: "Africa/Kampala", curr: "UGX", sym: "USh", lang: "English, Swahili", lat: 0.34, lon: 32.58 },
  "um": { capital: "Wake Island", tz: "Pacific/Wake", curr: "USD", sym: "$", lang: "English", lat: 19.28, lon: 166.64 },
  "uy": { capital: "Montevideo", tz: "America/Montevideo", curr: "UYU", sym: "$U", lang: "Spanish", lat: -34.9, lon: -56.16 },
  "uz": { capital: "Tashkent", tz: "Asia/Tashkent", curr: "UZS", sym: "so'm", lang: "Uzbek", lat: 41.29, lon: 69.24 },
  "va": { capital: "Vatican City", tz: "Europe/Vatican", curr: "EUR", sym: "€", lang: "Italian, Latin", lat: 41.9, lon: 12.45 },
  "vc": { capital: "Kingstown", tz: "America/St_Vincent", curr: "XCD", sym: "EC$", lang: "English", lat: 13.16, lon: -61.22 },
  "ve": { capital: "Caracas", tz: "America/Caracas", curr: "VES", sym: "Bs.S", lang: "Spanish", lat: 10.48, lon: -66.9 },
  "vg": { capital: "Road Town", tz: "America/Tortola", curr: "USD", sym: "$", lang: "English", lat: 18.42, lon: -64.62 },
  "vi": { capital: "Charlotte Amalie", tz: "America/St_Thomas", curr: "USD", sym: "$", lang: "English", lat: 18.34, lon: -64.93 },
  "vu": { capital: "Port Vila", tz: "Pacific/Efate", curr: "VUV", sym: "VT", lang: "Bislama, English, French", lat: -17.73, lon: 168.32 },
  "wf": { capital: "Mata-Utu", tz: "Pacific/Wallis", curr: "XPF", sym: "₣", lang: "French", lat: -13.28, lon: -176.17 },
  "ws": { capital: "Apia", tz: "Pacific/Apia", curr: "WST", sym: "WS$", lang: "Samoan, English", lat: -13.83, lon: -171.76 },
  "ye": { capital: "Sanaa", tz: "Asia/Aden", curr: "YER", sym: "﷼", lang: "Arabic", lat: 15.36, lon: 44.19 },
  "yt": { capital: "Mamoudzou", tz: "Indian/Mayotte", curr: "EUR", sym: "€", lang: "French", lat: -12.78, lon: 45.22 },
  "zm": { capital: "Lusaka", tz: "Africa/Lusaka", curr: "ZMW", sym: "ZK", lang: "English", lat: -15.38, lon: 28.32 },
  "zw": { capital: "Harare", tz: "Africa/Harare", curr: "USD", sym: "$", lang: "English, Shona", lat: -17.82, lon: 31.05 }
};

function buildAll249CountryMeta(): Record<string, CountryMeta> {
  const result: Record<string, CountryMeta> = {};
  const allCodes = Object.keys(NAME_MAP_249);

  for (const rawCode of allCodes) {
    const code = rawCode.toLowerCase();
    const countryName = NAME_MAP_249[code] || code.toUpperCase();
    const continent = getContinentForCountry(code);
    const specific = SPECIFIC_COUNTRY_META[code];
    const geo = CAPITAL_AND_TZ_249[code];

    // Region defaults as specified in Phase 1.5
    let regionDefault: CountryMeta = {
      capital: geo?.capital || `${countryName} Capital`,
      language: geo?.lang || "English",
      currency: geo?.curr || "USD",
      currencySymbol: geo?.sym || "$",
      timeZone: geo?.tz || "UTC",
      bestTime: "Apr-Oct",
      processing: "10-15 Days",
      successRate: "88%",
      indians: "15k+",
      festivals: `National Day, Cultural Festival`,
      topJobs: "IT, Hospitality, Trade, Engineering",
      topUnis: `National University of ${countryName}`,
      hotelPrice: "$80/night",
      flightPrice: "₹40k",
      advisory: "Safe",
      lat: geo?.lat ?? 20.0,
      lon: geo?.lon ?? 0.0
    };

    if (continent === 'europe') {
      regionDefault = {
        ...regionDefault,
        currency: geo?.curr || "EUR",
        currencySymbol: geo?.sym || "€",
        timeZone: geo?.tz || "Europe/Berlin",
        bestTime: "May-Sep",
        processing: "15 Days Schengen",
        successRate: "87%",
        indians: "20k+",
        festivals: "Summer Cultural Festival, Christmas Markets",
        topJobs: "Engineering, IT, Finance, Tourism",
        topUnis: `${regionDefault.capital} State University`,
        hotelPrice: "€90/night",
        flightPrice: "₹38k",
        advisory: "Safe"
      };
    } else if (continent === 'asia') {
      regionDefault = {
        ...regionDefault,
        timeZone: geo?.tz || "Asia/Singapore",
        bestTime: "Nov-Feb",
        processing: "3-7 Days e-Visa",
        successRate: "94%",
        indians: "35k+",
        festivals: "Lunar New Year, Harvest Festival",
        topJobs: "IT, Trade, Manufacturing, Tourism",
        topUnis: `National University of ${countryName}`,
        hotelPrice: "$55/night",
        flightPrice: "₹20k",
        advisory: "Safe"
      };
    } else if (continent === 'middle_east') {
      regionDefault = {
        ...regionDefault,
        timeZone: geo?.tz || "Asia/Dubai",
        bestTime: "Nov-Mar",
        processing: "3-5 Days e-Visa",
        successRate: "93%",
        indians: "150k+",
        festivals: "Eid al-Fitr, Shopping & Culture Festival",
        topJobs: "Oil & Gas, Construction, Hospitality, Healthcare",
        topUnis: `${countryName} International University`,
        hotelPrice: "$80/night",
        flightPrice: "₹18k",
        advisory: ["sy", "ye", "iq", "ir", "ps"].includes(code) ? "Caution" : "Safe"
      };
    } else if (continent === 'africa') {
      regionDefault = {
        ...regionDefault,
        timeZone: geo?.tz || "Africa/Nairobi",
        bestTime: "Jun-Oct",
        processing: "5-10 Days e-Visa VOA",
        successRate: "85%",
        indians: "12k+",
        festivals: "National Heritage & Wildlife Festival",
        topJobs: "Mining, Agriculture, Telecom, Trade",
        topUnis: `University of ${regionDefault.capital}`,
        hotelPrice: "$65/night",
        flightPrice: "₹42k",
        advisory: ["mu", "sc", "bw", "na", "rw", "ma", "eg", "tz", "ke"].includes(code) ? "Safe" : "Caution"
      };
    } else if (continent === 'north_america' || continent === 'south_america') {
      regionDefault = {
        ...regionDefault,
        timeZone: geo?.tz || "America/New_York",
        bestTime: "Apr-Oct",
        processing: "10-20 Days",
        successRate: "88%",
        indians: "18k+",
        festivals: "Carnival, Independence Festival",
        topJobs: "Tourism, Finance, IT, Agribusiness",
        topUnis: `National University of ${countryName}`,
        hotelPrice: "$95/night",
        flightPrice: "₹55k",
        advisory: "Safe"
      };
    } else if (continent === 'oceania') {
      regionDefault = {
        ...regionDefault,
        currency: geo?.curr || "AUD",
        currencySymbol: geo?.sym || "A$",
        timeZone: geo?.tz || "Pacific/Auckland",
        bestTime: "Sep-May",
        processing: "15-30 Days",
        successRate: "89%",
        indians: "10k+",
        festivals: "Pacific Arts & Island Festival",
        topJobs: "Hospitality, Marine Conservation, Healthcare",
        topUnis: `University of the South Pacific (${regionDefault.capital})`,
        hotelPrice: "A$130/night",
        flightPrice: "₹58k",
        advisory: "Safe"
      };
    }

    const merged: CountryMeta = {
      ...regionDefault,
      ...(specific || {})
    };

    result[code] = merged;
    result[code.toUpperCase()] = merged;
  }

  // Ensure aliases like UK / EU / SCH work seamlessly
  if (result["gb"]) {
    result["uk"] = result["gb"];
    result["UK"] = result["gb"];
  }
  if (result["de"]) {
    result["eu"] = { ...result["de"], capital: "Brussels", topUnis: "Sorbonne, TU Munich, KU Leuven" };
    result["EU"] = result["eu"];
  }

  return result;
}

export const COUNTRY_META_249: Record<string, CountryMeta> = buildAll249CountryMeta();

export function getCountryMeta(code: string): CountryMeta {
  const norm = (code || "us").trim().toLowerCase();
  return COUNTRY_META_249[norm] || COUNTRY_META_249["us"];
}

export function getCapitalSlug(capital: string): string {
  return (capital || "city")
    .toLowerCase()
    .replace(/d\.c\./g, "dc")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
