import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { checkGoogleProviderStatus } from '../../lib/firebase/auth';
import { Button } from '../../components/common/Button';

export const LoginScreen: React.FC = () => {
  const {
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
    loginOfflineWithEmail,
    sendPasswordReset,
    enterAsOperator,
    loading,
    authError,
    clearAuthError
  } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [diagStatus, setDiagStatus] = useState<string | null>(null);
  const [isCheckingDiag, setIsCheckingDiag] = useState(false);

  const displayedError = localError || authError;

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setDiagStatus(null);
    clearAuthError();
    setResetSent(false);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setLocalError('Please enter an operator email address.');
      return;
    }
    if (!password) {
      setLocalError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }
      try {
        await signUpWithEmail(cleanEmail, password);
      } catch (err: any) {
        handleAuthError(err);
      }
    } else {
      try {
        await loginWithEmail(cleanEmail, password);
      } catch (err: any) {
        handleAuthError(err);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    setDiagStatus(null);
    clearAuthError();
    setResetSent(false);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  const handleAuthError = (err: any) => {
    console.error('Authentication attempt failed:', err);
    const code = err?.code || '';
    const message = err?.message || '';

    if (code === 'auth/configuration-not-found' || message.includes('configuration-not-found')) {
      setLocalError('auth/configuration-not-found');
    } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      setLocalError('Invalid email or password.');
    } else if (code === 'auth/email-already-in-use') {
      setLocalError('An account with this email already exists. Switch to SIGN IN.');
    } else if (code === 'auth/weak-password') {
      setLocalError('Password must be at least 6 characters long.');
    } else if (code === 'auth/invalid-email') {
      setLocalError('Please enter a valid email address.');
    } else if (code === 'auth/popup-closed-by-user') {
      setLocalError('Sign-in cancelled: popup was closed.');
    } else if (code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain')) {
      setLocalError('Unauthorized domain. Add localhost to Firebase Console -> Authentication -> Authorized domains.');
    } else {
      setLocalError(message || 'Authentication error.');
    }
  };

  const handleOfflineEmailEntry = () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setLocalError('Please enter an email address to use in offline mode.');
      return;
    }
    loginOfflineWithEmail(cleanEmail);
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setLocalError('Enter your email in the field above to receive a password reset link.');
      return;
    }
    setLocalError(null);
    try {
      await sendPasswordReset(cleanEmail);
      setResetSent(true);
    } catch (err: any) {
      handleAuthError(err);
    }
  };

  const handleRunDiagnostic = async () => {
    setIsCheckingDiag(true);
    try {
      const res = await checkGoogleProviderStatus();
      setDiagStatus(res.message);
    } catch (e: any) {
      setDiagStatus(e.message || 'Diagnostic test failed.');
    } finally {
      setIsCheckingDiag(false);
    }
  };

  const isConfigNotFound =
    displayedError === 'auth/configuration-not-found' ||
    (typeof displayedError === 'string' && displayedError.includes('configuration-not-found'));

  return (
    <div className="flex-center min-h-screen" style={{ padding: '24px 16px', backgroundColor: '#000000' }}>
      <div
        className="sys-section anim-scale-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          border: '1px solid #ffffff',
          padding: '28px 20px',
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
            margin: '14px 0 10px 0'
          }}
        >
          ARCHIMEDES
        </h1>

        <div className="sys-divider" />

        <div
          className="font-mono"
          style={{
            fontSize: '12px',
            letterSpacing: '0.1em',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            marginBottom: '20px'
          }}
        >
          07 OCT 2026 ↓ 07 FEB 2027
          <br />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>124 DAYS INCLUSIVE // ASIA/KOLKATA</span>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            border: '1px solid var(--border-medium)',
            marginBottom: '20px',
            backgroundColor: '#0a0a0a'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setLocalError(null);
            }}
            style={{
              padding: '10px 0',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: authMode === 'signin' ? 800 : 400,
              letterSpacing: '0.12em',
              background: authMode === 'signin' ? '#ffffff' : 'transparent',
              color: authMode === 'signin' ? '#000000' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setLocalError(null);
            }}
            style={{
              padding: '10px 0',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: authMode === 'signup' ? 800 : 400,
              letterSpacing: '0.12em',
              background: authMode === 'signup' ? '#ffffff' : 'transparent',
              color: authMode === 'signup' ? '#000000' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Error / Diagnostic Notice */}
        {displayedError && (
          <div
            className="font-mono anim-fade-in"
            style={{
              fontSize: '11px',
              marginBottom: '18px',
              padding: '12px 14px',
              border: '1px solid #ffffff',
              backgroundColor: '#0d0d0d',
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
                  Firebase returned <strong>CONFIGURATION_NOT_FOUND</strong>. The Authentication provider is not yet activated in Firebase Console for project <code>archimedes-fitness-tracker</code>.
                </p>

                <div
                  style={{
                    backgroundColor: '#161616',
                    border: '1px solid #333333',
                    padding: '10px',
                    margin: '8px 0',
                    fontSize: '11px'
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>ACTIVATE IN FIREBASE CONSOLE:</div>
                  1. Visit: <a
                    href="https://console.firebase.google.com/project/archimedes-fitness-tracker/authentication/providers"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#ffffff', textDecoration: 'underline', wordBreak: 'break-all' }}
                  >
                    console.firebase.google.com
                  </a>
                  <br />
                  2. Under <strong>Sign-in method</strong>, enable <strong>Email/Password</strong> and <strong>Google</strong>.
                  <br />
                  3. Save changes.
                </div>

                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleRunDiagnostic}
                    disabled={isCheckingDiag}
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
                    {isCheckingDiag ? 'TESTING...' : '[ TEST FIREBASE STATUS ]'}
                  </button>

                  <button
                    type="button"
                    onClick={handleOfflineEmailEntry}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #ffffff',
                      color: '#000000',
                      padding: '4px 10px',
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    [ ENTER OFFLINE WITH THIS EMAIL ]
                  </button>
                </div>

                {diagStatus && (
                  <div style={{ width: '100%', fontSize: '10px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    {diagStatus}
                  </div>
                )}
              </div>
            ) : (
              <div>{displayedError}</div>
            )}
          </div>
        )}

        {resetSent && (
          <div
            className="font-mono anim-fade-in"
            style={{
              fontSize: '11px',
              marginBottom: '16px',
              padding: '10px',
              border: '1px solid #ffffff',
              backgroundColor: '#0a0a0a',
              color: '#ffffff',
              textAlign: 'left'
            }}
          >
            ✓ Password reset instructions have been dispatched to your email address.
          </div>
        )}

        {/* Direct Email & Password Form */}
        <form onSubmit={handleEmailAuthSubmit} style={{ textAlign: 'left', marginBottom: '22px' }}>
          <div style={{ marginBottom: '14px' }}>
            <label className="sys-input-label" htmlFor="auth-email">
              OPERATOR EMAIL
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@system.archimedes"
              className="sys-input"
            />
          </div>

          <div style={{ marginBottom: authMode === 'signup' ? '14px' : '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="sys-input-label" htmlFor="auth-password" style={{ marginBottom: 0 }}>
                {authMode === 'signup' ? 'CREATE PASSWORD (MIN 6 CHARS)' : 'PASSWORD'}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  padding: '2px 4px'
                }}
              >
                {showPassword ? '[HIDE]' : '[SHOW]'}
              </button>
            </div>
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="sys-input"
              style={{ marginTop: '6px' }}
            />
          </div>

          {authMode === 'signup' && (
            <div style={{ marginBottom: '14px' }}>
              <label className="sys-input-label" htmlFor="auth-confirm-password">
                CONFIRM PASSWORD
              </label>
              <input
                id="auth-confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="sys-input"
              />
            </div>
          )}

          {authMode === 'signin' && (
            <div style={{ textAlign: 'right', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          <Button
            id="btn-email-submit"
            type="submit"
            variant="inverted"
            disabled={loading}
            style={{ width: '100%', minHeight: '48px', fontSize: '13px', fontWeight: 800, marginTop: '8px' }}
          >
            {loading
              ? 'AUTHENTICATING...'
              : authMode === 'signup'
              ? 'CREATE OPERATOR ACCOUNT'
              : 'ENTER SYSTEM'}
          </Button>
        </form>

        {/* Alternative Login Options Divider */}
        <div
          className="font-mono"
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            margin: '20px 0 14px 0',
            letterSpacing: '0.14em'
          }}
        >
          — OR ALTERNATIVE ACCESS —
        </div>

        {/* Continue with Google */}
        <button
          id="btn-google-login"
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%',
            minHeight: '46px',
            background: '#0d0d0d',
            border: '1px solid var(--border-medium)',
            color: '#ffffff',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '10px',
            transition: 'background-color 0.15s ease, border-color 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#ffffff';
            e.currentTarget.style.backgroundColor = '#161616';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-medium)';
            e.currentTarget.style.backgroundColor = '#0d0d0d';
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 800 }}>G</span>
          <span>CONTINUE WITH GOOGLE</span>
        </button>

        {/* Instant Operator Mode */}
        <button
          id="btn-operator-login"
          type="button"
          onClick={enterAsOperator}
          style={{
            width: '100%',
            minHeight: '44px',
            background: 'transparent',
            border: '1px dashed var(--border-medium)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#ffffff';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-medium)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          OPEN HOME (OPERATOR MODE)
        </button>

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
          PRIVATE PROGRESSION // ZERO SOCIAL // ZERO DATA LEAK
        </div>
      </div>
    </div>
  );
};
