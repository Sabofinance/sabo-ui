import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { adminAuthApi } from "../lib/api/admin-auth.api";
import type { AuthTokens } from "../modules/auth/types/type";
import { toast } from "react-toastify";

export type AdminRole = "admin" | "super_admin";

export type AdminUser = {
  id?: string;
  email?: string;
  name?: string;
  role: AdminRole;
};

interface AdminAuthContextValue {
  adminUser: AdminUser | null;
  adminAccessToken: string | null;
  adminRefreshToken: string | null;
  isAdminAuthenticated: boolean;
  isAdminLoading: boolean;
  adminLogin: (data: { email: string; password: string }) => Promise<void>;
  adminVerifyOtp: (data: { email: string; otp: string }) => Promise<void>;
  adminLogout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

const ADMIN_ACCESS_KEY = "adminAccessToken";
const ADMIN_REFRESH_KEY = "adminRefreshToken";
const ADMIN_USER_KEY = "adminUser";
const SESSION_TYPE_KEY = "sessionType"; // 'user' | 'admin'

const decodeJwtPayload = (token: string): any => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const deriveAdminUserFromToken = (accessToken: string): AdminUser | null => {
  const payload = decodeJwtPayload(accessToken);
  const roleRaw = String(payload?.role ?? payload?.userRole ?? payload?.roles?.[0] ?? "").toLowerCase();
  const role = roleRaw === "super_admin" ? "super_admin" : roleRaw === "admin" ? "admin" : "";
  if (!role) return null;

  return {
    id: String(payload?.id ?? payload?.sub ?? ""),
    email: String(payload?.email ?? payload?.userEmail ?? ""),
    name: String(payload?.name ?? payload?.fullName ?? ""),
    role,
  };
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const raw = localStorage.getItem(ADMIN_USER_KEY);
      return raw ? (JSON.parse(raw) as AdminUser) : null;
    } catch {
      return null;
    }
  });
  const [adminAccessToken, setAdminAccessToken] = useState<string | null>(() => localStorage.getItem(ADMIN_ACCESS_KEY));
  const [adminRefreshToken, setAdminRefreshToken] = useState<string | null>(() => localStorage.getItem(ADMIN_REFRESH_KEY));
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  const isAdminAuthenticated = Boolean(adminAccessToken && (adminUser?.role === "admin" || adminUser?.role === "super_admin"));

  useEffect(() => {
    // Ensure axios picks the correct token scope on initial load.
    const userToken = localStorage.getItem("accessToken");
    if (userToken) {
      localStorage.setItem(SESSION_TYPE_KEY, "user");
      setIsAdminLoading(false);
      return;
    }
    if (adminAccessToken) {
      localStorage.setItem(SESSION_TYPE_KEY, "admin");
      // If we have a token but missing/invalid decoded role, force-clear.
      const derived = deriveAdminUserFromToken(adminAccessToken);
      if (!derived) {
        localStorage.removeItem(ADMIN_ACCESS_KEY);
        localStorage.removeItem(ADMIN_REFRESH_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
        setAdminAccessToken(null);
        setAdminRefreshToken(null);
        setAdminUser(null);
      } else {
        setAdminUser(derived);
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(derived));
      }
    }
    setIsAdminLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAdminSession = useCallback(async () => {
    localStorage.removeItem(ADMIN_ACCESS_KEY);
    localStorage.removeItem(ADMIN_REFRESH_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    setAdminAccessToken(null);
    setAdminRefreshToken(null);
    setAdminUser(null);
    // Default back to user scope to avoid accidental admin token attachment.
    localStorage.setItem(SESSION_TYPE_KEY, "user");
  }, []);

  const adminLogin = useCallback(async (data: { email: string; password: string }) => {
    setIsAdminLoading(true);
    try {
      const res = await adminAuthApi.login(data);
      if (!res.success) throw new Error(res.error?.message || "Admin login failed");
      sessionStorage.setItem("adminPendingEmail", data.email);
    } finally {
      setIsAdminLoading(false);
    }
  }, []);

  const adminVerifyOtp = useCallback(async (data: { email: string; otp: string }) => {
    setIsAdminLoading(true);
    try {
      const res = await adminAuthApi.verifyOtp(data);
      if (!res.success || !res.data) throw new Error(res.error?.message || "Admin OTP verification failed");

      // Accept a few possible shapes from backend.
      const payload: any = res.data;
      const tokens: Partial<AuthTokens> & Record<string, unknown> = payload.tokens ?? payload;
      const accessToken = String(tokens.accessToken ?? (tokens as any).access_token ?? "");
      const refreshToken = String(tokens.refreshToken ?? (tokens as any).refresh_token ?? "");

      if (!accessToken || !refreshToken) throw new Error("Admin tokens missing from verify-otp response");

      const derivedUser = deriveAdminUserFromToken(accessToken);
      if (!derivedUser) throw new Error("Admin role is invalid in token payload");

      // Scope everything to admin session.
      localStorage.setItem(SESSION_TYPE_KEY, "admin");
      localStorage.setItem(ADMIN_ACCESS_KEY, accessToken);
      localStorage.setItem(ADMIN_REFRESH_KEY, refreshToken);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(derivedUser));

      // Clear user session to avoid confusion.
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      setAdminAccessToken(accessToken);
      setAdminRefreshToken(refreshToken);
      setAdminUser(derivedUser);
    } catch (e: any) {
      toast.error(e?.message || "Admin sign-in failed");
      await clearAdminSession();
      throw e;
    } finally {
      setIsAdminLoading(false);
    }
  }, [clearAdminSession, toast]);

  const adminLogout = useCallback(async () => {
    await clearAdminSession();
  }, [clearAdminSession]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      adminUser,
      adminAccessToken,
      adminRefreshToken,
      isAdminAuthenticated,
      isAdminLoading,
      adminLogin,
      adminVerifyOtp,
      adminLogout,
    }),
    [adminUser, adminAccessToken, adminRefreshToken, isAdminAuthenticated, isAdminLoading, adminLogin, adminVerifyOtp, adminLogout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

