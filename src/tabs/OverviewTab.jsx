import React from 'react';
import { api } from '../api.js';
import { useApiData, LoadingSpinner, ErrorBox, StatCard } from '../components.jsx';
import { RefreshCw, Store, CheckCircle, TrendingUp, XCircle, AlertTriangle, Users, DollarSign } from 'lucide-react';

export default function OverviewTab() {
  const { data: stats, loading, error, refetch } = useApiData(() => api.get('/api/superadmin/stats'));
  const { data: revenue } = useApiData(() => api.get('/api/superadmin/revenue/monthly'));

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBox error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <button onClick={refetch} className="p-2 hover:bg-gray-800 rounded-lg"><RefreshCw className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Store} label="Total Outlets" value={stats?.total ?? '—'} color="indigo" />
        <StatCard icon={CheckCircle} label="Active" value={stats?.active ?? '—'} color="green" />
        <StatCard icon={TrendingUp} label="Trialing" value={stats?.trialing ?? '—'} color="yellow" />
        <StatCard icon={XCircle} label="Suspended" value={stats?.suspended ?? '—'} color="red" />
        <StatCard icon={AlertTriangle} label="Expired" value={stats?.expired ?? '—'} color="red" />
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? '—'} color="blue" />
      </div>
      {revenue?.monthly && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5" /> Monthly Revenue (Last 12 Months)</h2>
          <RevenueChart data={revenue.monthly} />
        </div>
      )}
    </div>
  );
}

function RevenueChart({ data }) {
  if (!data || data.length === 0) return <p className="text-gray-400 text-sm">No revenue data</p>;
  const maxRev = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.month} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-20">{d.month}</span>
          <div className="flex-1 bg-gray-800 rounded-full h-6 overflow-hidden">
            <div className="bg-indigo-600 h-full flex items-center justify-end px-2" style={{ width: `${Math.max((d.revenue / maxRev) * 100, 2)}%` }}>
              {d.revenue > 0 && <span className="text-xs text-white">₹{d.revenue.toLocaleString()}</span>}
            </div>
          </div>
          <span className="text-xs text-gray-500 w-12 text-right">{d.count} txns</span>
        </div>
      ))}
    </div>
  );
}
