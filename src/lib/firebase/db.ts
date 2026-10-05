import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import { UserProfile } from '../../types/auth';
import { ActiveSession, CompletedSession } from '../../types/workout';
import { ExerciseHistoricalRecord, ProgressCheckpoint } from '../../types/progress';
import { Achievement, BossQuest, RewardItem, RewardTransaction } from '../../types/gamification';
import { SystemEvent } from '../../types/events';
import { WeeklyReport, MilestoneReport } from '../../types/reports';
import { SYSTEM_BOSSES } from '../../data/bosses';
import { INITIAL_ACHIEVEMENTS } from '../../data/achievements';
import { DEFAULT_REWARDS } from '../../data/titles';

// Safe LocalStorage helpers for offline & operator mode
function localGet<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(key);
    if (!val) return defaultValue;
    return JSON.parse(val) as T;
  } catch {
    return defaultValue;
  }
}

function localSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/**
 * User Profile Firestore & LocalStorage Service
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const localVal = localGet<UserProfile | null>(`archimedes_profile_${uid}`, null);
  if (uid.startsWith('operator')) return localVal;

  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return localVal;
    const data = snap.data() as UserProfile;
    localSet(`archimedes_profile_${uid}`, data);
    return data;
  } catch {
    return localVal;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  localSet(`archimedes_profile_${profile.uid}`, profile);
  if (profile.uid.startsWith('operator')) return;

  try {
    const ref = doc(db, 'users', profile.uid);
    await setDoc(ref, { ...profile, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Profile saved locally (offline mode active):', err);
  }
}

export function subscribeToUserProfile(uid: string, callback: (profile: UserProfile | null) => void) {
  if (uid.startsWith('operator')) {
    callback(localGet<UserProfile | null>(`archimedes_profile_${uid}`, null));
    return () => {};
  }

  try {
    const ref = doc(db, 'users', uid);
    return onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          localSet(`archimedes_profile_${uid}`, data);
          callback(data);
        } else {
          callback(localGet<UserProfile | null>(`archimedes_profile_${uid}`, null));
        }
      },
      (err) => {
        console.warn('Profile sync fallback to local storage:', err.message);
        callback(localGet<UserProfile | null>(`archimedes_profile_${uid}`, null));
      }
    );
  } catch {
    callback(localGet<UserProfile | null>(`archimedes_profile_${uid}`, null));
    return () => {};
  }
}

/**
 * Active Workout Session Firestore & LocalStorage Service
 */
export async function getActiveSession(uid: string, dateKey: string): Promise<ActiveSession | null> {
  const localVal = localGet<ActiveSession | null>(`archimedes_active_${uid}_${dateKey}`, null);
  if (uid.startsWith('operator')) return localVal;

  try {
    const ref = doc(db, 'users', uid, 'activeSessions', dateKey);
    const snap = await getDoc(ref);
    if (!snap.exists()) return localVal;
    const data = snap.data() as ActiveSession;
    localSet(`archimedes_active_${uid}_${dateKey}`, data);
    return data;
  } catch {
    return localVal;
  }
}

export async function saveActiveSession(uid: string, dateKey: string, session: ActiveSession): Promise<void> {
  localSet(`archimedes_active_${uid}_${dateKey}`, session);
  if (uid.startsWith('operator')) return;

  try {
    const ref = doc(db, 'users', uid, 'activeSessions', dateKey);
    await setDoc(ref, session, { merge: true });
  } catch (err) {
    console.warn('Active session cached locally:', err);
  }
}

export async function removeActiveSession(uid: string, dateKey: string): Promise<void> {
  try {
    localStorage.removeItem(`archimedes_active_${uid}_${dateKey}`);
  } catch {}
  if (uid.startsWith('operator')) return;

  try {
    const ref = doc(db, 'users', uid, 'activeSessions', dateKey);
    await deleteDoc(ref);
  } catch {}
}

export function subscribeToActiveSession(
  uid: string,
  dateKey: string,
  callback: (session: ActiveSession | null) => void
) {
  if (uid.startsWith('operator')) {
    callback(localGet<ActiveSession | null>(`archimedes_active_${uid}_${dateKey}`, null));
    return () => {};
  }

  try {
    const ref = doc(db, 'users', uid, 'activeSessions', dateKey);
    return onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as ActiveSession;
          localSet(`archimedes_active_${uid}_${dateKey}`, data);
          callback(data);
        } else {
          callback(localGet<ActiveSession | null>(`archimedes_active_${uid}_${dateKey}`, null));
        }
      },
      () => callback(localGet<ActiveSession | null>(`archimedes_active_${uid}_${dateKey}`, null))
    );
  } catch {
    callback(localGet<ActiveSession | null>(`archimedes_active_${uid}_${dateKey}`, null));
    return () => {};
  }
}

