import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

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
        setDetails(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [programId]);

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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <button onClick={() => navigate('/admin/visa-management')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Back to Admin
      </button>
      <h1 className="text-3xl font-extrabold text-slate-900">Edit Visa Details: {programId}</h1>
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <pre className="text-xs bg-slate-100 p-4 rounded">{JSON.stringify(details, null, 2)}</pre>
        <button 
          onClick={handleSaveAll}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
