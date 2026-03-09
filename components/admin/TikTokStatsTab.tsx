"use client";

import React, { useState, useEffect } from "react";
import { FaSync, FaTiktok, FaEye, FaHeart, FaComment, FaBookmark } from "react-icons/fa";

export default function TikTokStatsTab() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<"all" | "daily" | "weekly" | "monthly" | "yearly">("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tiktok-stats?filter=${timeFilter}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch TikTok stats", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeFilter]);

  const handleSyncAll = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/scrape-tiktok", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        alert(`Successfully synced stats for ${json.updatedCount} TikTok URLs.`);
        fetchData();
      } else {
        alert(`Error: ${json.error}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to sync TikTok stats");
    } finally {
      setSyncing(false);
    }
  };

  const totalViews = data.reduce((acc, userStats) => acc + (userStats.totalViews || 0), 0);
  const totalLinks = data.reduce((acc, userStats) => acc + (userStats.totalLinks || 0), 0);
  const totalUsers = data.length;

  return (
    <div style={{ background: 'rgba(10, 10, 10, 0.9)', padding: '30px', borderRadius: '12px', border: '1px solid #333' }}>

      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <h2 className="text-glow-pink" style={{ fontSize: '1.5rem', color: '#ff007f', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaTiktok /> TikTok Post Analytics
        </h2>

        <div style={{ display: 'flex', gap: '15px' }}>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            style={{ padding: '8px 15px', background: '#0f0f0f', color: '#fff', border: '1px solid #333', borderRadius: '6px', outline: 'none' }}
          >
            <option value="all">All Time</option>
            <option value="daily">Today (Daily)</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="yearly">This Year</option>
          </select>

          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="btn-retro flex items-center gap-2"
            style={{ padding: '8px 15px', background: 'rgba(57, 255, 20, 0.1)', borderColor: '#39ff14', color: '#39ff14' }}
          >
            <FaSync className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing..." : "Sync All Stats"}
          </button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: '#0a0a0a', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #ff007f', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Total Views</div>
          <div style={{ fontSize: '2rem', color: '#fff', fontWeight: 'bold' }}>{totalViews.toLocaleString()}</div>
        </div>
        <div style={{ background: '#0a0a0a', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #39ff14', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Links Submitted</div>
          <div style={{ fontSize: '2rem', color: '#fff', fontWeight: 'bold' }}>{totalLinks.toLocaleString()}</div>
        </div>
        <div style={{ background: '#0a0a0a', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #00f3ff', textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Active Users</div>
          <div style={{ fontSize: '2rem', color: '#fff', fontWeight: 'bold' }}>{totalUsers.toLocaleString()}</div>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="text-center text-[#888] py-10">Loading stats...</div>
      ) : data.length === 0 ? (
        <div className="text-center text-[#888] py-10">No TikTok links submitted in this period.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#111', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #333' }}>
                <th style={{ padding: '15px', textAlign: 'left' }}>User</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Date (WIB)</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>TikTok URL</th>
                <th style={{ padding: '15px', textAlign: 'right' }}><FaEye className="inline mr-1" /> Views</th>
                <th style={{ padding: '15px', textAlign: 'right' }}><FaHeart className="inline mr-1" /> Likes</th>
                <th style={{ padding: '15px', textAlign: 'right' }}><FaComment className="inline mr-1" /> Comments</th>
                <th style={{ padding: '15px', textAlign: 'right' }}><FaBookmark className="inline mr-1" /> Saves</th>
              </tr>
            </thead>
            <tbody>
              {data.map((userStats, uIndex) => (
                <React.Fragment key={`user-${uIndex}`}>
                  {userStats.videos.map((vid: any, vIndex: number) => (
                    <tr key={`vid-${vid.id}`} style={{ borderBottom: '1px solid #222', background: vIndex % 2 === 0 ? '#0a0a0a' : 'transparent' }}>
                      <td style={{ padding: '15px', color: '#fff' }}>
                        {vIndex === 0 ? (
                          <div>
                            <div>{userStats.userEmail}</div>
                            {userStats.tiktokUsername && <div style={{ fontSize: '0.8rem', color: '#888' }}>@{userStats.tiktokUsername}</div>}
                          </div>
                        ) : null}
                      </td>
                      <td style={{ padding: '15px', color: '#888' }}>{vid.assignedDate}</td>
                      <td style={{ padding: '15px' }}>
                        {vid.tiktokUrl ? (
                          <a href={vid.tiktokUrl} target="_blank" rel="noreferrer" style={{ color: '#00f3ff', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            View Post
                          </a>
                        ) : (
                          <span style={{ color: '#555' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right', color: '#39ff14' }}>{vid.views?.toLocaleString() || '-'}</td>
                      <td style={{ padding: '15px', textAlign: 'right', color: '#ff007f' }}>{vid.likes?.toLocaleString() || '-'}</td>
                      <td style={{ padding: '15px', textAlign: 'right', color: '#ccc' }}>{vid.comments?.toLocaleString() || '-'}</td>
                      <td style={{ padding: '15px', textAlign: 'right', color: '#ccc' }}>{vid.bookmarks?.toLocaleString() || '-'}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
