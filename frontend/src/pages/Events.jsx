import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { MetalButton, LiquidButton } from '../components/ui/Buttons';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axiosInstance from '../api/axios';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

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

const MOCK_EVENTS = [];

// ── Edit Modal ────────────────────────────────────────────────────────────────
const EventEditModal = ({ event, onClose, onSaved, userRole }) => {
  const [form, setForm] = useState({
    name: event.name || '',
    type: event.type || '',
    date: event.date ? event.date.split('T')[0] : '',
    venue: event.venue || '',
    capacity: event.capacity || '',
    price: event.price || '',
    status: event.status || 'OPEN',
    tagline: event.tagline || '',
    description: event.description || '',
    prize_pool: event.prize_pool || '',
    is_featured: event.is_featured || false,
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (thumbnail) fd.append('thumbnail', thumbnail);
      images.forEach(img => fd.append('images', img));

      const res = await axiosInstance.put(`/event/${event._id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Event updated!');
      onSaved(res.data);
      onClose();
    } catch (err) {
      toast.error('Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    background: 'var(--bg)',
    border: '1px solid var(--border-mid)',
    borderRadius: '6px',
    padding: '10px 12px',
    color: 'var(--text-primary)',
    fontFamily: 'DM Sans',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 24 }}
        transition={{ duration: 0.25 }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', padding: '32px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Admin · Edit Event</div>
            <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '22px', color: 'var(--text-primary)', margin: 0 }}>Edit Event</h2>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: '6px', color: 'var(--text-muted)', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Event Name *</label>
              <input style={inp} required value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Type / Category</label>
              <input style={inp} placeholder="e.g. Hackathon" value={form.type} onChange={e => setForm({...form, type: e.target.value})} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Date</label>
              <input type="date" style={inp} value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
            <div><label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Venue</label>
              <input style={inp} value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: userRole === 'superadmin' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '12px' }}>
            <div><label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Capacity</label>
              <input type="number" style={inp} value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} /></div>
            {userRole === 'superadmin' && (
              <div><label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--warning)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Price ₹ 🔒 Superadmin</label>
                <input type="number" style={inp} value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
            )}
            <div><label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Status</label>
              <select style={inp} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option>OPEN</option><option>CLOSING SOON</option><option>FULL</option><option>COMPLETED</option>
              </select></div>
          </div>
          <div><label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Tagline</label>
            <input style={inp} value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} /></div>
          <div><label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Prize Pool</label>
            <input style={inp} placeholder="e.g. ₹50,000" value={form.prize_pool} onChange={e => setForm({...form, prize_pool: e.target.value})} /></div>
          <div><label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Description</label>
            <textarea style={{...inp, height: '80px', resize: 'vertical'}} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>New Thumbnail</label>
              <input type="file" accept="image/*" onChange={e => setThumbnail(e.target.files[0])} style={{ ...inp, padding: '8px' }} />
              {event.thumbnail && <div style={{ marginTop: '6px', fontFamily: 'DM Sans', fontSize: '11px', color: 'var(--text-muted)' }}>Current: {event.thumbnail.split('/').pop()}</div>}
            </div>
            <div>
              <label style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>New Gallery Images</label>
              <input type="file" accept="image/*" multiple onChange={e => setImages(Array.from(e.target.files))} style={{ ...inp, padding: '8px' }} />
              {event.images?.length > 0 && <div style={{ marginTop: '6px', fontFamily: 'DM Sans', fontSize: '11px', color: 'var(--text-muted)' }}>{event.images.length} existing image(s)</div>}
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} />
            Mark as Featured Event
          </label>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: '6px', color: 'var(--text-secondary)', fontFamily: 'DM Sans', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 2, padding: '12px', background: 'var(--warning)', border: 'none', borderRadius: '6px', color: '#000', fontFamily: 'DM Sans', fontWeight: 600, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ── EventCard ─────────────────────────────────────────────────────────────────
const EventCard = ({ event, index, userRole, onEdit, onDelete }) => {
  const isFull = event.status === 'FULL';
  const isEnded = event.status === 'COMPLETED';
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  const isSuperAdmin = userRole === 'superadmin';

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

  const BACKEND = 'http://localhost:3000';
  const thumbUrl = event.thumbnail ? (event.thumbnail.startsWith('http') ? event.thumbnail : `${BACKEND}${event.thumbnail}`) : null;

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
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
      className="event-card-hover"
      onClick={() => window.location.href = `/events/${event._id || event.id}`}
    >
      {/* Thumbnail */}
      {thumbUrl ? (
        <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
          <img src={thumbUrl} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none'; e.target.parentElement.style.background = 'var(--bg-elevated)'; }} />
        </div>
      ) : (
        <div style={{ height: '6px', background: 'var(--grad-primary)' }} />
      )}

      {/* Admin Actions Overlay */}
      {isAdmin && (
        <div
          onClick={e => e.stopPropagation()}
          style={{ position: 'absolute', top: thumbUrl ? '8px' : '12px', right: '8px', display: 'flex', gap: '6px', zIndex: 10 }}
        >
          <button
            onClick={e => { e.stopPropagation(); onEdit(event); }}
            title="Edit Event"
            style={{ background: 'rgba(245,158,11,0.9)', border: 'none', borderRadius: '6px', padding: '5px 10px', color: '#000', fontFamily: 'JetBrains Mono', fontSize: '10px', fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(4px)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            ✏ Edit
          </button>
          {isSuperAdmin && (
            <button
              onClick={e => { e.stopPropagation(); onDelete(event); }}
              title="Delete Event"
              style={{ background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: '6px', padding: '5px 10px', color: '#fff', fontFamily: 'JetBrains Mono', fontSize: '10px', fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(4px)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              🗑
            </button>
          )}
        </div>
      )}

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Link to={`/events/${event._id || event.id}`} style={{ display: 'none' }} />

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
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-muted)' }}>
              {event.date ? (isNaN(new Date(event.date).getTime()) ? event.date : new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })) : 'TBA'}
            </span>
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
              <MetalButton variant="default" size="sm" onClick={(e) => { e.stopPropagation(); window.location.href = `/events/${event._id || event.id}`; }}>View Details</MetalButton>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const { user } = useAuthStore();
  const userRole = user?.role || null;

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Admin modal state
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteConfirmEvent, setDeleteConfirmEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [activeFilter, setActiveFilter] = useState('All Events');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  const [sortOrder, setSortOrder] = useState('Date: Soonest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const categories = ["All Events", "Hackathon", "Case Study", "Startup Pitch", "Workshop", "Panel Talk"];
  const sortOptions = ["Date: Soonest", "Date: Latest", "Spots: Low to High", "Prize: High to Low"];

  // Admin handlers
  const handleEventSaved = (updatedEvent) => {
    setEvents(prev => prev.map(e => (e._id === updatedEvent._id ? updatedEvent : e)));
  };

  const handleDelete = async () => {
    if (!deleteConfirmEvent) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/event/${deleteConfirmEvent._id}`);
      setEvents(prev => prev.filter(e => e._id !== deleteConfirmEvent._id));
      toast.success('Event deleted');
      setDeleteConfirmEvent(null);
    } catch (err) {
      toast.error('Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };



  // Fetch logic
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const res = await axiosInstance.get('/event');
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
        if (evt._id === event_id || evt.id === event_id) {
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
      result = result.filter(e => (e.type || '').toUpperCase() === activeFilter.toUpperCase());
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
        let dateA = new Date(a.date || '').getTime();
        if (isNaN(dateA) && a.date) dateA = new Date(a.date.split('–')[0] + ' 2025').getTime();
        let dateB = new Date(b.date || '').getTime();
        if (isNaN(dateB) && b.date) dateB = new Date(b.date.split('–')[0] + ' 2025').getTime();
        
        // Handle still invalid dates (e.g. TBA)
        if (isNaN(dateA)) dateA = 9999999999999; 
        if (isNaN(dateB)) dateB = 9999999999999;
        
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
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', color: 'var(--text-primary)', fontWeight: 500 }}>{events.length}</div>
                  <div style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Events Total</div>
                </div>
                <div style={{ width: '1px', height: '36px', background: 'var(--border-mid)' }} />
                <div style={{ padding: '0 20px' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', color: 'var(--text-primary)', fontWeight: 500 }}>{new Set(events.map(e => e.type)).size}</div>
                  <div style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Categories</div>
                </div>
                <div style={{ width: '1px', height: '36px', background: 'var(--border-mid)' }} />
                <div style={{ paddingLeft: '20px' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {events.length > 0 ? (() => {
                      const sorted = [...events].filter(e => e.date).sort((a,b) => {
                        let da = new Date(a.date).getTime();
                        let db = new Date(b.date).getTime();
                        if (isNaN(da)) da = new Date(a.date.split('–')[0] + ' 2025').getTime();
                        if (isNaN(db)) db = new Date(b.date.split('–')[0] + ' 2025').getTime();
                        return da - db;
                      });
                      if (sorted.length === 0) return 'TBA';
                      let start = new Date(sorted[0].date);
                      if (isNaN(start.getTime())) start = new Date(sorted[0].date.split('–')[0] + ' 2025');
                      let end = new Date(sorted[sorted.length - 1].date);
                      if (isNaN(end.getTime())) end = new Date(sorted[sorted.length - 1].date.split('–')[0] + ' 2025');
                      
                      if (isNaN(start.getTime()) || isNaN(end.getTime())) return sorted[0].date;
                      const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      const endStr = start.getTime() === end.getTime() ? '' : ` – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                      return `${startStr}${endStr}`;
                    })() : 'TBA'}
                  </div>
                  <div style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dates</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)', animation: 'blink-amber 1s infinite' }} />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--warning)' }}>Registrations currently open</span>
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
                        <span style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)' }}>
                          {featuredEvent.date ? (isNaN(new Date(featuredEvent.date).getTime()) ? featuredEvent.date : new Date(featuredEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })) : 'TBA'}
                        </span>
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
                      <Link to={`/events/${featuredEvent._id || featuredEvent.id}`} style={{ textDecoration: 'none' }}>
                        <MetalButton variant="primary">View & Register</MetalButton>
                      </Link>
                      <div style={{ marginTop: '10px' }}>
                        <Link to={`/events/${featuredEvent._id || featuredEvent.id}#schedule`} style={{ textDecoration: 'none' }}>
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
                  <EventCard
                    key={evt._id || evt.id || idx}
                    event={evt}
                    index={idx}
                    userRole={userRole}
                    onEdit={setEditingEvent}
                    onDelete={setDeleteConfirmEvent}
                  />
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

      {/* Edit Modal */}
      <AnimatePresence>
        {editingEvent && (
          <EventEditModal
            event={editingEvent}
            onClose={() => setEditingEvent(null)}
            onSaved={handleEventSaved}
            userRole={userRole}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirmEvent && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              style={{ background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 'var(--radius-lg)', padding: '32px', maxWidth: '420px', width: '100%', textAlign: 'center' }}
            >
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)', marginBottom: '8px' }}>Delete Event?</h3>
              <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirmEvent.name}</strong> will be permanently removed. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setDeleteConfirmEvent(null)} style={{ flex: 1, padding: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: '6px', color: 'var(--text-secondary)', fontFamily: 'DM Sans', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, padding: '12px', background: 'var(--error)', border: 'none', borderRadius: '6px', color: '#fff', fontFamily: 'DM Sans', fontWeight: 600, fontSize: '14px', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1 }}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Events;
