import { useState, useEffect  } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axios.js';
import useAuthStore from '../store/authStore.js';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MetalButton, LiquidButton } from '../components/ui/Buttons';

// Silhouette from ProductDetail for placeholder images
const Silhouette = ({ category, size = 80 }) => {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", style: { color: 'var(--border)', opacity: 0.5 } };
  if (category === 'Apparel' || category?.toLowerCase().includes('hoodie') || category?.toLowerCase().includes('t-shirt')) {
    return <svg {...props}><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>;
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
  return (
    <svg {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <path d="M3 9h18"/>
      <path d="M9 21V9"/>
    </svg>
  );
};

const Cart = () => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = sessionStorage.getItem('syncSummitCart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const updateQuantity = (idx, delta) => {
    const newItems = [...cartItems];
    newItems[idx].quantity += delta;
    if (newItems[idx].quantity < 1) newItems[idx].quantity = 1; // Prevent going below 1 via button
    
    setCartItems(newItems);
    sessionStorage.setItem('syncSummitCart', JSON.stringify(newItems));
  };

  const removeItem = (idx) => {
    const newItems = [...cartItems];
    newItems.splice(idx, 1);
    setCartItems(newItems);
    sessionStorage.setItem('syncSummitCart', JSON.stringify(newItems));
    toast('Item removed', { icon: '🗑️', style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontFamily: 'DM Sans' }});
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? (subtotal > 2000 ? 0 : 99) : 0;
  const taxes = Math.round(subtotal * 0.18); // 18% GST approx
  const total = subtotal + shipping + taxes;

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckout = async () => {
    if (!user) {
      toast('Please login to checkout', { icon: '🔒', style: { background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontFamily: 'DM Sans' }});
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on backend via configured axiosInstance
      const res = await axiosInstance.post('/payment/create-order', { items: cartItems, totalAmount: total });
      
      const { orderId, amount } = res.data;

      // 2. If it's a mock order (missing API keys), bypass Razorpay UI
      if (orderId.startsWith('order_mock_')) {
        toast('Simulating payment (Dev Mode)...', { icon: '🛠️', style: { background: 'var(--bg-elevated)', color: 'var(--warning)', fontFamily: 'DM Sans' }});
        
        await new Promise(r => setTimeout(r, 1500)); // Simulate delay
        
        const verifyRes = await axiosInstance.post('/payment/verify', 
          { razorpay_order_id: orderId, razorpay_payment_id: `pay_mock_${Date.now()}`, razorpay_signature: 'mock_sig' }
        );

        if (verifyRes.data.success) {
          sessionStorage.removeItem('syncSummitCart');
          setCartItems([]);
          toast.success('Payment successful!', { style: { background: 'var(--bg-elevated)', color: 'var(--success)', border: '1px solid var(--success)', fontFamily: 'DM Sans' }});
          navigate('/dashboard');
        }
        return;
      }

      // 3. Normal Razorpay checkout Flow
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onerror = () => {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
      };
      
      script.onload = () => {
        const options = {
          key: 'rzp_test_mock', // Usually injected from backend or process.env on frontend
          amount: amount,
          currency: 'INR',
          name: 'SyncSummit',
          description: 'Cart Checkout',
          order_id: orderId,
          handler: async function (response) {
            try {
              const verifyRes = await axiosInstance.post('/payment/verify', { ...response });
              if (verifyRes.data.success) {
                sessionStorage.removeItem('syncSummitCart');
                setCartItems([]);
                toast.success('Order placed successfully!', { style: { background: 'var(--bg-elevated)', color: 'var(--success)', border: '1px solid var(--success)', fontFamily: 'DM Sans' }});
                navigate('/dashboard');
              }
            } catch (err) {
              toast.error('Payment verification failed');
            }
          },
          theme: { color: '#ED80E9' }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function () {
          toast.error('Payment failed or cancelled');
          setIsProcessing(false);
        });
        rzp.open();
        setIsProcessing(false);
      };
      document.body.appendChild(script);

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to initiate checkout');
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar cartCount={totalItemsCount} />
      
      <main style={{ flex: 1, paddingTop: '64px', maxWidth: '1200px', margin: '0 auto', width: '100%', paddingBottom: '64px' }}>
        
        <div style={{ padding: '32px 24px 24px' }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '32px', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Your Cart
          </h1>
          <p style={{ fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-secondary)' }}>
            {cartItems.length > 0 ? `You have ${totalItemsCount} item${totalItemsCount !== 1 ? 's' : ''} in your cart.` : 'Your cart is empty.'}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div style={{ padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--border-mid)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '24px' }}>
              <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <MetalButton onClick={() => navigate('/products')}>Return to Shop</MetalButton>
          </div>
        ) : (
          <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '48px', padding: '0 24px' }}>
            
            {/* ITEMS LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <AnimatePresence>
                {cartItems.map((item, idx) => (
                  <motion.div 
                    key={`${item.product_id}-${item.size}-${idx}`}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    layout
                    style={{ display: 'flex', gap: '24px', padding: '24px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}
                  >
                    <div style={{ width: '100px', height: '100px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Silhouette category={item.name} size={48} />
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: '18px', color: 'var(--text-primary)', marginBottom: '4px' }}>{item.name}</h3>
                          {item.size && <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Size: {item.size}</div>}
                        </div>
                        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '16px', color: 'var(--text-primary)', fontWeight: 500 }}>
                          ₹{item.price.toLocaleString()}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button 
                            onClick={() => updateQuantity(idx, -1)}
                            disabled={item.quantity <= 1}
                            style={{ width: '32px', height: '32px', background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer', opacity: item.quantity <= 1 ? 0.5 : 1 }}
                          >−</button>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', color: 'var(--text-primary)', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(idx, 1)}
                            style={{ width: '32px', height: '32px', background: 'var(--bg)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', cursor: 'pointer' }}
                          >+</button>
                        </div>
                        
                        <button 
                          onClick={() => removeItem(idx)}
                          style={{ background: 'none', border: 'none', color: 'var(--error)', fontFamily: 'DM Sans', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8, transition: 'opacity 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.opacity = 1}
                          onMouseOut={e => e.currentTarget.style.opacity = 0.8}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ORDER SUMMARY */}
            <div>
              <div style={{ position: 'sticky', top: '96px', padding: '24px', background: 'var(--bg-elevated)', border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: '20px', color: 'var(--text-primary)', marginBottom: '24px' }}>Order Summary</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'DM Sans', fontSize: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Subtotal</span>
                    <span style={{ fontFamily: 'JetBrains Mono' }}>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Estimated Tax (18%)</span>
                    <span style={{ fontFamily: 'JetBrains Mono' }}>₹{taxes.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Shipping</span>
                    <span style={{ fontFamily: 'JetBrains Mono' }}>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)', fontWeight: 600, fontSize: '18px', alignItems: 'baseline' }}>
                    <span>Total</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '24px', color: 'var(--orchid)' }}>₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ marginTop: '32px' }}>
                  <MetalButton 
                    variant="primary"
                    onClick={handleCheckout} 
                    style={{ width: '100%', padding: '16px', fontSize: '16px' }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
                  </MetalButton>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: '12px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  Secure SSL Checkout
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          .cart-layout { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}} />
    </div>
  );
};

export default Cart;
