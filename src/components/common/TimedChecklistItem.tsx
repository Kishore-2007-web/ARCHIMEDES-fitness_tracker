import React, { useState } from 'react';
import { parseDurationFromText } from '../../lib/formatting/durationParser';
import { ExerciseStopwatch } from './ExerciseStopwatch';

interface TimedChecklistItemProps {
  item: string;
}

export const TimedChecklistItem: React.FC<TimedChecklistItemProps> = ({ item }) => {
  const [showTimer, setShowTimer] = useState<boolean>(false);
  const parsed = parseDurationFromText(item);

  if (!parsed) {
    return (
      <div
        style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          padding: '2px 0'
        }}
      >
        • {item}
      </div>
    );
  }

  // Extract clean name before dash or separator if present
  const exerciseLabel = item.replace(/^[0-9]+\.\s*/, '');

  return (
    <div
      style={{
        padding: '3px 0',
        borderBottom: showTimer ? '1px solid var(--border-faint)' : 'none',
        marginBottom: showTimer ? '6px' : '0'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}
      >
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, flex: 1 }}>
          • {item}
        </div>

        {/* Stopwatch trigger button */}
        <button
          type="button"
          onClick={() => setShowTimer(!showTimer)}
          className="font-mono"
          style={{
            background: showTimer ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
            color: showTimer ? '#000000' : '#ffffff',
            border: '1px solid var(--border-medium)',
            padding: '2px 8px',
            fontSize: '10px',
            fontWeight: 800,
            cursor: 'pointer',
            borderRadius: '2px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
            letterSpacing: '0.04em'
          }}
          title={`Open ${parsed.primarySeconds}s stopwatch for this exercise`}
        >
          <span>⏱</span>
          <span>{showTimer ? 'HIDE' : `${parsed.primarySeconds}s TIMER`}</span>
        </button>
      </div>

      {/* Expandable Stopwatch */}
      {showTimer && (
        <div style={{ marginTop: '8px', marginBottom: '8px' }}>
          <ExerciseStopwatch
            targetSeconds={parsed.primarySeconds}
            quickPresets={parsed.availableOptions.length > 1 ? parsed.availableOptions : [15, parsed.primarySeconds, 45, 60]}
            exerciseName={exerciseLabel.slice(0, 30)}
            compact={true}
            autoStart={true}
            onClose={() => setShowTimer(false)}
          />
        </div>
      )}
    </div>
  );
};
