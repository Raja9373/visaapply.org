import React, { useState, useEffect, useMemo } from 'react';
import {
  TRAVELPAYOUTS_CONFIG,
  AIRPORT_IATA_MAP,
  getFlightLinkForCountry,
} from '../data/travelpayoutsConfig';
import { NAME_MAP_249, FLAG_MAP_249 } from '../data/fullVisaDatabase';
import { getCountryMeta, getCapitalSlug } from '../data/countryMetaData';

interface FlightsPageProps {
  onNavigate: (path: string) => void;
}

const INDIAN_ORIGIN_AIRPORTS = [
  { iata: 'DEL', label: '🇮🇳 New Delhi (DEL - IGI Airport)' },
  { iata: 'BOM', label: '🇮🇳 Mumbai (BOM - CSMIA)' },
  { iata: 'BLR', label: '🇮🇳 Bengaluru (BLR - Kempegowda)' },
  { iata: 'MAA', label: '🇮🇳 Chennai (MAA - Anna Intl)' },
  { iata: 'HYD', label: '🇮🇳 Hyderabad (HYD - RGIA)' },
  { iata: 'CCU', label: '🇮🇳 Kolkata (CCU - Netaji Subhas)' },
  { iata: 'AMD', label: '🇮🇳 Ahmedabad (AMD - Sardar Vallabhbhai)' },
  { iata: 'COK', label: '🇮🇳 Kochi (COK - Cochin Intl)' },
  { iata: 'DXB', label: '🇦🇪 Dubai (DXB - Dubai Intl, UAE)' },
  { iata: 'AUH', label: '🇦🇪 Abu Dhabi (AUH - Zayed Intl, UAE)' },
  { iata: 'NYC', label: '🇺🇸 New York (JFK / NYC - USA)' },
  { iata: 'LON', label: '🇬🇧 London (LHR / LON - UK)' },
  { iata: 'YYZ', label: '🇨🇦 Toronto (YYZ - Pearson, Canada)' },
  { iata: 'SYD', label: '🇦🇺 Sydney (SYD - Kingsford Smith, Australia)' },
  { iata: 'SIN', label: '🇸🇬 Singapore (SIN - Changi)' },
  { iata: 'FRA', label: '🇩🇪 Frankfurt (FRA - Germany)' },
  { iata: 'PAR', label: '🇫🇷 Paris (CDG / PAR - France)' },
  { iata: 'RUH', label: '🇸🇦 Riyadh (RUH - Saudi Arabia)' },
  { iata: 'DOH', label: '🇶🇦 Doha (DOH - Hamad Intl, Qatar)' },
  { iata: 'TYO', label: '🇯🇵 Tokyo (HND / NRT - Japan)' },
  { iata: 'BKK', label: '🇹🇭 Bangkok (BKK - Suvarnabhumi, Thailand)' },
  { iata: 'KUL', label: '🇲🇾 Kuala Lumpur (KUL - Malaysia)' },
];

const QUICK_POPULAR_FLIGHTS = [
  { code: 'ae', iata: 'DXB', name: 'Dubai', price: '₹14,800' },
  { code: 'us', iata: 'NYC', name: 'USA (DEL/DXB→NYC)', price: '₹45,200' },
  { code: 'gb', iata: 'LON', name: 'UK', price: '₹38,500' },
  { code: 'sg', iata: 'SIN', name: 'Singapore', price: '₹18,500' },
  { code: 'th', iata: 'BKK', name: 'Thailand', price: '₹12,500' },
  { code: 'au', iata: 'SYD', name: 'Australia', price: '₹52,000' },
];

function resolveCountryAndIata(rawParam: string): { countryCode: string; iata: string } {
  const clean = (rawParam || 'ae').trim();
  const lower = clean.toLowerCase();
  const upper = clean.toUpperCase();

  // Direct 2-letter country code match
  if (NAME_MAP_249[lower]) {
    return {
      countryCode: lower,
      iata: AIRPORT_IATA_MAP[lower] || upper,
    };
  }

  // Match by IATA code (e.g., NYC -> us, DXB -> ae, LON -> gb)
  for (const [cCode, iataCode] of Object.entries(AIRPORT_IATA_MAP)) {
    if (iataCode.toUpperCase() === upper) {
      return { countryCode: cCode, iata: iataCode };
    }
  }

  return {
    countryCode: 'ae',
    iata: upper.length === 3 ? upper : 'DXB',
  };
}