/**
 * Completed Sessions (One-time fetch)
 */
export async function getCompletedSessions(uid: string): Promise<CompletedSession[]> {
  const localList = localGet<CompletedSession[]>(`archimedes_sessions_${uid}`, []);
  if (uid.startsWith('operator')) return localList;

  try {
    const colRef = collection(db, 'users', uid, 'sessions');
    const q = query(colRef, orderBy('dayNumber', 'asc'));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => d.data() as CompletedSession);
    if (list.length > 0) {
      localSet(`archimedes_sessions_${uid}`, list);
      return list;
    }
    return localList;
  } catch {
    return localList;
  }
}

export async function saveCompletedSession(uid: string, session: CompletedSession): Promise<void> {
  const current = localGet<CompletedSession[]>(`archimedes_sessions_${uid}`, []);
  const updated = [...current.filter((s) => s.id !== session.id), session];
  localSet(`archimedes_sessions_${uid}`, updated);
  if (uid.startsWith('operator')) return;

  try {
    const ref = doc(db, 'users', uid, 'sessions', session.id);
    await setDoc(ref, session);
  } catch (err) {
    console.warn('Completed session saved locally:', err);
  }
}

/**
 * Exercise Records (Historical Logs & PR Archive)
 */
export async function getExerciseHistory(
  uid: string,
  exerciseId?: string,
  limitCount = 20
): Promise<ExerciseHistoricalRecord[]> {
  const localList = localGet<ExerciseHistoricalRecord[]>(`archimedes_exercises_${uid}`, []);
  const filtered = exerciseId ? localList.filter((e) => e.exerciseId === exerciseId) : localList;
  if (uid.startsWith('operator')) return filtered.slice(0, limitCount);

  try {
    const colRef = collection(db, 'users', uid, 'exerciseRecords');
    let q = query(colRef, orderBy('date', 'desc'), limit(limitCount));

    if (exerciseId) {
      q = query(colRef, where('exerciseId', '==', exerciseId), orderBy('date', 'desc'), limit(limitCount));
    }

    const snap = await getDocs(q);
    const list = snap.docs.map((d) => d.data() as ExerciseHistoricalRecord);
    return list.length > 0 ? list : filtered.slice(0, limitCount);
  } catch {
    return filtered.slice(0, limitCount);
  }
}

export async function addExerciseRecord(uid: string, record: ExerciseHistoricalRecord): Promise<void> {
  const current = localGet<ExerciseHistoricalRecord[]>(`archimedes_exercises_${uid}`, []);
  localSet(`archimedes_exercises_${uid}`, [record, ...current]);
  if (uid.startsWith('operator')) return;

  try {
    const ref = doc(db, 'users', uid, 'exerciseRecords', record.id);
    await setDoc(ref, record);
  } catch {}
}

/**
 * Achievements & Bosses
 */
export async function getAchievements(uid: string): Promise<Achievement[]> {
  const localList = localGet<Achievement[]>(`archimedes_achievements_${uid}`, INITIAL_ACHIEVEMENTS);
  if (uid.startsWith('operator')) return localList;

  try {
    const colRef = collection(db, 'users', uid, 'achievements');
    const snap = await getDocs(colRef);
    if (snap.empty) return localList;
    return snap.docs.map((d) => d.data() as Achievement);
  } catch {
    return localList;
  }
}

export async function saveAchievement(uid: string, ach: Achievement): Promise<void> {
  const current = localGet<Achievement[]>(`archimedes_achievements_${uid}`, INITIAL_ACHIEVEMENTS);
  const updated = current.map((a) => (a.id === ach.id ? ach : a));
  localSet(`archimedes_achievements_${uid}`, updated);
  if (uid.startsWith('operator')) return;

  try {
    const ref = doc(db, 'users', uid, 'achievements', ach.id);
    await setDoc(ref, ach, { merge: true });
  } catch {}
}

