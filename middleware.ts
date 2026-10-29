import { COUNTRY_TO_LANGUAGE_MAP } from './src/data/languageMap';

export default function middleware(request: Request) {
  const url = new URL(request.url);

  // Extract IP country from Vercel / Cloudflare headers
  const countryHeader = request.headers.get('x-vercel-ip-country') || 
                        request.headers.get('cf-ipcountry') || 
                        request.headers.get('x-country-code') || 
                        'US';
  
  const country = countryHeader.toUpperCase();
  const language = COUNTRY_TO_LANGUAGE_MAP[country] || 'en';

  const responseHeaders = new Headers();
  responseHeaders.set('x-user-country', country);
  responseHeaders.set('x-user-language', language);

  return new Response(null, {
    status: 200,
    headers: responseHeaders
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)']
};
