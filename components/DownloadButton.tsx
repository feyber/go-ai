"use client";

import { useState } from "react";
import { FaDownload, FaCheck, FaSpinner } from "react-icons/fa";

export default function DownloadButton({
  url,
  videoId,
  userVideoId,
}: {
  url: string;
  videoId: string;
  userVideoId: string;
}) {
  const [downloaded, setDownloaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 1. Record the download in the database
      const res = await fetch("/api/user/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });

      if (res.ok) {
        setDownloaded(true);
      }
    } catch (e) {
      console.error("Failed to track download", e);
    } finally {
      // 2. Open the file regardless to ensure user experience isn't perfectly blocked by analytics failing
      window.open(url, "_blank");
      setDownloaded(true);
      setLoading(false);
    }
  };

  return (
    <>
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`btn-retro w-full flex items-center justify-center gap-2 ${downloaded ? "opacity-70" : ""
        }`}
      style={{
        fontSize: "0.9rem",
        marginTop: "auto",
        transition: "all 0.3s ease",
        color: downloaded ? "#aaa" : undefined,
        borderColor: downloaded ? "#333" : undefined,
        boxShadow: downloaded ? "none" : undefined,
        background: downloaded ? "#0a0a0a" : undefined
      }}
    >
      {loading ? (
        <>Wait...</>
      ) : downloaded ? (
        <>
          <FaCheck /> Downloaded
        </>
      ) : (
        <>
          <FaDownload /> Download Video
        </>
      )}
    </button>
    {downloaded && (
      <div style={{ color: '#ffcc00', marginTop: '10px', fontSize: '0.8rem', textAlign: 'center' }}>
        ⚠️ Video ini sudah di download
      </div>
    )}
    </>
  );
}
