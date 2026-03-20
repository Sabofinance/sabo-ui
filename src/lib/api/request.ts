import api from "./axios";
import { normalizeError, normalizeSuccess, type ApiEnvelope } from "./response";
import type { AxiosRequestConfig } from "axios";

type Query = Record<string, unknown>;
type Payload = Record<string, unknown> | FormData;

export const apiRequest = {
  async get<T = unknown>(url: string, params?: Query): Promise<ApiEnvelope<T>> {
    try {
      const response = await api.get<ApiEnvelope<T>>(url, { params });
      return normalizeSuccess<T>(response.data?.data ?? null);
    } catch (error) {
      return normalizeError<T>(error);
    }
  },

  async post<T = unknown>(url: string, payload?: Payload, config?: AxiosRequestConfig): Promise<ApiEnvelope<T>> {
    try {
      const response = await api.post<ApiEnvelope<T>>(url, payload as any, config);
      return normalizeSuccess<T>(response.data?.data ?? null);
    } catch (error) {
      return normalizeError<T>(error);
    }
  },

  async patch<T = unknown>(url: string, payload?: Payload, config?: AxiosRequestConfig): Promise<ApiEnvelope<T>> {
    try {
      const response = await api.patch<ApiEnvelope<T>>(url, payload as any, config);
      return normalizeSuccess<T>(response.data?.data ?? null);
    } catch (error) {
      return normalizeError<T>(error);
    }
  },

  async put<T = unknown>(url: string, payload?: Payload, config?: AxiosRequestConfig): Promise<ApiEnvelope<T>> {
    try {
      const response = await api.put<ApiEnvelope<T>>(url, payload as any, config);
      return normalizeSuccess<T>(response.data?.data ?? null);
    } catch (error) {
      return normalizeError<T>(error);
    }
  },

  async delete<T = unknown>(url: string): Promise<ApiEnvelope<T>> {
    try {
      const response = await api.delete<ApiEnvelope<T>>(url);
      return normalizeSuccess<T>(response.data?.data ?? null);
    } catch (error) {
      return normalizeError<T>(error);
    }
  },
};
