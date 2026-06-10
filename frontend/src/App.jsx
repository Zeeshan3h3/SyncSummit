import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axiosInstance from './api/axios.js';
import useAuthStore from './store/authStore.js';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Events from './pages/Events.jsx';
import EventDetail from './pages/EventDetail.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import SuperAdminPanel from './pages/SuperAdminPanel.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import NotFound from './pages/NotFound.jsx';
import ContactUs from './pages/ContactUs.jsx';
import Speakers from './pages/Speakers.jsx';

// Root component that handles routing and the startup /me check
const App = () => {
  // Get actions from the Zustand store
  const { setAuth, logout, setLoading } = useAuthStore();

  // STARTUP /me CHECK
  // On app mount (useEffect with empty dependency array):
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[App] Starting /auth/me check...');
      // Set isLoading to true before the check starts
      setLoading(true);
      try {
        // Call GET /api/auth/me using the axios instance
        const response = await axiosInstance.get('/auth/me');
        console.log('[App] /auth/me success. Setting user state.');
        // If response is 200: Call setAuth with the returned user and token
        setAuth(response.data.user, response.data.token);
      } catch (error) {
        console.error('[App] /auth/me failed. Logging out user.', error.response?.data || error.message);
        // If response is 401 or any error: Call logout() to clear any stale state
        logout();
      } finally {
        // Finally (whether success or error): Call setLoading(false)
        console.log('[App] Auth check complete.');
        setLoading(false);
      }
    };

    checkAuth();
  }, [setAuth, logout, setLoading]);

  return (
    <BrowserRouter>
      {/* Add Toaster inside BrowserRouter but outside Routes */}
      <Toaster position="top-right" />
      
      <Routes>
        {/* Public routes (no protection needed) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/speakers" element={<Speakers />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected routes (any logged in user) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Admin routes (admin + superadmin only) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute roles={['admin', 'superadmin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* Superadmin routes (superadmin only) */}
        <Route 
          path="/superadmin" 
          element={
            <ProtectedRoute roles={['superadmin']}>
              <SuperAdminPanel />
            </ProtectedRoute>
          } 
        />

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
