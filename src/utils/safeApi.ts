import { type ChainKey, getChainByKey } from "./chains";

export type OwnerSafesResponse = {
  safes: string[];
};

export type MultisigTransaction = {
  safeTxHash: string;
  nonce: number;
  submissionDate?: string;
  proposer?: string | null;
  proposedByDelegate?: string | null;
  isExecuted?: boolean;
  executor?: string | null;
  executionDate?: string | null;
};

export type TransactionListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: MultisigTransaction[];
};

export type SafeInfo = {
  nonce: number | string;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const requestJson = async <T>(
  url: string,
  init?: RequestInit,
  retryOn429 = false
): Promise<T> => {
  let attempt = 0;
  while (true) {
    const response = await fetch(url, init);
    if (response.ok) {
      return response.json() as Promise<T>;
    }
    const message = await response.text();
    if (response.status === 429 && retryOn429) {
      attempt += 1;
      await delay(3000);
      continue;
    }
    throw new ApiError(message || `Request failed: ${response.status}`, response.status);
  }
};
const getApiBase = (chainKey: ChainKey) => {
  const chain = getChainByKey(chainKey);
  if (!chain) throw new Error("Unsupported chain");
  return chain.safeApiBaseUrl;
};

export const fetchOwnerSafes = async (
  chainKey: ChainKey,
  ownerAddress: string
) => {
  const base = getApiBase(chainKey);
  const url = `${base}/api/v1/owners/${ownerAddress}/safes/`;
  return requestJson<OwnerSafesResponse>(url, undefined, true);
};

export const fetchSafeInfo = async (chainKey: ChainKey, safeAddress: string) => {
  const base = getApiBase(chainKey);
  const url = `${base}/api/v1/safes/${safeAddress}/`;
  const data = await requestJson<SafeInfo>(url, undefined, true);
  return {
    ...data,
    nonce: Number(data.nonce),
  };
};

export const fetchQueuedTransactions = async (
  chainKey: ChainKey,
  safeAddress: string,
  limit = 20,
  offset = 0,
  minNonce?: number
) => {
  const base = getApiBase(chainKey);
  const primaryUrl = `${base}/api/v2/safes/${safeAddress}/multisig-transactions/?executed=false&queued=true&limit=${limit}&offset=${offset}`;

  try {
    return await requestJson<TransactionListResponse>(primaryUrl, undefined, true);
  } catch (error) {
    if (error instanceof ApiError && error.status !== 404) {
      throw error;
    }
    const fallbackUrl = `${base}/api/v2/safes/${safeAddress}/multisig-transactions/?limit=${limit}&offset=${offset}`;
    const data = await requestJson<TransactionListResponse>(fallbackUrl, undefined, true);
    const filtered = data.results.filter((tx) => {
      if (tx.isExecuted || tx.executor || tx.executionDate) return false;
      if (typeof minNonce === "number" && Number(tx.nonce) < minNonce) return false;
      return true;
    });
    return {
      ...data,
      results: filtered,
    };
  }
};

export const deleteQueuedTransaction = async (
  chainKey: ChainKey,
  safeTxHash: string,
  signature: string,
  totp: number
) => {
  const base = getApiBase(chainKey);
  const url = `${base}/api/v2/multisig-transactions/${safeTxHash}/`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signature, totp }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new ApiError(message || `Delete failed: ${response.status}`, response.status);
  }
};
