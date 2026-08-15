import { config } from 'dotenv';

config();

const BASE_URL = process.env.PAYPACK_BASE_URL || 'https://payments.paypack.rw/api';
const CLIENT_ID = process.env.PAYPACK_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPACK_CLIENT_SECRET;
const WEBHOOK_MODE = process.env.PAYPACK_WEBHOOK_MODE || 'development';

interface PaypackAuthResponse {
  access: string;
  refresh: string;
  expires: string;
}

export interface PaypackTransaction {
  ref: string;
  status: string;
  amount: number;
  kind: string;
  created_at: string;
}

let cachedAccess: string | null = null;
let cachedRefresh: string | null = null;
let cachedExpiresAt = 0;

const authorize = async (): Promise<void> => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Paypack credentials are not configured');
  }

  const response = await fetch(`${BASE_URL}/auth/agents/authorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET }),
  });

  if (!response.ok) {
    throw new Error(`Paypack authorization failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as PaypackAuthResponse;
  cachedAccess = data.access;
  cachedRefresh = data.refresh;
  cachedExpiresAt = Date.parse(data.expires) || Date.now() + 14 * 60 * 1000;
};

const refresh = async (): Promise<void> => {
  if (!cachedRefresh) return authorize();

  const response = await fetch(`${BASE_URL}/auth/agents/refresh/${cachedRefresh}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    return authorize();
  }

  const data = (await response.json()) as PaypackAuthResponse;
  cachedAccess = data.access;
  cachedRefresh = data.refresh;
  cachedExpiresAt = Date.parse(data.expires) || Date.now() + 14 * 60 * 1000;
};

const getAccessToken = async (): Promise<string> => {
  const bufferMs = 30 * 1000;
  if (!cachedAccess || Date.now() + bufferMs >= cachedExpiresAt) {
    if (cachedRefresh) await refresh();
    else await authorize();
  }
  if (!cachedAccess) throw new Error('Unable to obtain Paypack access token');
  return cachedAccess;
};

const authorizedFetch = async (path: string, init: RequestInit = {}): Promise<Response> => {
  const token = await getAccessToken();
  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Webhook-Mode': WEBHOOK_MODE,
      ...(init.headers || {}),
    },
  });
};

export const initiateCashin = async (
  amount: number,
  phoneNumber: string,
  idempotencyKey: string
): Promise<PaypackTransaction> => {
  const response = await authorizedFetch('/transactions/cashin', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({ amount, number: phoneNumber }),
  });

  if (!response.ok) {
    throw new Error(`Paypack cashin failed: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as PaypackTransaction;
};

export const findTransaction = async (ref: string): Promise<PaypackTransaction> => {
  const response = await authorizedFetch(`/transactions/find/${ref}`, { method: 'GET' });

  if (!response.ok) {
    throw new Error(`Paypack transaction lookup failed: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as PaypackTransaction;
};
