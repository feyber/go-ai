"use client";

import { useState } from "react";
import AdminUserManager from "@/components/admin/AdminUserManager";
import VideoHistoryTab from "@/components/admin/VideoHistoryTab";
import VideoListTab from "@/components/admin/VideoListTab";

export default function AdminTabsView() {
  const [activeTab, setActiveTab] = useState<"users" | "history" | "videos">("history");

  return (
    <div style={{ marginTop: '50px' }}>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '15px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <button
          onClick={() => setActiveTab("history")}
          className="btn-retro"
          style={{
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
          onClick={() => setActiveTab("users")}
          className="btn-retro"
          style={{
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
            padding: '10px 20px',
            background: activeTab === "videos" ? 'rgba(57, 255, 20, 0.2)' : 'transparent',
            borderColor: activeTab === "videos" ? '#39ff14' : '#333',
            color: activeTab === "videos" ? '#39ff14' : '#888',
            boxShadow: activeTab === "videos" ? 'inset 0 0 10px rgba(57,255,20,0.2)' : 'none'
          }}
        >
          Master Video Pool
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "history" && <VideoHistoryTab />}
        {activeTab === "users" && <AdminUserManager />}
        {activeTab === "videos" && <VideoListTab />}
      </div>

    </div>
  );
}
