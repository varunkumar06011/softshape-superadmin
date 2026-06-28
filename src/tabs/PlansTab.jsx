import React, { useState } from 'react';
import { api } from '../api.js';
import { useApiData, LoadingSpinner, ErrorBox, Modal } from '../components.jsx';
import { RefreshCw, Plus, Edit3, Save } from 'lucide-react';

export default function PlansTab() {
  const { data, loading, error, refetch } = useApiData(() => api.get('/api/superadmin/plans'));
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBox error={error} onRetry={refetch} />;

  const plans = data?.plans || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Plan Configuration</h1>
        <div className="flex gap-2">
          <button onClick={() => setCreating(true)} className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg text-sm"><Plus className="w-4 h-4" /> New Plan</button>
          <button onClick={refetch} className="p-2 hover:bg-gray-800 rounded-lg"><RefreshCw className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <button onClick={() => setEditing(p)} className="p-1 hover:bg-gray-800 rounded"><Edit3 className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Plan ID:</span><span className="font-mono">{p.planId}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Base Price:</span><span>₹{p.basePrice}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Per Extra Outlet:</span><span>₹{p.perExtraOutletPrice}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Included Outlets:</span><span>{p.includedOutlets}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Custom Quote:</span><span>{p.isCustomQuote ? 'Yes' : 'No'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Active:</span><span>{p.isActive ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
        ))}
      </div>
      {editing && <PlanEditModal plan={editing} onClose={() => setEditing(null)} onSaved={refetch} />}
      {creating && <PlanCreateModal onClose={() => setCreating(false)} onSaved={refetch} />}
    </div>
  );
}

function PlanEditModal({ plan, onClose, onSaved }) {
  const [form, setForm] = useState({ ...plan });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await api.patch(`/api/superadmin/plans/${plan.planId}`, {
      name: form.name,
      basePrice: Number(form.basePrice),
      perExtraOutletPrice: Number(form.perExtraOutletPrice),
      includedOutlets: Number(form.includedOutlets),
      isCustomQuote: form.isCustomQuote,
      isActive: form.isActive,
    });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Modal onClose={onClose} title={`Edit ${plan.name}`}>
      <PlanForm form={form} setForm={setForm} />
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 bg-gray-800 rounded-lg text-sm">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm"><Save className="w-4 h-4" /> Save</button>
      </div>
    </Modal>
  );
}

function PlanCreateModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ planId: '', name: '', basePrice: 0, perExtraOutletPrice: 0, includedOutlets: 1, isCustomQuote: false, isActive: true });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    setSaving(true);
    await api.post('/api/superadmin/plans', form);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Modal onClose={onClose} title="Create New Plan">
      <PlanForm form={form} setForm={setForm} />
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 bg-gray-800 rounded-lg text-sm">Cancel</button>
        <button onClick={handleCreate} disabled={saving || !form.planId || !form.name} className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm"><Save className="w-4 h-4" /> Create</button>
      </div>
    </Modal>
  );
}

function PlanForm({ form, setForm }) {
  return (
    <div className="space-y-3">
      <Input label="Plan ID" value={form.planId} onChange={v => setForm({ ...form, planId: v })} disabled={!!form.id} />
      <Input label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
      <Input label="Base Price (₹)" type="number" value={form.basePrice} onChange={v => setForm({ ...form, basePrice: v })} />
      <Input label="Per Extra Outlet Price (₹)" type="number" value={form.perExtraOutletPrice} onChange={v => setForm({ ...form, perExtraOutletPrice: v })} />
      <Input label="Included Outlets" type="number" value={form.includedOutlets} onChange={v => setForm({ ...form, includedOutlets: v })} />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isCustomQuote} onChange={e => setForm({ ...form, isCustomQuote: e.target.checked })} /> Custom Quote</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', disabled }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input type={type} value={value} disabled={disabled} onChange={e => onChange(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm disabled:opacity-50" />
    </div>
  );
}
