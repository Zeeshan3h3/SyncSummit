import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MetalButton, LiquidButton } from '../components/ui/Buttons';
import axiosInstance from '../api/axios';
import { getDeterministicImage } from '../utils/imageUtils';

// Helper Icons
const StarFilled = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--orchid)" stroke="var(--orchid)" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const StarEmpty = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--border-mid)" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;

const Silhouette = ({ category, size = 120 }) => {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1, strokeLinecap: "round", strokeLinejoin: "round", style: { color: 'var(--border)', opacity: 0.5 } };
  if (category === 'Apparel' || category?.toLowerCase().includes('hoodie') || category?.toLowerCase().includes('t-shirt')) {
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

// Removed fetchProductDetails inside the file level

const RELATED_PRODUCTS = [];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Interactive state
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('Description');
  const [cartCount, setCartCount] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // Load Cart Count
    const savedCart = sessionStorage.getItem('syncSummitCart');
    if (savedCart) {
      const items = JSON.parse(savedCart);
      setCartCount(items.reduce((acc, i) => acc + i.quantity, 0));
    }

    // Fetch Product
    const controller = new AbortController();
    const loadProduct = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const res = await axiosInstance.get(`/products/${id}`, { signal: controller.signal });
        const data = res.data;
        if (!data) {
          setError(true);
        } else {
          setProduct(data);
          const firstAvailable = data.sizes?.find(s => s.available);
          if (firstAvailable) setSelectedSize(firstAvailable.label);
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          setError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadProduct();
    
    return () => {
      controller.abort();
    };
  }, [id]);

  const BACKEND = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3000';
  const getImageUrl = (path, isGallery = false) => {
    if (!path) return getDeterministicImage(product?.name + (isGallery ? Math.random().toString() : ''), 1200, 1200);
    if (path.startsWith('http')) return path;
    return `${BACKEND}${path}`;
  };

  useEffect(() => {
    if (!product) return;
    
    // Socket.io connection for real-time inventory
    const socket = io('http://localhost:5000', { transports: ['websocket'], autoConnect: false });
    socket.connect();
    
    socket.on('inventory_update', ({ product_id, new_quantity }) => {
      if (product_id === product.id) {
        setProduct(prev => ({ ...prev, stock: new_quantity }));
        if (quantity > new_quantity) setQuantity(Math.max(1, new_quantity));
      }
    });

    return () => socket.disconnect();
  }, [product, quantity]);

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    setIsAdding(true);

    const savedCart = sessionStorage.getItem('syncSummitCart');
    let items = savedCart ? JSON.parse(savedCart) : [];
    
    const existingIdx = items.findIndex(i => i.product_id === product._id && i.size === selectedSize);
    if (existingIdx >= 0) {
      items[existingIdx].quantity += quantity;
    } else {
      items.push({ 
        product_id: product._id, 
        name: product.name, 
        price: product.price, 
        quantity,
        size: selectedSize 
      });
    }

    sessionStorage.setItem('syncSummitCart', JSON.stringify(items));
    setCartCount(items.reduce((acc, i) => acc + i.quantity, 0));
    
    toast.success('Added to cart', {
      icon: null,
      style: { background: 'var(--bg-elevated)', borderLeft: '4px solid var(--success)', color: 'var(--text-primary)', fontFamily: 'DM Sans', fontSize: '14px', borderRadius: 'var(--radius-sm)' }
    });

    setTimeout(() => setIsAdding(false), 1500);
  };

  const handleBuyNow = () => {
    if (product.stock === 0) return;
    handleAddToCart();
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <Navbar cartCount={cartCount} />
        <main style={{ flex: 1, paddingTop: '64px', maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '88px 24px 64px' }}>
          <div className="product-layout" style={{ display: 'grid', gap: '48px', gridTemplateColumns: '1fr 1fr' }}>
            {/* Left Skeleton */}
            <div style={{ aspectRatio: '1/1', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
              <div className="shimmer-effect" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(211,211,255,0.04), transparent)' }} />
            </div>
            {/* Right Skeleton */}
            <div>
              <div style={{ width: '80%', height: '36px', background: 'var(--bg-elevated)', borderRadius: '8px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
                <div className="shimmer-effect" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(211,211,255,0.04), transparent)' }} />
              </div>
              <div style={{ width: '60%', height: '36px', background: 'var(--bg-elevated)', borderRadius: '8px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
                <div className="shimmer-effect" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(211,211,255,0.04), transparent)' }} />
              </div>
              <div style={{ width: '40%', height: '36px', background: 'var(--bg-elevated)', borderRadius: '8px', marginBottom: '40px', position: 'relative', overflow: 'hidden' }}>
                <div className="shimmer-effect" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(211,211,255,0.04), transparent)' }} />
              </div>
              <div style={{ width: '100%', height: '44px', background: 'var(--bg-elevated)', borderRadius: '8px', marginBottom: '8px', position: 'relative', overflow: 'hidden' }}>
                <div className="shimmer-effect" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(211,211,255,0.04), transparent)' }} />
              </div>
              <div style={{ width: '100%', height: '44px', background: 'var(--bg-elevated)', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                <div className="shimmer-effect" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(211,211,255,0.04), transparent)' }} />
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <style dangerouslySetInnerHTML={{__html: `@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } } .shimmer-effect { animation: shimmer 1.5s ease-in-out infinite; } @media (max-width: 768px) { .product-layout { grid-template-columns: 1fr !important; gap: 32px !important; } }`}} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <Navbar cartCount={cartCount} />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '64px' }}>
          <p style={{ fontFamily: 'DM Sans', fontSize: '17px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Product not found</p>
          <MetalButton variant="default" onClick={() => navigate('/products')}>Browse All Products</MetalButton>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : null;
  const savings = product.original_price ? product.original_price - product.price : 0;
  const isSoldOut = product.stock === 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar cartCount={cartCount} />

      <main style={{ flex: 1, paddingTop: '64px', maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '64px' }}>
        
        {/* BREADCRUMB */}
        <div style={{ padding: '24px 24px 0', fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-muted)' }}>
          <Link to="/products" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--text-primary)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>Products</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text-primary)' }}>{product.name}</span>
        </div>

        {/* MAIN PRODUCT LAYOUT */}
        <div className="product-layout" style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
          
          {/* LEFT: IMAGE GALLERY */}
          <div>
            <div style={{ width: '100%', aspectRatio: '1/1', background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {product.images && product.images.length > 0 ? (
                <img src={getImageUrl(product.images[activeImageIdx])} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <img src={getImageUrl(null)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            
            {(product.images && product.images.length > 1) && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                {product.images.map((img, idx) => (
                  <div key={idx} onClick={() => setActiveImageIdx(idx)} style={{ width: '72px', height: '72px', background: 'var(--bg-card)', border: activeImageIdx === idx ? '2px solid var(--orchid)' : '1px solid var(--border-mid)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: activeImageIdx === idx ? 1 : 0.6, transition: 'all 0.2s', overflow: 'hidden' }}>
                    <img src={getImageUrl(img, true)} alt={`${product.name} ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: PRODUCT DETAILS */}
          <div>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--orchid)', background: 'rgba(237,128,233,0.1)', border: '1px solid rgba(237,128,233,0.2)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', textTransform: 'uppercase' }}>
              {product.category}
            </span>
            
            <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '36px', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginTop: '12px', marginBottom: '8px', lineHeight: 1.1 }}>
              {product.name}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1,2,3,4,5].map(star => (
                  <span key={star}>{star <= Math.round(product.rating) ? <StarFilled /> : <StarEmpty />}</span>
                ))}
              </div>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', color: 'var(--text-primary)', marginLeft: '8px' }}>{product.rating}</span>
              <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--text-muted)', marginLeft: '6px' }}>({product.reviewsCount} reviews)</span>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 500, fontSize: '32px', color: 'var(--text-primary)' }}>₹{product.price.toLocaleString()}</span>
              {product.original_price && (
                <>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: '18px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{product.original_price.toLocaleString()}</span>
                  <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--success)', background: 'rgba(34,197,94,0.1)', padding: '4px 10px', borderRadius: 'var(--radius-sm)' }}>
                    Save ₹{savings}
                  </span>
                </>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-mid)', margin: '20px 0' }} />

            {/* VARIANT SELECTOR */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>SIZE</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {product.sizes.map(size => {
                    const isSelected = selectedSize === size.label;
                    return (
                      <button 
                        key={size.label}
                        disabled={!size.available}
                        onClick={() => setSelectedSize(size.label)}
                        style={{
                          width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: isSelected ? '2px solid var(--violet)' : '1px solid var(--border-mid)',
                          borderRadius: 'var(--radius-md)', fontFamily: 'DM Sans', fontSize: '14px',
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                          background: isSelected ? 'rgba(148,0,211,0.1)' : 'transparent',
                          cursor: size.available ? 'pointer' : 'not-allowed',
                          opacity: size.available ? 1 : 0.35, position: 'relative', overflow: 'hidden',
                          transition: 'all 0.2s'
                        }}
                      >
                        {size.label}
                        {!size.available && (
                          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}><line x1="0" y1="40" x2="40" y2="0" stroke="var(--border)" strokeWidth="1" /></svg>
                        )}
                      </button>
                    )
                  })}
                </div>
                <a href="#" style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'var(--orchid)', textDecoration: 'underline', marginTop: '8px', display: 'inline-block' }}>Size Guide</a>
              </div>
            )}

            {/* QUANTITY SELECTOR */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>QUANTITY</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  disabled={quantity <= 1 || isSoldOut}
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ width: '36px', height: '36px', background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', cursor: quantity <= 1 ? 'not-allowed' : 'pointer', opacity: quantity <= 1 ? 0.5 : 1 }}
                >−</button>
                
                <div style={{ minWidth: '40px', textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: '16px', color: 'var(--text-primary)', position: 'relative', height: '20px', overflow: 'hidden' }}>
                  <AnimatePresence mode="popLayout">
                    <motion.span key={quantity} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ position: 'absolute', left: 0, right: 0 }}>
                      {quantity}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <button 
                  disabled={quantity >= product.stock || isSoldOut}
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  style={{ width: '36px', height: '36px', background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', cursor: quantity >= product.stock ? 'not-allowed' : 'pointer', opacity: quantity >= product.stock ? 0.5 : 1 }}
                >+</button>
              </div>
            </div>

            {/* STOCK STATUS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              {isSoldOut ? (
                <><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--error)' }} /><span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--error)' }}>Sold Out</span></>
              ) : product.stock <= 10 ? (
                <><div className="pulse-amber" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }} /><span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--warning)' }}>Only {product.stock} left</span></>
              ) : (
                <><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} /><span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'var(--success)' }}>In Stock</span></>
              )}
            </div>

            {/* CTA BUTTONS */}
            <MetalButton 
              variant="primary" 
              style={{ width: '100%', marginBottom: '8px' }} 
              onClick={handleAddToCart}
              disabled={isSoldOut}
            >
              <AnimatePresence mode="wait">
                {isAdding ? (
                  <motion.div key="added" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Added to cart!
                  </motion.div>
                ) : (
                  <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Add to Cart — ₹{(product.price * quantity).toLocaleString()}
                  </motion.div>
                )}
              </AnimatePresence>
            </MetalButton>
            
            <MetalButton 
              variant="default" 
              style={{ width: '100%' }}
              onClick={handleBuyNow}
              disabled={isSoldOut}
            >
              Buy Now
            </MetalButton>

            <div style={{ paddingTop: '16px', fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-muted)' }}>
              Free delivery for attendees · Ships within 3 days
            </div>
          </div>
        </div>

        {/* PRODUCT DETAILS TABS */}
        <div style={{ marginTop: '64px', padding: '0 24px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-mid)', gap: '32px' }}>
            {['Description', 'Specifications', `Reviews (${product.reviewsCount})`].map(tab => (
              <div 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                style={{ 
                  position: 'relative', paddingBottom: '12px', cursor: 'pointer',
                  fontFamily: 'JetBrains Mono', fontSize: '13px', 
                  color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="tabIndicator" style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: '2px', background: 'var(--violet)' }} />
                )}
              </div>
            ))}
          </div>

          <div style={{ padding: '32px 0' }}>
            {activeTab === 'Description' && (
              <div style={{ maxWidth: '800px' }}>
                {product.description.map((p, i) => (
                  <p key={i} style={{ fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: i !== product.description.length - 1 ? '16px' : 0 }}>
                    {p}
                  </p>
                ))}
              </div>
            )}
            {activeTab === 'Specifications' && (
              <div style={{ maxWidth: '800px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <tbody>
                    {Object.entries(product.specifications).map(([key, val], idx) => (
                      <tr key={key} style={{ background: idx % 2 === 0 ? 'var(--bg-elevated)' : 'transparent', borderTop: idx === 0 ? '1px solid var(--border)' : 'none', borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 16px', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, width: '30%' }}>{key}</td>
                        <td style={{ padding: '10px 16px', fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-primary)' }}>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab.startsWith('Reviews') && (
              <div style={{ maxWidth: '800px' }}>
                {product.reviews.length === 0 ? (
                  <p style={{ fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-secondary)' }}>No reviews yet. Be the first.</p>
                ) : (
                  <>
                    {product.reviews.slice(0, 3).map((review, idx) => (
                      <div key={idx} style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                              {review.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{review.name}</span>
                          </div>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-muted)' }}>{review.date}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                          {[1,2,3,4,5].map(star => <span key={star}>{star <= review.rating ? <StarFilled /> : <StarEmpty />}</span>)}
                        </div>
                        <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                          {review.text}
                        </p>
                      </div>
                    ))}
                    <div style={{ marginTop: '24px' }}>
                      <LiquidButton style={{ padding: '8px 16px' }}>Load More Reviews</LiquidButton>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <div style={{ marginTop: '48px', padding: '0 24px' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '28px', color: 'var(--text-primary)', marginBottom: '24px' }}>
            More from the Store
          </h2>
          <div className="no-scrollbar" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '16px' }}>
            {RELATED_PRODUCTS.map(rp => (
              <Link to={`/products/${rp.id}`} key={rp.id} className="related-card" style={{ minWidth: '240px', maxWidth: '280px', flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-mid)', borderRadius: '24px', overflow: 'hidden', textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '180px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Silhouette category={rp.category} size={80} />
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{rp.category}</div>
                  <h3 style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', margin: '4px 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rp.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '16px', color: 'var(--text-primary)', fontWeight: 500 }}>₹{rp.price}</span>
                    {rp.original_price && <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{rp.original_price}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>
      
      <Footer />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-amber {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          50% { transform: scale(1.4); box-shadow: 0 0 0 4px rgba(245, 158, 11, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
        .pulse-amber { animation: pulse-amber 1.5s infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .related-card:hover { transform: translateY(-4px); border-color: rgba(237,128,233,0.35) !important; transition: all 0.25s; }
        @media (max-width: 768px) {
          .product-layout { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}} />
    </div>
  );
};

export default ProductDetail;
