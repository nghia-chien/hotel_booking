export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin' | 'staff';
  avatar?: string;
  phone?: string;
  address?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}
