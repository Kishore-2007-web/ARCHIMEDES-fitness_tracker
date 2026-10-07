import React, { useState, useEffect } from 'react';
import { ExerciseDefinition, LoggedSet } from '../../types/workout';
import { ExerciseHistoricalRecord } from '../../types/progress';
import { useUserProgression } from '../../context/UserProgressionContext';
import { formatSecondsToTimer } from '../../lib/formatting/formatters';
import { Button } from '../../components/common/Button';

interface ActiveStepLoggerProps {
  exercises: ExerciseDefinition[];
  activeExerciseIndex: number;
  onSelectExerciseIndex: (index: number) => void;
  historyRecords: Record<string, ExerciseHistoricalRecord>;
  onLogSet: (exerciseId: string, set: LoggedSet) => Promise<void>;
  onFinishWorkout: () => void;
}

export const ActiveStepLogger: React.FC<ActiveStepLoggerProps> = ({
  exercises,
  activeExerciseIndex,
  onSelectExerciseIndex,
  historyRecords,
  onLogSet,
  onFinishWorkout
}) => {
  const {
    activeSession,
    restTimer,
    startRestTimer,
    addRestTimerSeconds,
    skipRestTimer
  } = useUserProgression();

  const currentExercise = exercises[activeExerciseIndex] || exercises[0];
  const loggedSets = activeSession?.exercises[currentExercise.id]?.sets || [];
  const currentSetNumber = loggedSets.length + 1;
  const isExerciseDone = loggedSets.length >= currentExercise.targetSets;

  const nextExercise = exercises[activeExerciseIndex + 1];
  const laterExercises = exercises.slice(activeExerciseIndex + 2);

  // Historical record for current exercise
  const historical = historyRecords[currentExercise.id];
  const lastHistoricalSet = historical?.sets?.[0];
  const lastLoggedSet = loggedSets[loggedSets.length - 1];

  // Default values for inputs
  const defaultWeight = lastLoggedSet?.weightKg ?? lastHistoricalSet?.weightKg ?? 0;
  const defaultReps = lastLoggedSet?.reps ?? lastHistoricalSet?.reps ?? 0;
  const defaultDuration = lastLoggedSet?.durationSec ?? lastHistoricalSet?.durationSec ?? 30;
  const defaultAssistance = lastLoggedSet?.assistanceKg ?? lastHistoricalSet?.assistanceKg ?? 0;

  const [weight, setWeight] = useState<string>('');
  const [reps, setReps] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [assistance, setAssistance] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync defaults when exercise or set changes
  useEffect(() => {
    if (defaultWeight > 0) setWeight(String(defaultWeight));
    else setWeight('');

    if (defaultReps > 0) setReps(String(defaultReps));
    else setReps('');

    if (defaultDuration > 0) setDuration(String(defaultDuration));
    else setDuration('');

    if (defaultAssistance > 0) setAssistance(String(defaultAssistance));
    else setAssistance('');
  }, [currentExercise.id, loggedSets.length]);

  const handleCompleteSet = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const newSet: LoggedSet = {
      setNumber: currentSetNumber,
      weightKg: weight ? Number(weight) : undefined,
      reps: reps ? Number(reps) : undefined,
      durationSec: duration ? Number(duration) : undefined,
      assistanceKg: assistance ? Number(assistance) : undefined,
      completedAt: new Date().toISOString()
    };

    try {
      await onLogSet(currentExercise.id, newSet);
      // Trigger default 3-minute silent rest timer
      startRestTimer(180);
    } catch (err) {
      console.error('Failed to log set:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvanceToNext = () => {
    if (nextExercise) {
      skipRestTimer();
      onSelectExerciseIndex(activeExerciseIndex + 1);
    } else {
      onFinishWorkout();
    }
  };

  return (
    <div className="anim-fade-in">
      {/* EXERCISE STEPPER NAVIGATION */}
      <div
        className="flex-between font-mono"
        style={{
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <button
          type="button"
          onClick={() => onSelectExerciseIndex(Math.max(0, activeExerciseIndex - 1))}
          disabled={activeExerciseIndex <= 0}
          style={{
            background: 'none',
            border: 'none',
            color: activeExerciseIndex <= 0 ? 'var(--text-faint)' : 'var(--text-primary)',
            fontFamily: 'inherit',
            fontSize: '12px',
            fontWeight: 700,
            cursor: activeExerciseIndex <= 0 ? 'default' : 'pointer',
            padding: '4px 6px'
          }}
        >
          ← PREV
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
            EXERCISE {activeExerciseIndex + 1} OF {exercises.length}
          </div>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '4px' }}>
            {exercises.map((ex, idx) => {
              const isDone = (activeSession?.exercises[ex.id]?.sets?.length ?? 0) >= ex.targetSets;
              const isCurrent = idx === activeExerciseIndex;
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => onSelectExerciseIndex(idx)}
                  aria-label={`Jump to ${ex.name}`}
                  style={{
                    width: isCurrent ? '16px' : '8px',
                    height: '6px',
                    borderRadius: '2px',
                    background: isCurrent ? '#ffffff' : isDone ? 'var(--text-muted)' : 'var(--border-medium)',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                />
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectExerciseIndex(Math.min(exercises.length - 1, activeExerciseIndex + 1))}
          disabled={activeExerciseIndex >= exercises.length - 1}
          style={{
            background: 'none',
            border: 'none',
            color: activeExerciseIndex >= exercises.length - 1 ? 'var(--text-faint)' : 'var(--text-primary)',
            fontFamily: 'inherit',
            fontSize: '12px',
            fontWeight: 700,
            cursor: activeExerciseIndex >= exercises.length - 1 ? 'default' : 'pointer',
            padding: '4px 6px'
          }}
        >
          NEXT →
        </button>
      </div>

      {/* NOW: THE CURRENT EXERCISE */}
      <div className="sys-card-highlight">
        <div className="flex-between font-mono" style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
            NOW
          </span>
          <span className="sys-tag" style={{ fontSize: '10px' }}>
            {loggedSets.length} / {currentExercise.targetSets} SETS
          </span>
        </div>

        <h2
          className="font-mono"
          style={{
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '0.04em',
            margin: '0 0 4px 0',
            textTransform: 'uppercase'
          }}
        >
          {currentExercise.name}
        </h2>

        <div className="font-mono flex-between" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          <span>TARGET: {currentExercise.targetSets} × {currentExercise.targetRepOrDuration}</span>
          {currentExercise.isBenchmark && (
            <span className="sys-tag" style={{ fontSize: '9px' }}>BENCHMARK</span>
          )}
        </div>

        {currentExercise.notes && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.4 }}>
            {currentExercise.notes}
          </div>
        )}

        {/* LAST SESSION PERFORMANCE */}
        {historical && historical.sets && historical.sets.length > 0 && (
          <div
            style={{
              padding: '8px 10px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '14px'
            }}
          >
            <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              LAST SESSION
            </div>
            <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {historical.sets.map((s, idx) => (
                <span key={idx} style={{ marginRight: '8px', display: 'inline-block' }}>
                  {s.weightKg ? `${s.weightKg} kg × ${s.reps}` : s.durationSec ? `${s.durationSec}s` : `${s.reps} reps`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* LOGGED SETS SUMMARY FOR THIS EXERCISE */}
        {loggedSets.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              COMPLETED TODAY:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {loggedSets.map((s) => (
                <div
                  key={s.setNumber}
                  className="font-mono flex-between"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    padding: '6px 10px',
                    fontSize: '12px',
                    border: '1px solid var(--border-faint)'
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>SET {s.setNumber}</span>
                  <span style={{ fontWeight: 700 }}>
                    {s.weightKg !== undefined && `${s.weightKg} kg × `}
                    {s.reps !== undefined && `${s.reps} reps`}
                    {s.durationSec !== undefined && `${s.durationSec} sec`}
                    {s.assistanceKg !== undefined && `(-${s.assistanceKg}kg assist)`}
                    <span style={{ color: '#ffffff', marginLeft: '6px' }}>✓</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVE REST TIMER STATE */}
        {restTimer.isActive ? (
          <div
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid #ffffff',
              padding: '16px',
              textAlign: 'center',
              marginBottom: '10px'
            }}
          >
            <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
              SET {loggedSets.length} COMPLETE
            </div>
            <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              REST PROTOCOL
            </div>
            <div
              className="font-mono"
              style={{
                fontSize: '44px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                lineHeight: 1.1,
                margin: '8px 0 12px 0'
              }}
            >
              {formatSecondsToTimer(restTimer.secondsRemaining)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Button
                variant="outline"
                onClick={() => addRestTimerSeconds(30)}
                style={{ minHeight: '44px', fontSize: '12px' }}
              >
                +30 SEC
              </Button>
              <Button
                variant="inverted"
                onClick={skipRestTimer}
                style={{ minHeight: '44px', fontSize: '12px' }}
              >
                SKIP REST
              </Button>
            </div>
          </div>
        ) : isExerciseDone ? (
          /* EXERCISE FINISHED STATE */
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div className="font-mono" style={{ fontSize: '14px', fontWeight: 800, marginBottom: '4px' }}>
              ✓ {currentExercise.name} COMPLETE
            </div>
            <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              All {currentExercise.targetSets} sets logged.
            </div>

            {nextExercise ? (
              <Button
                variant="primary"
                onClick={handleAdvanceToNext}
                style={{ minHeight: '52px', fontSize: '14px', fontWeight: 800 }}
              >
                CONTINUE TO {nextExercise.name.toUpperCase()} →
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={onFinishWorkout}
                style={{ minHeight: '52px', fontSize: '14px', fontWeight: 800 }}
              >
                FINISH WORKOUT SESSION →
              </Button>
            )}
          </div>
        ) : (
          /* LOGGING INPUT CONTROLS FOR CURRENT SET */
          <div>
            <div className="font-mono flex-between" style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
              <span>SET {currentSetNumber} OF {currentExercise.targetSets}</span>
            </div>

            {/* WEIGHT_REPS */}
            {currentExercise.metricType === 'WEIGHT_REPS' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    WEIGHT (KG)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="sys-num-input"
                    placeholder="kg"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    REPS
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    className="sys-num-input"
                    placeholder="reps"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* BODYWEIGHT_REPS */}
            {currentExercise.metricType === 'BODYWEIGHT_REPS' && (
              <div style={{ marginBottom: '14px' }}>
                <label className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  REPETITIONS
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  className="sys-num-input"
                  placeholder="reps"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                />
              </div>
            )}

            {/* DURATION */}
            {currentExercise.metricType === 'DURATION' && (
              <div style={{ marginBottom: '14px' }}>
                <label className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  DURATION (SECONDS)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  className="sys-num-input"
                  placeholder="sec"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            )}

            {/* WEIGHT_DURATION */}
            {currentExercise.metricType === 'WEIGHT_DURATION' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    KG LOAD (PER HAND)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="sys-num-input"
                    placeholder="kg"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    HOLD SECONDS
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    className="sys-num-input"
                    placeholder="sec"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* ASSISTANCE_REPS */}
            {currentExercise.metricType === 'ASSISTANCE_REPS' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    ASSIST KG (0 = BODYWEIGHT)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="sys-num-input"
                    placeholder="kg"
                    value={assistance}
                    onChange={(e) => setAssistance(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    REPS
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    className="sys-num-input"
                    placeholder="reps"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* CHECK_ONLY */}
            {currentExercise.metricType === 'CHECK_ONLY' && (
              <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Completion set. Tap below once completed.
              </div>
            )}

            <Button
              variant="primary"
              onClick={handleCompleteSet}
              disabled={isSubmitting}
              style={{ minHeight: '52px', fontSize: '15px', fontWeight: 800 }}
            >
              {isSubmitting ? 'LOGGING SET...' : `COMPLETE SET ${currentSetNumber}`}
            </Button>
          </div>
        )}
      </div>

      {/* NEXT EXERCISE PREVIEW */}
      {nextExercise && (
        <div
          className="sys-card-subtle font-mono"
          style={{ cursor: 'pointer' }}
          onClick={() => onSelectExerciseIndex(activeExerciseIndex + 1)}
        >
          <div className="flex-between">
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
              NEXT
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              TAP TO SWITCH →
            </span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px' }}>
            {nextExercise.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {nextExercise.targetSets} × {nextExercise.targetRepOrDuration}
          </div>
        </div>
      )}

      {/* LATER EXERCISES SUMMARY */}
      {laterExercises.length > 0 && (
        <div style={{ padding: '8px 12px', marginBottom: '20px' }}>
          <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: '4px' }}>
            LATER
          </div>
          <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {laterExercises.map((e) => e.name).join(' · ')}
          </div>
        </div>
      )}

      {/* FINISH WORKOUT ACTION */}
      <div style={{ marginTop: '16px' }}>
        <Button
          variant="outline"
          onClick={onFinishWorkout}
          style={{ minHeight: '44px', fontSize: '13px' }}
        >
          FINISH WORKOUT SESSION
        </Button>
      </div>
    </div>
  );
};
