export const TOKEN_KEY = 'token';
export const ROLE_KEY  = 'role';

let logoutTimer: number | undefined;
let onExpire: (() => void) | null = null;  // ⬅️ callback

export function setOnSessionExpire(fn: () => void) {  // ⬅️ registrar callback
  onExpire = fn;
}

// --- helpers de storage ---
export function saveSession(token: string, role: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  scheduleAutoLogout(token);        // programa auto-logout
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  if (logoutTimer) { clearTimeout(logoutTimer); logoutTimer = undefined; }
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

// --- JWT exp ---
function decodeBase64Url(s: string) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4;
  if (pad) s += '='.repeat(4 - pad);
  return atob(s);
}

export function getTokenExpiryMs(token: string): number | null {
  try {
    const payloadStr = decodeBase64Url(token.split('.')[1] || '');
    const payload = JSON.parse(payloadStr);
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

// isAuthed = existe token y NO está vencido
export function isAuthed(): boolean {
  const t = getToken();
  if (!t) return false;
  const exp = getTokenExpiryMs(t);
  return !!exp && exp > Date.now();
}

// Programa el auto-logout (2s antes del exp) y llama onExpire()
export function scheduleAutoLogout(token?: string) {
  if (logoutTimer) { clearTimeout(logoutTimer); logoutTimer = undefined; }
  const t = token || getToken();
  if (!t) return;

  const expMs = getTokenExpiryMs(t);
  if (!expMs) return;

  const msLeft = expMs - Date.now();
  if (msLeft <= 0) {
    clearSession();
    onExpire?.();    
    return;
  }
  logoutTimer = window.setTimeout(() => {
    clearSession();
    onExpire?.();    
  }, Math.max(0, msLeft - 2000));
}

// Llamar al iniciar la app para armar el timer si aplica
export function restoreSession() {
  const t = getToken();
  if (!t) { return; }
  const exp = getTokenExpiryMs(t);
  if (!exp || exp <= Date.now()) {
    clearSession();
    return;
  }
  scheduleAutoLogout(t);
}
