import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mechanicAPI } from '@/lib/api/mechanic';
import { scheduleNewOrderNotification } from '@/services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEEN_ORDERS_KEY = 'mechanic_seen_order_ids';

const POLL_INTERVAL = 120 * 1000; // 2 minutes (Fallback for WebSocket)

/**
 * Polls the repair requests endpoint every 30 seconds.
 * When a new 'pending' order is found that has not been seen before,
 * a local popup notification is fired.
 *
 * Only active when the mechanic is logged in (enabled = true).
 */
export function useMechanicOrderNotifications(
  enabled: boolean = true, 
  onNewOrder?: (order: any) => void
) {
  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  // Load previously seen IDs from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(SEEN_ORDERS_KEY).then((stored) => {
      if (stored) {
        try {
          const ids: string[] = JSON.parse(stored);
          seenOrderIdsRef.current = new Set(ids);
        } catch (_) {}
      }
    });
  }, []);

  const { data } = useQuery({
    queryKey: ['mechanic', 'repair-requests', 'polling'],
    queryFn: () => mechanicAPI.getRepairRequests('pending'),
    enabled,
    refetchInterval: false, // WebSocket handles real-time delivery; polling disabled
    staleTime: 0,
    gcTime: POLL_INTERVAL,
    retry: 1,
    refetchOnMount: true,
    networkMode: 'online',
  });

  useEffect(() => {
    if (!data) return;

    // Extract the list — handle both array and paginated response shapes
    const requests: any[] = Array.isArray(data)
      ? data
      : (data as any)?.data?.results ?? (data as any)?.results ?? [];

    if (isInitialLoadRef.current) {
      // On first load, just mark all existing orders as seen — don't notify
      requests.forEach((req: any) => {
        seenOrderIdsRef.current.add(req.id);
      });
      persistSeenIds(seenOrderIdsRef.current);
      isInitialLoadRef.current = false;
      return;
    }

    // On subsequent polls, find any order that is new and pending
    const newOrders = requests.filter(
      (req: any) =>
        req.status?.toLowerCase() === 'pending' &&
        !seenOrderIdsRef.current.has(req.id)
    );

    newOrders.forEach(async (order: any) => {
      seenOrderIdsRef.current.add(order.id);

      // Trigger UI callback
      if (onNewOrder) onNewOrder(order);

      await scheduleNewOrderNotification({
        customerName: order.customer
          ? `${order.customer.first_name ?? ''} ${order.customer.last_name ?? ''}`.trim()
          : undefined,
        vehicleMake: order.vehicle_make,
        vehicleModel: order.vehicle_model,
        serviceType: order.service_type,
      });
    });

    if (newOrders.length > 0) {
      persistSeenIds(seenOrderIdsRef.current);
    }
  }, [data]);
}

async function persistSeenIds(ids: Set<string>) {
  try {
    await AsyncStorage.setItem(SEEN_ORDERS_KEY, JSON.stringify([...ids]));
  } catch (_) {}
}
