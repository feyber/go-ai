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

  const isR2Video = url.startsWith("r2://");

  const handleDownload = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (isR2Video) {
        // R2 video: fetch the actual file from our API and trigger a real download
        const res = await fetch("/api/user/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });

        if (!res.ok) {
          throw new Error("Download failed");
        }

        // Check if we got a file (binary) or JSON response
        const contentType = res.headers.get("content-type") || "";
        
        if (contentType.includes("video") || contentType.includes("octet-stream")) {
          // We got a file — create a blob and trigger download
          const blob = await res.blob();
          const downloadUrl = URL.createObjectURL(blob);
          
          // Create a temporary <a> element to force download
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = `GO-AI_Video.mp4`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up the blob URL
          setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
          
          setDownloaded(true);
        } else {
          // Fallback: got JSON (shouldn't happen for R2 but just in case)
          const data = await res.json();
          if (data.redirectUrl) {
            window.open(data.redirectUrl, "_blank");
          }
          setDownloaded(true);
        }
      } else {
        // Legacy: non-R2 video (Google Drive links etc.)
        // Record the download first
        const res = await fetch("/api/user/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });

        if (res.ok) {
          setDownloaded(true);
        }

        // Open the external link
        window.open(url, "_blank");
        setDownloaded(true);
      }
    } catch (e) {
      console.error("Failed to download", e);
      alert("Download gagal. Coba lagi ya!");
    } finally {
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
        <>
          <FaSpinner style={{ animation: "spin 1s linear infinite" }} /> Downloading...
        </>
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
    <style jsx>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
    </>
  );
}
