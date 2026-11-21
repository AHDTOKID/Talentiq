const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const TOKEN_KEY = 'talentiq_session';

export const session = {
  read() { try { return JSON.parse(sessionStorage.getItem(TOKEN_KEY) || 'null'); } catch { return null; } },
  save(value) { sessionStorage.setItem(TOKEN_KEY, JSON.stringify(value)); },
  clear() { sessionStorage.removeItem(TOKEN_KEY); }
};

export async function api(path, { method = 'GET', body, signal, responseType = 'json' } = {}) {
  const token = session.read()?.token;
  const form = body instanceof FormData;
  const response = await fetch(`${BASE}${path}`, {
    method, signal,
    headers: { ...(form ? {} : body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: form ? body : body === undefined ? undefined : JSON.stringify(body)
  });
  if (responseType === 'blob' && response.ok) return response.blob();
  let data;
  try { data = await response.json(); } catch { data = { message: `Request failed (${response.status}).` }; }
  if (!response.ok) {
    if (response.status === 401 && !path.includes('/auth/login') && !path.includes('/auth/register')) {
      session.clear();
      window.dispatchEvent(new Event('talentiq:unauthorized'));
    }
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

export async function downloadProtected(path, filename) {
  const blob = await api(path, { responseType: 'blob' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
