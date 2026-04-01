"use client";

import { useState, useEffect } from "react";
import { getTeamByPhone } from "../app/admin/actions";
import Toast from "./Toast";

export default function UserStatusHeader() {
  const [phone, setPhone] = useState("");
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' | 'warning' | null }>({ msg: "", type: null });
  const [isOpen, setIsOpen] = useState(false);
  const [supportLink, setSupportLink] = useState("https://wa.me/911234567890");

  const notify = (msg: string, type: 'success' | 'error' | 'warning') => {
    setToast({ msg, type });
  };

  useEffect(() => {
    if (isOpen) {
      import("@/app/admin/actions").then(m => m.getGlobalSettings().then(s => {
        if (s?.whatsapp_support_link) setSupportLink(s.whatsapp_support_link);
      }));
    }
  }, [isOpen]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await getTeamByPhone(phone);
      if (data) {
        setTeam(data);
        notify("SQUAD RECORDS SYNCHRONIZED", "success");
      } else {
        notify("NO SQUAD RECORDED. CHECK NUMBER OR CONTACT ADMIN.", "error");
      }
    } catch (err) {
      notify("GRID COMMUNICATION OFFLINE", "error");
    }
    setLoading(false);
  };

  return (
    <div className="status-header-wrap" style={{
      background: 'rgba(30,30,30,0.4)',
      backdropFilter: 'blur(15px)',
      borderBottom: '1px solid rgba(255,140,0,0.1)',
      position: 'relative',
      zIndex: 1000
    }}>
      <Toast message={toast.msg} type={toast.type} onClear={() => setToast({ msg: "", type: null })} />

      <div className="status-container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0.8rem 5%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="live-dot" style={{ width: '8px', height: '8px', background: '#FF8C00', borderRadius: '50%', boxShadow: '0 0 10px #FF8C00' }}></span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>
            REGISTRATION MONITOR
          </span>
        </div>

        <button
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
              setToast({ msg: '', type: null }); // clear lingering toast on close
            } else {
              setIsOpen(true);
            }
          }}
          style={{
            background: 'none',
            border: '1.5px solid var(--ff-primary)',
            color: 'var(--ff-primary)',
            padding: '0.5rem 1.5rem',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: 800,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          {isOpen ? "CLOSE PORTAL" : "CHECK MY SQUAD"}
        </button>
      </div>

      {isOpen && (
        <div className="status-drawer animate-up" style={{
          background: 'rgba(10,10,10,0.98)',
          padding: '2rem 5%',
          borderBottom: '1px solid var(--ff-primary)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
        }}>
          {!team ? (
            <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-head)', color: '#FFF', fontSize: '1.5rem', marginBottom: '1rem' }}>BATTLE LOGS LOGIN</h3>
              <p style={{ color: 'var(--ff-muted)', fontSize: '0.8rem', marginBottom: '2rem' }}>Enter the WhatsApp number used during registration.</p>
              <form onSubmit={handleLookup} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="tel"
                  placeholder="PH: 81224XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '1rem',
                    color: '#FFF',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    outline: 'none'
                  }}
                  required
                />
                <button
                  disabled={loading}
                  type="submit"
                  style={{
                    background: 'var(--ff-primary)',
                    color: '#000',
                    border: 'none',
                    padding: '1rem 2rem',
                    fontWeight: 900,
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  SYNC
                </button>
              </form>
            </div>
          ) : (
            <div className="team-status-view" style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem' }}>
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--ff-primary)', fontWeight: 800, letterSpacing: '0.2rem', marginBottom: '0.5rem' }}>
                    REG_ID: {team.id?.split('-')[0].toUpperCase()}
                  </div>
                  <h2 style={{ fontFamily: 'var(--font-head)', color: '#FFF', fontSize: 'clamp(1.6rem, 6vw, 2.5rem)', fontWeight: 900, textTransform: 'uppercase', wordBreak: 'break-word', lineHeight: 1.1 }}>
                    {team.team_name}
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', color: '#FFF' }}>
                  <div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--ff-muted)', marginBottom: '0.4rem', letterSpacing: '0.1rem' }}>SQUAD LEADER</div>
                    <div style={{ fontWeight: 700 }}>{team.leader_name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--ff-muted)', marginBottom: '0.4rem', letterSpacing: '0.1rem' }}>CONTACT</div>
                    <div style={{ fontWeight: 700 }}>{team.phone}</div>
                  </div>
                </div>

                <button onClick={() => setTeam(null)} style={{ marginTop: '2rem', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)', padding: '0.8rem 1.5rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800, cursor: 'pointer' }}>
                  DISCONNECT LOGS
                </button>
              </div>

              <div style={{ background: 'rgba(255,140,0,0.03)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,140,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255,255,255,0.5)' }}>STATUS</span>
                  <span style={{
                    padding: '0.5rem 1.2rem',
                    borderRadius: '30px',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    background: team.payment_status === 'approved' ? '#064E3B' : team.payment_status === 'rejected' ? '#450A0A' : '#451A03',
                    color: team.payment_status === 'approved' ? '#34D399' : team.payment_status === 'rejected' ? '#F87171' : '#FBBF24',
                    border: '1px solid currentColor',
                    letterSpacing: '0.1em'
                  }}>
                    {(team.payment_status || 'PENDING').toUpperCase()}
                  </span>
                </div>

                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  {team.payment_status === 'approved'
                    ? "✅ Payment Verified Successfully. Match details will be sent via WhatsApp shortly. Stay ready!"
                    : team.payment_status === 'rejected'
                      ? "Evidence non-compliant. Contact admin via WhatsApp immediately."
                      : "Transaction review in progress. Usually takes 60-120 mins."}
                </p>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Player tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {team.players?.map((p: any, i: number) => (
                      <div key={i} style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', fontSize: '0.72rem', color: '#FFF', whiteSpace: 'nowrap' as const }}>
                        {p.in_game_name} <span style={{ opacity: 0.3 }}>{p.game_uid}</span>
                      </div>
                    ))}
                  </div>
                  {/* Command Center — always below, never overlapping */}
                  <a
                    href={supportLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      padding: '0.9rem 1.5rem',
                      background: 'rgba(255,140,0,0.1)',
                      color: 'var(--ff-primary)',
                      border: '1px solid var(--ff-primary)',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 900,
                      fontSize: '0.75rem',
                      textAlign: 'center' as const,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase' as const,
                      transition: 'background 0.3s'
                    }}
                  >
                    📞 SCRIMS ADMIN CONTACT
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
