import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Speakers = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ color: 'var(--text-primary)', fontFamily: 'Syne' }}>Speakers - Coming Soon</h1>
      </main>
      <Footer />
    </div>
  );
};

export default Speakers;
