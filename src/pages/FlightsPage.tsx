import React, { useState, useEffect } from 'react';
import {
  TRAVELPAYOUTS_CONFIG,
  AIRPORT_IATA_MAP,
  getFlightLinkForCountry,
} from '../data/travelpayoutsConfig';
import { NAME_MAP_249, FLAG_MAP_249 } from '../data/fullVisaDatabase';
import { getCountryMeta, getCapitalSlug } from '../data/countryMetaData';
import { TopFreeToolsStrip } from '../components/TopFreeToolsStrip';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';
import { HotelBookingWidget } from '../components/HotelBookingWidget';
import { FlightSearchWidget } from '../components/FlightSearchWidget';

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

  if (NAME_MAP_249[lower]) {
    return {
      countryCode: lower,
      iata: AIRPORT_IATA_MAP[lower] || upper,
    };
  }

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
  const hotelCityName =
    selectedCountry === 'ae'
      ? 'Abu Dhabi'
      : toIata === 'NYC'
      ? 'New York'
      : toIata === 'LON' || toIata === 'LHR'
      ? 'London'
      : meta.capital || countryName;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '60px' }}>
      {/* Top Back Bar & Breadcrumb */}
      <PageBackBar onNavigate={onNavigate} pageName="Flight Search" category="Travel" />

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
          ✈ Cheap Flights &amp; Hotels - 249 Countries
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '10px', fontSize: '14px' }}>
          Embedded Live Search Widgets • Aviasales Fares • Booking.com Free Cancellation
        </p>
      </div>

      {/* Phase 1 TOP Free Tools Strip */}
      <TopFreeToolsStrip onNavigate={onNavigate} theme="light" className="my-2" />

      {/* Main Content Area */}
      <div style={{ maxWidth: '1000px', margin: '24px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Route Quick Selector */}
        <div
          style={{
            background: 'white',
            borderRadius: '18px',
            border: '2px solid #003580',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(0,53,128,0.08)',
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
            Select Route for Quick Widget Sync:
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              alignItems: 'end',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                🛫 DEPARTURE CITY
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
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                🛬 DESTINATION COUNTRY
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
                        {FLAG_MAP_249[code]} {NAME_MAP_249[code]} ({f.iata})
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>
        </div>

        {/* EMBEDDED WIDGET 1: Flight Search Widget */}
        <FlightSearchWidget defaultFrom={fromIata} defaultTo={toIata} />

        {/* EMBEDDED WIDGET 2: Hotel Booking Widget */}
        <HotelBookingWidget defaultCity={hotelCityName} />

      </div>

      {/* Bottom Back Button */}
      <PageBottomBack onNavigate={onNavigate || (() => {})} />
    </div>
  );
};
