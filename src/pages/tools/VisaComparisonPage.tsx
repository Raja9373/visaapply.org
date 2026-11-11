import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, FileText, Globe, Layers } from 'lucide-react';
import { SUPPORTED_LANGUAGES_10, SupportedLangCode } from '../../i18n/config';
import { getUIString } from '../../utils/autoLanguage';

interface VisaComparisonPageProps {
  onNavigate: (path: string) => void;
}

export const VisaComparisonPage: React.FC<VisaComparisonPageProps> = ({ onNavigate }) => {
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(['US', 'GB', 'CA']);
  const [uiLang, setUiLang] = useState<SupportedLangCode>('en');
  const ui = getUIString(uiLang);

  const destinationProfiles: Record<string, any> = {
    US: {
      name: 'United States',
      flag: '🇺🇸',
      program: 'B1/B2 Visitor Visa',
      eligibility: 'VERIFIED',
      govtFee: 'USD 185',
      biometrics: 'USD 0 (Consular Capture)',
      funds: 'VERIFIED ($5,000+ Recommended)',
      processingTime: '15 - 30 Business Days',
      workRights: 'NOT_APPLICABLE (Visitor)',
      studyRights: 'CONDITIONAL (Short recreational courses < 18h/wk)',
      familyEligibility: 'CONDITIONAL (Separate applications)',
      stayValidity: '10 Years / 6 Months Per Entry',
      settlementPath: 'NOT_APPLICABLE'
    },
    GB: {
      name: 'United Kingdom',
      flag: '🇬🇧',
      program: 'Standard Visitor Visa',
      eligibility: 'VERIFIED',
      govtFee: 'GBP 135',
      biometrics: 'Included in VAC fee',
      funds: 'VERIFIED (Bank statements required)',
      processingTime: '15 Business Days',
      workRights: 'NOT_APPLICABLE (Visitor)',
      studyRights: 'CONDITIONAL (Study up to 30 days)',
      familyEligibility: 'CONDITIONAL (Linked applications)',
      stayValidity: '2/5/10 Years / 6 Months Per Entry',
      settlementPath: 'NOT_APPLICABLE'
    },
    CA: {
      name: 'Canada',
      flag: '🇨🇦',
      program: 'Visitor Visa (TRV)',
      eligibility: 'VERIFIED',
      govtFee: 'CAD 100',
      biometrics: 'CAD 85',
      funds: 'VERIFIED (CAD 1,000 / month)',
      processingTime: '14 - 21 Business Days',
      workRights: 'NOT_APPLICABLE (Visitor)',
      studyRights: 'CONDITIONAL (Study < 6 months)',
      familyEligibility: 'VERIFIED (Family cap CAD 500)',
      stayValidity: '10 Years / 6 Months Per Entry',
      settlementPath: 'CONDITIONAL (Express Entry / PR pathways)'
    },
    EU: {
      name: 'Schengen Area',
      flag: '🇪🇪',
      program: 'Short-Stay Visa (C Type)',
      eligibility: 'VERIFIED',
      govtFee: 'EUR 90',
      biometrics: 'EUR 0 (VAC Capture)',
      funds: 'VERIFIED (€45 - €100 / day)',
      processingTime: '15 - 45 Calendar Days',
      workRights: 'NOT_APPLICABLE (Visitor)',
      studyRights: 'NOT_APPLICABLE',
      familyEligibility: 'CONDITIONAL (Separate files)',
      stayValidity: '5 Years / 90 Days in 180',
      settlementPath: 'NOT_APPLICABLE'
    },
    AU: {
      name: 'Australia',
      flag: '🇦🇺',
      program: 'Visitor Visa (Subclass 600)',
      eligibility: 'VERIFIED',
      govtFee: 'AUD 190',
      biometrics: 'AWAITING_VERIFICATION',
      funds: 'AWAITING_VERIFICATION',
      processingTime: '20 - 30 Business Days',
      workRights: 'NOT_APPLICABLE',
      studyRights: 'CONDITIONAL (< 3 months)',
      familyEligibility: 'CONDITIONAL',
      stayValidity: '1 Year / 3 Months Per Entry',
      settlementPath: 'NOT_APPLICABLE'
    }
  };

  const dimensions = [
    { key: 'eligibility', label: '1. Statutory Eligibility' },
    { key: 'govtFee', label: '2. Government Application Fees' },
    { key: 'biometrics', label: '3. Administrative & Biometric Charges' },
    { key: 'funds', label: '4. Proof of Funds' },
    { key: 'processingTime', label: '5. Official Processing Times' },
    { key: 'workRights', label: '6. Work Rights' },
    { key: 'studyRights', label: '7. Study Rights' },
    { key: 'familyEligibility', label: '8. Family / Dependant Eligibility' },
    { key: 'stayValidity', label: '9. Visa Validity & Permitted Stay' },
    { key: 'settlementPath', label: '10. PR & Settlement Pathways' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <div className="bg-[#0B3D91] text-white py-10 px-4 sm:px-6 lg:px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white text-xs sm:text-sm font-medium mb-3 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to VisaApply.org Home
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                <Layers className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Advanced 10-Dimension Visa Program Comparison</h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-1">
                  Compare up to 5 consular programs across statutory eligibility, fees, funds, work rights, and settlement pathways.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl backdrop-blur-sm text-right shrink-0">
            <span className="text-xs text-blue-200 font-semibold block uppercase tracking-wider">Active Comparisons</span>
            <span className="text-2xl font-black text-white">{selectedDestinations.length} Destinations</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Destination selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-wrap items-center gap-3">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Select Destinations to Compare (Up to 5):</span>
          {Object.keys(destinationProfiles).map((code) => {
            const active = selectedDestinations.includes(code);
            return (
              <button
                key={code}
                onClick={() => {
                  if (active && selectedDestinations.length > 1) {
                    setSelectedDestinations(prev => prev.filter(c => c !== code));
                  } else if (!active && selectedDestinations.length < 5) {
                    setSelectedDestinations(prev => [...prev, code]);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${active ? 'bg-[#0B3D91] text-white border-[#0B3D91] shadow-sm' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}
              >
                {destinationProfiles[code].flag} {destinationProfiles[code].name}
              </button>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="p-4 w-64">Comparison Dimension</th>
                  {selectedDestinations.map(code => (
                    <th key={code} className="p-4 min-w-[220px]">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{destinationProfiles[code].flag}</span>
                        <div>
                          <span className="block font-black">{destinationProfiles[code].name}</span>
                          <span className="text-[11px] text-blue-300 font-normal">{destinationProfiles[code].program}</span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {dimensions.map(dim => (
                  <tr key={dim.key} className="hover:bg-slate-50">
                    <td className="p-4 font-extrabold text-slate-950 bg-slate-50/50">{dim.label}</td>
                    {selectedDestinations.map(code => {
                      const val = destinationProfiles[code][dim.key];
                      const isVerified = val.includes('VERIFIED');
                      const isConditional = val.includes('CONDITIONAL');
                      return (
                        <td key={code} className="p-4 text-slate-700 font-medium">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${isVerified ? 'bg-emerald-100 text-emerald-900' : isConditional ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-800'}`}>
                            {val}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default VisaComparisonPage;
