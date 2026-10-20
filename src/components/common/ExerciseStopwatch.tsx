import React, { useState, useEffect, useRef } from 'react';
import { formatSecondsToTimer } from '../../lib/formatting/formatters';
import { soundEffects } from '../../lib/audio/soundEffects';
import { Button } from './Button';

export interface ExerciseStopwatchProps {
  targetSeconds?: number;
  exerciseName?: string;
  quickPresets?: number[];
  onApplyDuration?: (seconds: number) => void;
  compact?: boolean;
  autoStart?: boolean;
  onClose?: () => void;
}

export const ExerciseStopwatch: React.FC<ExerciseStopwatchProps> = ({
  targetSeconds = 30,
  exerciseName,
  quickPresets = [15, 20, 30, 45, 60],
  onApplyDuration,
  compact = false,
  autoStart = false,
  onClose
}) => {
  const [selectedTarget, setSelectedTarget] = useState<number>(targetSeconds > 0 ? targetSeconds : 30);
  const [mode, setMode] = useState<'countdown' | 'countup'>('countdown');
  const [isActive, setIsActive] = useState<boolean>(autoStart);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(targetSeconds > 0 ? targetSeconds : 30);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const intervalRef = useRef<number | null>(null);

  // Sync if targetSeconds prop changes
  useEffect(() => {
    if (targetSeconds > 0) {
      setSelectedTarget(targetSeconds);
      if (!isActive) {
        setSecondsRemaining(targetSeconds);
      }
    }
  }, [targetSeconds]);

  // Main timer tick
  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        if (mode === 'countdown') {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              // Timer completed
              setIsActive(false);
              setIsCompleted(true);
              soundEffects.playComplete();
              return 0;
            }
            if (prev <= 4) {
              soundEffects.playTick();
            }
            return prev - 1;
          });
          setElapsedSeconds((prev) => prev + 1);
        } else {
          // Count up mode (stopwatch)
          setElapsedSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, mode]);

  const handleStart = () => {
    if (mode === 'countdown' && secondsRemaining <= 0) {
      setSecondsRemaining(selectedTarget);
      setElapsedSeconds(0);
      setIsCompleted(false);
    }
    soundEffects.playStart();
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsCompleted(false);
    setElapsedSeconds(0);
    setSecondsRemaining(selectedTarget);
  };

  const handleSelectPreset = (sec: number) => {
    setSelectedTarget(sec);
    setSecondsRemaining(sec);
    setElapsedSeconds(0);
    setIsCompleted(false);
    if (isActive) {
      setIsActive(false);
    }
  };

  const handleNudgeSeconds = (amount: number) => {
    if (mode === 'countdown') {
      const updated = Math.max(5, secondsRemaining + amount);
      setSecondsRemaining(updated);
      setSelectedTarget(Math.max(5, selectedTarget + amount));
    } else {
      setElapsedSeconds((prev) => Math.max(0, prev + amount));
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffects.enabled = next;
  };

  // Calculated display values
  const currentDisplaySeconds = mode === 'countdown' ? secondsRemaining : elapsedSeconds;
  const progressPercent = mode === 'countdown'
    ? Math.min(100, Math.max(0, ((selectedTarget - secondsRemaining) / selectedTarget) * 100))
    : Math.min(100, (elapsedSeconds / (selectedTarget || 60)) * 100);

  return (
    <div
      className="sys-section anim-fade-in"
      style={{
        border: isActive
          ? '1px solid #ffffff'
          : isCompleted
            ? '1px solid var(--neon-green)'
            : '1px solid var(--border-medium)',
        background: '#040404',
        padding: compact ? '12px' : '16px',
        position: 'relative'
      }}
    >
      {/* Header bar */}
      <div className="flex-between font-mono" style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em' }}>
            ⏱ {exerciseName ? exerciseName.toUpperCase() : 'EXERCISE STOPWATCH'}
          </span>
          <span
            className="sys-tag"
            style={{
              fontSize: '9px',
              color: isCompleted ? 'var(--neon-green)' : isActive ? '#ffffff' : 'var(--text-muted)',
              borderColor: isCompleted ? 'var(--neon-green)' : undefined
            }}
          >
            {isCompleted ? '✓ FINISHED' : isActive ? 'RUNNING' : 'STOPPED'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Sound toggle */}
          <button
            type="button"
            onClick={toggleSound}
            style={{
              background: 'transparent',
              border: 'none',
              color: soundEnabled ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '2px 4px'
            }}
            title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '2px 6px',
                fontFamily: 'var(--font-mono)'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Mode toggle */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px',
          background: 'var(--bg-surface-elevated)',
          padding: '2px',
          borderRadius: '2px',
          marginBottom: '12px'
        }}
      >
        <button
          type="button"
          onClick={() => {
            setMode('countdown');
            setSecondsRemaining(selectedTarget);
            setIsActive(false);
          }}
          style={{
            background: mode === 'countdown' ? '#ffffff' : 'transparent',
            color: mode === 'countdown' ? '#000000' : 'var(--text-secondary)',
            border: 'none',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            padding: '5px',
            cursor: 'pointer',
            letterSpacing: '0.05em'
          }}
        >
          COUNTDOWN ({selectedTarget}s)
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('countup');
            setElapsedSeconds(0);
            setIsActive(false);
          }}
          style={{
            background: mode === 'countup' ? '#ffffff' : 'transparent',
            color: mode === 'countup' ? '#000000' : 'var(--text-secondary)',
            border: 'none',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            padding: '5px',
            cursor: 'pointer',
            letterSpacing: '0.05em'
          }}
        >
          COUNT-UP (STOPWATCH)
        </button>
      </div>

      {/* Main Digital Time Display */}
      <div style={{ textAlign: 'center', margin: '8px 0 12px 0' }}>
        <div
          className="font-mono"
          style={{
            fontSize: compact ? '36px' : '44px',
            fontWeight: 800,
            letterSpacing: '0.06em',
            lineHeight: 1,
            color: isCompleted ? 'var(--neon-green)' : '#ffffff'
          }}
        >
          {formatSecondsToTimer(currentDisplaySeconds)}
        </div>

        {/* Target indication */}
        <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {mode === 'countdown'
            ? `TARGET: ${selectedTarget} SECONDS`
            : `ELAPSED TIME — HOLD AS LONG AS POSSIBLE`}
        </div>

        {/* Animated Progress Bar */}
        <div
          style={{
            height: '4px',
            width: '100%',
            background: 'var(--border-subtle)',
            marginTop: '10px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: isCompleted ? 'var(--neon-green)' : '#ffffff',
              transition: 'width 0.2s linear'
            }}
          />
        </div>
      </div>

      {/* Quick Target Preset Chips */}
      {mode === 'countdown' && (
        <div style={{ marginBottom: '12px' }}>
          <div
            className="font-mono"
            style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              marginBottom: '6px',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span>QUICK TIME PRESETS</span>
            <span>
              <button
                type="button"
                onClick={() => handleNudgeSeconds(-5)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '1px 6px',
                  fontSize: '9px',
                  marginRight: '4px',
                  cursor: 'pointer'
                }}
              >
                -5s
              </button>
              <button
                type="button"
                onClick={() => handleNudgeSeconds(5)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '1px 6px',
                  fontSize: '9px',
                  cursor: 'pointer'
                }}
              >
                +5s
              </button>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {quickPresets.map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => handleSelectPreset(sec)}
                style={{
                  background: selectedTarget === sec ? '#ffffff' : 'var(--bg-surface-elevated)',
                  color: selectedTarget === sec ? '#000000' : 'var(--text-primary)',
                  border: '1px solid var(--border-medium)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: selectedTarget === sec ? 800 : 600,
                  padding: '4px 8px',
                  cursor: 'pointer',
                  borderRadius: '2px'
                }}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {!isActive ? (
          <Button
            variant="inverted"
            onClick={handleStart}
            style={{ minHeight: '40px', fontSize: '12px', fontWeight: 800 }}
          >
            ▶ START {mode === 'countdown' ? `${selectedTarget}s` : ''}
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handlePause}
            style={{ minHeight: '40px', fontSize: '12px', fontWeight: 800, borderColor: '#ffffff' }}
          >
            ⏸ PAUSE
          </Button>
        )}

        <Button
          variant="subtle"
          onClick={handleReset}
          style={{ minHeight: '40px', fontSize: '12px' }}
        >
          ↺ RESET
        </Button>
      </div>

      {/* Apply to Set input (if onApplyDuration provided) */}
      {onApplyDuration && (
        <div style={{ marginTop: '10px' }}>
          <Button
            variant="inverted"
            onClick={() => {
              const secondsToApply = mode === 'countdown'
                ? (isCompleted ? selectedTarget : (selectedTarget - secondsRemaining) || selectedTarget)
                : elapsedSeconds;
              onApplyDuration(Math.max(1, secondsToApply));
            }}
            style={{
              width: '100%',
              minHeight: '36px',
              fontSize: '11px',
              letterSpacing: '0.05em',
              background: isCompleted ? 'var(--neon-green)' : undefined,
              color: isCompleted ? '#000000' : undefined
            }}
          >
            ✓ APPLY {mode === 'countdown' ? (isCompleted ? selectedTarget : Math.max(1, selectedTarget - secondsRemaining)) : elapsedSeconds}s TO SET DURATION
          </Button>
        </div>
      )}
    </div>
  );
};
