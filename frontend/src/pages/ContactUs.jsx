import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios.js';

// Reusing MetalButton style for consistency
const MetalButton = ({ children, variant = 'primary', size = 'md', onClick, type = 'button', disabled = false, style = {}, className = '' }) => {
  const baseStyle = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    borderRadius: '8px', fontFamily: 'DM Sans', fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1, outline: 'none', border: 'none',
  };
  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: '13px' },
    md: { padding: '12px 24px', fontSize: '15px' },
    lg: { padding: '16px 32px', fontSize: '16px' }
  };
  const variants = {
    primary: { background: 'var(--text-primary)', color: 'var(--bg)', boxShadow: '0 4px 12px rgba(255,255,255,0.1)' },
    secondary: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-mid)' },
    outline: { background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-mid)' }
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={className} style={{ ...baseStyle, ...sizeStyles[size], ...variants[variant], ...style }}
      onMouseEnter={(e) => { if (!disabled && variant === 'primary') e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { if (!disabled && variant === 'primary') e.currentTarget.style.transform = 'translateY(0)'; }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.98)'; }}
      onMouseUp={(e) => { if (!disabled && variant === 'primary') e.currentTarget.style.transform = 'translateY(-2px)'; }}
    >
      {children}
    </button>
  );
};

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const abortControllerRef = React.useRef(null);

  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    abortControllerRef.current = new AbortController();
    try {
      await axiosInstance.post('/contact', formData, { signal: abortControllerRef.current.signal });
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
        toast.error('Failed to send message. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const inputStyle = {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '8px',
    padding: '14px 16px', color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: '15px',
    boxSizing: 'border-box', transition: 'border-color 0.2s', outline: 'none'
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1, paddingTop: '120px', paddingBottom: '100px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '80px', maxWidth: '700px', margin: '0 auto 80px' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--grad-subtle)', border: '1px solid var(--border-mid)', padding: '6px 12px', borderRadius: '100px', marginBottom: '24px' }}>
              <MessageSquare size={14} color="var(--orchid)" />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--orchid)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Get in Touch</span>
            </div>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 'clamp(40px, 6vw, 64px)', color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '24px' }}>
              Let's build something <span style={{ color: 'var(--orchid)' }}>extraordinary</span> together.
            </h1>
            <p style={{ fontFamily: 'DM Sans', fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Have a question about an upcoming event, need help with registration, or want to partner with us? We'd love to hear from you.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '60px', alignItems: 'start' }}>
            
            {/* Contact Info Column */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}
            >
              <div>
                <h3 style={{ fontFamily: 'Syne', fontSize: '28px', color: 'var(--text-primary)', marginBottom: '32px' }}>Contact Information</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Mail size={20} color="var(--orchid)" />
                    </div>
                    <div>
                      <h4 style={{ fontFamily: 'DM Sans', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '4px' }}>Email Us</h4>
                      <p style={{ fontFamily: 'DM Sans', fontSize: '16px', color: 'var(--text-primary)' }}>hello@syncsummit.com</p>
                      <p style={{ fontFamily: 'DM Sans', fontSize: '16px', color: 'var(--text-primary)' }}>support@syncsummit.com</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MapPin size={20} color="var(--orchid)" />
                    </div>
                    <div>
                      <h4 style={{ fontFamily: 'DM Sans', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '4px' }}>Visit Us</h4>
                      <p style={{ fontFamily: 'DM Sans', fontSize: '16px', color: 'var(--text-primary)' }}>Jadavpur University Salt Lake Campus ,Kolkata</p>
                      <p style={{ fontFamily: 'DM Sans', fontSize: '16px', color: 'var(--text-primary)' }}>Jadavpur University ,Kolkata</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Phone size={20} color="var(--orchid)" />
                    </div>
                    <div>
                      <h4 style={{ fontFamily: 'DM Sans', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '4px' }}>Call Us</h4>
                      <p style={{ fontFamily: 'DM Sans', fontSize: '16px', color: 'var(--text-primary)' }}>+91 9088260058</p>
                      <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Mon-Fri from 9am to 6pm (PST)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Image */}
              <div style={{ width: '100%', height: '240px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-mid)', marginBottom: '16px' }}>
                <img src="/images/gemini/contact_illustration_1781109235273.png" alt="Contact Illustration" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              {/* Decorative Element */}
              <div style={{ padding: '32px', background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'var(--orchid)', filter: 'blur(80px)', opacity: 0.1, borderRadius: '50%' }} />
                <h4 style={{ fontFamily: 'Syne', fontSize: '20px', color: 'var(--text-primary)', marginBottom: '12px' }}>Sponsorship Inquiries</h4>
                <p style={{ fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                  Interested in sponsoring an upcoming SyncSummit event? Request our prospectus.
                </p>
                <MetalButton variant="outline" size="sm" onClick={() => window.location.href = 'mailto:partners@syncsummit.com'}>
                  Partner With Us
                </MetalButton>
              </div>
            </motion.div>

            {/* Form Column */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: '24px', padding: '40px' }}
            >
              <h3 style={{ fontFamily: 'Syne', fontSize: '28px', color: 'var(--text-primary)', marginBottom: '8px' }}>Send a Message</h3>
              <p style={{ fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Fill out the form below and our team will get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Full Name</label>
                    <input 
                      type="text" name="name" value={formData.name} onChange={handleChange} required
                      style={inputStyle} placeholder="John Doe"
                      onFocus={e => e.target.style.borderColor = 'var(--orchid)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Email Address</label>
                    <input 
                      type="email" name="email" value={formData.email} onChange={handleChange} required
                      style={inputStyle} placeholder="john@example.com"
                      onFocus={e => e.target.style.borderColor = 'var(--orchid)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Subject</label>
                  <input 
                    type="text" name="subject" value={formData.subject} onChange={handleChange} required
                    style={inputStyle} placeholder="How can we help?"
                    onFocus={e => e.target.style.borderColor = 'var(--orchid)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>Message</label>
                  <textarea 
                    name="message" value={formData.message} onChange={handleChange} required
                    style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }} placeholder="Tell us more about your inquiry..."
                    onFocus={e => e.target.style.borderColor = 'var(--orchid)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-mid)'}
                  />
                </div>

                <MetalButton type="submit" variant="primary" size="lg" disabled={isSubmitting} style={{ width: '100%', marginTop: '12px' }}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  {!isSubmitting && <Send size={18} />}
                </MetalButton>
              </form>
            </motion.div>

          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContactUs;
