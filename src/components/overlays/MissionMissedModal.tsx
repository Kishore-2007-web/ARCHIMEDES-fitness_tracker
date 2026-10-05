import React from 'react';
import { padDayNumber } from '../../lib/formatting/formatters';
import { Button } from '../common/Button';

interface MissionMissedModalProps {
  isOpen: boolean;
  dayNumber: number;
  onClose: () => void;
}

export const MissionMissedModal: React.FC<MissionMissedModalProps> = ({
  isOpen,
  dayNumber,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="sys-modal-backdrop anim-fade-in" style={{ zIndex: 260 }}>
      <div
        className="sys-modal-content anim-scale-in font-mono"
        style={{
          border: '2px solid #ffffff',
          backgroundColor: '#000000',
          padding: '28px',
          maxWidth: '420px',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '11px', letterSpacing: '0.25em', color: 'var(--text-muted)' }}>
          PROTOCOL STATUS
        </div>

        <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '0.1em', margin: '12px 0 6px 0' }}>
          MISSION MISSED
        </div>

        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          DAY {padDayNumber(dayNumber)} // INCOMPLETE
        </div>

        <div className="sys-section" style={{ textAlign: 'left', padding: '14px', marginBottom: '20px' }}>
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>TRAINING STREAK</span>
            <span style={{ fontWeight: 700 }}>RESET → 0</span>
          </div>
          <div className="flex-between">
            <span style={{ color: 'var(--text-muted)' }}>CONSISTENCY STATUS</span>
            <span style={{ fontWeight: 700 }}>RESET → 0</span>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          No recovery protocol was selected. The next scheduled mission remains unchanged. Continue.
        </p>

        <Button variant="inverted" onClick={onClose}>
          CONTINUE
        </Button>
      </div>
    </div>
  );
};
