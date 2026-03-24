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

  return (
    <div style={{ marginTop: '50px' }}>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '15px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <button
          onClick={() => setActiveTab("history")}
          className="btn-retro"
          style={{
            flexShrink: 0,
            padding: '10px 20px',
            background: activeTab === "history" ? 'rgba(255, 0, 127, 0.2)' : 'transparent',
            borderColor: activeTab === "history" ? '#ff007f' : '#333',
            color: activeTab === "history" ? '#ff007f' : '#888',
            boxShadow: activeTab === "history" ? 'inset 0 0 10px rgba(255,0,127,0.2)' : 'none'
          }}
        >
          Video History Log
        </button>
        <button
          onClick={() => setActiveTab("memberships")}
          className="btn-retro"
          style={{
            flexShrink: 0,
            padding: '10px 20px',
            background: activeTab === "memberships" ? 'rgba(255, 255, 0, 0.2)' : 'transparent',
            borderColor: activeTab === "memberships" ? '#ffff00' : '#333',
            color: activeTab === "memberships" ? '#ffff00' : '#888',
            boxShadow: activeTab === "memberships" ? 'inset 0 0 10px rgba(255,255,0,0.2)' : 'none'
          }}
        >
          Memberships Lists
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className="btn-retro"
          style={{
            flexShrink: 0,
            padding: '10px 20px',
            background: activeTab === "users" ? 'rgba(57, 255, 20, 0.2)' : 'transparent',
            borderColor: activeTab === "users" ? '#39ff14' : '#333',
            color: activeTab === "users" ? '#39ff14' : '#888',
            boxShadow: activeTab === "users" ? 'inset 0 0 10px rgba(0,243,255,0.2)' : 'none'
          }}
        >
          Users & Whitelist Manager
        </button>
        <button
          onClick={() => setActiveTab("videos")}
          className="btn-retro"
          style={{
            flexShrink: 0,
            padding: '10px 20px',
            background: activeTab === "videos" ? 'rgba(57, 255, 20, 0.2)' : 'transparent',
            borderColor: activeTab === "videos" ? '#39ff14' : '#333',
            color: activeTab === "videos" ? '#39ff14' : '#888',
            boxShadow: activeTab === "videos" ? 'inset 0 0 10px rgba(57,255,20,0.2)' : 'none'
          }}
        >
          Master Video Pool
        </button>
        <button
          onClick={() => setActiveTab("tiktok")}
          className="btn-retro"
          style={{
            flexShrink: 0,
            padding: '10px 20px',
            background: activeTab === "tiktok" ? 'rgba(0, 243, 255, 0.2)' : 'transparent',
            borderColor: activeTab === "tiktok" ? '#00f3ff' : '#333',
            color: activeTab === "tiktok" ? '#00f3ff' : '#888',
            boxShadow: activeTab === "tiktok" ? 'inset 0 0 10px rgba(0,243,255,0.2)' : 'none'
          }}
        >
          TikTok Stats
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className="btn-retro"
          style={{
            flexShrink: 0,
            padding: '10px 20px',
            background: activeTab === "analytics" ? 'rgba(255, 128, 0, 0.2)' : 'transparent',
            borderColor: activeTab === "analytics" ? '#ff8000' : '#333',
            color: activeTab === "analytics" ? '#ff8000' : '#888',
            boxShadow: activeTab === "analytics" ? 'inset 0 0 10px rgba(255,128,0,0.2)' : 'none'
          }}
        >
          Analytics Dashboard
        </button>
        <button
          onClick={() => setActiveTab("pool")}
          className="btn-retro"
          style={{
            flexShrink: 0,
            padding: '10px 20px',
            background: activeTab === "pool" ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
            borderColor: activeTab === "pool" ? '#ff4444' : '#333',
            color: activeTab === "pool" ? '#ff4444' : '#888',
            boxShadow: activeTab === "pool" ? 'inset 0 0 10px rgba(255,0,0,0.2)' : 'none'
          }}
        >
          Video Pool Analytics
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className="btn-retro"
          style={{
            flexShrink: 0,
            padding: '10px 20px',
            background: activeTab === "settings" ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
            borderColor: activeTab === "settings" ? '#fff' : '#333',
            color: activeTab === "settings" ? '#fff' : '#888',
            boxShadow: activeTab === "settings" ? 'inset 0 0 10px rgba(255,255,255,0.2)' : 'none'
          }}
        >
          System Settings
        </button>
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
