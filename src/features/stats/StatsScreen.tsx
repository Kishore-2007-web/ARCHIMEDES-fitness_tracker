import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RankBadge } from '../../components/common/RankBadge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { getExerciseHistory, getAchievements, getBosses, getCompletedSessions } from '../../lib/firebase/db';
import { ExerciseHistoricalRecord } from '../../types/progress';
import { Achievement, BossQuest } from '../../types/gamification';
import { CompletedSession } from '../../types/workout';
import { padDayNumber, formatXPNumber } from '../../lib/formatting/formatters';
import { calculateLevelFromXP } from '../../lib/progression/levelCalculations';
import { SYSTEM_TITLES } from '../../data/titles';
import { SystemEventsFeed } from '../system/SystemEventsFeed';

type StatsSection = 'prs' | 'bosses' | 'achievements' | 'titles' | 'reports';

export const StatsScreen: React.FC = () => {
  const { currentUser, userProfile, updateProfileData } = useAuth();
  const [activeSection, setActiveSection] = useState<StatsSection>('prs');

  const [historicalRecords, setHistoricalRecords] = useState<ExerciseHistoricalRecord[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [bosses, setBosses] = useState<BossQuest[]>([]);
  const [sessions, setSessions] = useState<CompletedSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      getExerciseHistory(currentUser.uid, undefined, 50),
      getAchievements(currentUser.uid),
      getBosses(currentUser.uid),
      getCompletedSessions(currentUser.uid)
    ])
      .then(([recs, achs, bss, sess]) => {
        setHistoricalRecords(recs);
        setAchievements(achs);
        setBosses(bss);
        setSessions(sess);
      })
      .catch((err) => console.warn('Error loading stats:', err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (loading || !userProfile) {
    return (
      <div className="font-mono text-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>
        SCANNING METRICS...
      </div>
    );
  }

  const levelInfo = calculateLevelFromXP(userProfile.xp);
  const attributes = userProfile.attributes;

  const attrList = [
    { key: 'STR', name: 'Strength', val: attributes.strength },
    { key: 'END', name: 'Endurance', val: attributes.endurance },
    { key: 'AGI', name: 'Agility', val: attributes.agility },
    { key: 'MOB', name: 'Mobility', val: attributes.mobility },
    { key: 'DIS', name: 'Discipline', val: attributes.discipline },
    { key: 'FOC', name: 'Focus', val: attributes.focus }
  ];

  const prRecords = historicalRecords.filter((r) => r.isPR);
  const totalSessionsCompleted = sessions.filter((s) => s.status === 'completed' || s.status === 'reduced').length;
  const consistencyRate = Math.min(100, Math.round((userProfile.consistencyStreak / Math.max(1, sessions.length)) * 100)) || 100;

  const handleSelectTitle = async (titleName: string) => {
    await updateProfileData({ currentTitle: titleName });
  };

  return (
    <div className="anim-fade-in">
      {/* TOP HEADER */}
      <div style={{ marginBottom: '20px' }}>
        <div className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          ARCHIMEDES // STATS
        </div>
        <h1 className="font-mono" style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '0.04em', margin: '4px 0 2px 0' }}>
          PROGRESSION
        </h1>
        <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          TITLE: {userProfile.currentTitle}
        </div>
      </div>

      {/* CORE PROGRESSION OVERVIEW */}
      <div className="sys-section">
        <div className="flex-between" style={{ marginBottom: '12px' }}>
          <div>
            <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>LEVEL</div>
            <div className="font-mono" style={{ fontSize: '24px', fontWeight: 800 }}>
              {padDayNumber(levelInfo.level)}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>RANK</div>
            <RankBadge rank={userProfile.rank} size="md" />
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SYSTEM POWER</div>
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
      </div>

      {/* ATTRIBUTES LIST (SIMPLE ROWS & BARS) */}
      <div className="sys-section">
        <div className="sys-section-title">
          <span>ATTRIBUTES</span>
          <span className="sys-tag">SCALE 20–100</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
          {attrList.map((attr) => (
            <div key={attr.key}>
              <div className="font-mono flex-between" style={{ fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700 }}>{attr.key}</span>
                <span style={{ fontWeight: 800 }}>{Math.round(attr.val)}</span>
              </div>
              <ProgressBar progressPercent={attr.val} height={5} />
            </div>
          ))}
        </div>
      </div>

      {/* SUB-SECTIONS TABS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '4px',
          marginBottom: '16px'
        }}
      >
        <button
          type="button"
          className={`sys-btn ${activeSection === 'prs' ? 'sys-btn-inverted' : 'sys-btn-subtle'}`}
          onClick={() => setActiveSection('prs')}
          style={{ minHeight: '38px', padding: '4px 2px', fontSize: '10px' }}
        >
          PRS
        </button>

        <button
          type="button"
          className={`sys-btn ${activeSection === 'bosses' ? 'sys-btn-inverted' : 'sys-btn-subtle'}`}
          onClick={() => setActiveSection('bosses')}
          style={{ minHeight: '38px', padding: '4px 2px', fontSize: '10px' }}
        >
          BOSSES
        </button>

        <button
          type="button"
          className={`sys-btn ${activeSection === 'achievements' ? 'sys-btn-inverted' : 'sys-btn-subtle'}`}
          onClick={() => setActiveSection('achievements')}
          style={{ minHeight: '38px', padding: '4px 2px', fontSize: '10px' }}
        >
          ACHIEVE
        </button>

        <button
          type="button"
          className={`sys-btn ${activeSection === 'titles' ? 'sys-btn-inverted' : 'sys-btn-subtle'}`}
          onClick={() => setActiveSection('titles')}
          style={{ minHeight: '38px', padding: '4px 2px', fontSize: '10px' }}
        >
          TITLES
        </button>

        <button
          type="button"
          className={`sys-btn ${activeSection === 'reports' ? 'sys-btn-inverted' : 'sys-btn-subtle'}`}
          onClick={() => setActiveSection('reports')}
          style={{ minHeight: '38px', padding: '4px 2px', fontSize: '10px' }}
        >
          REPORTS
        </button>
      </div>

      {/* 1. PERSONAL RECORDS */}
      {activeSection === 'prs' && (
        <div className="sys-section anim-fade-in">
          <div className="sys-section-title">
            <span>PERSONAL RECORD ARCHIVE</span>
            <span className="sys-tag">{prRecords.length} LOGGED</span>
          </div>

          {prRecords.length === 0 ? (
            <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '12px 0' }}>
              No personal records logged yet. Records update automatically when exceeding previous milestones.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {prRecords.map((pr) => (
                <div
                  key={pr.id}
                  className="font-mono flex-between"
                  style={{
                    padding: '8px 10px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>{pr.exerciseName}</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {pr.bestWeight ? `${pr.bestWeight} kg × ${pr.bestReps} reps` : `${pr.bestDurationSec} sec`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="sys-tag" style={{ fontSize: '9px' }}>PR</span>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Day {padDayNumber(pr.dayNumber)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. BOSSES */}
      {activeSection === 'bosses' && (
        <div className="sys-section anim-fade-in">
          <div className="sys-section-title">
            <span>BOSS QUEST ARCHIVE</span>
            <span className="sys-tag">
              {bosses.filter((b) => b.status === 'completed').length} / {bosses.length} DEFEATED
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {bosses.map((boss) => (
              <div
                key={boss.id}
                className="font-mono"
                style={{
                  border: boss.status === 'completed' ? '1px solid #ffffff' : '1px solid var(--border-subtle)',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-primary)'
                }}
              >
                <div className="flex-between">
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>{boss.title}</span>
                  <span className="sys-tag" style={{ fontSize: '9px' }}>DAY {padDayNumber(boss.dayNumber)}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0' }}>
                  {boss.targetMetric.description}
                </div>
                <div className="flex-between" style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  <span>+{boss.reward.xp} XP</span>
                  <span style={{ fontWeight: 700, color: boss.status === 'completed' ? '#ffffff' : 'var(--text-muted)' }}>
                    {boss.status === 'completed' ? '✓ DEFEATED' : 'LOCKED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. ACHIEVEMENTS */}
      {activeSection === 'achievements' && (
        <div className="sys-section anim-fade-in">
          <div className="sys-section-title">
            <span>SYSTEM ACHIEVEMENTS</span>
            <span className="sys-tag">
              {achievements.filter((a) => a.unlocked).length} / {achievements.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="font-mono"
                style={{
                  border: ach.unlocked ? '1px solid #ffffff' : '1px solid var(--border-subtle)',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-primary)'
                }}
              >
                <div className="flex-between">
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>
                    {ach.isSecret && !ach.unlocked ? '???' : ach.title}
                  </span>
                  <span className="sys-tag" style={{ fontSize: '9px' }}>
                    {ach.unlocked ? '✓ UNLOCKED' : `+${ach.xpReward} XP`}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {ach.isSecret && !ach.unlocked ? 'Hidden system condition.' : ach.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TITLES */}
      {activeSection === 'titles' && (
        <div className="sys-section anim-fade-in">
          <div className="sys-section-title">
            <span>SYSTEM TITLES</span>
            <span className="sys-tag">EQUIPPED: {userProfile.currentTitle}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {SYSTEM_TITLES.map((title) => {
              const isEquipped = userProfile.currentTitle === title.name;
              return (
                <div
                  key={title.id}
                  className="font-mono flex-between"
                  style={{
                    padding: '10px 12px',
                    border: isEquipped ? '1px solid #ffffff' : '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-primary)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800 }}>{title.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {title.requirement}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSelectTitle(title.name)}
                    className={`sys-btn ${isEquipped ? 'sys-btn-inverted' : 'sys-btn-subtle'}`}
                    style={{ minHeight: '32px', width: 'auto', padding: '2px 10px', fontSize: '10px' }}
                  >
                    {isEquipped ? 'EQUIPPED' : 'EQUIP'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. REPORTS */}
      {activeSection === 'reports' && (
        <div className="anim-fade-in">
          {/* Consistency & Completion Summary */}
          <div className="sys-section">
            <div className="sys-section-title">
              <span>TRAINING AUDIT METRICS</span>
              <span className="sys-tag">OVERVIEW</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ borderLeft: '2px solid #ffffff', paddingLeft: '8px' }}>
                <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  SESSIONS COMPLETED
                </div>
                <div className="font-mono" style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>
                  {totalSessionsCompleted}
                </div>
              </div>

              <div style={{ borderLeft: '2px solid #ffffff', paddingLeft: '8px' }}>
                <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  CONSISTENCY RATE
                </div>
                <div className="font-mono" style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>
                  {consistencyRate}%
                </div>
              </div>

              <div style={{ borderLeft: '2px solid #ffffff', paddingLeft: '8px' }}>
                <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  TRAINING STREAK
                </div>
                <div className="font-mono" style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>
                  {userProfile.trainingStreak} DAYS
                </div>
              </div>

              <div style={{ borderLeft: '2px solid #ffffff', paddingLeft: '8px' }}>
                <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  REWARD TOKENS
                </div>
                <div className="font-mono" style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>
                  {userProfile.rewardTokens}
                </div>
              </div>
            </div>
          </div>

          {/* Audit Event Feed */}
          <div className="sys-section">
            <div className="sys-section-title">
              <span>SYSTEM EVENT FEED</span>
              <span className="sys-tag">LOGS</span>
            </div>
            <SystemEventsFeed />
          </div>
        </div>
      )}
    </div>
  );
};
