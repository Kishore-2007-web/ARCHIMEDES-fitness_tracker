import React, { useEffect, useState } from 'react';
import { CompletedSession, DetectedPR } from '../../types/workout';
import { Button } from '../common/Button';

interface XPRevealOverlayProps {
  isOpen: boolean;
  session: CompletedSession | null;
  prs: DetectedPR[];
  onClose: () => void;
}

export const XPRevealOverlay: React.FC<XPRevealOverlayProps> = ({
  isOpen,
  session,
  prs,
  onClose
}) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isOpen || !session) {
      setStep(0);
      return;
    }

    // Step-by-step sequential reveal (each step revealed over ~300ms)
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setStep(1), 150)); // Session Complete
    timers.push(window.setTimeout(() => setStep(2), 450)); // PRs / Daily Mission
    timers.push(window.setTimeout(() => setStep(3), 750)); // Streak Bonus
    timers.push(window.setTimeout(() => setStep(4), 1050)); // Total XP

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [isOpen, session]);

  if (!isOpen || !session) return null;

  return (
    <div className="sys-modal-backdrop anim-fade-in" style={{ zIndex: 250 }}>
      <div
        className="sys-modal-content anim-scale-in"
        style={{
          border: '1px solid #ffffff',
          backgroundColor: '#000000',
          padding: '28px',
          maxWidth: '400px'
        }}
      >
        <div
          className="font-mono text-center"
          style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)' }}
        >
          ARCHIMEDES // REWARD SEQUENCE
        </div>

        <div
          className="font-mono text-center"
          style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.1em', margin: '14px 0 20px 0' }}
        >
          SESSION COMPLETE
        </div>

        <div className="font-mono" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Base Session XP */}
          {step >= 1 && (
            <div className="flex-between anim-fade-in" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>BASE TRAINING</span>
              <span style={{ fontWeight: 700 }}>+{session.baseXP} XP</span>
            </div>
          )}

          {/* PR Bonus */}
          {step >= 2 && session.performanceBonus > 0 && (
            <div className="flex-between anim-fade-in" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                PR DETECTED ({prs.length})
              </span>
              <span style={{ fontWeight: 700 }}>+{session.performanceBonus} XP</span>
            </div>
          )}

          {/* Daily Mission */}
          {step >= 2 && session.dailyMissionCompleted && (
            <div className="flex-between anim-fade-in" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>DAILY MISSION</span>
              <span style={{ fontWeight: 700 }}>+25 XP</span>
            </div>
          )}

          {/* Streak Bonus */}
          {step >= 3 && session.streakBonus > 0 && (
            <div className="flex-between anim-fade-in" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>STREAK MILESTONE</span>
              <span style={{ fontWeight: 700 }}>+{session.streakBonus} XP</span>
            </div>
          )}

          {/* Boss Bonus */}
          {step >= 3 && session.bossBonus > 0 && (
            <div className="flex-between anim-fade-in" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>BOSS DEFEATED</span>
              <span style={{ fontWeight: 700 }}>+{session.bossBonus} XP</span>
            </div>
          )}

          {/* Total Sum Inverted Box */}
          {step >= 4 && (
            <div
              className="sys-alert-inverted anim-scale-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                marginTop: '8px',
                marginBottom: '4px'
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em' }}>TOTAL XP</span>
              <span style={{ fontSize: '20px', fontWeight: 800 }}>+{session.totalXP} XP</span>
            </div>
          )}

          {session.randomRewardTokenGranted && step >= 4 && (
            <div className="font-mono text-center" style={{ fontSize: '12px', border: '1px dashed #ffffff', padding: '8px' }}>
              [ BONUS: REWARD TOKEN ×1 ACQUIRED ]
            </div>
          )}
        </div>

        <div style={{ marginTop: '22px' }}>
          <Button variant="inverted" onClick={onClose}>
            CONTINUE
          </Button>
        </div>
      </div>
    </div>
  );
};
