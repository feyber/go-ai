"use client";

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50 }}>
      {/* Brand Logo */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '2px' }} className="text-glow-green">
          Go<span style={{ color: '#39ff14' }}>.</span>
        </div>
      </Link>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {status === "loading" ? (
          <div style={{ color: '#39ff14', fontSize: '0.9rem', letterSpacing: '2px' }}>LOADING...</div>
        ) : session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Show link to Admin Panel if User is ADMIN */}
            {(session.user as any)?.role === "ADMIN" && (
              <Link href="/admin" style={{ color: '#39ff14', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Admin Panel
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="btn-retro"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link href="/login">
            <button className="btn-retro">Member Login</button>
          </Link>
        )}
      </div>
    </nav>
  );
}
