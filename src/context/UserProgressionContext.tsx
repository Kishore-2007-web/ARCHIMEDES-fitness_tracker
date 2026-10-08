import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { ActiveSession, CompletedSession, ExceptionReason, LoggedSet, DetectedPR } from '../types/workout';
import {
  getChallengeDay,
  ChallengeDayInfo,
  getDateStringForDayNumber
} from '../lib/dates/challengeDates';
import {
  getActiveSession,
  saveActiveSession,
  subscribeToActiveSession,
  getCompletedSessions
} from '../lib/firebase/db';
import { finalizeWorkoutSession } from '../lib/firebase/functions';

interface RestTimerState {
  isActive: boolean;
  secondsRemaining: number;
  totalDuration: number;
  targetEndTime: number | null;
}

interface UserProgressionContextType {
  challengeDay: ChallengeDayInfo;
  selectedDayNumber: number;
  setSelectedDayNumber: (day: number) => void;
  completedDays: number[];
  recentlyCompletedDay: number | null;
  markDayCompleted: (day: number) => void;
  toggleDayCompletion: (day: number) => void;
  activeSession: ActiveSession | null;
  loadingSession: boolean;
  restTimer: RestTimerState;
  startRestTimer: (durationSeconds?: number) => void;
  addRestTimerSeconds: (seconds?: number) => void;
  skipRestTimer: () => void;
  pauseRestTimer: () => void;
  resetRestTimer: () => void;
  startWorkoutSession: (dateStr?: string) => Promise<void>;
  logExerciseSet: (exerciseId: string, set: LoggedSet) => Promise<void>;
  updateBlockState: (block: 'preparationComplete' | 'recoveryComplete' | 'walkingComplete', val: boolean) => Promise<void>;
  setDailyMissionStatus: (status: 'pending' | 'completed') => Promise<void>;
  finalizeCurrentSession: (options?: { isReduced?: boolean; exceptionReason?: ExceptionReason }) => Promise<void>;
  // Overlays
  xpRevealData: {
    visible: boolean;
    session: CompletedSession | null;
    prs: DetectedPR[];
  };
  closeXPReveal: () => void;
  levelUpData: {
    visible: boolean;
    prevLevel: number;
    newLevel: number;
  };
  closeLevelUp: () => void;
}

const UserProgressionContext = createContext<UserProgressionContextType | undefined>(undefined);

