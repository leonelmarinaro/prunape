const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api`;

let _tokenGetter: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(fn: () => Promise<string | null>): void {
  _tokenGetter = fn;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const authHeaders: Record<string, string> = {};
  if (_tokenGetter) {
    const token = await _tokenGetter();
    if (token) authHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "Error en la solicitud");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function get<T>(path: string) {
  return request<T>(path);
}

export function post<T>(path: string, body: unknown) {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export function put<T>(path: string, body: unknown) {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

export function del(path: string) {
  return request<void>(path, { method: "DELETE" });
}
