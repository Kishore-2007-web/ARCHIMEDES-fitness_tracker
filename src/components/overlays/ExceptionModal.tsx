import React, { useState } from 'react';
import { ExceptionReason } from '../../types/workout';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface ExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmException: (reason: ExceptionReason, isReduced?: boolean) => void;
}

export const ExceptionModal: React.FC<ExceptionModalProps> = ({
  isOpen,
  onClose,
  onConfirmException
}) => {
  const [selectedReason, setSelectedReason] = useState<ExceptionReason | null>(null);
  const [showTenMinRule, setShowTenMinRule] = useState<boolean>(false);

  const handleSelectReason = (reason: ExceptionReason) => {
    if (reason === 'LOW_MOTIVATION') {
      setShowTenMinRule(true);
      return;
    }
    setSelectedReason(reason);
  };

  const handleConfirm = () => {
    if (selectedReason) {
      onConfirmException(selectedReason, false);
      resetState();
      onClose();
    }
  };

  const handleTenMinChoice = (reduced: boolean) => {
    onConfirmException('LOW_MOTIVATION', reduced);
    resetState();
    onClose();
  };

  const resetState = () => {
    setSelectedReason(null);
    setShowTenMinRule(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetState();
        onClose();
      }}
      title="SESSION EXCEPTION"
    >
      {showTenMinRule ? (
        <div className="font-mono">
          <div className="sys-alert-inverted" style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.12em' }}>10-MINUTE RULE</div>
            <p style={{ fontSize: '12px', marginTop: '6px' }}>
              Begin the warm-up. Reassess after 10 minutes.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Button variant="inverted" onClick={() => handleTenMinChoice(false)}>
              CONTINUE FULL SESSION
            </Button>
            <Button variant="outline" onClick={() => handleTenMinChoice(true)}>
              REDUCE SESSION (~60% XP)
            </Button>
            <Button variant="subtle" onClick={() => setShowTenMinRule(false)}>
              BACK
            </Button>
          </div>
        </div>
      ) : selectedReason ? (
        <div className="font-mono">
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            REASON SELECTED: <strong style={{ color: '#fff' }}>{selectedReason.replace('_', ' ')}</strong>
          </div>

          {selectedReason === 'SICK' && (
            <div className="sys-section" style={{ padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>RECOVERY PROTOCOL</div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Training skipped. Consistency status maintained. Rest and resume when recovered.
              </p>
            </div>
          )}

          {selectedReason === 'INJURY_PAIN' && (
            <div className="sys-section" style={{ padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>SAFETY OVERRIDE</div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Pain overrides the schedule. Cease aggravated movements. Consistency maintained. If symptoms persist or worsen, seek appropriate medical evaluation.
              </p>
            </div>
          )}

          {(selectedReason === 'GYM_CLOSED' || selectedReason === 'COLLEGE_EXAM' || selectedReason === 'TRAVEL' || selectedReason === 'GENUINELY_UNAVOIDABLE') && (
            <div className="sys-section" style={{ padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>MINIMUM VIABLE DAY // +75 XP</div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Execute 10–15 min mobility and a 20–30 min outdoor walk. Consistency status maintained.
              </p>
            </div>
          )}

          {selectedReason === 'NORMAL_MISS' && (
            <div className="sys-section" style={{ padding: '14px', marginBottom: '16px', borderColor: '#ffffff' }}>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>UNAPPROVED MISS</div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Both training streak and consistency streak will reset. No XP awarded.
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Button variant="inverted" onClick={handleConfirm}>
              CONFIRM
            </Button>
            <Button variant="subtle" onClick={() => setSelectedReason(null)}>
              CHANGE REASON
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <p className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            WHY WAS TODAY'S MISSION NOT COMPLETED?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Button variant="outline" onClick={() => handleSelectReason('SICK')}>
              SICK
            </Button>
            <Button variant="outline" onClick={() => handleSelectReason('GYM_CLOSED')}>
              GYM CLOSED
            </Button>
            <Button variant="outline" onClick={() => handleSelectReason('COLLEGE_EXAM')}>
              COLLEGE EXAM
            </Button>
            <Button variant="outline" onClick={() => handleSelectReason('TRAVEL')}>
              TRAVEL
            </Button>
            <Button variant="outline" onClick={() => handleSelectReason('INJURY_PAIN')}>
              INJURY / PAIN
            </Button>
            <Button variant="outline" onClick={() => handleSelectReason('GENUINELY_UNAVOIDABLE')}>
              GENUINELY UNAVOIDABLE
            </Button>
            <Button variant="inverted" onClick={() => handleSelectReason('LOW_MOTIVATION')}>
              LOW MOTIVATION (10-MIN RULE)
            </Button>
            <Button variant="subtle" onClick={() => handleSelectReason('NORMAL_MISS')}>
              OTHER / NORMAL MISS
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
