import type { VercelRequest, VercelResponse } from '@vercel/node';

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" }, { code: "CA", name: "Canada", flag: "🇨🇦" }, { code: "GB", name: "United Kingdom", flag: "🇬🇧" }, { code: "AU", name: "Australia", flag: "🇦🇺" }, { code: "DE", name: "Germany", flag: "🇩🇪" }, { code: "FR", name: "France", flag: "🇫🇷" }, { code: "AE", name: "UAE Dubai", flag: "🇦🇪" }, { code: "SG", name: "Singapore", flag: "🇸🇬" }, { code: "JP", name: "Japan", flag: "🇯🇵" }, { code: "IN", name: "India", flag: "🇮🇳" }, { code: "BR", name: "Brazil", flag: "🇧🇷" }, { code: "IT", name: "Italy", flag: "🇮🇹" }, { code: "ES", name: "Spain", flag: "🇪🇸" }, { code: "NL", name: "Netherlands", flag: "🇳🇱" }, { code: "NZ", name: "New Zealand", flag: "🇳🇿" }, { code: "SE", name: "Sweden", flag: "🇸🇪" }, { code: "CH", name: "Switzerland", flag: "🇨🇭" }, { code: "IE", name: "Ireland", flag: "🇮🇪" }, { code: "NO", name: "Norway", flag: "🇳🇴" }, { code: "PT", name: "Portugal", flag: "🇵🇹" }, { code: "DK", name: "Denmark", flag: "🇩🇰" }, { code: "FI", name: "Finland", flag: "🇫🇮" }, { code: "BE", name: "Belgium", flag: "🇧🇪" }, { code: "AT", name: "Austria", flag: "🇦🇹" }, { code: "PL", name: "Poland", flag: "🇵🇱" }, { code: "MY", name: "Malaysia", flag: "🇲🇾" }, { code: "TH", name: "Thailand", flag: "🇹🇭" }, { code: "TR", name: "Turkey", flag: "🇹🇷" }, { code: "ZA", name: "South Africa", flag: "🇿🇦" }, { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.url || "";

  if (url.includes('countries')) {
    return res.status(200).json(COUNTRIES);
  }

  if (url.includes('admin') || url.includes('auth') || req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const password = body?.password;
      const adminPass = process.env.ADMIN_PASSWORD || 'Alokms98';
      if (password === adminPass) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(401).json({ success: false, message: 'Wrong password' });
      }
    } catch(e) {
      return res.status(401).json({ success: false, message: 'Authentication failed' });
    }
  }

  if (url.includes('cron')) {
    return res.status(200).json({ success: true, message: 'Cron OK' });
  }

  return res.status(200).json(COUNTRIES);
}
