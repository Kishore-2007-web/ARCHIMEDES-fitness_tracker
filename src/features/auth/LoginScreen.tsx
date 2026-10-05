import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle, enterAsOperator, loading } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMsg(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err?.code === 'auth/configuration-not-found' || err?.message?.includes('configuration-not-found')) {
        setErrorMsg('CONFIG NOTICE: Google Sign-in provider is not enabled in Firebase Console. You can click "OPEN HOME" below to enter immediately in Operator mode.');
      } else if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setErrorMsg('UNAUTHORIZED DOMAIN: Add your current domain (e.g., localhost) to Firebase Console -> Authentication -> Settings -> Authorized domains.');
      } else if (err?.code === 'auth/operation-not-allowed') {
        setErrorMsg('PROVIDER DISABLED: Google Sign-in is not activated in Firebase Console for this project.');
      } else {
        setErrorMsg(err.message || 'Authentication error.');
      }
    }
  };

  return (
    <div className="flex-center min-h-screen" style={{ padding: '24px', backgroundColor: '#000000' }}>
      <div
        className="sys-section anim-scale-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          border: '1px solid #ffffff',
          padding: '36px 24px',
          textAlign: 'center',
          backgroundColor: '#000000'
        }}
      >
        <div
          className="font-mono"
          style={{ fontSize: '12px', letterSpacing: '0.25em', color: 'var(--text-muted)' }}
        >
          PERSONAL PROGRESSION SYSTEM
        </div>

        <h1
          className="font-mono"
          style={{
            fontSize: '32px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            margin: '18px 0 12px 0'
          }}
        >
          ARCHIMEDES
        </h1>

        <div className="sys-divider" />

        <div
          className="font-mono"
          style={{
            fontSize: '13px',
            letterSpacing: '0.1em',
            color: 'var(--text-secondary)',
            lineHeight: 1.8,
            marginBottom: '28px'
          }}
        >
          11 OCT 2026
          <br />
          ↓
          <br />
          07 FEB 2027
          <br />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>120 DAYS INCLUSIVE // ASIA/KOLKATA</span>
        </div>

        {errorMsg && (
          <div
            className="font-mono sys-alert-inverted"
            style={{ fontSize: '12px', marginBottom: '16px', padding: '10px' }}
          >
            {errorMsg}
          </div>
        )}

        <Button
          id="btn-google-login"
          variant="inverted"
          onClick={handleLogin}
          disabled={loading}
          style={{ minHeight: '50px', fontSize: '14px', width: '100%' }}
        >
          {loading ? 'INITIALIZING...' : 'CONTINUE WITH GOOGLE'}
        </Button>

        <div
          className="font-mono"
          style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '14px 0 10px 0', letterSpacing: '0.12em' }}
        >
          — OR DIRECT ACCESS —
        </div>

        <Button
          id="btn-operator-login"
          variant="outline"
          onClick={enterAsOperator}
          style={{ minHeight: '46px', fontSize: '13px', width: '100%' }}
        >
          OPEN HOME (OPERATOR MODE)
        </Button>

        <div
          className="font-mono"
          style={{
            fontSize: '10px',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            marginTop: '24px'
          }}
        >
          PRIVATE PROGRESSION // ZERO SOCIAL / ZERO DATA LEAK
        </div>
      </div>
    </div>
  );
};
