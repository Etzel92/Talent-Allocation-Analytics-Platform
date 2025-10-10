// web/src/api/reports.ts
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function auth(): Headers {
  const h = new Headers();
  const token =
    localStorage.getItem("access_token") || localStorage.getItem("token");
  if (token) h.set("Authorization", `Bearer ${token}`);
  return h;
}

function toQuery(params: Record<string, unknown> = {}): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") usp.append(k, String(v));
  }
  return usp.toString();
}

export async function getDistribution(
  dimension: string,
  params: Record<string, unknown> = {}
) {
  const qs = toQuery({ dimension, ...params });
  const res = await fetch(`${API}/reports/distribution?${qs}`, {
    headers: auth(),
  });
  if (!res.ok) throw new Error(`distribution ${res.status}`);
  return res.json() as Promise<Array<{ key: string; count: number }>>;
}

export async function getCorrelation(params: Record<string, unknown> = {}) {
  const qs = toQuery(params);
  const res = await fetch(`${API}/reports/correlation?${qs}`, {
    headers: auth(),
  });
  if (!res.ok) throw new Error(`correlation ${res.status}`);
  return res.json() as Promise<Array<{ x: number; y: number }>>;
}

export async function getLeaveProbability(
  params: Record<string, unknown> = {}
) {
  const qs = toQuery(params);
  const res = await fetch(`${API}/reports/leave_probability?${qs}`, {
    headers: auth(),
  });
  if (!res.ok) throw new Error(`leave_probability ${res.status}`);
  return res.json() as Promise<{ probability: number }>;
}

export async function exportCsv(params: Record<string, unknown> = {}) {
  const qs = toQuery(params);
  const res = await fetch(`${API}/reports/export?${qs}`, { headers: auth() });
  if (!res.ok) throw new Error(`export ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "report.csv";
  a.click();
  URL.revokeObjectURL(url);
}
