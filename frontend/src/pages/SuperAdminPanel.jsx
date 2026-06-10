import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MetalButton } from '../components/ui/Buttons';
import useAuthStore from '../store/authStore';
import { io } from 'socket.io-client';
import axiosInstance from '../api/axios';
import { ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  in: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  out: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

// --- SYSTEM TAB ---
const SystemTab = () => {
  const [stats, setStats] = useState({
    users: 0, events: 0, products: 0, revenue: 0, orders: 0
  });
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    // Fetch stats from backend
    const fetchStats = async () => {
      try {
        const { data } = await axiosInstance.get('/admin/stats');
        setStats(data);
      } catch (err) {
        toast.error('Failed to fetch system stats');
      }
    };
    fetchStats();

    // Mock socket logic
    const socket = io('http://localhost:5000');
    socket.emit('join_superadmin');
    socket.on('admin_connections', (data) => {
      setConnections(data);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Health Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        {[
          { label: 'Server Status', value: 'ONLINE', dot: 'var(--success)' },
          { label: 'Database', value: 'Connected / 12ms', dot: 'var(--success)' },
          { label: 'Socket.io', value: `${connections.length} Active`, dot: 'var(--warning)' },
          { label: 'Payment Gateway', value: 'Razorpay: Live', dot: 'var(--success)' }
        ].map((c, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
            padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            <div style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>{c.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'JetBrains Mono', fontSize: '16px', color: 'var(--text-primary)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.dot, boxShadow: `0 0 8px ${c.dot}` }} />
              {c.value}
            </div>
          </div>
        ))}
      </div>

      {/* Stats Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-mid)' }}>
              <th style={{ padding: '16px 24px', fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>METRIC</th>
              <th style={{ padding: '16px 24px', fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>VALUE</th>
            </tr>
          </thead>
          <tbody>
            {[
              { m: 'Registered Users', v: stats.users },
              { m: 'Total Events', v: stats.events },
              { m: 'Total Products', v: stats.products },
              { m: 'Total Orders', v: stats.orders },
              { m: 'Total Revenue', v: `₹${stats.revenue.toLocaleString()}` }
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-mid)' }}>
                <td style={{ padding: '16px 24px', fontFamily: 'JetBrains Mono', fontSize: '14px', color: 'var(--text-secondary)' }}>{row.m}</td>
                <td style={{ padding: '16px 24px', fontFamily: 'JetBrains Mono', fontSize: row.m === 'Total Revenue' ? '32px' : '16px', color: row.m === 'Total Revenue' ? 'var(--warning)' : 'var(--text-primary)' }}>{row.v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Live Connections */}
      <div>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '20px', marginBottom: '16px', color: 'var(--text-primary)' }}>Live Connections</h3>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', maxHeight: '200px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-elevated)' }}>
              <tr>
                {['User ID', 'IP', 'Connected Since', 'Room'].map(th => (
                  <th key={th} style={{ padding: '12px 16px', fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--text-muted)' }}>{th}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {connections.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-mid)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--text-primary)' }}>{c.id}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--text-secondary)' }}>{c.ip}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--text-secondary)' }}>{new Date(c.since).toLocaleTimeString()}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--warning)' }}>{c.room}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

