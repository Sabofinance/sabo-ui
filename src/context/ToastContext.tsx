import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export type ToastItem = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  createdAt: number;
  ttlMs: number;
};

interface ToastContextValue {
  toasts: ToastItem[];
  toast: (type: ToastType, message: string, title?: string, ttlMs?: number) => void;
  success: (message: string, title?: string, ttlMs?: number) => void;
  error: (message: string, title?: string, ttlMs?: number) => void;
  info: (message: string, title?: string, ttlMs?: number) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (type: ToastType, message: string, title?: string, ttlMs = 5000) => {
      const id = uid();
      const item: ToastItem = { id, type, title, message, createdAt: Date.now(), ttlMs };
      setToasts((prev) => [item, ...prev].slice(0, 5));

      window.setTimeout(() => remove(id), ttlMs);
    },
    [remove],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      toast,
      success: (message, title, ttlMs) => toast('success', message, title, ttlMs),
      error: (message, title, ttlMs) => toast('error', message, title, ttlMs),
      info: (message, title, ttlMs) => toast('info', message, title, ttlMs),
      remove,
    }),
    [remove, toasts, toast],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

