import React, { useState } from 'react';
import { api } from '../api.js';
import { useApiData, LoadingSpinner, ErrorBox, Modal } from '../components.jsx';
import { RefreshCw, Plus, Edit3, Save, Flag } from 'lucide-react';

export default function FeatureFlagsTab() {
  const { data, loading, error, refetch } = useApiData(() => api.get('/api/superadmin/feature-flags'));
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBox error={error} onRetry={refetch} />;

  const flags = data?.flags || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feature Flags</h1>
        <div className="flex gap-2">
          <button onClick={() => setCreating(true)} className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg text-sm"><Plus className="w-4 h-4" /> New Flag</button>
          <button onClick={refetch} className="p-2 hover:bg-gray-800 rounded-lg"><RefreshCw className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Key</th>
              <th className="text-left px-4 py-3 font-medium">Description</th>
              <th className="text-left px-4 py-3 font-medium">Global</th>
              <th className="text-left px-4 py-3 font-medium">Restaurants</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {flags.map((f) => (
              <tr key={f.id} className="hover:bg-gray-800/30">
                <td className="px-4 py-3 font-mono"><Flag className="w-3 h-3 inline mr-1 text-indigo-400" />{f.key}</td>
                <td className="px-4 py-3 text-gray-400">{f.description || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${f.enabledGlobally ? 'bg-green-600/20 text-green-300' : 'bg-gray-600/20 text-gray-400'}`}>
                    {f.enabledGlobally ? 'ON' : 'OFF'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{f.enabledRestaurants?.length || 0}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(f)} className="text-indigo-400 hover:text-indigo-300"><Edit3 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <FlagEditModal flag={editing} onClose={() => setEditing(null)} onSaved={refetch} />}
      {creating && <FlagCreateModal onClose={() => setCreating(false)} onSaved={refetch} />}
    </div>
  );
}

function FlagEditModal({ flag, onClose, onSaved }) {
  const [form, setForm] = useState({ ...flag, restaurantsText: (flag.enabledRestaurants || []).join(', ') });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await api.patch(`/api/superadmin/feature-flags/${flag.id}`, {
      description: form.description,
      enabledGlobally: form.enabledGlobally,
      enabledRestaurants: form.restaurantsText.split(',').map(s => s.trim()).filter(Boolean),
    });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Modal onClose={onClose} title={`Edit ${flag.key}`}>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Description</label>
          <input value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.enabledGlobally} onChange={e => setForm({ ...form, enabledGlobally: e.target.checked })} /> Enabled Globally</label>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Enabled Restaurants (comma-separated outlet IDs)</label>
          <textarea value={form.restaurantsText} onChange={e => setForm({ ...form, restaurantsText: e.target.value })} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 bg-gray-800 rounded-lg text-sm">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm"><Save className="w-4 h-4" /> Save</button>
      </div>
    </Modal>
  );
}

function FlagCreateModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ key: '', description: '', enabledGlobally: false, restaurantsText: '' });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    setSaving(true);
    await api.post('/api/superadmin/feature-flags', {
      key: form.key,
      description: form.description,
      enabledGlobally: form.enabledGlobally,
      enabledRestaurants: form.restaurantsText.split(',').map(s => s.trim()).filter(Boolean),
    });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Modal onClose={onClose} title="Create Feature Flag">
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Key</label>
          <input value={form.key} onChange={e => setForm({ ...form, key: e.target.value })} placeholder="e.g. bar_module" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Description</label>
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.enabledGlobally} onChange={e => setForm({ ...form, enabledGlobally: e.target.checked })} /> Enabled Globally</label>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Enabled Restaurants (comma-separated outlet IDs)</label>
          <textarea value={form.restaurantsText} onChange={e => setForm({ ...form, restaurantsText: e.target.value })} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 bg-gray-800 rounded-lg text-sm">Cancel</button>
        <button onClick={handleCreate} disabled={saving || !form.key} className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm"><Save className="w-4 h-4" /> Create</button>
      </div>
    </Modal>
  );
}
