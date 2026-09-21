import type { StoreConfig, CheckoutPayload, CheckoutResponse, OrderStatus } from '@/types';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options?.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error en la solicitud');
  }
  return data as T;
}

export async function getConfig(): Promise<StoreConfig> {
  return fetchJSON<StoreConfig>(`${API_BASE}/config`);
}

export async function createCheckout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  return fetchJSON<CheckoutResponse>(`${API_BASE}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getOrderStatus(orderId: string): Promise<OrderStatus> {
  return fetchJSON<OrderStatus>(`${API_BASE}/orders/${encodeURIComponent(orderId)}/status`);
}
