"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";

interface ImagePreviewModalProps {
  src: string | null;
  isOpen: boolean;
  onClose: () => void;
  alt?: string;
}

export default function ImagePreviewModal({ src, isOpen, onClose, alt = "Preview" }: ImagePreviewModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // ESC key listener
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!mounted || !src) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          className="image-preview-portal"
          style={{ 
            position: 'fixed', inset: 0, zIndex: 20000, 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem', boxSizing: 'border-box'
          }}
        >
          {/* BACKDROP */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ 
              position: 'absolute', inset: 0, 
              background: 'rgba(0,0,0,0.92)', 
              backdropFilter: 'blur(12px)',
              cursor: 'zoom-out'
            }}
          />

          {/* CARD CONTAINER */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="preview-card"
            onClick={e => e.stopPropagation()}
            style={{ 
              position: 'relative', width: 'auto', maxWidth: '95vw', maxHeight: '92vh',
              background: '#FFFFFF', borderRadius: '32px', padding: '12px',
              boxShadow: '0 50px 100px rgba(0,0,0,0.5)', zIndex: 20001,
              border: '1px solid rgba(255,140,0,0.2)', display: 'flex', flexDirection: 'column'
            }}
          >
            {/* CLOSE BUTTON */}
            <button 
              onClick={onClose}
              style={{ 
                position: 'absolute', top: '-1.5rem', right: '-1.5rem', 
                background: '#FF8C00', color: '#000', border: 'none', 
                width: '44px', height: '44px', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
                zIndex: 20002, transition: 'transform 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <X size={24} strokeWidth={3} />
            </button>

            <div style={{ overflow: 'hidden', borderRadius: '22px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src={src} 
                alt={alt} 
                style={{ 
                  maxWidth: '100%', maxHeight: 'calc(92vh - 80px)', 
                  objectFit: 'contain', borderRadius: '20px' 
                }} 
              />
            </div>

            {/* FOOTER */}
            <div style={{ textAlign: 'center', padding: '1.25rem 0.5rem 0.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
               <button 
                 onClick={onClose}
                 style={{ 
                   background: '#F9FAFB', color: '#6B7280', border: '1px solid #E5E7EB',
                   padding: '0.75rem 2.5rem', borderRadius: '12px', fontSize: '0.8rem',
                   fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.05em'
                 }}
                 onMouseOver={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#111827'; }}
                 onMouseOut={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.color = '#6B7280'; }}
               >
                 CLOSE PREVIEW
               </button>
            </div>
          </motion.div>

          <style jsx>{`
            .preview-card {
              animation: none !important; /* Override any global modal animations */
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
