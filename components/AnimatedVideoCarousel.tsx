import React from 'react';

// The user will place videos in 'public/rel video/'
// We generate placeholder filenames that the user can replace or use.
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

export default function AnimatedVideoCarousel() {
  return (
    <div className="carousel-container">
      <div className="carousel-track">
        {/* We duplicate the array to create a seamless infinite scrolling effect */}
        {[...videoFiles, ...videoFiles].map((filename, idx) => (
          <div key={idx} className="carousel-item">
            {/* 
              We use a dark background fallback so it looks good even 
              before the user adds the actual videos to the folder.
            */}
            <video 
              src={`/rel video/${filename}`}
              autoPlay 
              loop 
              muted 
              playsInline
              className="carousel-video"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
