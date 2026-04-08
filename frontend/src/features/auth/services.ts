import { apiRequest } from '../../api/client';
import type { User } from './types';

interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse['data']> => {
    const res = await apiRequest<AuthResponse>('/api/auth/login', 'POST', { email, password });
    return res.data;
  },

  register: async (fullName: string, email: string, password: string): Promise<AuthResponse['data']> => {
    const res = await apiRequest<AuthResponse>('/api/auth/register', 'POST', { fullName, email, password });
    return res.data;
  },

  updateProfile: async (data: { fullName: string; phone?: string; address?: string }): Promise<User> => {
    const res = await apiRequest<{ success: boolean; data: { user: User } }>(
      '/api/auth/profile',
      'PUT',
      data,
      { auth: true }
    );
    return res.data.user;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await apiRequest<void>('/api/auth/change-password', 'PUT', data, { auth: true });
  },

  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await apiRequest<{ success: boolean; data: { avatarUrl: string } }>(
      '/api/auth/avatar',
      'POST',
      formData,
      { auth: true }
    );
    return res.data.avatarUrl;
  },

  forgotPassword: async (email: string): Promise<any> => {
    return await apiRequest('/api/auth/forgot-password', 'POST', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<any> => {
    return await apiRequest('/api/auth/reset-password', 'POST', { token, newPassword });
  }
};
