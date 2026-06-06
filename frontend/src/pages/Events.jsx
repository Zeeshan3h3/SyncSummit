import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { MetalButton, LiquidButton } from '../components/ui/Buttons';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axiosInstance from '../api/axios';
import { io } from 'socket.io-client';

// SVGs
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const CalendarIcon = ({ color = "currentColor", size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const LocationIcon = ({ color = "currentColor", size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const TeamIcon = ({ color = "currentColor", size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const TrophyIcon = ({ color = "currentColor", size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 21h8"></path>
    <path d="M12 17v4"></path>
    <path d="M7 4h10"></path>
    <path d="M17 4v8a5 5 0 0 1-10 0V4"></path>
    <path d="M7 4H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h3"></path>
    <path d="M17 4h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3"></path>
  </svg>
);

const EmptyCalendarSearchIcon = () => (
  <svg width="52" height="52" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
    <rect x="12" y="14" width="40" height="40" rx="4" />
    <path d="M20 10v8M44 10v8M12 26h40" />
    <path d="M20 36h12M20 44h8" />
    <circle cx="44" cy="44" r="10" fill="var(--bg)" />
    <line x1="51" y1="51" x2="58" y2="58" />
  </svg>
);

const ErrorDisconnectedIcon = () => (
  <svg width="48" height="48" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
    <circle cx="16" cy="32" r="6" />
    <circle cx="48" cy="32" r="6" />
    <path d="M22 32h6M42 32h-6M31 28l2 8" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

// MOCK DATA
const MOCK_EVENTS = [
  { id: "evt-001", name: "NexusHack 2025", type: "HACKATHON", tagline: "48 hours. One problem. Ship or go home.", date: "Nov 15–16, 2025", venue: "Main Auditorium, JU", prize_pool: "₹50,000", capacity: 200, registered: 148, status: "OPEN", is_featured: true, team_size: "Solo / 2–4" },
  { id: "evt-002", name: "Consult IQ — Business Case Marathon", type: "CASE STUDY", tagline: "Crack real consulting cases under time pressure.", date: "Nov 15, 2025", venue: "Seminar Hall A, JU", prize_pool: "₹20,000", capacity: 80, registered: 79, status: "CLOSING SOON", is_featured: false },
  { id: "evt-003", name: "Launchpad — Early Stage Startup Pitch", type: "STARTUP PITCH", tagline: "Present your idea to a panel of angel investors.", date: "Nov 16, 2025", venue: "Innovation Lab, JU", prize_pool: "₹30,000 + investor meetings", capacity: 30, registered: 30, status: "FULL", is_featured: false },
  { id: "evt-004", name: "DesignDrift — Product Design Sprint", type: "WORKSHOP", tagline: "Go from zero to prototype in 6 hours.", date: "Nov 15, 2025", venue: "Design Studio, JU", prize_pool: null, capacity: 50, registered: 23, status: "OPEN", is_featured: false },
  { id: "evt-005", name: "Venture Voices — Founder Panel", type: "PANEL TALK", tagline: "Founders share what building really looks like.", date: "Nov 17, 2025", venue: "Open Amphitheatre, JU", prize_pool: null, capacity: 500, registered: 214, status: "OPEN", is_featured: false },
  { id: "evt-006", name: "CodeCraft — Competitive Programming", type: "HACKATHON", tagline: "DSA under pressure. Three hours. One winner.", date: "Nov 16, 2025", venue: "CS Department Lab, JU", prize_pool: "₹15,000", capacity: 120, registered: 120, status: "FULL", is_featured: false },
  { id: "evt-007", name: "Growth Lab — Digital Marketing Workshop", type: "WORKSHOP", tagline: "Learn what actually moves the numbers.", date: "Nov 15, 2025", venue: "Seminar Hall B, JU", prize_pool: null, capacity: 60, registered: 41, status: "OPEN", is_featured: false },
  { id: "evt-008", name: "SyncSummit Closing Ceremony", type: "PANEL TALK", tagline: "Award announcements. Reflections. What's next.", date: "Nov 17, 2025", venue: "Main Auditorium, JU", prize_pool: null, capacity: 1000, registered: 342, status: "OPEN", is_featured: false }
];

const EventCard = ({ event, index }) => {
  const isFull = event.status === 'FULL';
  const isEnded = event.status === 'COMPLETED';

  let statusBg = 'var(--bg-elevated)';
  let statusBorder = 'var(--border-mid)';
  let statusColor = 'var(--text-muted)';
  
  if (event.status === 'OPEN') {
    statusBg = 'rgba(34,197,94,0.1)';
    statusBorder = 'rgba(34,197,94,0.2)';
    statusColor = 'var(--success)';
  } else if (event.status === 'CLOSING SOON') {
    statusBg = 'rgba(245,158,11,0.1)';
    statusBorder = 'rgba(245,158,11,0.2)';
    statusColor = 'var(--warning)';
  } else if (event.status === 'FULL') {
    statusBg = 'rgba(239,68,68,0.1)';
    statusBorder = 'rgba(239,68,68,0.2)';
    statusColor = 'var(--error)';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.24) }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-mid)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column'
      }}
      className="event-card-hover"
      onClick={() => window.location.href = `/events/${event.id}`}
    >
      <Link to={`/events/${event.id}`} style={{ display: 'none' }} />

      {/* Row 1 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          background: 'var(--grad-subtle)',
          border: '1px solid var(--border-mid)',
          fontFamily: 'JetBrains Mono',
          fontSize: '10px',
          color: 'var(--orchid)',
          padding: '3px 8px',
          borderRadius: 'var(--radius-sm)'
        }}>
          {event.type}
        </div>
        <motion.div
          key={event.status}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          style={{
            background: statusBg,
            border: `1px solid ${statusBorder}`,
            fontFamily: 'JetBrains Mono',
            fontSize: '9px',
            color: statusColor,
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          {event.status}
        </motion.div>
      </div>

      {/* Name */}
      <h3 style={{
        fontFamily: 'Syne', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)',
        letterSpacing: '-0.01em', lineHeight: 1.3, marginTop: '14px', marginBottom: '0',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
      }}>
        {event.name}
      </h3>

      {/* Tagline */}
      <div style={{
        fontFamily: 'DM Sans', fontWeight: 400, fontSize: '13px', color: 'var(--text-secondary)',
        fontStyle: 'italic', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
      }}>
        {event.tagline}
      </div>

      {/* Meta Row */}
      <div style={{ marginTop: '14px', flexGrow: 1 }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
          <CalendarIcon size={14} color="var(--text-muted)" />
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-muted)' }}>{event.date}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <LocationIcon size={14} color="var(--text-muted)" />
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-muted)' }}>{event.venue}</span>
        </div>
        {event.prize_pool && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '10px' }}>
            <TrophyIcon size={14} color="var(--orchid)" />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--orchid)' }}>{event.prize_pool} prize pool</span>
          </div>
        )}
      </div>

      <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }} />

      {/* Bottom Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {isFull ? (
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--error)' }}>Sold Out</span>
          ) : isEnded ? (
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--text-muted)' }}>Event ended</span>
          ) : (
            <>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--orchid)' }}>{event.registered}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--text-muted)' }}> / {event.capacity} spots</span>
            </>
          )}
        </div>
        <div>
          {isFull ? (
            <button disabled style={{ opacity: 0.5, cursor: 'not-allowed', background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '4px', fontFamily: 'DM Sans', fontSize: '13px' }} onClick={(e) => e.stopPropagation()}>Full</button>
          ) : isEnded ? (
            <button disabled style={{ opacity: 0.5, cursor: 'not-allowed', background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '4px', fontFamily: 'DM Sans', fontSize: '13px' }} onClick={(e) => e.stopPropagation()}>Ended</button>
          ) : (
            <MetalButton variant="default" size="sm" onClick={(e) => { e.stopPropagation(); window.location.href = `/events/${event.id}`; }}>View Details</MetalButton>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const [activeFilter, setActiveFilter] = useState('All Events');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  const [sortOrder, setSortOrder] = useState('Date: Soonest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const categories = ["All Events", "Hackathon", "Case Study", "Startup Pitch", "Workshop", "Panel Talk"];
  const sortOptions = ["Date: Soonest", "Date: Latest", "Spots: Low to High", "Prize: High to Low"];

  // Fetch logic
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const res = await axiosInstance.get('/events');
        setEvents(res.data);
      } catch (err) {
        console.error("Failed to fetch events, using mock data", err);
        setEvents(MOCK_EVENTS); // Fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [retryCount]);

  // Socket
  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('registration_update', ({ event_id, new_count, status }) => {
      setEvents(prev => prev.map(evt => {
        if (evt.id === event_id) {
          return { ...evt, registered: new_count, status: status || evt.status };
        }
        return evt;
      }));
    });
    return () => socket.disconnect();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter & Sort
  const filteredEvents = useMemo(() => {
    let result = [...events];
    
    if (activeFilter !== 'All Events') {
      result = result.filter(e => e.type === activeFilter.toUpperCase());
    }

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(q) || 
        (e.tagline && e.tagline.toLowerCase().includes(q))
      );
    }

    const parsePrize = (str) => {
      if (!str) return 0;
      const match = str.match(/₹([\d,]+)/);
      return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
    };

    result.sort((a, b) => {
      if (sortOrder === 'Date: Soonest' || sortOrder === 'Date: Latest') {
        const dateA = new Date(a.date.split('–')[0] + ' 2025').getTime();
        const dateB = new Date(b.date.split('–')[0] + ' 2025').getTime();
        return sortOrder === 'Date: Soonest' ? dateA - dateB : dateB - dateA;
      }
      if (sortOrder === 'Spots: Low to High') {
        const spotsA = a.capacity - a.registered;
        const spotsB = b.capacity - b.registered;
        return spotsA - spotsB;
      }
      if (sortOrder === 'Prize: High to Low') {
        return parsePrize(b.prize_pool) - parsePrize(a.prize_pool);
      }
      return 0;
    });

    return result;
  }, [events, activeFilter, debouncedQuery, sortOrder]);

  const rawFeatured = filteredEvents.find(e => e.is_featured);
  const featuredEvent = (activeFilter === 'All Events' && !debouncedQuery.trim() && sortOrder === 'Date: Soonest' && rawFeatured) ? rawFeatured : null;
  const gridEvents = filteredEvents.filter(e => e !== featuredEvent);

  // Pagination
  const eventsPerPage = 9;
  const totalPages = Math.max(1, Math.ceil(gridEvents.length / eventsPerPage));
  
  useEffect(() => {
    setSearchParams({ page: currentPage.toString() });
  }, [currentPage, setSearchParams]);

  const currentGridEvents = gridEvents.slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage);

  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
      window.scrollTo({ top: document.getElementById('grid-section')?.offsetTop - 120, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, '...', totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
      }
    }
    return pages;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes blink-amber {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        .skeleton-shimmer {
          position: relative;
          overflow: hidden;
        }
        .skeleton-shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(211,211,255,0.04), transparent);
          animation: shimmer 1.5s ease-in-out infinite;
        }
        .event-card-hover:hover {
          transform: translateY(-4px);
          border-color: rgba(237,128,233,0.35) !important;
        }
        .scroll-hide::-webkit-scrollbar {
          display: none;
        }
        .scroll-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
      <Navbar />
      
      <main style={{ background: 'var(--bg)', minHeight: '100vh', paddingTop: '64px', color: 'var(--text-primary)' }}>
        
        {/* HEADER */}
        <section style={{ padding: '56px clamp(20px, 5vw, 80px) 40px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'flex-start' }}>
            <div>
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}
              >
                <div style={{ width: '24px', height: '1px', background: 'var(--orchid)', opacity: 0.4 }} />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--orchid)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>SyncSummit 2025 · All Events</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, duration: 0.4 }}
                style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(36px, 6vw, 64px)', color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 0.95, margin: '0 0 14px 0' }}
              >
                Events & Competitions
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.35 }}
                style={{ fontFamily: 'DM Sans', fontWeight: 400, fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '520px', margin: 0 }}
              >
                Hackathons, case studies, startup pitches, and workshops — find the events built for where you are in your journey.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-end', height: '100%' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ paddingRight: '20px' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', color: 'var(--text-primary)', fontWeight: 500 }}>12</div>
                  <div style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Events Total</div>
                </div>
                <div style={{ width: '1px', height: '36px', background: 'var(--border-mid)' }} />
                <div style={{ padding: '0 20px' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', color: 'var(--text-primary)', fontWeight: 500 }}>4</div>
                  <div style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categories</div>
                </div>
                <div style={{ width: '1px', height: '36px', background: 'var(--border-mid)' }} />
                <div style={{ paddingLeft: '20px' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', color: 'var(--text-primary)', fontWeight: 500 }}>Nov 15–17</div>
                  <div style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dates</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)', animation: 'blink-amber 1s infinite' }} />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--warning)' }}>Open registration closes Nov 1, 2025</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FILTER BAR */}
        <div style={{
          position: 'sticky', top: '64px', zIndex: 50, background: 'rgba(6, 4, 10, 0.9)', backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '14px clamp(20px, 5vw, 80px)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
            
            {/* Chips */}
            <div className="scroll-hide" style={{
              display: 'flex', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingRight: '20px', maxWidth: '100%'
            }}>
              {categories.map(cat => {
                const isActive = activeFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => { setActiveFilter(cat); setCurrentPage(1); }}
                    style={{
                      background: isActive ? 'var(--violet)' : 'var(--bg-elevated)',
                      border: `1px solid ${isActive ? 'transparent' : 'var(--border-mid)'}`,
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      borderRadius: 'var(--radius-full)',
                      fontFamily: 'JetBrains Mono', fontSize: '12px', padding: '6px 14px',
                      whiteSpace: 'nowrap', cursor: 'pointer',
                      transition: 'background 0.15s, color 0.15s, border-color 0.15s'
                    }}
                    onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.borderColor = '#4A3D66'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                    onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 'clamp(200px, 100%, 260px)' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-md)',
                    padding: '8px 12px 8px 36px', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-primary)', outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--violet)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(148,0,211,0.15)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-mid)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-md)',
                    padding: '8px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                    fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase'
                  }}
                >
                  SORT <ChevronDownIcon />
                </button>
                {isSortOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-md)', width: '180px',
                    maxHeight: '200px', overflowY: 'auto', zIndex: 60, padding: '4px'
                  }}>
                    {sortOptions.map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setSortOrder(opt); setIsSortOpen(false); setCurrentPage(1); }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left', background: sortOrder === opt ? 'rgba(237,128,233,0.1)' : 'transparent',
                          border: 'none', padding: '10px 12px', fontFamily: 'DM Sans', fontSize: '14px', 
                          color: sortOrder === opt ? 'var(--orchid)' : 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px'
                        }}
                        onMouseEnter={(e) => { if(sortOrder !== opt) e.currentTarget.style.background = 'var(--border)'; }}
                        onMouseLeave={(e) => { if(sortOrder !== opt) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: '40px clamp(20px, 5vw, 80px) 80px', maxWidth: '1200px', margin: '0 auto' }}>
          
          {error ? (
            <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <ErrorDisconnectedIcon />
              <div style={{ fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-secondary)' }}>Couldn't load events</div>
              <div style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Check your connection or try again.</div>
              <MetalButton variant="default" onClick={() => setRetryCount(c => c + 1)}>Retry</MetalButton>
            </div>
          ) : isLoading ? (
            // LOADING STATE
            <>
              {/* Featured Skeleton */}
              <div className="skeleton-shimmer" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-xl)', minHeight: '200px', marginBottom: '60px', padding: '36px 40px' }}>
                <div style={{ width: '70%', height: '20px', background: 'var(--border)', marginBottom: '16px', borderRadius: '4px' }} />
                <div style={{ width: '50%', height: '20px', background: 'var(--border)', marginBottom: '32px', borderRadius: '4px' }} />
                <div style={{ width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: 'auto' }} />
              </div>
              
              {/* Grid Skeletons */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '28px', color: 'var(--text-primary)', margin: 0 }}>All Events</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="skeleton-shimmer" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', padding: '24px', height: '260px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ width: '60%', height: '18px', background: 'var(--border)', borderRadius: '4px', marginBottom: '12px' }} />
                    <div style={{ width: '90%', height: '22px', background: 'var(--border)', borderRadius: '4px', marginBottom: '8px' }} />
                    <div style={{ width: '70%', height: '22px', background: 'var(--border)', borderRadius: '4px', marginBottom: '24px' }} />
                    <div style={{ width: '50%', height: '14px', background: 'var(--border)', borderRadius: '4px', marginBottom: '8px' }} />
                    <div style={{ width: '40%', height: '14px', background: 'var(--border)', borderRadius: '4px', marginBottom: '32px' }} />
                    <div style={{ width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: 'auto' }} />
                  </div>
                ))}
              </div>
            </>
          ) : filteredEvents.length === 0 ? (
            // EMPTY STATE
            <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <EmptyCalendarSearchIcon />
              {events.length === 0 ? (
                <>
                  <div style={{ fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-secondary)' }}>No events have been announced yet.</div>
                  <div style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>Check back closer to the event date.</div>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-secondary)' }}>No events match your search</div>
                  <div style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Try a different category or clear your search.</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <LiquidButton onClick={() => setSearchQuery('')}>Clear Search</LiquidButton>
                    <LiquidButton onClick={() => { setActiveFilter('All Events'); setSearchQuery(''); }}>Show All</LiquidButton>
                  </div>
                </>
              )}
            </div>
          ) : (
            // MAIN CONTENT
            <>
              {featuredEvent && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                  style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-xl)',
                    padding: '36px 40px', minHeight: '200px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px',
                    marginBottom: '60px', transition: 'border-color 0.25s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(237,128,233,0.35)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-mid)'}
                >
                  {/* Left Col */}
                  <div>
                    <div style={{ background: 'var(--grad-primary)', fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'white', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '4px 10px', borderRadius: 'var(--radius-sm)', display: 'inline-block', marginBottom: '14px' }}>
                      FEATURED
                    </div>
                    <br/>
                    <div style={{ background: 'var(--grad-subtle)', border: '1px solid var(--border-mid)', fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--orchid)', padding: '3px 8px', borderRadius: 'var(--radius-sm)', display: 'inline-block' }}>
                      {featuredEvent.type}
                    </div>
                    
                    <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 'clamp(28px, 4vw, 48px)', color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.0, margin: '10px 0 0 0' }}>
                      {featuredEvent.name}
                    </h2>
                    
                    <div style={{ fontFamily: 'DM Sans', fontWeight: 400, fontSize: '15px', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '8px' }}>
                      {featuredEvent.tagline}
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '16px' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <CalendarIcon size={16} color="var(--text-muted)" />
                        <span style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)' }}>{featuredEvent.date}</span>
                      </div>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <LocationIcon size={16} color="var(--text-muted)" />
                        <span style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)' }}>{featuredEvent.venue}</span>
                      </div>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <TeamIcon size={16} color="var(--text-muted)" />
                        <span style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)' }}>{featuredEvent.team_size}</span>
                      </div>
                      {featuredEvent.prize_pool && (
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          <TrophyIcon size={16} color="var(--orchid)" />
                          <span style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)' }}>{featuredEvent.prize_pool} prize pool</span>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>REGISTRATIONS</div>
                        <div>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--orchid)' }}>{featuredEvent.registered}</span>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-muted)' }}> / {featuredEvent.capacity}</span>
                          {(featuredEvent.registered / featuredEvent.capacity) > 0.9 && featuredEvent.status !== 'FULL' && (
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--warning)', marginLeft: '8px' }}>
                              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--warning)', animation: 'blink-amber 1s infinite', marginRight: '4px', verticalAlign: 'middle' }} />
                              Almost full!
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'var(--grad-primary)', width: `${Math.min(100, (featuredEvent.registered / featuredEvent.capacity) * 100)}%`, borderRadius: '9999px' }} />
                      </div>
                    </div>
                  </div>

                  {/* Right Col */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Link to={`/events/${featuredEvent.id}`} style={{ textDecoration: 'none' }}>
                        <MetalButton variant="primary">View & Register</MetalButton>
                      </Link>
                      <div style={{ marginTop: '10px' }}>
                        <Link to={`/events/${featuredEvent.id}#schedule`} style={{ textDecoration: 'none' }}>
                          <LiquidButton>See Schedule →</LiquidButton>
                        </Link>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: featuredEvent.status === 'OPEN' ? 'var(--success)' : featuredEvent.status === 'FULL' ? 'var(--error)' : 'var(--warning)' }} />
                        <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: featuredEvent.status === 'OPEN' ? 'var(--success)' : featuredEvent.status === 'FULL' ? 'var(--error)' : 'var(--warning)' }}>
                          {featuredEvent.status === 'OPEN' ? 'Registration open' : featuredEvent.status === 'FULL' ? 'Registration closed' : 'Closing soon'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* GRID */}
              <div id="grid-section" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '28px', color: 'var(--text-primary)', margin: 0 }}>All Events</h2>
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-full)', padding: '3px 10px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {filteredEvents.length} events
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {currentGridEvents.map((evt, idx) => (
                  <EventCard key={evt.id} event={evt} index={idx} />
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '48px', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{
                        background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', color: 'var(--text-primary)',
                        padding: '8px 12px', borderRadius: '4px', fontFamily: 'DM Sans', fontSize: '13px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        opacity: currentPage === 1 ? 0.4 : 1, transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { if(currentPage !== 1) e.currentTarget.style.borderColor = 'var(--text-muted)' }}
                      onMouseLeave={(e) => { if(currentPage !== 1) e.currentTarget.style.borderColor = 'var(--border-mid)' }}
                    >
                      ← Prev
                    </button>

                    {getPageNumbers().map((p, i) => (
                      <button
                        key={i}
                        onClick={() => typeof p === 'number' && handlePageChange(p)}
                        style={{
                          background: p === currentPage ? 'var(--violet)' : p === '...' ? 'transparent' : 'var(--bg-elevated)',
                          border: p === '...' ? 'none' : `1px solid ${p === currentPage ? 'var(--violet)' : 'var(--border-mid)'}`,
                          color: p === currentPage ? 'white' : 'var(--text-secondary)',
                          minWidth: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
                          fontFamily: 'JetBrains Mono', fontSize: '13px', cursor: p === '...' ? 'default' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      style={{
                        background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', color: 'var(--text-primary)',
                        padding: '8px 12px', borderRadius: '4px', fontFamily: 'DM Sans', fontSize: '13px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        opacity: currentPage === totalPages ? 0.4 : 1, transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { if(currentPage !== totalPages) e.currentTarget.style.borderColor = 'var(--text-muted)' }}
                      onMouseLeave={(e) => { if(currentPage !== totalPages) e.currentTarget.style.borderColor = 'var(--border-mid)' }}
                    >
                      Next →
                    </button>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)' }}>
                    Showing {(currentPage - 1) * eventsPerPage + 1}–{Math.min(currentPage * eventsPerPage, gridEvents.length)} of {gridEvents.length} events
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
};

export default Events;
