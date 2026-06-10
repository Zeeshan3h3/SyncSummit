import axios from 'axios';
import useAuthStore from '../store/authStore.js';

// Create an Axios instance with base URL and mandatory credentials
const axiosInstance = axios.create({
  // Backend URL with /api prefix
  baseURL: 'http://localhost:3000/api',
  // withCredentials: true is MANDATORY for cross-origin requests
  // Without this, the browser strips the httpOnly cookie and auth will silently fail
  withCredentials: true,
});

// A request interceptor that adds the token from Zustand store
axiosInstance.interceptors.request.use(
  (config) => {
    // Read the token from Zustand store getState() outside of React
    const token = useAuthStore.getState().token;
    console.log(`[Axios Request] ${config.method.toUpperCase()} ${config.url}`, config.data || '');
    // If token exists, attach it as Authorization: Bearer <token>
    // This handles both cookie auth AND header auth simultaneously
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Return the config to continue the request
    return config;
  },
  (error) => {
    console.error(`[Axios Request Error]`, error);
    // Reject request errors immediately
    return Promise.reject(error);
  }
);

// A response interceptor to handle global errors and auto-logout
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[Axios Response] ${response.config.method.toUpperCase()} ${response.config.url} -> Status: ${response.status}`, response.data);
    // On successful response — passes it through untouched
    return response;
  },
  (error) => {
    console.error(`[Axios Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} -> Status: ${error.response?.status}`, error.response?.data || error.message);
    // On 401 error — calls logout() from Zustand store automatically
    // This means if token expires mid-session, user is silently logged out
    if (error.response && error.response.status === 401) {
      console.warn(`[Axios] 401 Unauthorized detected, calling logout()`);
      useAuthStore.getState().logout();
    }
    // On any other error — rejects the promise so calling code can catch it
    return Promise.reject(error);
  }
);

// Export the configured instance as default
export default axiosInstance;
