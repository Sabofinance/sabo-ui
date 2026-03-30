export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  phone?: string;
  phoneNumber?: string;
  kyc_status?: "unverified" | "pending" | "verified" | "rejected" | string;
  role: "user" | "admin" | "super_admin" | string;
  transaction_pin_set?: boolean;

  // Legacy/optional fields used across the current UI.
  firstName?: string;
  lastName?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password?: string;
}

export interface OtpRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  meta?: any;
  error: {
    code: string;
    message: string;
  } | null;
}
