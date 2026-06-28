import React, { useState } from 'react';
import { api } from '../api.js';
import { useApiData, LoadingSpinner, ErrorBox } from '../components.jsx';
import { RefreshCw, Search } from 'lucide-react';

export default function AuditLogsTab() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ action: '', entityType: '', restaurantId: '' });
  const [appliedFilters, setAppliedFilters] = useState({});

  const { data, loading, error, refetch } = useApiData(() => {
    const params = new URLSearchParams({ page: String(page), limit: '50' });
    if (appliedFilters.action) params.set('action', appliedFilters.action);
    if (appliedFilters.entityType) params.set('entityType', appliedFilters.entityType);
    if (appliedFilters.restaurantId) params.set('restaurantId', appliedFilters.restaurantId);
    return api.get(`/api/superadmin/audit-logs?${params}`);
  }, [page, appliedFilters]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBox error={error} onRetry={refetch} />;

  const logs = data?.logs || [];
  const totalPages = Math.ceil((data?.total || 0) / 50);

  const applyFilters = () => { setPage(1); setAppliedFilters({ ...filters }); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audit Logs ({data?.total || 0})</h1>
        <button onClick={refetch} className="p-2 hover:bg-gray-800 rounded-lg"><RefreshCw className="w-5 h-5" /></button>
      </div>
      <div className="flex gap-2">
        <input placeholder="Action" value={filters.action} onChange={e => setFilters({ ...filters, action: e.target.value })} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm flex-1" />
        <input placeholder="Entity Type" value={filters.entityType} onChange={e => setFilters({ ...filters, entityType: e.target.value })} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm flex-1" />
        <input placeholder="Restaurant ID" value={filters.restaurantId} onChange={e => setFilters({ ...filters, restaurantId: e.target.value })} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm flex-1" />
        <button onClick={applyFilters} className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-lg text-sm"><Search className="w-4 h-4" /> Filter</button>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Action</th>
              <th className="text-left px-4 py-3 font-medium">Entity</th>
              <th className="text-left px-4 py-3 font-medium">Restaurant</th>
              <th className="text-left px-4 py-3 font-medium">Metadata</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-gray-800/30">
                <td className="px-4 py-3 font-mono text-xs">{l.action}</td>
                <td className="px-4 py-3 text-gray-400">{l.entityType}{l.entityId ? `: ${l.entityId.slice(0, 8)}` : ''}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{l.restaurantId?.slice(0, 8) || '—'}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs max-w-xs truncate">{l.metadata ? JSON.stringify(l.metadata) : '—'}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(l.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 bg-gray-800 rounded text-sm disabled:opacity-50">Prev</button>
          <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 bg-gray-800 rounded text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
