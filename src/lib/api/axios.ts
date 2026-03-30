import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import type { ApiResponse, AuthTokens } from "../../modules/auth/types/type";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL)?.replace(/\/$/, "") ||
  "https://sf-api-xzlj.onrender.com";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Request interceptor to attach accessToken
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const sessionType = localStorage.getItem("sessionType") || "user";
    const tokenKey = sessionType === "admin" ? "adminAccessToken" : "accessToken";
    const accessToken = localStorage.getItem(tokenKey);

    if (accessToken && config.headers) {
      if (typeof config.headers.set === "function") {
        config.headers.set("Authorization", `Bearer ${accessToken}`);
      } else {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Flag to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: any[] = [];
const MAX_REQUEST_RETRIES = 1;

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for token refreshing
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const sessionType = localStorage.getItem("sessionType") || "user";
      // Avoid guessing admin refresh endpoints; only refresh for user scope.
      if (sessionType === "admin") {
        localStorage.removeItem("adminAccessToken");
        localStorage.removeItem("adminRefreshToken");
        localStorage.removeItem("adminUser");
        // Hard redirect so we don't depend on hooks.
        if (typeof window !== "undefined" && window.location.pathname !== "/admin/login") {
          window.location.assign("/admin/login");
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              if (typeof originalRequest.headers.set === "function") {
                originalRequest.headers.set("Authorization", `Bearer ${token}`);
              } else {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<ApiResponse<{ tokens: AuthTokens }>>(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken },
        );

        if (response.data.success && response.data.data?.tokens) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            response.data.data.tokens;

          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          if (originalRequest.headers) {
            if (typeof originalRequest.headers.set === "function") {
              originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
            } else {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
          }

          processQueue(null, newAccessToken);
          return api(originalRequest);
        }

        throw new Error("Refresh token failed");
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Retry once for transient failures (network/timeout/5xx), excluding 401.
    if (originalRequest && error.response?.status !== 401) {
      const status = error.response?.status ?? 0;
      const isRetryableStatus = status >= 500 || status === 0;
      const isRetryableCode = error.code === "ECONNABORTED" || !error.response;
      const retryCount = originalRequest._retryCount ?? 0;

      if ((isRetryableStatus || isRetryableCode) && retryCount < MAX_REQUEST_RETRIES) {
        originalRequest._retryCount = retryCount + 1;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
