import RetroBackground from '@/components/RetroBackground';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import AnimatedVideoCarousel from '@/components/AnimatedVideoCarousel';
import HowItWorks from '@/components/HowItWorks';

export default function Home() {
  return (
    <main className="min-h-screen relative flex flex-col">
      {/* WebGL and CRT Background Layer */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <RetroBackground />
      </div>

      {/* Content Overlay */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
        <Navbar />

        {/* Hero Section */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', textAlign: 'center', marginTop: '40px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 24px', borderRadius: '100px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)', marginBottom: '30px' }}>
              <span style={{ color: '#facc15', fontSize: '1.1rem', filter: 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.6))' }}>✨</span>
              <span style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 600, letterSpacing: '0.5px' }}>The Future of AI Advertising</span>
            </div>

            <h1 style={{ textAlign: 'center', lineHeight: 1.1, marginBottom: '24px' }}>
              <span style={{ display: 'block', fontWeight: 800, fontSize: 'clamp(3.5rem, 9vw, 6rem)', letterSpacing: '-2px', color: '#fff', textShadow: '0 8px 16px rgba(0,0,0,0.5)' }}>
                Kami membuat iklan AI UGC<br />
                yang <span style={{ color: '#39ff14' }}>menjual.</span>
              </span>
            </h1>

            <p style={{ maxWidth: '750px', fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', fontWeight: 400, color: 'rgba(255, 255, 255, 0.7)', marginBottom: '40px', lineHeight: 1.6 }}>
              We create incredibly <span style={{ color: '#fff', fontWeight: 600 }}>real</span> AI product videos and ads, engineered specifically to make sure your products <span style={{ color: '#fff', fontWeight: 600 }}>sell out</span>.
            </p>
            <div style={{ gap: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link href="/api/auth/signin?callbackUrl=/dashboard">
                  <button className="btn-retro" style={{ padding: '16px 32px', fontSize: '1.2rem' }}>
                    Join NOW
                  </button>
                </Link>
              </div>
              <span style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500, letterSpacing: '0.5px' }}>
                Klaim 3 video gratis!
              </span>
            </div>
          </div>
        </div>

        {/* Scrolling Video Carousel */}
        <div style={{ width: '100%', paddingBottom: '60px' }}>
          <AnimatedVideoCarousel />
        </div>

        {/* How It Works Section */}
        <div style={{ width: '100%', marginBottom: '100px' }}>
          <HowItWorks />
        </div>

      </div>

    </main>
  );
}
