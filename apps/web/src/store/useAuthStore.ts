import { create } from 'zustand';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  systemRole: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  checkAuth: async () => {
    try {
      // Assuming GET /auth/me exists, or we get the profile from another endpoint
      // Symbio Phase 10 implementation implies we might not have a /auth/me explicitly listed 
      // but usually there's a user profile fetch or we decode the JWT.
      // For now, let's try calling a profile endpoint or decoding token.
      // Since /auth/me wasn't explicitly mentioned, we might rely on localStorage token decode 
      // or a generic request to check session validity.
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token');
      
      // Basic jwt decode (in a real app, use jwt-decode)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      
      // Removed local expiration check to allow Axios interceptor to trigger refresh automatically
      set({
        user: {
          id: decoded.userId,
          email: decoded.email || '',
          name: decoded.name || '',
          systemRole: decoded.systemRole || 'USER'
        },
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore
    } finally {
      localStorage.removeItem('access_token');
      set({ user: null, isAuthenticated: false });
    }
  }
}));
