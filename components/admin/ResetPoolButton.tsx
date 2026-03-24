"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPoolButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!confirm("⚠️ This will reset ALL currently assigned videos back to the pool (Available state). This will break current user downloads for today. Continue?")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "video_pool" })
      });
      
      if (res.ok) {
        alert("Video pool assignments have been reset!");
        router.refresh();
      } else {
        alert("Failed to reset pool");
      }
    } catch (e) {
      console.error(e);
      alert("Error occurred");
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleReset}
      disabled={loading}
      className="btn-retro"
      style={{ 
        padding: '5px 12px', 
        fontSize: '0.75rem', 
        borderColor: '#ff007f', 
        color: '#ff007f', 
        background: 'rgba(255, 0, 127, 0.1)',
        opacity: loading ? 0.5 : 1
      }}
    >
      {loading ? "RESETTING..." : "RESET POOL"}
    </button>
  );
}
