"use client";

import { useState } from "react";

export default function BroadcastAlert({ broadcast }: { broadcast: any }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!broadcast) return null;

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        style={{ 
          background: 'linear-gradient(90deg, #9F1239, #E11D48, #9F1239)', 
          color: '#FFF', 
          padding: '12px 5%', 
          textAlign: 'center', 
          fontSize: '0.75rem', 
          fontWeight: 800,
          letterSpacing: '0.05em',
          position: 'sticky',
          top: 0,
          zIndex: 2000,
          boxShadow: '0 5px 20px rgba(225, 29, 72, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          textTransform: 'uppercase',
          cursor: 'pointer'
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', background: '#FFF', borderRadius: '50%', animation: 'pulse-glow 1.5s infinite' }}></span>
          LIVE {broadcast.category}:
        </span>
        <span style={{ opacity: 0.9 }}>{broadcast.title}</span>
        <button 
          style={{ 
            fontSize: '0.6rem', 
            padding: '4px 12px', 
            background: 'rgba(0,0,0,0.25)', 
            color: '#FFF',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '4px', 
            marginLeft: '15px',
            fontWeight: 900,
            cursor: 'pointer',
            letterSpacing: '0.1em'
          }}
        >
          OPEN ARTICLE
        </button>
      </div>

      {/* ARTICLE MODAL */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,0.85)', 
            backdropFilter: 'blur(10px)', 
            zIndex: 5000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '2rem' 
          }}
        >
          <div 
            className="animate-scale-in"
            onClick={e => e.stopPropagation()}
            style={{ 
              background: '#0A0A0A', 
              border: '1px solid var(--ff-primary)', 
              width: '100%', 
              maxWidth: '650px', 
              borderRadius: '12px', 
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 50px rgba(255, 140, 0, 0.15)'
            }}
          >
            <div style={{ padding: '2.5rem', background: 'rgba(255,140,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                   <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ff-primary)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      {broadcast.category}
                   </div>
                   <h2 style={{ fontFamily: 'var(--font-head)', color: '#FFF', fontSize: '1.75rem', margin: 0, lineHeight: 1.2 }}>
                      {broadcast.title}
                   </h2>
                </div>
                <button 
                   onClick={() => setIsOpen(false)}
                   style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.5 }}
                >
                  ×
                </button>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '8px', borderLeft: '3px solid var(--ff-primary)' }}>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', lineHeight: '1.8', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {broadcast.content}
                </p>
              </div>
              
              <div style={{ marginTop: '2.5rem', textAlign: 'right' }}>
                 <button 
                   onClick={() => setIsOpen(false)}
                   style={{ background: 'var(--ff-primary)', color: '#000', border: 'none', padding: '0.8rem 2rem', fontWeight: 800, borderRadius: '4px', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}
                 >
                   CONFIRMED
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse-glow {
          0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          70% { transform: scale(1.2); opacity: 0.8; box-shadow: 0 0 0 8px rgba(255, 255, 255, 0); }
          100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
      `}</style>
    </>
  );
}
