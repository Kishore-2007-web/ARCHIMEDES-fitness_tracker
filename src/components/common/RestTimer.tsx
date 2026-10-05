import React from 'react';
import { useUserProgression } from '../../context/UserProgressionContext';
import { formatSecondsToTimer } from '../../lib/formatting/formatters';
import { Button } from './Button';

export const RestTimer: React.FC = () => {
  const { restTimer, startRestTimer, addRestTimerSeconds, skipRestTimer, pauseRestTimer, resetRestTimer } =
    useUserProgression();

  return (
    <div
      className="sys-section"
      style={{
        border: restTimer.isActive ? '1px solid #ffffff' : '1px solid var(--border-subtle)',
        marginTop: '16px'
      }}
    >
      <div className="sys-section-title">
        <span>REST PROTOCOL</span>
        <span className="sys-tag">{restTimer.isActive ? 'RUNNING' : 'IDLE'}</span>
      </div>

      <div style={{ textAlign: 'center', margin: '12px 0 16px 0' }}>
        <div
          className="font-mono"
          style={{
            fontSize: '44px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            lineHeight: 1
          }}
        >
          {formatSecondsToTimer(restTimer.secondsRemaining)}
        </div>
        <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
          DEFAULT 03:00 // SILENT PROTOCOL
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {!restTimer.isActive ? (
          <Button variant="inverted" onClick={() => startRestTimer(180)}>
            START TIMER
          </Button>
        ) : (
          <Button variant="outline" onClick={pauseRestTimer}>
            PAUSE
          </Button>
        )}

        <Button variant="outline" onClick={() => addRestTimerSeconds(30)}>
          +30 SEC
        </Button>
      </div>

      {restTimer.isActive && (
        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
          <Button variant="subtle" onClick={skipRestTimer}>
            SKIP REST
          </Button>
          <Button variant="subtle" onClick={resetRestTimer}>
            RESET
          </Button>
        </div>
      )}
    </div>
  );
};
