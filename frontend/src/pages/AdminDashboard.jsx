import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import {
  LayoutDashboard, CalendarDays, Box, ShoppingCart, Users, Megaphone,
  RefreshCw, TrendingUp, TrendingDown, Edit2, Eye, Trash2, Send, ChevronDown, Check, X, Search
} from 'lucide-react';
import axiosInstance from '../api/axios.js';
import useAuthStore from '../store/authStore.js';
import Navbar from '../components/Navbar.jsx';
import { MetalButton, LiquidButton } from '../components/ui/Buttons.jsx';

// Removed MOCK data for DB integration

// Reusable Status Badge for Admin Tables
const AdminStatusBadge = ({ status }) => {
  let color = 'var(--text-muted)';
  if (status === 'OPEN' || status === 'ACTIVE' || status === 'DELIVERED') color = 'var(--success, #10b981)';
  if (status === 'CLOSED' || status === 'CANCELLED' || status === 'SOLD OUT' || status === 'SUSPENDED') color = 'var(--error)';
  if (status === 'COMPLETED' || status === 'SHIPPED') color = 'var(--violet)';
  if (status === 'PROCESSING') color = 'var(--warning, #f5a623)';

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: 'var(--radius-full)',
      border: `1px solid ${status === 'DRAFT' || status === 'USER' ? 'var(--border)' : color}`,
      backgroundColor: status === 'DRAFT' || status === 'USER' ? 'transparent' : `${color}1A`,
      color: status === 'DRAFT' || status === 'USER' ? 'var(--text-muted)' : color,
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase'
    }}>
      {status}
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    regTrend: 0,
    totalRevenue: 0,
    revTrend: 0,
    activeEvents: 0,
    totalEvents: 0,
    pendingOrders: 0
  });

  // Table States
  const [events, setEvents] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);

  // Fetch logic
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes, ordersRes] = await Promise.all([
           axiosInstance.get('/admin/stats').catch(() => ({ data: null })),
           axiosInstance.get('/admin/users').catch(() => ({ data: null })),
           axiosInstance.get('/admin/orders').catch(() => ({ data: null }))
        ]);
        
        if (statsRes.data) setStats(prev => ({...prev, ...statsRes.data}));
        if (usersRes.data) setUsers(usersRes.data);
        if (ordersRes.data) setOrders(ordersRes.data);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  // Modals & UI States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingStockId, setEditingStockId] = useState(null);
  const [newStockValue, setNewStockValue] = useState('');

  // Socket setup
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true
    });

    socket.emit('join_admin');

    socket.on('admin_stats_update', (newStats) => setStats(prev => ({ ...prev, ...newStats })));
    socket.on('admin_activity', (activity) => {
      setActivities(prev => [activity, ...prev].slice(0, 10));
    });

    return () => socket.disconnect();
  }, []);

  // Handlers
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Dashboard synced');
    }, 600);
  };

  const handleStockUpdate = (id) => {
    // PATCH /api/admin/products/:id/stock
    setProducts(prev => prev.map(p => p._id === id ? { ...p, stock: parseInt(newStockValue) || 0, status: parseInt(newStockValue) > 0 ? 'ACTIVE' : 'SOLD OUT' } : p));
    setEditingStockId(null);
    toast.success('Stock updated');
  };

  const handleOrderStatusUpdate = (id, newStatus) => {
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
    toast.success('Order status updated');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'events', label: 'Events', icon: <CalendarDays size={18} /> },
    { id: 'products', label: 'Products', icon: <Box size={18} /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
    { id: 'users', label: 'Users', icon: <Users size={18} /> },
    { id: 'broadcast', label: 'Broadcast', icon: <Megaphone size={18} /> },
  ];

  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '28px', margin: 0 }}>Admin Dashboard</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
            Last updated just now
          </span>
          <LiquidButton onClick={handleRefresh} style={{ height: '36px', padding: '0 16px' }}>
            <RefreshCw size={14} className={loading ? "spin" : ""} style={{ marginRight: '8px' }} />
            Refresh
          </LiquidButton>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        {[
          { label: 'Total Registrations', value: stats.totalRegistrations, trend: stats.regTrend },
          { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, trend: stats.revTrend },
          { label: 'Active Events', value: `${stats.activeEvents} / ${stats.totalEvents}`, trend: null },
          { label: 'Pending Orders', value: stats.pendingOrders, trend: null, warning: stats.pendingOrders > 10 }
        ].map((kpi, idx) => (
          <div key={idx} style={{
            backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-mid)',
            borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px'
          }}>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)' }}>
              {kpi.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ 
                fontFamily: '"JetBrains Mono", monospace', fontSize: '28px', color: kpi.warning ? 'var(--warning, #f5a623)' : 'var(--text-primary)' 
              }}>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={kpi.value}
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'inline-block' }}
                  >
                    {kpi.value}
                  </motion.span>
                </AnimatePresence>
              </div>
              {kpi.trend !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: kpi.trend > 0 ? 'var(--success, #10b981)' : 'var(--error)' }}>
                  {kpi.trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 600 }}>
                    {Math.abs(kpi.trend)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area (Charts + Activity) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* LEFT: Charts */}
        <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Line Chart */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <h3 style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '18px', marginBottom: '24px', color: 'var(--text-primary)' }}>
              Registrations Over Time
            </h3>
            
            <div style={{ position: 'relative', height: '220px', width: '100%' }}>
              <svg width="100%" height="100%" preserveAspectRatio="none">
                {/* Horizontal Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line key={i} x1="0" y1={`${i * 25}%`} x2="100%" y2={`${i * 25}%`} stroke="var(--border)" strokeDasharray="4 4" strokeWidth="1" />
                ))}
                
                {/* Line and Area (Mock 7-day data) */}
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--violet)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="var(--violet)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon points="0,200 0,160 16.6%,140 33.3%,150 50%,110 66.6%,70 83.3%,40 100%,0 100%,200" fill="url(#areaGradient)" />
                <polyline points="0,160 16.6%,140 33.3%,150 50%,110 66.6%,70 83.3%,40 100%,0" fill="none" stroke="var(--violet)" strokeWidth="2" />
                
                {/* Data Points */}
                {['0,160', '16.6%,140', '33.3%,150', '50%,110', '66.6%,70', '83.3%,40', '100%,0'].map((point, i) => {
                  const [x, y] = point.split(',');
                  return (
                    <circle key={i} cx={x} cy={y} r="4" fill="var(--orchid)" stroke="var(--bg-card)" strokeWidth="2" />
                  );
                })}
              </svg>
              {/* X-axis labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>Oct 1</span><span>Oct 2</span><span>Oct 3</span><span>Oct 4</span><span>Oct 5</span><span>Oct 6</span><span>Oct 7</span>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <h3 style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '18px', marginBottom: '24px', color: 'var(--text-primary)' }}>
              Revenue by Category
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Apparel', val: 24500, percent: 80 },
                { label: 'Accessories', val: 12300, percent: 45 },
                { label: 'Digital', val: 5000, percent: 20 },
                { label: 'Bundles', val: 4000, percent: 15 }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', color: 'var(--text-primary)' }}>₹{item.val.toLocaleString()}</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${item.percent}%`, background: 'var(--grad-primary)', borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT: Recent Activity */}
        <div style={{ flex: '1 1 35%', minWidth: '300px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', padding: '24px', height: '100%' }}>
            <h3 style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '18px', marginBottom: '24px', color: 'var(--text-primary)' }}>
              Recent Activity
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <AnimatePresence>
                {activities.map((act) => {
                  let dotColor = 'var(--text-muted)';
                  if (act.type === 'success') dotColor = 'var(--success, #10b981)';
                  if (act.type === 'warning') dotColor = 'var(--warning, #f5a623)';
                  if (act.type === 'error') dotColor = 'var(--error)';
                  if (act.type === 'info') dotColor = '#3b82f6';

                  return (
                    <motion.div 
                      key={act._id}
                      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                      style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}
                    >
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dotColor, marginTop: '6px', flexShrink: 0 }}></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                          {act.text}
                        </span>
                        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                          {act.time}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  const renderEvents = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '24px' }}>Manage Events</h3>
        <MetalButton onClick={() => setIsEventModalOpen(true)}>Create New Event</MetalButton>
      </div>

      <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
              {['Event Name', 'Type', 'Date', 'Capacity', 'Registered', 'Status', 'Actions'].map((h, i) => (
                <th key={i} style={{ padding: '16px', fontFamily: '"DM Sans", sans-serif', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-primary)' }}>{ev.name}</td>
                <td style={{ padding: '16px', fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>{ev.type}</td>
                <td style={{ padding: '16px', fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-secondary)' }}>{ev.date}</td>
                <td style={{ padding: '16px', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', color: 'var(--text-primary)' }}>{ev.capacity}</td>
                <td style={{ padding: '16px', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', color: 'var(--orchid)' }}>{ev.registered}</td>
                <td style={{ padding: '16px' }}><AdminStatusBadge status={ev.status} /></td>
                <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                  <button className="icon-btn"><Edit2 size={16} /></button>
                  <button className="icon-btn" onClick={() => window.open(`/events/${ev._id}`, '_blank')}><Eye size={16} /></button>
                  <button className="icon-btn"><Megaphone size={16} /></button>
                  <button className="icon-btn delete"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '24px' }}>Manage Products</h3>
        <MetalButton>Add Product</MetalButton>
      </div>

      <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
              {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h, i) => (
                <th key={i} style={{ padding: '16px', fontFamily: '"DM Sans", sans-serif', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-primary)' }}>{p.name}</td>
                <td style={{ padding: '16px', fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-secondary)' }}>{p.category}</td>
                <td style={{ padding: '16px', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', color: 'var(--text-primary)' }}>₹{p.price}</td>
                
                <td style={{ padding: '16px' }} className="stock-cell">
                  {editingStockId === p._id ? (
                    <input 
                      type="number" autoFocus value={newStockValue} 
                      onChange={e => setNewStockValue(e.target.value)}
                      onBlur={() => handleStockUpdate(p._id)}
                      onKeyDown={e => e.key === 'Enter' && handleStockUpdate(p._id)}
                      style={{ width: '60px', padding: '4px', background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--orchid)', borderRadius: '4px', outline: 'none' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => { setEditingStockId(p._id); setNewStockValue(p.stock); }}>
                      {p.stock === 0 ? <span style={{ color: 'var(--error)' }}>0</span> : p.stock <= 5 ? (
                        <><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning, #f5a623)' }} />{p.stock}</>
                      ) : (
                        <><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success, #10b981)' }} />{p.stock}</>
                      )}
                      <Edit2 size={12} className="edit-icon" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                    </div>
                  )}
                </td>

                <td style={{ padding: '16px' }}><AdminStatusBadge status={p.status} /></td>
                <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                  <button className="icon-btn"><Edit2 size={16} /></button>
                  <button className="icon-btn delete"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '24px' }}>All Orders</h3>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search ID or email..." style={{
            padding: '10px 16px 10px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-mid)',
            background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontFamily: '"DM Sans", sans-serif', fontSize: '14px', outline: 'none'
          }} />
        </div>
      </div>

      <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
              {['Order ID', 'Customer', 'Product', 'Qty', 'Amount', 'Status', 'Date'].map((h, i) => (
                <th key={i} style={{ padding: '16px', fontFamily: '"DM Sans", sans-serif', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', color: 'var(--orchid)' }}>{o._id}</td>
                <td style={{ padding: '16px', fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-primary)' }}>
                  <div>{o.customer}</div><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.email}</div>
                </td>
                <td style={{ padding: '16px', fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-secondary)' }}>{o.product}</td>
                <td style={{ padding: '16px', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', color: 'var(--text-primary)' }}>{o.qty}</td>
                <td style={{ padding: '16px', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', color: 'var(--text-primary)' }}>₹{o.amount}</td>
                
                <td style={{ padding: '16px' }}>
                  <div style={{ position: 'relative', display: 'inline-block' }} className="status-dropdown">
                    <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AdminStatusBadge status={o.status} /> <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    {/* Simplified inline dropdown mock */}
                    <select 
                      value={o.status} 
                      onChange={(e) => handleOrderStatusUpdate(o._id, e.target.value)}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    >
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </td>

                <td style={{ padding: '16px', fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>{o.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '24px' }}>User Management</h3>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search users..." style={{
            padding: '10px 16px 10px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-mid)',
            background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontFamily: '"DM Sans", sans-serif', fontSize: '14px', outline: 'none'
          }} />
        </div>
      </div>

      <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
              {['User', 'Email', 'Role', 'Registered', 'Status', 'Actions'].map((h, i) => (
                <th key={i} style={{ padding: '16px', fontFamily: '"DM Sans", sans-serif', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-primary)' }}>{u.name}</td>
                <td style={{ padding: '16px', fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '16px' }}>
                  <AdminStatusBadge status={u.role.toUpperCase()} />
                </td>
                <td style={{ padding: '16px', fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>{u.registered}</td>
                <td style={{ padding: '16px' }}><AdminStatusBadge status={u.status} /></td>
                <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                  <MetalButton style={{ padding: '4px 12px', fontSize: '12px' }}>Profile</MetalButton>
                  {u.role === 'user' && <MetalButton style={{ padding: '4px 12px', fontSize: '12px', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>Suspend</MetalButton>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBroadcast = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <h3 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '24px' }}>Send Announcement</h3>
      
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>Target Audience</label>
          <select style={{
            padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-mid)',
            background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontFamily: '"DM Sans", sans-serif', fontSize: '15px', outline: 'none'
          }}>
            <option>All Users</option>
            <option>Event Registrants (NexusHack)</option>
            <option>All Admins</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>Subject</label>
          <input type="text" placeholder="e.g. Schedule Update for NexusHack" style={{
            padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-mid)',
            background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontFamily: '"DM Sans", sans-serif', fontSize: '15px', outline: 'none'
          }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>Message</label>
          <textarea placeholder="Write your announcement here..." style={{
            padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-mid)',
            background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontFamily: '"DM Sans", sans-serif', fontSize: '15px', outline: 'none', minHeight: '150px', resize: 'vertical'
          }} />
          <div style={{ textAlign: 'right', fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', color: 'var(--text-muted)' }}>0/500</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" style={{ accentColor: 'var(--orchid)' }} />
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-secondary)' }}>Show Preview</span>
          </label>
        </div>

        <MetalButton primary style={{ width: '100%', marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '8px', borderColor: 'var(--success, #10b981)', color: 'var(--success, #10b981)' }} onClick={() => toast.success('Broadcast sent successfully')}>
          <Send size={16} /> Send to All Users
        </MetalButton>

      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', paddingTop: '64px' }}>
      <Navbar />
      
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        
        {/* SIDEBAR */}
        <aside style={{
          width: '240px',
          borderRight: '1px solid var(--border)',
          backgroundColor: 'var(--bg-elevated)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}>
          {/* Admin Identity */}
          <div style={{ padding: '32px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              border: '1px solid rgba(237,128,233,0.4)',
              background: 'rgba(237,128,233,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '16px', color: 'var(--orchid)'
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                {user?.name || 'Admin User'}
              </span>
              <span style={{
                fontFamily: '"JetBrains Mono", monospace', fontSize: '10px', fontWeight: 600,
                color: 'var(--orchid)', backgroundColor: 'rgba(237,128,233,0.12)', padding: '2px 6px', borderRadius: '4px', marginTop: '4px', width: 'max-content'
              }}>
                ADMIN
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ padding: '24px 0', display: 'flex', flexDirection: 'column' }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '16px 24px', position: 'relative',
                  backgroundColor: isActive ? 'rgba(237,128,233,0.05)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontFamily: '"DM Sans", sans-serif', fontSize: '15px', fontWeight: isActive ? 600 : 400,
                  borderLeft: isActive ? '3px solid var(--orchid)' : '3px solid transparent',
                  transition: 'all 0.2s', textAlign: 'left'
                }}>
                  <div style={{ color: isActive ? 'var(--orchid)' : 'var(--text-muted)' }}>{tab.icon}</div>
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '40px clamp(20px, 4vw, 64px)' }}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'events' && renderEvents()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'broadcast' && renderBroadcast()}
        </main>

      </div>

      {/* CREATE EVENT MODAL (Simplified Mock) */}
      <AnimatePresence>
        {isEventModalOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{
                backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-xl)',
                width: '100%', maxWidth: '560px', padding: '40px', maxHeight: '90vh', overflowY: 'auto', position: 'relative'
              }}
            >
              <button onClick={() => setIsEventModalOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', color: 'var(--text-muted)' }}><X size={20} /></button>
              <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: '24px', marginBottom: '24px' }}>Create New Event</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input type="text" placeholder="Event Name" style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border-mid)', color: 'var(--text-primary)', outline: 'none' }} />
                <textarea placeholder="Description" style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border-mid)', color: 'var(--text-primary)', outline: 'none', minHeight: '100px' }} />
                <div style={{ display: 'flex', gap: '16px' }}>
                  <input type="date" style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border-mid)', color: 'var(--text-primary)', outline: 'none' }} />
                  <input type="date" style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border-mid)', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                  <MetalButton style={{ flex: 1 }} onClick={() => setIsEventModalOpen(false)}>Cancel</MetalButton>
                  <MetalButton primary style={{ flex: 1 }} onClick={() => { setIsEventModalOpen(false); toast.success('Event created successfully'); }}>Create Event</MetalButton>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Basic Styles for standardizing table buttons */}
      <style>{`
        .icon-btn {
          width: 32px; height: 32px; display: flex; alignItems: center; justifyContent: center;
          background: transparent; border: 1px solid transparent; border-radius: 6px;
          color: var(--text-secondary); transition: all 0.2s; cursor: pointer;
        }
        .icon-btn:hover { background: var(--bg-elevated); color: var(--text-primary); }
        .icon-btn.delete:hover { background: rgba(239, 68, 68, 0.1); color: var(--error); border-color: rgba(239, 68, 68, 0.2); }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
