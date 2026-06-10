import { useState, useEffect  } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Clock from 'lucide-react/dist/esm/icons/clock';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Users from 'lucide-react/dist/esm/icons/users';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import Share2 from 'lucide-react/dist/esm/icons/share-2';
import axiosInstance from '../api/axios.js';
import useAuthStore from '../store/authStore.js';
import Navbar from '../components/Navbar.jsx';
import { MetalButton, LiquidButton } from '../components/ui/Buttons.jsx';
import { getDeterministicImage } from '../utils/imageUtils';



const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Form State
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Check if user is already registered (Assuming we might fetch this later, or we know from /api/events/registered)
  const [isRegistered, setIsRegistered] = useState(false);

  // Fetch Event Data
  useEffect(() => {
    const controller = new AbortController();
    const fetchEvent = async () => {
      try {
        setLoading(true);
        // Real API fetch
        const response = await axiosInstance.get(`/events/${id}`, { signal: controller.signal });
        setEvent(response.data.event || response.data);
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.warn('API fetch failed:', err);
          toast.error('Failed to load event details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();

    return () => {
      controller.abort();
    };
  }, [id]);

  // Check registration status
  useEffect(() => {
    if (user && event) {
      const checkRegistration = async () => {
        try {
          const response = await axiosInstance.get('/events/registered');
          const registeredEvents = response.data || [];
          if (registeredEvents.some(e => e._id === event._id)) {
            setIsRegistered(true);
          }
        } catch (error) {
          console.warn('Failed to check registration status', error);
        }
      };
      checkRegistration();
    }
  }, [user, event]);

  // Socket.io for Real-time Capacity Updates
  useEffect(() => {
    if (!event) return;

    // Connect to global socket (or specific event room)
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true
    });

    socket.emit('join_event', event._id);

    socket.on('registration_update', (data) => {
      if (data.eventId === event._id) {
        setEvent(prev => ({ ...prev, registered: data.registeredCount }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [event?._id]);

  const handleRegisterClick = () => {
    if (!user) {
      toast.error('Please sign in to register');
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }
    setIsModalOpen(true);
    setRegistrationSuccess(false);
    setAgreedToTerms(false);
  };

  const handleAddMember = () => {
    if (!newMemberEmail || !newMemberEmail.includes('@')) {
      toast.error('Enter a valid email');
      return;
    }
    if (teamMembers.length >= 3) {
      toast.error('Maximum 3 additional members allowed');
      return;
    }
    if (teamMembers.includes(newMemberEmail)) {
      toast.error('Member already added');
      return;
    }
    setTeamMembers([...teamMembers, newMemberEmail]);
    setNewMemberEmail('');
  };

  const handleRemoveMember = (email) => {
    setTeamMembers(teamMembers.filter(m => m !== email));
  };

  const confirmRegistration = async () => {
    if (!agreedToTerms) {
      toast.error('You must agree to the terms');
      return;
    }
    if (event.teamSize.toLowerCase().includes('team') && !teamName) {
      toast.error('Team name is required');
      return;
    }

    setRegistering(true);
    try {
      // POST /api/events/:id/register
      // If backend fails, we mock success after 1.5s
      await axiosInstance.post(`/events/${event._id}/register`, {
        teamName,
        teamMembers
      });
      
      setRegistrationSuccess(true);
      setIsRegistered(true);
      setEvent(prev => ({ ...prev, registered: prev.registered + 1 })); // Optimistic update
      toast.success('Registration Confirmed!');
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('You are already registered');
        setIsRegistered(true);
        setIsModalOpen(false);
      } else if (err.response?.status === 403) {
        toast.error('Event is now full');
        setIsModalOpen(false);
      } else {
        toast.error('Failed to register for the event');
        console.error('Registration API failed:', err);
      }
    } finally {
      setRegistering(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied!');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Loading event details...</div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const isFull = event.registered >= event.capacity;
  const fillPercentage = Math.min((event.registered / event.capacity) * 100, 100);
  const isAlmostFull = fillPercentage > 90 && !isFull;
  
  // Category Badge Color
  let badgeColor = 'var(--bg-card)';
  switch(event.type) {
    case 'HACKATHON': badgeColor = 'var(--violet)'; break;
    case 'CASE STUDY': badgeColor = 'var(--orchid)'; break;
    case 'PITCH': badgeColor = 'var(--success, #10b981)'; break;
    case 'WORKSHOP': badgeColor = 'var(--warning, #f5a623)'; break;
    default: badgeColor = 'var(--violet)';
  }

  const requiresTeam = event.teamSize?.toLowerCase().includes('team') || event.team_size?.toLowerCase().includes('team') || false;
  const displayTeamSize = event.teamSize || event.team_size || 'Solo';
  const displayPrizePool = event.prizePool || event.prize_pool || 'TBA';
  const displaySubtitle = event.subtitle || event.tagline || '';

  let displayDate = event.date || event.createdAt || 'TBA';
  let displayTime = event.time || 'TBA';

  let dateToParse = event.date;
  if (!dateToParse || isNaN(new Date(dateToParse).getTime())) {
    dateToParse = event.createdAt;
  }

  if (dateToParse) {
    const parsed = new Date(dateToParse);
    if (!isNaN(parsed.getTime())) {
      displayDate = parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      if (!event.time) {
        displayTime = parsed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
    }
  }

  const BACKEND = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3000';
  const getImageUrl = (path, index = 0) => {
    if (!path) return getDeterministicImage(event.name + (index ? `-${index}` : ''), 1200, 600);
    // Handle cases where the path might already be an absolute URL
    if (path.startsWith('http')) return path;
    return `${BACKEND}${path}`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', paddingBottom: '80px' }}>
      <Navbar />
      
      {/* HERO SECTION */}
      <section style={{
        minHeight: '420px',
        backgroundColor: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border)',
        padding: '144px clamp(20px, 5vw, 80px) 48px', // 64px nav + 80px pad
        display: 'flex',
        flexDirection: 'column',
        gap: '48px'
      }}>
        
        {/* Desktop 2-column container */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '48px',
          alignItems: 'start',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%'
        }}>
          
          {/* LEFT: Text Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Breadcrumb & Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ 
                fontFamily: '"JetBrains Mono", monospace', 
                fontSize: '12px', 
                color: 'var(--text-muted)' 
              }}>
                <Link to="/events" style={{ color: 'inherit', textDecoration: 'none' }} className="hover-white">Events</Link>
                {' / '}
                <span style={{ color: 'var(--text-secondary)' }}>{event.type}</span>
              </span>
              
              <span style={{
                backgroundColor: badgeColor,
                color: 'white',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '10px',
                textTransform: 'uppercase',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)'
              }}>
                {event.type}
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: '"Syne", sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(36px, 5vw, 64px)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              lineHeight: 0.95,
              margin: 0
            }}>
              {event.name}
            </h1>

            {/* Subtitle */}
            {displaySubtitle && (
              <p style={{
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 400,
                fontSize: '17px',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
                margin: 0
              }}>
                {displaySubtitle}
              </p>
            )}

            {/* Organized By */}
            <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>
                Organized by{' '}
              </span>
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                JU E-Cell · SyncSummit 2025
              </span>
            </div>
          </div>

          {/* RIGHT: Event Meta Card */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-mid)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Rows */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { icon: <Calendar size={16} />, text: displayDate, font: '"JetBrains Mono", monospace' },
                { icon: <Clock size={16} />, text: displayTime },
                { icon: <MapPin size={16} />, text: event.venue || 'TBA' },
                { icon: <Users size={16} />, text: displayTeamSize },
                { icon: <Trophy size={16} />, text: displayPrizePool, color: 'var(--orchid)' }
              ].map((row, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '36px',
                  borderBottom: idx === 4 ? 'none' : '1px solid var(--border)',
                }}>
                  <div style={{ color: 'var(--text-muted)', marginRight: '10px', display: 'flex' }}>
                    {row.icon}
                  </div>
                  <span style={{
                    fontFamily: row.font || '"DM Sans", sans-serif',
                    fontSize: '14px',
                    color: row.color || 'var(--text-primary)'
                  }}>
                    {row.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Registration Capacity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Registrations
                </span>
                {isAlmostFull && (
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--warning, #f5a623)' }}>
                    Almost Full!
                  </span>
                )}
              </div>
              
              {/* Progress Bar */}
              <div style={{
                height: '6px',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
              }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${fillPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: 'var(--grad-primary)',
                    borderRadius: 'var(--radius-full)'
                  }}
                />
              </div>

              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '12px' }}>
                <span style={{ color: 'var(--orchid)' }}>{event.registered}</span>
                <span style={{ color: 'var(--text-muted)' }}> / {event.capacity} registered</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div>
              {isRegistered ? (
                <MetalButton 
                  style={{ width: '100%', pointerEvents: 'none', borderColor: 'var(--success, #10b981)', color: 'var(--success, #10b981)' }}
                >
                  <Check size={16} style={{ marginRight: '8px' }} />
                  Registered
                </MetalButton>
              ) : isFull ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <MetalButton style={{ width: '100%', opacity: 0.5, pointerEvents: 'none' }}>
                    Registration Full
                  </MetalButton>
                  <LiquidButton style={{ width: '100%' }}>
                    Join Waitlist
                  </LiquidButton>
                </div>
              ) : (
                <MetalButton 
                  primary 
                  style={{ width: '100%' }}
                  onClick={handleRegisterClick}
                >
                  Register for this Event
                </MetalButton>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* EVENT DETAILS SECTION */}
      <section style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '48px clamp(20px, 5vw, 80px)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '48px'
      }}>
        
        {/* MAIN CONTENT (Approx 65%) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '64px', gridColumn: '1 / -1' }}>
          {/* We use media query logic indirectly via grid, but to enforce 65/35 we'll use a flex container inside */}
        </div>
      </section>
      
      {/* Re-structuring to get 65% / 35% on desktop */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 clamp(20px, 5vw, 80px)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '48px'
      }}>
        
        {/* LEFT COLUMN - Main Content */}
        <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', gap: '64px', minWidth: '300px' }}>
          
          {/* Media Gallery */}
          {(event.thumbnail || (event.images && event.images.length > 0)) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {event.thumbnail && (
                <div style={{
                  width: '100%',
                  maxHeight: '500px',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-mid)'
                }}>
                  <img 
                    src={getImageUrl(event.thumbnail)} 
                    alt={`${event.name} thumbnail`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              
              {event.images && event.images.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  {event.images.map((img, idx) => (
                    <div key={idx} style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: '1px solid var(--border-mid)'
                    }}>
                      <img 
                        src={getImageUrl(img, idx)} 
                        alt={`${event.name} gallery image ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          transition: 'transform 0.3s ease'
                        }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* About */}
          <div>
            <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '28px', marginBottom: '24px' }}>
              About this Event
            </h2>
            <div style={{ 
              fontFamily: '"DM Sans", sans-serif', 
              fontSize: '15px', 
              color: 'var(--text-secondary)', 
              lineHeight: 1.7,
              whiteSpace: 'pre-line' 
            }}>
              {event.description}
            </div>
          </div>

          {/* Problem Statement */}
          <div>
            <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '28px', marginBottom: '24px' }}>
              Problem Statement
            </h2>
            <div style={{
              backgroundColor: 'var(--bg-elevated)',
              borderLeft: '3px solid var(--violet)',
              padding: '20px 24px',
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '15px',
              color: 'var(--text-secondary)',
              lineHeight: 1.7
            }}>
              {event.type === 'HACKATHON' 
                ? 'Problem statement released 72 hours before the event. Keep an eye on your dashboard.'
                : 'The specific case/problem will be provided on the spot to ensure fairness across all participating teams.'
              }
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '28px', marginBottom: '32px' }}>
              Event Schedule
            </h2>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Vertical Line */}
              <div style={{
                position: 'absolute',
                left: '84px',
                top: '6px',
                bottom: '0',
                width: '2px',
                backgroundColor: 'var(--border-mid)'
              }}></div>
              
              {event.schedule && event.schedule.length > 0 ? event.schedule.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                  <div style={{ 
                    width: '80px', 
                    fontFamily: '"JetBrains Mono", monospace', 
                    fontSize: '12px', 
                    color: 'var(--orchid)',
                    paddingTop: '2px',
                    textAlign: 'right',
                    paddingRight: '16px'
                  }}>
                    {item.time}
                  </div>
                  
                  {/* Circle Connector */}
                  <div style={{
                    position: 'absolute',
                    left: '80px',
                    top: '6px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--violet)',
                    border: '2px solid var(--bg)',
                    zIndex: 2
                  }}></div>
                  
                  <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                      {item.activity}
                    </div>
                    <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {item.details}
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ paddingLeft: '24px', fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-secondary)' }}>
                  Schedule will be announced soon.
                </div>
              )}
            </div>
          </div>

          {/* Prizes */}
          {event.prizes && event.prizes.length > 0 && (
            <div>
              <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '28px', marginBottom: '32px' }}>
                Prize Pool
              </h2>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-end', 
                justifyContent: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                marginTop: '40px'
              }}>
                {event.prizes.map((prize, idx) => {
                  let height = '160px';
                  let borderColor = 'var(--border-mid)';
                  
                  if (prize.place === '1st') {
                    height = '200px';
                    borderColor = 'rgba(237,128,233,0.4)'; // Orchid
                  } else if (prize.place === '2nd') {
                    height = '180px';
                    borderColor = 'rgba(148,0,211,0.3)'; // Violet
                  }

                  return (
                    <div key={idx} style={{
                      flex: '1 1 200px',
                      height: height,
                      backgroundColor: 'var(--bg-card)',
                      border: `1px solid ${borderColor}`,
                      borderRadius: 'var(--radius-lg)',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      boxShadow: prize.place === '1st' ? '0 8px 32px rgba(237,128,233,0.05)' : 'none'
                    }}>
                      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        {prize.place} Place
                      </div>
                      <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '32px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {prize.amount}
                      </div>
                      <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {prize.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - Sidebar */}
        <div style={{ flex: '1 1 30%', display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '300px' }}>
          
          {/* Organizers */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-mid)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '20px', margin: 0 }}>Organizers</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {event.organizers && event.organizers.length > 0 ? event.organizers.map((org, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 0',
                  borderBottom: idx === event.organizers.length - 1 ? 'none' : '1px solid var(--border)'
                }}>
                  <div style={{
                    width: '36px', height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-mid)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '12px',
                    color: 'var(--text-primary)'
                  }}>
                    {org.initials}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                      {org.name}
                    </span>
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {org.role}
                    </span>
                  </div>
                </div>
              )) : (
                <div style={{ padding: '16px 0', fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  To be announced.
                </div>
              )}
            </div>

            <LiquidButton style={{ width: '100%', marginTop: '8px' }}>
              Contact Organizer
            </LiquidButton>
          </div>

          {/* Sponsors */}
          {event.sponsors && event.sponsors.length > 0 && (
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-mid)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '20px', margin: 0 }}>Sponsors</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {event.sponsors.map((sponsor, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                      {sponsor.name}
                    </span>
                    <span style={{ 
                      fontFamily: '"JetBrains Mono", monospace', 
                      fontSize: '10px', 
                      color: 'var(--orchid)',
                      backgroundColor: 'rgba(237,128,233,0.1)',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {sponsor.tier}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-mid)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '20px', margin: 0 }}>Share this event</h3>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={copyToClipboard} style={{
                flex: 1, height: '44px', borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                color: 'var(--text-secondary)', transition: 'all 0.2s', cursor: 'pointer'
              }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                <Share2 size={16} /> <span style={{ fontSize: '13px' }}>Copy Link</span>
              </button>
              
              <button style={{
                width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)', transition: 'all 0.2s', cursor: 'pointer'
              }} onMouseOver={e => e.currentTarget.style.color = '#1DA1F2'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </button>

              <button style={{
                width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)', transition: 'all 0.2s', cursor: 'pointer'
              }} onMouseOver={e => e.currentTarget.style.color = '#0077B5'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* REGISTRATION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-mid)',
                borderRadius: 'var(--radius-xl)',
                width: '100%',
                maxWidth: '520px',
                padding: '32px',
                position: 'relative',
                boxShadow: '0 24px 48px rgba(0,0,0,0.4)'
              }}
            >
              {!registrationSuccess ? (
                <>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    style={{ position: 'absolute', top: '24px', right: '24px', color: 'var(--text-muted)' }}
                  >
                    <X size={20} />
                  </button>

                  <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '24px', marginBottom: '8px' }}>
                    Confirm Registration
                  </h2>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '32px' }}>
                    {event.name} · {event.date}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    {requiresTeam ? (
                      <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>Team Name *</label>
                          <input 
                            type="text" 
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="e.g. Innovators"
                            style={{
                              width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
                              backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
                              color: 'var(--text-primary)', fontFamily: '"DM Sans", sans-serif', fontSize: '15px', outline: 'none'
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <label style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>
                            Team Members ({teamMembers.length}/3)
                          </label>
                          
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                              type="email" 
                              value={newMemberEmail}
                              onChange={(e) => setNewMemberEmail(e.target.value)}
                              placeholder="Member email"
                              onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                              style={{
                                flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-md)',
                                backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-mid)',
                                color: 'var(--text-primary)', fontFamily: '"DM Sans", sans-serif', fontSize: '15px', outline: 'none'
                              }}
                            />
                            <MetalButton onClick={handleAddMember} style={{ padding: '0 20px' }}>Add</MetalButton>
                          </div>

                          {teamMembers.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                              {teamMembers.map((email, idx) => (
                                <div key={idx} style={{
                                  backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                  borderRadius: 'var(--radius-full)', padding: '6px 12px',
                                  display: 'flex', alignItems: 'center', gap: '8px',
                                  fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-secondary)'
                                }}>
                                  {email}
                                  <button onClick={() => handleRemoveMember(email)} style={{ color: 'var(--text-muted)', display: 'flex' }}>
                                    <X size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div style={{
                        backgroundColor: 'var(--bg-elevated)',
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: '15px',
                        color: 'var(--text-primary)'
                      }}>
                        Registering as <strong>{user?.name}</strong>
                      </div>
                    )}

                    {/* Terms Checkbox */}
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        style={{ marginTop: '4px', accentColor: 'var(--violet)', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        I understand the event rules, code of conduct, and agree to the terms of participation.
                      </span>
                    </label>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                      <MetalButton 
                        style={{ flex: 1, backgroundColor: 'var(--bg-elevated)' }} 
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </MetalButton>
                      <MetalButton 
                        primary 
                        style={{ flex: 1 }} 
                        onClick={confirmRegistration}
                        disabled={registering || !agreedToTerms || (requiresTeam && !teamName)}
                      >
                        {registering ? 'Confirming...' : 'Confirm Registration'}
                      </MetalButton>
                    </div>

                  </div>
                </>
              ) : (
                // SUCCESS STATE
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 0' }}>
                  <motion.div 
                    initial={{ pathLength: 0, scale: 0 }}
                    animate={{ pathLength: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                    style={{
                      width: '80px', height: '80px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#10b981',
                      marginBottom: '24px'
                    }}
                  >
                    <Check size={40} strokeWidth={3} />
                  </motion.div>
                  
                  <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '28px', color: 'var(--success, #10b981)', marginBottom: '16px' }}>
                    You're in!
                  </h2>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Registration confirmed for <strong>{event.name}</strong>.
                  </p>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                    Your badge will be available in your Dashboard.
                  </p>

                  <MetalButton primary style={{ width: '100%' }} onClick={() => navigate('/dashboard')}>
                    View My Events
                  </MetalButton>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EventDetail;
