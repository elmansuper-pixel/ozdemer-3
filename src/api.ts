// src/api.ts
// Все fetch-вызовы к серверу в одном месте.

const BASE = "http://localhost:4000";

async function get<T>(url: string): Promise<T> {
  const r = await fetch(`${BASE}${url}`);
  if (!r.ok) throw new Error(`GET ${url} → ${r.status}`);
  return r.json();
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${url}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`POST ${url} → ${r.status}`);
  return r.json();
}

async function patch<T>(url: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${url}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`PATCH ${url} → ${r.status}`);
  return r.json();
}

async function del(url: string): Promise<void> {
  const r = await fetch(`${BASE}${url}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`DELETE ${url} → ${r.status}`);
}

// ── Clients ──────────────────────────────────────────────────────────────────
export const apiGetClients    = ()         => get<any[]>("/api/clients");
export const apiPostClient    = (b: any)   => post<any>("/api/clients", b);
export const apiPatchClient   = (id: number, b: any) => patch<any>(`/api/clients/${id}`, b);
export const apiDeleteClient  = (id: number) => del(`/api/clients/${id}`);

// ── Products ─────────────────────────────────────────────────────────────────
export const apiGetProducts   = ()         => get<any[]>("/api/products");
export const apiPostProduct   = (b: any)   => post<any>("/api/products", b);
export const apiPatchProduct  = (id: number, b: any) => patch<any>(`/api/products/${id}`, b);
export const apiDeleteProduct = (id: number) => del(`/api/products/${id}`);

// ── Sales ────────────────────────────────────────────────────────────────────
export const apiGetSales      = ()         => get<any[]>("/api/sales");
export const apiPostSale      = (b: any)   => post<any>("/api/sales", b);

// ── Kassa ops ────────────────────────────────────────────────────────────────
export const apiGetKassaOps   = ()         => get<any[]>("/api/kassa-ops");
export const apiPostKassaOp   = (b: any)   => post<any>("/api/kassa-ops", b);
