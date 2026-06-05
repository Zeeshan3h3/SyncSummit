import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Create a Zustand store with persist middleware
const useAuthStore = create(
  persist(
    (set) => ({
      // user: holds { id, name, email, role } or null
      // Exists to provide UI with user details and role for routing
      user: null,
      
      // token: holds the JWT string or null
      // Exists to pass to Axios request interceptor for header auth
      token: null,
      
      // isLoading: true while /me check is running on app load
      // Exists to prevent ProtectedRoute from kicking logged-in users on refresh
      isLoading: true,

      // setAuth: Sets both user and token in one call
      // Called after successful login or register
      setAuth: (user, token) => set({ user, token }),
      
      // logout: Sets user to null and token to null
      // Clears React state (Cookie clearing is done via POST /api/auth/logout)
      logout: () => set({ user: null, token: null }),
      
      // setLoading: Sets isLoading true or false
      // Used during the /me check on app startup
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      // name: 'syncsummit-auth' sets the key for localStorage
      name: 'syncsummit-auth',
      // Only persist 'user' and 'token' fields
      // Do NOT persist isLoading — it should always start fresh
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
