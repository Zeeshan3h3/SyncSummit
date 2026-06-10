import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/authStore';
import { MetalButton, LiquidButton } from '../components/ui/Buttons';
import axiosInstance from '../api/axios';
// SVGs
const GridIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const CalendarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const BagIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>;
const PersonIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const MessageIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;

const TABS = [
  { id: 'Overview', label: 'Overview', icon: GridIcon },
  { id: 'Events', label: 'My Events', icon: CalendarIcon },
  { id: 'Orders', label: 'My Orders', icon: BagIcon },
  { id: 'Profile', label: 'Profile Settings', icon: PersonIcon },
  { id: 'Support', label: 'Support', icon: MessageIcon },
];

// Removed MOCK data for DB integration

const StatusBadge = ({ status }) => {
  let color = 'var(--text-muted)';
  if (status === 'CONFIRMED' || status === 'DELIVERED') color = 'var(--success)';
  if (status === 'PENDING' || status === 'PROCESSING') color = 'var(--warning)';
  if (status === 'SHIPPED') color = 'var(--violet)';
  if (status === 'CANCELLED') color = 'var(--error)';

  return (
    <span style={{ 
      fontFamily: 'JetBrains Mono', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.06em',
      color: color, background: `color-mix(in srgb, ${color} 12%, transparent)`, 
      border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
      padding: '3px 8px', borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap'
    }}>
      {status}
    </span>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Overview');
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      try {
         const [ordersRes, eventsRes] = await Promise.all([
            axiosInstance.get('/orders/myorders').catch(() => ({ data: null })),
            axiosInstance.get('/events/myevents').catch(() => ({ data: null }))
         ]);
         if (ordersRes.data) setOrders(ordersRes.data);
         if (eventsRes.data) setEvents(eventsRes.data);
      } catch (err) {
         console.error('Failed to fetch user data', err);
      }
    };
    fetchUserData();
  }, [user]);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [eventToCancel, setEventToCancel] = useState(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'User',
    phone: '',
    institution: '',
    year: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    const socket = io('http://localhost:5000', { transports: ['websocket'], autoConnect: false });
    socket.connect();
    
    // Subscribe to user room
    socket.emit('join_room', `user:${user.id || 'me'}`);
    
    socket.on('order_update', ({ order_id, new_status }) => {
      setOrders(prev => prev.map(o => o.id === order_id ? { ...o, status: new_status } : o));
      toast.success(`Order ${order_id} is now ${new_status}`, {
        style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderLeft: '4px solid var(--violet)', fontFamily: 'DM Sans', fontSize: '14px' }
      });
    });

    return () => socket.disconnect();
  }, [user]);

  const handleSignOut = async () => {
    try {
      // await axios.post('/api/auth/logout');
      logout();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelEvent = () => {
    if (!eventToCancel) return;
    setEvents(prev => prev.filter(e => e.id !== eventToCancel.id));
    toast.success('Registration cancelled.', {
      style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderLeft: '4px solid var(--success)', fontFamily: 'DM Sans', fontSize: '14px' }
    });
    setIsCancelModalOpen(false);
    setEventToCancel(null);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    toast.success('Profile updated successfully!', {
      style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderLeft: '4px solid var(--success)', fontFamily: 'DM Sans', fontSize: '14px' }
    });
  };

  // Safe fallback if user is null before redirect
  const safeUser = user || { name: 'Guest', email: 'guest@syncsummit.com', role: 'ATTENDEE' };
  const initials = safeUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // Overview Tab Component
  const OverviewTab = () => (
    <div className="tab-content" style={{ animation: 'fadeIn 0.3s' }}>
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '28px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Overview</h2>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </header>

      <div className="stats-grid" style={{ display: 'grid', gap: '20px', marginBottom: '48px' }}>
        {[
          { label: 'Events Registered', value: events.length },
          { label: 'Orders Placed', value: orders.length },
          { label: 'Days to Summit', value: '154', extra: 'Happening soon', dot: 'var(--warning)' },
          { label: 'Badge Status', value: 'Confirmed' }
        ].map((stat, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '36px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1 }}>{stat.value}</span>
            <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>{stat.label}</span>
            {stat.extra && (
              <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stat.dot }} />
                <span style={{ fontFamily: 'DM Sans', fontSize: '12px', color: stat.dot }}>{stat.extra}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <section style={{ marginBottom: '48px' }}>
        <h3 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>Your Registered Events</h3>
        {events.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-md)', padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CalendarIcon />
            <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)', margin: '12px 0 16px' }}>You haven't registered for any events</p>
            <MetalButton variant="primary" size="sm" onClick={() => navigate('/')}>Browse Events</MetalButton>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {events.map(evt => (
              <div key={evt.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '3px', height: '36px', background: 'var(--violet)', borderRadius: '2px' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{evt.name}</h4>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-muted)' }}>{evt.date} · {evt.venue}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <StatusBadge status={evt.status} />
                  <MetalButton variant="default" size="sm" onClick={() => navigate(`/events/${evt.id}`)}>View Details</MetalButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>Recent Orders</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {orders.slice(0, 3).map(ord => (
            <div key={ord.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-muted)' }}>{ord.id}</span>
                <span style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{ord.item}</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)' }}>{ord.date}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', color: 'var(--orchid)', fontWeight: 500 }}>₹{ord.price.toLocaleString()}</span>
                <StatusBadge status={ord.status} />
              </div>
            </div>
          ))}
        </div>
        <LiquidButton onClick={() => setActiveTab('Orders')} style={{ padding: '8px 16px', fontSize: '13px' }}>View All Orders</LiquidButton>
      </section>
    </div>
  );

  // My Events Tab Component
  const EventsTab = () => (
    <div className="tab-content" style={{ animation: 'fadeIn 0.3s' }}>
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '28px', color: 'var(--text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          My Events
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', background: 'var(--bg-elevated)', color: 'var(--orchid)', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-mid)' }}>{events.length}</span>
        </h2>
        <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Events you are registered for at SyncSummit 2025</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {events.map(evt => (
          <div key={evt.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center' }}>
              QR Code
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <StatusBadge status={evt.status} />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-muted)' }}>{evt.regId}</span>
              </div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>{evt.name}</h3>
              <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                {evt.date} · {evt.venue}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px' }}>
              <MetalButton variant="default" disabled={true} style={{ width: '100%' }}>Download Pass</MetalButton>
              <MetalButton variant="error" size="sm" style={{ width: '100%' }} onClick={() => { setEventToCancel(evt); setIsCancelModalOpen(true); }}>Cancel Registration</MetalButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Orders Tab Component
  const OrdersTab = () => (
    <div className="tab-content" style={{ animation: 'fadeIn 0.3s' }}>
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '28px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>My Orders</h2>
        <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Track and manage your merchandise orders</p>
      </header>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-mid)', background: 'var(--bg-elevated)' }}>
              {['Order ID', 'Item', 'Qty', 'Price', 'Status', 'Date', 'Action'].map(h => (
                <th key={h} style={{ padding: '16px', fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(ord => (
              <tr key={ord.id} className="table-row" style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}>
                <td style={{ padding: '16px', fontFamily: 'JetBrains Mono', fontSize: '14px', color: 'var(--text-primary)' }}>{ord.id}</td>
                <td style={{ padding: '16px', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-primary)' }}>{ord.item}</td>
                <td style={{ padding: '16px', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-primary)' }}>{ord.qty}</td>
                <td style={{ padding: '16px', fontFamily: 'JetBrains Mono', fontSize: '14px', color: 'var(--orchid)' }}>₹{ord.price}</td>
                <td style={{ padding: '16px' }}><StatusBadge status={ord.status} /></td>
                <td style={{ padding: '16px', fontFamily: 'JetBrains Mono', fontSize: '14px', color: 'var(--text-muted)' }}>{ord.date}</td>
                <td style={{ padding: '16px' }}>
                  <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'DM Sans', fontSize: '13px' }} onMouseOver={e => e.currentTarget.style.color = 'var(--violet)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Profile Settings Component
  const ProfileTab = () => (
    <div className="tab-content" style={{ animation: 'fadeIn 0.3s' }}>
      <header style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '28px', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Profile Settings</h2>
        <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>Manage your personal information and security</p>
      </header>

      <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
        {/* Left Form */}
        <div>
          <h3 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '20px', color: 'var(--text-primary)', marginBottom: '24px' }}>Edit Profile</h3>
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name</label>
              <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: '15px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone Number</label>
              <input type="tel" value={profileForm.phone} placeholder="+91" onChange={e => setProfileForm({...profileForm, phone: e.target.value})} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: '15px', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Institution</label>
              <input type="text" value={profileForm.institution} placeholder="E.g., NIT Durgapur" onChange={e => setProfileForm({...profileForm, institution: e.target.value})} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: '15px', outline: 'none' }} />
            </div>
            <MetalButton type="submit" style={{ marginTop: '8px', background: 'rgba(34,197,94,0.1)', color: 'var(--success)', border: '1px solid rgba(34,197,94,0.2)' }}>Save Changes</MetalButton>
          </form>
        </div>

        {/* Right Info */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <h3 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '20px', color: 'var(--text-primary)', marginBottom: '24px' }}>Account Info</h3>
          
          <table style={{ width: '100%', marginBottom: '24px' }}>
            <tbody>
              {Object.entries({
                'Email': safeUser.email,
                'Registered On': 'October 01, 2025',
                'Role': safeUser.role,
                'Account Status': 'Active'
              }).map(([key, val]) => (
                <tr key={key}>
                  <td style={{ padding: '8px 0', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-muted)' }}>{key}</td>
                  <td style={{ padding: '8px 0', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-primary)', textAlign: 'right' }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <MetalButton variant="default" style={{ width: '100%' }}>Change Email</MetalButton>
            <MetalButton variant="default" style={{ width: '100%' }} onClick={() => setIsUpdatingPassword(!isUpdatingPassword)}>Update Password</MetalButton>
            
            <AnimatePresence>
              {isUpdatingPassword && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <input type="password" placeholder="Current Password" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: '14px', outline: 'none' }} />
                    <input type="password" placeholder="New Password" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: '14px', outline: 'none' }} />
                    <input type="password" placeholder="Confirm Password" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: '14px', outline: 'none' }} />
                    <MetalButton style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--success)', border: '1px solid rgba(34,197,94,0.2)' }} onClick={() => { setIsUpdatingPassword(false); toast.success('Password updated'); }}>Save Password</MetalButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* MOBILE TAB NAV */}
      <div className="mobile-tab-nav" style={{ display: 'none', position: 'sticky', top: '64px', zIndex: 40, background: 'rgba(5, 5, 5, 0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', overflowX: 'auto', padding: '0 16px' }} className="no-scrollbar">
          {TABS.map(t => (
            <div 
              key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ position: 'relative', padding: '16px', fontFamily: 'JetBrains Mono', fontSize: '13px', whiteSpace: 'nowrap', cursor: 'pointer', color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              {t.label}
              {activeTab === t.id && (
                <motion.div layoutId="mobileTabIndicator" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--violet)' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        {/* DESKTOP SIDEBAR */}
        <aside className="desktop-sidebar" style={{ width: '240px', position: 'sticky', top: '64px', height: 'calc(100vh - 64px)', background: 'var(--bg-card)', borderRight: '1px solid var(--border)', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--grad-subtle)', border: '1px solid var(--border-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans', fontWeight: 600, fontSize: '16px', color: 'var(--lavender)' }}>
              {initials}
            </div>
            <h3 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', margin: '10px 0 4px 0' }}>{safeUser.name}</h3>
            <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 10px 0', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{safeUser.email}</p>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', textTransform: 'uppercase', color: 'var(--orchid)', background: 'rgba(237,128,233,0.1)', border: '1px solid rgba(237,128,233,0.2)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>{safeUser.role}</span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 20px 0' }} />

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            {TABS.map(t => {
              const isActive = activeTab === t.id;
              const Icon = t.icon;
              return (
                <div 
                  key={t.id} onClick={() => setActiveTab(t.id)}
                  style={{ position: 'relative', height: '40px', display: 'flex', alignItems: 'center', padding: isActive ? '0 10px' : '0 12px', borderRadius: 'var(--radius-md)', fontFamily: 'DM Sans', fontWeight: 500, fontSize: '14px', cursor: 'pointer', zIndex: 1, color: isActive ? 'var(--violet)' : 'var(--text-secondary)', borderLeft: isActive ? '2px solid var(--violet)' : '2px solid transparent', transition: 'color 0.15s, padding 0.15s' }}
                  onMouseOver={e => !isActive && (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseOut={e => !isActive && (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  {isActive && <motion.div layoutId="sidebarIndicator" style={{ position: 'absolute', inset: 0, background: 'rgba(148,0,211,0.15)', borderRadius: 'var(--radius-md)', zIndex: -1, left: '-2px' }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: isActive ? 'var(--violet)' : 'var(--text-muted)', transition: 'color 0.15s' }} className="nav-icon">
                    <Icon />
                  </div>
                  {t.label}
                </div>
              );
            })}
          </nav>

          <MetalButton variant="error" size="sm" style={{ width: '100%', marginTop: '20px' }} onClick={handleSignOut}>Sign Out</MetalButton>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="dashboard-content" style={{ flex: 1, overflowY: 'auto', padding: '32px clamp(20px, 3vw, 48px)' }}>
          {activeTab === 'Overview' && <OverviewTab />}
          {activeTab === 'Events' && <EventsTab />}
          {activeTab === 'Orders' && <OrdersTab />}
          {activeTab === 'Profile' && <ProfileTab />}
          {activeTab === 'Support' && (
            <div className="tab-content" style={{ animation: 'fadeIn 0.3s' }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '28px', color: 'var(--text-primary)', margin: '0 0 16px 0' }}>Support</h2>
              <p style={{ fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-secondary)' }}>Need help? Email us at <a href="mailto:support@syncsummit.com" style={{ color: 'var(--orchid)' }}>support@syncsummit.com</a>.</p>
            </div>
          )}
        </main>
      </div>

      {/* CANCELLATION MODAL */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setIsCancelModalOpen(false)} />
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', padding: '32px', maxWidth: '400px', width: '100%', position: 'relative', zIndex: 101, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <h3 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 12px 0' }}>Cancel registration?</h3>
              <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 24px 0', lineHeight: 1.5 }}>This cannot be undone. Your spot for <strong>{eventToCancel?.name}</strong> will be released immediately.</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <MetalButton variant="error" style={{ flex: 1 }} onClick={handleCancelEvent}>Yes, Cancel</MetalButton>
                <MetalButton variant="default" style={{ flex: 1 }} onClick={() => setIsCancelModalOpen(false)}>Keep My Spot</MetalButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .table-row:hover { background: var(--bg-elevated) !important; }
        
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .profile-layout { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) {
          .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-tab-nav { display: block !important; }
          .dashboard-content { padding: 24px 16px !important; }
        }
      `}} />
    </div>
  );
}
