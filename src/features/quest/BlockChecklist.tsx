import React from 'react';

interface BlockChecklistProps {
  title: string;
  durationLabel: string;
  items: string[];
  isCompleted: boolean;
  onToggleComplete: (completed: boolean) => void;
}

export const BlockChecklist: React.FC<BlockChecklistProps> = ({
  title,
  durationLabel,
  items,
  isCompleted,
  onToggleComplete
}) => {
  return (
    <div
      className="sys-section"
      style={{
        border: isCompleted ? '1px solid var(--border-medium)' : '1px solid var(--border-strong)',
        marginBottom: '16px'
      }}
    >
      <div className="sys-section-title">
        <span>{title}</span>
        <span className="sys-tag">{durationLabel}</span>
      </div>

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
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>[ ✓ ]</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`sys-btn ${isCompleted ? 'sys-btn-inverted' : 'sys-btn-outline'}`}
        onClick={() => onToggleComplete(!isCompleted)}
        style={{ minHeight: '44px', width: '100%' }}
      >
        {isCompleted ? `✓ ${title} COMPLETE` : `MARK ${title} COMPLETE`}
      </button>
    </div>
  );
};
