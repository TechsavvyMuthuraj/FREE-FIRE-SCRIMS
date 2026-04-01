"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | null;
  onClear: () => void;
}

export default function Toast({ message, type, onClear }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (message && type) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClear, 400); // Wait for fade out animation
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, type, onClear]);

  if (!mounted || !message || !type) return null;

  const content = (
    <div className={`toast-container ${isVisible ? 'show' : 'hide'}`} style={{
      position: 'fixed',
      top: '80px',
      left: '0',
      right: '0',
      margin: '0 auto',
      zIndex: 999999,
      padding: '0.8rem 1.5rem',
      borderRadius: '16px',
      background: type === 'success' ? 'linear-gradient(135deg, #065F46, #059669)' : 
                  type === 'error' ? 'linear-gradient(135deg, #7F1D1D, #DC2626)' : 
                  'linear-gradient(135deg, #92400E, #D97706)',
      boxShadow: type === 'success' ? '0 10px 40px rgba(16,185,129,0.5)' : 
                 type === 'error' ? '0 10px 40px rgba(220,38,38,0.5)' : 
                 '0 10px 40px rgba(217,119,6,0.5)',
      color: '#FFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.8rem',
      width: 'max-content',
      maxWidth: '85vw',
      textAlign: 'center',
      border: `1px solid ${type === 'success' ? '#34D399' : type === 'error' ? '#F87171' : '#FBBF24'}`,
      fontFamily: 'var(--font-head)',
      fontWeight: 800,
      fontSize: 'clamp(0.75rem, 2vw, 1rem)',
      letterSpacing: '0.05em',
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
          transform: translateY(0);
        }
        .toast-container.hide {
          opacity: 0;
          transform: translateY(-20px);
        }
      `}</style>
    </div>
  );

  return createPortal(content, document.body);
}
