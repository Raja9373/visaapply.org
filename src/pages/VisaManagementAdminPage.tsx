import React, { useState, useEffect } from 'react';
import { Shield, Search, AlertCircle, CheckCircle, Clock, Edit } from 'lucide-react';

export function VisaManagementAdminPage({ navigate }: { navigate: (path: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<any>({ total: 0, enriched: 0, awaiting: 0 });
  const [records, setRecords] = useState<any[]>([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`/api/admin/visa-details?page=${page}&limit=${limit}&search=${searchQuery}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecords(data.data);
          setTotalPages(Math.ceil(data.total / limit));
          setStats({
            total: data.total,
            enriched: 0, // Need to implement a separate stats endpoint or fetch from db
            awaiting: 0
          });
        }
      })
      .catch(console.error);
  }, [page, limit, searchQuery]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-900">Visa Management Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500">Total Visa Records</h3>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.total}</p>
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
            {records.map(record => (
              <tr key={record.id} className="border-b hover:bg-slate-50">
                <td className="p-3 font-mono text-slate-600">{record.id}</td>
                <td className="p-3 font-medium text-slate-900">{record.programId}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {record.verificationStatus || 'PENDING'}
                  </span>
                </td>
                <td className="p-3">
                  <a href={`/admin/visa-management/${record.programId}`} className="text-indigo-600 hover:text-indigo-800 font-semibold">Edit</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-500">Page {page} of {totalPages}</div>
            <div className="flex gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50">Prev</button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 bg-slate-100 rounded disabled:opacity-50">Next</button>
            </div>
        </div>
      </div>
    </div>
  );
}
