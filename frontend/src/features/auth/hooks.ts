import { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useErrorHandler } from '../../utils/errorHandling';

export const useAuthFeature = () => {
  const { 
    user: contextUser, 
    login: contextLogin, 
    register: contextRegister, 
    logout: contextLogout,
    updateProfile: contextUpdateProfile,
    changePassword: contextChangePassword,
    uploadAvatar: contextUploadAvatar
  } = useAuth();
  const { getErrorMessage } = useErrorHandler();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await contextLogin(email, password);
      toast.success('Đăng nhập thành công!');
      return data;
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contextLogin]);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await contextRegister(fullName, email, password);
      toast.success('Đăng ký tài khoản thành công!');
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contextRegister]);

  const logout = useCallback(() => {
    contextLogout();
    toast.success('Đã đăng xuất');
  }, [contextLogout]);

  const updateProfile = useCallback(async (data: { fullName: string; phone?: string; address?: string }) => {
    setLoading(true);
    setError(null);
    try {
      await contextUpdateProfile(data);
      toast.success('Cập nhật thông tin thành công!');
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contextUpdateProfile]);

  const changePassword = useCallback(async (data: { currentPassword: string; newPassword: string }) => {
    setLoading(true);
    setError(null);
    try {
      await contextChangePassword(data);
      toast.success('Đổi mật khẩu thành công!');
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contextChangePassword]);

  const uploadAvatar = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const url = await contextUploadAvatar(file);
      toast.success('Tải ảnh đại diện thành công!');
      return url;
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contextUploadAvatar]);

  return {
    user: contextUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    uploadAvatar
  };
};
