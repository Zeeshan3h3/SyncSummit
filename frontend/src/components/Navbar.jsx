import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { MetalButton, LiquidButton } from './ui/Buttons';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { label: 'Events', path: '/events' },
    { label: 'Products', path: '/products' },
    { label: 'Schedule', path: '/schedule' },
    { label: 'Speakers', path: '/speakers' }
  ];

  return (
    <>
      <nav style={{
        height: '64px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(6, 4, 10, 0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center',
        padding: '0 clamp(20px, 5vw, 80px)', justifyContent: 'space-between'
      }}>
        {/* Left: Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/MainLogoHorizontalBgRemoved.png" alt="SyncSummit" style={{ height: '48px', width: 'auto', transform: 'scale(1.9)', transformOrigin: 'left center' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          <div style={{ display: 'none', letterSpacing: '-0.04em' }}>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '24px', color: 'var(--violet)' }}>SYNC</span>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '24px', color: 'var(--text-primary)' }}>SUMMIT</span>
          </div>
        </Link>

        {/* Center: Nav links (Desktop) */}
        <div style={{ display: 'none', gap: '32px' }} className="desktop-nav">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path} style={{
                fontFamily: 'JetBrains Mono', fontSize: '13px',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--orchid)' : '2px solid transparent',
                paddingBottom: '4px', transition: 'color 0.2s', textDecoration: 'none'
              }}>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right: Actions (Desktop) */}
        <div style={{ display: 'none', alignItems: 'center', gap: '16px' }} className="desktop-nav">
          {!user ? (
            <>
              <Link to="/login"><LiquidButton>Sign In</LiquidButton></Link>
              <Link to="/register"><MetalButton variant="primary">Register</MetalButton></Link>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', background: 'var(--grad-subtle)',
                border: '1px solid var(--border-mid)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontFamily: 'DM Sans', fontWeight: 600, fontSize: '14px', color: 'var(--lavender)'
              }}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {user.role === 'user' && <Link to="/dashboard" style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-primary)', textDecoration: 'none' }}>Dashboard</Link>}
              {user.role === 'admin' && <Link to="/admin" style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--orchid)', textDecoration: 'none' }}>Admin Panel</Link>}
              {user.role === 'superadmin' && <Link to="/superadmin" style={{ fontFamily: 'DM Sans', fontSize: '14px', background: 'linear-gradient(135deg, #F59E0B, #ED80E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 600, textDecoration: 'none' }}>Control</Link>}
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div style={{ display: 'flex', alignItems: 'center' }} className="mobile-nav-toggle">
          <button onClick={() => setIsOpen(true)} style={{ color: 'var(--text-primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(6, 4, 10, 0.98)', zIndex: 200, display: 'flex', flexDirection: 'column', padding: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsOpen(false)} style={{ color: 'var(--text-primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={32} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '64px', alignItems: 'center' }}>
              {links.map((link) => (
                <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)} style={{
                  fontFamily: 'JetBrains Mono', fontSize: '20px', color: 'var(--text-primary)', textDecoration: 'none', padding: '12px'
                }}>
                  {link.label}
                </Link>
              ))}
              <div style={{ width: '100%', height: '1px', background: 'var(--border-mid)', margin: '16px 0' }}></div>
              {!user ? (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}><LiquidButton>Sign In</LiquidButton></Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}><MetalButton variant="primary">Register</MetalButton></Link>
                </>
              ) : (
                <Link to={user.role === 'superadmin' ? '/superadmin' : user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                  <MetalButton variant="default">Go to Dashboard</MetalButton>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .desktop-nav { display: none; }
        .mobile-nav-toggle { display: flex; }
        @media (min-width: 1024px) {
          .desktop-nav { display: flex !important; }
          .mobile-nav-toggle { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
