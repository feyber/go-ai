"use client";

import { useState } from "react";
import { FaWhatsapp, FaTiktok, FaSave } from "react-icons/fa";

export default function ProfileEditor({
  user
}: {
  user: { email: string | null; whatsapp: string | null; tiktok: string | null }
}) {
  const [whatsapp, setWhatsapp] = useState(user.whatsapp || "");
  const [tiktok, setTiktok] = useState(user.tiktok || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp, tiktok }),
      });

      if (res.ok) {
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (e) {
      setMessage("An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '30px', background: 'rgba(10,10,10,0.8)', border: '1px solid #333', marginBottom: '40px', borderRadius: '8px' }}>
      <h2 className="text-glow-green" style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#39ff14' }}>Your Profile</h2>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>

        <div>
          <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase' }}>Email (Read Only)</label>
          <input
            type="email"
            value={user.email || ""}
            readOnly
            style={{ width: '100%', padding: '12px', background: '#050505', border: '1px solid #222', color: '#666', borderRadius: '6px', cursor: 'not-allowed' }}
          />
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            <FaWhatsapp color="#25D366" /> WhatsApp
          </label>
          <div style={{ display: 'flex' }}>
            <span style={{ padding: '12px', background: '#111', border: '1px solid #333', borderRight: 'none', color: '#888', borderRadius: '6px 0 0 6px' }}>62</span>
            <input
              type="text"
              placeholder="81234567890"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))} // only numbers allowed
              style={{ flex: 1, padding: '12px', background: '#050505', border: '1px solid #333', color: '#fff', borderRadius: '0 6px 6px 0', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = '#39ff14'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          </div>
          <small style={{ color: '#555', marginTop: '5px', display: 'block' }}>Enter your active WA number starting after 62</small>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            <FaTiktok color="#ff0050" /> TikTok Username
          </label>
          <div style={{ display: 'flex' }}>
            <span style={{ padding: '12px', background: '#111', border: '1px solid #333', borderRight: 'none', color: '#888', borderRadius: '6px 0 0 6px' }}>@</span>
            <input
              type="text"
              placeholder="username"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value.replace('@', ''))}
              style={{ flex: 1, padding: '12px', background: '#050505', border: '1px solid #333', color: '#fff', borderRadius: '0 6px 6px 0', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = '#ff007f'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
          <button
            type="submit"
            disabled={saving}
            className="btn-retro"
            style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
          >
            <FaSave /> {saving ? "Saving..." : "Save Profile"}
          </button>

          {message && (
            <span style={{ color: message.includes('success') ? '#39ff14' : '#ff007f', fontSize: '0.9rem' }}>
              {message}
            </span>
          )}
        </div>

      </form>
    </div>
  );
}
