"use client";

interface ConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({ 
  isOpen, 
  onCancel, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = "PROCEED", 
  type = 'danger' 
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const color = type === 'danger' ? '#F43F5E' : type === 'warning' ? '#F59E0B' : '#0EA5E9';
  const icon = type === 'danger' ? '⚠️' : type === 'warning' ? '⚡' : 'ℹ️';

  return (
    <div className="modal-overlay active" onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="animate-scale-in modern-card" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '450px', background: '#FFF', padding: '2.5rem', textAlign: 'center', borderTop: `6px solid ${color}` }}>
        
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem', animation: 'bounce-light 2s infinite' }}>{icon}</div>
        
        <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', color: '#0F172A', marginBottom: '0.8rem', fontWeight: 900 }}>{title.toUpperCase()}</h3>
        <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.6', marginBottom: '2.5rem' }}>{message}</p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={onCancel}
            style={{ flex: 1, height: '52px', background: '#F1F5F9', border: 'none', borderRadius: '16px', fontWeight: 800, color: '#64748B', cursor: 'pointer' }}
          >
            CANCEL
          </button>
          <button 
            onClick={() => { onConfirm(); onCancel(); }}
            style={{ flex: 1, height: '52px', background: color, border: 'none', borderRadius: '16px', fontWeight: 900, color: '#FFF', cursor: 'pointer', boxShadow: `0 10px 20px ${color}33` }}
          >
            {confirmLabel.toUpperCase()}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-light {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
