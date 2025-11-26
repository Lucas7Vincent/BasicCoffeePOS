import { create } from 'zustand';
import { AuthState, LoginRequest, User } from '@/types/auth';
import { apiClient } from '@/lib/api';
import { authUtils } from '@/lib/auth';
import { toast } from 'react-hot-toast';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (credentials: LoginRequest) => {
    try {
      const response = await apiClient.login(credentials);
      
      if (response && response.token && response.user) {
        const { token, user } = response;
        
        authUtils.setToken(token);
        authUtils.setUser(user);
        
        set({ user, token, isAuthenticated: true });
        toast.success(`Xin chào ${user.fullName}!`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Đăng nhập thất bại');
      throw error;
    }
  },

  logout: () => {
    authUtils.removeToken();
    authUtils.removeUser();
    set({ user: null, token: null, isAuthenticated: false });
    toast.success('Đã đăng xuất');
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },
}));

// Initialize auth state từ storage - chỉ chạy sau khi component mount
export const initializeAuth = () => {
  if (typeof window !== 'undefined') {
    try {
      const token = authUtils.getToken();
      const user = authUtils.getUser();
      
      if (token && user) {
        useAuthStore.setState({
          user,
          token,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Clear corrupted data
      authUtils.removeToken();
      authUtils.removeUser();
    }
  }
};