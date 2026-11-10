import React from 'react';
import { Shield, Check, DollarSign, Clock, AlertTriangle, ExternalLink } from 'lucide-react';

export function VisaDetailRenderer({ details }: { details: any }) {
  if (!details) return null;

  return (
    <div className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm mt-6">
      <h2 className="text-2xl font-black text-slate-900 border-b pb-4">Detailed Visa Guide: {details.visaOverview.name}</h2>
      
      {/* Country Overview */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-700" /> Country Overview
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl">
          <div><span className="font-semibold text-slate-500">Capital:</span> {details.countryOverview.capital}</div>
          <div><span className="font-semibold text-slate-500">Language:</span> {details.countryOverview.language}</div>
          <div><span className="font-semibold text-slate-500">Currency:</span> {details.countryOverview.currency}</div>
          <div><span className="font-semibold text-slate-500">Best Season:</span> {details.countryOverview.bestTravelSeason}</div>
        </div>
      </section>

      {/* Visa Overview */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-3">Visa Overview</h3>
        <p className="text-sm text-slate-700">{details.visaOverview.purpose}</p>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-emerald-50 p-3 rounded-lg"><span className="font-semibold">Validity:</span> {details.visaOverview.validity}</div>
          <div className="bg-emerald-50 p-3 rounded-lg"><span className="font-semibold">Stay:</span> {details.visaOverview.stay}</div>
          <div className="bg-emerald-50 p-3 rounded-lg"><span className="font-semibold">Fee:</span> {details.visaOverview.fee}</div>
        </div>
      </section>

      {/* Eligibility & Financials */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-3">Eligibility & Financials</h3>
        <p className="text-sm text-slate-700 mb-2">{details.eligibility.summary}</p>
        <div className="text-sm text-slate-700 bg-amber-50 p-4 rounded-xl border border-amber-100">
           <span className="font-semibold text-amber-900">Financial Requirement:</span> {details.financial.recommendedFunds}
        </div>
      </section>
    </div>
  );
}
