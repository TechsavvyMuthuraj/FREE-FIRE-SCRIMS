"use client";

import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning";
}

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "PROCEED", 
  cancelText = "CANCEL",
  type = "danger"
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const isDanger = type === "danger";

  return (
    <div 
      className="confirm-modal-overlay"
      onClick={onCancel}
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.85)', 
        backdropFilter: 'blur(12px)', 
        zIndex: 9999, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '1.5rem' 
      }}
    >
      <div 
        className="animate-scale-in"
        onClick={e => e.stopPropagation()}
        style={{ 
          background: '#0D0D0D', 
          border: `1px solid ${isDanger ? '#F43F5E' : '#F59E0B'}`, 
          width: '100%', 
          maxWidth: '450px', 
          borderRadius: '24px', 
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 0 60px ${isDanger ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)'}`,
          padding: '2.5rem'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
           <div style={{ 
             width: '64px', 
             height: '64px', 
             background: isDanger ? 'rgba(244, 63, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
             borderRadius: '50%',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             margin: '0 auto 1.5rem',
             fontSize: '2rem',
             color: isDanger ? '#F43F5E' : '#F59E0B',
             border: `1px solid ${isDanger ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
             animation: 'pulse-warn 2s infinite'
           }}>
             {isDanger ? "⚠️" : "⚡"}
           </div>
           
           <h2 style={{ 
             fontFamily: 'var(--font-head)', 
             color: '#FFF', 
             fontSize: '1.5rem', 
             letterSpacing: '0.05em',
             marginBottom: '0.8rem',
             textTransform: 'uppercase'
           }}>
             {title}
           </h2>
           
           <p style={{ 
             color: 'rgba(255,255,255,0.6)', 
             fontSize: '0.9rem', 
             lineHeight: '1.6' 
           }}>
             {message}
           </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
           <button 
             onClick={onCancel}
             style={{ 
               background: 'rgba(255,255,255,0.05)', 
               color: '#FFF', 
               border: '1px solid rgba(255,255,255,0.1)', 
               padding: '1rem', 
               fontWeight: 900, 
               borderRadius: '12px', 
               cursor: 'pointer',
               fontSize: '0.75rem',
               letterSpacing: '0.1em',
               transition: 'all 0.3s'
             }}
           >
             {cancelText}
           </button>
           <button 
             onClick={onConfirm}
             style={{ 
               background: isDanger ? 'linear-gradient(135deg, #F43F5E, #BE123C)' : 'linear-gradient(135deg, #F59E0B, #D97706)', 
               color: '#FFF', 
               border: 'none', 
               padding: '1rem', 
               fontWeight: 900, 
               borderRadius: '12px', 
               cursor: 'pointer',
               fontSize: '0.75rem',
               letterSpacing: '0.1em',
               boxShadow: `0 10px 25px ${isDanger ? 'rgba(244, 63, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
               transition: 'all 0.3s'
             }}
           >
             {confirmText}
           </button>
        </div>

        <style jsx global>{`
          @keyframes pulse-warn {
            0% { transform: scale(1); box-shadow: 0 0 0 0 ${isDanger ? 'rgba(244, 63, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)'}; }
            70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(244, 63, 94, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
          }
        `}</style>
      </div>
    </div>
  );
}
