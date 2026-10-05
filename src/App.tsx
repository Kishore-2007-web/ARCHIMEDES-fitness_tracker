import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAuth } from './context/AuthContext';
import { useUserProgression } from './context/UserProgressionContext';
import { AppShell } from './components/layout/AppShell';
import { NavTab } from './components/layout/BottomNav';
import { LoginScreen } from './features/auth/LoginScreen';
import { OnboardingScreen } from './features/auth/OnboardingScreen';
import { SystemScreen } from './features/system/SystemScreen';
import { QuestScreen } from './features/quest/QuestScreen';
import { XPRevealOverlay } from './components/overlays/XPRevealOverlay';
import { LevelUpOverlay } from './components/overlays/LevelUpOverlay';

// Lazy-loaded secondary views for low-end mobile performance
const StatsScreen = lazy(() => import('./features/stats/StatsScreen').then(m => ({ default: m.StatsScreen })));
const ProgressScreen = lazy(() => import('./features/progress/ProgressScreen').then(m => ({ default: m.ProgressScreen })));
const ProfileScreen = lazy(() => import('./features/profile/ProfileScreen').then(m => ({ default: m.ProfileScreen })));

export const AppContent: React.FC = () => {
  const { currentUser, userProfile, loading } = useAuth();
  const { xpRevealData, closeXPReveal, levelUpData, closeLevelUp } = useUserProgression();

  // Route / Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    const path = window.location.pathname.replace('/', '') as NavTab;
    if (['system', 'quest', 'stats', 'progress', 'profile'].includes(path)) {
      return path;
    }
    return 'system';
  });

  // Sync browser URL
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace('/', '') as NavTab;
      if (['system', 'quest', 'stats', 'progress', 'profile'].includes(path)) {
        setActiveTab(path);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    window.history.pushState({}, '', `/${tab}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (loading) {
    return (
      <div className="flex-center min-h-screen bg-black font-mono text-center">
        <div>
          <div style={{ fontSize: '11px', letterSpacing: '0.25em', color: 'var(--text-muted)' }}>
            ARCHIMEDES // OS
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '8px' }}>
            INITIALIZING SYSTEM...
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated screen
  if (!currentUser) {
    return <LoginScreen />;
  }

  // Mandatory Onboarding Screen
  if (!userProfile?.onboardingComplete) {
    return <OnboardingScreen />;
  }

  return (
    <AppShell activeTab={activeTab} onSelectTab={handleSelectTab}>
      {activeTab === 'system' && <SystemScreen onNavigateToQuest={() => handleSelectTab('quest')} />}
      {activeTab === 'quest' && <QuestScreen />}
      <Suspense fallback={<div className="font-mono text-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>LOADING MODULE...</div>}>
        {activeTab === 'stats' && <StatsScreen />}
        {activeTab === 'progress' && <ProgressScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </Suspense>

      {/* Global Event Overlays */}
      <XPRevealOverlay
        isOpen={xpRevealData.visible}
        session={xpRevealData.session}
        prs={xpRevealData.prs}
        onClose={closeXPReveal}
      />

      <LevelUpOverlay
        isOpen={levelUpData.visible}
        prevLevel={levelUpData.prevLevel}
        newLevel={levelUpData.newLevel}
        onClose={closeLevelUp}
      />
    </AppShell>
  );
};
