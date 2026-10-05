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
import { WeeklyScheduleModal } from '../../components/overlays/WeeklyScheduleModal';
import { padDayNumber } from '../../lib/formatting/formatters';
import { getDateStringForDayNumber, getChallengeDay } from '../../lib/dates/challengeDates';
import { ExceptionReason, ExerciseDefinition } from '../../types/workout';

const CATEGORY_HEADERS: Record<string, { title: string; subtitle?: string }> = {
  primary: {
    title: 'PRIMARY STRENGTH LIFTS',
    subtitle: 'Primary strength progression lifts. Maximum mechanical intent and controlled execution.'
  },
  secondary: {
    title: 'SECONDARY LIFTS',
    subtitle: 'Regulated volume & technique work.'
  },
  support: {
    title: 'SUPPORT MOVEMENTS',
    subtitle: 'Accessory volume, structural balance and stability.'
  },
  calisthenics: {
    title: 'CALISTHENICS & BODYWEIGHT',
    subtitle: 'Relative strength mastery and progressive bodyweight force.'
  },
  athletic: {
    title: 'ATHLETIC & AGILITY',
    subtitle: 'Coordination, reactive elasticity, balance and quick footwork.'
  },
  conditioning: {
    title: 'AEROBIC CONDITIONING',
    subtitle: 'Sustained aerobic output (Rower / Bike / Elliptical / Outdoor Brisk Walk).'
  },
  grip: {
    title: 'GRIP FORTITUDE',
    subtitle: 'Forearm flexors and grip endurance capacity.'
  },
  neck: {
    title: 'CERVICAL / NECK INTEGRITY',
    subtitle: 'Controlled multi-planar neck stability.'
  },
  forearms: {
    title: 'FOREARM & WRIST HYPERTROPHY',
    subtitle: 'Isolated flexor, extensor and rotational forearm fortitude.'
  },
  recovery: {
    title: 'ACTIVE RECOVERY PROTOCOLS',
    subtitle: 'Low-intensity mobility and systemic restoration.'
  }
};

