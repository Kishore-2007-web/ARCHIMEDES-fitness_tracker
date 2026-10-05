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

/**
 * User Profile Firestore Service
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const ref = doc(db, 'users', profile.uid);
  await setDoc(ref, { ...profile, updatedAt: new Date().toISOString() }, { merge: true });
}

export function subscribeToUserProfile(uid: string, callback: (profile: UserProfile | null) => void) {
  const ref = doc(db, 'users', uid);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as UserProfile);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn('Profile sync warning:', err.message);
      callback(null);
    }
  );
}

/**
 * Active Workout Session Firestore Service
 */
export async function getActiveSession(uid: string, dateKey: string): Promise<ActiveSession | null> {
  const ref = doc(db, 'users', uid, 'activeSessions', dateKey);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as ActiveSession;
}

export async function saveActiveSession(uid: string, dateKey: string, session: ActiveSession): Promise<void> {
  const ref = doc(db, 'users', uid, 'activeSessions', dateKey);
  await setDoc(ref, session, { merge: true });
}

export async function removeActiveSession(uid: string, dateKey: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'activeSessions', dateKey);
  await deleteDoc(ref);
}

export function subscribeToActiveSession(
  uid: string,
  dateKey: string,
  callback: (session: ActiveSession | null) => void
) {
  const ref = doc(db, 'users', uid, 'activeSessions', dateKey);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as ActiveSession);
      } else {
        callback(null);
      }
    },
    () => callback(null)
  );
}

/**
 * Completed Sessions (One-time fetch)
 */
export async function getCompletedSessions(uid: string): Promise<CompletedSession[]> {
  const colRef = collection(db, 'users', uid, 'sessions');
  const q = query(colRef, orderBy('dayNumber', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as CompletedSession);
}

export async function saveCompletedSession(uid: string, session: CompletedSession): Promise<void> {
  const ref = doc(db, 'users', uid, 'sessions', session.id);
  await setDoc(ref, session);
}

/**
 * Exercise Records (Historical Logs & PR Archive)
 */
export async function getExerciseHistory(
  uid: string,
  exerciseId?: string,
  limitCount = 20
): Promise<ExerciseHistoricalRecord[]> {
  const colRef = collection(db, 'users', uid, 'exerciseRecords');
  let q = query(colRef, orderBy('date', 'desc'), limit(limitCount));

  if (exerciseId) {
    q = query(colRef, where('exerciseId', '==', exerciseId), orderBy('date', 'desc'), limit(limitCount));
  }

  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ExerciseHistoricalRecord);
}

export async function addExerciseRecord(uid: string, record: ExerciseHistoricalRecord): Promise<void> {
  const ref = doc(db, 'users', uid, 'exerciseRecords', record.id);
  await setDoc(ref, record);
}

/**
 * Achievements & Bosses
 */
export async function getAchievements(uid: string): Promise<Achievement[]> {
  const colRef = collection(db, 'users', uid, 'achievements');
  const snap = await getDocs(colRef);
  return snap.docs.map((d) => d.data() as Achievement);
}

export async function saveAchievement(uid: string, ach: Achievement): Promise<void> {
  const ref = doc(db, 'users', uid, 'achievements', ach.id);
  await setDoc(ref, ach, { merge: true });
}

export async function getBosses(uid: string): Promise<BossQuest[]> {
  const colRef = collection(db, 'users', uid, 'bosses');
  const q = query(colRef, orderBy('dayNumber', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as BossQuest);
}

export async function saveBoss(uid: string, boss: BossQuest): Promise<void> {
  const ref = doc(db, 'users', uid, 'bosses', boss.id);
  await setDoc(ref, boss, { merge: true });
}

/**
 * System Events Feed
 */
export async function getSystemEvents(uid: string, limitCount = 50): Promise<SystemEvent[]> {
  const colRef = collection(db, 'users', uid, 'events');
  const q = query(colRef, orderBy('timestamp', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as SystemEvent);
}

export async function addSystemEvent(uid: string, event: SystemEvent): Promise<void> {
  const ref = doc(db, 'users', uid, 'events', event.id);
  await setDoc(ref, event);
}

/**
 * Progress Checkpoints & Measurements
 */
export async function getProgressCheckpoints(uid: string): Promise<Record<string, ProgressCheckpoint>> {
  const colRef = collection(db, 'users', uid, 'progressCheckpoints');
  const snap = await getDocs(colRef);
  const map: Record<string, ProgressCheckpoint> = {};
  snap.docs.forEach((d) => {
    map[d.id] = d.data() as ProgressCheckpoint;
  });
  return map;
}

export async function saveProgressCheckpoint(uid: string, cp: ProgressCheckpoint): Promise<void> {
  const ref = doc(db, 'users', uid, 'progressCheckpoints', cp.checkpointId);
  await setDoc(ref, cp, { merge: true });
}

/**
 * Reports
 */
export async function getWeeklyReports(uid: string): Promise<WeeklyReport[]> {
  const colRef = collection(db, 'users', uid, 'reports');
  const q = query(colRef, orderBy('weekNumber', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as WeeklyReport);
}

export async function saveWeeklyReport(uid: string, report: WeeklyReport): Promise<void> {
  const ref = doc(db, 'users', uid, 'reports', report.id);
  await setDoc(ref, report);
}

export async function getMilestoneReports(uid: string): Promise<MilestoneReport[]> {
  const colRef = collection(db, 'users', uid, 'milestoneReports');
  const snap = await getDocs(colRef);
  return snap.docs.map((d) => d.data() as MilestoneReport);
}

export async function saveMilestoneReport(uid: string, report: MilestoneReport): Promise<void> {
  const ref = doc(db, 'users', uid, 'milestoneReports', report.id);
  await setDoc(ref, report);
}

/**
 * Reward Vault
 */
export async function getCustomRewards(uid: string): Promise<RewardItem[]> {
  const colRef = collection(db, 'users', uid, 'rewards');
  const snap = await getDocs(colRef);
  return snap.docs.map((d) => d.data() as RewardItem);
}

export async function saveRewardItem(uid: string, item: RewardItem): Promise<void> {
  const ref = doc(db, 'users', uid, 'rewards', item.id);
  await setDoc(ref, item);
}

export async function deleteRewardItem(uid: string, id: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'rewards', id);
  await deleteDoc(ref);
}

export async function getRewardTransactions(uid: string): Promise<RewardTransaction[]> {
  const colRef = collection(db, 'users', uid, 'rewardTransactions');
  const q = query(colRef, orderBy('timestamp', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as RewardTransaction);
}

export async function addRewardTransaction(uid: string, tx: RewardTransaction): Promise<void> {
  const ref = doc(db, 'users', uid, 'rewardTransactions', tx.id);
  await setDoc(ref, tx);
}

/**
 * Complete Account Deletion
 */
export async function deleteEntireAccount(uid: string): Promise<void> {
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
}
