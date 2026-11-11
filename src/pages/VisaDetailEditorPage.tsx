import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { ClaimsManager } from '../components/admin/ClaimsManager';
import { VersionHistoryManager } from '../components/admin/VersionHistoryManager';

export function VisaDetailEditorPage() {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('sections');

  useEffect(() => {
    fetch(`/api/admin/visa-details/${programId}`) 
      .then(res => res.json())
      .then(data => {
        setDetails(data.details);
        setLoading(false);
      })
      .catch(console.error);
  }, [programId]);

  const updateSection = (section: string, data: any) => {
    setDetails({ ...details, [section]: data });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    await fetch('/api/admin/visa-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details)
    });
    setSaving(false);
    alert('Saved successfully!');
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  const handleStatusChange = async (newStatus: string) => {
    await fetch(`/api/admin/visa-details/${programId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <button onClick={() => navigate('/admin/visa-management')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Back to Admin
      </button>
      <h1 className="text-3xl font-extrabold text-slate-900">Edit: {programId}</h1>
      
      <div className="flex gap-4 border-b">
        {['sections', 'claims', 'workflow', 'history'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`capitalize px-4 py-2 ${activeTab === tab ? 'border-b-2 border-indigo-600 font-bold' : ''}`}>
                {tab}
            </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        {activeTab === 'sections' && (
          <div className="space-y-6">
            <h3 className="font-bold text-lg">Country & Visa Overview</h3>
            <input className="w-full p-2 border rounded" placeholder="Visa Title" value={details.visaOverview?.title || ''} onChange={(e) => updateSection('visaOverview', {...details.visaOverview, title: e.target.value})} />
            <textarea className="w-full p-2 border rounded" placeholder="Description" value={details.visaOverview?.description || ''} onChange={(e) => updateSection('visaOverview', {...details.visaOverview, description: e.target.value})} />
            
            <h3 className="font-bold text-lg">Eligibility</h3>
            <textarea className="w-full p-2 border rounded" placeholder="Eligibility Rules" value={details.eligibility?.rules || ''} onChange={(e) => updateSection('eligibility', {...details.eligibility, rules: e.target.value})} />

            <h3 className="font-bold text-lg">Financial Requirements</h3>
            <textarea className="w-full p-2 border rounded" placeholder="Financial Requirements" value={details.financial?.requirements || ''} onChange={(e) => updateSection('financial', {...details.financial, requirements: e.target.value})} />
          </div>
        )}
        {activeTab === 'claims' && <ClaimsManager programId={programId!} />}
        {activeTab === 'workflow' && (
          <div className="space-y-4">
            <p>Current Status: <span className="font-bold">{details.verificationStatus}</span></p>
            <div className="flex gap-2">
              {['DRAFT', 'UNDER_REVIEW', 'VERIFIED', 'APPROVED', 'PUBLISHED'].map(status => (
                <button key={status} onClick={() => handleStatusChange(status)} className="px-3 py-1 bg-slate-200 rounded hover:bg-slate-300">
                  Set to {status}
                </button>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'history' && <VersionHistoryManager programId={programId!} />}
      </div>
      
      <div className="flex justify-end gap-4">
        <button 
          onClick={handleSaveAll}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold"
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
