import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSystemEvents } from '../../lib/firebase/db';
import { SystemEvent } from '../../types/events';

export const SystemEventsFeed: React.FC = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    getSystemEvents(currentUser.uid, 5)
      .then((data) => setEvents(data))
      .catch((err) => console.warn('Could not fetch events:', err))
      .finally(() => setLoading(false));
  }, [currentUser]);

  if (loading) {
    return (
      <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
        SCANNING LOGS...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
        SYSTEM INITIALIZED // NO EVENT LOGS RECORDED
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {events.map((ev) => (
        <div
          key={ev.id}
          style={{
            borderLeft: '2px solid #ffffff',
            paddingLeft: '10px',
            paddingTop: '2px',
            paddingBottom: '2px'
          }}
        >
          <div className="flex-between font-mono" style={{ fontSize: '10px' }}>
            <span style={{ fontWeight: 700, letterSpacing: '0.1em' }}>{ev.title}</span>
            <span style={{ color: 'var(--text-muted)' }}>
              {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {ev.detail}
          </div>
        </div>
      ))}
    </div>
  );
};
