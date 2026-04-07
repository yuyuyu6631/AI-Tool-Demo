"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchBackendReadiness,
  fetchCurrentUser,
  logoutAuth,
  type AuthUser,
  type BackendAvailability,
} from "@/src/app/lib/auth-api";

type AuthStatus = "loading" | "authenticated" | "guest" | "error";

interface AuthContextValue {
  currentUser: AuthUser | null;
  status: AuthStatus;
  message: string | null;
  availability: BackendAvailability;
  setCurrentUser: (user: AuthUser | null) => void;
  refreshAvailability: () => Promise<BackendAvailability>;
  refreshSession: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_HINT_KEY = "xingdianping-auth-session";

function readSessionHint() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SESSION_HINT_KEY) === "1";
}

function writeSessionHint(hasSession: boolean) {
  if (typeof window === "undefined") return;

  if (hasSession) {
    window.localStorage.setItem(SESSION_HINT_KEY, "1");
    return;
  }

  window.localStorage.removeItem(SESSION_HINT_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("guest");
  const [message, setMessage] = useState<string | null>(null);
  const [availability, setAvailability] = useState<BackendAvailability>("ready");

  const refreshAvailability = useCallback(async () => {
    const readiness = await fetchBackendReadiness();
    setAvailability(readiness.state);
    setMessage(readiness.message);
    return readiness.state;
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const user = await fetchCurrentUser();
      writeSessionHint(Boolean(user));
      setCurrentUser(user);
      setStatus(user ? "authenticated" : "guest");
      setMessage(null);
      setAvailability("ready");
      return user;
    } catch {
      writeSessionHint(false);
      setCurrentUser(null);
      setStatus("error");
      await refreshAvailability();
      return null;
    }
  }, [refreshAvailability]);

  useEffect(() => {
    if (!readSessionHint()) {
      void refreshAvailability();
      return;
    }

    setStatus("loading");
    void refreshSession();
  }, [refreshAvailability, refreshSession]);

  const handleSetCurrentUser = useCallback((user: AuthUser | null) => {
    writeSessionHint(Boolean(user));
    setCurrentUser(user);
    setStatus(user ? "authenticated" : "guest");
    setMessage(null);
    setAvailability("ready");
  }, []);

  const logout = useCallback(async () => {
    await logoutAuth();
    writeSessionHint(false);
    setCurrentUser(null);
    setStatus("guest");
    setMessage(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      status,
      message,
      availability,
      setCurrentUser: handleSetCurrentUser,
      refreshAvailability,
      refreshSession,
      logout,
    }),
    [availability, currentUser, handleSetCurrentUser, logout, message, refreshAvailability, refreshSession, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
