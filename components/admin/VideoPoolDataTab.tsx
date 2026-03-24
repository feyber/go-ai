"use client";

import { useState, useEffect } from "react";

export default function VideoPoolDataTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics", { cache: 'no-store' });
      const data = await res.json();
      if (!data.error) setStats(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center" style={{ color: '#39ff14', letterSpacing: '2px' }}>LOADING VIDEO CORE...</div>;

  return (
    <div style={{ padding: '20px', background: 'rgba(10, 10, 10, 0.9)', borderRadius: '12px', border: '1px solid #333' }}>
      <h2 className="text-glow-green" style={{ fontSize: '1.5rem', color: '#39ff14', marginBottom: '20px', textTransform: 'uppercase' }}>
        Video Pool System Hub
      </h2>

      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        {/* Total Pool */}
        <div style={{ padding: '30px', background: 'linear-gradient(135deg, rgba(255,255,0,0.1) 0%, rgba(10,10,10,1) 100%)', border: '1px solid #ffff00', borderRadius: '12px' }}>
          <div style={{ color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Master Stock</div>
          <div style={{ color: '#ffff00', fontSize: '2.5rem', fontWeight: 'bold', marginTop: '10px' }}>
            {stats.totalVideosPool} videos
          </div>
        </div>

        {/* Assigned */}
        <div style={{ padding: '30px', background: 'linear-gradient(135deg, rgba(255,0,127,0.1) 0%, rgba(10,10,10,1) 100%)', border: '1px solid #ff007f', borderRadius: '12px' }}>
          <div style={{ color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Assigned Output</div>
          <div className="text-glow-pink" style={{ color: '#ff007f', fontSize: '2.5rem', fontWeight: 'bold', marginTop: '10px' }}>
            {stats.assignedVideos} out
          </div>
        </div>

        {/* Available */}
        <div style={{ padding: '30px', background: 'linear-gradient(135deg, rgba(57,255,20,0.1) 0%, rgba(10,10,10,1) 100%)', border: '1px solid #39ff14', borderRadius: '12px' }}>
          <div style={{ color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Currently Left Available</div>
          <div className="text-glow-green" style={{ color: '#39ff14', fontSize: '2.5rem', fontWeight: 'bold', marginTop: '10px' }}>
            {stats.availableVideos} ready
          </div>
        </div>

      </div>

      <h2 className="text-glow-green" style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '15px', textTransform: 'uppercase' }}>
        Detailed Distribution
      </h2>

      <div style={{ display: 'flex', gap: '10px', height: '50px', borderRadius: '25px', overflow: 'hidden', border: '2px solid #555', marginBottom: '40px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)' }}>
        {stats.totalVideosPool > 0 ? (
          <>
            <div style={{ width: `${(stats.assignedVideos / stats.totalVideosPool) * 100}%`, background: '#ff007f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', textShadow: '1px 1px 2px #000' }}>
              {stats.assignedVideos} Assigned ({(stats.assignedVideos / stats.totalVideosPool * 100).toFixed(1)}%)
            </div>
            <div style={{ width: `${(stats.availableVideos / stats.totalVideosPool) * 100}%`, background: '#39ff14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', fontSize: '0.9rem' }}>
              {stats.availableVideos} Available ({(stats.availableVideos / stats.totalVideosPool * 100).toFixed(1)}%)
            </div>
          </>
        ) : (
          <div style={{ width: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '0.9rem', letterSpacing: '2px' }}>
            POOL EMPTY - RESTOCK REQUIRED
          </div>
        )}
      </div>

    </div>
  );
}
