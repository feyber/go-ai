"use client";

import { useState, useRef } from "react";
import { FaCloudUploadAlt, FaCheck, FaTimes, FaLink } from "react-icons/fa";

type UploadMode = "upload" | "url";

interface UploadedFile {
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "done" | "error";
  r2Url?: string;
  error?: string;
}

export default function VideoUploadForm() {
  const [mode, setMode] = useState<UploadMode>("upload");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [urlText, setUrlText] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [category, setCategory] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Upload a single file to R2 with real progress tracking
  const uploadToR2 = (file: File, index: number) => {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploadedFiles((prev) =>
            prev.map((f, i) => (i === index ? { ...f, progress: pct } : f))
          );
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          setUploadedFiles((prev) =>
            prev.map((f, i) =>
              i === index
                ? { ...f, progress: 100, status: "done", r2Url: data.url }
                : f
            )
          );
          resolve(data.url);
        } else {
          const errMsg = (() => {
            try { return JSON.parse(xhr.responseText).error; } catch { return "Upload gagal"; }
          })();
          setUploadedFiles((prev) =>
            prev.map((f, i) =>
              i === index ? { ...f, status: "error", error: errMsg } : f
            )
          );
          reject(new Error(errMsg));
        }
      });

      xhr.addEventListener("error", () => {
        setUploadedFiles((prev) =>
          prev.map((f, i) =>
            i === index ? { ...f, status: "error", error: "Network error" } : f
          )
        );
        reject(new Error("Network error"));
      });

      xhr.open("POST", "/api/admin/videos/upload");
      xhr.send(formData);
    });
  };

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const startIndex = uploadedFiles.length;
    const newEntries: UploadedFile[] = Array.from(selectedFiles).map((f) => ({
      name: f.name,
      size: f.size,
      progress: 0,
      status: "uploading" as const,
    }));

    setUploadedFiles((prev) => [...prev, ...newEntries]);

    // Upload each file sequentially
    for (let i = 0; i < selectedFiles.length; i++) {
      try {
        await uploadToR2(selectedFiles[i], startIndex + i);
      } catch {
        // Error already handled in uploadToR2
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // Save all gathered URLs to database
  const handleSave = async () => {
    const urls: string[] = [];

    if (mode === "upload") {
      const doneFiles = uploadedFiles.filter((f) => f.status === "done" && f.r2Url);
      if (doneFiles.length === 0) {
        setSaveMessage("Belum ada file yang berhasil diupload!");
        return;
      }
      urls.push(...doneFiles.map((f) => f.r2Url!));
    } else {
      const pasted = urlText.split("\n").map((l) => l.trim()).filter(Boolean);
      if (pasted.length === 0) {
        setSaveMessage("Masukkan minimal 1 URL!");
        return;
      }
      urls.push(...pasted);
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls,
          productUrl: productUrl.trim() || null,
          caption: caption.trim() || null,
          hashtag: hashtag.trim() || null,
          category: category.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan");
      }

      const data = await res.json();
      setSaveMessage(`✅ ${data.count} video berhasil ditambahkan ke pool!`);
      
      // Reset form
      setUploadedFiles([]);
      setUrlText("");
      setProductUrl("");
      setCaption("");
      setHashtag("");
      setCategory("");
    } catch (err: any) {
      setSaveMessage(`❌ ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const hasContent =
    mode === "upload"
      ? uploadedFiles.some((f) => f.status === "done")
      : urlText.trim().length > 0;

  const isStillUploading = uploadedFiles.some((f) => f.status === "uploading");

  return (
    <div>
      {/* Mode Toggle */}
      <div style={{ display: "flex", marginBottom: "20px", borderRadius: "8px", overflow: "hidden", border: "1px solid #333" }}>
        <button
          onClick={() => setMode("upload")}
          style={{
            flex: 1,
            padding: "12px",
            background: mode === "upload" ? "#ff007f" : "#0a0a0a",
            color: mode === "upload" ? "#fff" : "#666",
            border: "none",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: "bold",
            letterSpacing: "1px",
            transition: "all 0.3s",
          }}
        >
          <FaCloudUploadAlt style={{ marginRight: "8px", verticalAlign: "middle" }} />
          Upload File
        </button>
        <button
          onClick={() => setMode("url")}
          style={{
            flex: 1,
            padding: "12px",
            background: mode === "url" ? "#ff007f" : "#0a0a0a",
            color: mode === "url" ? "#fff" : "#666",
            border: "none",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: "bold",
            letterSpacing: "1px",
            transition: "all 0.3s",
          }}
        >
          <FaLink style={{ marginRight: "8px", verticalAlign: "middle" }} />
          Paste URL
        </button>
      </div>

      {/* Upload File Mode */}
      {mode === "upload" && (
        <div style={{ marginBottom: "20px" }}>
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? "#39ff14" : "#333"}`,
              borderRadius: "12px",
              padding: "40px 20px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s",
              background: isDragging ? "rgba(57, 255, 20, 0.05)" : "rgba(15, 15, 15, 0.5)",
              marginBottom: uploadedFiles.length > 0 ? "15px" : "0",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".mp4,.mov,.webm,.mkv,video/*"
              onChange={(e) => { handleFileSelect(e.target.files); e.target.value = ""; }}
              style={{ display: "none" }}
            />
            <FaCloudUploadAlt size={40} color={isDragging ? "#39ff14" : "#555"} />
            <div style={{ color: isDragging ? "#39ff14" : "#aaa", fontSize: "1rem", marginTop: "12px" }}>
              {isDragging ? "Lepas file di sini!" : "Drag & drop video, atau klik untuk pilih"}
            </div>
            <div style={{ color: "#555", fontSize: "0.8rem", marginTop: "6px" }}>
              MP4, MOV, WEBM, MKV • Max 500MB
            </div>
          </div>

          {/* File List with Progress */}
          {uploadedFiles.map((f, i) => (
            <div
              key={i}
              style={{
                padding: "12px 15px",
                background: "#0a0a0a",
                borderRadius: "8px",
                border: `1px solid ${f.status === "done" ? "rgba(57,255,20,0.3)" : f.status === "error" ? "rgba(255,68,68,0.3)" : "#222"}`,
                marginBottom: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#ccc", fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.name}
                  </div>
                  <div style={{ color: "#555", fontSize: "0.75rem", marginTop: "2px" }}>
                    {formatSize(f.size)}
                    {f.error && <span style={{ color: "#ff4444", marginLeft: "8px" }}>{f.error}</span>}
                  </div>
                </div>
                {f.status === "done" ? (
                  <FaCheck color="#39ff14" size={14} />
                ) : f.status === "error" ? (
                  <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px" }}>
                    <FaTimes color="#ff4444" size={14} />
                  </button>
                ) : null}
              </div>

              {/* Progress Bar */}
              <div style={{ width: "100%", height: "4px", background: "#1a1a1a", borderRadius: "2px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${f.progress}%`,
                    height: "100%",
                    borderRadius: "2px",
                    background: f.status === "error"
                      ? "#ff4444"
                      : f.status === "done"
                      ? "#39ff14"
                      : "linear-gradient(90deg, #ff007f, #ff5ca8)",
                    transition: "width 0.3s ease",
                    boxShadow: f.status === "uploading" ? "0 0 8px rgba(255,0,127,0.5)" : "none",
                  }}
                />
              </div>
              <div style={{ textAlign: "right", fontSize: "0.7rem", marginTop: "4px", color: f.status === "done" ? "#39ff14" : f.status === "error" ? "#ff4444" : "#ff007f" }}>
                {f.status === "done" ? "Uploaded ✓" : f.status === "error" ? "Error" : `${f.progress}%`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* URL Mode */}
      {mode === "url" && (
        <textarea
          value={urlText}
          onChange={(e) => setUrlText(e.target.value)}
          rows={4}
          placeholder="Paste URL video di sini, satu per baris"
          style={{
            width: "100%",
            padding: "15px",
            background: "#0f0f0f",
            color: "#fff",
            border: "1px solid #333",
            marginBottom: "20px",
            borderRadius: "8px",
            resize: "vertical",
            fontSize: "0.95rem",
            outline: "none",
          }}
        />
      )}

      {/* Metadata Fields */}
      <input
        type="url"
        value={productUrl}
        onChange={(e) => setProductUrl(e.target.value)}
        placeholder="Keranjang kuning / Shopee / Product Link (Applied to all videos)"
        style={{
          width: "100%",
          padding: "12px 15px",
          background: "#0f0f0f",
          color: "#fff",
          border: "1px solid #333",
          marginBottom: "10px",
          borderRadius: "8px",
          fontSize: "0.95rem",
          outline: "none",
        }}
      />
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        rows={2}
        placeholder="Caption..."
        style={{
          width: "100%",
          padding: "15px",
          background: "#0f0f0f",
          color: "#fff",
          border: "1px solid #333",
          marginBottom: "10px",
          borderRadius: "8px",
          resize: "vertical",
          fontSize: "0.95rem",
          outline: "none",
        }}
      />
      <input
        type="text"
        value={hashtag}
        onChange={(e) => setHashtag(e.target.value)}
        placeholder="#Hashtags (#viral #fyp)"
        style={{
          width: "100%",
          padding: "12px 15px",
          background: "#0f0f0f",
          color: "#fff",
          border: "1px solid #333",
          marginBottom: "10px",
          borderRadius: "8px",
          fontSize: "0.95rem",
          outline: "none",
        }}
      />
      <input
        type="text"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Video Category (e.g. Fashion, Skincare) - Optional"
        style={{
          width: "100%",
          padding: "12px 15px",
          background: "#0f0f0f",
          color: "#fff",
          border: "1px solid #333",
          marginBottom: "20px",
          borderRadius: "8px",
          fontSize: "0.95rem",
          outline: "none",
        }}
      />

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!hasContent || isSaving || isStillUploading}
        className="btn-retro w-full"
        style={{
          padding: "14px",
          borderRadius: "8px",
          letterSpacing: "2px",
          fontSize: "1rem",
          opacity: !hasContent || isSaving || isStillUploading ? 0.4 : 1,
          cursor: !hasContent || isSaving || isStillUploading ? "not-allowed" : "pointer",
        }}
      >
        {isSaving ? "MENYIMPAN..." : isStillUploading ? "MENUNGGU UPLOAD..." : "TAMBAH VIDEO"}
      </button>

      {/* Status Message */}
      {saveMessage && (
        <div style={{
          marginTop: "15px",
          padding: "12px 15px",
          borderRadius: "8px",
          background: saveMessage.startsWith("✅") ? "rgba(57,255,20,0.1)" : "rgba(255,68,68,0.1)",
          border: `1px solid ${saveMessage.startsWith("✅") ? "rgba(57,255,20,0.3)" : "rgba(255,68,68,0.3)"}`,
          color: saveMessage.startsWith("✅") ? "#39ff14" : "#ff4444",
          fontSize: "0.9rem",
          textAlign: "center",
        }}>
          {saveMessage}
        </div>
      )}
    </div>
  );
}
