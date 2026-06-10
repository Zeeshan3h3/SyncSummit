import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios';
import useAuthStore from '../store/authStore';
import { MetalButton, Button } from '../components/ui/Buttons';

const Register = () => {
  const navigate = useNavigate();
  const { user, setAuth } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    institution: '',
    yearOfStudy: '',
    interests: [],
    termsAgreed: false
  });

  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsYearDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const toggleInterest = (interest) => {
    setFormData(prev => {
      const interests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests };
    });
    if (errors.interests) {
      setErrors(prev => ({ ...prev, interests: null }));
    }
  };

  const getPasswordScore = (pass) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;
    return score;
  };
  const passwordScore = getPasswordScore(formData.password);

  const getPasswordColor = () => {
    if (passwordScore === 0) return 'var(--border)';
    if (passwordScore === 1) return 'var(--error)';
    if (passwordScore <= 3) return '#F59E0B'; // warning color
    return 'var(--success)';
  };

  const getPasswordLabel = () => {
    if (passwordScore === 0) return '';
    if (passwordScore === 1) return 'Weak';
    if (passwordScore <= 3) return 'Fair';
    if (passwordScore === 4) return 'Strong';
    return '';
  };

  // Validations
  const isStep1Valid = 
    formData.email.includes('@') && 
    formData.email.includes('.') && 
    formData.password.length >= 8 && 
    formData.password === formData.confirmPassword;

  const isStep2Valid = 
    formData.fullName.trim() !== '' &&
    formData.phone.replace(/\D/g, '').length === 10 &&
    formData.yearOfStudy !== '' &&
    formData.interests.length > 0;

  const handleNextStep1 = () => {
    const newErrors = {};
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      newErrors.email = 'Enter a valid email address';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setStep(2);
    }
  };

  const handleNextStep2 = () => {
    const newErrors = {};
    if (formData.fullName.trim() === '') newErrors.fullName = 'Full name is required';
    if (formData.phone.replace(/\D/g, '').length !== 10) newErrors.phone = 'Enter a valid 10-digit phone number';
    if (formData.interests.length === 0) newErrors.interests = 'Select at least one interest';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!formData.termsAgreed) return;
    
    setIsLoading(true);
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        phone: formData.phone,
        institution: formData.institution,
        yearOfStudy: formData.yearOfStudy,
        interests: formData.interests
      };

      const response = await axiosInstance.post('/auth/register', payload);
      setAuth(response.data.user, response.data.token);
      toast.success('Account created! Welcome to SyncSummit.', {
        icon: null,
        style: { borderLeft: '4px solid var(--success)', borderRadius: 'var(--radius-sm)' }
      });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setStep(1);
        setErrors({ email: 'This email is already registered' });
        toast.error('Email already in use', {
          icon: null,
          style: { borderLeft: '4px solid var(--error)', borderRadius: 'var(--radius-sm)' }
        });
      } else {
        toast.error('Registration failed. Check your inputs.', {
          icon: null,
          style: { borderLeft: '4px solid var(--error)', borderRadius: 'var(--radius-sm)' }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const steps = ['Account', 'Profile', 'Confirm'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'linear-gradient(to right, rgba(6,4,10,0.9) 0%, rgba(6,4,10,0.7) 100%), url("/auth_bg.png") center/cover no-repeat', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      {/* Fixed Logo */}
      <div style={{ position: 'fixed', top: '32px', left: '32px', zIndex: 50 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/MainLogoHorizontalBgRemoved.png" alt="SyncSummit" style={{ height: '32px', transform: 'scale(1.5)', transformOrigin: 'left center' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          <div style={{ display: 'none', letterSpacing: '-0.04em' }}>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '20px', color: 'var(--violet)' }}>SYNC</span>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)' }}>SUMMIT</span>
          </div>
        </Link>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-mid)',
        borderRadius: '24px', // var(--radius-xl)
        padding: 'clamp(32px, 5vw, 48px) clamp(24px, 4vw, 40px)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '14px', left: '0', right: '0', height: '1px', background: 'var(--border-mid)', zIndex: 0 }} />
          
          <div style={{ position: 'absolute', top: '14px', left: '0', height: '1px', background: 'var(--violet)', zIndex: 1, transition: 'width 0.3s ease', width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />

          {steps.map((label, index) => {
            const stepNum = index + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;
            
            return (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, gap: '8px', background: 'var(--bg-card)', padding: '0 8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? 'var(--violet)' : isCompleted ? 'var(--success)' : 'var(--bg-elevated)',
                  border: (!isActive && !isCompleted) ? '1px solid var(--border-mid)' : 'none',
                  color: (isActive || isCompleted) ? '#fff' : 'var(--text-muted)',
                  fontFamily: 'JetBrains Mono', fontSize: '12px', fontWeight: 500
                }}>
                  {isCompleted ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  ) : stepNum}
                </div>
                <div style={{
                  fontFamily: 'JetBrains Mono', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)'
                }}>
                  {label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Step Content Wrapper */}
        <div style={{ position: 'relative' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* STEP 1 */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '24px', color: 'var(--text-primary)', margin: 0 }}>Create your account</h1>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Step 1 of 3 — your login credentials</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>EMAIL</label>
                    <input 
                      type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="you@gmail.com"
                      style={{
                        background: 'var(--bg-elevated)', border: `1px solid ${errors.email ? 'var(--error)' : 'var(--border-mid)'}`, borderRadius: 'var(--radius-md)', padding: '11px 14px', fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-primary)', outline: 'none', transition: 'all 0.15s'
                      }}
                      onFocus={(e) => !errors.email && (e.target.style.borderColor = 'var(--violet)', e.target.style.boxShadow = '0 0 0 3px rgba(148, 0, 211, 0.15)')}
                      onBlur={(e) => !errors.email && (e.target.style.borderColor = 'var(--border-mid)', e.target.style.boxShadow = 'none')}
                    />
                    {errors.email && <div style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--error)', marginTop: '4px' }}>{errors.email}</div>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>PASSWORD</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => handleChange('password', e.target.value)}
                        style={{
                          width: '100%', background: 'var(--bg-elevated)', border: `1px solid ${errors.password ? 'var(--error)' : 'var(--border-mid)'}`, borderRadius: 'var(--radius-md)', padding: '11px 40px 11px 14px', fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-primary)', outline: 'none', transition: 'all 0.15s'
                        }}
                        onFocus={(e) => !errors.password && (e.target.style.borderColor = 'var(--violet)', e.target.style.boxShadow = '0 0 0 3px rgba(148, 0, 211, 0.15)')}
                        onBlur={(e) => !errors.password && (e.target.style.borderColor = 'var(--border-mid)', e.target.style.boxShadow = 'none')}
                      />
                      <button 
                        type="button" onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                    {/* Password Strength Meter */}
                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ 
                          height: '4px', borderRadius: '2px', flex: 1, 
                          background: passwordScore >= i ? getPasswordColor() : 'var(--border-mid)',
                          transition: 'background 0.3s'
                        }} />
                      ))}
                    </div>
                    {formData.password.length > 0 && (
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: getPasswordColor(), marginTop: '4px' }}>{getPasswordLabel()}</div>
                    )}
                    {errors.password && <div style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--error)', marginTop: '4px' }}>{errors.password}</div>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>CONFIRM PASSWORD</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        style={{
                          width: '100%', background: 'var(--bg-elevated)', border: `1px solid ${errors.confirmPassword ? 'var(--error)' : 'var(--border-mid)'}`, borderRadius: 'var(--radius-md)', padding: '11px 40px 11px 14px', fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-primary)', outline: 'none', transition: 'all 0.15s'
                        }}
                        onFocus={(e) => !errors.confirmPassword && (e.target.style.borderColor = 'var(--violet)', e.target.style.boxShadow = '0 0 0 3px rgba(148, 0, 211, 0.15)')}
                        onBlur={(e) => !errors.confirmPassword && (e.target.style.borderColor = 'var(--border-mid)', e.target.style.boxShadow = 'none')}
                      />
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <div style={{ position: 'absolute', right: '12px', color: 'var(--success)' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                      )}
                    </div>
                    {errors.confirmPassword && <div style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--error)', marginTop: '4px' }}>{errors.confirmPassword}</div>}
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <MetalButton variant="primary" style={{ width: '100%' }} onClick={handleNextStep1} disabled={!isStep1Valid}>
                      Continue →
                    </MetalButton>
                  </div>
                  
                  <div style={{ textAlign: 'center', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--orchid)', textDecoration: 'none' }}>Sign in</Link>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '24px', color: 'var(--text-primary)', margin: 0 }}>About you</h1>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Step 2 of 3 — this will be on your badge</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>FULL NAME</label>
                    <input 
                      type="text" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} placeholder="Arnab Chatterjee"
                      style={{
                        background: 'var(--bg-elevated)', border: `1px solid ${errors.fullName ? 'var(--error)' : 'var(--border-mid)'}`, borderRadius: 'var(--radius-md)', padding: '11px 14px', fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-primary)', outline: 'none', transition: 'all 0.15s'
                      }}
                      onFocus={(e) => !errors.fullName && (e.target.style.borderColor = 'var(--violet)', e.target.style.boxShadow = '0 0 0 3px rgba(148, 0, 211, 0.15)')}
                      onBlur={(e) => !errors.fullName && (e.target.style.borderColor = 'var(--border-mid)', e.target.style.boxShadow = 'none')}
                    />
                    {errors.fullName && <div style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--error)', marginTop: '4px' }}>{errors.fullName}</div>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>PHONE</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <div style={{ position: 'absolute', left: '14px', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-muted)', pointerEvents: 'none' }}>+91</div>
                      <input 
                        type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="98765 43210"
                        style={{
                          width: '100%', background: 'var(--bg-elevated)', border: `1px solid ${errors.phone ? 'var(--error)' : 'var(--border-mid)'}`, borderRadius: 'var(--radius-md)', padding: '11px 14px 11px 48px', fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-primary)', outline: 'none', transition: 'all 0.15s', letterSpacing: '0.05em'
                        }}
                        onFocus={(e) => !errors.phone && (e.target.style.borderColor = 'var(--violet)', e.target.style.boxShadow = '0 0 0 3px rgba(148, 0, 211, 0.15)')}
                        onBlur={(e) => !errors.phone && (e.target.style.borderColor = 'var(--border-mid)', e.target.style.boxShadow = 'none')}
                      />
                    </div>
                    {errors.phone && <div style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--error)', marginTop: '4px' }}>{errors.phone}</div>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>INSTITUTION</label>
                    <input 
                      type="text" value={formData.institution} onChange={(e) => handleChange('institution', e.target.value)} placeholder="Jadavpur University"
                      style={{
                        background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-md)', padding: '11px 14px', fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-primary)', outline: 'none', transition: 'all 0.15s'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--violet)', e.target.style.boxShadow = '0 0 0 3px rgba(148, 0, 211, 0.15)')}
                      onBlur={(e) => (e.target.style.borderColor = 'var(--border-mid)', e.target.style.boxShadow = 'none')}
                    />
                    <div style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>As it will appear on your event badge</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }} ref={dropdownRef}>
                    <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>YEAR OF STUDY</label>
                    <div 
                      onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                      style={{
                        background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-md)', padding: '11px 14px', fontFamily: 'DM Sans', fontSize: '15px', color: formData.yearOfStudy ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      {formData.yearOfStudy || 'Select year'}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isYearDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                    <AnimatePresence>
                      {isYearDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}
                          style={{
                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, marginTop: '4px',
                            background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-md)',
                            maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                          }}
                        >
                          {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'PhD', 'Alumnus / Professional'].map(year => (
                            <div 
                              key={year}
                              onClick={() => { handleChange('yearOfStudy', year); setIsYearDropdownOpen(false); }}
                              style={{
                                height: '40px', padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-primary)', cursor: 'pointer',
                                background: formData.yearOfStudy === year ? 'var(--border)' : 'transparent',
                                transition: 'background 0.1s'
                              }}
                              onMouseOver={(e) => e.target.style.background = 'var(--border)'}
                              onMouseOut={(e) => e.target.style.background = formData.yearOfStudy === year ? 'var(--border)' : 'transparent'}
                            >
                              {year}
                              {formData.yearOfStudy === year && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orchid)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: '4px' }}>
                    <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>I AM INTERESTED IN</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {['Attending talks', 'Participating in hackathons', 'Startup pitching', 'Networking only'].map(interest => (
                        <div key={interest} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => toggleInterest(interest)}>
                          <div style={{
                            width: '18px', height: '18px', borderRadius: '4px',
                            background: formData.interests.includes(interest) ? 'var(--violet)' : 'transparent',
                            border: `1px solid ${formData.interests.includes(interest) ? 'var(--violet)' : 'var(--border-mid)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                          }}>
                            {formData.interests.includes(interest) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                          </div>
                          <span style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-primary)' }}>{interest}</span>
                        </div>
                      ))}
                    </div>
                    {errors.interests && <div style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--error)', marginTop: '8px' }}>{errors.interests}</div>}
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                    <MetalButton variant="default" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</MetalButton>
                    <MetalButton variant="primary" onClick={handleNextStep2} disabled={!isStep2Valid} style={{ flex: 1 }}>Continue →</MetalButton>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '24px', color: 'var(--text-primary)', margin: 0 }}>Review your details</h1>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Step 3 of 3 — make sure everything looks right</p>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <tbody>
                      {[
                        { label: 'Email', value: formData.email },
                        { label: 'Full Name', value: formData.fullName },
                        { label: 'Phone', value: `+91 ${formData.phone}` },
                        { label: 'Institution', value: formData.institution || '—' },
                        { label: 'Year', value: formData.yearOfStudy || '—' },
                        { label: 'Interests', value: formData.interests.join(', ') }
                      ].map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: idx !== 5 ? '1px solid var(--border)' : 'none' }}>
                          <td style={{ padding: '12px 0', fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', width: '35%', verticalAlign: 'top' }}>{row.label.toUpperCase()}</td>
                          <td style={{ padding: '12px 0', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-primary)' }}>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }} onClick={() => setFormData(prev => ({ ...prev, termsAgreed: !prev.termsAgreed }))}>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0, marginTop: '2px',
                        background: formData.termsAgreed ? 'var(--violet)' : 'transparent',
                        border: `1px solid ${formData.termsAgreed ? 'var(--violet)' : 'var(--border-mid)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                      }}>
                        {formData.termsAgreed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>
                      <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        I agree to the <Link to="/terms" style={{ color: 'var(--orchid)', textDecoration: 'none' }} onClick={(e) => e.stopPropagation()}>SyncSummit Terms and Conditions</Link> and Privacy Policy
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                    <MetalButton variant="default" onClick={() => setStep(2)} disabled={isLoading} style={{ width: 'auto', padding: '12px' }}>←</MetalButton>
                    <MetalButton variant="primary" onClick={handleSubmit} disabled={!formData.termsAgreed || isLoading} style={{ flex: 1 }}>
                      {isLoading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                          Creating account...
                        </div>
                      ) : 'Create Account'}
                    </MetalButton>
                  </div>

                  <div style={{ textAlign: 'center', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--orchid)', textDecoration: 'none' }}>Sign in</Link>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default Register;
