"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | null;
  onClear: () => void;
}

export default function Toast({ message, type, onClear }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message && type) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClear, 400); // Wait for fade out animation
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [message, type, onClear]);

  if (!message || !type) return null;

  return (
    <div className={`toast-container ${isVisible ? 'show' : 'hide'}`} style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10000,
      padding: '0.8rem 2rem',
      borderRadius: '16px',
      background: type === 'success' ? 'linear-gradient(135deg, #065F46, #059669)' : 
                  type === 'error' ? 'linear-gradient(135deg, #7F1D1D, #DC2626)' : 
                  'linear-gradient(135deg, #92400E, #D97706)',
      boxShadow: type === 'success' ? '0 10px 40px rgba(16,185,129,0.3)' : 
                 type === 'error' ? '0 10px 40px rgba(220,38,38,0.3)' : 
                 '0 10px 40px rgba(217,119,6,0.3)',
      color: '#FFF',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      border: `1px solid ${type === 'success' ? '#34D399' : type === 'error' ? '#F87171' : '#FBBF24'}`,
      fontFamily: 'var(--font-head)',
      fontWeight: 800,
      fontSize: '0.75rem',
      letterSpacing: '0.15em',
      pointerEvents: 'none',
      transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
    }}>
      <span style={{ fontSize: '1.2rem' }}>
        {type === 'success' ? '✓' : type === 'error' ? '⚠' : '⚡'}
      </span>
      {message.toUpperCase()}

      <style jsx>{`
        .toast-container.show {
          opacity: 1;
          transform: translate(-50%, 0);
        }
        .toast-container.hide {
          opacity: 0;
          transform: translate(-50%, -100%);
        }
      `}</style>
    </div>
  );
}
