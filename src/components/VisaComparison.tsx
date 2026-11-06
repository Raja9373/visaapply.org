import React, { useEffect, useState } from 'react';
import { getCountryMeta, getCapitalSlug } from '../data/countryMetaData';
import { getLiveVisaCount, NAME_MAP_249, FLAG_MAP_249 } from '../data/fullVisaDatabase';
import {
  getLiveLocalTime,
  getCurrencyRate,
  parseHotelPriceUSD,
  parseProcessingDays,
  parseSuccessRateNum
} from '../utils/countryLiveUtils';

interface VisaComparisonProps {
  selectedCodes: string[];
  onRemoveCountry: (code: string) => void;
  onAddCountry?: (code: string) => void;
  onClose?: () => void;
  onNavigate?: (path: string) => void;
  fromCode?: string;
}

export const VisaComparison: React.FC<VisaComparisonProps> = ({
  selectedCodes,
  onRemoveCountry,
  onAddCountry,
  onClose,
  onNavigate,
  fromCode = 'in'
}) => {
  const [rates, setRates] = useState<Record<string, string>>({});
  const [pickerCode, setPickerCode] = useState<string>('de');

  const codes = selectedCodes.slice(0, 3).map((c) => c.toLowerCase());

  useEffect(() => {
    let active = true;
    codes.forEach((code) => {
      const meta = getCountryMeta(code);
      getCurrencyRate(meta.currency).then((r) => {
        if (active) {
          setRates((prev) => ({ ...prev, [code]: r }));
        }
      });
    });
    return () => {
      active = false;
    };
  }, [codes.join(',')]);

  if (codes.length === 0) return null;

  // Compute winners across selected countries
  const procDaysList = codes.map((c) => parseProcessingDays(getCountryMeta(c).processing));
  const minProcDays = Math.min(...procDaysList);

  const hotelPriceList = codes.map((c) => parseHotelPriceUSD(getCountryMeta(c).hotelPrice));
  const minHotelPrice = Math.min(...hotelPriceList);

  const successRateList = codes.map((c) => parseSuccessRateNum(getCountryMeta(c).successRate));
  const maxSuccessRate = Math.max(...successRateList);

  const allCodes = Object.keys(NAME_MAP_249).sort((a, b) =>
    (NAME_MAP_249[a] || a).localeCompare(NAME_MAP_249[b] || b)
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-5 sm:p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ⚖️ Side-by-Side Country Visa Comparison ({codes.length}/3 Selected)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Compare processing times, visa approval rates, live currency, and Booking.com hotel prices side by side.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {codes.length < 3 && onAddCountry && (
            <div className="flex items-center gap-1.5">
              <select
                value={pickerCode}
                onChange={(e) => setPickerCode(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50"
              >
                {allCodes
                  .filter((c) => !codes.includes(c.toLowerCase()))
                  .map((c) => (
                    <option key={c} value={c}>
                      {FLAG_MAP_249[c]} {NAME_MAP_249[c]}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={() => onAddCountry(pickerCode)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                + Add Country
              </button>
            </div>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
            >
              ✕ Close Comparison
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-2xl overflow-hidden border border-[#e2e8f0]">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
              <th className="p-3.5 text-left text-xs font-bold text-[#64748b] uppercase tracking-wider w-44">
                FEATURE
              </th>
              {codes.map((code) => {
                const name = NAME_MAP_249[code] || code.toUpperCase();
                const flag = FLAG_MAP_249[code] || '🌍';
                const count = getLiveVisaCount(code);
                return (
                  <th key={code} className="p-3.5 text-center min-w-[200px]">
                    <div className="flex flex-col items-center">
                      <div className="text-[32px] leading-none">{flag}</div>
                      <div className="font-extrabold text-sm sm:text-base text-slate-900 mt-1.5">
                        {name}
                      </div>
                      <span className="text-[11px] font-semibold text-[#64748b]">
                        {count} Visas
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        {onNavigate && (
                          <button
                            type="button"
                            onClick={() => onNavigate(`/${fromCode.toLowerCase()}-to-${code}`)}
                            className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            View Guides →
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onRemoveCountry(code)}
                          className="text-[11px] font-semibold text-red-500 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
            <tr>
              <td className="p-3 font-bold text-xs text-slate-700">📍 CAPITAL</td>
              {codes.map((code) => (
                <td key={code} className="p-3 text-center font-semibold text-slate-900">
                  {getCountryMeta(code).capital}
                </td>
              ))}
            </tr>

            <tr className="bg-[#f8fafc]">
              <td className="p-3 font-bold text-xs text-slate-700">💱 CURRENCY</td>
              {codes.map((code) => {
                const m = getCountryMeta(code);
                return (
                  <td key={code} className="p-3 text-center">
                    <span className="font-bold text-slate-900">
                      {m.currency} ({m.currencySymbol})
                    </span>
                    <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                      {rates[code] || 'Loading rate...'}
                    </div>
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="p-3 font-bold text-xs text-slate-700">🕐 TIME vs IST</td>
              {codes.map((code) => {
                const m = getCountryMeta(code);
                const lt = getLiveLocalTime(m.timeZone);
                return (
                  <td key={code} className="p-3 text-center">
                    <span className="font-bold text-slate-900">{lt.time}</span>
                    <div className="text-[11px] text-slate-500">{lt.diffFromIST}</div>
                  </td>
                );
              })}
            </tr>

            <tr className="bg-[#f8fafc]">
              <td className="p-3 font-bold text-xs text-slate-700">⏱ PROCESSING</td>
              {codes.map((code) => {
                const m = getCountryMeta(code);
                const days = parseProcessingDays(m.processing);
                const isFastest = codes.length > 1 && days === minProcDays;
                return (
                  <td
                    key={code}
                    className={`p-3 text-center font-bold ${
                      days <= 7 ? 'text-emerald-700' : 'text-amber-800'
                    }`}
                  >
                    <div>{m.processing}</div>
                    {isFastest && (
                      <span className="inline-block mt-1 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        ⚡ FASTEST
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="p-3 font-bold text-xs text-slate-700">💰 SUCCESS RATE</td>
              {codes.map((code) => {
                const m = getCountryMeta(code);
                const num = parseSuccessRateNum(m.successRate);
                const isHighest = codes.length > 1 && num === maxSuccessRate;
                return (
                  <td key={code} className="p-3 text-center">
                    <span className="bg-[#dcfce7] px-2.5 py-1 rounded-[10px] font-extrabold text-[#166534]">
                      {m.successRate}
                    </span>
                    {isHighest && (
                      <div className="mt-1">
                        <span className="inline-block bg-emerald-700 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          🏆 HIGHEST SUCCESS
                        </span>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>

            <tr className="bg-[#f8fafc]">
              <td className="p-3 font-bold text-xs text-slate-700">📅 BEST TIME</td>
              {codes.map((code) => (
                <td key={code} className="p-3 text-center font-medium text-slate-800">
                  {getCountryMeta(code).bestTime}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 font-bold text-xs text-slate-700">🏨 HOTEL FROM</td>
              {codes.map((code) => {
                const m = getCountryMeta(code);
                const capSlug = getCapitalSlug(m.capital);
                const priceNum = parseHotelPriceUSD(m.hotelPrice);
                const isCheapest = codes.length > 1 && priceNum === minHotelPrice;
                return (
                  <td key={code} className="p-3 text-center">
                    <a
                      href={`https://www.booking.com/city/${code}/${capSlug}.html?aid=8119919&label=compare-${code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-[#003580] hover:bg-[#002860] text-white px-3 py-1.5 rounded-lg no-underline text-xs font-bold transition-colors"
                    >
                      {m.hotelPrice} →
                    </a>
                    {isCheapest && (
                      <div className="mt-1">
                        <span className="inline-block bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          💎 CHEAPEST
                        </span>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>

            <tr className="bg-[#f8fafc]">
              <td className="p-3 font-bold text-xs text-slate-700">👥 INDIANS</td>
              {codes.map((code) => (
                <td key={code} className="p-3 text-center font-bold text-slate-800">
                  {getCountryMeta(code).indians}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-3 font-bold text-xs text-slate-700">💼 TOP JOBS</td>
              {codes.map((code) => (
                <td key={code} className="p-3 text-center text-xs text-slate-700">
                  {getCountryMeta(code).topJobs}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
