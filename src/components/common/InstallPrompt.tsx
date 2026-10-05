import React, { useEffect, useState } from 'react';
import { Button } from './Button';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = localStorage.getItem('archimedes_pwa_dismissed');
    if (isDismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('archimedes_pwa_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="sys-section anim-scale-in"
      style={{
        border: '1px solid #ffffff',
        marginBottom: '16px',
        backgroundColor: 'var(--bg-surface)'
      }}
    >
      <div className="font-mono" style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.12em' }}>
        INSTALL ARCHIMEDES
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 14px 0' }}>
        Add ARCHIMEDES to your home screen for a faster, fullscreen system experience.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <Button variant="inverted" onClick={handleInstall}>
          INSTALL
        </Button>
        <Button variant="subtle" onClick={handleDismiss}>
          NOT NOW
        </Button>
      </div>
    </div>
  );
};
