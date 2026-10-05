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

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isOnline: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (partial: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
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

  // Sync auth state
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = subscribeToAuthState(async (user) => {
      setCurrentUser(user);

      if (user) {
        // Fetch or create profile
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

          // Subscribe to real-time profile progression updates
          unsubscribeProfile = subscribeToUserProfile(user.uid, (p) => {
            if (p) setUserProfile(p);
          });
        } catch (err) {
          console.error('Error loading user profile:', err);
        }
      } else {
        if (unsubscribeProfile) unsubscribeProfile();
        setUserProfile(null);
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

  const logout = async () => {
    setLoading(true);
    try {
      await signOutUser();
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
        loginWithGoogle,
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
