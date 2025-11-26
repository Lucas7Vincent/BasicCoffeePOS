import Cookies from 'js-cookie';
import { User } from '@/types/auth';

const TOKEN_KEY = 'cafe_beer_token';
const USER_KEY = 'cafe_beer_user';

export const authUtils = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      Cookies.set(TOKEN_KEY, token, { expires: 7 });
    }
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return Cookies.get(TOKEN_KEY) || null;
  },

  removeToken: () => {
    if (typeof window !== 'undefined') {
      Cookies.remove(TOKEN_KEY);
    }
  },

  setUser: (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const userStr = localStorage.getItem(USER_KEY);
      
      // Kiểm tra nếu userStr là null, undefined, hoặc string "undefined"
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return null;
      }
      
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      // Xóa dữ liệu corrupt
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  removeUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY);
    }
  },

  isAuthenticated: (): boolean => {
    return !!authUtils.getToken();
  },
};