// --- ROLE MANAGEMENT TAB ---
const RoleManagementTab = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null); // { user, newRole }
  const [confirmInput, setConfirmInput] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axiosInstance.get('/admin/users');
        setUsers(data);
      } catch (err) {
        toast.error('Failed to fetch users');
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = (e, user) => {
    const newRole = e.target.value;
    if (newRole !== user.role) {
      setConfirmModal({ user, newRole });
      setConfirmInput('');
    }
  };

  const executeRoleChange = async () => {
    if (!confirmModal || confirmInput !== confirmModal.user.email) return;
    try {
      await axiosInstance.patch(`/admin/users/${confirmModal.user._id}/role`, { role: confirmModal.newRole });
      setUsers(users.map(u => u._id === confirmModal.user._id ? { ...u, role: confirmModal.newRole } : u));
      toast.success(`Role updated for ${confirmModal.user.email}`);
      setConfirmModal(null);
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="in" exit="out">
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-mid)' }}>
              <th style={{ padding: '16px' }}><input type="checkbox" /></th>
              <th style={{ padding: '16px', fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>USER</th>
              <th style={{ padding: '16px', fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>EMAIL</th>
              <th style={{ padding: '16px', fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>JOINED</th>
              <th style={{ padding: '16px', fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>LAST ACTIVE</th>
              <th style={{ padding: '16px', fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid var(--border-mid)' }}>
                <td style={{ padding: '16px' }}>
                  <input type="checkbox" checked={selectedUsers.includes(u._id)} onChange={(e) => {
                    if (e.target.checked) setSelectedUsers([...selectedUsers, u._id]);
                    else setSelectedUsers(selectedUsers.filter(id => id !== u._id));
                  }} />
                </td>
                <td style={{ padding: '16px', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-primary)' }}>{u.name}</td>
                <td style={{ padding: '16px', fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '16px', fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--text-secondary)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '16px', fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--text-secondary)' }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontFamily: 'JetBrains Mono', fontSize: '11px',
                      background: u.role === 'superadmin' ? 'rgba(245, 158, 11, 0.1)' : u.role === 'admin' ? 'rgba(237, 128, 233, 0.1)' : 'var(--bg-elevated)',
                      color: u.role === 'superadmin' ? 'var(--warning)' : u.role === 'admin' ? 'var(--orchid)' : 'var(--text-secondary)',
                      border: `1px solid ${u.role === 'superadmin' ? 'rgba(245, 158, 11, 0.3)' : u.role === 'admin' ? 'rgba(237, 128, 233, 0.3)' : 'var(--border-mid)'}`
                    }}>
                      {u.role.toUpperCase()}
                    </span>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(e, u)}
                      style={{
                        background: 'var(--bg)', border: '1px solid var(--border-mid)', color: 'var(--text-primary)',
                        padding: '6px', borderRadius: '4px', fontFamily: 'DM Sans', fontSize: '13px', outline: 'none'
                      }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUsers.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <MetalButton variant="primary" style={{ border: '1px solid var(--error)', color: 'var(--error)' }}>
            Suspend Selected ({selectedUsers.length})
          </MetalButton>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', maxWidth: '500px', width: '100%' }}
            >
              <div style={{
                background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)',
                padding: '16px', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--warning)', marginBottom: '24px'
              }}>
                You are about to change a user's system role. This action is logged and irreversible without manual database intervention.
              </div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)', marginBottom: '16px' }}>
                Change {confirmModal.user.name} from {confirmModal.user.role} to {confirmModal.newRole}?
              </h2>
              <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Type the user's email <strong>{confirmModal.user.email}</strong> to confirm:
              </p>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="user@example.com"
                style={{
                  width: '100%', background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '4px',
                  padding: '12px', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: '14px', marginBottom: '24px', outline: 'none'
                }}
              />
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <MetalButton onClick={() => setConfirmModal(null)}>Cancel</MetalButton>
                <MetalButton 
                  onClick={executeRoleChange}
                  disabled={confirmInput !== confirmModal.user.email}
                  style={{
                    opacity: confirmInput !== confirmModal.user.email ? 0.5 : 1,
                    pointerEvents: confirmInput !== confirmModal.user.email ? 'none' : 'auto',
                    border: '1px solid var(--warning)', color: 'var(--warning)'
                  }}
                >
                  Confirm Role Change
                </MetalButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- TOGGLE COMPONENT ---
const CustomToggle = ({ checked, onChange, isWarning }) => (
  <button
    onClick={() => onChange(!checked)}
    style={{
      width: '44px', height: '24px', borderRadius: '12px',
      background: checked ? (isWarning ? 'var(--warning)' : 'var(--violet)') : 'var(--bg-elevated)',
      border: `1px solid ${checked ? (isWarning ? 'var(--warning)' : 'var(--violet)') : 'var(--border-mid)'}`,
      position: 'relative', cursor: 'pointer', transition: 'all 0.2s', padding: 0
    }}
  >
    <div style={{
      width: '20px', height: '20px', borderRadius: '50%', background: checked ? '#fff' : 'var(--bg)',
      position: 'absolute', top: '1px', left: checked ? '21px' : '1px', transition: 'all 0.2s'
    }} />
  </button>
);

// --- PLATFORM SETTINGS TAB ---
const PlatformSettingsTab = () => {
  const [settings, setSettings] = useState({
    newReg: true, maxReg: 5, waitlist: false,
    livePayment: false, emailNotif: true,
    maintenance: false, featureFlags: '{\n  "beta_ui": true,\n  "show_map": false\n}'
  });

  const handleSave = () => toast.success('Settings saved successfully');

  return (
    <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '48px' }}>
      
      {/* Left Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* Event Settings */}
        <div>
          <h3 style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--warning)', textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '0.1em' }}>Event Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
              <div>
                <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>Allow new registrations</div>
                <div style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>Enable or disable event signups platform-wide.</div>
              </div>
              <CustomToggle checked={settings.newReg} onChange={v => setSettings({...settings, newReg: v})} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
              <div>
                <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>Max registrations per user</div>
              </div>
              <input type="number" value={settings.maxReg} onChange={e => setSettings({...settings, maxReg: e.target.value})} style={{ width: '80px', background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '8px', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', textAlign: 'right', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
              <div>
                <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>Waitlist enabled</div>
              </div>
              <CustomToggle checked={settings.waitlist} onChange={v => setSettings({...settings, waitlist: v})} />
            </div>
            <MetalButton style={{ alignSelf: 'flex-start' }} onClick={handleSave}>Save Event Settings</MetalButton>
          </div>
        </div>

        {/* Payment Settings */}
        <div>
          <h3 style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--warning)', textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '0.1em' }}>Payment Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
              <div>
                <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>Payment Mode</div>
                <div style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>Sandbox for testing, Live for real money.</div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <input type="radio" name="paymode" checked={!settings.livePayment} onChange={() => setSettings({...settings, livePayment: false})} /> Sandbox
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-primary)', border: settings.livePayment ? '1px solid var(--warning)' : 'none', padding: '4px 8px', borderRadius: '4px' }}>
                  <input type="radio" name="paymode" checked={settings.livePayment} onChange={() => setSettings({...settings, livePayment: true})} /> Live
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
              <div>
                <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>Razorpay Key ID</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '8px 12px', borderRadius: '4px' }}>rzp_****_****XYZ</div>
                <MetalButton>Rotate</MetalButton>
              </div>
            </div>
            <MetalButton style={{ alignSelf: 'flex-start' }} onClick={handleSave}>Save Payment Settings</MetalButton>
          </div>
        </div>

      </div>

      {/* Right Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* Platform Settings */}
        <div>
          <h3 style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--warning)', textTransform: 'uppercase', marginBottom: '24px', letterSpacing: '0.1em' }}>Platform Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
              <div>
                <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '15px', color: 'var(--error)' }}>Maintenance Mode</div>
                <div style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>Prevents all users from accessing the platform.</div>
              </div>
              <CustomToggle checked={settings.maintenance} isWarning={true} onChange={v => setSettings({...settings, maintenance: v})} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
              <div>
                <div style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>Feature Flags</div>
                <div style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>JSON configuration for platform features.</div>
              </div>
              <textarea
                value={settings.featureFlags}
                onChange={e => setSettings({...settings, featureFlags: e.target.value})}
                style={{
                  width: '100%', height: '120px', background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: '4px',
                  padding: '12px', fontFamily: 'DM Sans Mono, monospace', fontSize: '13px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical'
                }}
              />
            </div>
            <MetalButton style={{ alignSelf: 'flex-start' }} onClick={handleSave}>Save Platform Settings</MetalButton>
          </div>
        </div>

      </div>

    </motion.div>
  );
};

