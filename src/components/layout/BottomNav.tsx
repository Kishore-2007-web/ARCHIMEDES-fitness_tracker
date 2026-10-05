import React from 'react';

export type NavTab = 'system' | 'quest' | 'stats' | 'progress' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav className="sys-bottom-nav" aria-label="System Navigation">
      <button
        type="button"
        id="nav-system"
        className={`sys-nav-item ${activeTab === 'system' ? 'active' : ''}`}
        onClick={() => onSelectTab('system')}
        aria-current={activeTab === 'system' ? 'page' : undefined}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="3" x2="12" y2="7" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <line x1="3" y1="12" x2="7" y2="12" />
          <line x1="17" y1="12" x2="21" y2="12" />
        </svg>
        <span>SYSTEM</span>
      </button>

      <button
        type="button"
        id="nav-quest"
        className={`sys-nav-item ${activeTab === 'quest' ? 'active' : ''}`}
        onClick={() => onSelectTab('quest')}
        aria-current={activeTab === 'quest' ? 'page' : undefined}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15 8.5 22 9.5 17 14.5 18.5 21.5 12 18 5.5 21.5 7 14.5 2 9.5 9 8.5 12 2" />
        </svg>
        <span>QUEST</span>
      </button>

      <button
        type="button"
        id="nav-stats"
        className={`sys-nav-item ${activeTab === 'stats' ? 'active' : ''}`}
        onClick={() => onSelectTab('stats')}
        aria-current={activeTab === 'stats' ? 'page' : undefined}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <span>STATS</span>
      </button>

      <button
        type="button"
        id="nav-progress"
        className={`sys-nav-item ${activeTab === 'progress' ? 'active' : ''}`}
        onClick={() => onSelectTab('progress')}
        aria-current={activeTab === 'progress' ? 'page' : undefined}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <span>PROGRESS</span>
      </button>

      <button
        type="button"
        id="nav-profile"
        className={`sys-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onSelectTab('profile')}
        aria-current={activeTab === 'profile' ? 'page' : undefined}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>PROFILE</span>
      </button>
    </nav>
  );
};
