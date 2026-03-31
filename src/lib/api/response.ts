import type { AxiosError } from "axios";

export interface ApiError {
  status?: number;
  message: string;
  code?: string;
  details?: any;
  [key: string]: any;
}

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}

export const extractArray = (value: unknown): any[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  const obj = value as Record<string, unknown>;
  const keys = ['wallets', 'entries', 'items', 'transactions', 'data', 'users', 'results', 'rows', 'records', 'list', 'submissions', 'deposits', 'withdrawals', 'conversions', 'disputes', 'bids', 'beneficiaries','sabits'];
  for (const key of keys) {
    if (Array.isArray(obj[key])) return obj[key] as any[];
  }
  return [];
};
export const normalizeSuccess = <T>(data: T | null): ApiEnvelope<T> => ({
  success: true,
  data,
  error: null,
});

export const normalizeError = <T = unknown>(error: unknown): ApiEnvelope<T> => {
  const axiosError = error as AxiosError;
  const status = axiosError?.response?.status;
  const responseData = axiosError?.response?.data as any;
  const rawError = responseData?.error ?? responseData;

  const message =
    (rawError && typeof rawError === "object" && typeof rawError.message === "string" ? rawError.message : undefined) ||
    (typeof responseData?.message === "string" ? responseData.message : undefined) ||
    (typeof rawError === "string" ? rawError : undefined) ||
    axiosError?.message ||
    "Request failed";

  if (rawError && typeof rawError === "object") {
    return {
      success: false,
      data: null,
      // Ensure callers can reliably read `response.error.message` and optionally `response.error.status`.
      error: {
        status,
        ...rawError,
        message,
      },
    };
  }

  return {
    success: false,
    data: null,
    error: {
      status,
      message,
      details: rawError ?? null,
    },
  };
};
