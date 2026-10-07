import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthState, signInWithGoogle, signOutUser, checkRedirectResult } from '../lib/firebase/auth';
import {
  getUserProfile,
  saveUserProfile,
  subscribeToUserProfile,
  deleteEntireAccount
} from '../lib/firebase/db';
import { deleteAllUserPhotos } from '../lib/firebase/storage';
import { createDefaultUserProfile } from '../data/baseline';
import { UserProfile } from '../types/auth';

const DEMO_OPERATOR_USER: User = {
  uid: 'operator-001',
  displayName: 'ARCHIMEDES OPERATOR',
  email: 'operator@archimedes.system',
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

function createDefaultOperatorProfile(): UserProfile {
  const base = createDefaultUserProfile(
    'operator-001',
    'ARCHIMEDES OPERATOR',
    'operator@archimedes.system'
  );
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

function getStoredOperatorProfile(): UserProfile {
  try {
    const raw = localStorage.getItem('archimedes_profile_operator-001');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) return { ...parsed, onboardingComplete: true };
    }
  } catch {}
  return createDefaultOperatorProfile();
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
  enterAsOperator: () => void;
  logout: () => Promise<void>;
  updateProfileData: (partial: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if user previously explicitly selected Operator mode in this browser
  const isPreviouslyOperator = () => {
    try {
      return localStorage.getItem('archimedes_active_mode') === 'operator';
    } catch {
      return false;
    }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (isPreviouslyOperator()) {
      return DEMO_OPERATOR_USER;
    }
    return null;
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    if (isPreviouslyOperator()) {
      return getStoredOperatorProfile();
    }
    return null;
  });

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
          const operatorProfile = getStoredOperatorProfile();
          setCurrentUser(DEMO_OPERATOR_USER);
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
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const enterAsOperator = () => {
    try {
      localStorage.setItem('archimedes_active_mode', 'operator');
    } catch {}
    setIsOperatorMode(true);
    setCurrentUser(DEMO_OPERATOR_USER);
    const profile = getStoredOperatorProfile();
    setUserProfile(profile);
    saveUserProfile(profile);
  };

  const logout = async () => {
    setLoading(true);
    try {
      try {
        localStorage.removeItem('archimedes_active_mode');
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
