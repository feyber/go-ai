"use client";

import { useState, useEffect } from "react";
import { FaGift, FaWhatsapp, FaCheckCircle, FaSpinner } from "react-icons/fa";

interface Props {
  hasClaimedFreeVideos: boolean;
  hasWhatsapp: boolean;
}

export default function FreeClaimCard({ hasClaimedFreeVideos, hasWhatsapp }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Check localStorage (Browser fingerprinting layer 1)
    const localClaimed = localStorage.getItem("goai_free_claim");
    if (!hasClaimedFreeVideos && !localClaimed) {
      setIsVisible(true);
    }
  }, [hasClaimedFreeVideos]);

  const handleClaim = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!hasWhatsapp) {
      setErrorMsg("Mohon lengkapi profil & nomor WhatsApp di bawah terlebih dahulu.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/user/claim-free", {
        method: "POST"
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg("Klaim sukses! 3 Video gratis sudah masuk ke akunmu.");
        localStorage.setItem("goai_free_claim", "1"); // local fingerprint
        setTimeout(() => {
          window.location.reload(); // Reload to show videos
        }, 2000);
      } else {
        setErrorMsg(data.error || "Terjadi kesalahan saat klaim.");
        // If the error indicates they claimed somewhere else, hide it anyway to prevent spamming
        if (data.error.includes("pernah mengambil") || data.error.includes("Jaringan internet")) {
          setTimeout(() => setIsVisible(false), 3000);
        }
      }
    } catch (err) {
      setErrorMsg("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255, 0, 127, 0.15), rgba(57, 255, 20, 0.05))',
      border: '1px solid rgba(255, 0, 127, 0.5)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '30px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ background: 'rgba(255, 0, 127, 0.2)', padding: '15px', borderRadius: '50%' }}>
          <FaGift size={30} color="#ff007f" />
        </div>
        <div>
          <h2 className="text-glow-pink" style={{ fontSize: '1.4rem', color: '#ff007f', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>
            Hadiah Welcome! 3 Video Gratis
          </h2>
          <p style={{ margin: 0, color: '#e0e0e0', fontSize: '0.95rem', marginTop: '5px' }}>
            Klaim 3 video pertamamu sekarang untuk mulai ngiklan. Pastikan nomor WhatsApp di profil sudah tersimpan.
          </p>
        </div>
      </div>

      <div style={{ padding: '10px 15px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', borderLeft: '3px solid #39ff14', fontSize: '0.85rem', color: '#aaa' }}>
        <strong>Info Spesial:</strong> 1 Akun / 1 Nomor WA hanya berhak klaim 1x. Apabila nomor WA sudah dipakai akun lain, klaim akan ditolak oleh sistem.
      </div>

      {errorMsg && (
        <div style={{ color: '#ff4444', background: 'rgba(255,68,68,0.1)', padding: '10px', borderRadius: '6px', fontSize: '0.9rem', border: '1px solid #ff4444' }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ color: '#39ff14', background: 'rgba(57,255,20,0.1)', padding: '10px', borderRadius: '6px', fontSize: '0.9rem', border: '1px solid #39ff14', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaCheckCircle /> {successMsg}
        </div>
      )}

      <button 
        onClick={handleClaim}
        disabled={isLoading || !!successMsg}
        className="btn-retro"
        style={{ 
          alignSelf: 'flex-start', 
          padding: '12px 24px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          opacity: (isLoading || !!successMsg) ? 0.7 : 1,
          cursor: (isLoading || !!successMsg) ? 'wait' : 'pointer'
        }}
      >
        {isLoading ? <FaSpinner className="spin" /> : <FaCheckCircle />} 
        {isLoading ? "Memproses Klaim..." : "Klaim 3 Video Sekarang"}
      </button>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
