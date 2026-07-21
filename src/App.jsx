import React, { useState, useEffect, useCallback } from 'react';
import { api, setSecret, clearSecret, hasSecret } from './api.js';
import {
  LayoutDashboard, Building2, CreditCard, Flag, Megaphone, Settings,
  Heart, FileText, LogOut, RefreshCw, Store,
} from 'lucide-react';

import OverviewTab from './tabs/OverviewTab.jsx';
import RestaurantsTab from './tabs/RestaurantsTab.jsx';
import PaymentsTab from './tabs/PaymentsTab.jsx';
import PlansTab from './tabs/PlansTab.jsx';
import FeatureFlagsTab from './tabs/FeatureFlagsTab.jsx';
import AnnouncementsTab from './tabs/AnnouncementsTab.jsx';
import AuditLogsTab from './tabs/AuditLogsTab.jsx';
import HealthTab from './tabs/HealthTab.jsx';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'restaurants', label: 'Restaurants', icon: Building2 },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'plans', label: 'Plans', icon: Settings },
  { id: 'feature-flags', label: 'Feature Flags', icon: Flag },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'audit-logs', label: 'Audit Logs', icon: FileText },
  { id: 'health', label: 'System Health', icon: Heart },
];

export default function App() {
  const [authed, setAuthed] = useState(hasSecret());
  const [tab, setTab] = useState('overview');

  if (!authed) return <LoginScreen onSuccess={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      <Sidebar tab={tab} setTab={setTab} onLogout={() => { clearSecret(); setAuthed(false); }} />
      <main className="flex-1 overflow-auto p-6">
        {tab === 'overview' && <OverviewTab />}
        {tab === 'restaurants' && <RestaurantsTab />}
        {tab === 'payments' && <PaymentsTab />}
        {tab === 'plans' && <PlansTab />}
        {tab === 'feature-flags' && <FeatureFlagsTab />}
        {tab === 'announcements' && <AnnouncementsTab />}
        {tab === 'audit-logs' && <AuditLogsTab />}
        {tab === 'health' && <HealthTab />}
      </main>
    </div>
  );
}

function LoginScreen({ onSuccess }) {
  const [secret, setSecretVal] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      setSecret(secret);
      await api.get('/api/superadmin/stats');
      onSuccess();
    } catch (err) {
      setError('Invalid superadmin secret');
      clearSecret();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">SoftShape AI</h1>
            <p className="text-sm text-gray-400">SuperAdmin Dashboard</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">SuperAdmin Secret</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecretVal(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter x-superadmin-secret"
              autoFocus
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !secret}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Sidebar({ tab, setTab, onLogout }) {
  return (
    <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-sm">SuperAdmin</span>
        </div>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                tab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </nav>
      <div className="p-2 border-t border-gray-800">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
