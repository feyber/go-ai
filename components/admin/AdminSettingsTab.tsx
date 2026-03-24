"use client";

import { useState, useEffect } from "react";
import { FaSave, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function AdminSettingsTab() {
  const [settings, setSettings] = useState({
    enable_basic: "true",
    enable_pro: "true",
    enable_ultimate: "true"
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        setSettings({
          enable_basic: data.enable_basic || "true",
          enable_pro: data.enable_pro || "true",
          enable_ultimate: data.enable_ultimate || "true"
        });
        setLoading(false);
      });
  }, []);

  const handleToggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: (prev as any)[key] === "true" ? "false" : "true" }));
  };

  const saveSettings = async () => {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });
    setSaving(false);
    alert("Settings saved successfully!");
  };

  if (loading) return <div style={{ color: '#fff' }}>Loading settings...</div>;

  return (
    <div style={{ background: '#0a0a0a', border: '1px solid #333', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
      <h2 className="text-glow-blue" style={{ fontSize: '1.5rem', color: '#00f3ff', marginBottom: '20px', textTransform: 'uppercase' }}>System Settings</h2>
      <p style={{ color: '#aaa', marginBottom: '30px' }}>Global configuration overrides for the GO-AI platform.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
        
        {/* Basic Tier Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111', padding: '15px 20px', borderRadius: '8px', borderLeft: '4px solid #fff' }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>Basic Tier (Rp 99.000/mo)</div>
            <div style={{ fontSize: '0.85rem', color: '#888' }}>Allow users to see and purchase the Basic plan.</div>
          </div>
          <button 
            onClick={() => handleToggle('enable_basic')}
            style={{ 
              background: settings.enable_basic === "true" ? 'rgba(57,255,20,0.2)' : 'rgba(255,0,0,0.2)',
              color: settings.enable_basic === "true" ? '#39ff14' : '#ff4444',
              border: `1px solid ${settings.enable_basic === "true" ? '#39ff14' : '#ff4444'}`,
              padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 'bold'
            }}
          >
            {settings.enable_basic === "true" ? <FaCheckCircle /> : <FaTimesCircle />} 
            {settings.enable_basic === "true" ? "ENABLED" : "DISABLED"}
          </button>
        </div>

        {/* Pro Tier Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111', padding: '15px 20px', borderRadius: '8px', borderLeft: '4px solid #39ff14' }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>Pro Tier (Rp 199.000/mo)</div>
            <div style={{ fontSize: '0.85rem', color: '#888' }}>Allow users to see and purchase the Pro plan.</div>
          </div>
          <button 
            onClick={() => handleToggle('enable_pro')}
            style={{ 
              background: settings.enable_pro === "true" ? 'rgba(57,255,20,0.2)' : 'rgba(255,0,0,0.2)',
              color: settings.enable_pro === "true" ? '#39ff14' : '#ff4444',
              border: `1px solid ${settings.enable_pro === "true" ? '#39ff14' : '#ff4444'}`,
              padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 'bold'
            }}
          >
            {settings.enable_pro === "true" ? <FaCheckCircle /> : <FaTimesCircle />} 
            {settings.enable_pro === "true" ? "ENABLED" : "DISABLED"}
          </button>
        </div>

        {/* Ultimate Tier Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111', padding: '15px 20px', borderRadius: '8px', borderLeft: '4px solid #ffb700' }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>Ultimate Tier (Rp 549.000/mo)</div>
            <div style={{ fontSize: '0.85rem', color: '#888' }}>Allow users to see and purchase the Ultimate plan.</div>
          </div>
          <button 
            onClick={() => handleToggle('enable_ultimate')}
            style={{ 
              background: settings.enable_ultimate === "true" ? 'rgba(57,255,20,0.2)' : 'rgba(255,0,0,0.2)',
              color: settings.enable_ultimate === "true" ? '#39ff14' : '#ff4444',
              border: `1px solid ${settings.enable_ultimate === "true" ? '#39ff14' : '#ff4444'}`,
              padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 'bold'
            }}
          >
            {settings.enable_ultimate === "true" ? <FaCheckCircle /> : <FaTimesCircle />} 
            {settings.enable_ultimate === "true" ? "ENABLED" : "DISABLED"}
          </button>
        </div>

      </div>

      <div style={{ marginTop: '40px' }}>
        <button onClick={saveSettings} disabled={saving} className="btn-retro" style={{ padding: '12px 30px', background: 'rgba(0,243,255,0.1)', borderColor: '#00f3ff', color: '#00f3ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaSave /> {saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>

    </div>
  );
}
