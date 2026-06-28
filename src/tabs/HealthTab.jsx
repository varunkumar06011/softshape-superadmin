import React from 'react';
import { api } from '../api.js';
import { useApiData, LoadingSpinner, ErrorBox } from '../components.jsx';
import { RefreshCw, Heart, Database, Server } from 'lucide-react';

export default function HealthTab() {
  const { data, loading, error, refetch } = useApiData(() => api.get('/api/superadmin/health'));

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBox error={error} onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Health</h1>
        <button onClick={refetch} className="p-2 hover:bg-gray-800 rounded-lg"><RefreshCw className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold">Database</h3>
          </div>
          <p className="text-sm text-gray-400">{data?.db || '—'}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold">Redis</h3>
          </div>
          <p className="text-sm text-gray-400">{data?.redis || '—'}</p>
        </div>
      </div>
      {data?.tableCounts && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold">Table Counts</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(data.tableCounts).map(([table, count]) => (
              <div key={table} className="bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold">{count?.toLocaleString()}</p>
                <p className="text-xs text-gray-400 capitalize">{table}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
