import React, { useState } from 'react';
import { WORKOUT_SCHEDULE, COMMON_WARMUP_SECTIONS } from '../../data/workoutSchedule';
import { WorkoutScheduleDay, ExerciseDefinition } from '../../types/workout';
import { ImageViewerModal } from './ImageViewerModal';

interface WeeklyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeekday?: number;
  onSelectWeekday?: (weekday: number) => void;
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  primary: 'PRIMARY STRENGTH LIFTS',
  secondary: 'SECONDARY LIFTS',
  support: 'SUPPORT MOVEMENTS',
  calisthenics: 'CALISTHENICS & BODYWEIGHT',
  athletic: 'ATHLETIC & AGILITY',
  conditioning: 'CONDITIONING',
  grip: 'GRIP FORTITUDE',
  neck: 'CERVICAL / NECK INTEGRITY',
  forearms: 'FOREARM & WRIST HYPERTROPHY',
  recovery: 'ACTIVE RECOVERY MOVEMENTS'
};

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon -> Sun
const WEEKDAY_LABELS: Record<number, string> = {
  1: 'MON',
  2: 'TUE',
  3: 'WED',
  4: 'THU',
  5: 'FRI',
  6: 'SAT',
  0: 'SUN'
};

export const WeeklyScheduleModal: React.FC<WeeklyScheduleModalProps> = ({
  isOpen,
  onClose,
  initialWeekday = 1,
  onSelectWeekday
}) => {
  const [activeWeekday, setActiveWeekday] = useState<number>(initialWeekday);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [expandedImages, setExpandedImages] = useState<Record<string, boolean>>({});
  const [lightboxData, setLightboxData] = useState<{ src: string; title: string; subtitle?: string } | null>(null);

  const toggleSectionImage = (key: string) => {
    setExpandedImages((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isOpen) return null;

  const currentSchedule: WorkoutScheduleDay = WORKOUT_SCHEDULE[activeWeekday] || WORKOUT_SCHEDULE[1];

  const handleActivateDay = (wday: number) => {
    if (onSelectWeekday) {
      onSelectWeekday(wday);
    }
    onClose();
  };

  const renderExerciseCategoryGroup = (
    categoryKey: string,
    items: { ex: ExerciseDefinition; originalIndex: number }[]
  ) => {
    return (
      <div key={categoryKey} style={{ marginBottom: '16px' }}>
        <div
          className="font-mono flex-between"
          style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: 'var(--text-primary)',
            padding: '6px 8px',
            background: 'var(--bg-elevated)',
            borderLeft: '3px solid #ffffff',
            marginBottom: '8px'
          }}
        >
          <span>{CATEGORY_DISPLAY_NAMES[categoryKey] || categoryKey.toUpperCase()}</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{items.length} MOVEMENTS</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map(({ ex, originalIndex }) => (
            <div
              key={ex.id}
              style={{
                border: '1px solid var(--border-subtle)',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <div className="flex-between">
                <div className="font-mono" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>#{originalIndex}</span>
                  {ex.name}
                </div>
                <span
                  className="font-mono"
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    background: 'var(--border-subtle)',
                    border: '1px solid var(--border-medium)'
                  }}
                >
                  {ex.targetSets} × {ex.targetRepOrDuration}
                </span>
              </div>

              {ex.notes && (
                <div
                  className="font-mono"
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    marginTop: '6px',
                    paddingLeft: '8px',
                    borderLeft: '2px solid var(--border-medium)',
                    fontStyle: 'italic'
                  }}
                >
                  {ex.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayScheduleContent = (day: WorkoutScheduleDay) => {
    // Group exercises by category preserving accurate original index
    const categoryGroups: { category: string; exercises: { ex: ExerciseDefinition; originalIndex: number }[] }[] = [];

    day.exercises.forEach((ex, idx) => {
      let group = categoryGroups.find((g) => g.category === ex.category);
      if (!group) {
        group = { category: ex.category, exercises: [] };
        categoryGroups.push(group);
      }
      group.exercises.push({ ex, originalIndex: idx + 1 });
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Header summary */}
        <div style={{ borderBottom: '1px solid var(--border-medium)', paddingBottom: '12px' }}>
          <div className="flex-between" style={{ marginBottom: '6px' }}>
            <span className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
              {day.weekdayName} PROTOCOL
            </span>
            <span className="sys-tag">BASE {day.baseXP} XP</span>
          </div>

          <h2 className="font-mono" style={{ fontSize: '18px', fontWeight: 800, margin: '2px 0 4px 0' }}>
            {day.title}
          </h2>
          <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {day.subtitle}
          </div>
        </div>

        {/* System Directive / Day Note */}
        {day.dayNote && (
          <div
            className="font-mono"
            style={{
              padding: '10px 12px',
              border: '1px solid var(--border-medium)',
              borderLeft: '4px solid #ffffff',
              background: 'var(--bg-elevated)',
              fontSize: '12px',
              lineHeight: 1.5,
              color: 'var(--text-primary)'
            }}
          >
            <span style={{ fontWeight: 800, marginRight: '6px' }}>ARCHIMEDES DIRECTIVE:</span>
            {day.dayNote}
          </div>
        )}

        {/* PRE-WORKOUT BLOCK */}
        {(() => {
          const prepSections = day.preparationSections && day.preparationSections.length > 0
            ? day.preparationSections
            : COMMON_WARMUP_SECTIONS;
          const prepMinutes = day.preparationMinutes > 0 ? day.preparationMinutes : 20;
          const preworkoutImg = day.preworkoutImageUrl || '/warmup-protocol.jpg';
          const isPreworkoutImageOpen = Boolean(expandedImages[`${day.weekday}-preworkout`]);

          return (
            <div style={{ border: '1px solid var(--border-subtle)', padding: '12px' }}>
              <div className="flex-between font-mono" style={{ fontSize: '12px', fontWeight: 800, marginBottom: '8px' }}>
                <span>PRE-WORKOUT PREPARATION</span>
                <span className="sys-tag">{prepMinutes} MIN</span>
              </div>

              {/* VIEW IMAGE BUTTON UNDER PREWORKOUT */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
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
                  onClick={() => toggleSectionImage(`${day.weekday}-preworkout`)}
                >
                  <span>📷</span> {isPreworkoutImageOpen ? 'HIDE IMAGE' : 'VIEW IMAGE'}
                </button>
                {isPreworkoutImageOpen && (
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxData({
                        src: preworkoutImg,
                        title: '20 MIN WARM-UP PROTOCOL',
                        subtitle: `${day.weekdayName} // PRE-WORKOUT`
                      })
                    }
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    🔍 FULLSCREEN
                  </button>
                )}
              </div>

              {/* PREWORKOUT IMAGE DISPLAY */}
              {isPreworkoutImageOpen && (
                <div
                  className="anim-fade-in"
                  style={{
                    marginBottom: '12px',
                    border: '1px solid var(--border-medium)',
                    background: '#050505',
                    padding: '8px'
                  }}
                >
                  <div
                    className="flex-between font-mono"
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.1em',
                      marginBottom: '6px'
                    }}
                  >
                    <span>20 MIN WARM-UP — MOVE · PREPARE · PERFORM</span>
                    <span style={{ color: 'var(--text-secondary)' }}>CLICK IMAGE TO ZOOM</span>
                  </div>
                  <img
                    src={preworkoutImg}
                    alt="20 Min Warm-Up Routine"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      border: '1px solid var(--border-faint)',
                      cursor: 'zoom-in'
                    }}
                    onClick={() =>
                      setLightboxData({
                        src: preworkoutImg,
                        title: '20 MIN WARM-UP PROTOCOL',
                        subtitle: `${day.weekdayName} // PRE-WORKOUT`
                      })
                    }
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {prepSections.map((sec, sIdx) => (
                  <div key={sIdx} style={{ border: '1px solid var(--border-faint)', padding: '8px 10px', background: 'rgba(255,255,255,0.01)' }}>
                    <div className="flex-between font-mono" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      <span>{sec.title}</span>
                      {sec.duration && <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{sec.duration}</span>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {sec.items.map((item, iIdx) => (
                        <div key={iIdx} className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '8px' }}>
                          • {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* EXERCISES GROUPED BY CATEGORY */}
        {day.exercises.length > 0 && (() => {
          const isExerciseImageOpen = Boolean(expandedImages[`${day.weekday}-exercise`]);

          return (
            <div>
              <div className="sys-section-title" style={{ marginBottom: '8px' }}>
                <span>EXERCISE PROTOCOL</span>
                <span className="sys-tag">{day.exercises.length} MOVEMENTS</span>
              </div>

              {/* VIEW IMAGE BUTTON UNDER EXERCISE PROTOCOL */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
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
                  onClick={() => toggleSectionImage(`${day.weekday}-exercise`)}
                >
                  <span>📷</span> {isExerciseImageOpen ? 'HIDE IMAGE' : 'VIEW IMAGE'}
                </button>
                {isExerciseImageOpen && day.exerciseProtocolImageUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxData({
                        src: day.exerciseProtocolImageUrl!,
                        title: `${day.title} // EXERCISES`,
                        subtitle: `${day.weekdayName} // EXERCISE PROTOCOL`
                      })
                    }
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    🔍 FULLSCREEN
                  </button>
                )}
              </div>

              {/* EXERCISE PROTOCOL IMAGE / VISUAL GUIDE DISPLAY */}
              {isExerciseImageOpen && (
                <div
                  className="anim-fade-in"
                  style={{
                    marginBottom: '14px',
                    border: '1px solid var(--border-medium)',
                    background: '#050505',
                    padding: '10px'
                  }}
                >
                  {day.exerciseProtocolImageUrl ? (
                    <>
                      <div
                        className="flex-between font-mono"
                        style={{
                          fontSize: '10px',
                          color: 'var(--text-muted)',
                          letterSpacing: '0.1em',
                          marginBottom: '6px'
                        }}
                      >
                        <span>{day.title} // EXERCISE PROTOCOL DIAGRAM</span>
                        <span style={{ color: 'var(--text-secondary)' }}>CLICK IMAGE TO ZOOM</span>
                      </div>
                      <img
                        src={day.exerciseProtocolImageUrl}
                        alt={`${day.title} Exercise Diagram`}
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          border: '1px solid var(--border-faint)',
                          cursor: 'zoom-in'
                        }}
                        onClick={() =>
                          setLightboxData({
                            src: day.exerciseProtocolImageUrl!,
                            title: `${day.title} // EXERCISES`,
                            subtitle: `${day.weekdayName} // EXERCISE PROTOCOL`
                          })
                        }
                      />
                    </>
                  ) : (
                    <div className="font-mono" style={{ textAlign: 'center', padding: '12px 8px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {day.title} — EXERCISE PROTOCOL
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Reference diagram not yet attached for this movement protocol. Follow the structured movement targets and notes below.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {categoryGroups.map((group) =>
                renderExerciseCategoryGroup(group.category, group.exercises)
              )}
            </div>
          );
        })()}

        {/* RECOVERY BLOCK */}
        {day.recoverySections && day.recoverySections.length > 0 && (() => {
          const isRecoveryImageOpen = Boolean(expandedImages[`${day.weekday}-recovery`]);

          return (
            <div style={{ border: '1px solid var(--border-subtle)', padding: '12px' }}>
              <div className="flex-between font-mono" style={{ fontSize: '12px', fontWeight: 800, marginBottom: '8px' }}>
                <span>RECOVERY PROTOCOL</span>
                <span className="sys-tag">{day.recoveryMinutes} MIN</span>
              </div>

              {/* VIEW IMAGE BUTTON UNDER RECOVERY PROTOCOL */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
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
                  onClick={() => toggleSectionImage(`${day.weekday}-recovery`)}
                >
                  <span>📷</span> {isRecoveryImageOpen ? 'HIDE IMAGE' : 'VIEW IMAGE'}
                </button>
                {isRecoveryImageOpen && (
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxData({
                        src: day.recoveryProtocolImageUrl || '/recovery-protocol.jpg',
                        title: '15 MIN RECOVERY PROTOCOL',
                        subtitle: `${day.weekdayName} // RECOVERY PROTOCOL`
                      })
                    }
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                  >
                    🔍 FULLSCREEN
                  </button>
                )}
              </div>

              {/* RECOVERY PROTOCOL IMAGE DISPLAY */}
              {isRecoveryImageOpen && (
                <div
                  className="anim-fade-in"
                  style={{
                    marginBottom: '12px',
                    border: '1px solid var(--border-medium)',
                    background: '#050505',
                    padding: '8px'
                  }}
                >
                  <div
                    className="flex-between font-mono"
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.1em',
                      marginBottom: '6px'
                    }}
                  >
                    <span>15 MIN RECOVERY — COOL-DOWN · MOBILITY · DECOMPRESSION</span>
                    <span style={{ color: 'var(--text-secondary)' }}>CLICK IMAGE TO ZOOM</span>
                  </div>
                  <img
                    src={day.recoveryProtocolImageUrl || '/recovery-protocol.jpg'}
                    alt="15 Min Recovery Routine"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      border: '1px solid var(--border-faint)',
                      cursor: 'zoom-in'
                    }}
                    onClick={() =>
                      setLightboxData({
                        src: day.recoveryProtocolImageUrl || '/recovery-protocol.jpg',
                        title: '15 MIN RECOVERY PROTOCOL',
                        subtitle: `${day.weekdayName} // RECOVERY PROTOCOL`
                      })
                    }
                  />
                </div>
              )}

              {day.recoverySections.map((sec, rIdx) => (
                <div key={rIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {sec.items.map((item, iIdx) => (
                    <div key={iIdx} className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)', paddingLeft: '8px' }}>
                      • {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })()}

        {/* WALKING PROTOCOL */}
        {day.walkingMinutes > 0 && (
          <div className="flex-between font-mono" style={{ border: '1px solid var(--border-subtle)', padding: '10px 12px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800 }}>CONTINUOUS AEROBIC WALK</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Brisk continuous pace for metabolic recovery</div>
            </div>
            <span className="sys-tag" style={{ fontSize: '11px' }}>
              {day.walkingRange || `${day.walkingMinutes} MIN`}
            </span>
          </div>
        )}

        {/* Activate Day Button */}
        {onSelectWeekday && (
          <button
            type="button"
            className="sys-btn sys-btn-inverted font-mono"
            style={{ minHeight: '44px', width: '100%', fontSize: '13px', marginTop: '6px' }}
            onClick={() => handleActivateDay(day.weekday)}
          >
            ACTIVATE {day.weekdayName} IN QUEST ENGINE
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        background: 'rgba(0, 0, 0, 0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="sys-panel anim-scale-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#000000',
          border: '1px solid #ffffff',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          className="flex-between font-mono"
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--border-medium)',
            background: 'var(--bg-elevated)'
          }}
        >
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
              ARCHIMEDES // BLUEPRINT
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800 }}>7-DAY WORKOUT BLUEPRINT</div>
          </div>
          <button
            type="button"
            className="sys-btn sys-btn-subtle"
            style={{ width: 'auto', minHeight: '32px', padding: '2px 10px', fontSize: '12px' }}
            onClick={onClose}
          >
            ✕ CLOSE
          </button>
        </div>

        {/* View Mode Switcher + Weekday Selector Tabs */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-base)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--border-subtle)' }}>
            {WEEKDAY_ORDER.map((wday) => {
              const isSelected = activeWeekday === wday && viewMode === 'single';
              return (
                <button
                  key={wday}
                  type="button"
                  onClick={() => {
                    setActiveWeekday(wday);
                    setViewMode('single');
                  }}
                  style={{
                    background: isSelected ? '#ffffff' : '#000000',
                    color: isSelected ? '#000000' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '8px 2px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {WEEKDAY_LABELS[wday]}
                </button>
              );
            })}
          </div>

          <div className="flex-between font-mono" style={{ padding: '6px 12px', fontSize: '10px', color: 'var(--text-muted)' }}>
            <span>SELECT ANY DAY ABOVE TO INSPECT PROTOCOL</span>
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'all' ? 'single' : 'all')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '10px'
              }}
            >
              {viewMode === 'all' ? 'VIEW SINGLE DAY' : 'EXPAND ALL 7 DAYS'}
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {viewMode === 'single' ? (
            renderDayScheduleContent(currentSchedule)
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {WEEKDAY_ORDER.map((wday) => (
                <div key={wday} style={{ borderBottom: '2px solid var(--border-medium)', paddingBottom: '24px' }}>
                  {renderDayScheduleContent(WORKOUT_SCHEDULE[wday])}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ImageViewerModal
        isOpen={Boolean(lightboxData)}
        onClose={() => setLightboxData(null)}
        src={lightboxData?.src || ''}
        title={lightboxData?.title}
        subtitle={lightboxData?.subtitle}
      />
    </div>
  );
};
