import React, { useState } from 'react';
import { api } from '../api.js';
import { useApiData, LoadingSpinner, ErrorBox, Modal } from '../components.jsx';
import { RefreshCw, Plus, Edit3, Save, Megaphone } from 'lucide-react';

export default function AnnouncementsTab() {
  const { data, loading, error, refetch } = useApiData(() => api.get('/api/superadmin/announcements'));
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBox error={error} onRetry={refetch} />;

  const announcements = data?.announcements || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <div className="flex gap-2">
          <button onClick={() => setCreating(true)} className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg text-sm"><Plus className="w-4 h-4" /> New</button>
          <button onClick={refetch} className="p-2 hover:bg-gray-800 rounded-lg"><RefreshCw className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Megaphone className={`w-5 h-5 mt-0.5 ${a.type === 'critical' ? 'text-red-400' : a.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'}`} />
                <div>
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{a.body}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className={`px-2 py-0.5 rounded ${a.type === 'critical' ? 'bg-red-600/20 text-red-300' : a.type === 'warning' ? 'bg-yellow-600/20 text-yellow-300' : 'bg-blue-600/20 text-blue-300'}`}>{a.type}</span>
                    <span className="text-gray-500">Target: {a.target}</span>
                    <span className={`px-2 py-0.5 rounded ${a.isActive ? 'bg-green-600/20 text-green-300' : 'bg-gray-600/20 text-gray-400'}`}>{a.isActive ? 'Active' : 'Inactive'}</span>
                    {a.activeFrom && <span className="text-gray-500">From: {new Date(a.activeFrom).toLocaleDateString()}</span>}
                    {a.activeUntil && <span className="text-gray-500">Until: {new Date(a.activeUntil).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => setEditing(a)} className="p-1 hover:bg-gray-800 rounded"><Edit3 className="w-4 h-4 text-gray-400" /></button>
            </div>
          </div>
        ))}
        {announcements.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No announcements yet</p>}
      </div>
      {editing && <AnnouncementEditModal announcement={editing} onClose={() => setEditing(null)} onSaved={refetch} />}
      {creating && <AnnouncementCreateModal onClose={() => setCreating(false)} onSaved={refetch} />}
    </div>
  );
}

function AnnouncementForm({ form, setForm }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Title</label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Body</label>
        <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Type</label>
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Target</label>
          <input value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} placeholder="all or outlet ID" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Active From (optional)</label>
          <input type="datetime-local" value={form.activeFrom || ''} onChange={e => setForm({ ...form, activeFrom: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Active Until (optional)</label>
          <input type="datetime-local" value={form.activeUntil || ''} onChange={e => setForm({ ...form, activeUntil: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
    </div>
  );
}

function AnnouncementEditModal({ announcement, onClose, onSaved }) {
  const [form, setForm] = useState({ ...announcement });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await api.patch(`/api/superadmin/announcements/${announcement.id}`, form);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Modal onClose={onClose} title="Edit Announcement">
      <AnnouncementForm form={form} setForm={setForm} />
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 bg-gray-800 rounded-lg text-sm">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm"><Save className="w-4 h-4" /> Save</button>
      </div>
    </Modal>
  );
}

function AnnouncementCreateModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ title: '', body: '', type: 'info', target: 'all', isActive: true, activeFrom: '', activeUntil: '' });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    setSaving(true);
    await api.post('/api/superadmin/announcements', {
      ...form,
      activeFrom: form.activeFrom || null,
      activeUntil: form.activeUntil || null,
    });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Modal onClose={onClose} title="Create Announcement">
      <AnnouncementForm form={form} setForm={setForm} />
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 bg-gray-800 rounded-lg text-sm">Cancel</button>
        <button onClick={handleCreate} disabled={saving || !form.title || !form.body} className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm"><Save className="w-4 h-4" /> Create</button>
      </div>
    </Modal>
  );
}
