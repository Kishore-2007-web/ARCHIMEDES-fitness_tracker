import React from 'react';

export const OfflineBanner: React.FC = () => {
  return (
    <div
      role="alert"
      className="sys-alert-inverted font-mono"
      style={{
        margin: '0 0 16px 0',
        padding: '12px 16px',
        textAlign: 'center',
        border: '1px solid #ffffff'
      }}
    >
      <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.15em' }}>
        [ CONNECTION REQUIRED ]
      </div>
      <div style={{ fontSize: '11px', marginTop: '4px', letterSpacing: '0.04em' }}>
        ARCHIMEDES requires an active connection to safely save progression.
      </div>
    </div>
  );
};
