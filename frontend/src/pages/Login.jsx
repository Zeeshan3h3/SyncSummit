import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';
import useAuthStore from '../store/authStore';
import { MetalButton } from '../components/ui/Buttons';

const Login = () => {
  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();
  
  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setShake(s => s + 1);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      // update zustand store
      setAuth(response.data.user, response.data.token);
      
      toast.success('Signed in successfully', {
        icon: null,
        style: { borderLeft: '4px solid var(--success)', borderRadius: 'var(--radius-sm)' }
      });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setShake(s => s + 1);
      if (error.response && error.response.status === 401) {
        setErrors({ password: 'Invalid email or password' });
        toast.error('Authentication failed', {
          icon: null,
          style: { borderLeft: '4px solid var(--error)', borderRadius: 'var(--radius-sm)' }
        });
      } else {
        toast.error('Connection error. Try again.', {
          icon: null,
          style: { borderLeft: '4px solid var(--error)', borderRadius: 'var(--radius-sm)' }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* LEFT COLUMN (Desktop only) */}
      <div className="desktop-only" style={{ 
        flex: 1, 
        background: 'linear-gradient(to right, rgba(6,4,10,0.8) 0%, rgba(6,4,10,0.4) 100%), url("/images/gemini/auth_bg_1781109258543.png") center/cover no-repeat', 
        borderRight: '1px solid var(--border)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(32px, 5vw, 80px)'
      }}>
        {/* Logo */}
        <div style={{ position: 'absolute', top: '32px', left: '32px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/MainLogoHorizontalBgRemoved.png" alt="SyncSummit" style={{ height: '32px', transform: 'scale(3)', transformOrigin: 'left center' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            <div style={{ display: 'none', letterSpacing: '-0.04em' }}>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '24px', color: 'var(--violet)' }}>SYNC</span>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '24px', color: 'var(--text-primary)' }}>SUMMIT</span>
            </div>
          </Link>
        </div>

        {/* Editorial Content */}
        <motion.div 
          initial={{ opacity: 0, x: -16 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.4 }}
        >
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--orchid)', textTransform: 'uppercase', marginBottom: '24px' }}>
            SyncSummit 2025
          </div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '32px', color: 'var(--text-primary)', lineHeight: 1.2, maxWidth: '380px', margin: 0 }}>
            "The best time to start was yesterday. The next best time is now."
          </h2>
          <div style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)', marginTop: '16px' }}>
            — E-Cell, JU
          </div>

          <div style={{ marginTop: '48px' }}>
            <div style={{ width: '32px', height: '1px', background: 'var(--border-mid)', marginBottom: '16px' }} />
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-muted)' }}>
              NexusHack 2025 · Nov 15 — 17 · Salt Lake Campus
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '32px', left: '32px', fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--text-muted)' }}>
          © 2025 JU E-Cell. Institution's Innovation Council
        </div>
      </div>

      {/* RIGHT COLUMN (Form area) */}
      <div style={{ 
        flex: 1, 
        background: 'var(--bg)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 'clamp(32px, 5vw, 80px)'
      }}>
        
        {/* Mobile Logo */}
        <div className="mobile-only" style={{ position: 'absolute', top: '32px', left: '32px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/MainLogoHorizontalBgRemoved.png" alt="SyncSummit" style={{ height: '32px', transform: 'scale(1.5)', transformOrigin: 'left center' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            <div style={{ display: 'none', letterSpacing: '-0.04em' }}>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '20px', color: 'var(--violet)' }}>SYNC</span>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)' }}>SUMMIT</span>
            </div>
          </Link>
        </div>

        {/* Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <motion.div
            animate={shake ? { x: [0, 6, -6, 4, -4, 0] } : {}}
            transition={{ duration: 0.4 }}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-mid)',
              borderRadius: '24px', // var(--radius-xl)
              padding: '40px 36px',
              width: '100%'
            }}
          >
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '28px', color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                Sign in
              </h1>
              <p style={{ fontFamily: 'DM Sans', fontWeight: 400, fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px', margin: 0 }}>
                Continue to your SyncSummit account
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Email Field */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="email" style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  EMAIL
                </label>
                <input 
                  id="email"
                  type="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: `1px solid ${errors.email ? 'var(--error)' : 'var(--border-mid)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '11px 14px',
                    fontFamily: 'DM Sans',
                    fontSize: '15px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxShadow: errors.email ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                    transition: 'all 0.15s'
                  }}
                  onFocus={(e) => {
                    if (!errors.email) {
                      e.target.style.borderColor = 'var(--violet)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(148, 0, 211, 0.15)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.email) {
                      e.target.style.borderColor = 'var(--border-mid)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
                <AnimatePresence>
                  {errors.email && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div role="alert" aria-live="polite" style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--error)', marginTop: '4px' }}>
                        {errors.email}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Field */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="password" style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  PASSWORD
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-elevated)',
                      border: `1px solid ${errors.password ? 'var(--error)' : 'var(--border-mid)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: '11px 40px 11px 14px', // extra padding on right for icon
                      fontFamily: 'DM Sans',
                      fontSize: '15px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      boxShadow: errors.password ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                      transition: 'all 0.15s'
                    }}
                    onFocus={(e) => {
                      if (!errors.password) {
                        e.target.style.borderColor = 'var(--violet)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(148, 0, 211, 0.15)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!errors.password) {
                        e.target.style.borderColor = 'var(--border-mid)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '10px',
                      background: 'transparent', border: 'none',
                      width: '32px', height: '32px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--text-muted)'
                    }}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div role="alert" aria-live="polite" style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--error)', marginTop: '4px' }}>
                        {errors.password}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <Link to="/forgot-password" style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--orchid)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <div style={{ marginTop: '8px' }}>
                <MetalButton 
                  type="submit" 
                  variant="primary" 
                  style={{ width: '100%', pointerEvents: isLoading ? 'none' : 'auto' }}
                  disabled={isLoading}
                  aria-disabled={isLoading}
                >
                  {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Signing in...
                    </div>
                  ) : 'Sign In'}
                </MetalButton>
              </div>
            </form>

            {/* Divider */}
            <div style={{ position: 'relative', margin: '32px 0' }}>
              <div style={{ width: '100%', height: '1px', background: 'var(--border)' }} />
              <div style={{ 
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                background: 'var(--bg-card)', padding: '0 12px',
                fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--text-muted)'
              }}>
                or
              </div>
            </div>

            {/* Register link */}
            <div style={{ textAlign: 'center', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Don't have an account? <Link to="/register" style={{ color: 'var(--orchid)', textDecoration: 'none' }}>Create one</Link>
            </div>
          </motion.div>
        </motion.div>
      </div>


    </div>
  );
};

export default Login;
