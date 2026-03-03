"use client";

import { useState } from "react";
import { FaDownload, FaCheck } from "react-icons/fa";

export default function DownloadButton({ url, videoId }: { url: string; videoId: string }) {
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
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`btn-retro w-full flex items-center justify-center gap-2 ${downloaded ? "opacity-70" : ""
        }`}
      style={{
        fontSize: "0.9rem",
        marginTop: "auto",
        transition: "all 0.3s ease",
        color: downloaded ? "#39ff14" : undefined,
        borderColor: downloaded ? "#39ff14" : undefined,
        boxShadow: downloaded ? "0 0 10px rgba(57, 255, 20, 0.2), inset 0 0 10px rgba(57, 255, 20, 0.2)" : undefined
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
  );
}
