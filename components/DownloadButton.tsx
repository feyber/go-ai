"use client";

import { useState } from "react";
import { FaDownload, FaCheck, FaLock, FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function DownloadButton({
  url,
  videoId,
  userVideoId,
  isLocked = false,
  lockReason,
  previousVideoId,
  previousVideoLabel
}: {
  url: string;
  videoId: string;
  userVideoId: string;
  isLocked?: boolean;
  lockReason?: 'url_required' | 'previous_incomplete';
  previousVideoId?: string;
  previousVideoLabel?: string;
}) {
  const [downloaded, setDownloaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const router = useRouter();

  const handleDownload = async () => {
    if (loading || isLocked) return;
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

  const handleSubmitTikTok = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tiktokUrl || submitting || !previousVideoId) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/user/submit-tiktok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Submit the URL for the previous video that needs to be unlocked
        body: JSON.stringify({ videoId: previousVideoId, tiktokUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit URL");
      }

      // Refresh the page to reflect the new unlocked status
      router.refresh();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit TikTok URL");
      setSubmitting(false);
    }
  };

  if (isLocked) {
    if (lockReason === 'previous_incomplete') {
      return (
        <div className="flex flex-col gap-2 mt-auto">
          <div style={{ background: 'rgba(57, 255, 20, 0.05)', border: '1px solid #333', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <FaLock style={{ color: '#888', margin: '0 auto 10px auto', fontSize: '1.5rem' }} />
            <h4 style={{ color: '#888', marginBottom: '10px', fontSize: '0.9rem' }}>Video Locked</h4>
            <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '5px' }}>
              Please download and complete {previousVideoLabel || "the previous video"} first.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2 mt-auto">
        <div style={{ background: 'rgba(255, 0, 127, 0.1)', border: '1px solid #ff007f', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <FaLock style={{ color: '#ff007f', margin: '0 auto 10px auto', fontSize: '1.5rem' }} />
          <h4 style={{ color: '#fff', marginBottom: '10px', fontSize: '0.9rem' }}>Requires TikTok URL</h4>
          <p style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '15px' }}>
            Paste your TikTok post URL for {previousVideoLabel || "the previous video"} to unlock this download.
          </p>

          <form onSubmit={handleSubmitTikTok} className="flex flex-col gap-2">
            <input
              type="url"
              placeholder="https://www.tiktok.com/@user/video/..."
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
              required
              className="w-full bg-[#0f0f0f] border border-[#333] text-white p-2 rounded text-sm outline-none focus:border-[#ff007f]"
            />
            {submitError && <div className="text-[#ff007f] text-xs">{submitError}</div>}
            <button
              type="submit"
              disabled={submitting || !tiktokUrl}
              className="btn-retro w-full flex items-center justify-center gap-2"
              style={{ padding: '8px', fontSize: '0.85rem' }}
            >
              {submitting ? <FaSpinner className="animate-spin" /> : "Submit to Unlock"}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