export const FlightsPage: React.FC<FlightsPageProps> = ({ onNavigate }) => {
  const [fromIata, setFromIata] = useState<string>('DEL');
  const [selectedCountry, setSelectedCountry] = useState<string>('ae');
  const [toIata, setToIata] = useState<string>('DXB');
  const [countrySearch, setCountrySearch] = useState<string>('');

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromParam = params.get('from');
      const toParam = params.get('to');
      if (fromParam && fromParam.trim()) {
        setFromIata(fromParam.trim().toUpperCase());
      }
      if (toParam && toParam.trim()) {
        const resolved = resolveCountryAndIata(toParam);
        setSelectedCountry(resolved.countryCode);
        setToIata(resolved.iata);
      }
    } catch (e) {}
  }, []);

  const handleSelectDestination = (codeOrIata: string, newFrom: string = fromIata) => {
    const resolved = resolveCountryAndIata(codeOrIata);
    setSelectedCountry(resolved.countryCode);
    setToIata(resolved.iata);
    setFromIata(newFrom);
    const nextUrl = `/flights?from=${newFrom}&to=${resolved.iata}`;
    window.history.pushState({}, '', nextUrl);
  };

  const countryName = NAME_MAP_249[selectedCountry] || 'United Arab Emirates';
  const countryFlag = FLAG_MAP_249[selectedCountry] || '🇦🇪';
  const meta = getCountryMeta(selectedCountry);
  const flightInfo = getFlightLinkForCountry(selectedCountry);
  const capitalSlug = getCapitalSlug(meta.capital);

  const aviasalesSearchUrl = `https://www.aviasales.com/search/${fromIata}${toIata}?marker=${TRAVELPAYOUTS_CONFIG.marker}&with_request=true&locale=en&currency=inr`;
  const skyscannerRouteUrl = flightInfo.skyscannerLink;

  const filteredCountries249 = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    const allCodes = Object.keys(NAME_MAP_249);
    const filtered = allCodes.filter((code) => {
      if (!q) return true;
      const name = NAME_MAP_249[code].toLowerCase();
      const cap = getCountryMeta(code).capital.toLowerCase();
      const iata = (AIRPORT_IATA_MAP[code] || code).toLowerCase();
      return name.includes(q) || cap.includes(q) || code.includes(q) || iata.includes(q);
    });
    return filtered.slice(0, 24);
  }, [countrySearch]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg,#0f172a,#1e293b)',
          color: 'white',
          padding: '32px 20px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '36px', fontWeight: 900, margin: 0 }}>
          ✈ Cheap Flights from India - 249 Countries
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '14px' }}>
          Powered by Travelpayouts ID {TRAVELPAYOUTS_CONFIG.id} + Skyscanner{' '}
          {TRAVELPAYOUTS_CONFIG.skyscannerId} + Aviasales • Search 100+ Airlines • Best Price
          Guarantee
        </p>
        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
            }}
          >
            🔍 100+ Airlines
          </span>
          <span
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
            }}
          >
            💰 Best Price
          </span>
          <span
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
            }}
          >
            🎫 Instant Booking
          </span>
          <span
            style={{
              background: '#10b981',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            ✅ ID {TRAVELPAYOUTS_CONFIG.id} Active
          </span>
        </div>
      </div>

      {/* Quick Links - 6 Popular Destinations */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '20px auto',
          padding: '0 20px',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {QUICK_POPULAR_FLIGHTS.map((c) => {
          const isSelected = selectedCountry === c.code;
          return (
            <a
              key={c.code}
              href={`/flights?from=${fromIata}&to=${c.iata}`}
              onClick={(e) => {
                e.preventDefault();
                handleSelectDestination(c.code, fromIata);
              }}
              style={{
                background: isSelected ? '#003580' : 'white',
                border: isSelected ? '1px solid #003580' : '1px solid #e2e8f0',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                color: isSelected ? 'white' : '#0f172a',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                cursor: 'pointer',
              }}
            >
              {FLAG_MAP_249[c.code]} {c.name} From {c.price}
            </a>
          );
        })}
      </div>

      {/* Interactive Flight Route Control Bar (Origin + All 249 Destination Countries + Direct Launch) */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto 20px',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '18px',
            border: '2px solid #003580',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(0,53,128,0.08)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              alignItems: 'end',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#475569',
                  marginBottom: '6px',
                }}
              >
                🛫 DEPARTURE CITY (INDIA)
              </label>
              <select
                value={fromIata}
                onChange={(e) => handleSelectDestination(selectedCountry, e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: '#f8fafc',
                }}
              >
                {INDIAN_ORIGIN_AIRPORTS.map((ap) => (
                  <option key={ap.iata} value={ap.iata}>
                    {ap.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#475569',
                  marginBottom: '6px',
                }}
              >
                🛬 DESTINATION COUNTRY (ALL 249)
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => handleSelectDestination(e.target.value, fromIata)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 700,
                  background: '#f8fafc',
                }}
              >
                {Object.keys(NAME_MAP_249)
                  .sort((a, b) => NAME_MAP_249[a].localeCompare(NAME_MAP_249[b]))
                  .map((code) => {
                    const f = getFlightLinkForCountry(code);
                    return (
                      <option key={code} value={code}>
                        {FLAG_MAP_249[code]} {NAME_MAP_249[code]} ({f.iata}) — From {f.priceINR}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a
                href={aviasalesSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  background: '#10b981',
                  color: 'white',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 800,
                  textDecoration: 'none',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                ✈ Search {fromIata}→{toIata} ({flightInfo.priceINR}) →
              </a>
              <a
                href={skyscannerRouteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#003580',
                  color: 'white',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                Skyscanner →
              </a>
            </div>
          </div>

          {/* Selected Country Visa + Hotel Quick Bar */}
          <div
            style={{
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12px',
            }}
          >
            <div style={{ color: '#334155' }}>
              Selected Route:{' '}
              <strong>
                🇮🇳 {fromIata} → {countryFlag} {countryName} ({meta.capital} - {toIata})
              </strong>{' '}
              • Est. Fare: <strong style={{ color: '#059669' }}>{flightInfo.priceINR}</strong> • Visa
              Processing: <strong>{meta.processing}</strong> ({meta.successRate} Approval)
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => onNavigate(`/in-to-${selectedCountry}`)}
                style={{
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                📋 {countryName} Visa Requirements →
              </button>
              <a
                href={`https://www.booking.com/city/${selectedCountry}/${capitalSlug}.html?aid=${TRAVELPAYOUTS_CONFIG.bookingComAid}&label=flights-page-${selectedCountry}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#003580',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                🏨 {meta.capital} Hotels ({meta.hotelPrice}) →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* White Label Iframe - Main Search */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '20px auto',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              background: '#003580',
              color: 'white',
              padding: '12px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800 }}>
              🌍 VisaApply White Label Flight Search — Marker #{TRAVELPAYOUTS_CONFIG.marker} ({fromIata}{' '}
              → {toIata})
            </div>
            <a
              href={aviasalesSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#10b981',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              Open Fullscreen Flight Search ↗
            </a>
          </div>
          <iframe
            src={aviasalesSearchUrl}
            style={{ width: '100%', height: '700px', border: 'none' }}
            title="VisaApply Flight Search - Travelpayouts 801550"
          />
        </div>
      </div>

      {/* Browse All 249 Countries Flight Deals Grid */}
      <div style={{ maxWidth: '1200px', margin: '28px auto', padding: '0 20px' }}>
        <div
          style={{
            background: 'white',
            borderRadius: '18px',
            border: '1px solid #e2e8f0',
            padding: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                🛫 Live Flight Fares from {fromIata} Across 249 Countries
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
                Click any country below to load live {fromIata}→Destination fares with Travelpayouts ID{' '}
                {TRAVELPAYOUTS_CONFIG.id}
              </p>
            </div>
            <input
              type="text"
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              placeholder="Search country, capital, or IATA (e.g. Tokyo, LON, Canada)..."
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                minWidth: '260px',
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '10px',
            }}
          >
            {filteredCountries249.map((code) => {
              const f = getFlightLinkForCountry(code);
              const name = NAME_MAP_249[code];
              const flag = FLAG_MAP_249[code];
              return (
                <div
                  key={code}
                  onClick={() => handleSelectDestination(code, fromIata)}
                  style={{
                    border: selectedCountry === code ? '2px solid #003580' : '1px solid #e2e8f0',
                    background: selectedCountry === code ? '#eff6ff' : '#f8fafc',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      {flag} {name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {fromIata}→{f.iata} • {f.priceINR}
                    </div>
                  </div>
                  <a
                    href={f.aviasalesLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      padding: '5px 8px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    Book ↗
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alternative - Aviasales Widget (If White Label pending) */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '20px auto',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            padding: '20px',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
          }}
        >
          <h3 style={{ fontWeight: 800, margin: 0, fontSize: '16px', color: '#0f172a' }}>
            🔧 Alternative - Aviasales Widget & White Label Setup (Travelpayouts ID{' '}
            {TRAVELPAYOUTS_CONFIG.id})
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            White Label Brand Color: <b>#003580</b> (Booking.com Blue) + <b>#10b981</b> (Green CTA) •
            Direct Widget Embed Code:
          </p>
          <pre
            style={{
              background: '#f8fafc',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '11px',
              overflowX: 'auto',
              marginTop: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            {`<script src="//www.travelpayouts.com/widgets/801550/flights.js" data-marker="801550" data-origin="${fromIata}" data-destination="${toIata}" data-origin-iata="${fromIata}" data-destination-iata="${toIata}"></script>`}
          </pre>
        </div>
      </div>

      {/* Footer with monetization info */}
      <div style={{ textAlign: 'center', padding: '24px', fontSize: '11px', color: '#64748b' }}>
        Flight search powered by Travelpayouts ID {TRAVELPAYOUTS_CONFIG.id} (Approved) • Skyscanner
        ID {TRAVELPAYOUTS_CONFIG.skyscannerId} (In Review) • Booking.com AID{' '}
        {TRAVELPAYOUTS_CONFIG.bookingComAid} (Approved) • Aviasales • 100+ Airlines • Commission
        $2-$10 per booking
      </div>
    </div>
  );
};
