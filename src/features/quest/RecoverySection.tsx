import React, { useState } from 'react';
import { PreparationSection } from '../../types/workout';
import { Button } from '../../components/common/Button';
import { ImageViewerModal } from '../../components/overlays/ImageViewerModal';

interface RecoverySectionProps {
  durationMinutes: number;
  sections?: PreparationSection[];
  items?: string[];
  walkingMinutes?: number;
  walkingRange?: string;
  isRecoveryComplete: boolean;
  isWalkingComplete: boolean;
  onToggleRecovery: (val: boolean) => void;
  onToggleWalking: (val: boolean) => void;
  imageUrl?: string;
}

export const RecoverySection: React.FC<RecoverySectionProps> = ({
  durationMinutes,
  sections,
  items = [],
  walkingMinutes = 0,
  walkingRange = '30–45 min',
  isRecoveryComplete,
  isWalkingComplete,
  onToggleRecovery,
  onToggleWalking,
  imageUrl = '/recovery-protocol.jpg'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Main Collapsible Header */}
      <button
        type="button"
        className="sys-collapsible-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="font-mono flex-center gap-2">
          <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.08em' }}>
            {isRecoveryComplete ? '✓ RECOVERY' : 'RECOVERY'}
          </span>
          <span className="sys-tag" style={{ fontSize: '10px' }}>
            {durationMinutes} MIN
          </span>
        </div>
        <span className="font-mono" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {/* Expanded Content with Progressive Disclosure */}
      {isOpen && (
        <div className="sys-collapsible-content anim-fade-in">
          {/* Recovery Elements */}
          <div style={{ marginBottom: '14px' }}>
            <div className="font-mono flex-between" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <span>RECOVERY PROTOCOL ({durationMinutes} MIN)</span>
            </div>

            {/* VIEW IMAGE BUTTON UNDER RECOVERY PROTOCOL */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <button
                type="button"
                className="sys-btn sys-btn-subtle font-mono"
                style={{
                  width: 'auto',
                  minHeight: '30px',
                  padding: '4px 12px',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
                onClick={() => setShowImage(!showImage)}
              >
                <span>📷</span> {showImage ? 'HIDE IMAGE' : 'VIEW IMAGE'}
              </button>
              {showImage && (
                <button
                  type="button"
                  onClick={() => setShowLightbox(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  🔍 FULLSCREEN
                </button>
              )}
            </div>

            {showImage && (
              <div
                className="anim-fade-in"
                style={{
                  marginBottom: '14px',
                  border: '1px solid var(--border-medium)',
                  background: '#050505',
                  padding: '8px'
                }}
              >
                <div
                  className="flex-between font-mono"
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    letterSpacing: '0.1em',
                    marginBottom: '6px'
                  }}
                >
                  <span>15 MIN RECOVERY — COOL-DOWN · MOBILITY · DECOMPRESSION</span>
                  <span style={{ color: 'var(--text-secondary)' }}>CLICK IMAGE TO ZOOM</span>
                </div>
                <img
                  src={imageUrl}
                  alt="15 Min Recovery Routine"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    border: '1px solid var(--border-faint)',
                    cursor: 'zoom-in'
                  }}
                  onClick={() => setShowLightbox(true)}
                />
              </div>
            )}
            {sections && sections.length > 0 ? (
              sections.map((sec, idx) => (
                <div key={idx} style={{ marginBottom: '8px' }}>
                  <div className="font-mono" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {sec.title} {sec.duration && `(${sec.duration})`}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', paddingLeft: '4px' }}>
                    {sec.items.map((it, iIdx) => (
                      <div key={iIdx} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        • {it}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {items.map((it, idx) => (
                  <div key={idx} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    • {it}
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '10px' }}>
              <Button
                variant={isRecoveryComplete ? 'inverted' : 'outline'}
                onClick={() => onToggleRecovery(!isRecoveryComplete)}
                style={{ minHeight: '40px', fontSize: '12px' }}
              >
                {isRecoveryComplete ? '✓ RECOVERY COMPLETED' : 'MARK RECOVERY COMPLETE'}
              </Button>
            </div>
          </div>

          {/* Continuous Walking Block */}
          {walkingMinutes > 0 && (
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <div className="font-mono flex-between" style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                <span>WALK</span>
                <span className="sys-tag" style={{ fontSize: '9px' }}>{walkingRange}</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.4 }}>
                Continuous brisk walking to enhance blood flow and systemic restoration.
              </p>
              <Button
                variant={isWalkingComplete ? 'inverted' : 'outline'}
                onClick={() => onToggleWalking(!isWalkingComplete)}
                style={{ minHeight: '40px', fontSize: '12px' }}
              >
                {isWalkingComplete ? '✓ WALKING LOGGED' : 'MARK WALK COMPLETE'}
              </Button>
            </div>
          )}
        </div>
      )}

      <ImageViewerModal
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
        src={imageUrl}
        title="15 MIN RECOVERY PROTOCOL"
        subtitle="RECOVERY PROTOCOL"
      />
    </div>
  );
};
