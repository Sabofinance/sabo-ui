import type { AxiosRequestConfig, AxiosResponse } from "axios";
import api from "../lib/api/axios";

export type ApiErrorShape = {
  code: string;
  message: string;
  status?: number;
};

export class ApiError extends Error {
  code: string;
  status?: number;

  constructor({ code, message, status }: ApiErrorShape) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

type ApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  meta?: unknown;
  error: { code: string; message: string } | null;
};

function toApiError(response: AxiosResponse<ApiEnvelope<unknown>>): ApiError {
  const status = response.status;
  const body = response.data;
  const fallback: ApiErrorShape = {
    code: "REQUEST_FAILED",
    message: "Something went wrong. Please try again.",
    status,
  };

  if (!body || typeof body !== "object") return new ApiError(fallback);
  if (body.success === false && body.error) {
    return new ApiError({
      code: String(body.error.code || fallback.code),
      message: String(body.error.message || fallback.message),
      status,
    });
  }
  return new ApiError(fallback);
}

async function unwrap<T>(promise: Promise<AxiosResponse<ApiEnvelope<T>>>): Promise<T> {
  try {
    const res = await promise;
    if (res.data?.success) return res.data.data as T;
    throw toApiError(res as AxiosResponse<ApiEnvelope<unknown>>);
  } catch (err: any) {
    // Axios errors: normalize to ApiError using response envelope when present.
    const status = err?.response?.status as number | undefined;
    const data = err?.response?.data as ApiEnvelope<unknown> | undefined;
    if (data && data.success === false && data.error) {
      throw new ApiError({ code: data.error.code, message: data.error.message, status });
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError({
      code: "NETWORK_ERROR",
      message: "Network error. Please check your connection and try again.",
      status,
    });
  }
}

export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) => unwrap<T>(api.get(url, config)),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => unwrap<T>(api.post(url, body, config)),
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => unwrap<T>(api.put(url, body, config)),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => unwrap<T>(api.patch(url, body, config)),
  delete: <T>(url: string, config?: AxiosRequestConfig) => unwrap<T>(api.delete(url, config)),
};

