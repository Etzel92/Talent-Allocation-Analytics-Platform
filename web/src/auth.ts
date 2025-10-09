export function saveSession(token: string, role: string) {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
}
export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
}
export function getRole() {
  return localStorage.getItem('role');
}
export function isAuthed() {
  return !!localStorage.getItem('token');
}
