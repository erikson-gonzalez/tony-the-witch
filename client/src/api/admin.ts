import { apiRequest } from "@/lib/queryClient";
import type { SiteConfigData } from "@shared/schema";

const BASE = "/api/admin";

// -----------------------------------------------------------------------------
// Wire types — what the server actually returns over the network. These are
// hand-rolled (rather than imported from @shared/schema) because the server
// normalizes a few fields on the way out: price comes back as `number`, not
// `numeric` string; sortOrder is always present; nullable jsonb fields stay
// optional. Keep these in sync with server/routes-admin.ts response shapes.
// -----------------------------------------------------------------------------

export interface AdminNavCard {
  id: number;
  title: string;
  subtitle: string;
  href: string;
  external: boolean;
  image: string;
  sortOrder: number;
}

export interface AdminGalleryWork {
  id: number;
  image: string;
  category: string;
  height: "short" | "medium" | "tall" | null;
  sortOrder: number;
}

export interface AdminProduct {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  description: string;
  sizes: string[] | null;
  colors: string[] | null;
  sizeStock: Record<string, number> | null;
  colorStock: Record<string, number> | null;
  sizeColorStock: Record<string, Record<string, number>> | null;
  images: string[];
  sortOrder: number;
}

export interface AdminConfigResponse {
  data: SiteConfigData;
}

// -----------------------------------------------------------------------------
// CSRF token. Set whenever the server returns one (login + me). All admin
// mutations include it as the X-CSRF-Token header so the server can reject
// forged cross-origin form posts even if the session cookie leaks.
// -----------------------------------------------------------------------------

let csrfToken: string | null = null;

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

export function getCsrfToken(): string | null {
  return csrfToken;
}

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
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
  const res = await fetch(path, {
    method,
    credentials: "include",
    headers,
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
      if (res.ok) {
        const payload = data as { username: string; csrfToken?: string };
        if (payload.csrfToken) setCsrfToken(payload.csrfToken);
        return { success: true, username: payload.username };
      }
      return { success: false, message: (data as { message?: string }).message ?? "Invalid credentials" };
    },

    logout: async () => {
      const res = await apiRequest("POST", `${BASE}/auth/logout`);
      setCsrfToken(null);
      return res;
    },

    me: async () => {
      const data = await adminFetch<{
        username: string;
        authenticated: true;
        csrfToken?: string;
      }>(`${BASE}/auth/me`);
      if (data.csrfToken) setCsrfToken(data.csrfToken);
      return data;
    },
  },

  config: {
    get: () => adminFetch<AdminConfigResponse>(`${BASE}/config`),
    update: (data: Record<string, unknown>) =>
      adminMutation<AdminConfigResponse>("PUT", `${BASE}/config`, data),
  },

  navCards: {
    list: () => adminFetch<AdminNavCard[]>(`${BASE}/nav-cards`),
    create: (data: Record<string, unknown>) =>
      adminMutation<AdminNavCard>("POST", `${BASE}/nav-cards`, data),
    update: (id: number, data: Record<string, unknown>) =>
      adminMutation<AdminNavCard>("PUT", `${BASE}/nav-cards/${id}`, data),
    delete: (id: number) =>
      adminMutation<void>("DELETE", `${BASE}/nav-cards/${id}`),
  },

  gallery: {
    list: () => adminFetch<AdminGalleryWork[]>(`${BASE}/gallery`),
    create: (data: Record<string, unknown>) =>
      adminMutation<AdminGalleryWork>("POST", `${BASE}/gallery`, data),
    createBatch: (items: Array<{ image: string; category: string }>) =>
      adminMutation<AdminGalleryWork[]>("POST", `${BASE}/gallery/batch`, { items }),
    update: (id: number, data: Record<string, unknown>) =>
      adminMutation<AdminGalleryWork>("PUT", `${BASE}/gallery/${id}`, data),
    delete: (id: number) =>
      adminMutation<void>("DELETE", `${BASE}/gallery/${id}`),
  },

  products: {
    list: () => adminFetch<AdminProduct[]>(`${BASE}/products`),
    create: (data: Record<string, unknown>) =>
      adminMutation<AdminProduct>("POST", `${BASE}/products`, data),
    update: (id: number, data: Record<string, unknown>) =>
      adminMutation<AdminProduct>("PUT", `${BASE}/products/${id}`, data),
    delete: (id: number) =>
      adminMutation<void>("DELETE", `${BASE}/products/${id}`),
  },

  billing: {
    analytics: (days?: number) => {
      const qs = days ? `?days=${days}` : "";
      return adminFetch<BillingAnalytics>(`${BASE}/billing/analytics${qs}`);
    },
    topProducts: (limit?: number) => {
      const qs = limit ? `?limit=${limit}` : "";
      return adminFetch<TopProduct[]>(`${BASE}/billing/top-products${qs}`);
    },
    ecliptic: () => adminFetch<EclipticDebtStatus>(`${BASE}/billing/ecliptic`),
    updateEclipticConfig: (data: { totalDebt: number; notes?: string }) =>
      adminMutation("PUT", `${BASE}/billing/ecliptic/config`, data),
    addPayment: (data: { amount: number; description: string; paidAt: string }) =>
      adminMutation("POST", `${BASE}/billing/ecliptic/payments`, data),
    deletePayment: (id: number) =>
      adminMutation("DELETE", `${BASE}/billing/ecliptic/payments/${id}`),
  },

  orders: {
    list: (params?: { status?: string; page?: number }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.page) qs.set("page", String(params.page));
      const query = qs.toString();
      return adminFetch<{
        orders: AdminOrder[];
        total: number;
        page: number;
        totalPages: number;
      }>(`${BASE}/orders${query ? `?${query}` : ""}`);
    },
    get: (id: number) => adminFetch<AdminOrder>(`${BASE}/orders/${id}`),
    approve: (id: number, adminNote?: string) =>
      adminMutation<AdminOrder>("PUT", `${BASE}/orders/${id}/approve`, { adminNote }),
    reject: (id: number, adminNote: string) =>
      adminMutation<AdminOrder>("PUT", `${BASE}/orders/${id}/reject`, { adminNote }),
    pendingCount: () =>
      adminFetch<{ count: number }>(`${BASE}/orders/pending-count`),
  },
};

export interface BillingAnalytics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  ordersByStatus: Record<string, number>;
  ordersByPaymentMethod: Record<string, number>;
}

export interface TopProduct {
  productId: number;
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface EclipticPayment {
  id: number;
  amount: number;
  description: string;
  paidAt: string;
  createdAt: string;
}

export interface EclipticDebtStatus {
  totalDebt: number;
  totalPaid: number;
  remaining: number;
  notes: string | null;
  payments: EclipticPayment[];
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerNote: string | null;
  items: Array<{
    productId: number;
    slug: string;
    name: string;
    priceUsd: number;
    quantity: number;
    size?: string;
    color?: string;
    image?: string;
    isReservation?: boolean;
  }>;
  subtotalUsd: number;
  shippingCrc: number;
  totalUsd: number;
  totalCrc: number;
  usdToCrcRate: number;
  shippingAddress: {
    provincia: string;
    canton: string;
    distrito: string;
    puntoReferencia?: string;
    pais?: string;
  } | null;
  shippingZone: string | null;
  shippingMethod: string | null;
  paymentMethod: string;
  paymentStatus: string;
  proofImageUrl: string | null;
  sinpeTransactionRef: string | null;
  adminNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