const WEEKDAY_BUTTONS: { weekday: number; label: string }[] = [
  { weekday: 1, label: 'MON' },
  { weekday: 2, label: 'TUE' },
  { weekday: 3, label: 'WED' },
  { weekday: 4, label: 'THU' },
  { weekday: 5, label: 'FRI' },
  { weekday: 6, label: 'SAT' },
  { weekday: 0, label: 'SUN' }
];

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
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute selected day metadata
  const selectedDateStr = getDateStringForDayNumber(selectedDayNumber);
  const dayInfo = getChallengeDay(selectedDateStr);
  const schedule = WORKOUT_SCHEDULE[dayInfo.weekday] || WORKOUT_SCHEDULE[1];

  // Current week index (1-based)
  // Day 1 is Sunday (week 1, day 1)
  const currentWeekNumber = Math.ceil(selectedDayNumber / 7);

  // Quick switch to a specific weekday within the currently selected week
  const handleSelectWeekday = (targetWeekday: number) => {
    // Challenge starts Sunday (day 1, weekday 0)
    // Week W starts at day 1 + (W - 1) * 7 (which is a Sunday)
    // Sunday (0) -> offset 0
    // Monday (1) -> offset 1
    // ...
    // Saturday (6) -> offset 6
    const weekStartSundayDayNumber = 1 + (currentWeekNumber - 1) * 7;
    const offset = targetWeekday === 0 ? 0 : targetWeekday;
    const targetDayNumber = weekStartSundayDayNumber + offset;
    const clampedDay = Math.max(1, Math.min(120, targetDayNumber));
    setSelectedDayNumber(clampedDay);
  };

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

  // Group exercises by category while preserving their sequence order and numbering
  const categoryGroups: { category: string; exercises: ExerciseDefinition[]; startIndex: number }[] = [];
  let runningNumber = 1;
  for (const ex of schedule.exercises) {
    let grp = categoryGroups.find((g) => g.category === ex.category);
    if (!grp) {
      grp = { category: ex.category, exercises: [], startIndex: runningNumber };
      categoryGroups.push(grp);
    }
    grp.exercises.push(ex);
    runningNumber++;
  }

  return (
    <div>
      {/* Weekday Quick-Select Navigation Bar */}
      <div className="sys-section" style={{ padding: '12px 14px', marginBottom: '14px' }}>
        <div className="flex-between font-mono" style={{ marginBottom: '8px' }}>
          <button
            type="button"
            className="sys-btn sys-btn-subtle"
            style={{ width: 'auto', minHeight: '32px', padding: '2px 10px', fontSize: '11px' }}
            onClick={() => setSelectedDayNumber(Math.max(1, selectedDayNumber - 1))}
            disabled={selectedDayNumber <= 1}
          >
            ← PREV DAY
          </button>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800 }}>DAY {padDayNumber(selectedDayNumber)} / 120</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
              WEEK {currentWeekNumber}
            </span>
          </div>

          <button
            type="button"
            className="sys-btn sys-btn-subtle"
            style={{ width: 'auto', minHeight: '32px', padding: '2px 10px', fontSize: '11px' }}
            onClick={() => setSelectedDayNumber(Math.min(120, selectedDayNumber + 1))}
            disabled={selectedDayNumber >= 120}
          >
            NEXT DAY →
          </button>
        </div>

        {/* 7-Day Weekday Quick Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '3px',
            marginTop: '8px',
            marginBottom: '10px'
          }}
        >
          {WEEKDAY_BUTTONS.map((item) => {
            const isSelected = dayInfo.weekday === item.weekday;
            return (
              <button
                key={item.weekday}
                type="button"
                onClick={() => handleSelectWeekday(item.weekday)}
                style={{
                  background: isSelected ? '#ffffff' : 'var(--bg-elevated)',
                  color: isSelected ? '#000000' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid #ffffff' : '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '8px 2px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Blueprint Modal Trigger */}
        <button
          type="button"
          className="sys-btn sys-btn-outline font-mono flex-center"
          style={{
            width: '100%',
            minHeight: '36px',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            gap: '6px'
          }}
          onClick={() => setShowScheduleModal(true)}
        >
          <span>📋</span>
          <span>VIEW FULL 7-DAY WORKOUT BLUEPRINT</span>
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

      {/* Archimedes Directive / Day Note */}
      {schedule.dayNote && (
        <div
          className="font-mono anim-fade-in"
          style={{
            padding: '12px 14px',
            marginBottom: '16px',
            border: '1px solid #ffffff',
            borderLeft: '4px solid #ffffff',
            background: 'var(--bg-elevated)',
            fontSize: '12px',
            lineHeight: 1.5,
            color: 'var(--text-primary)'
          }}
        >
          <div style={{ fontWeight: 800, letterSpacing: '0.08em', marginBottom: '4px', color: '#ffffff' }}>
            ⚡ ARCHIMEDES SYSTEM DIRECTIVE
          </div>
          <div>{schedule.dayNote}</div>
        </div>
      )}

      {errorMessage && (
        <div className="sys-alert-inverted font-mono" style={{ fontSize: '12px', padding: '10px', marginBottom: '14px' }}>
          {errorMessage}
        </div>
      )}

      {/* PREPARATION BLOCK (with sub-sections if present) */}
      {schedule.preparationChecklist.length > 0 && (
        <BlockChecklist
          title="PREPARATION PROTOCOL"
          durationLabel={`${schedule.preparationMinutes} MIN`}
          items={schedule.preparationChecklist}
          sections={schedule.preparationSections}
          isCompleted={activeSession?.blocks.preparationComplete ?? false}
          onToggleComplete={(val) => updateBlockState('preparationComplete', val)}
        />
      )}

      {/* REST TIMER INTEGRATION */}
      <RestTimer />

      {/* EXERCISES GROUPED BY CATEGORY */}
      <div style={{ marginTop: '20px' }}>
        {categoryGroups.map((group) => {
          const headerInfo = CATEGORY_HEADERS[group.category] || {
            title: group.category.toUpperCase()
          };

          return (
            <div key={group.category} style={{ marginBottom: '24px' }}>
              <div
                className="sys-section-title"
                style={{
                  marginBottom: '6px',
                  borderLeft: '3px solid #ffffff',
                  paddingLeft: '8px'
                }}
              >
                <span>{headerInfo.title}</span>
                <span className="sys-tag">{group.exercises.length} MOVEMENTS</span>
              </div>

              {headerInfo.subtitle && (
                <div
                  className="font-mono"
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    marginBottom: '12px',
                    paddingLeft: '11px'
                  }}
                >
                  {headerInfo.subtitle}
                </div>
              )}

              {group.exercises.map((exercise) => {
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
          );
        })}
      </div>

      {/* RECOVERY PROTOCOL (with sub-sections if present) */}
      {schedule.recoveryChecklist.length > 0 && (
        <BlockChecklist
          title="RECOVERY PROTOCOL"
          durationLabel={`${schedule.recoveryMinutes} MIN`}
          items={schedule.recoveryChecklist}
          sections={schedule.recoverySections}
          isCompleted={activeSession?.blocks.recoveryComplete ?? false}
          onToggleComplete={(val) => updateBlockState('recoveryComplete', val)}
        />
      )}

      {/* CONTINUOUS WALKING BLOCK */}
      {schedule.walkingMinutes > 0 && (
        <div className="sys-section">
          <div className="sys-section-title">
            <span>CONTINUOUS WALKING PROTOCOL</span>
            <span className="sys-tag">{schedule.walkingRange || `${schedule.walkingMinutes} MIN`}</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Brisk, unbroken continuous walking to accelerate recovery, clear metabolic accumulation and maintain aerobic baseline.
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

      {/* Modals */}
      <ExceptionModal
        isOpen={showExceptionModal}
        onClose={() => setShowExceptionModal(false)}
        onConfirmException={handleExceptionConfirm}
      />

      <WeeklyScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        initialWeekday={dayInfo.weekday}
        onSelectWeekday={(wday) => handleSelectWeekday(wday)}
      />
    </div>
  );
};
