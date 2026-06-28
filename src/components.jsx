import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, X } from 'lucide-react';

export function useApiData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, deps);

  useEffect(() => { refetch(); }, [refetch]);
  return { data, loading, error, refetch };
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
    </div>
  );
}

export function ErrorBox({ error, onRetry }) {
  return (
    <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center gap-3">
      <AlertTriangle className="w-5 h-5 text-red-400" />
      <span className="text-red-300 text-sm flex-1">{error}</span>
      {onRetry && <button onClick={onRetry} className="text-red-400 hover:text-red-300"><RefreshCw className="w-4 h-4" /></button>}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-600', green: 'bg-green-600', red: 'bg-red-600',
    yellow: 'bg-yellow-600', blue: 'bg-blue-600',
  };
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 ${colors[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const colors = {
    active: 'bg-green-600/20 text-green-300',
    trialing: 'bg-yellow-600/20 text-yellow-300',
    suspended: 'bg-red-600/20 text-red-300',
    expired: 'bg-red-600/20 text-red-300',
  };
  return <span className={`px-2 py-0.5 rounded text-xs ${colors[status] || 'bg-gray-600/20 text-gray-300'}`}>{status || 'unknown'}</span>;
}

export function Modal({ onClose, title, children }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export function StatBox({ label, value }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
      <p className="text-lg font-bold">{value ?? '—'}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}
