import RetroBackground from '@/components/RetroBackground';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen relative flex flex-col">
      {/* WebGL and CRT Background Layer */}
      <RetroBackground />

      {/* Content Overlay */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />

        {/* Hero Section */}
        {/* We use flex: 1 to ensure it takes up the exact remaining screen space
            and align/justify center to lock it dynamically in the center */}
        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(-60px)' }}>
            <h1 style={{ textAlign: 'center', lineHeight: 1.1, marginBottom: '24px', textTransform: 'uppercase' }}>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 'clamp(1.5rem, 4vw, 3rem)', letterSpacing: '2px', color: '#fff', textShadow: '0 4px 8px rgba(0,0,0,0.8)', marginBottom: '10px', marginTop: '32px' }}>
                The Future Of
              </span>
              <span className="text-glow-green" style={{ display: 'block', fontWeight: 900, fontSize: 'clamp(3.5rem, 11vw, 8rem)', letterSpacing: '-2px', color: '#39ff14', textShadow: '0 8px 16px rgba(0,0,0,1)' }}>
                AI Video Commerce
              </span>
            </h1>

            <p style={{ maxWidth: '700px', fontSize: 'clamp(1rem, 2vw, 1.25rem)', fontWeight: 500, marginBottom: '40px', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)', lineHeight: 1.6 }}>
              Elevate your agency with daily curated, exclusive AI videos.
              No duplicates. Full ownership rights. Download, post, and watch your metrics skyrocket.
            </p>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/api/auth/signin?callbackUrl=/dashboard">
                <button className="btn-retro" style={{ padding: '16px 32px', fontSize: '1.2rem' }}>
                  Join The Network
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}
