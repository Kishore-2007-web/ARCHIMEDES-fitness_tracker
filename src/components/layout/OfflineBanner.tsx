import React from 'react';

export const OfflineBanner: React.FC = () => {
  return (
    <div
      role="status"
      className="font-mono"
      style={{
        margin: '0 0 14px 0',
        padding: '8px 12px',
        background: '#0d0d0d',
        border: '1px solid var(--border-medium)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11px',
        letterSpacing: '0.08em'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#ffaa00' }} />
        <span style={{ color: 'var(--text-secondary)' }}>OFFLINE PROTOCOL ENGAGED</span>
      </div>
      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>LOCAL STORAGE SECURED</span>
    </div>
  );
};
