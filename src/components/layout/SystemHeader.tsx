import React from 'react';
import { padDayNumber } from '../../lib/formatting/formatters';

interface SystemHeaderProps {
  dayNumber: number;
  formattedDate: string;
  systemStatus?: string;
  action?: React.ReactNode;
}

export const SystemHeader: React.FC<SystemHeaderProps> = ({
  dayNumber,
  formattedDate,
  systemStatus = 'SYSTEM ONLINE',
  action
}) => {
  return (
    <header className="sys-header flex-between">
      <div>
        <div className="flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
          <span className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
            ARCHIMEDES // OS
          </span>
          <span className="sys-tag" style={{ fontSize: '9px', padding: '1px 5px' }}>
            {systemStatus}
          </span>
        </div>
        <h1 className="font-mono" style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.08em', marginTop: '4px' }}>
          DAY {padDayNumber(dayNumber)} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ 120</span>
        </h1>
        <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
          {formattedDate}
        </div>
      </div>
      {action && <div>{action}</div>}
    </header>
  );
};
