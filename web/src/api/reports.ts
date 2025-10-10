import { API, auth, toQuery } from "./core";

export type DistItem = { key: string; count: number };
export type CorrPoint = { x: number; y: number };

export async function getDistribution(
  dimension: string,
  params: Record<string, unknown> = {}
): Promise<DistItem[]> {
  const qs = toQuery({ dimension, ...params });
  const res = await fetch(`${API}/reports/distribution?${qs}`, {
    headers: auth(),
  });
  if (!res.ok) throw new Error(`distribution ${res.status}`);
  return res.json();
}

export async function getCorrelation(
  params: Record<string, unknown> = {}
): Promise<CorrPoint[]> {
  const qs = toQuery(params);
  const res = await fetch(`${API}/reports/correlation?${qs}`, {
    headers: auth(),
  });
  if (!res.ok) throw new Error(`correlation ${res.status}`);
  return res.json();
}

export async function getLeaveProbability(
  params: Record<string, unknown> = {}
): Promise<{ probability: number }> {
  const qs = toQuery(params);
  const res = await fetch(`${API}/reports/leave_probability?${qs}`, {
    headers: auth(),
  });
  if (!res.ok) throw new Error(`leave_probability ${res.status}`);
  return res.json();
}

export async function exportCsv(
  params: Record<string, unknown> = {}
): Promise<void> {
  const qs = toQuery(params);
  const res = await fetch(`${API}/reports/export?${qs}`, {
    headers: auth(),
  });
  if (!res.ok) throw new Error(`export ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "employees_export.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportPreset(
  kind: "diversity" | "attrition" | "talent",
  params: Record<string, unknown> = {}
): Promise<void> {
  const qs = toQuery({ kind, ...params });
  const res = await fetch(`${API}/reports/export_preset?${qs}`, {
    headers: auth(),
  });
  if (!res.ok) throw new Error(`export_preset ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${kind}_report.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
