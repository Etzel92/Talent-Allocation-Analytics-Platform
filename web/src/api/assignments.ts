import { API, auth, toQuery } from "./core";

export async function searchAssignments(params: Record<string, any>) {
  const p = { limit: 100000, ...params }; // trae todo si no pasan límite
  const res = await fetch(`${API}/assignments/search?${toQuery(p)}`, {
    headers: auth(),
  });
  if (!res.ok) throw new Error("assignments search");
  return res.json() as Promise<
    Array<{ id: number; city: string; education: string; experience: number; payment_tier: number }>
  >;
}
