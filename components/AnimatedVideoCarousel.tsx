"use client";

import React, { useEffect, useRef } from 'react';

const videoFiles = [
  '1.webm',
  '2.webm',
  '3.webm',
  '4.webm',
  '5.webm',
  '6.webm',
  '7.webm',
  '8.webm',
];

function LazyVideo({ filename }: { filename: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Load and play only when visible
            if (!video.src) {
              video.src = `/relvideo/${filename}`;
              video.load();
            }
            video.play().catch(() => {});
          } else {
            // Pause when out of view to save resources
            video.pause();
          }
        });
      },
      { rootMargin: '200px', threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [filename]);

  return (
    <div ref={containerRef} className="carousel-item">
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        preload="none"
        className="carousel-video"
        poster=""
        style={{ background: '#0a0a0a' }}
      />
    </div>
  );
}

export default function AnimatedVideoCarousel() {
  return (
    <div className="carousel-container">
      <div className="carousel-track">
        {[...videoFiles, ...videoFiles].map((filename, idx) => (
          <LazyVideo key={idx} filename={filename} />
        ))}
      </div>
    </div>
  );
}
