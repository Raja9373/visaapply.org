import React, { useState, useEffect } from 'react';
import { Shield, Search, AlertCircle, CheckCircle, Clock, Edit } from 'lucide-react';

export function VisaManagementAdminPage({ navigate }: { navigate: (path: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<any>({ total: 0, enriched: 0, awaiting: 0 });
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/visa-details')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecords(data.details);
          setStats({
            total: data.details.length,
            enriched: data.details.filter((r: any) => r.verificationStatus === 'VERIFIED').length,
            awaiting: data.details.filter((r: any) => r.verificationStatus !== 'VERIFIED').length
          });
        }
      })
      .catch(console.error);
  }, []);

  const filteredRecords = records.filter(r => 
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.programId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-900">Visa Management Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500">Total Visa Records</h3>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500">Enriched Records</h3>
          <p className="text-3xl font-black text-emerald-600 mt-2">{stats.enriched}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500">Awaiting Enrichment</h3>
          <p className="text-3xl font-black text-amber-600 mt-2">{stats.awaiting}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-xl border">
          <Search className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by ID, Program ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-sm"
          />
        </div>
        
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="border-b">
            <tr className="text-slate-500">
              <th className="p-3">ID</th>
              <th className="p-3">Program ID</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map(record => (
              <tr key={record.id} className="border-b hover:bg-slate-50">
                <td className="p-3 font-mono text-slate-600">{record.id}</td>
                <td className="p-3 font-medium text-slate-900">{record.programId}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {record.verificationStatus || 'PENDING'}
                  </span>
                </td>
                <td className="p-3">
                  <button className="text-indigo-600 hover:text-indigo-800 font-semibold">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
