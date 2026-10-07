import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserProgression } from '../../context/UserProgressionContext';
import { SystemHeader } from '../../components/layout/SystemHeader';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { RankBadge } from '../../components/common/RankBadge';
import { InstallPrompt } from '../../components/common/InstallPrompt';
import { WeeklyScheduleModal } from '../../components/overlays/WeeklyScheduleModal';
import { calculateLevelFromXP } from '../../lib/progression/levelCalculations';
import { formatXPNumber, padDayNumber } from '../../lib/formatting/formatters';
import { WORKOUT_SCHEDULE } from '../../data/workoutSchedule';
import { SYSTEM_BOSSES } from '../../data/bosses';
import { TOTAL_CHALLENGE_DAYS } from '../../lib/dates/challengeDates';

interface SystemScreenProps {
  onNavigateToQuest: () => void;
}

export const SystemScreen: React.FC<SystemScreenProps> = ({ onNavigateToQuest }) => {
  const { userProfile } = useAuth();
  const { challengeDay, activeSession, setSelectedDayNumber } = useUserProgression();
  const [showBlueprintModal, setShowBlueprintModal] = useState<boolean>(false);

  if (!userProfile) return null;

  const levelInfo = calculateLevelFromXP(userProfile.xp);
  const schedule = WORKOUT_SCHEDULE[challengeDay.weekday] || WORKOUT_SCHEDULE[1];

  // Active workout detection
  const isSessionActive = Boolean(
    activeSession &&
    activeSession.status === 'in_progress' &&
    Object.keys(activeSession.exercises || {}).length > 0
  );

  let activeExerciseName = schedule.exercises[0]?.name || 'Workout';
  let activeSetNumber = 1;
  let activeTargetSets = schedule.exercises[0]?.targetSets || 3;

  if (isSessionActive && activeSession?.exercises) {
    for (const ex of schedule.exercises) {
      const logged = activeSession.exercises[ex.id]?.sets || [];
      if (logged.length < ex.targetSets) {
        activeExerciseName = ex.name;
        activeSetNumber = logged.length + 1;
        activeTargetSets = ex.targetSets;
        break;
      }
    }
  }

  // Find next milestone boss (e.g. Iron Gate Day 30)
  const upcomingBoss =
    SYSTEM_BOSSES.find((b) => b.type === 'milestone' && b.dayNumber >= challengeDay.dayNumber && b.status !== 'completed') ||
    SYSTEM_BOSSES.find((b) => b.dayNumber >= challengeDay.dayNumber && b.status !== 'completed') ||
    SYSTEM_BOSSES[1];

  return (
    <div className="anim-fade-in">
      <SystemHeader
        dayNumber={challengeDay.dayNumber}
        formattedDate={challengeDay.formattedDate}
        weekdayName={challengeDay.weekdayName}
      />

      <InstallPrompt />

      {/* TODAY'S WORKOUT SECTION */}
      <section className="sys-section anim-scale-in" style={{ border: '1px solid #ffffff' }}>
        <div className="sys-section-title">
          <span>TODAY'S WORKOUT</span>
          <span className="sys-tag">~90–120 MIN</span>
        </div>

        <div style={{ margin: '6px 0 16px 0' }}>
          <h2
            className="font-mono"
            style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}
          >
            {challengeDay.workoutTitle}
          </h2>
          <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {challengeDay.baseXP} XP · ~90–120 min
          </div>
        </div>

        {isSessionActive && (
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              marginBottom: '14px'
            }}
          >
            <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
              WORKOUT IN PROGRESS
            </div>
            <div className="font-mono" style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>
              {activeExerciseName}
            </div>
            <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Set {activeSetNumber} / {activeTargetSets}
            </div>
          </div>
        )}

        <Button
          id="btn-begin-quest"
          variant="primary"
          onClick={onNavigateToQuest}
          style={{ minHeight: '52px', fontSize: '15px', fontWeight: 800 }}
        >
          {isSessionActive ? 'RESUME WORKOUT' : 'START WORKOUT'}
        </Button>
      </section>

      {/* TODAY'S MISSION */}
      <section className="sys-section">
        <div className="sys-section-title">
          <span>TODAY'S MISSION</span>
          <span className="sys-tag">+25 XP</span>
        </div>

        <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
          {challengeDay.dailyMission}
        </p>
      </section>

      {/* PROGRESS */}
      <section className="sys-section">
        <div className="sys-section-title">
          <span>PROGRESS</span>
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            TITLE: {userProfile.currentTitle}
          </span>
        </div>

        <div className="flex-between" style={{ marginBottom: '10px' }}>
          <div>
            <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>LEVEL</div>
            <div className="font-mono" style={{ fontSize: '22px', fontWeight: 800 }}>
              {padDayNumber(levelInfo.level)}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>RANK</div>
            <RankBadge rank={userProfile.rank} size="sm" />
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SYSTEM POWER</div>
            <div className="font-mono" style={{ fontSize: '22px', fontWeight: 800 }}>
              {userProfile.systemPower}
            </div>
          </div>
        </div>

        <ProgressBar
          progressPercent={levelInfo.progressPercent}
          label="XP PROGRESS"
          valueDisplay={`${formatXPNumber(levelInfo.xpIntoCurrentLevel)} / ${formatXPNumber(levelInfo.xpRequiredForNextLevel)} XP`}
        />
      </section>

      {/* UPCOMING BOSS */}
      {upcomingBoss && (
        <section className="sys-section">
          <div className="sys-section-title">
            <span>UPCOMING BOSS</span>
            <span className="sys-tag">DAY {padDayNumber(upcomingBoss.dayNumber)}</span>
          </div>

          <div className="flex-between">
            <div>
              <div className="font-mono" style={{ fontSize: '14px', fontWeight: 800 }}>
                {upcomingBoss.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {upcomingBoss.targetMetric?.description || upcomingBoss.subtitle}
              </div>
            </div>
            <span className="sys-tag" style={{ fontSize: '10px', whiteSpace: 'nowrap', marginLeft: '12px' }}>
              +{upcomingBoss.reward.xp} XP
            </span>
          </div>
        </section>
      )}

      {/* SUBTLE LINK TO WEEKLY BLUEPRINT */}
      <div style={{ textAlign: 'center', margin: '20px 0 8px 0' }}>
        <button
          type="button"
          onClick={() => setShowBlueprintModal(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.08em',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: '8px 12px'
          }}
        >
          View Weekly Blueprint →
        </button>
      </div>

      <WeeklyScheduleModal
        isOpen={showBlueprintModal}
        onClose={() => setShowBlueprintModal(false)}
        initialWeekday={challengeDay.weekday}
        onSelectWeekday={(wday) => {
          const weekStartMonday = 1 + (Math.ceil(challengeDay.dayNumber / 7) - 1) * 7;
          const offset = wday === 0 ? 6 : wday - 1;
          const targetDay = Math.max(1, Math.min(TOTAL_CHALLENGE_DAYS, weekStartMonday + offset));
          setSelectedDayNumber(targetDay);
          onNavigateToQuest();
        }}
      />
    </div>
  );
};
