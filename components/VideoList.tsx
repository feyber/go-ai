"use client";

import { useState } from "react";
import VideoCard from "./VideoCard";

export default function VideoList({ initialVideos }: { initialVideos: any[] }) {
  const [visibleCount, setVisibleCount] = useState(10);

  // Sorting logic: Downloaded videos go to the bottom
  const sortedVideos = [...initialVideos].sort((a, b) => {
    const aDownloaded = !!a.downloadedAt;
    const bDownloaded = !!b.downloadedAt;
    
    if (aDownloaded && !bDownloaded) return 1;
    if (!aDownloaded && bDownloaded) return -1;
    return 0;
  });

  const displayedVideos = sortedVideos.slice(0, visibleCount);
  const hasMore = sortedVideos.length > visibleCount;

  return (
    <div>
      <style jsx>{`
        .video-scroll-container::-webkit-scrollbar {
          width: 8px;
        }
        .video-scroll-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid #1a1a1a;
        }
        .video-scroll-container::-webkit-scrollbar-thumb {
          background: #39ff14;
          box-shadow: 0 0 5px #39ff14;
          border-radius: 4px;
        }
        .video-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #ff007f;
          box-shadow: 0 0 10px #ff007f;
        }
      `}</style>
      <div 
        className="video-scroll-container"
        style={{ 
          maxHeight: '600px', 
          overflowY: 'auto', 
          paddingRight: '10px',
          paddingBottom: '20px',
          borderBottom: sortedVideos.length > 0 ? '1px solid #1a1a1a' : 'none'
        }}
      >
        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {displayedVideos.map((vid: any) => (
            <VideoCard 
              key={vid.id} 
              vid={vid} 
              index={initialVideos.findIndex(v => v.id === vid.id)} 
              totalVideos={initialVideos.length}
            />
          ))}
        </div>
      </div>

      {hasMore && (
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button 
            onClick={() => setVisibleCount(prev => prev + 10)}
            className="btn-retro"
            style={{ padding: '12px 30px', fontSize: '1rem' }}
          >
            Show More Videos
          </button>
        </div>
      )}
    </div>
  );
}
