"use client";

import { useState, useEffect } from "react";
import { FaEye, FaHeart, FaComment, FaBookmark, FaShare, FaTiktok, FaPlus } from "react-icons/fa";
import { Turnstile } from "@marsidev/react-turnstile";

interface TikTokPost {
  id: string;
  url: string;
  views: number;
  likes: number;
  comments: number;
  bookmarks: number;
  shares: number;
  createdAt: string;
}

export default function TikTokTracker() {
  const [posts, setPosts] = useState<TikTokPost[]>([]);
  const [url, setUrl] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch all existing posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/user/tiktok-posts");
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!url || isSubmitting || !turnstileToken) {
      if (!turnstileToken) alert("Selesaikan cek keamanan (Turnstile) dulu ya Kak.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/tiktok-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tiktokUrl: url,
          turnstileToken: turnstileToken 
        })
      });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => [data.post, ...prev]);
        setUrl(""); // Clear field
      } else {
        alert("Error: " + data.error);
      }
    } catch (e) {
      alert("Submit gagal, coba lagi.");
    }
    setIsSubmitting(false);
  };

  const formatNum = (num: number) => num.toLocaleString();

  // Aggregates
  const totals = posts.reduce((acc, p) => ({
    views: acc.views + (p.views || 0),
    likes: acc.likes + (p.likes || 0),
    comments: acc.comments + (p.comments || 0),
    bookmarks: acc.bookmarks + (p.bookmarks || 0),
    shares: acc.shares + (p.shares || 0)
  }), { views: 0, likes: 0, comments: 0, bookmarks: 0, shares: 0 });

  return (
    <div style={{ marginTop: '60px', padding: '30px', background: 'rgba(10, 10, 10, 0.9)', borderRadius: '12px', border: '1px solid #333' }}>
      <h2 className="text-glow-pink" style={{ fontSize: '1.5rem', color: '#ff007f', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase' }}>
        <FaTiktok /> TikTok Post Tracking
      </h2>

      {/* Submit Form */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <input 
          type="text"
          placeholder="Paste your TikTok Video URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          style={{ 
            flex: 1, 
            background: '#000', 
            border: '1px solid #333', 
            color: '#fff', 
            padding: '12px 16px', 
            fontSize: '0.9rem', 
            borderRadius: '6px',
            outline: 'none'
          }}
        />
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || !url || !turnstileToken}
          style={{ 
            background: (isSubmitting || !turnstileToken) ? '#222' : 'rgba(255, 0, 127, 0.15)', 
            color: (isSubmitting || !turnstileToken) ? '#555' : '#ff007f', 
            border: '1px solid currentColor', 
            padding: '12px 20px', 
            fontSize: '0.85rem', 
            borderRadius: '6px', 
            cursor: (url && turnstileToken) ? 'pointer' : 'default',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FaPlus /> {isSubmitting ? "SYNCING..." : "SUBMIT & SYNC"}
        </button>
      </div>

      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>
        <Turnstile 
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""} 
          onSuccess={(token) => setTurnstileToken(token)}
          options={{ theme: 'dark' }}
        />
      </div>

      {/* Aggregate Totals */}
      {posts.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '25px' }}>
            <div style={{ padding: '18px', background: 'rgba(57, 255, 20, 0.05)', border: '1px solid rgba(57, 255, 20, 0.3)', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '4px' }}><FaEye style={{ display: 'inline' }} /> Total Views</div>
              <div className="text-glow-green" style={{ color: '#39ff14', fontSize: '1.4rem', fontWeight: 'bold' }}>{formatNum(totals.views)}</div>
            </div>
            <div style={{ padding: '18px', background: 'rgba(255, 0, 127, 0.05)', border: '1px solid rgba(255, 0, 127, 0.3)', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '4px' }}><FaHeart style={{ display: 'inline' }} /> Total Likes</div>
              <div className="text-glow-pink" style={{ color: '#ff007f', fontSize: '1.4rem', fontWeight: 'bold' }}>{formatNum(totals.likes)}</div>
            </div>
            <div style={{ padding: '18px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '4px' }}><FaComment style={{ display: 'inline' }} /> Total Comms</div>
              <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold' }}>{formatNum(totals.comments)}</div>
            </div>
            <div style={{ padding: '18px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '4px' }}><FaBookmark style={{ display: 'inline' }} /> Total Saves</div>
              <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold' }}>{formatNum(totals.bookmarks)}</div>
            </div>
            <div style={{ padding: '18px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ color: '#aaa', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '4px' }}><FaShare style={{ display: 'inline' }} /> Total Shares</div>
              <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 'bold' }}>{formatNum(totals.shares)}</div>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #222' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#111', textTransform: 'uppercase', letterSpacing: '1px', color: '#888' }}>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #222' }}>#</th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid #222' }}>TikTok URL</th>
                  <th style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '2px solid #222' }}>Views</th>
                  <th style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '2px solid #222' }}>Likes</th>
                  <th style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '2px solid #222' }}>Comms</th>
                  <th style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '2px solid #222' }}>Saves</th>
                  <th style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '2px solid #222' }}>Shares</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, idx) => (
                  <tr key={post.id} style={{ borderBottom: '1px solid #1a1a1a', background: idx % 2 === 0 ? '#0a0a0a' : 'transparent' }}>
                    <td style={{ padding: '12px 15px', color: '#39ff14', fontWeight: 'bold' }}>#{idx + 1}</td>
                    <td style={{ padding: '12px 15px' }}>
                      <a href={post.url} target="_blank" rel="noreferrer" style={{ color: '#00f3ff', textDecoration: 'underline', fontSize: '0.8rem', wordBreak: 'break-all', maxWidth: '250px', display: 'block' }}>
                        {post.url.length > 50 ? post.url.substring(0, 50) + '...' : post.url}
                      </a>
                    </td>
                    <td style={{ padding: '12px 15px', textAlign: 'right', color: '#39ff14' }}>{formatNum(post.views)}</td>
                    <td style={{ padding: '12px 15px', textAlign: 'right', color: '#ff007f' }}>{formatNum(post.likes)}</td>
                    <td style={{ padding: '12px 15px', textAlign: 'right' }}>{formatNum(post.comments)}</td>
                    <td style={{ padding: '12px 15px', textAlign: 'right' }}>{formatNum(post.bookmarks)}</td>
                    <td style={{ padding: '12px 15px', textAlign: 'right' }}>{formatNum(post.shares)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {loading && <div style={{ textAlign: 'center', color: '#39ff14', padding: '20px' }}>Loading posts...</div>}
      {!loading && posts.length === 0 && (
        <div style={{ textAlign: 'center', color: '#555', padding: '30px', border: '1px dashed #333', borderRadius: '8px' }}>
          Belum ada postingan TikTok yang di-submit. Paste URL di atas dan klik SUBMIT & SYNC!
        </div>
      )}
    </div>
  );
}
