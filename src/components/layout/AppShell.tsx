import React from 'react';
import { BottomNav, NavTab } from './BottomNav';
import { OfflineBanner } from './OfflineBanner';
import { useAuth } from '../../context/AuthContext';

interface AppShellProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ activeTab, onSelectTab, children }) => {
  const { isOnline, userProfile } = useAuth();
  const isReducedMotion = userProfile?.settings.reducedMotion ?? false;

  return (
    <div className={`min-h-screen bg-black text-white ${isReducedMotion ? 'reduced-motion' : ''}`}>
      <main className="sys-container">
        {!isOnline && <OfflineBanner />}
        {children}
      </main>
      <BottomNav activeTab={activeTab} onSelectTab={onSelectTab} />
    </div>
  );
};
