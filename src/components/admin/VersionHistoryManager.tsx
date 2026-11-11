import React, { useState, useEffect } from 'react';
import { RotateCcw, Eye } from 'lucide-react';

export function VersionHistoryManager({ programId }: { programId: string }) {
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/admin/visa-details/${programId}/versions`)
      .then(res => res.json())
      .then(data => setVersions(data.versions));
  }, [programId]);

  const handleRestore = async (versionId: string) => {
    if (!confirm('Are you sure you want to restore this version? This will create a new entry.')) return;
    await fetch(`/api/admin/visa-details/${programId}/versions/${versionId}/restore`, { method: 'POST' });
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Version History</h3>
      <table className="w-full border">
        <thead>
          <tr className="border-b bg-slate-50">
            <th className="p-2 text-left">Timestamp</th>
            <th className="p-2 text-left">Editor</th>
            <th className="p-2 text-left">Reason</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {versions.map(v => (
            <tr key={v.id} className="border-b">
              <td className="p-2">{new Date(v.timestamp).toLocaleString()}</td>
              <td className="p-2">{v.editor_id}</td>
              <td className="p-2">{v.change_reason}</td>
              <td className="p-2 flex gap-2">
                <button className="text-blue-500"><Eye size={16} /></button>
                <button onClick={() => handleRestore(v.id)} className="text-indigo-600"><RotateCcw size={16} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
