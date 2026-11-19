export const API_BASE: string = import.meta.env.VITE_API_BASE || "http://localhost:5128/api";

/** Field-level errors from the API, keyed by camelCase property name. */
export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  constructor(message: string, public status: number, public fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = "ApiError";
  }
}

let onUnauthorized: (() => void) | null = null;
/** AuthContext registers a handler so an expired/invalid token logs the user out everywhere. */
export function setUnauthorizedHandler(fn: (() => void) | null) { onUnauthorized = fn; }

interface RequestOptions { method?: string; body?: unknown; token?: string | null; signal?: AbortSignal }

export async function request<T>(path: string, { method = "GET", body, token, signal }: RequestOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method, signal,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError("NETWORK", 0);
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.();
    if (res.status === 429) throw new ApiError("RATE_LIMIT", 429);
    const fieldErrors: FieldErrors = data?.errors ?? {};
    const first = Object.values(fieldErrors)[0]?.[0];
    throw new ApiError(first ?? data?.detail ?? data?.title ?? `Request failed (${res.status})`, res.status, fieldErrors);
  }
  return data as T;
}

export const qs = (params: Record<string, string | number | boolean | undefined | null>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== "") sp.set(k, String(v)); });
  const s = sp.toString();
  return s ? `?${s}` : "";
};
