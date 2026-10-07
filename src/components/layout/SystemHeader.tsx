import React from 'react';
import { padDayNumber } from '../../lib/formatting/formatters';
import { TOTAL_CHALLENGE_DAYS } from '../../lib/dates/challengeDates';

interface SystemHeaderProps {
  dayNumber: number;
  formattedDate?: string;
  weekdayName?: string;
  systemStatus?: string;
  action?: React.ReactNode;
}

export const SystemHeader: React.FC<SystemHeaderProps> = ({
  dayNumber,
  formattedDate,
  weekdayName,
  action
}) => {
  return (
    <header className="sys-header" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '20px' }}>
      <div className="flex-between">
        <div>
          <div className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.22em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            ARCHIMEDES
          </div>
          <h1 className="font-mono" style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '0.04em', margin: '4px 0 2px 0' }}>
            DAY {padDayNumber(dayNumber)} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '18px' }}>/ {TOTAL_CHALLENGE_DAYS}</span>
          </h1>
          {(weekdayName || formattedDate) && (
            <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {weekdayName ? weekdayName : ''}{weekdayName && formattedDate ? ' · ' : ''}{formattedDate ? formattedDate.replace(/\s*\d{4}$/, '') : ''}
            </div>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  );
};
