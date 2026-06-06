import React from 'react';
import { motion } from 'framer-motion';

export const MetalButton = ({ variant = 'default', size = 'md', className = '', children, ...props }) => {
  const baseStyle = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 'var(--radius-md)', fontWeight: 600, fontFamily: 'DM Sans',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', textAlign: 'center',
    textDecoration: 'none'
  };

  const sizes = {
    sm: { padding: '8px 16px', fontSize: 'var(--text-sm)' },
    md: { padding: '12px 24px', fontSize: 'var(--text-base)' },
    lg: { padding: '16px 32px', fontSize: 'var(--text-md)' }
  };

  const variants = {
    primary: { background: 'var(--violet)', color: '#fff', border: '1px solid #B026FF', boxShadow: '0 4px 14px rgba(148, 0, 211, 0.4)' },
    default: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-mid)' },
    success: { background: 'var(--success)', color: '#fff', border: '1px solid #4ADE80' },
    error: { background: 'var(--error)', color: '#fff', border: '1px solid #F87171' },
    gold: { background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: '#000', border: '1px solid #FCD34D', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)' }
  };

  return (
    <motion.button
      whileHover={{ y: -2, filter: 'brightness(1.1)' }}
      whileTap={{ scale: 0.96 }}
      style={{ ...baseStyle, ...sizes[size], ...variants[variant] }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const LiquidButton = ({ children, className = '', style = {}, ...props }) => {
  return (
    <motion.button
      whileHover={{ y: -2, color: 'var(--text-primary)' }}
      whileTap={{ scale: 0.96 }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', color: 'var(--text-secondary)',
        border: 'none', fontWeight: 600, fontFamily: 'DM Sans',
        padding: '12px 24px', fontSize: 'var(--text-base)',
        cursor: 'pointer', transition: 'color 0.2s ease', textDecoration: 'none',
        ...style
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const Button = ({ variant = 'outline', children, className = '', ...props }) => {
  const baseStyle = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 'var(--radius-sm)', fontWeight: 500, fontFamily: 'DM Sans',
    padding: '8px 16px', fontSize: 'var(--text-sm)', cursor: 'pointer',
    transition: 'all 0.2s ease', textDecoration: 'none'
  };

  const variants = {
    cool: { background: 'var(--bg-card)', color: 'var(--orchid)', border: '1px solid var(--orchid)' },
    outline: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-mid)' },
    ghost: { background: 'transparent', color: 'var(--text-muted)', border: 'none', padding: '8px' }
  };

  return (
    <motion.button
      whileHover={{ y: -1, borderColor: variant === 'outline' ? 'var(--text-secondary)' : undefined }}
      whileTap={{ scale: 0.96 }}
      style={{ ...baseStyle, ...variants[variant] }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};
