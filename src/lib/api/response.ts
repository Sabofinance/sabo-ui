import type { AxiosError } from "axios";

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  data: T | null;
  error: any;
}

export const normalizeSuccess = <T>(data: T | null): ApiEnvelope<T> => ({
  success: true,
  data,
  error: null,
});

export const normalizeError = <T = unknown>(error: unknown): ApiEnvelope<T> => {
  const axiosError = error as AxiosError;
  const responseData = axiosError?.response?.data as
    | { error?: unknown; message?: string }
    | undefined;

  return {
    success: false,
    data: null,
    error: responseData?.error ?? responseData ?? { message: axiosError?.message ?? "Request failed" },
  };
};
