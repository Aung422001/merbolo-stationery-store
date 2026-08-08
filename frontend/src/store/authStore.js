import { create } from 'zustand';
import { loginApi, registerApi, getMeApi } from '../api/auth';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('merbolo_token') || null,
  isAuthenticated: false,
  isHydrated: false,

  login: async (credentials) => {
    try {
      const response = await loginApi(credentials);
      const { token, user } = response.data;
      localStorage.setItem('merbolo_token', token);
      set({ token, user, isAuthenticated: true });
      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed', errors: error.errors };
    }
  },

  register: async (data) => {
    try {
      const response = await registerApi(data);
      const { token, user } = response.data;
      localStorage.setItem('merbolo_token', token);
      set({ token, user, isAuthenticated: true });
      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed', errors: error.errors };
    }
  },

  logout: () => {
    localStorage.removeItem('merbolo_token');
    set({ token: null, user: null, isAuthenticated: false });
  },

  hydrate: async () => {
    const token = localStorage.getItem('merbolo_token');
    if (!token) {
      set({ isHydrated: true, isAuthenticated: false, user: null });
      return;
    }

    try {
      const response = await getMeApi();
      set({ user: response.data, isAuthenticated: true, isHydrated: true });
    } catch (error) {
      localStorage.removeItem('merbolo_token');
      set({ token: null, user: null, isAuthenticated: false, isHydrated: true });
    }
  }
}));