export const UserProgressionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile, isOnline } = useAuth();

  // Challenge day resolution
  const [challengeDay] = useState<ChallengeDayInfo>(() => getChallengeDay());
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(() => {
    const today = getChallengeDay();
    return today.isInsideChallenge ? today.dayNumber : 1;
  });

  // Dynamic Completed Days State (Default [1, 2] completed as per challenge state)
  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('archimedes_completed_days');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [1, 2];
  });

  const [recentlyCompletedDay, setRecentlyCompletedDay] = useState<number | null>(null);

  // Sync completed days to local storage
  useEffect(() => {
    try {
      localStorage.setItem('archimedes_completed_days', JSON.stringify(completedDays));
    } catch {}
  }, [completedDays]);

  // Sync with Firestore completed sessions if available
  useEffect(() => {
    if (!currentUser) return;
    getCompletedSessions(currentUser.uid)
      .then((sessions) => {
        if (sessions && sessions.length > 0) {
          const sessionDays = sessions.filter((s) => s.status === 'completed').map((s) => s.dayNumber);
          setCompletedDays((prev) => {
            const merged = Array.from(new Set([...prev, ...sessionDays])).sort((a, b) => a - b);
            return merged;
          });
        }
      })
      .catch(() => {});
  }, [currentUser]);

  const markDayCompleted = (day: number) => {
    setCompletedDays((prev) => {
      if (prev.includes(day)) return prev;
      return [...prev, day].sort((a, b) => a - b);
    });
    setRecentlyCompletedDay(day);
    window.setTimeout(() => {
      setRecentlyCompletedDay((current) => (current === day ? null : current));
    }, 600);
  };

  const toggleDayCompletion = (day: number) => {
    setCompletedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }
      return [...prev, day].sort((a, b) => a - b);
    });
    setRecentlyCompletedDay(day);
    window.setTimeout(() => {
      setRecentlyCompletedDay((current) => (current === day ? null : current));
    }, 600);
  };

  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(false);

  // Overlays
  const [xpRevealData, setXpRevealData] = useState<{
    visible: boolean;
    session: CompletedSession | null;
    prs: DetectedPR[];
  }>({ visible: false, session: null, prs: [] });

  const [levelUpData, setLevelUpData] = useState<{
    visible: boolean;
    prevLevel: number;
    newLevel: number;
  }>({ visible: false, prevLevel: 1, newLevel: 1 });

  // Rest Timer State (Timestamp-based to survive backgrounding on Android OPPO A54)
  const [restTimer, setRestTimer] = useState<RestTimerState>({
    isActive: false,
    secondsRemaining: 180,
    totalDuration: 180,
    targetEndTime: null
  });

  const timerIntervalRef = useRef<number | null>(null);

  // Keep rest timer running via requestAnimationFrame / interval check against target timestamp
  useEffect(() => {
    if (!restTimer.isActive || !restTimer.targetEndTime) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((restTimer.targetEndTime! - now) / 1000));

      setRestTimer((prev) => ({
        ...prev,
        secondsRemaining: remaining,
        isActive: remaining > 0
      }));

      if (remaining <= 0 && timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }, 500);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [restTimer.isActive, restTimer.targetEndTime]);

  const startRestTimer = (durationSeconds = 180) => {
    const target = Date.now() + durationSeconds * 1000;
    setRestTimer({
      isActive: true,
      secondsRemaining: durationSeconds,
      totalDuration: durationSeconds,
      targetEndTime: target
    });
  };

  const addRestTimerSeconds = (seconds = 30) => {
    setRestTimer((prev) => {
      const currentRemaining = prev.targetEndTime
        ? Math.max(0, Math.ceil((prev.targetEndTime - Date.now()) / 1000))
        : prev.secondsRemaining;
      const newRemaining = currentRemaining + seconds;
      const target = Date.now() + newRemaining * 1000;
      return {
        ...prev,
        isActive: true,
        secondsRemaining: newRemaining,
        totalDuration: prev.totalDuration + seconds,
        targetEndTime: target
      };
    });
  };

  const skipRestTimer = () => {
    setRestTimer((prev) => ({
      ...prev,
      isActive: false,
      secondsRemaining: 0,
      targetEndTime: null
    }));
  };

  const pauseRestTimer = () => {
    setRestTimer((prev) => ({
      ...prev,
      isActive: false,
      targetEndTime: null
    }));
  };

  const resetRestTimer = () => {
    setRestTimer({
      isActive: false,
      secondsRemaining: 180,
      totalDuration: 180,
      targetEndTime: null
    });
  };

  // Sync active workout session for currently selected challenge day
  useEffect(() => {
    if (!currentUser) {
      setActiveSession(null);
      return;
    }

    const targetDate = getDateStringForDayNumber(selectedDayNumber);
    setLoadingSession(true);

    const unsubscribe = subscribeToActiveSession(currentUser.uid, targetDate, (session) => {
      setActiveSession(session);
      setLoadingSession(false);
    });

    return () => unsubscribe();
  }, [currentUser, selectedDayNumber]);

  // Start or resume workout session online
  const startWorkoutSession = async (dateStr?: string) => {
    if (!currentUser) return;
    const targetDate = dateStr || getDateStringForDayNumber(selectedDayNumber);
    const dayInfo = getChallengeDay(targetDate);

    const existing = await getActiveSession(currentUser.uid, targetDate);
    if (existing) {
      setActiveSession(existing);
      return;
    }

    const newSession: ActiveSession = {
      date: targetDate,
      dayNumber: dayInfo.dayNumber,
      scheduleId: dayInfo.scheduleId,
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      exercises: {},
      blocks: {
        preparationComplete: false,
        recoveryComplete: false,
        walkingComplete: false
      },
      dailyMissionStatus: 'pending'
    };

    await saveActiveSession(currentUser.uid, targetDate, newSession);
    setActiveSession(newSession);
  };

  // Log single completed set in Firestore online
  const logExerciseSet = async (exerciseId: string, set: LoggedSet) => {
    if (!currentUser || !activeSession) return;

    const currentSets = activeSession.exercises[exerciseId]?.sets || [];
    const updatedSets = [...currentSets, set];

    const updatedSession: ActiveSession = {
      ...activeSession,
      exercises: {
        ...activeSession.exercises,
        [exerciseId]: { sets: updatedSets }
      }
    };

    setActiveSession(updatedSession);
    await saveActiveSession(currentUser.uid, activeSession.date, updatedSession);
  };

  const updateBlockState = async (
    block: 'preparationComplete' | 'recoveryComplete' | 'walkingComplete',
    val: boolean
  ) => {
    if (!currentUser || !activeSession) return;
    const updatedSession: ActiveSession = {
      ...activeSession,
      blocks: {
        ...activeSession.blocks,
        [block]: val
      }
    };
    setActiveSession(updatedSession);
    await saveActiveSession(currentUser.uid, activeSession.date, updatedSession);
  };

  const setDailyMissionStatus = async (status: 'pending' | 'completed') => {
    if (!currentUser || !activeSession) return;
    const updatedSession: ActiveSession = {
      ...activeSession,
      dailyMissionStatus: status
    };
    setActiveSession(updatedSession);
    await saveActiveSession(currentUser.uid, activeSession.date, updatedSession);
  };

  const finalizeCurrentSession = async (options: { isReduced?: boolean; exceptionReason?: ExceptionReason } = {}) => {
    if (!currentUser || !userProfile || !activeSession) return;

    if (!isOnline) {
      throw new Error('CONNECTION REQUIRED: ARCHIMEDES requires an active connection to safely save progression.');
    }

    const result = await finalizeWorkoutSession({
      uid: currentUser.uid,
      userProfile,
      activeSession,
      exceptionReason: options.exceptionReason,
      isReduced: options.isReduced
    });

    setActiveSession(null);
    markDayCompleted(activeSession.dayNumber);

    // Trigger sequential XP reveal overlay
    setXpRevealData({
      visible: true,
      session: result.completedSession,
      prs: result.prs
    });

    // Trigger Level-up overlay if leveled up
    if (result.leveledUp) {
      setLevelUpData({
        visible: true,
        prevLevel: result.previousLevel,
        newLevel: result.newLevel
      });
    }
  };

  const closeXPReveal = () => {
    setXpRevealData((prev) => ({ ...prev, visible: false }));
  };

  const closeLevelUp = () => {
    setLevelUpData((prev) => ({ ...prev, visible: false }));
  };

  return (
    <UserProgressionContext.Provider
      value={{
        challengeDay,
        selectedDayNumber,
        setSelectedDayNumber,
        completedDays,
        recentlyCompletedDay,
        markDayCompleted,
        toggleDayCompletion,
        activeSession,
        loadingSession,
        restTimer,
        startRestTimer,
        addRestTimerSeconds,
        skipRestTimer,
        pauseRestTimer,
        resetRestTimer,
        startWorkoutSession,
        logExerciseSet,
        updateBlockState,
        setDailyMissionStatus,
        finalizeCurrentSession,
        xpRevealData,
        closeXPReveal,
        levelUpData,
        closeLevelUp
      }}
    >
      {children}
    </UserProgressionContext.Provider>
  );
};

export function useUserProgression() {
  const context = useContext(UserProgressionContext);
  if (!context) {
    throw new Error('useUserProgression must be used within a UserProgressionProvider');
  }
  return context;
}
