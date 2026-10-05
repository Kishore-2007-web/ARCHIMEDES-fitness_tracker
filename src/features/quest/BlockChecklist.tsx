import React from 'react';
import { PreparationSection } from '../../types/workout';

interface BlockChecklistProps {
  title: string;
  durationLabel: string;
  items: string[];
  sections?: PreparationSection[];
  isCompleted: boolean;
  onToggleComplete: (completed: boolean) => void;
}

export const BlockChecklist: React.FC<BlockChecklistProps> = ({
  title,
  durationLabel,
  items,
  sections,
  isCompleted,
  onToggleComplete
}) => {
  return (
    <div
      className="sys-section"
      style={{
        border: isCompleted ? '1px solid var(--border-medium)' : '1px solid #ffffff',
        marginBottom: '16px'
      }}
    >
      <div className="sys-section-title">
        <span>{title}</span>
        <span className="sys-tag">{durationLabel}</span>
      </div>

      {sections && sections.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '12px 0 16px 0' }}>
          {sections.map((sec, sIdx) => (
            <div key={sIdx} style={{ border: '1px solid var(--border-subtle)', padding: '10px' }}>
              <div className="flex-between font-mono" style={{ fontSize: '11px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <span>{sec.title}</span>
                {sec.duration && <span className="sys-tag" style={{ fontSize: '9px' }}>{sec.duration}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sec.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="font-mono flex-between"
                    style={{
                      fontSize: '12px',
                      color: isCompleted ? 'var(--text-muted)' : 'var(--text-secondary)',
                      paddingLeft: '6px'
                    }}
                  >
                    <span>• {item}</span>
                    <span style={{ fontSize: '10px', color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {isCompleted ? '[✓]' : '[ ]'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '10px 0 14px 0' }}>
          {items.map((item, idx) => (
            <div
              key={idx}
              className="font-mono flex-between"
              style={{
                fontSize: '12px',
                color: isCompleted ? 'var(--text-muted)' : 'var(--text-secondary)',
                borderBottom: '1px solid var(--border-faint)',
                paddingBottom: '4px'
              }}
            >
              <span>{item}</span>
              <span style={{ fontSize: '10px', color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {isCompleted ? '[✓]' : '[ ]'}
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className={`sys-btn ${isCompleted ? 'sys-btn-inverted' : 'sys-btn-outline'}`}
        onClick={() => onToggleComplete(!isCompleted)}
        style={{ minHeight: '44px', width: '100%', fontSize: '13px' }}
      >
        {isCompleted ? `✓ ${title} COMPLETE` : `MARK ${title} COMPLETE`}
      </button>
    </div>
  );
};
