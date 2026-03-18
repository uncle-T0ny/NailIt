import { API_URL } from './config';

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res;
}

export async function fetchConnectionToken(): Promise<string> {
  const res = await request('/api/connection-token/', { method: 'POST' });
  const data = await res.json();
  return data.secret;
}

export async function createPaymentIntent(
  amount: number,
  description: string,
  category: string
) {
  const res = await request('/api/payment-intents/', {
    method: 'POST',
    body: JSON.stringify({ amount, currency: 'cad', description, category }),
  });
  return res.json();
}

export async function completeTransaction(
  paymentIntentId: string,
  cardLast4: string,
  cardBrand: string
) {
  const res = await request(`/api/transactions/${paymentIntentId}/complete/`, {
    method: 'PATCH',
    body: JSON.stringify({ card_last4: cardLast4, card_brand: cardBrand }),
  });
  return res.json();
}

export async function fetchTransactions(params?: {
  today?: boolean;
  category?: string;
}) {
  const query = new URLSearchParams();
  if (params?.today) query.set('today', 'true');
  if (params?.category) query.set('category', params.category);
  const qs = query.toString();
  const res = await request(`/api/transactions/${qs ? `?${qs}` : ''}`);
  return res.json();
}

export async function exportTransactionsCSV(category?: string): Promise<string> {
  const query = new URLSearchParams();
  if (category) query.set('category', category);
  const qs = query.toString();
  const res = await fetch(`${API_URL}/api/transactions/export/${qs ? `?${qs}` : ''}`);
  return res.text();
}

export async function sendReceipt(transactionId: string, phone: string) {
  const res = await request('/api/send-receipt/', {
    method: 'POST',
    body: JSON.stringify({ transaction_id: transactionId, phone }),
  });
  return res.json();
}

export async function fetchJobTemplates() {
  const res = await request('/api/job-templates/');
  return res.json();
}

export async function fetchRecentDescriptions(): Promise<string[]> {
  const res = await request('/api/transactions/recent-descriptions/');
  return res.json();
}

export async function syncOfflineTransactions(
  transactions: Array<{
    amount: number;
    description: string;
    category: string;
    stripe_payment_intent_id: string;
    card_last4: string;
    card_brand: string;
  }>
) {
  const res = await request('/api/offline-sync/', {
    method: 'POST',
    body: JSON.stringify({ transactions }),
  });
  return res.json();
}
