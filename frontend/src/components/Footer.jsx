import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--bg-card)', borderTop: '1px solid var(--border)',
      padding: '64px clamp(20px, 5vw, 80px) 32px', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Column 1 — Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/MainLogoHorizontalBgRemoved.png" alt="SyncSummit" style={{ height: '64px', width: 'auto', transform: 'scale(1.7)', transformOrigin: 'left center' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            <div style={{ display: 'none', letterSpacing: '-0.04em' }}>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '24px', color: 'var(--violet)' }}>SYNC</span>
              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '24px', color: 'var(--text-primary)' }}>SUMMIT</span>
            </div>
          </Link>
          <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>Jadavpur University E-Cell</span>
          <span style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--text-muted)', marginTop: '32px' }}>© 2025 JU E-Cell. All rights reserved.</span>
        </div>

        {/* Column 2 — Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['Events', 'Products', 'Schedule', 'Speakers', 'About', 'Blog'].map(link => (
            <Link key={link} to={`/${link.toLowerCase()}`} style={{
              fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)',
              textDecoration: 'none', transition: 'color 0.2s'
            }} onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
              {link}
            </Link>
          ))}
        </div>

        {/* Column 3 — Socials + Legal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {['Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'YouTube'].map(social => (
              <a key={social} href="#" style={{
                fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-muted)',
                textDecoration: 'none', transition: 'color 0.2s'
              }} onMouseEnter={(e) => e.target.style.color = 'var(--orchid)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
                {social}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <Link to="/privacy" style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</Link>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>·</span>
            <Link to="/terms" style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</Link>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: '1px', background: 'var(--border)', margin: '48px 0' }}></div>
      
      {/* Decorative large text */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <h1 style={{
          fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(40px, 12vw, 160px)',
          margin: 0, lineHeight: 0.8, letterSpacing: '-0.02em',
          background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          opacity: 0.1
        }}>
          SYNCSUMMIT
        </h1>
      </div>
    </footer>
  );
};

export default Footer;
