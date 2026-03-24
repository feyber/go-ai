"use client";

import { useState } from "react";
import { FaCopy, FaCheck } from "react-icons/fa";
import DownloadButton from "./DownloadButton";

export default function VideoCard({ vid, index, totalVideos }: { vid: any, index: number, totalVideos: number }) {
  const isDownloaded = !!vid.downloadedAt;
  const [copied, setCopied] = useState(false);

  const handleCopyText = () => {
    let text = "";
    if (vid.video.hook) text += vid.video.hook + "\n\n";
    if (vid.video.caption) text += vid.video.caption + "\n\n";
    if (vid.video.hashtag) text += vid.video.hashtag;
    
    if (text) {
      navigator.clipboard.writeText(text.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ 
      background: '#0a0a0a', 
      border: `1px solid ${isDownloaded ? '#333' : '#1a1a1a'}`, 
      padding: '25px', 
      borderRadius: '12px',
      position: 'relative',
      opacity: isDownloaded ? 0.7 : 1,
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '0.75rem', color: isDownloaded ? '#555' : '#888', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
          Exclusive Video Handover
        </div>
        <h3 className={isDownloaded ? '' : 'text-glow-green'} style={{ fontSize: '1.8rem', color: isDownloaded ? '#555' : '#39ff14', textTransform: 'uppercase', fontWeight: 'bold' }}>
          Video #{index + 1}
        </h3>
      </div>

      {vid.video.productUrl && (
        <div style={{ marginBottom: '15px' }}>
          <a href={vid.video.productUrl} target="_blank" rel="noreferrer" style={{ color: '#ffff00', fontSize: '0.8rem', textDecoration: 'underline' }}>
            🛒 Product Link
          </a>
        </div>
      )}

      {(vid.video.hook || vid.video.caption || vid.video.hashtag) && (
        <div style={{ marginBottom: '20px', background: '#111', padding: '15px', borderRadius: '8px', border: '1px solid #222', position: 'relative' }}>
          <div style={{ paddingBottom: '30px' }}>
            {vid.video.hook && <div style={{ color: '#ff007f', fontWeight: 'bold', marginBottom: '8px' }}>{vid.video.hook}</div>}
            {vid.video.caption && <div style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>{vid.video.caption}</div>}
            {vid.video.hashtag && <div style={{ color: '#00f3ff', fontSize: '0.85rem' }}>{vid.video.hashtag}</div>}
          </div>
          
          <button 
            onClick={handleCopyText}
            style={{ 
              position: 'absolute', bottom: '10px', right: '10px', 
              background: copied ? 'rgba(57, 255, 20, 0.2)' : 'rgba(255, 255, 255, 0.1)', 
              color: copied ? '#39ff14' : '#fff', 
              border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', transition: 'all 0.2s'
            }}
          >
            {copied ? <><FaCheck /> Copied</> : <><FaCopy /> Copy Text</>}
          </button>
        </div>
      )}

      <DownloadButton
        userVideoId={vid.id}
        url={vid.video.url}
        videoId={vid.video.id}
      />
    </div>
  );
}
