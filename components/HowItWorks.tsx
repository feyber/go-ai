"use client";

import React from 'react';
import { FaUserPlus, FaUserEdit, FaCloudDownloadAlt, FaRocket } from 'react-icons/fa';

export default function HowItWorks() {
  const steps = [
    { id: '01', title: 'Login', icon: <FaUserPlus size={22} /> },
    { id: '02', title: 'Lengkapi Profil', icon: <FaUserEdit size={22} /> },
    { id: '03', title: 'Download video', icon: <FaCloudDownloadAlt size={22} /> },
    { id: '04', title: 'Upload Video', icon: <FaRocket size={22} /> },
  ];

  return (
    <section id="how-it-works" style={{ backgroundColor: 'transparent', position: 'relative', zIndex: 10 }}>
      {/* Main Outer Box like in the example */}
      <div className="container" style={{
        maxWidth: '1140px',
        margin: '0 auto',
        backgroundColor: 'rgba(5, 5, 5, 0.95)',
        borderRadius: '32px',
        padding: '60px 40px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(57, 255, 20, 0.03)'
      }}>

        {/* Magic Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '50px',
          backgroundColor: 'rgba(0, 255, 128, 0.1)',
          border: '1px solid var(--neon-green)',
          color: 'var(--neon-green)',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '32px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          <span style={{ fontSize: '1rem' }}>✨</span> Keajaiban
        </div>

        {/* Header */}
        <h2 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 800,
          color: '#fff',
          marginBottom: '20px',
          lineHeight: 1.1,
          letterSpacing: '-1px'
        }}>
          Inspirasi Kreatif
        </h2>
        <p style={{
          fontSize: 'clamp(1.1rem, 1.5vw, 1.3rem)',
          color: 'rgba(255, 255, 255, 0.4)',
          maxWidth: '650px',
          marginBottom: '80px',
          lineHeight: 1.6
        }}>
          Kami bukan cuma buat video, kami sediain *winning ads* structure yang bikin produk kamu ludes dalam hitungan detik. Eksekusi cepat, hasil dahsyat.
        </p>

        {/* Steps Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          {steps.map((step) => (
            <div key={step.id} className="how-it-works-card" style={{
              padding: '34px 28px',
              background: step.id === '04' ? 'rgba(57, 255, 20, 0.04)' : 'rgba(255, 255, 255, 0.02)',
              border: step.id === '04' ? '1px solid #39ff14' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
              cursor: 'default',
              backdropFilter: 'blur(12px)',
              position: 'relative',
              boxShadow: step.id === '04' ? '0 0 20px rgba(57, 255, 20, 0.05)' : 'none',
              overflow: 'hidden'
            }}>
              {/* Subtle inner glow for cyberpunk feel */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              }} />

              <div style={{
                padding: '14px',
                background: step.id === '04' ? 'rgba(57, 255, 20, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                borderRadius: '16px',
                width: 'fit-content',
                color: step.id === '04' ? '#39ff14' : 'rgba(255, 255, 255, 0.5)',
                boxShadow: step.id === '04' ? '0 0 15px rgba(57, 255, 20, 0.2)' : 'none',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                {step.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{
                  fontSize: '0.9rem',
                  color: step.id === '04' ? '#39ff14' : 'rgba(255, 255, 255, 0.2)',
                  fontWeight: 900,
                  letterSpacing: '3px',
                  fontFamily: 'monospace'
                }}>{step.id}</span>
                <h3 style={{
                  fontSize: '1.25rem',
                  color: '#fff',
                  fontWeight: 700,
                  letterSpacing: '-0.4px',
                  lineHeight: 1.3
                }}>{step.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Global CSS for enhanced hover effects */}
        <style jsx global>{`
          .how-it-works-card:hover {
            transform: translateY(-12px) scale(1.02);
            background: rgba(255, 255, 255, 0.05) !important;
            border-color: rgba(57, 255, 20, 0.6) !important;
            box-shadow: 0 30px 60px rgba(0,0,0,0.6), 0 0 30px rgba(57, 255, 20, 0.15) !important;
          }
          
          .how-it-works-card:hover h3 {
            color: #39ff14;
            transition: color 0.3s ease;
          }

          @media (max-width: 768px) {
            .how-it-works-card {
              padding: 26px !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
