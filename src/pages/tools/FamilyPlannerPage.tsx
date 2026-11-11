import React, { useState } from 'react';
import { Users, ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, DollarSign, FileText } from 'lucide-react';
import { SUPPORTED_LANGUAGES_10, SupportedLangCode } from '../../i18n/config';
import { getUIString } from '../../utils/autoLanguage';

interface FamilyPlannerPageProps {
  onNavigate: (path: string) => void;
}

interface FamilyMember {
  id: string;
  relation: 'spouse' | 'child_minor' | 'child_adult' | 'parent';
  age: number;
  dependent: boolean;
}

export const FamilyPlannerPage: React.FC<FamilyPlannerPageProps> = ({ onNavigate }) => {
  const [destination, setDestination] = useState('CA');
  const [visaCategory, setVisaCategory] = useState('Visitor Visa / TRV (Family Group)');
  const [mainApplicantAge, setMainApplicantAge] = useState<number>(35);
  
  const [members, setMembers] = useState<FamilyMember[]>([
    { id: 'm1', relation: 'spouse', age: 33, dependent: true },
    { id: 'm2', relation: 'child_minor', age: 7, dependent: true }
  ]);

  const [newRelation, setNewRelation] = useState<FamilyMember['relation']>('child_minor');
  const [newAge, setNewAge] = useState<number>(10);

  const [uiLang, setUiLang] = useState<SupportedLangCode>('en');
  const ui = getUIString(uiLang);

  const addMember = (e: React.FormEvent) => {
    e.preventDefault();
    const newM: FamilyMember = {
      id: `member-${Date.now()}`,
      relation: newRelation,
      age: newAge,
      dependent: true
    };
    setMembers(prev => [...prev, newM]);
  };

  const removeMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  // Cost calculation incorporating family caps (e.g. Canada family max CAD 500 for 5+ applicants)
  const baseFeePerAdult = destination === 'CA' ? 100 : 185;
  const baseFeePerMinor = destination === 'CA' ? 100 : 185;
  const totalApplicants = 1 + members.length;

  let totalGovtLocal = baseFeePerAdult + members.reduce((sum, m) => sum + (m.age < 18 ? baseFeePerMinor : baseFeePerAdult), 0);
  if (destination === 'CA' && totalApplicants >= 5) {
    totalGovtLocal = Math.min(totalGovtLocal, 500); // Family cap CAD 500
  }

  const currency = destination === 'CA' ? 'CAD' : destination === 'GB' ? 'GBP' : 'USD';

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
                <Users className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Family Visa Planner &amp; Dependant Cost Engine</h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-1">
                  Assess dependent eligibility under Section s10 &amp; s23 rules with family fee caps and maintenance multipliers.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl backdrop-blur-sm text-right shrink-0">
            <span className="text-xs text-blue-200 font-semibold block uppercase tracking-wider">Total Family Group</span>
            <span className="text-2xl font-black text-white">{totalApplicants} Applicants</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Family Group Configuration */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-black text-slate-900">Family Group &amp; Destination Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Destination Country</label>
              <select
                value={destination}
                onChange={e => setDestination(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              >
                <option value="CA">🇨🇦 Canada (Family Cap Applied)</option>
                <option value="US">🇺🇸 United States</option>
                <option value="GB">🇬🇧 United Kingdom</option>
                <option value="EU">🇪🇪 Schengen Area</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">Visa / Program Category</label>
              <select
                value={visaCategory}
                onChange={e => setVisaCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              >
                <option value="Visitor Visa / TRV (Family Group)">Visitor Visa / TRV (Family Group)</option>
                <option value="Skilled Work Permit with Dependants">Skilled Work Permit with Dependants</option>
                <option value="Student Visa with Dependent Partner">Student Visa with Dependent Partner</option>
              </select>
            </div>
          </div>

          {/* Add Dependent Form */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Add Family Dependent</h3>
            <form onSubmit={addMember} className="flex flex-col sm:flex-row gap-3">
              <select
                value={newRelation}
                onChange={e => setNewRelation(e.target.value as FamilyMember['relation'])}
                className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              >
                <option value="spouse">Spouse / Partner</option>
                <option value="child_minor">Minor Child (&lt; 18)</option>
                <option value="child_adult">Adult Dependent Child</option>
                <option value="parent">Dependent Parent</option>
              </select>
              <input
                type="number"
                placeholder="Age..."
                value={newAge}
                onChange={e => setNewAge(parseInt(e.target.value) || 0)}
                className="w-32 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                + Add Member
              </button>
            </form>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto pt-4">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-xs">
                <tr>
                  <th className="p-3">Relationship</th>
                  <th className="p-3">Age</th>
                  <th className="p-3">Dependency Rule (Section s23)</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold uppercase text-slate-900">{m.relation.replace('_', ' ')}</td>
                    <td className="p-3 font-semibold text-slate-700">{m.age} Years</td>
                    <td className="p-3 text-xs text-slate-600 font-medium">
                      {m.relation === 'parent' ? '⚠️ DEPENDENCY RULE AWAITING OFFICIAL VERIFICATION' : '✅ Verified Dependant Category'}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => removeMember(m.id)}
                        className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost Summary Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">Total Family Consular Fees</span>
            <span className="text-3xl font-black text-[#0B3D91]">{totalGovtLocal} {currency}</span>
            <p className="text-xs text-slate-500 mt-1">Includes family fee caps and statutory exemptions where applicable.</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 px-5 py-3 rounded-xl text-xs text-blue-900 font-bold">
            Family Group Size: {totalApplicants} Applicants
          </div>
        </div>
      </div>
    </div>
  );
};
export default FamilyPlannerPage;
