import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Globe, User, ArrowRight } from 'lucide-react';

const speakers = [
  {
    id: 1,
    name: 'Dr. Aris Vlas',
    role: 'Chief AI Scientist, NexusTech',
    image: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=400&auto=format&fit=crop',
    bio: 'Pioneer in Generative AI and neural architecture search. Leading research in multi-modal learning systems.'
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'Founder & CEO, BuildStack',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    bio: 'Serial entrepreneur and investor. Built and sold two enterprise SaaS platforms before founding BuildStack.'
  },
  {
    id: 3,
    name: 'Michael Chang',
    role: 'VP of Engineering, CloudScale',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop',
    bio: 'Expert in distributed systems and cloud infrastructure. Formerly led core platform teams at major tech giants.'
  },
  {
    id: 4,
    name: 'Elena Rodriguez',
    role: 'Head of Product Design, Artifact',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
    bio: 'Award-winning designer focusing on spatial computing and next-generation human-computer interaction.'
  },
  {
    id: 5,
    name: 'James Wilson',
    role: 'Director of Web3 Strategy, Polygon',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
    bio: 'Blockchain architecture specialist helping traditional finance institutions transition to decentralized systems.'
  },
  {
    id: 6,
    name: 'Amira Hassan',
    role: 'Cybersecurity Lead, Sentinel',
    image: 'https://images.unsplash.com/photo-1598550874175-4d0ef43ce418?q=80&w=400&auto=format&fit=crop',
    bio: 'Defending enterprise networks against advanced persistent threats. Passionate about zero-trust architecture.'
  }
];

const SpeakerCard = ({ speaker, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-mid)',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, border-color 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.borderColor = 'rgba(237,128,233,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-mid)';
      }}
    >
      <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
        <img 
          src={speaker.image} 
          alt={speaker.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='var(--orchid)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}>
            <User size={14} color="#fff" />
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='var(--orchid)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}>
            <Globe size={14} color="#fff" />
          </div>
        </div>
      </div>
      
      <div style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'Syne', fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{speaker.name}</h3>
        <p style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--orchid)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>{speaker.role}</p>
        <p style={{ fontFamily: 'DM Sans', fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{speaker.bio}</p>
      </div>
    </motion.div>
  );
};

const Speakers = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1, paddingTop: '120px', paddingBottom: '100px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '80px', maxWidth: '800px', margin: '0 auto 80px' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--grad-subtle)', border: '1px solid var(--border-mid)', padding: '6px 12px', borderRadius: '100px', marginBottom: '24px' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--orchid)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visionaries & Leaders</span>
            </div>
            <h1 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 'clamp(40px, 6vw, 64px)', color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '24px' }}>
              Meet Our <span style={{ color: 'var(--orchid)' }}>Speakers</span>
            </h1>
            <p style={{ fontFamily: 'DM Sans', fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Learn from the brightest minds in technology, design, and business. Our speakers are carefully selected to bring you cutting-edge insights and practical knowledge.
            </p>
          </motion.div>

          {/* Speakers Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px', marginBottom: '100px' }}>
            {speakers.map((speaker, index) => (
              <SpeakerCard key={speaker.id} speaker={speaker} index={index} />
            ))}
          </div>

          {/* CTA Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            style={{ 
              background: 'var(--grad-primary)', 
              borderRadius: '24px', 
              padding: '60px 40px', 
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '36px', color: 'var(--bg)', marginBottom: '16px' }}>Want to speak at SyncSummit?</h2>
              <p style={{ fontFamily: 'DM Sans', fontSize: '18px', color: 'rgba(10,10,10,0.8)', marginBottom: '32px', lineHeight: 1.6 }}>
                We are always looking for passionate experts to share their knowledge with our community. Submit your proposal for our next event.
              </p>
              <button 
                style={{ 
                  background: 'var(--bg)', color: 'var(--text-primary)', 
                  border: 'none', borderRadius: '8px', padding: '14px 28px', 
                  fontFamily: 'DM Sans', fontWeight: 600, fontSize: '16px',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  cursor: 'pointer', transition: 'transform 0.2s',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                onClick={() => window.location.href = '/contact'}
              >
                Submit Proposal <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Speakers;
