import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import authApi from '../lib/api/auth.api';
import type { User, LoginRequest, RegisterRequest, OtpRequest } from '../modules/auth/types/type';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  verifyOtp: (data: OtpRequest) => Promise<void>;
  resendOtp: (data: { email: string }) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  handleGoogleCallback: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
  logout: (opts?: { silent?: boolean }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('refreshToken'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!accessToken);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        const data = response.data as any;
        const nextUser = (data.user ? data.user : data) as User;
        
        setUser(nextUser);
        localStorage.setItem('user', JSON.stringify(nextUser));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('user');

        if (response.error?.status === 401 || response.error?.status === 403) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    } catch (err: any) {
      toast.error('Your session has expired. Please sign in again.');
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.loginUser(data);
      if (response.success) {
        sessionStorage.setItem('pendingEmail', data.email);
        toast.success('Login successful. Please check your email for an OTP.');
      } else {
        const code = String(response.error?.code || "");
        const errorMessage =
          code === "INVALID_CREDENTIALS"
            ? "Invalid email or password."
            : code === "ACCOUNT_SUSPENDED"
              ? "Your account is suspended. Please contact support."
              : response.error?.message || "Login failed. Please try again.";
        toast.error(errorMessage);
        const err: any = new Error(errorMessage);
        err.code = code || undefined;
        throw err;
      }
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred.";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (data: OtpRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.verifyOtp(data);
      if (response.success && response.data) {
        const { accessToken: newAccess, refreshToken: newRefresh } = response.data;
        
        localStorage.setItem('sessionType', 'user');
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('adminUser');

        localStorage.setItem('accessToken', newAccess);
        localStorage.setItem('refreshToken', newRefresh);
        setAccessToken(newAccess);
        setRefreshToken(newRefresh);
        
        sessionStorage.removeItem('pendingEmail');
        
        const userRes = await authApi.getCurrentUser();
        if (userRes.success && userRes.data) {
          const nextUser = userRes.data as User;
          setUser(nextUser);
          localStorage.setItem('user', JSON.stringify(nextUser));
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setAccessToken(null);
          setRefreshToken(null);
          throw new Error(userRes.error?.message || "Failed to fetch user profile after OTP verification.");
        }
      } else {
        throw new Error(response.error?.message || "OTP Verification failed");
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || "An error occurred";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (data: { email: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.resendOtp(data);
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to resend OTP");
      }
      toast.success("OTP resent. Please check your email.");
    } catch (err: any) {
      const msg = err?.message || "Failed to resend OTP.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== UPDATED GOOGLE CALLBACK ====================
  const handleGoogleCallback = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const newAccessToken = params.get('accessToken');
    const newRefreshToken = params.get('refreshToken');
    const errorParam = params.get('error');

    // Clear query params immediately for security
    window.history.replaceState({}, document.title, window.location.pathname);

    if (errorParam) {
      toast.error('Google sign in failed. Please try again.');
      return false;
    }

    if (!newAccessToken || !newRefreshToken) {
      toast.error('Invalid Google callback data. Please try again.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Save tokens
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('sessionType', 'user');

      // Clear any existing admin session
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminRefreshToken');
      localStorage.removeItem('adminUser');

      setAccessToken(newAccessToken);
      setRefreshToken(newRefreshToken);

      // Fetch user profile (consistent with verifyOtp)
      const userRes = await authApi.getCurrentUser();

      if (userRes.success && userRes.data) {
        const data = userRes.data as any;
        const nextUser = (data.user ? data.user : data) as User;

        setUser(nextUser);
        localStorage.setItem('user', JSON.stringify(nextUser));
        setIsAuthenticated(true);

        toast.success('Successfully signed in with Google!');
        return true;
      }

      throw new Error(userRes.error?.message || 'Failed to fetch user profile after Google login');
    } catch (err: any) {
      console.error('Google callback error:', err);

      const errorMsg = err.message || 'Failed to complete Google sign in. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);

      // Clean up on failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionType');

      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);

      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);
  // =================================================================

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.registerUser(data);
      if (response.success && response.data) {
        toast.success('Registration successful! Please log in to continue.');
      } else {
        const code = String(response.error?.code || "");
        const errorMessage = response.error?.message || "Registration failed. Please try again.";
        toast.error(errorMessage);
        const err: any = new Error(errorMessage);
        err.code = code || undefined;
        throw err;
      }
    } catch (err: any) {
      const msg = err.message || "An error occurred during registration.";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (opts?: { silent?: boolean }) => {
    try {
      await authApi.logoutUser();
    } catch (err) {
      if (!opts?.silent) toast.error('Failed to log out cleanly. Please try again.');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.setItem('sessionType', 'user');
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated,
        isLoading,
        error,
        login,
        verifyOtp,
        resendOtp,
        register,
        handleGoogleCallback,        // ← Added here
        refreshUser: fetchCurrentUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};