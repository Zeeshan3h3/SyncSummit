import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MetalButton } from '../components/ui/Buttons';
import axiosInstance from '../api/axios';
import useAuthStore from '../store/authStore';
import { getDeterministicImage } from '../utils/imageUtils';

const BACKEND = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3000';

// ── Product Edit Modal ──────────────────────────────────────────────────────
const ProductEditModal = ({ product, onClose, onSaved, userRole }) => {
  const [form, setForm] = useState({
    name: product.name || '',
    category: product.category || '',
    price: product.price || '',
    original_price: product.original_price || '',
    stock: product.stock || '',
    description: Array.isArray(product.description) ? product.description.join('\n') : (product.description || ''),
    sizes: Array.isArray(product.sizes) ? product.sizes.map(s => s.label || s).join(', ') : '',
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const isSuperAdmin = userRole === 'superadmin';

  const inp = { background:'var(--bg)', border:'1px solid var(--border-mid)', borderRadius:'6px', padding:'10px 12px', color:'var(--text-primary)', fontFamily:'DM Sans', fontSize:'14px', width:'100%', boxSizing:'border-box' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('category', form.category);
      fd.append('stock', form.stock);
      fd.append('description', JSON.stringify(form.description.split('\n').filter(Boolean)));
      fd.append('sizes', JSON.stringify(form.sizes.split(',').map(s => ({ label: s.trim(), available: true })).filter(s => s.label)));
      if (isSuperAdmin) { fd.append('price', form.price); fd.append('original_price', form.original_price); }
      if (thumbnail) fd.append('thumbnail', thumbnail);
      images.forEach(img => fd.append('images', img));
      const res = await axiosInstance.put(`/products/${product._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Product updated!');
      onSaved(res.data);
      onClose();
    } catch (err) { toast.error('Failed to update product'); }
    finally { setSaving(false); }
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}
      onClick={onClose}>
      <motion.div initial={{scale:0.92,y:24}} animate={{scale:1,y:0}} exit={{scale:0.92,y:24}} transition={{duration:0.25}}
        onClick={e=>e.stopPropagation()}
        style={{background:'var(--bg-card)',border:'1px solid var(--border-mid)',borderRadius:'var(--radius-lg)',padding:'32px',width:'100%',maxWidth:'600px',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
          <div>
            <div style={{fontFamily:'JetBrains Mono',fontSize:'10px',color:'var(--warning)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'4px'}}>Admin · Edit Product</div>
            <h2 style={{fontFamily:'Syne',fontWeight:700,fontSize:'22px',color:'var(--text-primary)',margin:0}}>Edit Product</h2>
          </div>
          <button onClick={onClose} style={{background:'var(--bg-elevated)',border:'1px solid var(--border-mid)',borderRadius:'6px',color:'var(--text-muted)',width:'32px',height:'32px',cursor:'pointer',fontSize:'18px',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
            <div><label style={{fontFamily:'JetBrains Mono',fontSize:'10px',color:'var(--text-muted)',textTransform:'uppercase',display:'block',marginBottom:'6px'}}>Name *</label><input style={inp} required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
            <div><label style={{fontFamily:'JetBrains Mono',fontSize:'10px',color:'var(--text-muted)',textTransform:'uppercase',display:'block',marginBottom:'6px'}}>Category</label><input style={inp} value={form.category} onChange={e=>setForm({...form,category:e.target.value})} /></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns: isSuperAdmin ? '1fr 1fr 1fr' : '1fr',gap:'12px'}}>
            <div><label style={{fontFamily:'JetBrains Mono',fontSize:'10px',color:'var(--text-muted)',textTransform:'uppercase',display:'block',marginBottom:'6px'}}>Stock</label><input type="number" style={inp} value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} /></div>
            {isSuperAdmin && (<>
              <div><label style={{fontFamily:'JetBrains Mono',fontSize:'10px',color:'var(--warning)',textTransform:'uppercase',display:'block',marginBottom:'6px'}}>Price ₹ 🔒</label><input type="number" style={inp} value={form.price} onChange={e=>setForm({...form,price:e.target.value})} /></div>
              <div><label style={{fontFamily:'JetBrains Mono',fontSize:'10px',color:'var(--warning)',textTransform:'uppercase',display:'block',marginBottom:'6px'}}>Original Price ₹ 🔒</label><input type="number" style={inp} value={form.original_price} onChange={e=>setForm({...form,original_price:e.target.value})} /></div>
            </>)}
          </div>
          <div><label style={{fontFamily:'JetBrains Mono',fontSize:'10px',color:'var(--text-muted)',textTransform:'uppercase',display:'block',marginBottom:'6px'}}>Sizes (comma-separated)</label><input style={inp} placeholder="S, M, L, XL" value={form.sizes} onChange={e=>setForm({...form,sizes:e.target.value})} /></div>
          <div><label style={{fontFamily:'JetBrains Mono',fontSize:'10px',color:'var(--text-muted)',textTransform:'uppercase',display:'block',marginBottom:'6px'}}>Description (one line per bullet)</label><textarea style={{...inp,height:'80px',resize:'vertical'}} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
            <div><label style={{fontFamily:'JetBrains Mono',fontSize:'10px',color:'var(--text-muted)',textTransform:'uppercase',display:'block',marginBottom:'6px'}}>New Thumbnail</label><input type="file" accept="image/*" onChange={e=>setThumbnail(e.target.files[0])} style={{...inp,padding:'8px'}} />{product.thumbnail && <div style={{marginTop:'4px',fontFamily:'DM Sans',fontSize:'11px',color:'var(--text-muted)'}}>Current: {product.thumbnail.split('/').pop()}</div>}</div>
            <div><label style={{fontFamily:'JetBrains Mono',fontSize:'10px',color:'var(--text-muted)',textTransform:'uppercase',display:'block',marginBottom:'6px'}}>New Gallery Images</label><input type="file" accept="image/*" multiple onChange={e=>setImages(Array.from(e.target.files))} style={{...inp,padding:'8px'}} />{product.images?.length > 0 && <div style={{marginTop:'4px',fontFamily:'DM Sans',fontSize:'11px',color:'var(--text-muted)'}}>{product.images.length} existing</div>}</div>
          </div>
          <div style={{display:'flex',gap:'10px',marginTop:'8px'}}>
            <button type="button" onClick={onClose} style={{flex:1,padding:'12px',background:'var(--bg-elevated)',border:'1px solid var(--border-mid)',borderRadius:'6px',color:'var(--text-secondary)',fontFamily:'DM Sans',fontSize:'14px',cursor:'pointer'}}>Cancel</button>
            <button type="submit" disabled={saving} style={{flex:2,padding:'12px',background:'var(--warning)',border:'none',borderRadius:'6px',color:'#000',fontFamily:'DM Sans',fontWeight:600,fontSize:'14px',cursor:saving?'not-allowed':'pointer',opacity:saving?0.7:1}}>{saving?'Saving...':'Save Changes'}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Mock Data
const INITIAL_PRODUCTS = [];

const FILTERS = ['All', 'Apparel', 'Accessories', 'Books & Stationery', 'Digital', 'Bundles'];

// Silhouettes
const Silhouette = ({ category }) => {
  const props = { width: 80, height: 80, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1, strokeLinecap: "round", strokeLinejoin: "round", style: { color: 'var(--border)', opacity: 0.5 } };
  if (category === 'Apparel') {
    return (
      <svg {...props}>
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
      </svg>
    );
  }
  if (category === 'Accessories') {
    return (
      <svg {...props}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    );
  }
  if (category === 'Books & Stationery') {
    return (
      <svg {...props}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    );
  }
  return (
    <svg {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <path d="M3 9h18"/>
      <path d="M9 21V9"/>
    </svg>
  );
};

const Products = () => {
  const { user } = useAuthStore();
  const userRole = user?.role || null;
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  const isSuperAdmin = userRole === 'superadmin';

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest First');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef(null);

  // Admin modal state
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Cart State
  const [cartItems, setCartItems] = useState([]);
  const [addedItemIds, setAddedItemIds] = useState({});

  useEffect(() => {
    // Load Cart from sessionStorage
    const savedCart = sessionStorage.getItem('syncSummitCart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    // Fetch from backend, fallback to empty array
    const controller = new AbortController();
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get('/products', { signal: controller.signal });
        setProducts(res.data);
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error("Failed to fetch products, using empty state.", err);
          setProducts(INITIAL_PRODUCTS);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();

    // Socket.io for Real-time Inventory
    const socket = io('http://localhost:5000', { transports: ['websocket'], autoConnect: false }); // Fallback if no backend
    // Try connecting silently if backend is active
    socket.connect();
    socket.on('inventory_update', ({ product_id, new_quantity }) => {
      setProducts(prev => prev.map(p => {
        if (p.id === product_id) {
          return { ...p, stock: new_quantity };
        }
        return p;
      }));
    });

    return () => {
      socket.disconnect();
      controller.abort();
    };
  }, []);

  // Save Cart to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('syncSummitCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Click outside for Sort dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddToCart = (product) => {
    if (product.stock === 0) return;
    
    const savedCart = sessionStorage.getItem('syncSummitCart');
    let items = savedCart ? JSON.parse(savedCart) : [];
    
    // Check if it exists with default size 'M' if applicable, or no size
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
    const existingIdx = items.findIndex(i => i.product_id === product._id && i.size === defaultSize);
    
    if (existingIdx >= 0) {
      items[existingIdx].quantity += 1;
    } else {
      items.push({ 
        product_id: product._id, 
        name: product.name, 
        price: product.price, 
        quantity: 1,
        size: defaultSize 
      });
    }

    sessionStorage.setItem('syncSummitCart', JSON.stringify(items));
    setCartItems(items);

    toast.success('Added to cart', {
      icon: null,
      style: { background: 'var(--bg-elevated)', borderLeft: '4px solid var(--success)', color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: '14px', borderRadius: 'var(--radius-sm)' }
    });

    setAddedItemIds(prev => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedItemIds(prev => ({ ...prev, [product._id]: false }));
    }, 1500);
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirmProduct) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/products/${deleteConfirmProduct._id}`);
      setProducts(prev => prev.filter(p => p._id !== deleteConfirmProduct._id));
      toast.success('Product deleted');
      setDeleteConfirmProduct(null);
    } catch (err) { toast.error('Failed to delete product'); }
    finally { setDeleting(false); }
  };

  const handleProductSaved = (updated) => {
    setProducts(prev => prev.map(p => p._id === updated._id ? updated : p));
  };

  const filteredProducts = products
    .filter(p => activeFilter === 'All' || p.category === activeFilter)
    .sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      // Mock logic for Newest/Popular
      if (sortBy === 'Newest First') return b.id - a.id; 
      return 0;
    });

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar cartCount={cartCount} />

      <main style={{ flex: 1, paddingTop: '64px' }}>
        
        {/* PAGE HEADER */}
        <section style={{ padding: '64px 24px', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border-mid)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(6,4,10,0.9) 0%, rgba(6,4,10,0.5) 100%), url("/products_banner.png") center/cover no-repeat', zIndex: 0 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)', zIndex: 0 }} />
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--orchid)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              Official Store · SyncSummit 2025
            </div>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 'clamp(32px, 4vw, 40px)', color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0 0 12px 0' }}>
              Merchandise & Event Kits
            </h1>
            <p style={{ fontFamily: 'DM Sans', fontWeight: 400, fontSize: '15px', color: 'var(--text-secondary)', margin: 0, maxWidth: '500px', lineHeight: 1.5 }}>
              Exclusive drops for attendees and supporters of SyncSummit 2025.
            </p>
          </div>

          {/* Desktop Cart Widget */}
          {cartCount > 0 && (
            <div className="desktop-cart-widget" style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-md)', padding: '12px 16px', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{cartCount} items</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--orchid)' }}>₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>
              <Link to="/cart" style={{ textDecoration: 'none' }}>
                <MetalButton variant="default" style={{ padding: '8px 16px', fontSize: '13px' }}>View Cart</MetalButton>
              </Link>
            </div>
          )}
          </div>
        </section>

        {/* FILTER + SORT BAR */}
        <div style={{ position: 'sticky', top: '64px', zIndex: 40, background: 'rgba(5, 5, 5, 0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            
            {/* Filter Chips (Scrollable) */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="no-scrollbar">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    padding: '8px 16px', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono', fontSize: '12px', cursor: 'pointer', outline: 'none', transition: 'all 0.2s',
                    background: activeFilter === f ? 'var(--violet)' : 'var(--bg-elevated)',
                    border: activeFilter === f ? '1px solid transparent' : '1px solid var(--border-mid)',
                    color: activeFilter === f ? '#fff' : 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }} ref={sortRef}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SORT BY</span>
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px', justifyContent: 'space-between'
                  }}
                >
                  {sortBy}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isSortOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', top: '100%', right: 0, zIndex: 50, marginTop: '4px',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-md)',
                        minWidth: '180px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                      }}
                    >
                      {['Price: Low to High', 'Price: High to Low', 'Newest First', 'Most Popular'].map(opt => (
                        <div 
                          key={opt} onClick={() => { setSortBy(opt); setIsSortOpen(false); }}
                          style={{
                            padding: '10px 14px', fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer',
                            background: sortBy === opt ? 'var(--border)' : 'transparent', transition: 'background 0.1s'
                          }}
                          onMouseOver={(e) => e.target.style.background = 'var(--border)'}
                          onMouseOut={(e) => e.target.style.background = sortBy === opt ? 'var(--border)' : 'transparent'}
                        >
                          {opt}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>

        {/* MAIN PRODUCT GRID */}
        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 64px' }}>
          
          {isLoading ? (
            /* LOADING STATE */
            <div className="product-grid" style={{ display: 'grid', gap: '20px' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: '24px', overflow: 'hidden'
                }}>
                  <div style={{ height: '220px', background: 'var(--bg-elevated)', position: 'relative', overflow: 'hidden' }}>
                    <div className="shimmer-effect" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, transparent, rgba(211,211,255,0.04), transparent)' }} />
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ width: '60%', height: '12px', background: 'var(--bg-elevated)', borderRadius: '4px', marginBottom: '12px', position: 'relative', overflow: 'hidden' }}>
                      <div className="shimmer-effect" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, transparent, rgba(211,211,255,0.04), transparent)' }} />
                    </div>
                    <div style={{ width: '90%', height: '18px', background: 'var(--bg-elevated)', borderRadius: '4px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
                      <div className="shimmer-effect" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, transparent, rgba(211,211,255,0.04), transparent)' }} />
                    </div>
                    <div style={{ width: '40%', height: '20px', background: 'var(--bg-elevated)', borderRadius: '4px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
                      <div className="shimmer-effect" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, transparent, rgba(211,211,255,0.04), transparent)' }} />
                    </div>
                    <div style={{ width: '100%', height: '36px', background: 'var(--bg-elevated)', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                      <div className="shimmer-effect" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, transparent, rgba(211,211,255,0.04), transparent)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            /* EMPTY STATE */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px', textAlign: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="m9 10 6 6"/><path d="m15 10-6 6"/>
              </svg>
              <h3 style={{ fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-secondary)', margin: '0 0 4px 0', fontWeight: 500 }}>No products in this category</h3>
              <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 24px 0' }}>Try a different filter.</p>
              <MetalButton variant="primary" onClick={() => setActiveFilter('All')}>Clear Filters</MetalButton>
            </div>
          ) : (
            /* PRODUCT GRID */
            <div className="product-grid" style={{ display: 'grid', gap: '20px' }}>
              {filteredProducts.map(product => {
                const isSoldOut = product.stock === 0;
                const isLowStock = product.stock > 0 && product.stock <= 5;
                const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : null;
                const isAdded = addedItemIds[product._id];

                return (
                  <div key={product._id} className="product-card" style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: '24px', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}>
                    {/* Image Area */}
                    <Link to={`/products/${product._id}`} style={{ display: 'block', textDecoration: 'none' }}>
                      <div style={{ height: '220px', background: 'var(--bg-elevated)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {product.thumbnail ? (
                          <img src={product.thumbnail.startsWith('http') ? product.thumbnail : `${BACKEND}${product.thumbnail}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} onError={e => { e.target.style.display = 'none'; }} />
                        ) : (
                          <img src={getDeterministicImage(product.name, 800, 800)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                        )}

                        {/* Admin Overlay Buttons */}
                        {isAdmin && (
                          <div onClick={e => e.preventDefault()} style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '6px', zIndex: 10 }}>
                            <button onClick={e => { e.preventDefault(); e.stopPropagation(); setEditingProduct(product); }}
                              style={{ background: 'rgba(245,158,11,0.92)', border: 'none', borderRadius: '6px', padding: '5px 10px', color: '#000', fontFamily: 'JetBrains Mono', fontSize: '10px', fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(4px)', textTransform: 'uppercase' }}>
                              ✏ Edit
                            </button>
                            {isSuperAdmin && (
                              <button onClick={e => { e.preventDefault(); e.stopPropagation(); setDeleteConfirmProduct(product); }}
                                style={{ background: 'rgba(239,68,68,0.92)', border: 'none', borderRadius: '6px', padding: '5px 10px', color: '#fff', fontFamily: 'JetBrains Mono', fontSize: '10px', fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(4px)', textTransform: 'uppercase' }}>
                                🗑
                              </button>
                            )}
                          </div>
                        )}

                        {/* Badges */}
                        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <AnimatePresence>
                            {isSoldOut && (
                              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}
                                style={{ background: 'rgba(239, 68, 68, 0.7)', color: '#fff', fontFamily: 'JetBrains Mono', fontSize: '9px', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 'var(--radius-sm)', backdropFilter: 'blur(4px)' }}>
                                SOLD OUT
                              </motion.div>
                            )}
                            {isLowStock && !isSoldOut && (
                              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}
                                style={{ background: 'rgba(245, 158, 11, 0.7)', color: '#000', fontFamily: 'JetBrains Mono', fontSize: '9px', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 'var(--radius-sm)', backdropFilter: 'blur(4px)' }}>
                                LOW STOCK ({product.stock} LEFT)
                              </motion.div>
                            )}
                            {product.isNew && !isSoldOut && (
                              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}
                                style={{ background: 'var(--violet)', color: '#fff', fontFamily: 'JetBrains Mono', fontSize: '9px', textTransform: 'uppercase', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                                NEW DROP
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </Link>

                    {/* Content Area */}
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {product.category}
                      </div>
                      <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', margin: '4px 0 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {product.name}
                        </h3>
                      </Link>
                      
                      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '18px', color: 'var(--text-primary)', fontWeight: 500 }}>
                          ₹{product.price}
                        </span>
                        {product.original_price && (
                          <>
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                              ₹{product.original_price}
                            </span>
                            <span style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--success)', fontFamily: 'JetBrains Mono', fontSize: '10px', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>
                              −{discount}%
                            </span>
                          </>
                        )}
                      </div>

                      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                        {isSoldOut ? (
                          <div style={{ width: '100%', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: '14px', opacity: 0.5, cursor: 'not-allowed' }}>
                            Sold Out
                          </div>
                        ) : (
                          <MetalButton 
                            variant="primary" 
                            style={{ width: '100%', padding: '8px 16px', fontSize: '14px' }}
                            onClick={() => handleAddToCart(product)}
                          >
                            <AnimatePresence mode="wait">
                              {isAdded ? (
                                <motion.div key="added" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                  Added!
                                </motion.div>
                              ) : (
                                <motion.div key="add" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                                  Add to Cart
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </MetalButton>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </section>
      </main>

      <Footer />

      {/* Product Edit Modal */}
      <AnimatePresence>
        {editingProduct && (
          <ProductEditModal product={editingProduct} onClose={() => setEditingProduct(null)} onSaved={handleProductSaved} userRole={userRole} />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirmProduct && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}}
              style={{background:'var(--bg-card)',border:'1px solid rgba(239,68,68,0.4)',borderRadius:'var(--radius-lg)',padding:'32px',maxWidth:'420px',width:'100%',textAlign:'center'}}>
              <div style={{fontSize:'40px',marginBottom:'16px'}}>⚠️</div>
              <h3 style={{fontFamily:'Syne',fontWeight:700,fontSize:'20px',color:'var(--text-primary)',marginBottom:'8px'}}>Delete Product?</h3>
              <p style={{fontFamily:'DM Sans',fontSize:'14px',color:'var(--text-secondary)',marginBottom:'24px'}}><strong style={{color:'var(--text-primary)'}}>{deleteConfirmProduct.name}</strong> will be permanently removed.</p>
              <div style={{display:'flex',gap:'10px'}}>
                <button onClick={() => setDeleteConfirmProduct(null)} style={{flex:1,padding:'12px',background:'var(--bg-elevated)',border:'1px solid var(--border-mid)',borderRadius:'6px',color:'var(--text-secondary)',fontFamily:'DM Sans',fontSize:'14px',cursor:'pointer'}}>Cancel</button>
                <button onClick={handleDeleteProduct} disabled={deleting} style={{flex:1,padding:'12px',background:'var(--error)',border:'none',borderRadius:'6px',color:'#fff',fontFamily:'DM Sans',fontWeight:600,fontSize:'14px',cursor:deleting?'not-allowed':'pointer',opacity:deleting?0.7:1}}>{deleting?'Deleting...':'Delete'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .product-grid {
          grid-template-columns: repeat(4, 1fr);
        }
        @media (max-width: 1024px) {
          .product-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px !important; }
        }
        @media (min-width: 768px) {
          .desktop-cart-widget { display: flex !important; }
        }
        .product-card:hover {
          transform: translateY(-4px);
          border-color: rgba(237,128,233,0.35) !important;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-effect {
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default Products;
