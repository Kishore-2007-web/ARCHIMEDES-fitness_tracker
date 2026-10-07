import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  subscribeToAuthState,
  signInWithGoogle,
  signOutUser,
  checkRedirectResult,
  signInWithEmail,
  signUpWithEmail as signUpWithEmailFirebase,
  sendPasswordReset as sendPasswordResetFirebase
} from '../lib/firebase/auth';
import {
  getUserProfile,
  saveUserProfile,
  subscribeToUserProfile,
  deleteEntireAccount
} from '../lib/firebase/db';
import { deleteAllUserPhotos } from '../lib/firebase/storage';
import { createDefaultUserProfile } from '../data/baseline';
import { UserProfile } from '../types/auth';

function makeLocalUser(email: string, displayName?: string): User {
  const cleanEmail = email.trim().toLowerCase();
  const safeUid = 'operator-' + cleanEmail.replace(/[^a-z0-9]/g, '_').slice(0, 32);
  const name = displayName || cleanEmail.split('@')[0].toUpperCase();
  return {
    uid: safeUid,
    displayName: name,
    email: cleanEmail,
    photoURL: '',
    emailVerified: true,
    isAnonymous: true,
    metadata: {} as any,
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => '',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({})
  } as unknown as User;
}

const DEMO_OPERATOR_USER: User = makeLocalUser('operator@archimedes.system', 'ARCHIMEDES OPERATOR');

