import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './config';

/**
 * Initiates Google Login.
 * Uses popup by default; only falls back to redirect if popup is blocked by browser policy.
 */
export async function signInWithGoogle(): Promise<User | null> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase configuration missing. Please check VITE_FIREBASE_* variables in .env');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}

/**
 * Initiates Email & Password Login.
 */
export async function signInWithEmail(email: string, pass: string): Promise<User> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase configuration missing. Please check VITE_FIREBASE_* variables in .env');
  }
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return result.user;
}

/**
 * Registers new user with Email & Password.
 */
export async function signUpWithEmail(email: string, pass: string): Promise<User> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase configuration missing. Please check VITE_FIREBASE_* variables in .env');
  }
  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  return result.user;
}

/**
 * Sends Password Reset Email.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase configuration missing. Please check VITE_FIREBASE_* variables in .env');
  }
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Checks for pending redirect result after returning from Google auth redirect.
 */
export async function checkRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    return result ? result.user : null;
  } catch (error) {
    console.warn('Redirect auth check notice:', error);
    throw error;
  }
}

/**
 * Diagnostics helper: checks if Google Provider is activated on the Firebase project.
 */
export async function checkGoogleProviderStatus(): Promise<{ enabled: boolean; message: string }> {
  try {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    if (!apiKey) return { enabled: false, message: 'Missing VITE_FIREBASE_API_KEY in .env' };

    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId: 'google.com',
        continueUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'
      })
    });

    const data = await res.json();
    if (res.ok) {
      return { enabled: true, message: 'Google Sign-in is verified and ENABLED in Firebase Console.' };
    }

    if (data?.error?.message === 'CONFIGURATION_NOT_FOUND') {
      return {
        enabled: false,
        message: 'CONFIGURATION_NOT_FOUND: Google Sign-in provider is not yet enabled in Firebase Console for this project.'
      };
    }

    return {
      enabled: false,
      message: data?.error?.message || 'Firebase Auth error.'
    };
  } catch (e: any) {
    return { enabled: false, message: e.message || 'Network check failed.' };
  }
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
