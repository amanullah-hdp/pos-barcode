import { humanizeError } from './humanizeError';

export type PaymentMethod = 'cash' | 'card' | 'wallet' | 'bank_transfer';
export type PaymentMethods = Record<PaymentMethod, boolean>;

export type Settings = {
  shop_name: string;
  address: string;
  phone: string;
  logo_url: string | null;
  receipt_footer: string;
  receipt_brand: string;
  till_no: string;
  receipt_terms: string;
  feedback_whatsapp: string;
  receipt_powered_by: string;
  payment_methods: PaymentMethods;
  db_path: string | null;
  day_closed_date: string | null;
};

export type Product = {
  id: number;
  sku: string;
  barcode: string | null;
  name: string;
  brand_id: number | null;
  category_id: number | null;
  brand_name: string | null;
  category_name: string | null;
  cost_cents: number;
  price_cents: number;
  stock_qty: number;
  low_stock_threshold: number;
};

export type Customer = { id: number; name: string; phone: string | null; email: string | null };

export type StaffMember = {
  id: number;
  staff_code: string;
  name: string;
  active: number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (res.status === 401 && !path.startsWith('/api/auth/')) {
    window.location.reload();
    throw new Error('Session expired');
  }
  if (!res.ok) throw new Error(humanizeError(data.error ?? `Request failed (${res.status})`));
  return data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => request<{ ok?: boolean }>(path, { method: 'DELETE' }),
};

export async function uploadLogo(file: File): Promise<Settings> {
  const fd = new FormData();
  fd.append('logo', file);
  const res = await fetch('/api/settings/logo', { method: 'POST', body: fd, credentials: 'include' });
  const data = (await res.json()) as Settings & { error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Upload failed');
  return data;
}

export type ReceiptPayload = {
  sale: {
    id: number;
    receipt_number: number;
    total_cents: number;
    shop_discount_cents?: number;
    payment_method: string;
    payment_reference: string | null;
    created_at: string;
    staff_code?: string | null;
    staff_name?: string | null;
  };
  lines: {
    id?: number;
    label: string;
    qty: number;
    unit_price_cents: number;
    line_total_cents: number;
    discount_cents?: number;
    is_open_price?: number | boolean;
    sku?: string | null;
  }[];
  settings: Settings;
  customer_name?: string | null;
};