function getStoredProfileForUser(uid: string, displayName: string, email: string): UserProfile {
  try {
    const raw = localStorage.getItem(`archimedes_profile_${uid}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) return { ...parsed, onboardingComplete: true };
    }
  } catch {}
  const base = createDefaultUserProfile(uid, displayName, email);
  return {
    ...base,
    onboardingComplete: true,
    day1PhotosComplete: true,
    currentTitle: 'INITIATE',
    level: 1,
    xp: 0,
    rank: 'E',
    systemPower: 20
  };
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isOnline: boolean;
  isOperatorMode: boolean;
  authError: string | null;
  clearAuthError: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  loginOfflineWithEmail: (email: string) => void;
  sendPasswordReset: (email: string) => Promise<void>;
  enterAsOperator: () => void;
  logout: () => Promise<void>;
  updateProfileData: (partial: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isPreviouslyOperator = () => {
    try {
      return localStorage.getItem('archimedes_active_mode') === 'operator';
    } catch {
      return false;
    }
  };

  const getInitialOperatorUser = (): User | null => {
    if (!isPreviouslyOperator()) return null;
    try {
      const email = localStorage.getItem('archimedes_operator_email');
      if (email) return makeLocalUser(email);
    } catch {}
    return DEMO_OPERATOR_USER;
  };

  const getInitialOperatorProfile = (): UserProfile | null => {
    if (!isPreviouslyOperator()) return null;
    const user = getInitialOperatorUser();
    if (!user) return null;
    return getStoredProfileForUser(
      user.uid,
      user.displayName || 'ARCHIMEDES OPERATOR',
      user.email || 'operator@archimedes.system'
    );
  };

  const [currentUser, setCurrentUser] = useState<User | null>(getInitialOperatorUser);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(getInitialOperatorProfile);

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const clearAuthError = () => setAuthError(null);
  const [isOperatorMode, setIsOperatorMode] = useState<boolean>(isPreviouslyOperator);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync auth state with Firebase Auth
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    checkRedirectResult()
      .then((user) => {
        if (user) {
          setCurrentUser(user);
        }
      })
      .catch((err: any) => {
        console.warn('Redirect auth check notice:', err);
        if (err?.code === 'auth/configuration-not-found' || err?.message?.includes('configuration-not-found')) {
          setAuthError(
            'Google Sign-in is not yet enabled in Firebase Console for project "archimedes-fitness-tracker". Please activate it under Authentication → Sign-in method.'
          );
        } else if (err?.code && err.code !== 'auth/null-user') {
          setAuthError(err.message || 'Authentication error.');
        }
      });

    const unsubscribeAuth = subscribeToAuthState(async (user) => {
      if (user) {
        // Authenticated Firebase Google user
        try {
          localStorage.removeItem('archimedes_active_mode');
        } catch {}
        setIsOperatorMode(false);
        setCurrentUser(user);

        try {
          const profile = await getUserProfile(user.uid);
          if (!profile) {
            const initialProfile = createDefaultUserProfile(
              user.uid,
              user.displayName || 'ARCHIMEDES OPERATOR',
              user.email || '',
              user.photoURL || undefined
            );
            await saveUserProfile(initialProfile);
            setUserProfile(initialProfile);
          } else {
            setUserProfile(profile);
          }

          // Real-time Firestore sync
          unsubscribeProfile = subscribeToUserProfile(user.uid, (p) => {
            if (p) setUserProfile(p);
          });
        } catch (err) {
          console.error('Error loading user profile:', err);
        }
      } else {
        // No Firebase user signed in
        if (unsubscribeProfile) unsubscribeProfile();

        if (isPreviouslyOperator()) {
          const operatorUser = getInitialOperatorUser();
          const operatorProfile = getInitialOperatorProfile();
          setCurrentUser(operatorUser);
          setUserProfile(operatorProfile);
          setIsOperatorMode(true);
        } else {
          // Unauthenticated: present Login Screen
          setCurrentUser(null);
          setUserProfile(null);
          setIsOperatorMode(false);
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithEmail(email, pass);
    } catch (err: any) {
      console.error('Email login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      await signUpWithEmailFirebase(email, pass);
    } catch (err: any) {
      console.error('Email sign up error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginOfflineWithEmail = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = makeLocalUser(cleanEmail);
    try {
      localStorage.setItem('archimedes_active_mode', 'operator');
      localStorage.setItem('archimedes_operator_uid', user.uid);
      localStorage.setItem('archimedes_operator_email', cleanEmail);
    } catch {}
    setIsOperatorMode(true);
    setCurrentUser(user);
    const profile = getStoredProfileForUser(
      user.uid,
      cleanEmail.split('@')[0].toUpperCase(),
      cleanEmail
    );
    setUserProfile(profile);
    saveUserProfile(profile);
  };

  const sendPasswordReset = async (email: string) => {
    setAuthError(null);
    await sendPasswordResetFirebase(email);
  };

  const enterAsOperator = () => {
    try {
      localStorage.setItem('archimedes_active_mode', 'operator');
      localStorage.removeItem('archimedes_operator_email');
      localStorage.setItem('archimedes_operator_uid', DEMO_OPERATOR_USER.uid);
    } catch {}
    setIsOperatorMode(true);
    setCurrentUser(DEMO_OPERATOR_USER);
    const profile = getStoredProfileForUser(
      DEMO_OPERATOR_USER.uid,
      'ARCHIMEDES OPERATOR',
      'operator@archimedes.system'
    );
    setUserProfile(profile);
    saveUserProfile(profile);
  };

  const logout = async () => {
    setLoading(true);
    try {
      try {
        localStorage.removeItem('archimedes_active_mode');
        localStorage.removeItem('archimedes_operator_uid');
        localStorage.removeItem('archimedes_operator_email');
      } catch {}
      await signOutUser();
      setCurrentUser(null);
      setUserProfile(null);
      setIsOperatorMode(false);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (partial: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;
    const updated = { ...userProfile, ...partial, updatedAt: new Date().toISOString() };
    await saveUserProfile(updated);
    setUserProfile(updated);
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    setLoading(true);
    try {
      await deleteAllUserPhotos(uid);
      await deleteEntireAccount(uid);
      await signOutUser();
      try {
        localStorage.removeItem('archimedes_active_mode');
        localStorage.removeItem('archimedes_operator_uid');
        localStorage.removeItem('archimedes_operator_email');
      } catch {}
      setCurrentUser(null);
      setUserProfile(null);
      setIsOperatorMode(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isOnline,
        isOperatorMode,
        authError,
        clearAuthError,
        loginWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        loginOfflineWithEmail,
        sendPasswordReset,
        enterAsOperator,
        logout,
        updateProfileData,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
