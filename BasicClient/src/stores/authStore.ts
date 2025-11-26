import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, LoginRequest, User } from '@/types/auth';
import { apiClient } from '@/lib/api';
import { authUtils } from '@/lib/auth';
import { toast } from 'react-hot-toast';

// Helper to get initial state from cookies/localStorage
const getInitialState = () => {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isAuthenticated: false };
  }
  
  const token = authUtils.getToken();
  const user = authUtils.getUser();
  
  if (token && user) {
    return { user, token, isAuthenticated: true };
  }
  
  return { user: null, token: null, isAuthenticated: false };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initialize from storage
      ...getInitialState(),

      login: async (credentials: LoginRequest) => {
        try {
          const response = await apiClient.login(credentials);
          const { token, user } = response;
          
          authUtils.setToken(token);
          authUtils.setUser(user);
          
          set({ user, token, isAuthenticated: true });
          toast.success(`Xin chào ${user.fullName}!`);
        } catch (error) {
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
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);