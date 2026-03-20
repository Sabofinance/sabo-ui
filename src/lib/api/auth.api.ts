import api from "./axios";
import type {
  ApiResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  OtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
} from "../../modules/auth/types/type";

export const authApi = {
  loginUser: async (data: LoginRequest) => {
    const response = await api.post<ApiResponse<AuthTokens>>("/auth/login", data);
    return response.data;
  },

  registerUser: async (data: RegisterRequest) => {
    const response = await api.post<ApiResponse<User>>("/auth/register", data);
    return response.data;
  },

  verifyOtp: async (data: OtpRequest) => {
    const response = await api.post<ApiResponse<AuthTokens>>("/auth/verify-otp", data);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest) => {
    const response = await api.post<ApiResponse<null>>("/auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    const response = await api.post<ApiResponse<null>>("/auth/reset-password", data);
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<AuthTokens>>("/auth/refresh-token", { refreshToken });
    return response.data;
  },

  logoutUser: async () => {
    const response = await api.post<ApiResponse<null>>("/auth/logout");
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response.data;
  },
};

export default authApi;
