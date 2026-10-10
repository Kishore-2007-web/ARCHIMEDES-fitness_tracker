import React, { useState } from 'react';
import { PreparationSection } from '../../types/workout';
import { Button } from '../../components/common/Button';

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
  onToggleWalking
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showImage, setShowImage] = useState(false);

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
            <div style={{ marginBottom: '10px' }}>
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
            </div>

            {showImage && (
              <div
                className="anim-fade-in"
                style={{
                  marginBottom: '12px',
                  border: '1px solid var(--border-medium)',
                  background: '#050505',
                  padding: '10px'
                }}
              >
                <div className="font-mono" style={{ textAlign: 'center', padding: '10px 8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    RECOVERY PROTOCOL — VISUAL GUIDE
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    No diagram attached yet for recovery protocol. Follow decompression and aerobic flushing items below.
                  </div>
                </div>
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
    </div>
  );
};
