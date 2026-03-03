"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative">
      <div className="absolute inset-0 z-0 crt pointer-events-none"></div>
      <div className="absolute inset-0 z-0 scanline pointer-events-none"></div>

      <div className="relative z-10 w-full p-8 text-center" style={{ maxWidth: '400px', margin: '0 auto', background: 'rgba(10,10,10,0.95)', border: '1px solid #39ff14', borderRadius: '12px', boxShadow: '0 0 30px rgba(0, 243, 255, 0.2)' }}>
        <h1 className="text-glow-green" style={{ fontSize: '2.5rem', color: '#39ff14', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800 }}>
          Go<span style={{ color: '#39ff14' }}>.</span>
        </h1>
        <p style={{ color: '#aaa', marginBottom: '40px', fontSize: '1.1rem' }}>
          Exclusive Member Portal
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn-retro"
          style={{ width: '100%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.1rem' }}
        >
          <FaGoogle />
          {loading ? 'Connecting...' : 'Sign in with Google'}
        </button>

        <div style={{ marginTop: '30px', fontSize: '0.85rem', color: '#555' }}>
          Secured by NextAuth
        </div>
      </div>
    </div>
  );
}
