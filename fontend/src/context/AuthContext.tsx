import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from "react";
import { apiRequest } from "../api/client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "staff";
}

interface AuthResponse {
  success: boolean;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "hotel_booking_auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          user: AuthUser;
          accessToken: string;
          refreshToken: string;
        };
        setUser(parsed.user);
        localStorage.setItem("accessToken", parsed.accessToken);
        localStorage.setItem("refreshToken", parsed.refreshToken);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const saveSession = (
    authUser: AuthUser,
    accessToken: string,
    refreshToken: string
  ) => {
    setUser(authUser);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: authUser, accessToken, refreshToken })
    );
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  const login = async (email: string, password: string) => {
    const res = await apiRequest<AuthResponse>("/api/auth/login", "POST", {
      email,
      password
    });
    saveSession(
      res.data.user,
      res.data.accessToken,
      res.data.refreshToken
    );
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    const res = await apiRequest<AuthResponse>("/api/auth/register", "POST", {
      name,
      email,
      password
    });
    saveSession(
      res.data.user,
      res.data.accessToken,
      res.data.refreshToken
    );
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const value: AuthContextValue = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

