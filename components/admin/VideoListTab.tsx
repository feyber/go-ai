"use client";

import { useState, useEffect } from "react";
import { FaTrash, FaLink } from "react-icons/fa";

export default function VideoListTab() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/videos");
      const data = await res.json();
      if (data.videos) setVideos(data.videos);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this video from the pool forever? Warning: If assigned, it will vanish from the user's dashboard!")) return;

    try {
      await fetch("/api/admin/videos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      fetchVideos();
    } catch (e) {
      console.error(e);
      alert("Failed to delete video");
    }
  };

  const handleDeleteAll = async () => {
    const firstConfirm = confirm("⚠️ WARNING: This will DELETE ALL VIDEOS in the master pool forever! Are you sure?");
    if (!firstConfirm) return;
    
    const secondConfirm = confirm("⛔ FINAL WARNING: This action CANNOT BE UNDONE. All user assignments will be broken. ARE YOU ABSOLUTELY SURE?");
    if (!secondConfirm) return;

    try {
      await fetch("/api/admin/videos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteAll: true })
      });
      fetchVideos();
    } catch (e) {
      console.error(e);
      alert("Failed to delete all videos");
    }
  };

  if (loading) return (
    <div className="admin-card" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#39ff14', fontSize: '1.2rem', letterSpacing: '2px' }}>LOADING VIDEO MASTER LIST...</div>
    </div>
  );

  return (
    <div className="admin-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className="text-glow-green" style={{ fontSize: '1.5rem', color: '#39ff14', margin: 0 }}>Video Master Data</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {videos.length > 0 && (
            <button 
              onClick={handleDeleteAll}
              className="btn-retro"
              style={{ padding: '5px 15px', fontSize: '0.8rem', borderColor: '#ff4444', color: '#ff4444', background: 'rgba(255, 68, 68, 0.1)' }}
            >
              Delete All Videos
            </button>
          )}
          <span style={{ background: '#39ff14', color: '#000', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Total: {videos.length} Videos</span>
        </div>
      </div>

      <div className="table-scroll" style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #222' }}>
        <table className="admin-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '900px', background: '#050505' }}>
          <thead style={{ background: '#0a0a0a' }}>
            <tr>
              <th style={{ width: '50px', padding: '12px 14px', borderBottom: '2px solid #222', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase' }}>No</th>
              <th style={{ padding: '12px 14px', borderBottom: '2px solid #222', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase' }}>Video Source URL</th>
              <th style={{ padding: '12px 14px', borderBottom: '2px solid #222', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase' }}>Assignment Status</th>
              <th style={{ padding: '12px 14px', borderBottom: '2px solid #222', color: '#888', fontSize: '0.85rem', textTransform: 'uppercase' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((vid, index) => {
              const isAssigned = vid.isAssigned;
              const assignedTo = vid.assignment?.user?.email;

              return (
                <tr key={vid.id}>
                  <td style={{ color: '#888', padding: '12px 14px', borderBottom: '1px solid #1a1a1a', verticalAlign: 'middle' }}>{index + 1}</td>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid #1a1a1a', verticalAlign: 'middle' }}>
                    <a href={vid.url} target="_blank" rel="noreferrer" style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-all', maxWidth: '400px' }}>
                      <FaLink color="#39ff14" /> {vid.url}
                    </a>
                  </td>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid #1a1a1a', verticalAlign: 'middle' }}>
                    {isAssigned ? (
                      <div>
                        <span style={{ color: '#ff007f', background: 'rgba(255,0,127,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          Assigned
                        </span>
                        <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '6px' }}>To: {assignedTo}</div>
                      </div>
                    ) : (
                      <span style={{ color: '#39ff14', background: 'rgba(57,255,20,0.1)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        In Pool (Available)
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid #1a1a1a', verticalAlign: 'middle' }}>
                    <button
                      onClick={() => handleDelete(vid.id)}
                      style={{ color: '#ff4444', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,0,0,0.2)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,0,0,0.1)'}
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              )
            })}
            {videos.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#555' }}>No videos in the database yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
