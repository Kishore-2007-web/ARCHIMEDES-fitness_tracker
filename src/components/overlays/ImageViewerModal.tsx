import React, { useEffect, useState } from 'react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  title?: string;
  subtitle?: string;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen,
  onClose,
  src,
  title = 'PROTOCOL VISUAL GUIDE',
  subtitle = 'ARCHIMEDES PROTOCOL DIRECTIVE'
}) => {
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setIsZoomed(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(0, 0, 0, 0.96)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Top Action Bar */}
      <div
        className="flex-between font-mono"
        style={{
          padding: '12px 16px',
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-medium)',
          zIndex: 10
        }}
      >
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
            {subtitle.toUpperCase()}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
            {title.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="sys-btn sys-btn-subtle font-mono"
            style={{ width: 'auto', minHeight: '34px', padding: '4px 12px', fontSize: '11px' }}
            onClick={() => setIsZoomed(!isZoomed)}
            title="Toggle Zoom"
          >
            {isZoomed ? '🔍 FIT SCREEN' : '🔍 100% ZOOM'}
          </button>

          <button
            type="button"
            className="sys-btn sys-btn-inverted font-mono"
            style={{ width: 'auto', minHeight: '34px', padding: '4px 14px', fontSize: '11px', fontWeight: 800 }}
            onClick={onClose}
          >
            ✕ CLOSE
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          alignItems: isZoomed ? 'flex-start' : 'center',
          justifyContent: isZoomed ? 'flex-start' : 'center',
          padding: '16px',
          cursor: isZoomed ? 'zoom-out' : 'zoom-in'
        }}
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <img
          src={src}
          alt={title}
          style={{
            maxWidth: isZoomed ? 'none' : '100%',
            maxHeight: isZoomed ? 'none' : 'calc(100vh - 100px)',
            width: isZoomed ? 'auto' : 'auto',
            height: 'auto',
            display: 'block',
            margin: 'auto',
            border: '1px solid var(--border-medium)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
            userSelect: 'none'
          }}
        />
      </div>

      {/* Bottom Hint */}
      <div
        className="font-mono flex-between"
        style={{
          padding: '8px 16px',
          background: 'var(--bg-base)',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '11px',
          color: 'var(--text-muted)'
        }}
      >
        <span>CLICK IMAGE TO TOGGLE FULL RESOLUTION ZOOM</span>
        <span>PRESS ESC TO CLOSE</span>
      </div>
    </div>
  );
};
