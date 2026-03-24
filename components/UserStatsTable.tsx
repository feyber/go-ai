"use client";

import { useState, useEffect } from "react";
import { FaEye, FaHeart, FaComment, FaBookmark, FaShare, FaTiktok } from "react-icons/fa";

export default function UserStatsTable({ videos }: { videos: any[] }) {
  const [mounted, setMounted] = useState(false);
  const submittedVideos = videos.filter(v => !!v.tiktokUrl);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || submittedVideos.length === 0) return null;

  const formatNum = (num: number) => {
    return num.toLocaleString();
  };

  // Calculate Aggregates
  const totals = submittedVideos.reduce((acc, curr) => ({
    views: acc.views + (curr.views || 0),
    likes: acc.likes + (curr.likes || 0),
    comments: acc.comments + (curr.comments || 0),
    bookmarks: acc.bookmarks + (curr.bookmarks || 0),
    shares: acc.shares + (curr.shares || 0)
  }), { views: 0, likes: 0, comments: 0, bookmarks: 0, shares: 0 });

  return (
    <div style={{ marginTop: '50px', padding: '30px', background: 'rgba(10, 10, 10, 0.9)', borderRadius: '12px', border: '1px solid #333' }}>
      <h2 className="text-glow-pink" style={{ fontSize: '1.5rem', color: '#ff007f', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase' }}>
        <FaTiktok /> Engagement Tracking List
      </h2>

      {/* Aggregate Totals Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', background: 'rgba(57, 255, 20, 0.05)', border: '1px solid rgba(57, 255, 20, 0.3)', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '5px' }}><FaEye className="inline mr-1" /> Total Views</div>
          <div className="text-glow-green" style={{ color: '#39ff14', fontSize: '1.5rem', fontWeight: 'bold' }}>{formatNum(totals.views)}</div>
        </div>
        <div style={{ padding: '20px', background: 'rgba(255, 0, 127, 0.05)', border: '1px solid rgba(255, 0, 127, 0.3)', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '5px' }}><FaHeart className="inline mr-1" /> Total Likes</div>
          <div className="text-glow-pink" style={{ color: '#ff007f', fontSize: '1.5rem', fontWeight: 'bold' }}>{formatNum(totals.likes)}</div>
        </div>
        <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '5px' }}><FaComment className="inline mr-1" /> Total Comms</div>
          <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>{formatNum(totals.comments)}</div>
        </div>
        <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '5px' }}><FaBookmark className="inline mr-1" /> Total Saves</div>
          <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>{formatNum(totals.bookmarks)}</div>
        </div>
        <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '5px' }}><FaShare className="inline mr-1" /> Total Shares</div>
          <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>{formatNum(totals.shares)}</div>
        </div>
      </div>
      
      <div className="table-scroll" style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #222' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#111', textTransform: 'uppercase', letterSpacing: '1px', color: '#888' }}>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #222' }}>Video No.</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #222' }}>TikTok URL</th>
              <th style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #222' }}>Views</th>
              <th style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #222' }}>Likes</th>
              <th style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #222' }}>Comms</th>
              <th style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #222' }}>Saves</th>
              <th style={{ padding: '15px', textAlign: 'right', borderBottom: '2px solid #222' }}>Shares</th>
            </tr>
          </thead>
          <tbody>
            {submittedVideos.map((vid, idx) => (
              <tr key={vid.id || idx} style={{ borderBottom: '1px solid #222', background: idx % 2 === 0 ? '#0a0a0a' : 'transparent' }}>
                <td style={{ padding: '15px', color: '#39ff14', fontWeight: 'bold' }}>#{idx + 1}</td>
                <td style={{ padding: '15px' }}>
                  <a href={vid.tiktokUrl} target="_blank" rel="noreferrer" style={{ color: '#00f3ff', textDecoration: 'underline', fontSize: '0.8rem', wordBreak: 'break-all', maxWidth: '200px', display: 'block' }}>
                    {vid.tiktokUrl.substring(0, 40)}...
                  </a>
                </td>
                <td style={{ padding: '15px', textAlign: 'right', color: '#fff' }}>{formatNum(vid.views || 0)}</td>
                <td style={{ padding: '15px', textAlign: 'right', color: '#ff007f' }}>{formatNum(vid.likes || 0)}</td>
                <td style={{ padding: '15px', textAlign: 'right', color: '#ccc' }}>{formatNum(vid.comments || 0)}</td>
                <td style={{ padding: '15px', textAlign: 'right', color: '#ccc' }}>{formatNum(vid.bookmarks || 0)}</td>
                <td style={{ padding: '15px', textAlign: 'right', color: '#ccc' }}>{formatNum(vid.shares || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
