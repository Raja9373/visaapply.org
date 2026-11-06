import React, { useState } from 'react';
import { getEmbassyInfo } from '../data/embassyAddresses';
import { getCountryMeta } from '../data/countryMetaData';

interface EmbassyFinderProps {
  countryCode: string;
  countryName: string;
  onNavigate?: (path: string) => void;
}

export const EmbassyFinder: React.FC<EmbassyFinderProps> = ({ countryCode, countryName, onNavigate }) => {
  const [selectedCityIdx, setSelectedCityIdx] = useState<number>(0);
  const [showFullQA, setShowFullQA] = useState<boolean>(false);

  const codeUpper = (countryCode || 'US').toUpperCase();
  const embassy = getEmbassyInfo(codeUpper);
  const meta = getCountryMeta(countryCode);
  const missions =
    embassy.inIndia && embassy.inIndia.length > 0
      ? embassy.inIndia
      : [
          {
            city: 'New Delhi (Main Embassy)',
            address: 'Chanakyapuri Diplomatic Enclave, New Delhi - 110021',
            phone: '+91-11-2688-0000',
            email: `consular.${countryCode.toLowerCase()}@embassy-india.org`,
            timings: 'Mon-Fri 9:00 AM - 5:00 PM'
          }
        ];

  const activeMission = missions[selectedCityIdx] || missions[0];
  const mapQuery = encodeURIComponent(`${countryName} embassy ${activeMission.city}`);

  const fullQuestions = [
    {
      q: `1. Why do you want to visit ${countryName} at this time?`,
      a: `State your exact travel purpose clearly (e.g., sightseeing in ${meta.capital}, attending a business meeting, or visiting family). Mention the best season (${meta.bestTime}) and your planned day-by-day itinerary.`
    },
    {
      q: `2. How long will you stay in ${countryName} and when will you return?`,
      a: `Specify your exact arrival and departure dates matching your flight reservation and approved leave letter from your employer in India.`
    },
    {
      q: `3. Who is funding your trip and what is your annual income?`,
      a: `Present your last 6 months bank statements and 3 years ITR. Mention your liquid savings covering flights (${meta.flightPrice}), hotels (${meta.hotelPrice} in ${meta.capital}), and daily expenses.`
    },
    {
      q: `4. What are your strong ties to India that guarantee your return?`,
      a: `Highlight your permanent job/business in India, Employer NOC with approved leave dates, property ownership, and immediate family responsibilities.`
    },
    {
      q: `5. Have you traveled internationally before?`,
      a: `Mention any prior visas (Schengen, UK, USA, UAE, Singapore, Thailand, etc.) and emphasize that you always complied with visa validity rules.`
    },
    {
      q: `6. Where will you stay in ${countryName}?`,
      a: `Provide the name and address of your booked hotel in ${meta.capital} (or host's residential address and invitation letter).`
    }
  ];

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 sm:p-5 mb-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-extrabold text-base text-slate-900">
          🏛 Embassy & VFS Info for Indians — {countryName}
        </h3>
        {missions.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {missions.map((m, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedCityIdx(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  selectedCityIdx === idx
                    ? 'bg-[#0f172a] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {m.city.split(' ')[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left Box: Embassy Location & VFS */}
        <div className="bg-[#f8fafc] p-3.5 rounded-xl border border-[#e2e8f0] flex flex-col justify-between">
          <div>
            <div className="font-bold text-[13px] text-slate-900">
              📍 {countryName} Embassy - {activeMission.city}
            </div>
            <div className="text-xs text-[#475569] mt-1.5 leading-relaxed">
              <b>Address:</b> {activeMission.address}
              <br />
              <b>Phone:</b> {activeMission.phone || '+91-11-2688-0000'}
              <br />
              <b>Hours:</b> {activeMission.timings || 'Mon-Fri 9:00 AM - 5:00 PM'}
              <br />
              <b>VFS:</b> {embassy.vfs || 'Shivaji Stadium Metro Concourse, New Delhi / VFS Global Centers'}
            </div>
          </div>
          <div className="mt-3">
            <a
              href={activeMission.map || `https://maps.google.com/?q=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#0f172a] hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold no-underline transition-colors"
            >
              View on Map →
            </a>
          </div>
        </div>

        {/* Right Box: Interview Prep */}
        <div className="bg-[#fffbeb] p-3.5 rounded-xl border border-[#fde68a] flex flex-col justify-between">
          <div>
            <div className="font-bold text-[13px] text-amber-950">
              🎤 Interview Prep - {countryName}
            </div>
            <div className="text-xs text-[#78350f] mt-1.5 leading-relaxed">
              • Why do you want to visit {countryName}?
              <br />
              • How long will you stay in {meta.capital}?
              <br />
              • Who will fund your trip?
              <br />
              • Ties to India (job, family, property)?
              <br />
              • Prior international travel history?
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowFullQA((prev) => !prev)}
              className="bg-[#f59e0b] hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold border-none cursor-pointer transition-colors"
            >
              {showFullQA ? 'Hide Quick Q&A ▲' : 'Get Full Q&A →'}
            </button>
            <button
              type="button"
              onClick={() => {
                const target = `/interview-prep/${countryCode.toLowerCase()}`;
                if (onNavigate) onNavigate(target);
                else window.location.href = target;
              }}
              className="bg-[#0f172a] hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold border-none cursor-pointer transition-colors"
            >
              🎤 20 Questions + Mock Bot →
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Full Consular Interview Q&A */}
      {showFullQA && (
        <div className="mt-3 pt-3 border-t border-amber-200 bg-amber-50/60 rounded-xl p-3.5 space-y-2.5 text-xs">
          <div className="font-extrabold text-amber-950 text-sm">
            🎯 Official Consular Interview Questions & Model Answers for {countryName}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {fullQuestions.map((item, i) => (
              <div key={i} className="bg-white p-3 rounded-lg border border-amber-200">
                <div className="font-bold text-slate-900">{item.q}</div>
                <div className="text-slate-600 mt-1 leading-relaxed">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
