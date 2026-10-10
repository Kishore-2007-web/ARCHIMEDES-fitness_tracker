import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserProgression } from '../../context/UserProgressionContext';
import { WORKOUT_SCHEDULE } from '../../data/workoutSchedule';
import { ExerciseHistoricalRecord } from '../../types/progress';
import { getExerciseHistory } from '../../lib/firebase/db';
import { Button } from '../../components/common/Button';
import { ExceptionModal } from '../../components/overlays/ExceptionModal';
import { WeeklyScheduleModal } from '../../components/overlays/WeeklyScheduleModal';
import { padDayNumber } from '../../lib/formatting/formatters';
import { getDateStringForDayNumber, getChallengeDay, TOTAL_CHALLENGE_DAYS } from '../../lib/dates/challengeDates';
import { ExceptionReason } from '../../types/workout';
import { WarmUpSection } from './WarmUpSection';
import { RecoverySection } from './RecoverySection';
import { ActiveStepLogger } from './ActiveStepLogger';

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
    finalizeCurrentSession
  } = useUserProgression();

  const [historyRecords, setHistoryRecords] = useState<Record<string, ExerciseHistoricalRecord>>({});
  const [showExceptionModal, setShowExceptionModal] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showWorkoutImage, setShowWorkoutImage] = useState<boolean>(false);

  // Compute selected day metadata
  const selectedDateStr = getDateStringForDayNumber(selectedDayNumber);
  const dayInfo = getChallengeDay(selectedDateStr);
  const schedule = WORKOUT_SCHEDULE[dayInfo.weekday] || WORKOUT_SCHEDULE[1];

  // Training mode state
  const hasLoggedSets = Boolean(
    activeSession &&
    activeSession.status === 'in_progress' &&
    Object.keys(activeSession.exercises || {}).length > 0
  );

  const [isTrainingActive, setIsTrainingActive] = useState<boolean>(() => hasLoggedSets);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [showFinalizeSection, setShowFinalizeSection] = useState<boolean>(false);

  // Auto-resume to active mode if session already has logged sets
  useEffect(() => {
    if (hasLoggedSets) {
      setIsTrainingActive(true);
    }
  }, [hasLoggedSets]);

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

  const handleStartWorkout = async () => {
    if (!activeSession && dayInfo.isInsideChallenge) {
      await startWorkoutSession(selectedDateStr);
    }
    setIsTrainingActive(true);
    setShowFinalizeSection(false);
  };

  const handleFinalize = async () => {
    if (!isOnline) {
      setErrorMessage('CONNECTION REQUIRED: ARCHIMEDES requires an active connection to safely save progression.');
      return;
    }
    setErrorMessage(null);
    setIsFinalizing(true);
    try {
      await finalizeCurrentSession();
      setIsTrainingActive(false);
      setShowFinalizeSection(false);
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
      setIsTrainingActive(false);
      setShowFinalizeSection(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to commit exception.');
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="anim-fade-in">
      {errorMessage && (
        <div className="sys-alert-inverted font-mono" style={{ fontSize: '12px', padding: '10px', marginBottom: '14px' }}>
          {errorMessage}
        </div>
      )}

      {/* ACTIVE WORKOUT MODE (STEP-BY-STEP) */}
      {isTrainingActive && !showFinalizeSection ? (
        <div>
          {/* Active Workout Header */}
          <div className="flex-between font-mono" style={{ marginBottom: '14px' }}>
            <button
              type="button"
              onClick={() => setIsTrainingActive(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontFamily: 'inherit',
                fontSize: '11px',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                padding: '4px 0'
              }}
            >
              ← OVERVIEW
            </button>

            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 800 }}>
                DAY {padDayNumber(selectedDayNumber)} / {TOTAL_CHALLENGE_DAYS}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                · {dayInfo.weekdayName}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowFinalizeSection(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontFamily: 'inherit',
                fontSize: '11px',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                padding: '4px 0'
              }}
            >
              FINISH →
            </button>
          </div>

          <ActiveStepLogger
            exercises={schedule.exercises}
            activeExerciseIndex={activeExerciseIndex}
            onSelectExerciseIndex={setActiveExerciseIndex}
            historyRecords={historyRecords}
            onLogSet={(exId, set) => logExerciseSet(exId, set)}
            onFinishWorkout={() => setShowFinalizeSection(true)}
          />
        </div>
      ) : (
        /* WORKOUT OVERVIEW & PREPARATION MODE */
        <div>
          {/* TOP HEADER */}
          <div style={{ marginBottom: '20px' }}>
            <div className="flex-between font-mono" style={{ marginBottom: '4px' }}>
              <div style={{ fontSize: '12px', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
                {dayInfo.weekdayName}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 800 }}>
                DAY {padDayNumber(selectedDayNumber)} / {TOTAL_CHALLENGE_DAYS}
              </div>
            </div>

            <h1
              className="font-mono"
              style={{
                fontSize: '22px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                margin: '6px 0 4px 0',
                textTransform: 'uppercase'
              }}
            >
              {schedule.title}
            </h1>

            <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {schedule.baseXP} XP · ~90–120 min
            </div>
          </div>

          {/* PRIMARY WORKOUT ACTION BUTTON */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            <Button
              id="btn-start-workout-quest"
              variant="primary"
              onClick={handleStartWorkout}
              style={{ minHeight: '52px', fontSize: '15px', fontWeight: 800 }}
            >
              {hasLoggedSets ? 'RESUME WORKOUT' : 'START WORKOUT'}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowScheduleModal(true)}
              style={{ minHeight: '40px', fontSize: '12px' }}
            >
              VIEW WEEKLY PLAN
            </Button>
          </div>

          {/* TODAY'S MISSION */}
          <div className="sys-section">
            <div className="sys-section-title">
              <span>TODAY'S MISSION</span>
              <span className="sys-tag">+25 XP</span>
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
              {dayInfo.dailyMission}
            </p>
          </div>

          {/* WARM-UP ACCORDION (PROGRESSIVE DISCLOSURE) */}
          <WarmUpSection
            durationMinutes={schedule.preparationMinutes}
            sections={schedule.preparationSections}
            items={schedule.preparationChecklist}
            isCompleted={activeSession?.blocks.preparationComplete ?? false}
            onToggleComplete={(val) => updateBlockState('preparationComplete', val)}
          />

          {/* MAIN WORKOUT EXERCISE LIST OVERVIEW */}
          <div className="sys-section">
            <div className="sys-section-title">
              <span>MAIN WORKOUT</span>
              <span className="sys-tag">{schedule.exercises.length} MOVEMENTS</span>
            </div>

            {/* VIEW IMAGE BUTTON UNDER MAIN WORKOUT / EXERCISE PROTOCOL */}
            <div style={{ padding: '0 12px 10px 12px' }}>
              <button
                type="button"
                className="sys-btn sys-btn-subtle font-mono"
                style={{
                  width: 'auto',
                  minHeight: '30px',
                  padding: '4px 12px',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
                onClick={() => setShowWorkoutImage(!showWorkoutImage)}
              >
                <span>📷</span> {showWorkoutImage ? 'HIDE IMAGE' : 'VIEW IMAGE'}
              </button>
            </div>

            {showWorkoutImage && (
              <div
                className="anim-fade-in"
                style={{
                  margin: '0 12px 12px 12px',
                  border: '1px solid var(--border-medium)',
                  background: '#050505',
                  padding: '10px'
                }}
              >
                <div className="font-mono" style={{ textAlign: 'center', padding: '10px 8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {schedule.title} — EXERCISE PROTOCOL
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    No diagram attached yet for this movement protocol. Follow movement list and execution notes below.
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {schedule.exercises.map((ex, idx) => {
                const logged = activeSession?.exercises[ex.id]?.sets || [];
                const isComplete = logged.length >= ex.targetSets;

                return (
                  <div
                    key={ex.id}
                    className="font-mono flex-between"
                    style={{
                      padding: '8px 10px',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '13px'
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>
                        {idx + 1}.
                      </span>
                      <span style={{ fontWeight: 700 }}>{ex.name}</span>
                    </div>

                    <div className="flex-center gap-2">
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {ex.targetSets} × {ex.targetRepOrDuration}
                      </span>
                      {isComplete && <span style={{ color: '#ffffff', fontWeight: 800 }}>✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RECOVERY ACCORDION (PROGRESSIVE DISCLOSURE) */}
          <RecoverySection
            durationMinutes={schedule.recoveryMinutes}
            sections={schedule.recoverySections}
            items={schedule.recoveryChecklist}
            walkingMinutes={schedule.walkingMinutes}
            walkingRange={schedule.walkingRange}
            isRecoveryComplete={activeSession?.blocks.recoveryComplete ?? false}
            isWalkingComplete={activeSession?.blocks.walkingComplete ?? false}
            onToggleRecovery={(val) => updateBlockState('recoveryComplete', val)}
            onToggleWalking={(val) => updateBlockState('walkingComplete', val)}
          />

          {/* SESSION FINALIZATION / RECOVERY ACTIONS */}
          {(hasLoggedSets || showFinalizeSection) && (
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button
                id="btn-finalize-workout"
                variant="primary"
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
          )}
        </div>
      )}

      {/* FINALIZE CONFIRMATION DRAWER/VIEW IF IN TRAINING */}
      {isTrainingActive && showFinalizeSection && (
        <div className="sys-section anim-scale-in" style={{ border: '1px solid #ffffff', marginTop: '16px' }}>
          <div className="sys-section-title">
            <span>FINALIZE WORKOUT</span>
            <span className="sys-tag">SESSION SUMMARY</span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Review your session before committing progression and PR calculations.
          </p>

          {/* Daily Mission completion toggle */}
          <div style={{ marginBottom: '14px' }}>
            <Button
              variant={activeSession?.dailyMissionStatus === 'completed' ? 'inverted' : 'outline'}
              onClick={() =>
                setDailyMissionStatus(
                  activeSession?.dailyMissionStatus === 'completed' ? 'pending' : 'completed'
                )
              }
              style={{ minHeight: '44px', fontSize: '12px' }}
            >
              {activeSession?.dailyMissionStatus === 'completed'
                ? '✓ TODAY\'S MISSION MET (+25 XP)'
                : 'MARK TODAY\'S MISSION COMPLETE (+25 XP)'}
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Button
              id="btn-finalize-active-session"
              variant="primary"
              onClick={handleFinalize}
              disabled={isFinalizing}
              style={{ minHeight: '52px', fontSize: '15px', fontWeight: 800 }}
            >
              {isFinalizing ? 'CALCULATING PROGRESSION...' : 'CONFIRM & FINALIZE SESSION'}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowFinalizeSection(false)}
              disabled={isFinalizing}
            >
              ← RETURN TO TRAINING
            </Button>

            <Button
              variant="subtle"
              onClick={() => setShowExceptionModal(true)}
              disabled={isFinalizing}
            >
              REPORT EXCEPTION / REDUCED SESSION
            </Button>
          </div>
        </div>
      )}

      {/* MODALS */}
      <ExceptionModal
        isOpen={showExceptionModal}
        onClose={() => setShowExceptionModal(false)}
        onConfirmException={handleExceptionConfirm}
      />

      <WeeklyScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        initialWeekday={dayInfo.weekday}
        onSelectWeekday={(wday) => {
          const currentWeekNumber = Math.ceil(selectedDayNumber / 7);
          const weekStartMonday = 1 + (currentWeekNumber - 1) * 7;
          const offset = wday === 0 ? 6 : wday - 1;
          const targetDay = Math.max(1, Math.min(TOTAL_CHALLENGE_DAYS, weekStartMonday + offset));
          setSelectedDayNumber(targetDay);
          setShowScheduleModal(false);
          setIsTrainingActive(false);
        }}
      />
    </div>
  );
};
