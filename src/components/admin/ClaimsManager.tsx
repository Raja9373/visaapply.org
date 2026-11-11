import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function ClaimsManager({ programId }: { programId: string }) {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/visa-details/${programId}/claims`)
      .then(res => res.json())
      .then(data => {
        setClaims(data.claims);
        setLoading(false);
      });
  }, [programId]);

  if (loading) return <div>Loading claims...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">Claims & Evidence</h3>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">
          <Plus size={16} /> Add Claim
        </button>
      </div>
      
      {claims.map(claim => (
        <div key={claim.id} className="border p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="font-bold">{claim.section}: {claim.description}</span>
            <div className="flex gap-2">
              <button className="text-blue-500"><Edit2 size={16} /></button>
              <button className="text-red-500"><Trash2 size={16} /></button>
            </div>
          </div>
          <p className="text-sm text-slate-600">Status: {claim.status}</p>
          <div className="text-sm">
            <h4 className="font-semibold text-slate-700">Evidence</h4>
            <EvidenceList claimId={claim.id} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EvidenceList({ claimId }: { claimId: string }) {
  const [evidence, setEvidence] = useState<any[]>([]);
  
  useEffect(() => {
    fetch(`/api/admin/visa-details/claims/${claimId}/evidence`)
      .then(res => res.json())
      .then(data => setEvidence(data.evidence));
  }, [claimId]);

  return (
    <ul className="list-disc pl-5 mt-1">
      {evidence.map(e => (
        <li key={e.id}>
            <a href={e.source_url} target="_blank" rel="noreferrer" className="text-indigo-600 underline">
                {e.legal_instrument || 'Official Source'}
            </a>
            <span className="text-xs text-slate-500 ml-2">({e.last_checked_date})</span>
        </li>
      ))}
      {evidence.length === 0 && <li className="text-red-500 text-xs">Missing evidence</li>}
    </ul>
  );
}
