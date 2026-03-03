"use client";

import { useState, useEffect } from "react";
import { FaTrash, FaCheck, FaPlus } from "react-icons/fa";

export default function AdminUserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [whitelisted, setWhitelisted] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setUsers(data.users);
      if (data.whitelisted) setWhitelisted(data.whitelisted);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "whitelist_add", email: newEmail })
    });
    setNewEmail("");
    fetchData();
  };

  const handleRemoveWhitelist = async (email: string) => {
    if (!confirm(`Remove ${email} from whitelist?`)) return;
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "whitelist_remove", email })
    });
    fetchData();
  };

  const handleGrant = async (userId: string, duration: string, tier: string) => {
    if (!confirm(`Grant ${duration} access (Tier ${tier})?`)) return;
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "grant_subscription", userId, duration, tier })
    });
    alert("Access granted!");
    fetchData();
  };

  if (loading) return (
    <div className="admin-card" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#39ff14', fontSize: '1.2rem', letterSpacing: '2px' }}>LOADING SEKRETARIAT ADMIN...</div>
    </div>
  );

  const unifiedList = [
    ...users.map(u => ({ ...u, isRegistered: true, isWhitelisted: whitelisted.some(w => w.email === u.email) })),
    ...whitelisted.filter(w => !users.some(u => u.email === w.email)).map(w => ({ ...w, isRegistered: false, isWhitelisted: true, id: w.id || w.email }))
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <style>{`
      .admin-card {
        background: rgba(10, 10, 10, 0.95);
        border: 1px solid #222;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        transition: all 0.3s ease;
      }
      .admin-input {
        flex: 1;
        padding: 14px 20px;
        background: #0f0f0f;
        color: #fff;
        border: 1px solid #333;
        border-radius: 6px;
        font-size: 1rem;
        transition: all 0.3s ease;
        outline: none;
      }
      .admin-input:focus {
        border-color: #39ff14;
        box-shadow: 0 0 15px rgba(57, 255, 20, 0.2);
        background: #111;
      }
      .admin-table th {
        padding: 12px 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 0.85rem;
        color: #888;
        border-bottom: 2px solid #222;
      }
      .admin-table td {
        padding: 12px 14px;
        border-bottom: 1px solid #1a1a1a;
        vertical-align: middle;
      }
      .admin-table tr:hover td {
        background: rgba(255, 255, 255, 0.02);
      }
      .admin-select {
        padding: 10px 15px;
        background: #000;
        border: 1px solid #444;
        color: #fff;
        border-radius: 6px;
        font-size: 0.9rem;
        cursor: pointer;
        outline: none;
        transition: all 0.3s;
      }
      .admin-select:focus {
        border-color: #39ff14;
      }
      .grant-btn {
        padding: 8px 12px;
        font-size: 0.8rem;
        font-weight: bold;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        text-transform: uppercase;
        color: #000;
        letter-spacing: 0.5px;
      }
      .grant-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(255, 255, 255, 0.1);
      }
      .grant-btn-blue { background: #39ff14; }
      .grant-btn-green { background: #39ff14; }
      .grant-btn-pink { background: #ff007f; color: #fff; }
    `}</style>

      {/* Unified Registered Users & Whitelist Section */}
      <div className="admin-card" style={{ borderTop: '3px solid #39ff14' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <h2 className="text-glow-green" style={{ fontSize: '1.5rem', color: '#39ff14', margin: 0 }}>Registered Users & Whitelist</h2>
          <span style={{ background: '#39ff14', color: '#000', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>Total: {unifiedList.length} Accounts</span>
        </div>

        {/* Inline Whitelist Add Form */}
        <form onSubmit={handleAddWhitelist} style={{ display: 'flex', gap: '15px', marginBottom: '30px', background: '#0a0a0a', padding: '20px', borderRadius: '8px', border: '1px solid #222' }}>
          <input
            type="email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            placeholder="Enter Google Email to whitelist for access..."
            className="admin-input"
            required
          />
          <button type="submit" className="btn-retro " style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0 30px' }}>
            <FaPlus /> Whitelist User
          </button>
        </form>

        <div className="table-scroll" style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #222' }}>
          <table className="admin-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '800px', background: '#050505' }}>
            <thead style={{ background: '#0a0a0a' }}>
              <tr>
                <th>Member Email</th>
                <th>Current Status</th>
                <th style={{ width: '450px' }}>Subscription Grant Panel / Action</th>
              </tr>
            </thead>
            <tbody>
              {unifiedList.map(u => {
                const activeSub = u.subscriptions?.[0];
                const isExpired = activeSub ? new Date(activeSub.expiresAt) < new Date() : true;

                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: '500' }}>{u.email}</span>
                        {u.isWhitelisted && (
                          <span style={{ fontSize: '0.7rem', background: 'rgba(255, 0, 127, 0.1)', color: '#ff007f', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255, 0, 127, 0.2)' }}>WHITELISTED</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {!u.isRegistered ? (
                        <span style={{ color: '#ffcc00', fontStyle: 'italic', background: 'rgba(255, 204, 0, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>Pending Registration</span>
                      ) : activeSub && !isExpired ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <span style={{ color: '#39ff14', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', background: 'rgba(57, 255, 20, 0.1)', padding: '4px 8px', borderRadius: '4px', width: 'fit-content' }}>
                            <FaCheck size={12} /> Active Tier {activeSub.tier}
                          </span>
                          <span style={{ color: '#888', fontSize: '0.8rem', display: 'block', paddingLeft: '4px' }}>Exp: {new Date(activeSub.expiresAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#666', fontStyle: 'italic', background: '#111', padding: '4px 8px', borderRadius: '4px' }}>Inactive Member</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                        {/* If registered, show grant panel. If not, only show remove whitelist. */}
                        {u.isRegistered ? (
                          <>
                            <select id={`tier_${u.id}`} className="admin-select">
                              <option value="1">Level: Tier 1</option>
                              <option value="2">Level: Tier 2</option>
                              <option value="3">Level: Tier 3</option>
                            </select>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button onClick={() => {
                                const tier = (document.getElementById(`tier_${u.id}`) as HTMLSelectElement).value;
                                handleGrant(u.id, "3_days", tier);
                              }} className="grant-btn grant-btn-blue">3 Days</button>

                              <button onClick={() => {
                                const tier = (document.getElementById(`tier_${u.id}`) as HTMLSelectElement).value;
                                handleGrant(u.id, "7_days", tier);
                              }} className="grant-btn grant-btn-blue">7 Days</button>

                              <button onClick={() => {
                                const tier = (document.getElementById(`tier_${u.id}`) as HTMLSelectElement).value;
                                handleGrant(u.id, "1_month", tier);
                              }} className="grant-btn grant-btn-green">1 Month</button>

                              <button onClick={() => {
                                const tier = (document.getElementById(`tier_${u.id}`) as HTMLSelectElement).value;
                                handleGrant(u.id, "1_year", tier);
                              }} className="grant-btn grant-btn-pink">1 Year</button>
                            </div>
                          </>
                        ) : (
                          <span style={{ color: '#555', fontSize: '0.85rem', fontStyle: 'italic' }}>Must login once via Google to receive grants.</span>
                        )}

                        {/* Always allow removing from whitelist if they are in it */}
                        {u.isWhitelisted && u.email !== "fey8er@gmail.com" && (
                          <button
                            onClick={() => handleRemoveWhitelist(u.email)}
                            style={{ marginLeft: 'auto', color: '#ff4444', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '6px', cursor: 'pointer', border: '1px solid rgba(255,0,0,0.2)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}
                            title="Revoke Whitelist Access"
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,0,0,0.2)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,0,0,0.1)'}
                          >
                            <FaTrash /> Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {unifiedList.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '30px', color: '#555', borderBottom: '1px solid #222' }}>No users or whitelisted emails yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
