import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import { apiRequest } from "../api/client";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "admin" | "staff";
  avatar?: string;
  phone?: string;
  address?: string;
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
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { fullName: string; phone?: string; address?: string }) => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
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
    accessToken?: string,
    refreshToken?: string
  ) => {
    setUser(authUser);
    const stored = localStorage.getItem(STORAGE_KEY);
    const existing = stored ? JSON.parse(stored) : {};
    
    const newSession = {
      user: authUser,
      accessToken: accessToken || existing.accessToken || localStorage.getItem("accessToken"),
      refreshToken: refreshToken || existing.refreshToken || localStorage.getItem("refreshToken")
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
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
    return res.data.user;
  };

  const register = async (
    fullName: string,
    email: string,
    password: string
  ) => {
    const res = await apiRequest<AuthResponse>("/api/auth/register", "POST", {
      fullName,
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

  const updateProfile = async (data: { fullName: string; phone?: string; address?: string }) => {
    const res = await apiRequest<{ success: boolean; data: { user: AuthUser } }>(
      "/api/auth/profile",
      "PUT",
      data,
      { auth: true }
    );
    saveSession(res.data.user);
  };

  const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    await apiRequest<void>(
      "/api/auth/change-password",
      "PUT",
      data,
      { auth: true }
    );
  };

  const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await apiRequest<{ success: boolean; data: { avatarUrl: string } }>(
      "/api/auth/avatar",
      "POST",
      formData,
      { auth: true }
    );

    if (user) {
      saveSession({ ...user, avatar: res.data.avatarUrl });
    }
    return res.data.avatarUrl;
  };

  const value: AuthContextValue = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    uploadAvatar
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

