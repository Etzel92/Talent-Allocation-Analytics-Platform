import { auth, API } from "./core";

function jsonHeaders(): Headers {
  const h = auth();
  h.set("Content-Type", "application/json");
  return h;
}

export async function listBenchEvents(employeeId: number) {
  const res = await fetch(`${API}/bench/employees/${employeeId}/events`, {
    headers: auth(),
  });
  if (!res.ok) throw new Error("bench list");
  return res.json() as Promise<
    Array<{ id: number; start_date: string; end_date: string | null; reason?: string }>
  >;
}

export async function startBench(employeeId: number, start_date: string, reason?: string) {
  const res = await fetch(`${API}/bench/employees/${employeeId}/events`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ start_date, reason }),
  });
  if (!res.ok) throw new Error("bench start");
  return res.json();
}

export async function endBench(eventId: number, end_date: string) {
  const res = await fetch(`${API}/bench/events/${eventId}/end`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: JSON.stringify({ end_date }),
  });
  if (!res.ok) throw new Error("bench end");
  return res.json();
}