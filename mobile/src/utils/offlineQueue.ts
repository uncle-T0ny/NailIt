import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncOfflineTransactions } from './api';

const QUEUE_KEY = '@nailit_offline_queue';

export interface QueuedTransaction {
  amount: number;
  description: string;
  category: string;
  stripe_payment_intent_id: string;
  card_last4: string;
  card_brand: string;
  customer_phone: string;
  created_at: string;
}

export async function getQueue(): Promise<QueuedTransaction[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addToQueue(txn: QueuedTransaction): Promise<void> {
  const queue = await getQueue();
  queue.push(txn);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

export async function flushQueue(): Promise<{ synced: number; remaining: number }> {
  const queue = await getQueue();
  if (queue.length === 0) return { synced: 0, remaining: 0 };

  try {
    const result = await syncOfflineTransactions(queue);
    await clearQueue();
    return { synced: result.synced + result.skipped, remaining: 0 };
  } catch {
    // Keep queue for retry
    return { synced: 0, remaining: queue.length };
  }
}
