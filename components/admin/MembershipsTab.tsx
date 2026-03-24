"use client";

import { useState, useEffect } from "react";

export default function MembershipsTab() {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/memberships", { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (!data.error) setMemberships(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center" style={{ color: '#39ff14', letterSpacing: '2px' }}>LOADING MEMBERSHIPS...</div>;

  return (
    <div style={{ padding: '20px', background: 'rgba(10, 10, 10, 0.9)', borderRadius: '12px', border: '1px solid #333' }}>
      <h2 className="text-glow-pink" style={{ fontSize: '1.5rem', color: '#ff007f', marginBottom: '20px', textTransform: 'uppercase' }}>
        Active Subscriber Roster
      </h2>

      <div className="table-scroll">
        <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left', color: '#fff' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333' }}>
              <th style={{ padding: '15px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Member</th>
              <th style={{ padding: '15px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact</th>
              <th style={{ padding: '15px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Plan</th>
              <th style={{ padding: '15px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Expiration / Status</th>
            </tr>
          </thead>
          <tbody>
            {memberships.map((m: any, idx: number) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #222', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '15px' }}>
                  <div style={{ fontWeight: 'bold' }}>{m.name || 'Unnamed'}</div>
                  <div style={{ color: '#aaa', fontSize: '0.9rem' }}>{m.email}</div>
                </td>
                <td style={{ padding: '15px' }}>
                  <div style={{ color: '#aaa', fontSize: '0.9rem' }}>
                    WA: {m.whatsapp ? (
                      <a 
                        href={`https://wa.me/${m.whatsapp.replace(/\D/g, '').replace(/^0/, '62').replace(/^8/, '628')}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ color: '#39ff14', textDecoration: 'none', marginLeft: '5px' }}
                        onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        {m.whatsapp}
                      </a>
                    ) : 'N/A'}
                  </div>
                  <div style={{ color: '#aaa', fontSize: '0.9rem' }}>
                    TikTok: {m.tiktok ? (
                      <a 
                        href={`https://www.tiktok.com/@${m.tiktok.replace('@', '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ color: '#00f3ff', textDecoration: 'none', marginLeft: '5px' }}
                        onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        {m.tiktok}
                      </a>
                    ) : 'N/A'}
                  </div>
                </td>
                <td style={{ padding: '15px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem', 
                    background: m.plan.includes('PAYG') ? 'rgba(255,0,127,0.2)' : (m.plan !== 'None' ? 'rgba(57,255,20,0.2)' : '#333'), 
                    color: m.plan.includes('PAYG') ? '#ff007f' : (m.plan !== 'None' ? '#39ff14' : '#aaa') 
                  }}>
                    {m.plan}
                  </span>
                </td>
                <td style={{ padding: '15px' }}>
                  <div style={{ color: m.status === 'completed' ? '#39ff14' : '#aaa' }}>{m.status.toUpperCase()}</div>
                  {m.expiresAt && <div style={{ fontSize: '0.85rem', color: '#888' }}>Exp: {new Date(m.expiresAt).toLocaleDateString()}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
