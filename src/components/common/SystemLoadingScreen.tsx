import React, { useState, useEffect } from 'react';

interface SystemLoadingScreenProps {
  onBypass: () => void;
  showBypass: boolean;
}

const BOOT_STAGES = [
  'INITIALIZING SYSTEM KERNEL...',
  'READING PERSISTENT REPOSITORY CACHE...',
  'CALIBRATING 124-DAY PROGRESSION TIMELINE...',
  'SYNCHRONIZING USER ATHLETIC TELEMETRY...',
  'ESTABLISHING SECURE PROTOCOL LINK...'
];

export const SystemLoadingScreen: React.FC<SystemLoadingScreenProps> = ({
  onBypass,
  showBypass
}) => {
  const [stageIndex, setStageIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(12);

  useEffect(() => {
    // Stage message cycler
    const stageInterval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % BOOT_STAGES.length);
    }, 450);

    // Simulated fast boot percentage counter
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        const jump = Math.floor(Math.random() * 8) + 4;
        return Math.min(98, prev + jump);
      });
    }, 120);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div
      className="flex-center min-h-screen bg-black font-mono text-center"
      style={{
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px',
        animation: 'sysScanGrid 20s linear infinite'
      }}
    >
      {/* Corner Tactical HUD Brackets */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          fontSize: '14px',
          color: 'var(--text-faint)',
          lineHeight: 1
        }}
      >
        ┌ SEC_BOOT // 001
      </div>
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          fontSize: '14px',
          color: 'var(--text-faint)',
          lineHeight: 1
        }}
      >
        SYS_VER 2.4.0 ┐
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          fontSize: '14px',
          color: 'var(--text-faint)',
          lineHeight: 1
        }}
      >
        └ PWA // OFFLINE_CAPABLE
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          fontSize: '14px',
          color: 'var(--text-faint)',
          lineHeight: 1
        }}
      >
        [● LIVE] ┘
      </div>

      <div style={{ maxWidth: '360px', width: '100%', position: 'relative', zIndex: 1 }}>
        {/* Animated Central Gyroscope / Radar Spinner */}
        <div
          style={{
            width: '104px',
            height: '104px',
            margin: '0 auto 24px auto',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Outer rotating dashed ring */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '1px dashed rgba(255, 255, 255, 0.35)',
              animation: 'sysRadarRotate 10s linear infinite'
            }}
          />

          {/* Middle counter-rotating segmented ring */}
          <div
            style={{
              position: 'absolute',
              inset: '12px',
              borderRadius: '50%',
              border: '1.5px solid transparent',
              borderTopColor: '#ffffff',
              borderBottomColor: '#ffffff',
              animation: 'sysRadarReverse 4s linear infinite'
            }}
          />

          {/* Inner ring */}
          <div
            style={{
              position: 'absolute',
              inset: '24px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          />

          {/* Central Pulsing Reticle Core */}
          <div
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'sysPulseCore 2s ease-in-out infinite'
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Tactical Diamond Crosshair */}
              <polygon points="12 2 22 12 12 22 2 12" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3" fill="#ffffff" />
            </svg>
          </div>
        </div>

        {/* System Header Labels */}
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '0.3em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: '6px'
          }}
        >
          ARCHIMEDES // OS
        </div>

        <h1
          style={{
            fontSize: '18px',
            fontWeight: 800,
            letterSpacing: '0.1em',
            margin: '0 0 16px 0',
            color: '#ffffff',
            textTransform: 'uppercase'
          }}
        >
          INITIALIZING SYSTEM...
        </h1>

        {/* Tactical Scan Runner Bar */}
        <div
          style={{
            width: '100%',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '1px',
            overflow: 'hidden',
            position: 'relative',
            marginBottom: '14px',
            border: '1px solid var(--border-subtle)'
          }}
        >
          {/* Running light scanner */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              background: '#ffffff',
              boxShadow: '0 0 12px #ffffff',
              animation: 'sysBarRunner 1.4s ease-in-out infinite'
            }}
          />
        </div>

        {/* Telemetry and Boot Status Log */}
        <div
          className="flex-between font-mono"
          style={{
            fontSize: '10px',
            color: 'var(--text-secondary)',
            letterSpacing: '0.06em',
            minHeight: '18px',
            marginBottom: '4px'
          }}
        >
          <span style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
            {BOOT_STAGES[stageIndex]}
          </span>
          <span style={{ fontWeight: 800, color: '#ffffff' }}>
            {progress}%
          </span>
        </div>

        {/* Sub-status line */}
        <div
          style={{
            fontSize: '9px',
            color: 'var(--text-muted)',
            letterSpacing: '0.12em',
            marginTop: '8px'
          }}
        >
          MEM: 100% OK // COLD_CACHE: ACTIVE
        </div>

        {/* Bypass option if connection takes longer */}
        {showBypass && (
          <div className="anim-fade-in" style={{ marginTop: '28px' }}>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginBottom: '12px',
                lineHeight: 1.4
              }}
            >
              Network handshake taking longer than usual.
            </div>
            <button
              type="button"
              className="sys-btn sys-btn-inverted"
              style={{ width: '100%', fontSize: '12px', padding: '12px 14px', fontWeight: 800 }}
              onClick={onBypass}
            >
              BYPASS // ENTER OPERATOR MODE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
