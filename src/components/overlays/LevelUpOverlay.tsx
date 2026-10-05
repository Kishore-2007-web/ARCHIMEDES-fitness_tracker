import React, { useEffect } from 'react';

interface LevelUpOverlayProps {
  isOpen: boolean;
  prevLevel: number;
  newLevel: number;
  onClose: () => void;
}

export const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({
  isOpen,
  prevLevel,
  newLevel,
  onClose
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="sys-modal-backdrop anim-fade-in"
      onClick={onClose}
      style={{ zIndex: 300, cursor: 'pointer' }}
    >
      <div
        className="anim-scale-in"
        style={{
          border: '2px solid #ffffff',
          backgroundColor: '#000000',
          padding: '36px 28px',
          textAlign: 'center',
          maxWidth: '360px',
          width: '90%'
        }}
      >
        <div
          className="font-mono"
          style={{
            fontSize: '12px',
            letterSpacing: '0.3em',
            color: 'var(--text-muted)',
            marginBottom: '10px'
          }}
        >
          SYSTEM EVENT
        </div>

        <div
          className="font-mono"
          style={{
            fontSize: '28px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            margin: '8px 0'
          }}
        >
          LEVEL UP
        </div>

        <div
          className="font-mono"
          style={{
            fontSize: '48px',
            fontWeight: 800,
            letterSpacing: '0.05em',
            margin: '16px 0'
          }}
        >
          {prevLevel} → {newLevel}
        </div>

        <div
          className="font-mono"
          style={{
            fontSize: '11px',
            letterSpacing: '0.15em',
            color: 'var(--text-secondary)'
          }}
        >
          [ TAP TO CONTINUE ]
        </div>
      </div>
    </div>
  );
};
