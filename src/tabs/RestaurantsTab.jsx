import React, { useState, useEffect } from 'react';
import { api } from '../api.js';
import { useApiData, LoadingSpinner, ErrorBox, StatusBadge, Modal, Field, StatBox } from '../components.jsx';
import { RefreshCw, Search } from 'lucide-react';

export default function RestaurantsTab() {
  const { data, loading, error, refetch } = useApiData(() => api.get('/api/superadmin/restaurants'));
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBox error={error} onRetry={refetch} />;

  const restaurants = data?.restaurants || [];
  const filtered = restaurants.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.slug?.toLowerCase().includes(search.toLowerCase()) ||
    r.restaurantCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Restaurants ({restaurants.length})</h1>
        <button onClick={refetch} className="p-2 hover:bg-gray-800 rounded-lg"><RefreshCw className="w-5 h-5" /></button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name, slug, or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Code</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Plan</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Users</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-800/30">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3 text-gray-400">{r.restaurantCode}</td>
                <td className="px-4 py-3 text-gray-400">{r.restaurantType || '—'}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-indigo-600/20 text-indigo-300 rounded text-xs">{r.plan || 'starter'}</span></td>
                <td className="px-4 py-3"><StatusBadge status={r.billingStatus} /></td>
                <td className="px-4 py-3 text-gray-400">{r._count?.users ?? '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setSelected(r.id)} className="text-indigo-400 hover:text-indigo-300 text-xs">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && <RestaurantDetailModal id={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function RestaurantDetailModal({ id, onClose }) {
  const { data, loading, error } = useApiData(() => api.get(`/api/superadmin/restaurants/${id}`));
  const [plan, setPlan] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (data?.plan) setPlan(data.plan); }, [data]);

  const handleSuspend = async () => { await api.patch(`/api/superadmin/restaurants/${id}/suspend`); onClose(); };
  const handleActivate = async () => { await api.patch(`/api/superadmin/restaurants/${id}/activate`); onClose(); };
  const handleExtendTrial = async () => { await api.patch(`/api/superadmin/restaurants/${id}/extend-trial`, { days: 14 }); onClose(); };
  const handleChangePlan = async () => {
    setSaving(true);
    await api.patch(`/api/superadmin/restaurants/${id}/change-plan`, { plan });
    setSaving(false);
    onClose();
  };

  return (
    <Modal onClose={onClose} title="Restaurant Details">
      {loading && <LoadingSpinner />}
      {error && <ErrorBox error={error} />}
      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" value={data.name} />
            <Field label="Code" value={data.restaurantCode} />
            <Field label="Slug" value={data.slug} />
            <Field label="Type" value={data.restaurantType || '—'} />
            <Field label="Plan" value={data.plan || '—'} />
            <Field label="Status" value={<StatusBadge status={data.billingStatus} />} />
            <Field label="Trial Ends" value={data.trialEndsAt ? new Date(data.trialEndsAt).toLocaleDateString() : '—'} />
            <Field label="Created" value={new Date(data.createdAt).toLocaleDateString()} />
          </div>
          <div className="grid grid-cols-4 gap-3 pt-2">
            <StatBox label="Menu Items" value={data.counts?.menuItemCount} />
            <StatBox label="Orders" value={data.counts?.orderCount} />
            <StatBox label="Transactions" value={data.counts?.txnCount} />
            <StatBox label="Users" value={data.counts?.userCount} />
          </div>
          {data.users?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Users</h4>
              <div className="space-y-1">
                {data.users.map(u => (
                  <div key={u.id} className="flex items-center justify-between text-sm bg-gray-800/50 rounded px-3 py-1.5">
                    <span>{u.name} ({u.email})</span>
                    <span className="text-gray-400">{u.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="border-t border-gray-800 pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-gray-300">Actions</h4>
            <div className="flex items-center gap-2">
              <select value={plan} onChange={(e) => setPlan(e.target.value)} className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm">
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <button onClick={handleChangePlan} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded text-sm">Change Plan</button>
            </div>
            <div className="flex gap-2">
              <button onClick={handleActivate} className="bg-green-600/20 text-green-300 hover:bg-green-600/30 px-3 py-1.5 rounded text-sm">Activate</button>
              <button onClick={handleSuspend} className="bg-red-600/20 text-red-300 hover:bg-red-600/30 px-3 py-1.5 rounded text-sm">Suspend</button>
              <button onClick={handleExtendTrial} className="bg-yellow-600/20 text-yellow-300 hover:bg-yellow-600/30 px-3 py-1.5 rounded text-sm">Extend Trial (+14d)</button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
