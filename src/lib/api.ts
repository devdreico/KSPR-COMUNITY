import type { StoreConfig, CheckoutPayload, OrderStatus } from '@/types';

const API_BASE = '/api';
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mvkgojge';
const MERCADO_PAGO_URL = 'https://mpago.li/2uXMyPo';

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

export async function submitCheckoutForm(payload: CheckoutPayload): Promise<void> {
  const form = new URLSearchParams({
    name: payload.name,
    email: payload.email,
    subject: 'Nuevo intento de compra — KSPR CLI',
    message: `Nombre y apellido: ${payload.name}\nCorreo electrónico: ${payload.email}`,
  });
  await fetchJSON<unknown>(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: form,
  });
}

export function getMercadoPagoUrl(): string {
  return MERCADO_PAGO_URL;
}

export async function getOrderStatus(orderId: string): Promise<OrderStatus> {
  return fetchJSON<OrderStatus>(`${API_BASE}/orders/${encodeURIComponent(orderId)}/status`);
}
