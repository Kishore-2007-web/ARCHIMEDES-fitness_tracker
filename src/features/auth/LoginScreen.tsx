import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { checkGoogleProviderStatus } from '../../lib/firebase/auth';
import { Button } from '../../components/common/Button';

export const LoginScreen: React.FC = () => {
  const { loginWithGoogle, enterAsOperator, loading, authError, clearAuthError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const [diagStatus, setDiagStatus] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const displayedError = localError || authError;

  const handleLogin = async () => {
    setLocalError(null);
    setDiagStatus(null);
    clearAuthError();
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      if (err?.code === 'auth/configuration-not-found' || err?.message?.includes('configuration-not-found')) {
        setLocalError('auth/configuration-not-found');
      } else if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setLocalError('auth/unauthorized-domain');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setLocalError('Sign-in cancelled: The login popup was closed.');
      } else {
        setLocalError(err.message || 'Authentication error.');
      }
    }
  };

  const handleRunDiagnostic = async () => {
    setIsChecking(true);
    try {
      const res = await checkGoogleProviderStatus();
      setDiagStatus(res.message);
    } catch (e: any) {
      setDiagStatus(e.message || 'Diagnostic check failed.');
    } finally {
      setIsChecking(false);
    }
  };

  const isConfigNotFound = displayedError === 'auth/configuration-not-found' ||
    (typeof displayedError === 'string' && displayedError.includes('configuration-not-found'));

  return (
    <div className="flex-center min-h-screen" style={{ padding: '20px 16px', backgroundColor: '#000000' }}>
      <div
        className="sys-section anim-scale-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          border: '1px solid #ffffff',
          padding: '32px 20px',
          textAlign: 'center',
          backgroundColor: '#000000'
        }}
      >
        <div
          className="font-mono"
          style={{ fontSize: '11px', letterSpacing: '0.25em', color: 'var(--text-muted)' }}
        >
          PERSONAL PROGRESSION SYSTEM
        </div>

        <h1
          className="font-mono"
          style={{
            fontSize: '32px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            margin: '16px 0 10px 0'
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
            marginBottom: '24px'
          }}
        >
          07 OCT 2026
          <br />
          ↓
          <br />
          07 FEB 2027
          <br />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>124 DAYS INCLUSIVE // ASIA/KOLKATA</span>
        </div>

        {/* Diagnostics / Error Card */}
        {displayedError && (
          <div
            className="font-mono anim-fade-in"
            style={{
              fontSize: '11px',
              marginBottom: '20px',
              padding: '14px',
              border: '1px solid #ffffff',
              backgroundColor: '#0a0a0a',
              color: '#ffffff',
              lineHeight: 1.6,
              textAlign: 'left'
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: '6px', letterSpacing: '0.08em', fontSize: '12px' }}>
              ⚠ {isConfigNotFound ? 'FIREBASE SETUP REQUIRED' : 'AUTHENTICATION NOTICE'}
            </div>

            {isConfigNotFound ? (
              <div>
                <p style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)' }}>
                  Firebase returned <strong>CONFIGURATION_NOT_FOUND</strong>. Google Sign-In has not been enabled in the Firebase Console for project <code>archimedes-fitness-tracker</code>.
                </p>

                <div
                  style={{
                    backgroundColor: '#141414',
                    border: '1px solid #333333',
                    padding: '10px',
                    margin: '8px 0',
                    fontSize: '11px'
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>TO RESOLVE IN FIREBASE CONSOLE:</div>
                  1. Open: <a
                    href="https://console.firebase.google.com/project/archimedes-fitness-tracker/authentication/providers"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#ffffff', textDecoration: 'underline', wordBreak: 'break-all' }}
                  >
                    console.firebase.google.com (Auth Providers)
                  </a>
                  <br />
                  2. Click <strong>Get Started</strong> (or choose <strong>Google</strong> under Sign-in providers).
                  <br />
                  3. Toggle <strong>Enable</strong>, pick your <strong>Support email</strong>, and click <strong>Save</strong>.
                  <br />
                  4. Under <strong>Settings → Authorized domains</strong>, ensure <code>localhost</code> is present.
                </div>

                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleRunDiagnostic}
                    disabled={isChecking}
                    style={{
                      background: 'none',
                      border: '1px solid #ffffff',
                      color: '#ffffff',
                      padding: '4px 10px',
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      cursor: 'pointer'
                    }}
                  >
                    {isChecking ? 'CHECKING...' : '[ TEST FIREBASE STATUS ]'}
                  </button>
                  {diagStatus && (
                    <div style={{ width: '100%', fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {diagStatus}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>{displayedError}</div>
            )}
          </div>
        )}

        <Button
          id="btn-google-login"
          variant="inverted"
          onClick={handleLogin}
          disabled={loading}
          style={{ minHeight: '50px', fontSize: '14px', width: '100%' }}
        >
          {loading ? 'AUTHENTICATING...' : 'CONTINUE WITH GOOGLE'}
        </Button>

        <div
          className="font-mono"
          style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '16px 0 10px 0', letterSpacing: '0.12em' }}
        >
          — OR INSTANT DIRECT ACCESS —
        </div>

        <Button
          id="btn-operator-login"
          variant="outline"
          onClick={enterAsOperator}
          style={{ minHeight: '48px', fontSize: '13px', width: '100%' }}
        >
          OPEN HOME (OPERATOR MODE)
        </Button>

        <div
          className="font-mono"
          style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            marginTop: '8px',
            lineHeight: 1.4
          }}
        >
          Zero setup required · Full 124-day progression, workout logger, PRs & offline storage
        </div>

        <div
          className="font-mono"
          style={{
            fontSize: '10px',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            marginTop: '22px'
          }}
        >
          PRIVATE PROGRESSION // ZERO SOCIAL / ZERO DATA LEAK
        </div>
      </div>
    </div>
  );
};
