import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RankBadge } from '../../components/common/RankBadge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { getExerciseHistory, getAchievements, getBosses, getCompletedSessions } from '../../lib/firebase/db';
import { ExerciseHistoricalRecord } from '../../types/progress';
import { Achievement, BossQuest } from '../../types/gamification';
import { CompletedSession } from '../../types/workout';
import { padDayNumber } from '../../lib/formatting/formatters';

type StatsTab = 'scan' | 'prs' | 'history' | 'achievements' | 'bosses';

export const StatsScreen: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<StatsTab>('scan');

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
      .catch((err) => console.warn('Error loading stats subcollections:', err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (loading || !userProfile) {
    return (
      <div className="font-mono text-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>
        SCANNING SYSTEM DATA...
      </div>
    );
  }

  const attributes = userProfile.attributes;

  // Deterministic System Scan calculations
  const attrList = [
    { key: 'STR', name: 'Strength', val: attributes.strength },
    { key: 'END', name: 'Endurance', val: attributes.endurance },
    { key: 'AGI', name: 'Agility', val: attributes.agility },
    { key: 'MOB', name: 'Mobility', val: attributes.mobility },
    { key: 'DIS', name: 'Discipline', val: attributes.discipline },
    { key: 'FOC', name: 'Focus', val: attributes.focus }
  ];

  const strongestAttr = [...attrList].sort((a, b) => b.val - a.val)[0];
  const mostImprovedAttr = [...attrList].sort((a, b) => (b.val - 20) - (a.val - 20))[0];

  const totalSessionsCompleted = sessions.filter((s) => s.status === 'completed' || s.status === 'reduced').length;
  const consistencyRate = Math.min(100, Math.round((userProfile.consistencyStreak / Math.max(1, sessions.length)) * 100)) || 100;
  const prsRecorded = historicalRecords.filter((r) => r.isPR).length;

  return (
    <div>
      <div className="sys-header">
        <div className="flex-between">
          <span className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
            ARCHIMEDES // INSTRUMENT PANEL
          </span>
          <span className="sys-tag">RANK {userProfile.rank}</span>
        </div>
        <h1 className="font-mono" style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 2px 0' }}>
          SYSTEM SCAN & METRICS
        </h1>
        <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          POWER LEVEL: {userProfile.systemPower} // TITLE: {userProfile.currentTitle}
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '4px',
          marginBottom: '16px'
        }}
      >
        <button
          className={`sys-btn sys-btn-subtle ${activeTab === 'scan' ? 'sys-btn-inverted' : ''}`}
          onClick={() => setActiveTab('scan')}
          style={{ minHeight: '36px', padding: '4px 2px', fontSize: '9px', letterSpacing: '0.08em' }}
        >
          SCAN
        </button>
        <button
          className={`sys-btn sys-btn-subtle ${activeTab === 'prs' ? 'sys-btn-inverted' : ''}`}
          onClick={() => setActiveTab('prs')}
          style={{ minHeight: '36px', padding: '4px 2px', fontSize: '9px', letterSpacing: '0.08em' }}
        >
          PRS
        </button>
        <button
          className={`sys-btn sys-btn-subtle ${activeTab === 'history' ? 'sys-btn-inverted' : ''}`}
          onClick={() => setActiveTab('history')}
          style={{ minHeight: '36px', padding: '4px 2px', fontSize: '9px', letterSpacing: '0.08em' }}
        >
          LOGS
        </button>
        <button
          className={`sys-btn sys-btn-subtle ${activeTab === 'achievements' ? 'sys-btn-inverted' : ''}`}
          onClick={() => setActiveTab('achievements')}
          style={{ minHeight: '36px', padding: '4px 2px', fontSize: '9px', letterSpacing: '0.08em' }}
        >
          ACHIEVE
        </button>
        <button
          className={`sys-btn sys-btn-subtle ${activeTab === 'bosses' ? 'sys-btn-inverted' : ''}`}
          onClick={() => setActiveTab('bosses')}
          style={{ minHeight: '36px', padding: '4px 2px', fontSize: '9px', letterSpacing: '0.08em' }}
        >
          BOSSES
        </button>
      </div>

      {/* SYSTEM SCAN VIEW */}
      {activeTab === 'scan' && (
        <div className="anim-fade-in">
          {/* Attributes List */}
          <section className="sys-section">
            <div className="sys-section-title">
              <span>PHYSICAL & COGNITIVE ATTRIBUTES</span>
              <span className="sys-tag">SCALE 20–100</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {attrList.map((attr) => (
                <div key={attr.key}>
                  <div className="font-mono flex-between" style={{ fontSize: '12px', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700 }}>
                      {attr.key} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>// {attr.name}</span>
                    </span>
                    <span style={{ fontWeight: 800 }}>{Math.round(attr.val)}</span>
                  </div>
                  <ProgressBar progressPercent={attr.val} height={6} />
                </div>
              ))}
            </div>
          </section>

          {/* Deterministic Scan Breakdown */}
          <section className="sys-section font-mono">
            <div className="sys-section-title">
              <span>SYSTEM DIAGNOSTIC SCAN</span>
              <span className="sys-tag">DETERMINISTIC</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ borderLeft: '2px solid #ffffff', paddingLeft: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CURRENT STRENGTH</div>
                <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px' }}>
                  {strongestAttr.key} ({Math.round(strongestAttr.val)})
                </div>
              </div>

              <div style={{ borderLeft: '2px solid #ffffff', paddingLeft: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MOST IMPROVED</div>
                <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px' }}>
                  {mostImprovedAttr.key} (+{Math.round(mostImprovedAttr.val - 20)})
                </div>
              </div>

              <div style={{ borderLeft: '2px solid #ffffff', paddingLeft: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CONSISTENCY STATUS</div>
                <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px' }}>
                  {consistencyRate}%
                </div>
              </div>

              <div style={{ borderLeft: '2px solid #ffffff', paddingLeft: '8px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SESSIONS COMPLETED</div>
                <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px' }}>
                  {totalSessionsCompleted}
                </div>
              </div>
            </div>

            <div className="sys-divider" />

            <div className="flex-between">
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>NEXT MAJOR OBJECTIVE</div>
                <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '2px' }}>IRON GATE (DAY 30)</div>
              </div>
              <RankBadge rank={userProfile.rank} size="md" />
            </div>
          </section>
        </div>
      )}

      {/* PR ARCHIVE VIEW */}
      {activeTab === 'prs' && (
        <div className="anim-fade-in">
          <section className="sys-section">
            <div className="sys-section-title">
              <span>PERSONAL RECORD ARCHIVE</span>
              <span className="sys-tag">{prsRecorded} RECORDS</span>
            </div>

            {historicalRecords.filter((r) => r.isPR).length === 0 ? (
              <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '16px 0' }}>
                NO PERSONAL RECORDS LOGGED YET.
                <br />
                Complete working sets that surpass baseline metrics to establish PRs.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {historicalRecords
                  .filter((r) => r.isPR)
                  .map((pr) => (
                    <div
                      key={pr.id}
                      className="font-mono"
                      style={{
                        border: '1px solid #ffffff',
                        padding: '10px',
                        backgroundColor: 'var(--bg-primary)'
                      }}
                    >
                      <div className="flex-between" style={{ fontSize: '12px', fontWeight: 700 }}>
                        <span>{pr.exerciseName.toUpperCase()}</span>
                        <span className="sys-tag" style={{ fontSize: '9px' }}>PR</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {pr.bestWeight ? `Best Weight: ${pr.bestWeight} kg × ${pr.bestReps} reps` : `${pr.bestDurationSec} sec hold`}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        RECORDED ON {pr.date} (DAY {padDayNumber(pr.dayNumber)})
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* EXERCISE HISTORY VIEW */}
      {activeTab === 'history' && (
        <div className="anim-fade-in">
          <section className="sys-section">
            <div className="sys-section-title">
              <span>EXERCISE HISTORY LOGS</span>
              <span className="sys-tag">PAGINATED</span>
            </div>

            {historicalRecords.length === 0 ? (
              <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '16px 0' }}>
                NO EXERCISE HISTORY LOGS YET.
                <br />
                Completed sessions will populate historical logs here.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {historicalRecords.slice(0, 25).map((rec) => (
                  <div
                    key={rec.id}
                    className="font-mono"
                    style={{
                      borderLeft: '2px solid var(--border-medium)',
                      paddingLeft: '10px',
                      paddingTop: '4px',
                      paddingBottom: '4px'
                    }}
                  >
                    <div className="flex-between" style={{ fontSize: '12px', fontWeight: 700 }}>
                      <span>{rec.exerciseName}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{rec.date}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {rec.sets.map((s, i) => (
                        <span key={i} style={{ marginRight: '8px', display: 'inline-block' }}>
                          {s.weightKg ? `${s.weightKg}kg×${s.reps}` : s.durationSec ? `${s.durationSec}s` : `${s.reps}r`}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ACHIEVEMENTS VIEW */}
      {activeTab === 'achievements' && (
        <div className="anim-fade-in">
          <section className="sys-section">
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
                    padding: '10px',
                    backgroundColor: ach.unlocked ? 'var(--bg-surface)' : 'var(--bg-primary)'
                  }}
                >
                  <div className="flex-between" style={{ fontSize: '12px', fontWeight: 700 }}>
                    <span>{ach.isSecret && !ach.unlocked ? '???' : ach.title}</span>
                    <span className="sys-tag" style={{ fontSize: '9px' }}>
                      {ach.unlocked ? '✓ UNLOCKED' : `+${ach.xpReward} XP`}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {ach.isSecret && !ach.unlocked ? 'Hidden system condition.' : ach.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* BOSS QUESTS VIEW */}
      {activeTab === 'bosses' && (
        <div className="anim-fade-in">
          <section className="sys-section">
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
                    padding: '12px',
                    backgroundColor: boss.status === 'completed' ? 'var(--bg-surface)' : 'var(--bg-primary)'
                  }}
                >
                  <div className="flex-between" style={{ fontSize: '13px', fontWeight: 800 }}>
                    <span>{boss.title}</span>
                    <span className="sys-tag">DAY {padDayNumber(boss.dayNumber)}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0' }}>
                    {boss.subtitle}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    TARGET: {boss.targetMetric.description}
                  </div>
                  <div className="flex-between" style={{ marginTop: '8px', fontSize: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      REWARD: +{boss.reward.xp} XP {boss.reward.tokens ? `// TOKEN ×${boss.reward.tokens}` : ''}
                    </span>
                    <span style={{ fontWeight: 700 }}>
                      {boss.status === 'completed' ? '✓ DEFEATED' : 'LOCKED / PENDING'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
