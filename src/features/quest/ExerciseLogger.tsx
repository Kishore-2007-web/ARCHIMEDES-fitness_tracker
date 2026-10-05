import React, { useState } from 'react';
import { ExerciseDefinition, LoggedSet } from '../../types/workout';
import { ExerciseHistoricalRecord } from '../../types/progress';
import { Button } from '../../components/common/Button';

interface ExerciseLoggerProps {
  exercise: ExerciseDefinition;
  loggedSets: LoggedSet[];
  historicalRecord?: ExerciseHistoricalRecord;
  onLogSet: (set: LoggedSet) => void;
  onTriggerRestTimer: () => void;
}

export const ExerciseLogger: React.FC<ExerciseLoggerProps> = ({
  exercise,
  loggedSets,
  historicalRecord,
  onLogSet,
  onTriggerRestTimer
}) => {
  const currentSetNumber = loggedSets.length + 1;
  const isAllTargetSetsCompleted = loggedSets.length >= exercise.targetSets;

  // Set input state
  const lastLoggedSet = loggedSets[loggedSets.length - 1];
  const lastHistoricalSet = historicalRecord?.sets?.[0];

  const defaultWeight = lastLoggedSet?.weightKg ?? lastHistoricalSet?.weightKg ?? 0;
  const defaultReps = lastLoggedSet?.reps ?? lastHistoricalSet?.reps ?? 0;
  const defaultDuration = lastLoggedSet?.durationSec ?? lastHistoricalSet?.durationSec ?? 30;
  const defaultAssistance = lastLoggedSet?.assistanceKg ?? lastHistoricalSet?.assistanceKg ?? 0;

  const [weight, setWeight] = useState<string>(defaultWeight > 0 ? String(defaultWeight) : '');
  const [reps, setReps] = useState<string>(defaultReps > 0 ? String(defaultReps) : '');
  const [duration, setDuration] = useState<string>(defaultDuration > 0 ? String(defaultDuration) : '');
  const [assistance, setAssistance] = useState<string>(defaultAssistance > 0 ? String(defaultAssistance) : '');

  const handleCompleteSet = () => {
    const newSet: LoggedSet = {
      setNumber: currentSetNumber,
      weightKg: weight ? Number(weight) : undefined,
      reps: reps ? Number(reps) : undefined,
      durationSec: duration ? Number(duration) : undefined,
      assistanceKg: assistance ? Number(assistance) : undefined,
      completedAt: new Date().toISOString()
    };

    onLogSet(newSet);
    onTriggerRestTimer();
  };

  return (
    <div
      className="sys-section"
      style={{
        border: isAllTargetSetsCompleted ? '1px solid var(--border-medium)' : '1px solid #ffffff',
        marginBottom: '16px'
      }}
    >
      <div className="sys-section-title">
        <span>{exercise.name}</span>
        <span className="sys-tag">
          {loggedSets.length} / {exercise.targetSets} SETS
        </span>
      </div>

      <div className="font-mono flex-between" style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
        <span>TARGET: {exercise.targetRepOrDuration}</span>
        {exercise.isBenchmark && <span className="sys-tag" style={{ fontSize: '9px' }}>BENCHMARK</span>}
      </div>

      {exercise.notes && (
        <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
          NOTE: {exercise.notes}
        </div>
      )}

      {/* LAST SESSION RECORD */}
      {historicalRecord && historicalRecord.sets.length > 0 && (
        <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', padding: '8px 10px', marginBottom: '12px' }}>
          <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            LAST SESSION ({historicalRecord.date})
          </div>
          <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {historicalRecord.sets.map((s, idx) => (
              <span key={idx} style={{ marginRight: '10px', display: 'inline-block' }}>
                {s.weightKg ? `${s.weightKg}kg × ${s.reps}` : s.durationSec ? `${s.durationSec}s` : `${s.reps} reps`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* COMPLETED SETS TODAY */}
      {loggedSets.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            LOGGED TODAY:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {loggedSets.map((s) => (
              <div
                key={s.setNumber}
                className="font-mono flex-between"
                style={{
                  backgroundColor: 'var(--bg-surface-elevated)',
                  padding: '6px 8px',
                  fontSize: '12px'
                }}
              >
                <span>SET {s.setNumber}</span>
                <span style={{ fontWeight: 700 }}>
                  {s.weightKg !== undefined && `${s.weightKg} kg × `}
                  {s.reps !== undefined && `${s.reps} reps`}
                  {s.durationSec !== undefined && `${s.durationSec} sec`}
                  {s.assistanceKg !== undefined && `(-${s.assistanceKg}kg assist)`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INPUT CONTROLS FOR CURRENT SET */}
      <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '12px', border: '1px solid var(--border-subtle)' }}>
        <div className="font-mono flex-between" style={{ fontSize: '11px', fontWeight: 700, marginBottom: '8px' }}>
          <span>ENTER SET {currentSetNumber}</span>
          <span style={{ color: 'var(--text-muted)' }}>{exercise.metricType.replace('_', ' ')}</span>
        </div>

        {exercise.metricType === 'WEIGHT_REPS' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            <div>
              <label className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                KG LOAD
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="sys-input"
                placeholder="Weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div>
              <label className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                REPS
              </label>
              <input
                type="number"
                inputMode="numeric"
                className="sys-input"
                placeholder="Reps"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
            </div>
          </div>
        )}

        {exercise.metricType === 'BODYWEIGHT_REPS' && (
          <div style={{ marginBottom: '10px' }}>
            <label className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
              REPETITIONS
            </label>
            <input
              type="number"
              inputMode="numeric"
              className="sys-input"
              placeholder="Reps completed"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
          </div>
        )}

        {exercise.metricType === 'DURATION' && (
          <div style={{ marginBottom: '10px' }}>
            <label className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
              DURATION (SECONDS)
            </label>
            <input
              type="number"
              inputMode="numeric"
              className="sys-input"
              placeholder="Duration in seconds"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        )}

        {exercise.metricType === 'WEIGHT_DURATION' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            <div>
              <label className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                KG LOAD (PER HAND)
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="sys-input"
                placeholder="Weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div>
              <label className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                HOLD SECONDS
              </label>
              <input
                type="number"
                inputMode="numeric"
                className="sys-input"
                placeholder="Seconds"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>
        )}

        {exercise.metricType === 'ASSISTANCE_REPS' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            <div>
              <label className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                ASSIST KG (0 = UNASSISTED)
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="sys-input"
                placeholder="Assistance kg"
                value={assistance}
                onChange={(e) => setAssistance(e.target.value)}
              />
            </div>
            <div>
              <label className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                REPS
              </label>
              <input
                type="number"
                inputMode="numeric"
                className="sys-input"
                placeholder="Reps"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
            </div>
          </div>
        )}

        {exercise.metricType === 'CHECK_ONLY' && (
          <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Completion block. Tap below to log set.
          </div>
        )}

        <Button
          variant="inverted"
          onClick={handleCompleteSet}
          style={{ minHeight: '44px' }}
        >
          COMPLETE SET {currentSetNumber}
        </Button>
      </div>
    </div>
  );
};
