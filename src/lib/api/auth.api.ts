import api from "./axios";
import { normalizeError, normalizeSuccess, type ApiEnvelope } from "./response";
import type {
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  OtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
} from "../../modules/auth/types/type";

export const authApi = {
  loginUser: async (data: LoginRequest): Promise<ApiEnvelope<AuthTokens>> => {
    try {
      const response = await api.post<ApiEnvelope<{ tokens: AuthTokens }>>("/auth/login", data);
      return normalizeSuccess<AuthTokens>(response.data?.data?.tokens ?? null);
    } catch (error) {
      return normalizeError(error);
    }
  },

  registerUser: async (data: RegisterRequest): Promise<ApiEnvelope<User>> => {
    try {
      const response = await api.post<ApiEnvelope<User>>("/auth/register", data);
      return normalizeSuccess<User>(response.data?.data ?? null);
    } catch (error) {
      return normalizeError(error);
    }
  },

  verifyOtp: async (data: OtpRequest): Promise<ApiEnvelope<AuthTokens>> => {
    try {
      const response = await api.post<ApiEnvelope<{ tokens: AuthTokens }>>("/auth/verify-otp", data);
      return normalizeSuccess<AuthTokens>(response.data?.data?.tokens ?? null);
    } catch (error) {
      return normalizeError(error);
    }
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiEnvelope<null>> => {
    try {
      const response = await api.post<ApiEnvelope<null>>("/auth/forgot-password", data);
      return normalizeSuccess<null>(response.data?.data ?? null);
    } catch (error) {
      return normalizeError(error);
    }
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiEnvelope<null>> => {
    try {
      const response = await api.post<ApiEnvelope<null>>("/auth/reset-password", data);
      return normalizeSuccess<null>(response.data?.data ?? null);
    } catch (error) {
      return normalizeError(error);
    }
  },

  refreshToken: async (refreshToken: string): Promise<ApiEnvelope<AuthTokens>> => {
    try {
      const response = await api.post<ApiEnvelope<{ tokens: AuthTokens }>>("/auth/refresh-token", { refreshToken });
      return normalizeSuccess<AuthTokens>(response.data?.data?.tokens ?? null);
    } catch (error) {
      return normalizeError(error);
    }
  },

  logoutUser: async (): Promise<ApiEnvelope<null>> => {
    try {
      const response = await api.post<ApiEnvelope<null>>("/auth/logout");
      return normalizeSuccess<null>(response.data?.data ?? null);
    } catch (error) {
      return normalizeError(error);
    }
  },

  getCurrentUser: async (): Promise<ApiEnvelope<User>> => {
    try {
      const response = await api.get<ApiEnvelope<User>>("/auth/me");
      return normalizeSuccess<User>(response.data?.data ?? null);
    } catch (error) {
      return normalizeError(error);
    }
  },

  verifyEmail: async (token: string): Promise<ApiEnvelope<null>> => {
    try {
      const response = await api.get<ApiEnvelope<null>>("/auth/verify-email", {
        params: { token },
      });
      return normalizeSuccess<null>(response.data?.data ?? null);
    } catch (error) {
      return normalizeError(error);
    }
  },

  resendOtp: async (payload: { email: string }): Promise<ApiEnvelope<null>> => {
    try {
      const response = await api.post<ApiEnvelope<null>>("/auth/resend-otp", payload);
      return normalizeSuccess<null>(response.data?.data ?? null);
    } catch (error) {
      return normalizeError(error);
    }
  },

  changePassword: async (
    payload: { currentPassword: string; newPassword: string },
  ): Promise<ApiEnvelope<null>> => {
    try {
      const response = await api.patch<ApiEnvelope<null>>("/auth/change-password", payload);
      return normalizeSuccess<null>(response.data?.data ?? null);
    } catch (error) {
      return normalizeError(error);
    }
  },
};

export default authApi;
