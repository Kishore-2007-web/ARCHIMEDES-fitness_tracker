import React, { useState } from 'react';
import { PreparationSection } from '../../types/workout';
import { Button } from '../../components/common/Button';
import { ImageViewerModal } from '../../components/overlays/ImageViewerModal';

interface WarmUpSectionProps {
  durationMinutes: number;
  sections?: PreparationSection[];
  items?: string[];
  isCompleted: boolean;
  onToggleComplete: (val: boolean) => void;
  imageUrl?: string;
}

export const WarmUpSection: React.FC<WarmUpSectionProps> = ({
  durationMinutes,
  sections,
  items = [],
  isCompleted,
  onToggleComplete,
  imageUrl = '/warmup-protocol.jpg'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [expandedSubsections, setExpandedSubsections] = useState<Record<number, boolean>>({});

  const toggleSubsection = (idx: number) => {
    setExpandedSubsections((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

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
            {isCompleted ? '✓ WARM-UP' : 'WARM-UP'}
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
          {/* VIEW IMAGE BUTTON UNDER PREWORKOUT / WARM-UP */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
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
                <span>20 MIN WARM-UP — MOVE · PREPARE · PERFORM</span>
                <span style={{ color: 'var(--text-secondary)' }}>CLICK IMAGE TO ZOOM</span>
              </div>
              <img
                src={imageUrl}
                alt="20 Min Warm-Up Routine"
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              {sections.map((sec, idx) => {
                const isSubOpen = Boolean(expandedSubsections[idx]);
                return (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-primary)'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSubsection(idx)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left'
                      }}
                    >
                      <div className="font-mono">
                        <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                          {sec.title}
                        </span>
                        {sec.duration && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                            {sec.duration}
                          </span>
                        )}
                      </div>
                      <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {isSubOpen ? '▲' : '▼'}
                      </span>
                    </button>

                    {isSubOpen && (
                      <div
                        style={{
                          padding: '8px 12px 12px 12px',
                          borderTop: '1px solid var(--border-faint)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        {sec.items.map((item, iIdx) => (
                          <div
                            key={iIdx}
                            style={{
                              fontSize: '12px',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.4
                            }}
                          >
                            • {item}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  • {item}
                </div>
              ))}
            </div>
          )}

          <Button
            variant={isCompleted ? 'inverted' : 'outline'}
            onClick={() => onToggleComplete(!isCompleted)}
            style={{ minHeight: '44px', fontSize: '12px' }}
          >
            {isCompleted ? '✓ WARM-UP COMPLETED' : 'MARK WARM-UP COMPLETE'}
          </Button>
        </div>
      )}

      <ImageViewerModal
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
        src={imageUrl}
        title="20 MIN WARM-UP PROTOCOL"
        subtitle="WARM-UP // PRE-WORKOUT"
      />
    </div>
  );
};
