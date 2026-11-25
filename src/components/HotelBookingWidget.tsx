import React, { useState, useEffect, useId } from 'react';
import { ExternalLink, Calendar, Users, MapPin } from 'lucide-react';

interface HotelBookingWidgetProps {
  defaultDestination?: string;
  defaultCity?: string;
  className?: string;
}

export const HotelBookingWidget: React.FC<HotelBookingWidgetProps> = ({
  defaultDestination = 'Dubai',
  defaultCity,
  className = ''
}) => {
  const idPrefix = useId();
  const initialCity = defaultCity || defaultDestination || 'Dubai';
  const [destination, setDestination] = useState<string>(initialCity);

  useEffect(() => {
    if (defaultCity || defaultDestination) {
      setDestination(defaultCity || defaultDestination);
    }
  }, [defaultCity, defaultDestination]);

  const today = new Date();
  const checkinDate = new Date(today.getTime() + 30 * 86400000).toISOString().split('T')[0];
  const checkoutDate = new Date(today.getTime() + 35 * 86400000).toISOString().split('T')[0];

  const [checkin, setCheckin] = useState<string>(checkinDate);
  const [checkout, setCheckout] = useState<string>(checkoutDate);
  const [guests, setGuests] = useState<string>('2');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const city = (destination || 'Dubai').trim().slice(0, 80);
    const citySlug = city.toLowerCase().replace(/[^a-z0-9]/g, '');
    const label = `in-to-${citySlug || 'hotel'}-hotel`;
    const safeCheckin = /^\d{4}-\d{2}-\d{2}$/.test(checkin) ? checkin : checkinDate;
    const safeCheckout = /^\d{4}-\d{2}-\d{2}$/.test(checkout) ? checkout : checkoutDate;
    const safeGuests = /^[1-4]$/.test(guests) ? guests : '2';
    const url = `https://www.booking.com/searchresults.html?aid=8119919&label=${encodeURIComponent(label)}&ss=${encodeURIComponent(city)}&checkin=${encodeURIComponent(safeCheckin)}&checkout=${encodeURIComponent(safeCheckout)}&group_adults=${encodeURIComponent(safeGuests)}`;
    if (url.startsWith('https://www.booking.com/')) {
      const opened = window.open(url, '_blank', 'noopener,noreferrer');
      if (opened) opened.opener = null;
    }
  };

  return (
    <div className={`bg-white rounded-2xl border-2 border-[#0B2A5B] p-4 sm:p-6 shadow-md ${className}`}>
      <div className="mb-3">
        <h3 className="flex items-center gap-2 text-[#0B2A5B] font-black text-base sm:text-lg">
          <span aria-hidden="true">🏨</span>
          <span>Book Hotels Here</span>
        </h3>
      </div>

      <form onSubmit={handleSearch} className="space-y-3" aria-label="Hotel search form">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Destination */}
          <div className="space-y-1">
            <label htmlFor={`${idPrefix}-destination`} className="block text-[11px] font-bold text-slate-700 uppercase">Destination</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
              <input
                id={`${idPrefix}-destination`}
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Dubai, Bangkok"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#0B2A5B] focus-visible:ring-2 focus-visible:ring-blue-600"
                required
              />
            </div>
          </div>

          {/* Check-in Date */}
          <div className="space-y-1">
            <label htmlFor={`${idPrefix}-checkin`} className="block text-[11px] font-bold text-slate-700 uppercase">Check-in Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
              <input
                id={`${idPrefix}-checkin`}
                type="date"
                value={checkin}
                onChange={(e) => setCheckin(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#0B2A5B] focus-visible:ring-2 focus-visible:ring-blue-600"
                required
              />
            </div>
          </div>

          {/* Check-out Date */}
          <div className="space-y-1">
            <label htmlFor={`${idPrefix}-checkout`} className="block text-[11px] font-bold text-slate-700 uppercase">Check-out Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
              <input
                id={`${idPrefix}-checkout`}
                type="date"
                value={checkout}
                onChange={(e) => setCheckout(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#0B2A5B] focus-visible:ring-2 focus-visible:ring-blue-600"
                required
              />
            </div>
          </div>

          {/* Guests */}
          <div className="space-y-1">
            <label htmlFor={`${idPrefix}-guests`} className="block text-[11px] font-bold text-slate-700 uppercase">Guests</label>
            <div className="relative">
              <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
              <select
                id={`${idPrefix}-guests`}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#0B2A5B] focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Button & Subtext */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 font-bold flex items-center gap-1.5">
            <span className="text-emerald-600" aria-hidden="true">●</span>
            <span>FREE Cancellation • Pay at Property • No Payment Now</span>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <span>Search Hotels</span>
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
};
