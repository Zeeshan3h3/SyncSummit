import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MetalButton, LiquidButton, Button } from '../components/ui/Buttons';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axiosInstance from '../api/axios';

// Helper component for staggered animations
const FadeIn = ({ children, delay = 0, duration = 0.4, y = 8, className = '', style = {} }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration, ease: 'easeOut' }}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
);

const ScrollReveal = ({ children, className = '', style = {} }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className={className}
    style={style}
  >
    {children}
  </motion.div>
);

// CountUp Animation Hook
const useCountUp = (end, duration = 1.2) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return count;
};

const StatItem = ({ endValue, label, suffix = '', prefix = '' }) => {
  const [hasViewed, setHasViewed] = useState(false);
  const displayValue = hasViewed ? endValue : 0;
  const count = useCountUp(displayValue);

  return (
    <motion.div 
      onViewportEnter={() => setHasViewed(true)} 
      style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
    >
      <div style={{
        fontFamily: 'Syne', fontWeight: 800, fontSize: '48px', lineHeight: 1,
        background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
      }}>
        {prefix}{count}{suffix}
      </div>
      <div style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-secondary)' }}>
        {label}
      </div>
    </motion.div>
  );
};

const Home = () => {
  // Live Countdown Logic
  const [timeLeft, setTimeLeft] = useState({ days: 0, hrs: 0, min: 0, sec: 0 });
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch real events for the featured strip
    axiosInstance.get('/event')
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setEvents(res.data.slice(0, 5)); // Take up to 5 events
        }
      })
      .catch(err => console.error("Error fetching events for home:", err));


    const targetDate = new Date('2025-11-15T00:00:00+05:30').getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hrs: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          min: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          sec: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ paddingTop: '64px' }}>
        {/* SECTION 1: HERO */}
        <section style={{
          minHeight: 'calc(100vh - 64px)', padding: '0 clamp(20px, 5vw, 80px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            maxWidth: '1200px', width: '100%', display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '64px',
            alignItems: 'center'
          }} className="hero-grid">
            
            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <FadeIn delay={0}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img src="/OnlyLogoBgRemoved.png" alt="Icon" style={{ height: '32px', opacity: 0.9, transform: 'scale(1.6)', transformOrigin: 'left center' }} onError={(e) => e.target.style.display = 'none'} />
                  <div style={{ width: '32px', height: '1px', background: 'var(--orchid)', opacity: 0.4, marginLeft: '24px' }} />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--orchid)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    JU E-Cell · SyncSummit 2025
                  </span>
                </div>
              </FadeIn>

              <FadeIn delay={0.08} y={12}>
                <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(52px, 8vw, 96px)', letterSpacing: '-0.03em', lineHeight: 0.95, margin: 0 }}>
                  Where Founders and Builders <span style={{ color: 'var(--orchid)' }}>Converge.</span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.14}>
                <p style={{ fontFamily: 'DM Sans', fontWeight: 400, fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '480px', margin: 0 }}>
                  Three days. Fifty speakers. One campus. SyncSummit 2025 brings together the most ambitious minds from across India to Jadavpur University, Kolkata.
                </p>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '28px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1 }}>48Hrs</span>
                    <span style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Continuous Programming</span>
                  </div>
                  <div style={{ width: '1px', height: '40px', background: 'var(--border-mid)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '28px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1 }}>50+</span>
                    <span style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Industry Speakers</span>
                  </div>
                  <div style={{ width: '1px', height: '40px', background: 'var(--border-mid)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '28px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1 }}>₹2L+</span>
                    <span style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Prize Pool</span>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.26}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Link to="/register"><MetalButton variant="primary">Register Now</MetalButton></Link>
                  <LiquidButton onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>View Schedule</LiquidButton>
                </div>
                <div style={{ marginTop: '24px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-muted)' }}>
                  15 — 17 Nov 2025 · Salt Lake Campus, Kolkata
                </div>
              </FadeIn>
            </div>

            {/* RIGHT COLUMN */}
            <motion.div 
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
              className="desktop-only"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  STARTS IN
                </div>
                <img src="/OnlyLogoBgRemoved.png" alt="SyncSummit Logo" style={{ height: '40px', opacity: 0.3, transform: 'scale(2.5)', transformOrigin: 'right top' }} onError={(e) => e.target.style.display = 'none'} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', borderBottom: '1px solid var(--border-mid)', paddingBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderRight: '1px solid var(--border-mid)', paddingRight: '24px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '52px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1 }}>{String(timeLeft.days).padStart(2, '0')}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>DAYS</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '52px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1 }}>{String(timeLeft.hrs).padStart(2, '0')}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>HRS</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderRight: '1px solid var(--border-mid)', paddingRight: '24px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '52px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1 }}>{String(timeLeft.min).padStart(2, '0')}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MIN</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '52px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1 }}>{String(timeLeft.sec).padStart(2, '0')}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SEC</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '18px', color: 'var(--orchid)' }}>SyncSummit '25</span>
                <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>Jadavpur University · Kolkata</span>
              </div>

              <div style={{ width: '100%', height: '1px', background: 'var(--border-mid)' }} />

              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--warning)' }}>
                Registration closes in {timeLeft.days - 2 > 0 ? timeLeft.days - 2 : 0} days
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 2: FEATURED EVENTS STRIP */}
        <section style={{ padding: '120px 0', maxWidth: '100vw', overflow: 'hidden' }}>
          <div style={{ padding: '0 clamp(20px, 5vw, 80px)', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '32px', color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              Events · SyncSummit 2025
            </h2>
            <Link to="/events" className="desktop-only"><LiquidButton>See All Events</LiquidButton></Link>
          </div>

          <div style={{ position: 'relative' }}>
            <div className="hide-scrollbar" style={{ display: 'flex', gap: '24px', overflowX: 'auto', padding: '0 clamp(20px, 5vw, 80px)' }}>
              {events.length > 0 ? events.map((event, i) => {
                // Parse dates and format safely
                let dateStr = 'TBA';
                if (event.schedule && event.schedule.length > 0) {
                   const start = new Date(event.schedule[0].startTime);
                   if (!isNaN(start.getTime())) {
                     dateStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                   } else {
                     dateStr = event.schedule[0].startTime;
                   }
                } else if (event.date) {
                   const parsed = new Date(event.date);
                   if (!isNaN(parsed.getTime())) {
                     dateStr = parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                   } else {
                     dateStr = event.date;
                   }
                }
                
                return (
                <div key={event._id || i} className="event-card" style={{
                  width: '320px', flexShrink: 0, background: 'var(--bg-card)', border: '1px solid var(--border-mid)',
                  borderRadius: 'var(--radius-lg)', padding: '24px', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <div style={{ display: 'inline-block', background: 'var(--grad-subtle)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-sm)', padding: '3px 8px', fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--orchid)' }}>
                    {event.type || 'EVENT'}
                  </div>
                  <h3 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '-0.01em', marginTop: '12px', marginBottom: '8px' }}>{event.name || event.title}</h3>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {dateStr} · {event.venue || 'TBA'}
                  </div>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0, height: '44px' }}>
                    {event.description || 'No description available.'}
                  </p>
                  <div style={{ width: '100%', height: '1px', background: 'var(--border)', margin: '16px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                      <span style={{ color: 'var(--orchid)' }}>{event.capacity ? Math.floor(event.capacity * 0.7) : 0}</span>
                      <span style={{ color: 'var(--text-muted)' }}> /{event.capacity || 0} spots</span>
                    </div>
                    <Link to={`/events/${event._id || event.id}`}><MetalButton variant="default" size="sm">View Details</MetalButton></Link>
                  </div>
                </div>
              )}) : [
                { type: 'HACKATHON', name: 'NexusHack 2025', date: 'Nov 15, 2025', venue: 'Main Auditorium, JU', desc: '48-hour intense hackathon focusing on AI and Web3 infrastructure.', spots: '48 / 200' },
                { type: 'CASE STUDY', name: 'Consult IQ', date: 'Nov 16, 2025', venue: 'TEQIP Building', desc: 'Tackle real-world business problems presented by top consulting firms.', spots: '12 / 50' },
                { type: 'STARTUP PITCH', name: 'Launchpad', date: 'Nov 17, 2025', venue: 'OAT, JU', desc: 'Pitch your early-stage startup to a panel of seed investors and angels.', spots: '8 / 20' },
                { type: 'WORKSHOP', name: 'DesignDrift', date: 'Nov 16, 2025', venue: 'Design Lab', desc: 'Product design sprint focusing on user psychology and wireframing.', spots: '45 / 60' },
                { type: 'WORKSHOP', name: 'Cloud Native', date: 'Nov 15, 2025', venue: 'Lab 3', desc: 'Hands-on workshop on Kubernetes and distributed systems architecture.', spots: '30 / 40' }
              ].map((event, i) => (
                <div key={i} className="event-card" style={{
                  width: '320px', flexShrink: 0, background: 'var(--bg-card)', border: '1px solid var(--border-mid)',
                  borderRadius: 'var(--radius-lg)', padding: '24px', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <div style={{ display: 'inline-block', background: 'var(--grad-subtle)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-sm)', padding: '3px 8px', fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--orchid)' }}>
                    {event.type}
                  </div>
                  <h3 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '18px', color: 'var(--text-primary)', letterSpacing: '-0.01em', marginTop: '12px', marginBottom: '8px' }}>{event.name}</h3>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {event.date} · {event.venue}
                  </div>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0, height: '44px' }}>
                    {event.desc}
                  </p>
                  <div style={{ width: '100%', height: '1px', background: 'var(--border)', margin: '16px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px' }}>
                      <span style={{ color: 'var(--orchid)' }}>{event.spots.split('/')[0]}</span>
                      <span style={{ color: 'var(--text-muted)' }}> /{event.spots.split('/')[1]} spots</span>
                    </div>
                    <Link to={`/events/${event._id || event.id || 'upcoming'}`}><MetalButton variant="default" size="sm">View Details</MetalButton></Link>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '100px', background: 'linear-gradient(to right, transparent, var(--bg))', pointerEvents: 'none' }} />
          </div>
        </section>

        {/* SECTION 3: ABOUT / MISSION STATEMENT */}
        <ScrollReveal style={{ background: 'var(--bg-elevated)', padding: '120px clamp(20px, 5vw, 80px)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '48px' }}>
              About SyncSummit
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '64px' }}>
              <div>
                <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '40px', color: 'var(--text-primary)', letterSpacing: '-0.02em', maxWidth: '360px', margin: 0, lineHeight: 1.1 }}>
                  Jadavpur University's Flagship Innovation Summit
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <p style={{ fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  SyncSummit is the annual convergence of entrepreneurial energy and technical excellence at Jadavpur University. Organized by the JU Entrepreneurship Cell under the Institution's Innovation Council, it is three days of building, learning, and connecting.
                </p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  From early-stage founders presenting to angel investors, to student developers shipping products under 24 hours — every event at SyncSummit is designed to push limits. Not performance. Not optics. Real work.
                </p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  This is not a fest. This is a proof of concept.
                </p>
              </div>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'var(--border-mid)', margin: '64px 0 48px' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
              <StatItem endValue={100} suffix="+" label="Startups powered by JU Alumni" />
              <div className="desktop-only" style={{ width: '1px', height: '100%', background: 'var(--border-mid)' }} />
              <StatItem endValue={25} suffix="K+" label="Alumni network worldwide" />
              <div className="desktop-only" style={{ width: '1px', height: '100%', background: 'var(--border-mid)' }} />
              <StatItem endValue={7} suffix="+" label="Years of E-Cell" />
              <div className="desktop-only" style={{ width: '1px', height: '100%', background: 'var(--border-mid)' }} />
              <StatItem endValue={3} suffix="L+" label="Total summit footfall" />
            </div>
          </div>
        </ScrollReveal>

        {/* SECTION 4: PRODUCTS / MERCH TEASER */}
        <section style={{ padding: '120px clamp(20px, 5vw, 80px)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '64px' }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '32px', color: 'var(--text-primary)', margin: 0 }}>Official Merchandise</h2>
              <Link to="/products" className="desktop-only"><LiquidButton>Shop All Products</LiquidButton></Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {[
                { name: 'SyncSummit Hoodie', type: 'APPAREL', price: '₹1499', featured: true, stock: 'in_stock' },
                { name: 'Event T-Shirt', type: 'APPAREL', price: '₹599', featured: false, stock: 'in_stock' },
                { name: 'Classic Cap', type: 'ACCESSORY', price: '₹349', featured: false, stock: 'low_stock' }
              ].map((product, i) => (
                <div key={i} className="product-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <div style={{ height: '200px', background: 'var(--bg-elevated)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '80px', color: 'var(--text-primary)', opacity: 0.04, whiteSpace: 'nowrap', position: 'absolute' }}>
                      {product.name}
                    </span>
                    {product.featured && (
                      <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--violet)', padding: '3px 8px', borderRadius: '0 var(--radius-lg) 0 var(--radius-sm)', fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#fff' }}>
                        FEATURED
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <h3 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)', margin: 0 }}>{product.name}</h3>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)' }}>{product.type}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '20px', fontWeight: 500, color: 'var(--text-primary)' }}>{product.price}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: product.stock === 'in_stock' ? 'var(--success)' : 'var(--warning)' }} />
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: product.stock === 'in_stock' ? 'var(--success)' : 'var(--warning)' }}>
                          {product.stock === 'in_stock' ? 'In Stock' : 'Only 12 left'}
                        </span>
                      </div>
                    </div>
                    <MetalButton variant="primary" size="sm" style={{ width: '100%' }}>Buy Now</MetalButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: SPEAKER TEASER */}
        <section style={{ background: 'var(--bg-elevated)', padding: '120px clamp(20px, 5vw, 80px)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '64px' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Speakers · SyncSummit 2025</div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '40px', color: 'var(--text-primary)', margin: 0 }}>50 Voices. One Stage.</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '48px' }}>
              {[
                { name: 'Anirban Roy', role: 'Co-founder', company: 'Zerodha Alumni', init: 'AR' },
                { name: 'Priya Nair', role: 'VP Engineering', company: 'Flipkart', init: 'PN' },
                { name: 'Soumyadip Bose', role: 'Partner', company: 'Blume Ventures', init: 'SB' },
                { name: 'Kavitha Iyer', role: 'Product Lead', company: 'Razorpay', init: 'KI' }
              ].map((speaker, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                  <div style={{ width: '48px', height: '48px', background: 'var(--grad-subtle)', border: '1px solid var(--border-mid)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans', fontWeight: 600, fontSize: '16px', color: 'var(--lavender)' }}>
                    {speaker.init}
                  </div>
                  <h3 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginTop: '12px', marginBottom: '4px' }}>{speaker.name}</h3>
                  <div style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>{speaker.role}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--orchid)', marginTop: '4px' }}>{speaker.company}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--text-secondary)' }}>
              +46 more speakers
            </div>
          </div>
        </section>

        {/* SECTION 6: QUOTE / TESTIMONIAL */}
        <section style={{ background: 'var(--bg)', padding: '120px clamp(20px, 5vw, 80px)' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-40px', left: '-20px', fontFamily: 'Syne', fontWeight: 800, fontSize: '120px', color: 'var(--violet)', opacity: 0.2, lineHeight: 1 }}>
              &ldquo;
            </div>
            <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '28px', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.3, fontStyle: 'italic', margin: '0 0 32px', position: 'relative', zIndex: 1 }}>
              To any entrepreneur: if you want to do it, do it now. Do or do not. There is no try. It's not about ideas. It's about making ideas happen.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '1px', background: 'var(--border-mid)', marginBottom: '8px' }} />
              <span style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>Prof. Suranjan Das</span>
              <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>Vice Chancellor, Jadavpur University</span>
            </div>
          </div>
        </section>

        {/* SECTION 7: CTA BANNER */}
        <ScrollReveal style={{ background: 'var(--grad-primary)', padding: '80px clamp(20px, 5vw, 80px)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '48px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(32px, 5vw, 48px)', color: '#fff', lineHeight: 0.95, margin: 0 }}>Applications are open.</h2>
              <p style={{ fontFamily: 'DM Sans', fontSize: '16px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Limited seats. No extensions. Register before Nov 1.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Link to="/register"><MetalButton variant="default" style={{ color: '#000', background: '#fff', border: 'none' }}>Register Now — Free</MetalButton></Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>or</span>
                <Link to="/about"><LiquidButton style={{ color: '#fff', padding: 0 }}>Learn More</LiquidButton></Link>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </main>

      <Footer />
      <style>{`
        .desktop-only { display: none !important; }
        .hero-grid { grid-template-columns: 1fr !important; }
        .event-card:hover { border-color: rgba(237, 128, 233, 0.4) !important; transform: translateY(-4px); }
        .product-card:hover { border-color: rgba(237, 128, 233, 0.4) !important; transform: translateY(-4px); transition: all 0.25s ease; cursor: pointer; }
        @media (min-width: 1024px) {
          .desktop-only { display: flex !important; }
          .hero-grid { grid-template-columns: 55% 45% !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;
