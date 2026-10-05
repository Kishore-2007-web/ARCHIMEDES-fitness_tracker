import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthState, signInWithGoogle, signOutUser } from '../lib/firebase/auth';
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
    onboardingComplete: true, // Instantly opens Home screen
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
  loginWithGoogle: () => Promise<void>;
  enterAsOperator: () => void;
  logout: () => Promise<void>;
  updateProfileData: (partial: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isExplicitlyLoggedOut, setIsExplicitlyLoggedOut] = useState(() => {
    try {
      return sessionStorage.getItem('archimedes_logged_out') === 'true';
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return isExplicitlyLoggedOut ? null : DEMO_OPERATOR_USER;
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    return isExplicitlyLoggedOut ? null : getStoredOperatorProfile();
  });

  const [loading, setLoading] = useState(false);
  const [isOperatorMode, setIsOperatorMode] = useState<boolean>(!isExplicitlyLoggedOut);
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

    const unsubscribeAuth = subscribeToAuthState(async (user) => {
      if (user) {
        // Authenticated Google user
        setIsOperatorMode(false);
        setCurrentUser(user);
        sessionStorage.removeItem('archimedes_logged_out');
        setIsExplicitlyLoggedOut(false);

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
        // No Firebase user logged in
        if (unsubscribeProfile) unsubscribeProfile();

        const loggedOut = sessionStorage.getItem('archimedes_logged_out') === 'true';
        if (loggedOut) {
          setCurrentUser(null);
          setUserProfile(null);
          setIsOperatorMode(false);
        } else {
          // Default to Operator mode so the home screen opens immediately
          const operatorProfile = getStoredOperatorProfile();
          setCurrentUser(DEMO_OPERATOR_USER);
          setUserProfile(operatorProfile);
          setIsOperatorMode(true);
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
      sessionStorage.removeItem('archimedes_logged_out');
    } catch {}
    setIsExplicitlyLoggedOut(false);
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
        sessionStorage.setItem('archimedes_logged_out', 'true');
      } catch {}
      setIsExplicitlyLoggedOut(true);
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
      sessionStorage.setItem('archimedes_logged_out', 'true');
      setIsExplicitlyLoggedOut(true);
      setCurrentUser(null);
      setUserProfile(null);
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
