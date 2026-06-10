import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axiosInstance from './api/axios.js';
import useAuthStore from './store/authStore.js';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));
const ProductDetail = lazy(() => import('./pages/ProductDetail.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Events = lazy(() => import('./pages/Events.jsx'));
const EventDetail = lazy(() => import('./pages/EventDetail.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const SuperAdminPanel = lazy(() => import('./pages/SuperAdminPanel.jsx'));
const Unauthorized = lazy(() => import('./pages/Unauthorized.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const ContactUs = lazy(() => import('./pages/ContactUs.jsx'));
const Speakers = lazy(() => import('./pages/Speakers.jsx'));

// Root component that handles routing and the startup /me check
const App = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      {/* Add Toaster inside BrowserRouter but outside Routes */}
      <Toaster position="top-right" />
      
      <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'DM Sans' }}>Loading...</div>}>
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
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
