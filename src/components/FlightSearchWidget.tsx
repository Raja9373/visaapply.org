import React, { useState } from 'react';
import { ExternalLink, Calendar, MapPin } from 'lucide-react';

interface FlightSearchWidgetProps {
  defaultFrom?: string;
  defaultTo?: string;
  className?: string;
}

export const FlightSearchWidget: React.FC<FlightSearchWidgetProps> = ({
  defaultFrom = 'DEL',
  defaultTo = 'DXB',
  className = ''
}) => {
  const [fromIata, setFromIata] = useState<string>(defaultFrom);
  const [toIata, setToIata] = useState<string>(defaultTo);

  const today = new Date();
  const departDefault = new Date(today.getTime() + 30 * 86400000).toISOString().split('T')[0];
  const returnDefault = new Date(today.getTime() + 37 * 86400000).toISOString().split('T')[0];

  const [departDate, setDepartDate] = useState<string>(departDefault);
  const [returnDate, setReturnDate] = useState<string>(returnDefault);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const from = (fromIata || 'DEL').trim().toUpperCase();
    const to = (toIata || 'DXB').trim().toUpperCase();

    let dateStr = "1512";
    if (departDate && departDate.includes('-')) {
      const parts = departDate.split('-');
      if (parts.length === 3) {
        dateStr = `${parts[2]}${parts[1]}`;
      }
    }

    const url = `https://www.aviasales.com/search/${from}${dateStr}${to}1?marker=801550`;
    window.open(url, '_blank');
  };

  return (
    <div className={`bg-white rounded-2xl border-2 border-[#0B2A5B] p-4 sm:p-6 shadow-md ${className}`}>
      <div className="mb-3">
        <h3 className="flex items-center gap-2 text-[#0B2A5B] font-black text-base sm:text-lg">
          <span>✈️</span>
          <span>Book Flights Here</span>
        </h3>
      </div>

      <form onSubmit={handleSearch} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* From */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase">From</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={fromIata}
                onChange={(e) => setFromIata(e.target.value)}
                placeholder="DEL"
                maxLength={4}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold uppercase text-slate-900 focus:outline-none focus:border-[#0B2A5B]"
                required
              />
            </div>
          </div>

          {/* To */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase">To</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={toIata}
                onChange={(e) => setToIata(e.target.value)}
                placeholder="DXB"
                maxLength={4}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold uppercase text-slate-900 focus:outline-none focus:border-[#0B2A5B]"
                required
              />
            </div>
          </div>

          {/* Depart Date */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase">Depart Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="date"
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#0B2A5B]"
                required
              />
            </div>
          </div>

          {/* Return Date */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700 uppercase">Return Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#0B2A5B]"
                required
              />
            </div>
          </div>
        </div>

        {/* Search Button & Subtext */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 font-bold flex items-center gap-1.5">
            <span className="text-blue-600">●</span>
            <span>100+ Airlines • Best Price • FREE Hold 24h</span>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-[#0B2A5B] hover:bg-[#082247] text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Search Flights</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
