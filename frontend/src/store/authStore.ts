import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiRequest } from "../api/client";
import type { User as AuthUser } from "../features/auth/types";

interface AuthResponse {
  success: boolean;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
}

export interface AuthStoreValue {
  user: AuthUser | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { fullName: string; phone?: string; address?: string }) => Promise<void>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  saveSession: (user: AuthUser, accessToken?: string, refreshToken?: string) => void;
}

import * as Sentry from "@sentry/react";

export const useAuthStore = create<AuthStoreValue>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false, // We rely on initial hydration and don't block
      setLoading: (loading) => set({ loading }),
      
      saveSession: (user, accessToken, refreshToken) => {
        set({ user });
        if (user) {
          Sentry.setUser({ id: user.id, email: user.email });
        }
        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      },

      login: async (email, password) => {
        const res = await apiRequest<AuthResponse>("/api/auth/login", "POST", { email, password });
        get().saveSession(res.data.user, res.data.accessToken, res.data.refreshToken);
        return res.data.user;
      },

      register: async (fullName, email, password) => {
        const res = await apiRequest<AuthResponse>("/api/auth/register", "POST", { fullName, email, password });
        get().saveSession(res.data.user, res.data.accessToken, res.data.refreshToken);
      },

      logout: () => {
        set({ user: null });
        Sentry.setUser(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      },

      updateProfile: async (data) => {
        const res = await apiRequest<{ success: boolean; data: { user: AuthUser } }>("/api/auth/profile", "PUT", data, { auth: true });
        get().saveSession(res.data.user);
      },

      changePassword: async (data) => {
        await apiRequest<void>("/api/auth/change-password", "PUT", data, { auth: true });
      },

      uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append("avatar", file);
        const res = await apiRequest<{ success: boolean; data: { avatarUrl: string } }>("/api/auth/avatar", "POST", formData, { auth: true });
        
        const currentUser = get().user;
        if (currentUser) {
          get().saveSession({ ...currentUser, avatar: res.data.avatarUrl });
        }
        return res.data.avatarUrl;
      }
    }),
    {
      name: "hotel_booking_auth", // matches the old STORAGE_KEY
      partialize: (state) => ({ user: state.user }), // only persist the user field
    }
  )
);
