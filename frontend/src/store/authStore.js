import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../api/axios.js';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const response = await axiosInstance.get('/auth/me');
          set({ user: response.data.user || response.data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await axiosInstance.delete('/auth/logout');
        } catch (error) {
          console.error('[AuthStore] logout failed', error);
        } finally {
          set({ user: null, isAuthenticated: false });
        }
      },

      setAuth: (user) => set({ user, isAuthenticated: true }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'syncsummit-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
