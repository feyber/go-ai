"use client";

import { useState, useEffect } from "react";
import { FaDownload, FaTimes, FaWhatsapp, FaTiktok } from "react-icons/fa";

export default function VideoHistoryTab() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/admin/history");
        const data = await res.json();
        if (data.history) setHistory(data.history);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  if (loading) return (
    <div className="admin-card" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#ff007f', fontSize: '1.2rem', letterSpacing: '2px' }}>LOADING HISTORY...</div>
    </div>
  );

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className="text-glow-pink" style={{ fontSize: '1.5rem', color: '#ff007f', margin: 0 }}>User Video History</h2>
        <span style={{ background: '#ff007f', color: '#fff', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Total: {history.length} Records</span>
      </div>

      <div className="table-scroll" style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #222' }}>
        <table className="admin-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '900px', background: '#050505' }}>
          <thead style={{ background: '#0a0a0a' }}>
            <tr>
              <th style={{ width: '50px', padding: '12px 14px', borderBottom: '2px solid #222', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase' }}>No</th>
              <th style={{ padding: '12px 14px', borderBottom: '2px solid #222', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase' }}>Member Profile</th>
              <th style={{ padding: '12px 14px', borderBottom: '2px solid #222', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase' }}>Video Link</th>
              <th style={{ padding: '12px 14px', borderBottom: '2px solid #222', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '12px 14px', borderBottom: '2px solid #222', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase' }}>Download Time</th>
            </tr>
          </thead>
          <tbody>
            {history.map((record, index) => {
              const { user, video, downloadedAt } = record;

              const waLink = user?.whatsapp ? `https://wa.me/62${user.whatsapp}` : null;
              const ttLink = user?.tiktok ? `https://www.tiktok.com/@${user.tiktok}` : null;

              return (
                <tr key={record.id}>
                  <td style={{ color: '#888', padding: '12px 14px', borderBottom: '1px solid #1a1a1a', verticalAlign: 'middle' }}>{index + 1}</td>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid #1a1a1a', verticalAlign: 'middle' }}>
                    <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>{user?.name || "Unknown"}</div>
                    <div style={{ color: '#ccc', fontSize: '0.85rem', marginBottom: '8px' }}>{user?.email}</div>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem' }}>
                      {waLink ? (
                        <a href={waLink} target="_blank" rel="noreferrer" style={{ color: '#25D366', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                          <FaWhatsapp /> WhatsApp
                        </a>
                      ) : (
                        <span style={{ color: '#444', display: 'flex', alignItems: 'center', gap: '4px' }}><FaWhatsapp /> No WA</span>
                      )}

                      {ttLink ? (
                        <a href={ttLink} target="_blank" rel="noreferrer" style={{ color: '#ff0050', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                          <FaTiktok /> TikTok
                        </a>
                      ) : (
                        <span style={{ color: '#444', display: 'flex', alignItems: 'center', gap: '4px' }}><FaTiktok /> No TikTok</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid #1a1a1a', verticalAlign: 'middle' }}>
                    <a href={video.url} target="_blank" rel="noreferrer" style={{ color: '#39ff14', textDecoration: 'underline', fontSize: '0.9rem', wordBreak: 'break-all', maxWidth: '200px', display: 'inline-block' }}>
                      {video.url}
                    </a>
                  </td>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid #1a1a1a', verticalAlign: 'middle' }}>
                    {downloadedAt ? (
                      <span style={{ color: '#39ff14', background: 'rgba(57,255,20,0.1)', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        <FaDownload size={12} /> Sudah Download
                      </span>
                    ) : (
                      <span style={{ color: '#ff4444', background: 'rgba(255,0,0,0.1)', padding: '4px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                        <FaTimes size={12} /> Belum Download
                      </span>
                    )}
                  </td>
                  <td style={{ color: '#aaa', fontSize: '0.9rem', padding: '12px 14px', borderBottom: '1px solid #1a1a1a', verticalAlign: 'middle' }}>
                    {downloadedAt ? new Date(downloadedAt).toLocaleString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    }) : "-"}
                  </td>
                </tr>
              )
            })}
            {history.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#555' }}>No video history records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
