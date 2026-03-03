"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid admin credentials");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative">
      <div className="absolute inset-0 z-0 crt pointer-events-none"></div>
      <div className="absolute inset-0 z-0 scanline pointer-events-none"></div>

      <div className="relative z-10 w-full p-8" style={{ maxWidth: '400px', margin: '0 auto', background: 'rgba(10,10,10,0.95)', border: '1px solid #ff007f', borderRadius: '12px', boxShadow: '0 0 30px rgba(255, 0, 127, 0.2)' }}>
        <h1 className="text-glow-pink text-center" style={{ fontSize: '2rem', color: '#ff007f', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          Admin Portal
        </h1>

        {error && (
          <div style={{ color: '#ff4444', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '6px', textAlign: 'center', marginBottom: '20px', border: '1px solid rgba(255,0,0,0.3)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', background: '#050505', border: '1px solid #333', color: '#fff', borderRadius: '6px', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = '#ff007f'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '12px', background: '#050505', border: '1px solid #333', color: '#fff', borderRadius: '6px', outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = '#ff007f'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-retro "
            style={{ marginTop: '10px', padding: '15px' }}
          >
            {loading ? 'Authenticating...' : 'Enter System'}
          </button>
        </form>
      </div>
    </div>
  );
}
