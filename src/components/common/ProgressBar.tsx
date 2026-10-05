import React from 'react';

interface ProgressBarProps {
  progressPercent: number; // 0 to 100
  height?: number;
  label?: string;
  valueDisplay?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progressPercent,
  height = 8,
  label,
  valueDisplay
}) => {
  const clamped = Math.min(100, Math.max(0, progressPercent));

  return (
    <div style={{ width: '100%', margin: '6px 0' }}>
      {(label || valueDisplay) && (
        <div className="flex-between font-mono" style={{ fontSize: '11px', marginBottom: '4px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{valueDisplay || `${clamped}%`}</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-medium)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clamped}%`,
            backgroundColor: 'var(--bg-inverted)',
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  );
};
