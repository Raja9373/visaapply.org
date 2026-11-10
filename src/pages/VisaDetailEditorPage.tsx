import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';

export function VisaDetailEditorPage() {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const sections = [
    { key: 'countryOverview', label: 'Country Overview' },
    { key: 'visaOverview', label: 'Visa Overview' },
    { key: 'eligibility', label: 'Eligibility' },
    { key: 'financial', label: 'Financial Requirements' },
    { key: 'documentChecklist', label: 'Document Checklist' },
    { key: 'applicationSteps', label: 'Application Process' },
    { key: 'faq', label: 'FAQs' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <button onClick={() => navigate('/admin/visa-management')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Back to Admin
      </button>
      <h1 className="text-3xl font-extrabold text-slate-900">Edit Visa Details: {programId}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map(section => (
          <div key={section.key} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">{section.label}</h2>
            <textarea 
              className="w-full h-32 p-3 border rounded-lg text-sm"
              value={JSON.stringify(details[section.key] || {}, null, 2)}
              onChange={(e) => updateSection(section.key, JSON.parse(e.target.value))}
            />
          </div>
        ))}
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
