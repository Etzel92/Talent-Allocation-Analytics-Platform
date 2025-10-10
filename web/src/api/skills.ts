import { API, auth } from "./core";

export async function listSkills() {
  const res = await fetch(`${API}/skills`, { headers: auth() });
  if (!res.ok) throw new Error("skills");
  return res.json() as Promise<Array<{ id: number; name: string }>>;
}
