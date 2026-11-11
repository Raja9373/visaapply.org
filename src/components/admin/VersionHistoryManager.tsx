import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Eye, GitCompare, PlusCircle, Check, X, History } from 'lucide-react';

function flattenObject(obj: any, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  if (obj === null || obj === undefined) return result;
  if (typeof obj !== 'object') {
    result[prefix || 'root'] = String(obj);
    return result;
  }
  for (const key of Object.keys(obj)) {
    if (key === 'lastUpdated') continue;
    const path = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val, path));
    } else {
      result[path] = JSON.stringify(val);
    }
  }
  return result;
}

export function VersionHistoryManager({
  programId,
  onRestored
}: {
  programId: string;
  onRestored?: () => void;
}) {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingVersion, setViewingVersion] = useState<any | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);
  const [snapshotReason, setSnapshotReason] = useState('');
  const [creatingSnapshot, setCreatingSnapshot] = useState(false);

  const loadVersions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/visa-details/${programId}/versions`);
      const data = await res.json();
      setVersions(Array.isArray(data.versions) ? data.versions : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const handleCreateManualSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingSnapshot(true);
    try {
      await fetch(`/api/admin/visa-details/${programId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editorId: 'admin',
          changeReason: snapshotReason.trim() || 'Manual checkpoint snapshot'
        })
      });
      setSnapshotReason('');
      await loadVersions();
    } finally {
      setCreatingSnapshot(false);
    }
  };

  const handleConfirmRestore = async (versionId: string) => {
    await fetch(`/api/admin/visa-details/${programId}/versions/${versionId}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editorId: 'admin' })
    });
    setConfirmRestoreId(null);
    await loadVersions();
    if (onRestored) onRestored();
  };

  const toggleCompare = (versionId: string) => {
    setCompareIds(prev => {
      if (prev.includes(versionId)) return prev.filter(id => id !== versionId);
      if (prev.length >= 2) return [prev[1], versionId];
      return [...prev, versionId];
    });
  };

  // Compute diff if 2 versions are selected
  let diffEntries: { key: string; type: 'ADDED' | 'REMOVED' | 'CHANGED'; oldVal?: string; newVal?: string }[] = [];
  if (compareIds.length === 2) {
    const vA = versions.find(v => v.id === compareIds[0]);
    const vB = versions.find(v => v.id === compareIds[1]);
    if (vA && vB) {
      // Order older first, newer second
      const [older, newer] =
        new Date(vA.timestamp).getTime() <= new Date(vB.timestamp).getTime() ? [vA, vB] : [vB, vA];
      const flatOld = flattenObject(older.data);
      const flatNew = flattenObject(newer.data);
      const allKeys = Array.from(new Set([...Object.keys(flatOld), ...Object.keys(flatNew)])).sort();
      for (const k of allKeys) {
        if (!(k in flatOld)) {
          diffEntries.push({ key: k, type: 'ADDED', newVal: flatNew[k] });
        } else if (!(k in flatNew)) {
          diffEntries.push({ key: k, type: 'REMOVED', oldVal: flatOld[k] });
        } else if (flatOld[k] !== flatNew[k]) {
          diffEntries.push({ key: k, type: 'CHANGED', oldVal: flatOld[k], newVal: flatNew[k] });
        }
      }
    }
  }

  if (loading) return <div className="p-6 text-center text-slate-500">Loading audit version history...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4 border-b pb-4">
        <div>
          <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
            <History size={20} className="text-indigo-600" /> Immutable Audit & Version History
          </h3>
          <p className="text-sm text-slate-500">
            Every section edit, claim change, evidence update, and restoration is preserved as an immutable snapshot.
          </p>
        </div>

        <form onSubmit={handleCreateManualSnapshot} className="flex items-center gap-2">
          <input
            type="text"
            value={snapshotReason}
            onChange={e => setSnapshotReason(e.target.value)}
            placeholder="Checkpoint reason..."
            className="p-2 border border-slate-300 rounded-lg text-sm bg-white"
          />
          <button
            type="submit"
            disabled={creatingSnapshot}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
          >
            <PlusCircle size={15} /> Save Version Checkpoint
          </button>
        </form>
      </div>

      {/* Comparison Panel */}
      {compareIds.length === 2 && (
        <div className="p-5 bg-slate-50 border border-indigo-200 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-indigo-950 flex items-center gap-2">
              <GitCompare size={18} /> Version Diff Comparison ({compareIds[0]} vs {compareIds[1]})
            </h4>
            <button
              type="button"
              onClick={() => setCompareIds([])}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <X size={15} /> Clear Comparison
            </button>
          </div>

          {diffEntries.length === 0 ? (
            <p className="text-sm text-emerald-700 font-medium">No differences found between the two selected versions.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-2 text-xs font-mono">
              {diffEntries.map(d => (
                <div
                  key={d.key}
                  className={`p-2.5 rounded border ${
                    d.type === 'ADDED'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : d.type === 'REMOVED'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-amber-50 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="font-bold mb-1">
                    [{d.type}] {d.key}
                  </div>
                  {d.oldVal !== undefined && (
                    <div className="text-rose-700 break-all">- Old: {d.oldVal}</div>
                  )}
                  {d.newVal !== undefined && (
                    <div className="text-emerald-700 break-all">+ New: {d.newVal}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Version JSON Viewer Modal */}
      {viewingVersion && (
        <div className="p-5 bg-slate-900 text-slate-100 rounded-xl space-y-3">
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <div>
              <span className="font-bold text-indigo-400">Snapshot Inspector: {viewingVersion.id}</span>
              <span className="text-xs text-slate-400 ml-3">
                ({new Date(viewingVersion.timestamp).toLocaleString()} by {viewingVersion.editorId || viewingVersion.editor_id})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setViewingVersion(null)}
              className="text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
          <pre className="text-xs overflow-x-auto max-h-96 p-3 bg-slate-950 rounded-lg">
            {JSON.stringify(viewingVersion.data, null, 2)}
          </pre>
        </div>
      )}

      {/* Version Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-slate-700">
              <th className="p-3 text-left">Compare</th>
              <th className="p-3 text-left">Version #</th>
              <th className="p-3 text-left">Timestamp</th>
              <th className="p-3 text-left">Administrator</th>
              <th className="p-3 text-left">Change Summary</th>
              <th className="p-3 text-left">Claims Snapshot</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {versions.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No versions recorded yet. Saving sections or claims automatically creates version history.
                </td>
              </tr>
            ) : (
              versions.map((v, idx) => {
                const versionNum = `v${versions.length - idx}.0`;
                const isSelected = compareIds.includes(v.id);
                const claimsCount = Array.isArray(v.data?.claims) ? v.data.claims.length : 0;

                return (
                  <tr key={v.id} className={`border-b hover:bg-slate-50/80 ${isSelected ? 'bg-indigo-50/50' : ''}`}>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCompare(v.id)}
                        className="rounded border-slate-300 text-indigo-600"
                        title="Select up to 2 versions to compare"
                      />
                    </td>
                    <td className="p-3 font-mono font-bold text-indigo-700">
                      {versionNum} <span className="text-xs font-normal text-slate-400">({v.id})</span>
                    </td>
                    <td className="p-3 text-slate-600">{new Date(v.timestamp).toLocaleString()}</td>
                    <td className="p-3 font-medium text-slate-800">{v.editorId || v.editor_id || 'admin'}</td>
                    <td className="p-3 text-slate-700">{v.changeReason || v.change_reason || 'Update'}</td>
                    <td className="p-3 text-xs text-slate-500">{claimsCount} claims linked</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingVersion(v)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 flex items-center gap-1"
                        >
                          <Eye size={13} /> View
                        </button>

                        {confirmRestoreId === v.id ? (
                          <div className="flex items-center gap-1 bg-amber-50 border border-amber-300 px-2 py-1 rounded">
                            <span className="text-xs font-semibold text-amber-900">Restore {versionNum}?</span>
                            <button
                              type="button"
                              onClick={() => handleConfirmRestore(v.id)}
                              className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 flex items-center gap-1"
                            >
                              <Check size={12} /> Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmRestoreId(null)}
                              className="px-1.5 py-0.5 text-xs text-slate-600 hover:text-slate-900"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmRestoreId(v.id)}
                            className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 flex items-center gap-1"
                          >
                            <RotateCcw size={13} /> Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
