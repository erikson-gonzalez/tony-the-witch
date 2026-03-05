import { apiRequest } from "@/lib/queryClient";

const BASE = "/api/admin";

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message ?? `Request failed: ${res.status}`);
  return data as T;
}

async function adminMutation<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message ?? `Request failed: ${res.status}`);
  return data as T;
}

export type LoginResult =
  | { success: true; username: string }
  | { success: false; message: string };

export const adminApi = {
  auth: {
    login: async (username: string, password: string): Promise<LoginResult> => {
      const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return { success: true, username: (data as { username: string }).username };
      return { success: false, message: (data as { message?: string }).message ?? "Invalid credentials" };
    },

    logout: () => apiRequest("POST", `${BASE}/auth/logout`),

    me: () =>
      adminFetch<{ username: string; authenticated: true }>(`${BASE}/auth/me`),
  },

  config: {
    get: () => adminFetch<{ data: Record<string, unknown> }>(`${BASE}/config`),
    update: (data: Record<string, unknown>) =>
      adminMutation("PUT", `${BASE}/config`, data),
  },

  navCards: {
    list: () => adminFetch<Array<Record<string, unknown>>>(`${BASE}/nav-cards`),
    create: (data: Record<string, unknown>) =>
      adminMutation("POST", `${BASE}/nav-cards`, data),
    update: (id: number, data: Record<string, unknown>) =>
      adminMutation("PUT", `${BASE}/nav-cards/${id}`, data),
    delete: (id: number) =>
      adminMutation("DELETE", `${BASE}/nav-cards/${id}`),
  },

  gallery: {
    list: () => adminFetch<Array<Record<string, unknown>>>(`${BASE}/gallery`),
    create: (data: Record<string, unknown>) =>
      adminMutation("POST", `${BASE}/gallery`, data),
    createBatch: (items: Array<{ image: string; category: string }>) =>
      adminMutation("POST", `${BASE}/gallery/batch`, { items }),
    update: (id: number, data: Record<string, unknown>) =>
      adminMutation("PUT", `${BASE}/gallery/${id}`, data),
    delete: (id: number) =>
      adminMutation("DELETE", `${BASE}/gallery/${id}`),
  },

  products: {
    list: () => adminFetch<Array<Record<string, unknown>>>(`${BASE}/products`),
    create: (data: Record<string, unknown>) =>
      adminMutation("POST", `${BASE}/products`, data),
    update: (id: number, data: Record<string, unknown>) =>
      adminMutation("PUT", `${BASE}/products/${id}`, data),
    delete: (id: number) =>
      adminMutation("DELETE", `${BASE}/products/${id}`),
  },
};
