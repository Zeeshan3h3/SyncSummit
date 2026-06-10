import axios from 'axios';
import useAuthStore from '../store/authStore.js';

// Create an Axios instance with base URL and mandatory credentials
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.setState({ user: null, isAuthenticated: false });
    } else if (error.response && error.response.status === 403) {
      window.location.href = '/unauthorized';
    }
    return Promise.reject(error);
  }
);

// Export the configured instance as default
export default axiosInstance;
