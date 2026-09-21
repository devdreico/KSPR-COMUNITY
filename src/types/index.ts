export interface StoreConfig {
  productName: string;
  price: number;
  currency: string;
  canPurchase: boolean;
  paymentConfigured: boolean;
  inventoryAvailable: boolean;
  priceUSD: number;
}

export interface CheckoutPayload {
  name: string;
  email: string;
}

export interface CheckoutResponse {
  orderId: string;
  checkoutUrl: string;
}

export interface OrderStatus {
  orderId: string;
  status: string;
  delivered: boolean;
  licenseKey?: string;
}
