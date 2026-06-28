const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

function getSecret() {
  return localStorage.getItem('superadmin_secret') || '';
}

export function setSecret(secret) {
  localStorage.setItem('superadmin_secret', secret);
}

export function clearSecret() {
  localStorage.removeItem('superadmin_secret');
}

export function hasSecret() {
  return Boolean(getSecret());
}

async function apiCall(path, options = {}) {
  const secret = getSecret();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-superadmin-secret': secret,
      ...options.headers,
    },
  });
  return res;
}

export const api = {
  async get(path) {
    const res = await apiCall(path);
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    return res.json();
  },

  async post(path, body) {
    const res = await apiCall(path, { method: 'POST', body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    return res.json();
  },

  async patch(path, body) {
    const res = await apiCall(path, { method: 'PATCH', body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    return res.json();
  },

  async del(path) {
    const res = await apiCall(path, { method: 'DELETE' });
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    return res.json();
  },
};

export { API_BASE };
