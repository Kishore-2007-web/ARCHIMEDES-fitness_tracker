import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserProgression } from '../../context/UserProgressionContext';
import { WORKOUT_SCHEDULE } from '../../data/workoutSchedule';
import { ExerciseHistoricalRecord } from '../../types/progress';
import { getExerciseHistory } from '../../lib/firebase/db';
import { ExerciseLogger } from './ExerciseLogger';
import { BlockChecklist } from './BlockChecklist';
import { RestTimer } from '../../components/common/RestTimer';
import { Button } from '../../components/common/Button';
import { ExceptionModal } from '../../components/overlays/ExceptionModal';
import { padDayNumber } from '../../lib/formatting/formatters';
import { getDateStringForDayNumber, getChallengeDay } from '../../lib/dates/challengeDates';
import { ExceptionReason } from '../../types/workout';

export const QuestScreen: React.FC = () => {
  const { currentUser, isOnline } = useAuth();
  const {
    selectedDayNumber,
    setSelectedDayNumber,
    activeSession,
    startWorkoutSession,
    logExerciseSet,
    updateBlockState,
    setDailyMissionStatus,
    finalizeCurrentSession,
    startRestTimer
  } = useUserProgression();

  const [historyRecords, setHistoryRecords] = useState<Record<string, ExerciseHistoricalRecord>>({});
  const [showExceptionModal, setShowExceptionModal] = useState<boolean>(false);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute selected day metadata
  const selectedDateStr = getDateStringForDayNumber(selectedDayNumber);
  const dayInfo = getChallengeDay(selectedDateStr);
  const schedule = WORKOUT_SCHEDULE[dayInfo.weekday];

  // Fetch recent exercise history for display
  useEffect(() => {
    if (!currentUser) return;
    getExerciseHistory(currentUser.uid, undefined, 40)
      .then((records) => {
        const map: Record<string, ExerciseHistoricalRecord> = {};
        for (const rec of records) {
          if (!map[rec.exerciseId]) {
            map[rec.exerciseId] = rec;
          }
        }
        setHistoryRecords(map);
      })
      .catch((err) => console.warn('Could not fetch exercise history:', err));
  }, [currentUser]);

  // Ensure active session is started when on quest screen
  useEffect(() => {
    if (!activeSession && dayInfo.isInsideChallenge) {
      startWorkoutSession(selectedDateStr);
    }
  }, [activeSession, selectedDayNumber, selectedDateStr, dayInfo.isInsideChallenge]);

  const handleFinalize = async () => {
    if (!isOnline) {
      setErrorMessage('CONNECTION REQUIRED: ARCHIMEDES requires an active connection to safely save progression.');
      return;
    }
    setErrorMessage(null);
    setIsFinalizing(true);
    try {
      await finalizeCurrentSession();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to finalize session.');
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleExceptionConfirm = async (reason: ExceptionReason, isReduced?: boolean) => {
    if (!isOnline) {
      setErrorMessage('CONNECTION REQUIRED: Active connection required.');
      return;
    }
    setErrorMessage(null);
    setIsFinalizing(true);
    try {
      await finalizeCurrentSession({ exceptionReason: reason, isReduced });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to commit exception.');
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div>
      {/* Day Selector Navigation */}
      <div className="sys-section flex-between font-mono" style={{ padding: '10px 14px', marginBottom: '14px' }}>
        <button
          type="button"
          className="sys-btn sys-btn-subtle"
          style={{ width: 'auto', minHeight: '36px', padding: '4px 10px' }}
          onClick={() => setSelectedDayNumber(Math.max(1, selectedDayNumber - 1))}
          disabled={selectedDayNumber <= 1}
        >
          ← PREV DAY
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: 800 }}>DAY {padDayNumber(selectedDayNumber)} / 120</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{dayInfo.formattedDate}</div>
        </div>

        <button
          type="button"
          className="sys-btn sys-btn-subtle"
          style={{ width: 'auto', minHeight: '36px', padding: '4px 10px' }}
          onClick={() => setSelectedDayNumber(Math.min(120, selectedDayNumber + 1))}
          disabled={selectedDayNumber >= 120}
        >
          NEXT DAY →
        </button>
      </div>

      {/* Main Quest Header */}
      <div className="sys-header">
        <div className="flex-between">
          <span className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
            QUEST ENGINE // {dayInfo.weekdayName}
          </span>
          <span className="sys-tag">BASE {schedule.baseXP} XP</span>
        </div>
        <h1 className="font-mono" style={{ fontSize: '20px', fontWeight: 800, margin: '6px 0 2px 0' }}>
          {schedule.title}
        </h1>
        <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {schedule.subtitle}
        </div>
      </div>

      {errorMessage && (
        <div className="sys-alert-inverted font-mono" style={{ fontSize: '12px', padding: '10px', marginBottom: '14px' }}>
          {errorMessage}
        </div>
      )}

      {/* PREPARATION BLOCK */}
      {schedule.preparationChecklist.length > 0 && (
        <BlockChecklist
          title="PREPARATION PROTOCOL"
          durationLabel={`${schedule.preparationMinutes} MIN`}
          items={schedule.preparationChecklist}
          isCompleted={activeSession?.blocks.preparationComplete ?? false}
          onToggleComplete={(val) => updateBlockState('preparationComplete', val)}
        />
      )}

      {/* REST TIMER INTEGRATION */}
      <RestTimer />

      {/* MAIN EXERCISES */}
      <div style={{ marginTop: '20px' }}>
        <div className="sys-section-title" style={{ marginBottom: '14px' }}>
          <span>PRIMARY & SUPPORT MOVEMENTS</span>
          <span className="sys-tag">{schedule.exercises.length} EXERCISES</span>
        </div>

        {schedule.exercises.map((exercise) => {
          const loggedSets = activeSession?.exercises[exercise.id]?.sets || [];
          const historical = historyRecords[exercise.id];

          return (
            <ExerciseLogger
              key={exercise.id}
              exercise={exercise}
              loggedSets={loggedSets}
              historicalRecord={historical}
              onLogSet={(set) => logExerciseSet(exercise.id, set)}
              onTriggerRestTimer={() => startRestTimer(180)}
            />
          );
        })}
      </div>

      {/* RECOVERY PROTOCOL */}
      {schedule.recoveryChecklist.length > 0 && (
        <BlockChecklist
          title="RECOVERY PROTOCOL"
          durationLabel={`${schedule.recoveryMinutes} MIN`}
          items={schedule.recoveryChecklist}
          isCompleted={activeSession?.blocks.recoveryComplete ?? false}
          onToggleComplete={(val) => updateBlockState('recoveryComplete', val)}
        />
      )}

      {/* WALKING BLOCK */}
      {schedule.walkingMinutes > 0 && (
        <div className="sys-section">
          <div className="sys-section-title">
            <span>CONTINUOUS WALKING PROTOCOL</span>
            <span className="sys-tag">{schedule.walkingMinutes} MIN</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Brisk, unbroken walking to accelerate recovery, clear metabolic accumulation and maintain aerobic baseline.
          </p>
          <Button
            variant={activeSession?.blocks.walkingComplete ? 'inverted' : 'outline'}
            onClick={() => updateBlockState('walkingComplete', !activeSession?.blocks.walkingComplete)}
          >
            {activeSession?.blocks.walkingComplete ? '✓ WALKING PROTOCOL LOGGED' : 'MARK WALKING PROTOCOL COMPLETE'}
          </Button>
        </div>
      )}

      {/* DAILY MISSION STATUS */}
      <div className="sys-section font-mono">
        <div className="sys-section-title">
          <span>DAILY MISSION OBJECTIVE</span>
          <span className="sys-tag">+25 XP</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-primary)', marginBottom: '12px' }}>
          {dayInfo.dailyMission}
        </p>
        <Button
          variant={activeSession?.dailyMissionStatus === 'completed' ? 'inverted' : 'subtle'}
          onClick={() =>
            setDailyMissionStatus(
              activeSession?.dailyMissionStatus === 'completed' ? 'pending' : 'completed'
            )
          }
        >
          {activeSession?.dailyMissionStatus === 'completed'
            ? '✓ DAILY MISSION COMPLETE'
            : 'MARK DAILY MISSION OBJECTIVE MET'}
        </Button>
      </div>

      {/* FINALIZATION ACTIONS */}
      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Button
          id="btn-finalize-workout"
          variant="inverted"
          onClick={handleFinalize}
          disabled={isFinalizing}
          style={{ minHeight: '52px', fontSize: '15px', fontWeight: 800 }}
        >
          {isFinalizing ? 'CALCULATING PROGRESSION...' : 'FINALIZE WORKOUT SESSION'}
        </Button>

        <Button
          variant="subtle"
          onClick={() => setShowExceptionModal(true)}
          disabled={isFinalizing}
        >
          REPORT EXCEPTION / REDUCED SESSION
        </Button>
      </div>

      <ExceptionModal
        isOpen={showExceptionModal}
        onClose={() => setShowExceptionModal(false)}
        onConfirmException={handleExceptionConfirm}
      />
    </div>
  );
};
