"use client";

import { useState, useEffect } from "react";
import { FaWhatsapp, FaTiktok, FaSave } from "react-icons/fa";

export default function ProfileEditor({
  user,
  activeTier = 0
}: {
  user: { email: string | null; whatsapp: string | null; tiktok: string | null; whatsappVerified?: string | null; videoCategory?: string | null }
  activeTier?: number;
}) {
  const [whatsapp, setWhatsapp] = useState(user.whatsapp || "");
  const [tiktok, setTiktok] = useState(user.tiktok || "");
  const [videoCategory, setVideoCategory] = useState(user.videoCategory || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [isVerified, setIsVerified] = useState(!!user.whatsappVerified);
  const [isEditing, setIsEditing] = useState(!(user.whatsapp && user.tiktok));
  const [otpCooldown, setOtpCooldown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (otpCooldown > 0) {
      timer = setTimeout(() => setOtpCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsapp.length > 0 && !isVerified) {
      setMessage("Harap verifikasi nomor WhatsApp terlebih dahulu sebelum save.");
      return;
    }
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp, tiktok, videoCategory }),
      });

      if (res.ok) {
        setMessage("Profile updated successfully!");
        setIsEditing(false);
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

  const handleRequestOtp = async () => {
    setRequestingOtp(true);
    setOtpMessage("");
    try {
      const res = await fetch("/api/user/otp/request", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ whatsapp })
      });
      const data = await res.json();
      if (res.ok) {
        setShowOtpInput(true);
        setOtpMessage("OTP sent to your WhatsApp!");
        setOtpCooldown(90); // 90 seconds cooldown
      } else {
        setOtpMessage(data.error || "Failed to send OTP");
        if (data.error && data.error.includes("cool down")) {
          setOtpCooldown(90);
        }
      }
    } catch(e) {
      setOtpMessage("Error requesting OTP");
    }
    setRequestingOtp(false);
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await fetch("/api/user/otp/verify", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ otp: otpCode, whatsapp })
      });
      const data = await res.json();
      if (res.ok) {
        setIsVerified(true);
        setShowOtpInput(false);
        setOtpMessage("Verification successful!");
      } else {
        setOtpMessage(data.error || "Invalid OTP");
      }
    } catch(e) {
      setOtpMessage("Error verifying OTP");
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ padding: '20px 30px', background: 'rgba(10,10,10,0.8)', border: '1px solid #333', marginBottom: '40px', borderRadius: '8px', transition: 'all 0.3s ease' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
      >
        <h2 className="text-glow-green" style={{ fontSize: '1.5rem', color: '#39ff14', margin: 0 }}>Your Profile</h2>
        <div style={{ color: '#39ff14', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', fontSize: '1.2rem' }}>
          ▼
        </div>
      </div>

      {isOpen && (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px', marginTop: '30px' }}>

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
              onChange={(e) => {
                setWhatsapp(e.target.value.replace(/[^0-9]/g, ''));
                setIsVerified(false);
                setShowOtpInput(false);
              }}
              disabled={!isEditing}
              style={{ flex: 1, padding: '12px', background: '#050505', border: '1px solid #333', color: '#fff', borderRadius: '0 6px 6px 0', outline: 'none', opacity: isEditing ? 1 : 0.6, cursor: isEditing ? 'text' : 'not-allowed' }}
              onFocus={(e) => { if (isEditing) e.target.style.borderColor = '#39ff14'; }}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          </div>
          <small style={{ color: '#555', marginTop: '5px', display: 'block' }}>Enter your active WA number starting after 62</small>
          
          <div style={{ marginTop: '10px' }}>
            {isVerified ? (
              <span style={{ color: '#39ff14', fontSize: '0.85rem', background: 'rgba(57,255,20,0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(57,255,20,0.2)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <FaWhatsapp /> Verified
              </span>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {!showOtpInput ? (
                  <button type="button" onClick={handleRequestOtp} disabled={!isEditing || requestingOtp || !whatsapp || otpCooldown > 0} style={{ background: '#ff007f', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: (otpCooldown > 0) ? 'not-allowed' : 'pointer', fontSize: '0.85rem', opacity: (!isEditing || !whatsapp || requestingOtp || otpCooldown > 0) ? 0.5 : 1 }}>
                    {otpCooldown > 0 ? `Coba lagi dalam ${otpCooldown}s` : requestingOtp ? "Sending..." : "Request OTP to Verify"}
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="6-digit OTP" style={{ padding: '6px 10px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', width: '120px' }} />
                    <button type="button" onClick={handleVerifyOtp} style={{ background: '#39ff14', color: '#000', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Verify</button>
                  </div>
                )}
                {otpMessage && <span style={{ fontSize: '0.85rem', color: otpMessage.includes('successful') || otpMessage.includes('sent') ? '#39ff14' : '#ff4444' }}>{otpMessage}</span>}
              </div>
            )}
          </div>
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
              disabled={!isEditing}
              style={{ flex: 1, padding: '12px', background: '#050505', border: '1px solid #333', color: '#fff', borderRadius: '0 6px 6px 0', outline: 'none', opacity: isEditing ? 1 : 0.6, cursor: isEditing ? 'text' : 'not-allowed' }}
              onFocus={(e) => { if (isEditing) e.target.style.borderColor = '#ff007f'; }}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          </div>
        </div>

        {activeTier >= 3 && (
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffb700', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
              🎥 Preferred Video Category
            </label>
            <input
              type="text"
              placeholder="e.g. Fashion, Skincare, Tech"
              value={videoCategory}
              onChange={(e) => setVideoCategory(e.target.value)}
              disabled={!isEditing}
              style={{ width: '100%', padding: '12px', background: '#050505', border: '1px solid #333', color: '#fff', borderRadius: '6px', outline: 'none', opacity: isEditing ? 1 : 0.6, cursor: isEditing ? 'text' : 'not-allowed' }}
              onFocus={(e) => { if (isEditing) e.target.style.borderColor = '#ffb700'; }}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
            <small style={{ color: '#555', marginTop: '5px', display: 'block' }}>Hanya untuk Ultimate members.</small>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
          {isEditing ? (
            <button
              type="submit"
              disabled={saving || (whatsapp.length > 0 && !isVerified)}
              className="btn-retro"
              style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', opacity: (whatsapp.length > 0 && !isVerified) ? 0.5 : 1, cursor: (whatsapp.length > 0 && !isVerified) ? 'not-allowed' : 'pointer' }}
            >
              <FaSave /> {saving ? "Saving..." : "Save Profile"}
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
              className="btn-retro"
              style={{ padding: '12px 24px', background: 'transparent', color: '#00f3ff', borderColor: '#00f3ff', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
            >
              Edit Profile
            </button>
          )}

          {message && (
            <span style={{ color: message.includes('success') ? '#39ff14' : '#ff007f', fontSize: '0.9rem' }}>
              {message}
            </span>
          )}
        </div>

      </form>
      )}
    </div>
  );
}
