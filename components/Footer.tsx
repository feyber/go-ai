"use client";

export default function Footer() {
  return (
    <footer style={{ 
      paddingTop: '150px', 
      paddingBottom: '100px', 
      textAlign: 'center', 
      background: 'transparent',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      marginTop: 'auto'
    }}>
      <div className="container">
        <p style={{ 
          color: '#444', 
          fontSize: '0.85rem', 
          letterSpacing: '2px', 
          textTransform: 'uppercase',
          fontWeight: '300'
        }}>
          &copy; {new Date().getFullYear()} GO AI - VIDEO COMMERCE 2026
        </p>
        <div style={{ marginTop: '20px', fontSize: '0.7rem', color: '#222', letterSpacing: '3px' }}>
          POWERED BY GO AI TECHNOLOGY
        </div>
      </div>
    </footer>
  );
}
