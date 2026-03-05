import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { adminApi } from "@/api/admin";

interface AdminAuthState {
  username: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AdminAuthContextValue extends AdminAuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const data = await adminApi.auth.me();
      setUsername(data.username);
    } catch {
      setUsername(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(
    async (user: string, password: string) => {
      const result = await adminApi.auth.login(user, password);
      if (result.success) {
        setUsername(result.username);
        return { success: true };
      }
      return { success: false, message: result.message };
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await adminApi.auth.logout();
    } finally {
      setUsername(null);
    }
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      username,
      isAuthenticated: !!username,
      isLoading,
      login,
      logout,
    }),
    [username, isLoading, login, logout]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
