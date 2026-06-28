import React, { useState } from 'react';
import { api } from '../api.js';
import { useApiData, LoadingSpinner, ErrorBox } from '../components.jsx';
import { RefreshCw } from 'lucide-react';

export default function PaymentsTab() {
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useApiData(
    () => api.get(`/api/superadmin/payments?page=${page}&limit=50`),
    [page]
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBox error={error} onRetry={refetch} />;

  const payments = data?.payments || [];
  const totalPages = Math.ceil((data?.total || 0) / 50);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payments ({data?.total || 0})</h1>
        <button onClick={refetch} className="p-2 hover:bg-gray-800 rounded-lg"><RefreshCw className="w-5 h-5" /></button>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Session</th>
              <th className="text-left px-4 py-3 font-medium">Plan</th>
              <th className="text-left px-4 py-3 font-medium">Outlets</th>
              <th className="text-left px-4 py-3 font-medium">Amount</th>
              <th className="text-left px-4 py-3 font-medium">Gateway</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-800/30">
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.sessionId?.slice(0, 8)}...</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-indigo-600/20 text-indigo-300 rounded text-xs">{p.plan}</span></td>
                <td className="px-4 py-3">{p.numberOfOutlets}</td>
                <td className="px-4 py-3 font-medium">₹{Number(p.amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-400">{p.gateway}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    p.status === 'SUCCESS' ? 'bg-green-600/20 text-green-300' :
                    p.status === 'FAILED' ? 'bg-red-600/20 text-red-300' :
                    'bg-yellow-600/20 text-yellow-300'
                  }`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
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
