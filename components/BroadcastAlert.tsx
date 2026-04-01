"use client";

import { useState } from "react";

export default function BroadcastAlert({ broadcast }: { broadcast: any }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!broadcast) return null;

  return (
    <>
      {/* BROADCAST BAR */}
      <div 
        onClick={() => setIsOpen(true)}
        style={{ 
          background: 'linear-gradient(90deg, #9F1239, #E11D48, #9F1239)', 
          color: '#FFF', 
          padding: '10px 4%', 
          textAlign: 'center', 
          fontSize: '0.75rem', 
          fontWeight: 800,
          letterSpacing: '0.04em',
          position: 'sticky',
          top: 0,
          zIndex: 2000,
          boxShadow: '0 5px 20px rgba(225, 29, 72, 0.3)',
          display: 'flex',
          flexWrap: 'wrap' as const,
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px 10px',
          textTransform: 'uppercase' as const,
          cursor: 'pointer',
          lineHeight: 1.4
        }}
      >
        {/* Live dot + category label */}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span style={{ 
            width: '7px', height: '7px', 
            background: '#FFF', borderRadius: '50%', 
            animation: 'pulse-glow 1.5s infinite',
            display: 'inline-block', flexShrink: 0 
          }}></span>
          LIVE {broadcast.category}:
        </span>

        {/* Title — truncated on small screens */}
        <span style={{ 
          opacity: 0.92, 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap' as const,
          maxWidth: 'min(280px, 45vw)',
          flexShrink: 1,
          minWidth: 0
        }}>
          {broadcast.title}
        </span>

        {/* Open Article button */}
        <button 
          onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
          style={{ 
            fontSize: '0.6rem', 
            padding: '4px 10px', 
            background: 'rgba(0,0,0,0.3)', 
            color: '#FFF',
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: '4px', 
            fontWeight: 900,
            cursor: 'pointer',
            letterSpacing: '0.1em',
            flexShrink: 0,
            whiteSpace: 'nowrap' as const
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
            background: 'rgba(0,0,0,0.92)', 
            backdropFilter: 'blur(15px)', 
            zIndex: 5000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '1rem',
            overflowY: 'auto'
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
              borderRadius: '24px', 
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 80px rgba(255, 140, 0, 0.2)',
              maxHeight: '88vh',
              overflowY: 'auto',
              margin: 'auto'
            }}
          >
            <div style={{ padding: 'clamp(1.25rem, 5%, 2.5rem)', background: 'rgba(255,140,0,0.02)' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem' }}>
                <div style={{ minWidth: 0 }}>
                   <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ff-primary)', letterSpacing: '0.25em', textTransform: 'uppercase' as const, marginBottom: '0.5rem' }}>
                      {broadcast.category}
                   </div>
                   <h2 style={{ fontFamily: 'var(--font-head)', color: '#FFF', fontSize: 'clamp(1.3rem, 5vw, 2rem)', margin: 0, lineHeight: 1.2, wordBreak: 'break-word' as const }}>
                      {broadcast.title}
                   </h2>
                </div>
                <button 
                   onClick={() => setIsOpen(false)}
                   style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '2rem', cursor: 'pointer', opacity: 0.5, padding: '0.25rem', flexShrink: 0, lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
 
              {/* Content */}
              <div style={{ 
                background: 'rgba(255,255,255,0.03)', 
                padding: 'clamp(1rem, 4%, 2rem)', 
                borderRadius: '16px', 
                borderLeft: '4px solid var(--ff-primary)',
                marginBottom: '1.5rem'
              }}>
                <p style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)', 
                  lineHeight: '1.8', 
                  margin: 0, 
                  whiteSpace: 'pre-wrap' as const,
                  textAlign: 'left' as const,
                  wordBreak: 'break-word' as const
                }}>
                  {broadcast.content}
                </p>
              </div>
              
              {/* Close button */}
              <div style={{ textAlign: 'center' as const }}>
                 <button 
                   onClick={() => setIsOpen(false)}
                   style={{ 
                     background: 'var(--ff-primary)', 
                     color: '#000', 
                     border: 'none', 
                     padding: '1.1rem 2rem', 
                     fontWeight: 900, 
                     borderRadius: '12px', 
                     cursor: 'pointer', 
                     textTransform: 'uppercase' as const, 
                     fontSize: '0.8rem', 
                     letterSpacing: '0.15em',
                     width: '100%',
                     maxWidth: '300px',
                     boxShadow: '0 10px 25px rgba(255, 140, 0, 0.3)'
                   }}
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
        /* Mobile - make bar more compact */
        @media (max-width: 480px) {
          .broadcast-title-text {
            max-width: 120px !important;
          }
        }
      `}</style>
    </>
  );
}