// --- AUDIT LOG TAB ---
const AuditLogTab = () => {
  const [logs, setLogs] = useState([]);

  const [expandedRow, setExpandedRow] = useState(null);

  const formatTimestamp = (ts) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${d.toLocaleTimeString('en-US', { hour12: false })} IST`;
  };

  const getActionColor = (action) => {
    if (action.includes('ROLE')) return 'var(--warning)';
    if (action.includes('CREATE')) return 'var(--success)';
    if (action.includes('SUSPEND') || action.includes('DELETE')) return 'var(--error)';
    if (action.includes('BROADCAST')) return 'var(--orchid)';
    return 'var(--violet)';
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="in" exit="out">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)' }}>Audit Log — All System Actions</h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          <input type="text" placeholder="Filter by User or Action..." style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '8px 12px', color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: '13px', outline: 'none' }} />
          <input type="date" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '8px 12px', color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: '13px', outline: 'none' }} />
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-mid)' }}>
            <tr>
              <th style={{ padding: '16px', fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>TIMESTAMP</th>
              <th style={{ padding: '16px', fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>ACTOR</th>
              <th style={{ padding: '16px', fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>ACTION</th>
              <th style={{ padding: '16px', fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>RESOURCE</th>
              <th style={{ padding: '16px', fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>IP</th>
              <th style={{ padding: '16px', fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)' }}>DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <React.Fragment key={log.id}>
                <tr style={{ borderBottom: '1px solid var(--border-mid)', cursor: 'pointer', background: expandedRow === log.id ? 'var(--bg-elevated)' : 'transparent' }} onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}>
                  <td style={{ padding: '16px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-secondary)' }}>{formatTimestamp(log.timestamp)}</td>
                  <td style={{ padding: '16px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-primary)' }}>{log.actor}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontFamily: 'JetBrains Mono', fontSize: '11px', background: `${getActionColor(log.action)}15`, color: getActionColor(log.action), border: `1px solid ${getActionColor(log.action)}40` }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-secondary)' }}>{log.resource}</td>
                  <td style={{ padding: '16px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-secondary)' }}>{log.ip}</td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                    {expandedRow === log.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </td>
                </tr>
                <AnimatePresence>
                  {expandedRow === log.id && (
                    <motion.tr initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <td colSpan="6" style={{ padding: 0 }}>
                        <div style={{ padding: '12px 16px', background: 'var(--bg)', borderLeft: '3px solid var(--border-mid)' }}>
                          <pre style={{ margin: 0, fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

// --- DATA EXPORT TAB ---
const DataExportTab = () => {
  const [exporting, setExporting] = useState(null);

  const handleExport = (type) => {
    setExporting(type);
    setTimeout(() => {
      toast.success('Export ready — downloading now');
      setExporting(null);
    }, 1500);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="in" exit="out">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* User Data Export */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px' }}>User Data Export</h4>
            <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Download a complete CSV of all registered users, including their roles and contact info.</p>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <MetalButton onClick={() => handleExport('users')} disabled={exporting === 'users'} style={{ width: '100%', marginBottom: '12px' }}>
              {exporting === 'users' ? 'Generating...' : 'Export as CSV'}
            </MetalButton>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>Last exported: Never</div>
          </div>
        </div>

        {/* Orders Export */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px' }}>Orders Export</h4>
            <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Full transaction history including order status, amounts, and Razorpay payment IDs.</p>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <MetalButton onClick={() => handleExport('orders')} disabled={exporting === 'orders'} style={{ width: '100%', marginBottom: '12px' }}>
              {exporting === 'orders' ? 'Generating...' : 'Export as CSV'}
            </MetalButton>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>Last exported: Yesterday</div>
          </div>
        </div>

        {/* Event Registrations */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '4px' }}>Event Registrations</h4>
            <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Export participant lists per event, including team details and check-in status.</p>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <select style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '12px', color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: '13px', outline: 'none' }}>
              <option>Select an event...</option>
              <option>Hackathon 2025</option>
              <option>Tech Talk: AI</option>
            </select>
            <MetalButton onClick={() => handleExport('events')} disabled={exporting === 'events'} style={{ width: '100%' }}>
              {exporting === 'events' ? 'Generating...' : 'Export as CSV'}
            </MetalButton>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>Last exported: Never</div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

// --- CONTENT MANAGEMENT TAB ---
const ContentManagementTab = () => {
  const [eventData, setEventData] = useState({ title: '', date: '', location: '', category: '', price: '', capacity: '', description: '', image: '' });
  const [productData, setProductData] = useState({ title: '', category: '', price: '', stock: '', description: '', sizes: '', image: '' });

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/event', {
        name: eventData.title,
        type: eventData.category,
        date: eventData.date,
        venue: eventData.location,
        capacity: Number(eventData.capacity),
        description: eventData.description,
        imageUrl: eventData.image,
        price: Number(eventData.price),
        team_size: 'Solo / Team',
        schedule: [],
        prizes: [],
        organizers: [],
        sponsors: []
      });
      toast.success('Event created successfully');
      setEventData({ title: '', date: '', location: '', category: '', price: '', capacity: '', description: '', image: '' });
    } catch (err) {
      toast.error('Failed to create event');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/products', {
        name: productData.title,
        category: productData.category,
        price: Number(productData.price),
        stock: Number(productData.stock),
        sizes: productData.sizes.split(',').map(s => ({ label: s.trim(), available: true })),
        description: [productData.description],
        imageUrl: productData.image
      });
      toast.success('Product created successfully');
      setProductData({ title: '', category: '', price: '', stock: '', description: '', sizes: '', image: '' });
    } catch (err) {
      toast.error('Failed to create product');
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
      
      {/* Create Event */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)', marginBottom: '24px' }}>Create Event</h3>
        <form onSubmit={handleEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input placeholder="Event Title" required value={eventData.title} onChange={e => setEventData({...eventData, title: e.target.value})} style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '12px', color: 'var(--text-primary)' }} />
          <input type="date" required value={eventData.date} onChange={e => setEventData({...eventData, date: e.target.value})} style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '12px', color: 'var(--text-primary)' }} />
          <input placeholder="Location" required value={eventData.location} onChange={e => setEventData({...eventData, location: e.target.value})} style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '12px', color: 'var(--text-primary)' }} />
          <input placeholder="Category (e.g. Conference)" required value={eventData.category} onChange={e => setEventData({...eventData, category: e.target.value})} style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '12px', color: 'var(--text-primary)' }} />
          <input placeholder="Price (INR)" type="number" required value={eventData.price} onChange={e => setEventData({...eventData, price: e.target.value})} style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '12px', color: 'var(--text-primary)' }} />
          <input placeholder="Capacity" type="number" required value={eventData.capacity} onChange={e => setEventData({...eventData, capacity: e.target.value})} style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '12px', color: 'var(--text-primary)' }} />
          <input placeholder="Image URL" value={eventData.image} onChange={e => setEventData({...eventData, image: e.target.value})} style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '12px', color: 'var(--text-primary)' }} />
          <textarea placeholder="Description" required value={eventData.description} onChange={e => setEventData({...eventData, description: e.target.value})} style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '12px', color: 'var(--text-primary)', height: '100px' }} />
          <MetalButton type="submit" variant="primary">Create Event</MetalButton>
        </form>
      </div>

      {/* Create Product */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)', marginBottom: '24px' }}>Create Product</h3>
        <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input placeholder="Product Title" required value={productData.title} onChange={e => setProductData({...productData, title: e.target.value})} style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '12px', color: 'var(--text-primary)' }} />
          <input placeholder="Category (e.g. Apparel)" required value={productData.category} onChange={e => setProductData({...productData, category: e.target.value})} style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '12px', color: 'var(--text-primary)' }} />
          <input placeholder="Price (INR)" type="number" required value={productData.price} onChange={e => setProductData({...productData, price: e.target.value})} style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '12px', color: 'var(--text-primary)' }} />
          <input placeholder="Stock Quantity" type="number" required value={productData.stock} onChange={e => setProductData({...productData, stock: e.target.value})} style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '12px', color: 'var(--text-primary)' }} />
          <input placeholder="Sizes (comma separated, e.g. S, M, L)" value={productData.sizes} onChange={e => setProductData({...productData, sizes: e.target.value})} style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '12px', color: 'var(--text-primary)' }} />
          <input placeholder="Image URL" value={productData.image} onChange={e => setProductData({...productData, image: e.target.value})} style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '12px', color: 'var(--text-primary)' }} />
          <textarea placeholder="Description" required value={productData.description} onChange={e => setProductData({...productData, description: e.target.value})} style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: '4px', padding: '12px', color: 'var(--text-primary)', height: '100px' }} />
          <MetalButton type="submit" variant="primary">Create Product</MetalButton>
        </form>
      </div>

    </motion.div>
  );
};

const SuperAdminPanel = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('System');
  
  const tabs = ['System', 'Role Management', 'Content Management', 'Platform Settings', 'Audit Log', 'Data Export'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: '64px', color: 'var(--text-primary)' }}>
      {/* Top Navbar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '64px',
        background: 'var(--bg)', borderBottom: '1px solid var(--border-mid)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px, 5vw, 80px)', zIndex: 100
      }}>
        <div style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)' }}>
          SyncSummit <span style={{ color: 'var(--warning)' }}>Admin</span>
        </div>
        <MetalButton onClick={() => navigate('/')}>
          View as User
        </MetalButton>
      </div>

      {/* Header */}
      <header style={{
        background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-mid)',
        padding: '32px clamp(20px, 5vw, 80px) 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
      }}>
        <div>
          <div style={{
            fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--warning)', 
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px'
          }}>
            SUPERADMIN · SYNCSUMMIT CONTROL
          </div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '36px', margin: 0 }}>System Control Panel</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Signed in as {user?.name || 'Superadmin'}
          </div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)' }}>
            Superadmin since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Nov 2024'}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{
        position: 'sticky', top: '64px', zIndex: 10, background: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border-mid)', padding: '0 clamp(20px, 5vw, 80px)',
        display: 'flex', gap: '32px', overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none', border: 'none', padding: '16px 0', cursor: 'pointer',
              fontFamily: 'JetBrains Mono', fontSize: '13px',
              color: activeTab === tab ? 'var(--warning)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '2px solid var(--warning)' : '2px solid transparent',
              transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <main style={{ padding: '32px clamp(20px, 5vw, 80px)' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'System' && <SystemTab key="system" />}
          {activeTab === 'Role Management' && <RoleManagementTab key="role" />}
          {activeTab === 'Content Management' && <ContentManagementTab key="content" />}
          {activeTab === 'Platform Settings' && <PlatformSettingsTab key="platform" />}
          {activeTab === 'Audit Log' && <AuditLogTab key="audit" />}
          {activeTab === 'Data Export' && <DataExportTab key="export" />}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default SuperAdminPanel;
