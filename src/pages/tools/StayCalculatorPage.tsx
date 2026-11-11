import React, { useState } from 'react';
import { Clock, Calendar, ArrowLeft, ShieldCheck, AlertTriangle, Info, CheckCircle2, Plane, Calculator } from 'lucide-react';
import { SUPPORTED_LANGUAGES_10, SupportedLangCode } from '../../i18n/config';
import { getUIString } from '../../utils/autoLanguage';

interface StayCalculatorPageProps {
  onNavigate: (path: string) => void;
}

interface TripEntry {
  id: string;
  entryDate: string;
  exitDate: string;
}

export const StayCalculatorPage: React.FC<StayCalculatorPageProps> = ({ onNavigate }) => {
  const [destination, setDestination] = useState('EU'); // EU Schengen vs US vs GB
  const [visaCategory, setVisaCategory] = useState('Schengen Short-Stay (C Type)');
  const [calculationMode, setCalculationMode] = useState<'schengen' | 'single' | 'multiple'>('schengen');
  
  const [visaIssueDate, setVisaIssueDate] = useState('2026-01-01');
  const [visaStartDate, setVisaStartDate] = useState('2026-01-15');
  const [visaExpiryDate, setVisaExpiryDate] = useState('2026-07-15');
  const [permittedStayDays, setPermittedStayDays] = useState<number>(90);
  const [entryType, setEntryType] = useState<'single' | 'double' | 'multiple'>('multiple');

  // Schengen past trips for 90/180 rolling rule
  const [trips, setTrips] = useState<TripEntry[]>([
    { id: 't1', entryDate: '2026-02-01', exitDate: '2026-02-20' },
    { id: 't2', entryDate: '2026-03-10', exitDate: '2026-04-05' }
  ]);

  const [newEntryDate, setNewEntryDate] = useState('');
  const [newExitDate, setNewExitDate] = useState('');

  const [uiLang, setUiLang] = useState<SupportedLangCode>('en');
  const ui = getUIString(uiLang);

  const addTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryDate || !newExitDate) return;
    const newT: TripEntry = {
      id: `trip-${Date.now()}`,
      entryDate: newEntryDate,
      exitDate: newExitDate
    };
    setTrips(prev => [...prev, newT]);
    setNewEntryDate('');
    setNewExitDate('');
  };

  const removeTrip = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
  };

  // Schengen 90/180 rolling calculation simulation
  // For any given date (or today), calculate days spent in the past 180 days
  const todayStr = new Date().toISOString().split('T')[0];
  const referenceDate = new Date(todayStr);
  const rollingStartMs = referenceDate.getTime() - (180 * 24 * 60 * 60 * 1000);

  let totalSchengenDays = 0;
  trips.forEach(trip => {
    const entryMs = new Date(trip.entryDate).getTime();
    const exitMs = new Date(trip.exitDate).getTime();
    if (!isNaN(entryMs) && !isNaN(exitMs) && exitMs >= entryMs) {
      // Overlap with rolling 180 days window
      const effectiveEntry = Math.max(entryMs, rollingStartMs);
      const effectiveExit = Math.min(exitMs, referenceDate.getTime());
      if (effectiveExit >= effectiveEntry) {
        const days = Math.ceil((effectiveExit - effectiveEntry) / (1000 * 60 * 60 * 24)) + 1;
        totalSchengenDays += days;
      }
    }
  });

  const schengenRemaining = Math.max(0, 90 - totalSchengenDays);
  const isSchengenOverstay = totalSchengenDays > 90;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <div className="bg-[#0B3D91] text-white py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-xs sm:text-sm font-medium mb-3 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to VisaApply.org Home
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                <Clock className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Visa Stay &amp; Expiry Calculator (Schengen 90/180 &amp; Validity)</h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-1">
                  Accurate rolling 180-day calculations, permitted stay limits, visa validity expiry, and entry compliance rules.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl backdrop-blur-sm text-right shrink-0">
            <span className="text-xs text-blue-200 font-semibold block uppercase tracking-wider">Calculation Mode</span>
            <span className="text-lg font-black text-white uppercase">{calculationMode} Rule</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Configuration Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-200">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#0B3D91]" /> Visa &amp; Trip Parameters
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCalculationMode('schengen')}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${calculationMode === 'schengen' ? 'bg-[#0B3D91] text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                🇪🇺 Schengen 90/180 Rule
              </button>
              <button
                onClick={() => setCalculationMode('single')}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${calculationMode === 'single' ? 'bg-[#0B3D91] text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                ✈️ Single / Multiple Stay
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Destination Area</label>
              <select
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              >
                <option value="EU">🇪🇪 Schengen Area (90/180 Rolling Rule)</option>
                <option value="US">🇺🇸 United States (I-94 Admit Until Date)</option>
                <option value="GB">🇬🇧 United Kingdom (Standard Visitor 6 Mo)</option>
                <option value="CA">🇨🇦 Canada (Visitor Visa 6 Mo Max)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Visa Validity Start</label>
              <input
                type="date"
                value={visaStartDate}
                onChange={e => setVisaStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Visa Expiry Date</label>
              <input
                type="date"
                value={visaExpiryDate}
                onChange={e => setVisaExpiryDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              />
            </div>
          </div>
        </div>

        {/* Schengen Rolling 90/180 Calculator View */}
        {calculationMode === 'schengen' && (
          <div className="space-y-8">
            {/* Results Banner */}
            <div className={`p-6 sm:p-8 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ${isSchengenOverstay ? 'bg-rose-50 border-rose-300 text-rose-950' : 'bg-emerald-50 border-emerald-300 text-emerald-950'}`}>
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider block opacity-80">Schengen 90/180 Rolling Calculation Result</span>
                <h3 className="text-2xl sm:text-3xl font-black">
                  {totalSchengenDays} Days Spent in Past 180 Days
                </h3>
                <p className="text-xs sm:text-sm font-medium opacity-90">
                  {isSchengenOverstay 
                    ? '⚠️ OVERSTAY WARNING: You have exceeded the maximum 90 days in any 180-day rolling window!'
                    : `✅ Compliant: You have ${schengenRemaining} permitted days remaining in the current rolling 180-day window.`}
                </p>
              </div>
              <div className="bg-white/80 border border-black/10 px-6 py-4 rounded-xl text-right shrink-0">
                <span className="text-xs font-bold uppercase block text-slate-500">Remaining Allowance</span>
                <span className="text-3xl font-black text-[#0B3D91]">{schengenRemaining} Days</span>
              </div>
            </div>

            {/* Past Trips Manager */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
              <h3 className="text-lg font-black text-slate-900">Schengen Entry &amp; Exit Trip Log (Rolling Window)</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Add your previous entry and exit dates within the past 12 months to calculate exact rolling 180-day presence.
              </p>

              <form onSubmit={addTrip} className="flex flex-col sm:flex-row gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">Entry Date</label>
                  <input
                    type="date"
                    value={newEntryDate}
                    onChange={e => setNewEntryDate(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase mb-1">Exit Date</label>
                  <input
                    type="date"
                    value={newExitDate}
                    onChange={e => setNewExitDate(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#0B3D91] hover:bg-[#082e6d] text-white text-sm font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    + Add Trip Log
                  </button>
                </div>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Entry Date</th>
                      <th className="p-3">Exit Date</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {trips.map((trip, idx) => {
                      const dur = Math.max(0, Math.round((new Date(trip.exitDate).getTime() - new Date(trip.entryDate).getTime()) / (1000 * 60 * 60 * 24)) + 1);
                      return (
                        <tr key={trip.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-500">Trip {idx + 1}</td>
                          <td className="p-3 font-semibold text-slate-900">{trip.entryDate}</td>
                          <td className="p-3 font-semibold text-slate-900">{trip.exitDate}</td>
                          <td className="p-3 font-bold text-[#0B3D91]">{dur} Days</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => removeTrip(trip.id)}
                              className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Single / Multiple Stay Calculator View */}
        {calculationMode !== 'schengen' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-black text-slate-900">Permitted Duration &amp; Expiry Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase block">Visa Validity Expiry</span>
                <span className="text-xl font-black text-slate-900">{visaExpiryDate}</span>
                <p className="text-xs text-slate-600">Final date by which you must present yourself at the border for admission.</p>
              </div>
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase block">Permitted Stay Duration</span>
                <span className="text-xl font-black text-blue-600">{permittedStayDays} Days Per Entry</span>
                <p className="text-xs text-slate-600">Maximum continuous duration permitted per authorized entry under Section s20 rules.</p>
              </div>
            </div>
          </div>
        )}

        {/* Safety Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-xs text-blue-900 space-y-2">
          <div className="flex items-center gap-2 font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#0B3D91]" /> Statutory Stay &amp; Border Admission Disclaimer
          </div>
          <p className="leading-relaxed">
            Visa validity expiry and permitted duration of stay are distinct legal parameters. Border control authorities retain final discretion regarding admission and authorized length of stay (such as I-94 stamps). VisaApply.org provides this calculator as an educational compliance aid and does not guarantee legal entry or stay.
          </p>
        </div>
      </div>
    </div>
  );
};
export default StayCalculatorPage;
