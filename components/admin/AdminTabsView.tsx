"use client";

import { useState } from "react";
import AdminUserManager from "@/components/admin/AdminUserManager";
import VideoHistoryTab from "@/components/admin/VideoHistoryTab";
import VideoListTab from "@/components/admin/VideoListTab";
import TikTokStatsTab from "@/components/admin/TikTokStatsTab";
import MembershipsTab from "@/components/admin/MembershipsTab";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import VideoPoolDataTab from "@/components/admin/VideoPoolDataTab";
import AdminSettingsTab from "@/components/admin/AdminSettingsTab";

export default function AdminTabsView() {
  const [activeTab, setActiveTab] = useState<"users" | "history" | "videos" | "tiktok" | "memberships" | "analytics" | "pool" | "settings">("analytics");

  const tabOptions = [
    { id: "analytics", label: "Analytics Dashboard", color: "#ff8000" },
    { id: "history", label: "Video History Log", color: "#ff007f" },
    { id: "memberships", label: "Memberships Lists", color: "#ffff00" },
    { id: "users", label: "Users & Whitelist Manager", color: "#39ff14" },
    { id: "videos", label: "Master Video Pool", color: "#39ff14" },
    { id: "tiktok", label: "TikTok Stats", color: "#00f3ff" },
    { id: "pool", label: "Video Pool Analytics", color: "#ff4444" },
    { id: "settings", label: "System Settings", color: "#fff" },
  ];

  return (
    <div style={{ marginTop: '50px' }}>

      {/* Mobile Tab Navigation - 2026 Best Practice: Simple & Efficient Dropdown */}
      <div className="show-mobile" style={{ marginBottom: '30px' }}>
        <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>Navigate To:</div>
        <select 
          value={activeTab} 
          onChange={(e) => setActiveTab(e.target.value as any)}
          style={{ 
            width: '100%', 
            padding: '14px', 
            background: '#0a0a0a', 
            color: '#39ff14', 
            border: '2px solid #333', 
            borderRadius: '8px', 
            fontSize: '1rem', 
            outline: 'none',
            appearance: 'none',
            backgroundImage: 'linear-gradient(45deg, transparent 50%, #39ff14 50%), linear-gradient(135deg, #39ff14 50%, transparent 50%)',
            backgroundPosition: 'calc(100% - 20px) calc(1em + 2px), calc(100% - 15px) calc(1em + 2px)',
            backgroundSize: '5px 5px, 5px 5px',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {tabOptions.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Desktop Tab Navigation */}
      <div className="hide-mobile" style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '15px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {tabOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => setActiveTab(opt.id as any)}
            className="btn-retro"
            style={{
              flexShrink: 0,
              padding: '10px 20px',
              background: activeTab === opt.id ? `rgba(${hexToRgb(opt.color)}, 0.15)` : 'transparent',
              borderColor: activeTab === opt.id ? opt.color : '#333',
              color: activeTab === opt.id ? opt.color : '#888',
              boxShadow: activeTab === opt.id ? `inset 0 0 10px rgba(${hexToRgb(opt.color)}, 0.2)` : 'none'
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "history" && <VideoHistoryTab />}
        {activeTab === "users" && <AdminUserManager />}
        {activeTab === "videos" && <VideoListTab />}
        {activeTab === "tiktok" && <TikTokStatsTab />}
        {activeTab === "memberships" && <MembershipsTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "pool" && <VideoPoolDataTab />}
        {activeTab === "settings" && <AdminSettingsTab />}
      </div>

    </div>
  );
}

// Utility to convert hex to rgb for rgba transparency
function hexToRgb(hex: string) {
  if (hex === "#fff") return "255, 255, 255";
  if (hex.startsWith("#")) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }
  return "57, 255, 20";
}
