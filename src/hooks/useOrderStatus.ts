import { useState, useEffect, useCallback, useRef } from 'react';
import { getOrderStatus } from '@/lib/api';
import type { OrderStatus } from '@/types';

type PollState = 'pending' | 'delivered' | 'failed';

export function useOrderStatus(orderId: string | null) {
  const [status, setStatus] = useState<PollState>('pending');
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [copied, setCopied] = useState(false);
  const attemptsRef = useRef(0);

  const checkOrder = useCallback(async () => {
    if (!orderId) {
      setStatus('failed');
      return true;
    }
    try {
      const data = await getOrderStatus(orderId);
      setOrder(data);

      if (data.delivered && data.licenseKey) {
        setStatus('delivered');
        return true;
      }

      const failedStatuses = [
        'payment_rejected', 'payment_cancelled', 'payment_refunded',
        'payment_expired', 'payment_charged_back', 'payment_mismatch',
        'reservation_expired',
      ];
      if (failedStatuses.includes(data.status)) {
        setStatus('failed');
        return true;
      }

      setStatus('pending');
    } catch {
      setStatus('pending');
    }
    return false;
  }, [orderId]);

  const copyKey = useCallback(async () => {
    if (!order?.licenseKey) return;
    try {
      await navigator.clipboard.writeText(order.licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [order?.licenseKey]);

  useEffect(() => {
    if (!orderId) return;

    checkOrder();

    const poll = setInterval(async () => {
      attemptsRef.current += 1;
      const done = await checkOrder();
      if (done || attemptsRef.current >= 30) {
        clearInterval(poll);
      }
    }, 4000);

    return () => clearInterval(poll);
  }, [orderId, checkOrder]);

  return { status, order, copied, copyKey };
}
