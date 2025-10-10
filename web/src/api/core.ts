export const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export function auth(): Headers {
  const h = new Headers();
  const token =
    localStorage.getItem("access_token") || localStorage.getItem("token");
  if (token) h.set("Authorization", `Bearer ${token}`);
  return h;
}

export function toQuery(params: Record<string, unknown> = {}): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) v.forEach(x => usp.append(k, String(x)));
    else usp.append(k, String(v));
  }
  return usp.toString();
}