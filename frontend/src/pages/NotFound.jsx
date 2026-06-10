import { useState, useEffect  } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { MetalButton, LiquidButton } from '../components/ui/Buttons';

const NotFound = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  const [currentDate, setCurrentDate] = useState(() => new Date().toUTCString());
  const [isoDate, setIsoDate] = useState(() => new Date().toISOString());

  let suggestion = null;
  if (pathname.toLowerCase().includes('product')) {
    suggestion = { text: "Looking for merchandise? Try /products", link: "/products" };
  } else if (pathname.toLowerCase().includes('event')) {
    suggestion = { text: "Looking for the schedule? Check /events", link: "/events" };
  }

  return (
    <>
      <Navbar />
      <div style={{
        minHeight: '100vh',
        paddingTop: '64px',
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px 48px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '64px',
          alignItems: 'center'
        }}>
          
          {/* LEFT COLUMN */}
          <div style={{ position: 'relative' }}>
            {/* Background 404 */}
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.08, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                position: 'absolute',
                top: '-40px',
                left: '-20px',
                fontFamily: 'Syne',
                fontWeight: 800,
                fontSize: 'clamp(96px, 15vw, 160px)',
                color: 'var(--text-primary)',
                lineHeight: 1,
                zIndex: 0,
                pointerEvents: 'none',
                userSelect: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              404
            </motion.div>

            {/* Foreground content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.35, ease: "easeOut" }}
                style={{
                  fontFamily: 'Syne',
                  fontWeight: 700,
                  fontSize: '40px',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  margin: '0 0 24px 0',
                  lineHeight: 1.1
                }}
              >
                Not Found
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.35, ease: "easeOut" }}
                style={{ marginBottom: '24px' }}
              >
                <div style={{
                  fontFamily: 'DM Sans',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  marginBottom: '8px'
                }}>
                  You tried to access:
                </div>
                <div style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-mid)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 16px',
                  display: 'inline-block',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '14px',
                  color: 'var(--error)',
                  wordBreak: 'break-all'
                }}>
                  {pathname}
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.35, ease: "easeOut" }}
                style={{
                  fontFamily: 'DM Sans',
                  fontWeight: 400,
                  fontSize: '15px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  maxWidth: '440px',
                  margin: '0 0 16px 0'
                }}
              >
                This page doesn't exist on SyncSummit. It may have been moved, deleted, or the URL might be wrong.
              </motion.p>

              {suggestion ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.26, duration: 0.35, ease: "easeOut" }}
                  style={{ marginBottom: '32px' }}
                >
                  <Link to={suggestion.link} style={{
                    fontFamily: 'DM Sans',
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    textDecoration: 'underline',
                    textDecorationColor: 'transparent',
                    transition: 'text-decoration-color 0.2s',
                  }}>
                    {suggestion.text}
                  </Link>
                </motion.div>
              ) : (
                <div style={{ height: '32px' }} />
              )}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.35, ease: "easeOut" }}
                style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
              >
                <Link to="/" style={{ textDecoration: 'none' }}>
                  <MetalButton variant="primary">Back to Home</MetalButton>
                </Link>
                <Link to="/#events" style={{ textDecoration: 'none' }}>
                  <LiquidButton>Browse Events</LiquidButton>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* RIGHT COLUMN - Terminal Mockup (Hidden on very small screens implicitly by grid, but mostly fully visible) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
            style={{
              width: '100%',
              maxWidth: '380px',
              margin: '0 auto',
              background: 'var(--bg-card, #1E1B24)', // Fallback if bg-card not defined
              border: '1px solid var(--border-mid)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}
          >
            {/* Terminal Header */}
            <div style={{
              height: '32px',
              background: 'var(--bg-elevated)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: '8px'
            }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }} />
            </div>

            {/* Terminal Body */}
            <div style={{
              padding: '20px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              lineHeight: 1.6,
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}>
              <div style={{ color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--orchid)' }}>$</span> curl https://syncsummit.in{pathname}
              </div>
              
              <div style={{ color: 'var(--error)', marginTop: '16px' }}>HTTP/1.1 404 Not Found</div>
              <div style={{ color: 'var(--text-muted)' }}>Content-Type: application/json</div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Date: {currentDate}</div>
              
              <div style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {"{\n"}
                {'  '}<span style={{ color: 'var(--orchid)' }}>"error"</span>: <span style={{ color: 'var(--success, #10B981)' }}>"NOT_FOUND"</span>,{"\n"}
                {'  '}<span style={{ color: 'var(--orchid)' }}>"path"</span>: <span style={{ color: 'var(--success, #10B981)' }}>"{pathname}"</span>,{"\n"}
                {'  '}<span style={{ color: 'var(--orchid)' }}>"message"</span>: <span style={{ color: 'var(--success, #10B981)' }}>"Route not registered"</span>,{"\n"}
                {'  '}<span style={{ color: 'var(--orchid)' }}>"timestamp"</span>: <span style={{ color: 'var(--success, #10B981)' }}>"{isoDate}"</span>{"\n"}
                {"}"}
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <span style={{ color: 'var(--orchid)' }}>$</span>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '15px',
                    background: 'var(--orchid)',
                    marginLeft: '8px',
                    verticalAlign: 'middle'
                  }}
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default NotFound;
