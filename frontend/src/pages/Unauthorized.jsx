import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { MetalButton, LiquidButton } from '../components/ui/Buttons';

const Unauthorized = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  
  const attemptedPath = location.state?.attemptedPath || location.pathname;
  const requiredRoles = location.state?.requiredRoles || [];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      paddingTop: '64px',
      color: 'var(--text-primary)'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        padding: '24px',
        textAlign: 'left'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            fontFamily: 'Syne',
            fontWeight: 800,
            fontSize: 'clamp(96px, 15vw, 160px)',
            color: 'rgba(239, 68, 68, 0.4)',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            margin: 0
          }}
        >
          403
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            fontFamily: 'Syne',
            fontWeight: 700,
            fontSize: '28px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginTop: '8px',
            marginBottom: '16px'
          }}
        >
          Unauthorized Access
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontFamily: 'DM Sans',
            fontWeight: 400,
            fontSize: '15px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: 0
          }}
        >
          You don't have permission to access this resource. If you believe this is an error, contact the event administrators.
        </motion.p>
        
        {attemptedPath !== '/unauthorized' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '12px'
            }}
          >
            Attempted: {attemptedPath}
          </motion.div>
        )}

        <div style={{ height: '1px', background: 'var(--border-mid)', margin: '24px 0' }} />

        {user && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--text-muted)' }}>
              Signed in as: {user.email}
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--text-muted)' }}>
              Current role: {user.role.toUpperCase()}
            </div>
            {requiredRoles.length > 0 && (
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--error)' }}>
                Required role: {requiredRoles.join(' or ').toUpperCase()}
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', gap: '16px', marginTop: '32px' }}
        >
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <MetalButton variant="primary">Back to Dashboard</MetalButton>
          </Link>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <LiquidButton>Go to Home</LiquidButton>
          </Link>
        </motion.div>

        <div style={{ height: '1px', background: 'var(--border-mid)', margin: '24px 0' }} />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            fontFamily: 'DM Sans',
            fontSize: '14px',
            color: 'var(--text-muted)'
          }}
        >
          Need elevated access? Contact the SyncSummit organizers:
          <br />
          <a href="mailto:tech@juecell.com" style={{ color: 'var(--orchid)', textDecoration: 'none', marginTop: '4px', display: 'inline-block' }}>
            tech@juecell.com
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Unauthorized;
