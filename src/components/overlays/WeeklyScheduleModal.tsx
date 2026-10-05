import React, { useState } from 'react';
import { WORKOUT_SCHEDULE } from '../../data/workoutSchedule';
import { WorkoutScheduleDay, ExerciseDefinition } from '../../types/workout';

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

  if (!isOpen) return null;

  const currentSchedule: WorkoutScheduleDay = WORKOUT_SCHEDULE[activeWeekday] || WORKOUT_SCHEDULE[1];

  const handleActivateDay = (wday: number) => {
    if (onSelectWeekday) {
      onSelectWeekday(wday);
    }
    onClose();
  };

  const renderExerciseCategoryGroup = (categoryKey: string, exercises: ExerciseDefinition[], startIndex: number) => {
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
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{exercises.length} MOVEMENTS</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {exercises.map((ex, idx) => (
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
                  <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>#{startIndex + idx}</span>
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
    // Group exercises by category preserving relative order
    const categoryGroups: { category: string; exercises: ExerciseDefinition[]; startIndex: number }[] = [];
    let runningIndex = 1;

    for (const ex of day.exercises) {
      let group = categoryGroups.find((g) => g.category === ex.category);
      if (!group) {
        group = { category: ex.category, exercises: [], startIndex: runningIndex };
        categoryGroups.push(group);
      }
      group.exercises.push(ex);
      runningIndex++;
    }

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
        {day.preparationSections && day.preparationSections.length > 0 && (
          <div style={{ border: '1px solid var(--border-subtle)', padding: '12px' }}>
            <div className="flex-between font-mono" style={{ fontSize: '12px', fontWeight: 800, marginBottom: '10px' }}>
              <span>PRE-WORKOUT PREPARATION</span>
              <span className="sys-tag">{day.preparationMinutes} MIN</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {day.preparationSections.map((sec, sIdx) => (
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
        )}

        {/* EXERCISES GROUPED BY CATEGORY */}
        {day.exercises.length > 0 && (
          <div>
            <div className="sys-section-title" style={{ marginBottom: '12px' }}>
              <span>EXERCISE PROTOCOL</span>
              <span className="sys-tag">{day.exercises.length} MOVEMENTS</span>
            </div>

            {categoryGroups.map((group) =>
              renderExerciseCategoryGroup(group.category, group.exercises, group.startIndex)
            )}
          </div>
        )}

        {/* RECOVERY BLOCK */}
        {day.recoverySections && day.recoverySections.length > 0 && (
          <div style={{ border: '1px solid var(--border-subtle)', padding: '12px' }}>
            <div className="flex-between font-mono" style={{ fontSize: '12px', fontWeight: 800, marginBottom: '8px' }}>
              <span>RECOVERY PROTOCOL</span>
              <span className="sys-tag">{day.recoveryMinutes} MIN</span>
            </div>

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
        )}

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
    </div>
  );
};
