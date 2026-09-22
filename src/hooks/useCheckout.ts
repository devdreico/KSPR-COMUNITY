import { useState, useCallback } from 'react';
import { getMercadoPagoUrl, submitCheckoutForm } from '@/lib/api';

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = useCallback(async (name: string, email: string) => {
    setLoading(true);
    setError(null);
    try {
      await submitCheckoutForm({ name, email });
      window.location.assign(getMercadoPagoUrl());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al procesar el pago';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { checkout, loading, error, clearError };
}