export async function getBosses(uid: string): Promise<BossQuest[]> {
  const localList = localGet<BossQuest[]>(`archimedes_bosses_${uid}`, SYSTEM_BOSSES);
  if (uid.startsWith('operator')) return localList;

  try {
    const colRef = collection(db, 'users', uid, 'bosses');
    const q = query(colRef, orderBy('dayNumber', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) return localList;
    return snap.docs.map((d) => d.data() as BossQuest);
  } catch {
    return localList;
  }
}

export async function saveBoss(uid: string, boss: BossQuest): Promise<void> {
  const current = localGet<BossQuest[]>(`archimedes_bosses_${uid}`, SYSTEM_BOSSES);
  const updated = current.map((b) => (b.id === boss.id ? boss : b));
  localSet(`archimedes_bosses_${uid}`, updated);
  if (uid.startsWith('operator')) return;

  try {
    const ref = doc(db, 'users', uid, 'bosses', boss.id);
    await setDoc(ref, boss, { merge: true });
  } catch {}
}

/**
 * System Events Feed
 */
export async function getSystemEvents(uid: string, limitCount = 50): Promise<SystemEvent[]> {
  const initialEvents: SystemEvent[] = [
    {
      id: 'event-init-0',
      type: 'CHECKPOINT_REACHED',
      title: 'OPERATOR PROTOCOL INITIALIZED',
      detail: 'ARCHIMEDES Personal Progression System is operational. Day 1 calibration active.',
      timestamp: new Date().toISOString()
    }
  ];
  const localList = localGet<SystemEvent[]>(`archimedes_events_${uid}`, initialEvents);
  if (uid.startsWith('operator')) return localList.slice(0, limitCount);

  try {
    const colRef = collection(db, 'users', uid, 'events');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    if (snap.empty) return localList.slice(0, limitCount);
    return snap.docs.map((d) => d.data() as SystemEvent);
  } catch {
    return localList.slice(0, limitCount);
  }
}

export async function addSystemEvent(uid: string, event: SystemEvent): Promise<void> {
  const current = localGet<SystemEvent[]>(`archimedes_events_${uid}`, []);
  localSet(`archimedes_events_${uid}`, [event, ...current]);
  if (uid.startsWith('operator')) return;

  try {
    const ref = doc(db, 'users', uid, 'events', event.id);
    await setDoc(ref, event);
  } catch {}
}

/**
 * Progress Checkpoints & Measurements
 */
export async function getProgressCheckpoints(uid: string): Promise<Record<string, ProgressCheckpoint>> {
  const localMap = localGet<Record<string, ProgressCheckpoint>>(`archimedes_checkpoints_${uid}`, {});
  if (uid.startsWith('operator')) return localMap;

  try {
    const colRef = collection(db, 'users', uid, 'progressCheckpoints');
    const snap = await getDocs(colRef);
    if (snap.empty) return localMap;
    const map: Record<string, ProgressCheckpoint> = {};
    snap.docs.forEach((d) => {
      map[d.id] = d.data() as ProgressCheckpoint;
    });
    return map;
  } catch {
    return localMap;
  }
}

export async function saveProgressCheckpoint(uid: string, cp: ProgressCheckpoint): Promise<void> {
  const current = localGet<Record<string, ProgressCheckpoint>>(`archimedes_checkpoints_${uid}`, {});
  current[cp.checkpointId] = cp;
  localSet(`archimedes_checkpoints_${uid}`, current);
  if (uid.startsWith('operator')) return;

  try {
    const ref = doc(db, 'users', uid, 'progressCheckpoints', cp.checkpointId);
    await setDoc(ref, cp, { merge: true });
  } catch {}
}

/**
 * Reports
 */
export async function getWeeklyReports(uid: string): Promise<WeeklyReport[]> {
  const localList = localGet<WeeklyReport[]>(`archimedes_weekly_${uid}`, []);
  if (uid.startsWith('operator')) return localList;

  try {
    const colRef = collection(db, 'users', uid, 'reports');
    const q = query(colRef, orderBy('weekNumber', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) return localList;
    return snap.docs.map((d) => d.data() as WeeklyReport);
  } catch {
    return localList;
  }
}

export async function saveWeeklyReport(uid: string, report: WeeklyReport): Promise<void> {
  const current = localGet<WeeklyReport[]>(`archimedes_weekly_${uid}`, []);
  const updated = [...current.filter((r) => r.id !== report.id), report];
  localSet(`archimedes_weekly_${uid}`, updated);
  if (uid.startsWith('operator')) return;

  try {
    const ref = doc(db, 'users', uid, 'reports', report.id);
    await setDoc(ref, report);
  } catch {}
}

export async function getMilestoneReports(uid: string): Promise<MilestoneReport[]> {
  const localList = localGet<MilestoneReport[]>(`archimedes_milestones_${uid}`, []);
  if (uid.startsWith('operator')) return localList;

  try {
    const colRef = collection(db, 'users', uid, 'milestoneReports');
    const snap = await getDocs(colRef);
    if (snap.empty) return localList;
    return snap.docs.map((d) => d.data() as MilestoneReport);
  } catch {
    return localList;
  }
}

export async function saveMilestoneReport(uid: string, report: MilestoneReport): Promise<void> {
  const current = localGet<MilestoneReport[]>(`archimedes_milestones_${uid}`, []);
  const updated = [...current.filter((r) => r.id !== report.id), report];
  localSet(`archimedes_milestones_${uid}`, updated);
  if (uid.startsWith('operator')) return;

  try {
    const ref = doc(db, 'users', uid, 'milestoneReports', report.id);
    await setDoc(ref, report);
  } catch {}
}

/**
 * Reward Vault
 */
export async function getCustomRewards(uid: string): Promise<RewardItem[]> {
  const localList = localGet<RewardItem[]>(`archimedes_rewards_${uid}`, DEFAULT_REWARDS);
  if (uid.startsWith('operator')) return localList;

  try {
    const colRef = collection(db, 'users', uid, 'rewards');
    const snap = await getDocs(colRef);
    if (snap.empty) return localList;
    return snap.docs.map((d) => d.data() as RewardItem);
  } catch {
    return localList;
  }
}

export async function saveRewardItem(uid: string, item: RewardItem): Promise<void> {
  const current = localGet<RewardItem[]>(`archimedes_rewards_${uid}`, DEFAULT_REWARDS);
  const updated = [...current.filter((r) => r.id !== item.id), item];
  localSet(`archimedes_rewards_${uid}`, updated);
  if (uid.startsWith('operator')) return;

  try {
    const ref = doc(db, 'users', uid, 'rewards', item.id);
    await setDoc(ref, item);
  } catch {}
}

export async function deleteRewardItem(uid: string, id: string): Promise<void> {
  const current = localGet<RewardItem[]>(`archimedes_rewards_${uid}`, DEFAULT_REWARDS);
  localSet(`archimedes_rewards_${uid}`, current.filter((r) => r.id !== id));
  if (uid.startsWith('operator')) return;

  try {
    const ref = doc(db, 'users', uid, 'rewards', id);
    await deleteDoc(ref);
  } catch {}
}

export async function getRewardTransactions(uid: string): Promise<RewardTransaction[]> {
  const localList = localGet<RewardTransaction[]>(`archimedes_reward_txs_${uid}`, []);
  if (uid.startsWith('operator')) return localList;

  try {
    const colRef = collection(db, 'users', uid, 'rewardTransactions');
    const q = query(colRef, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) return localList;
    return snap.docs.map((d) => d.data() as RewardTransaction);
  } catch {
    return localList;
  }
}

export async function addRewardTransaction(uid: string, tx: RewardTransaction): Promise<void> {
  const current = localGet<RewardTransaction[]>(`archimedes_reward_txs_${uid}`, []);
  localSet(`archimedes_reward_txs_${uid}`, [tx, ...current]);
  if (uid.startsWith('operator')) return;

  try {
    const ref = doc(db, 'users', uid, 'rewardTransactions', tx.id);
    await setDoc(ref, tx);
  } catch {}
}

/**
 * Complete Account Deletion
 */
export async function deleteEntireAccount(uid: string): Promise<void> {
  // Clear all local storage records
  const keysToRemove = [
    `archimedes_profile_${uid}`,
    `archimedes_sessions_${uid}`,
    `archimedes_exercises_${uid}`,
    `archimedes_achievements_${uid}`,
    `archimedes_bosses_${uid}`,
    `archimedes_events_${uid}`,
    `archimedes_checkpoints_${uid}`,
    `archimedes_weekly_${uid}`,
    `archimedes_milestones_${uid}`,
    `archimedes_rewards_${uid}`,
    `archimedes_reward_txs_${uid}`
  ];
  keysToRemove.forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch {}
  });

  if (uid.startsWith('operator')) return;

  try {
    const subcollections = [
      'activeSessions',
      'sessions',
      'exerciseRecords',
      'measurements',
      'achievements',
      'bosses',
      'rewards',
      'rewardTransactions',
      'events',
      'reports',
      'milestoneReports',
      'progressCheckpoints'
    ];

    for (const colName of subcollections) {
      const colRef = collection(db, 'users', uid, colName);
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.docs.forEach((docSnap) => batch.delete(docSnap.ref));
        await batch.commit();
      }
    }

    // Delete root user document
    await deleteDoc(doc(db, 'users', uid));
  } catch (err) {
    console.warn('Firestore account deletion warning:', err);
  }
}
