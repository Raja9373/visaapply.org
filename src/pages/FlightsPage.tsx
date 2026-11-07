import React, { useState, useEffect } from 'react';
import {
  TRAVELPAYOUTS_CONFIG,
  AIRPORT_IATA_MAP,
  getFlightLinkForCountry,
} from '../data/travelpayoutsConfig';
import { NAME_MAP_249, FLAG_MAP_249 } from '../data/fullVisaDatabase';
import { getCountryMeta, getCapitalSlug } from '../data/countryMetaData';
import { TopFreeToolsStrip } from '../components/TopFreeToolsStrip';

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
  { code: 'us', iata: 'NYC', name: 'USA (NYC)', price: '₹45,200' },
  { code: 'gb', iata: 'LHR', name: 'London (LHR)', price: '₹38,500' },
  { code: 'sg', iata: 'SIN', name: 'Singapore', price: '₹18,500' },
  { code: 'th', iata: 'BKK', name: 'Thailand', price: '₹12,500' },
  { code: 'au', iata: 'SYD', name: 'Australia', price: '₹52,000' },
];

const IATA_AIRPORT_ALIASES: Record<string, { countryCode: string; iata: string }> = {
  LHR: { countryCode: 'gb', iata: 'LHR' },
  LGW: { countryCode: 'gb', iata: 'LGW' },
  LON: { countryCode: 'gb', iata: 'LON' },
  NYC: { countryCode: 'us', iata: 'NYC' },
  JFK: { countryCode: 'us', iata: 'JFK' },
  EWR: { countryCode: 'us', iata: 'EWR' },
  DXB: { countryCode: 'ae', iata: 'DXB' },
  AUH: { countryCode: 'ae', iata: 'AUH' },
  FRA: { countryCode: 'de', iata: 'FRA' },
  PAR: { countryCode: 'fr', iata: 'PAR' },
  CDG: { countryCode: 'fr', iata: 'CDG' },
};

function resolveCountryAndIata(rawParam: string): { countryCode: string; iata: string } {
  const clean = (rawParam || 'ae').trim();
  const lower = clean.toLowerCase();
  const upper = clean.toUpperCase();

  if (IATA_AIRPORT_ALIASES[upper]) {
    return IATA_AIRPORT_ALIASES[upper];
  }

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

  const aviasalesDirectUrl = `https://www.aviasales.com/?marker=801550&with_request=true&locale=en&currency=inr&origin_iata=${fromIata}&destination_iata=${toIata}`;
  const bookingComDirectUrl = 'https://www.booking.com/?aid=8119919';
  const hotelCityName =
    selectedCountry === 'ae'
      ? 'Abu Dhabi'
      : toIata === 'NYC'
      ? 'New York'
      : toIata === 'LON' || toIata === 'LHR'
      ? 'London'
      : meta.capital || countryName;
  const hotelButtonLabel = `Check ${hotelCityName} Hotels →`;

  const aviasalesSearchUrl = aviasalesDirectUrl;
  const skyscannerRouteUrl = flightInfo.skyscannerLink;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg,#0f172a,#1e293b)',
          color: 'white',
          padding: '36px 20px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '34px', fontWeight: 900, margin: 0 }}>
          ✈ Cheap Flights from India - 249 Countries
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '10px', fontSize: '14px' }}>
          Compare 100+ Airlines with Aviasales &amp; Skyscanner • Real-Time Live Fares • Best Price Guarantee
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
            ✅ Live Search Active
          </span>
        </div>
      </div>

      {/* Phase 1 TOP Free Tools Strip */}
      <TopFreeToolsStrip onNavigate={onNavigate} theme="light" className="my-2" />

      {/* Top Route Selector (Origin + All 249 Destination Countries) */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '24px auto',
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

      {/* 2 Big Action Buttons: Aviasales (marker=801550) + Booking.com (aid=8119919) */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto 28px',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            padding: '28px 24px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
            Instant Flight &amp; Hotel Deals ({fromIata} → {toIata})
          </div>
          <p
            style={{
              fontSize: '13px',
              color: '#64748b',
              maxWidth: '640px',
              margin: '0 auto 20px',
              lineHeight: 1.5,
            }}
          >
            Compare real-time airline fares across 100+ carriers on Aviasales and find discounted hotel bookings with free cancellation on Booking.com.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <a
              href={aviasalesDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#10b981',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
                cursor: 'pointer',
              }}
            >
              Search Flights on Aviasales →
            </a>
            <a
              href={bookingComDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#003580',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '14px',
                fontSize: '16px',
                fontWeight: 800,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(0, 53, 128, 0.35)',
                cursor: 'pointer',
              }}
            >
              {hotelButtonLabel}
            </a>
          </div>
        </div>
      </div>

      {/* 6 Quick Routes Cards Below */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto 40px',
          padding: '0 20px',
        }}
      >
        <div style={{ marginBottom: '18px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            🔥 Popular Direct Routes from India
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Instant flight deals for top international travel corridors
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {QUICK_POPULAR_FLIGHTS.map((c) => {
            const isSelected = selectedCountry === c.code;
            const routeAviasalesUrl = `https://www.aviasales.com/?marker=801550&with_request=true&locale=en&currency=inr&origin_iata=${fromIata}&destination_iata=${c.iata}`;
            return (
              <div
                key={c.code}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  border: isSelected ? '2px solid #003580' : '1px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: isSelected ? '0 8px 20px rgba(0,53,128,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div
                      style={{
                        fontSize: '18px',
                        fontWeight: 800,
                        color: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span>{FLAG_MAP_249[c.code]}</span>
                      <span>{c.name}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>
                      {fromIata} → {c.iata}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Starting from</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#059669' }}>
                      {c.price}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleSelectDestination(c.code, fromIata)}
                    style={{
                      flex: 1,
                      background: isSelected ? '#003580' : '#f1f5f9',
                      color: isSelected ? 'white' : '#334155',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isSelected ? '✓ Selected' : 'Select Route'}
                  </button>
                  <a
                    href={routeAviasalesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      background: '#10b981',
                      color: 'white',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 800,
                      textDecoration: 'none',
                      textAlign: 'center',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 8px rgba(16,185,129,0.25)',
                    }}
                  >
                    Search Flights ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clean ending note - No empty iframe or broken icons */}
      <div
        style={{
          textAlign: 'center',
          padding: '24px 20px 48px',
          fontSize: '12px',
          color: '#64748b',
        }}
      >
        Flight search powered by 100+ airlines, Aviasales, Skyscanner, and Booking.com. All fares subject to real-time seat availability.
      </div>
    </div>
  );
};
