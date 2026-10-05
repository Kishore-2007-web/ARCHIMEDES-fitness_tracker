import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserProgression } from '../../context/UserProgressionContext';
import { SystemHeader } from '../../components/layout/SystemHeader';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { RankBadge } from '../../components/common/RankBadge';
import { InstallPrompt } from '../../components/common/InstallPrompt';
import { SystemEventsFeed } from './SystemEventsFeed';
import { calculateLevelFromXP } from '../../lib/progression/levelCalculations';
import { formatXPNumber, padDayNumber } from '../../lib/formatting/formatters';

interface SystemScreenProps {
  onNavigateToQuest: () => void;
}

export const SystemScreen: React.FC<SystemScreenProps> = ({ onNavigateToQuest }) => {
  const { userProfile } = useAuth();
  const { challengeDay, activeSession } = useUserProgression();

  if (!userProfile) return null;

  const levelInfo = calculateLevelFromXP(userProfile.xp);

  return (
    <div>
      <SystemHeader
        dayNumber={challengeDay.dayNumber}
        formattedDate={challengeDay.formattedDate}
        systemStatus={challengeDay.isInsideChallenge ? 'OPERATING' : 'STANDBY'}
      />

      <InstallPrompt />

      {/* TODAY'S TRAINING */}
      <section className="sys-section anim-scale-in">
        <div className="sys-section-title">
          <span>TODAY'S MISSION SCHEDULE</span>
          <span className="sys-tag">{challengeDay.weekdayName}</span>
        </div>

        <div style={{ margin: '8px 0 16px 0' }}>
          <h2
            className="font-mono"
            style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            {challengeDay.workoutTitle}
          </h2>
          <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            BASE YIELD: {challengeDay.baseXP} XP // APPROX 90–120 MIN PROTOCOL
          </div>
        </div>

        <Button
          id="btn-begin-quest"
          variant="inverted"
          onClick={onNavigateToQuest}
          style={{ minHeight: '48px', fontSize: '14px' }}
        >
          {activeSession ? 'RESUME ACTIVE SESSION' : 'BEGIN QUEST'}
        </Button>
      </section>

      {/* DAILY MISSION */}
      <section className="sys-section">
        <div className="sys-section-title">
          <span>DAILY SYSTEM OBJECTIVE</span>
          <span className="sys-tag">+25 XP</span>
        </div>

        <p className="font-mono" style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
          {challengeDay.dailyMission}
        </p>

        <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
          OBJECTIVE AWARDS UPON SESSION FINALIZATION
        </div>
      </section>

      {/* SYSTEM PROGRESSION METRICS */}
      <section className="sys-section">
        <div className="sys-section-title">
          <span>SYSTEM PROGRESSION</span>
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            TITLE: {userProfile.currentTitle}
          </span>
        </div>

        <div className="flex-between" style={{ marginBottom: '8px' }}>
          <div>
            <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>LEVEL</div>
            <div className="font-mono" style={{ fontSize: '24px', fontWeight: 800 }}>
              {padDayNumber(levelInfo.level)}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>RANK</div>
            <div style={{ marginTop: '2px' }}>
              <RankBadge rank={userProfile.rank} size="md" />
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SYSTEM POWER</div>
            <div className="font-mono" style={{ fontSize: '24px', fontWeight: 800 }}>
              {userProfile.systemPower}
            </div>
          </div>
        </div>

        <ProgressBar
          progressPercent={levelInfo.progressPercent}
          label="EXPERIENCE POINTS"
          valueDisplay={`${formatXPNumber(levelInfo.xpIntoCurrentLevel)} / ${formatXPNumber(levelInfo.xpRequiredForNextLevel)} XP`}
        />

        <div className="sys-divider" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ borderLeft: '2px solid var(--border-medium)', paddingLeft: '8px' }}>
            <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              TRAINING STREAK
            </div>
            <div className="font-mono" style={{ fontSize: '16px', fontWeight: 800, marginTop: '2px' }}>
              {userProfile.trainingStreak} DAYS
            </div>
          </div>

          <div style={{ borderLeft: '2px solid var(--border-medium)', paddingLeft: '8px' }}>
            <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              CONSISTENCY CHAIN
            </div>
            <div className="font-mono" style={{ fontSize: '16px', fontWeight: 800, marginTop: '2px' }}>
              {userProfile.consistencyStreak} DAYS
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING BOSS QUEST */}
      <section className="sys-section">
        <div className="sys-section-title">
          <span>UPCOMING BOSS QUEST</span>
          <span className="sys-tag">DAY 030</span>
        </div>

        <div className="flex-between">
          <div>
            <div className="font-mono" style={{ fontSize: '15px', fontWeight: 800 }}>
              IRON GATE
            </div>
            <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Squat / Deadlift: 85 kg × 8 reps
            </div>
          </div>
          <div className="font-mono sys-tag" style={{ fontSize: '10px' }}>
            +500 XP // REWARD TOKEN ×1
          </div>
        </div>
      </section>

      {/* SYSTEM LOGS / RECENT EVENTS */}
      <section className="sys-section">
        <div className="sys-section-title">
          <span>RECENT SYSTEM AUDIT LOGS</span>
          <span className="sys-tag">EVENT FEED</span>
        </div>
        <SystemEventsFeed />
      </section>
    </div>
  );
};
