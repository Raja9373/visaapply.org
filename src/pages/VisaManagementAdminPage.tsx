import React, { useState, useEffect } from 'react';
import { Shield, Search, AlertCircle, CheckCircle, Clock, Edit } from 'lucide-react';
import { getAdminRequestHeaders } from '../utils/adminAuth';

export function VisaManagementAdminPage({ navigate }: { navigate: (path: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<any>({});
  const [records, setRecords] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch('/api/admin/dashboard-stats', {
      credentials: 'include',
      headers: getAdminRequestHeaders()
    })
      .then(res => res.json())
      .then(data => data.success && setStats(data.stats))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`/api/admin/visa-details?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&status=${encodeURIComponent(statusFilter)}`, {
      credentials: 'include',
      headers: getAdminRequestHeaders()
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecords(data.data);
          setTotalPages(Math.ceil(data.total / limit));
        }
      })
      .catch(console.error);
  }, [page, limit, searchQuery, statusFilter]);

  const statsItems = [
    { label: 'Total', key: 'total' },
    { label: 'Draft', key: 'draft' },
    { label: 'Needs Evidence', key: 'needs_evidence' },
    { label: 'Under Review', key: 'under_review' },
    { label: 'Verified', key: 'verified' },
    { label: 'Approved', key: 'approved' },
    { label: 'Published', key: 'published' },
    { label: 'Update Required', key: 'update_required' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-900">Visa Management Admin</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsItems.map(item => {
          const filterVal = item.key === 'total' ? '' : item.key.toUpperCase();
          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={statusFilter === filterVal}
              className="text-left bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 focus-visible:ring-2 focus-visible:ring-indigo-500"
              onClick={() => setStatusFilter(filterVal)}
            >
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.label}</h3>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats[item.key] || 0}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-xl border">
          <Search className="text-slate-400" aria-hidden="true" />
          <label htmlFor="admin-visa-search" className="sr-only">Search visas by ID or Program ID</label>
          <input
            id="admin-visa-search"
            type="text"
            placeholder="Search by ID, Program ID..."
            aria-label="Search by ID or Program ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm focus-visible:outline-none"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm min-w-[540px]">
            <thead className="border-b">
              <tr className="text-slate-500">
                <th scope="col" className="p-3">ID</th>
                <th scope="col" className="p-3">Program ID</th>
                <th scope="col" className="p-3">Status</th>
                <th scope="col" className="p-3">Actions</th>
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
        </div>
        
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
