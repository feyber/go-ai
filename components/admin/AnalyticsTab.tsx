"use client";

import { useState, useEffect } from "react";

export default function AnalyticsTab() {
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "all">("all");

  const fetchStats = () => {
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/analytics?period=${period}`, { cache: 'no-store' }).then(res => res.json()),
      fetch(`/api/admin/transactions`, { cache: 'no-store' }).then(res => res.json())
    ]).then(([data, txData]) => {
      if (!data.error) setStats(data);
      if (txData.success) setTransactions(txData.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  if (loading) return <div className="p-8 text-center" style={{ color: '#39ff14', letterSpacing: '2px' }}>CALCULATING STATISTICS...</div>;

  const handleResetData = async () => {
    if (!window.confirm("WARNING: This will delete ALL revenue history and subscription data. This cannot be undone. Proceed?")) return;
    if (!window.confirm("ARE YOU ABSOLUTELY SURE? Your earnings history will be wiped to Rp 0.")) return;

    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: 'revenue_data' })
      });
      const data = await res.json();
      if (data.success) {
        alert("Revenue Data Reset Complete.");
        fetchStats();
      } else {
        alert("Reset failed: " + data.error);
      }
    } catch (e) {
      alert("Error performing reset");
    }
  };

  const handleResetFonnte = async () => {
    if (!window.confirm("ARE YOU SURE? This will reset the Fonnte Quota back to 1000/1000.")) return;

    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: 'fonnte_quota' })
      });
      const data = await res.json();
      if (data.success) {
        alert("Fonnte Quota Refreshed!");
        fetchStats();
      } else {
        alert("Reset failed: " + data.error);
      }
    } catch (e) {
      alert("Error performing reset");
    }
  };

  if (loading) return <div className="p-8 text-center" style={{ color: '#39ff14', letterSpacing: '2px' }}>CALCULATING STATISTICS...</div>;
  if (!stats) return <div className="p-8 text-center" style={{ color: '#ff007f', letterSpacing: '1px' }}>Failed to load analytics data. Server error.</div>;

  return (
    <div style={{ padding: '20px', background: 'rgba(10, 10, 10, 0.9)', borderRadius: '12px', border: '1px solid #333' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className="text-glow-pink" style={{ fontSize: '1.5rem', color: '#ff007f', textTransform: 'uppercase', margin: 0 }}>
          Analisa Berbayar
        </h2>
        <button 
          onClick={handleResetData}
          className="btn-retro"
          style={{ background: 'rgba(255,0,0,0.1)', borderColor: '#ff4444', color: '#ff4444', fontSize: '0.8rem', padding: '8px 15px' }}
        >
          🚨 RESET REVENUE & SUBS DATA
        </button>
      </div>

      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        {/* Revenue Card */}
        <div style={{ padding: '30px', background: 'linear-gradient(135deg, rgba(255,0,127,0.1) 0%, rgba(10,10,10,1) 100%)', border: '1px solid #ff007f', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>System Revenue</div>
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value as any)}
              style={{ background: '#0a0a0a', color: '#ff007f', border: '1px solid #ff007f', padding: '5px 10px', borderRadius: '6px', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="daily">Today</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <div style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '5px' }}>
              {period === 'daily' ? 'Today\'s Earnings' : period === 'weekly' ? '7-Day Earnings' : period === 'monthly' ? '30-Day Earnings' : 'All-Time Earnings'}
            </div>
            <div className="text-glow-pink" style={{ color: '#ff007f', fontSize: '2.5rem', fontWeight: 'bold', lineHeight: '1' }}>
              Rp {stats.filteredRevenue.toLocaleString('id-ID')}
            </div>
            
            {period !== 'all' && (
              <div style={{ marginTop: '15px', color: '#555', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #222', paddingTop: '10px' }}>
                <span>Lifetime Total:</span>
                <span style={{ color: '#aaa', fontWeight: 'bold' }}>Rp {stats.totalRevenue.toLocaleString('id-ID')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Users Card */}
        <div style={{ padding: '30px', background: 'linear-gradient(135deg, rgba(57,255,20,0.1) 0%, rgba(10,10,10,1) 100%)', border: '1px solid #39ff14', borderRadius: '12px' }}>
          <div style={{ color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Users</div>
          <div className="text-glow-green" style={{ color: '#39ff14', fontSize: '2.5rem', fontWeight: 'bold', marginTop: '10px' }}>
            {stats.totalUsers} registered
          </div>
        </div>

        {/* Subs Card */}
        <div style={{ padding: '30px', background: 'linear-gradient(135deg, rgba(0,243,255,0.1) 0%, rgba(10,10,10,1) 100%)', border: '1px solid #00f3ff', borderRadius: '12px' }}>
          <div style={{ color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Subscribers</div>
          <div style={{ color: '#00f3ff', fontSize: '2.5rem', fontWeight: 'bold', marginTop: '10px', textShadow: '0 0 10px rgba(0,243,255,0.5)' }}>
            {stats.activeSubscribers} paying
          </div>
        </div>

        {/* Fonnte Quota Card */}
        <div style={{ padding: '30px', background: 'linear-gradient(135deg, rgba(255,165,0,0.1) 0%, rgba(10,10,10,1) 100%)', border: '1px solid #ffa500', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#aaa', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Fonnte API Quota</div>
            <button 
              onClick={handleResetFonnte}
              className="btn-retro"
              style={{ background: 'transparent', borderColor: '#ffa500', color: '#ffa500', fontSize: '0.7rem', padding: '4px 8px' }}
            >
              🔄 RESET
            </button>
          </div>
          <div style={{ color: '#ffa500', fontSize: '2.5rem', fontWeight: 'bold', marginTop: '10px', textShadow: '0 0 10px rgba(255,165,0,0.5)' }}>
            {stats.fonnteQuota} / 1000
          </div>
        </div>
      </div>

      {/* User Transaction Table */}
      <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px', textTransform: 'uppercase', borderLeft: '4px solid #39ff14', paddingLeft: '15px' }}>
        User Account & Transaction Details
      </h3>
      <div style={{ overflowX: 'auto', background: '#050505', border: '1px solid #222', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: '#ccc' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333', background: '#0a0a0a' }}>
              <th style={{ padding: '15px', textAlign: 'left', textTransform: 'uppercase', fontSize: '0.7rem' }}>User Email</th>
              <th style={{ padding: '15px', textAlign: 'left', textTransform: 'uppercase', fontSize: '0.7rem' }}>Active Plan</th>
              <th style={{ padding: '15px', textAlign: 'left', textTransform: 'uppercase', fontSize: '0.7rem' }}>Expires At</th>
              <th style={{ padding: '15px', textAlign: 'left', textTransform: 'uppercase', fontSize: '0.7rem' }}>PAYG Count</th>
              <th style={{ padding: '15px', textAlign: 'left', textTransform: 'uppercase', fontSize: '0.7rem' }}>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {stats.userDetails.map((user: any) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                <td style={{ padding: '15px', color: '#fff' }}>{user.email}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem',
                    background: user.activeTier === 2 ? 'rgba(255,0,127,0.1)' : user.activeTier === 1 ? 'rgba(57,255,20,0.1)' : '#111',
                    color: user.activeTier === 2 ? '#ff007f' : user.activeTier === 1 ? '#39ff14' : '#555',
                    border: user.activeTier > 0 ? '1px solid currentColor' : '1px solid #222'
                  }}>
                    {user.activeTier === 1 ? 'BASIC' : user.activeTier === 2 ? 'PRO' : 'NONE'}
                  </span>
                </td>
                <td style={{ padding: '15px', fontSize: '0.8rem', color: '#888' }}>
                  {user.expiresAt ? new Date(user.expiresAt).toLocaleDateString() : '-'}
                </td>
                <td style={{ padding: '15px' }}>{user.paygPurchases}</td>
                <td style={{ padding: '15px', color: '#39ff14', fontWeight: 'bold' }}>
                  Rp {user.totalPaid.toLocaleString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transaction History Table */}
      <h3 style={{ color: '#fff', fontSize: '1.2rem', marginTop: '40px', marginBottom: '20px', textTransform: 'uppercase', borderLeft: '4px solid #ff007f', paddingLeft: '15px' }}>
        Purchase / Transaction History
      </h3>
      <div style={{ overflowX: 'auto', background: '#050505', border: '1px solid #222', borderRadius: '8px', maxHeight: '400px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: '#ccc' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333', background: '#0a0a0a' }}>
              <th style={{ padding: '15px', textAlign: 'left', textTransform: 'uppercase', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#0a0a0a' }}>Date</th>
              <th style={{ padding: '15px', textAlign: 'left', textTransform: 'uppercase', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#0a0a0a' }}>Order ID</th>
              <th style={{ padding: '15px', textAlign: 'left', textTransform: 'uppercase', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#0a0a0a' }}>User Email</th>
              <th style={{ padding: '15px', textAlign: 'left', textTransform: 'uppercase', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#0a0a0a' }}>Type</th>
              <th style={{ padding: '15px', textAlign: 'right', textTransform: 'uppercase', fontSize: '0.7rem', position: 'sticky', top: 0, background: '#0a0a0a' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx: any) => {
              const date = new Date(tx.startedAt).toLocaleString('id-ID');
              const isPayg = tx.orderId?.startsWith('PAYG_');
              return (
                <tr key={tx.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '15px', color: '#888' }}>{date}</td>
                  <td style={{ padding: '15px', color: '#fff' }}>{tx.orderId}</td>
                  <td style={{ padding: '15px', color: '#ccc' }}>{tx.user?.email || 'Unknown'}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem',
                      background: isPayg ? 'rgba(255,0,127,0.1)' : 'rgba(57,255,20,0.1)',
                      color: isPayg ? '#ff007f' : '#39ff14',
                      border: '1px solid currentColor'
                    }}>
                      {isPayg ? `PAYG ${tx.tier}` : `SUB Tier ${tx.tier}`}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right', color: '#39ff14', fontWeight: 'bold' }}>
                    Rp {tx.amount.toLocaleString('id-ID')}
                  </td>
                </tr>
              );
            })}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#555' }}>No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
