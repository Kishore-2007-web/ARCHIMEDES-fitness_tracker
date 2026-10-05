import { UserBaseline, UserProfile } from '../types/auth';

export const DAY1_DEFAULT_BASELINE: UserBaseline = {
  bodyWeightKg: 109,
  waistIn: 44,
  maxPushUps: 3,
  maxPullUps: 0,
  maxPlankSec: 30,
  squatBestWeightKg: 80,
  squatBestReps: 8,
  benchBestWeightKg: 30,
  benchBestReps: 12,
  deadliftBestWeightKg: 80,
  deadliftBestReps: 8
};

export function createDefaultUserProfile(uid: string, displayName: string, email: string, photoURL?: string): UserProfile {
  return {
    uid,
    displayName: displayName || 'SYSTEM USER',
    email,
    photoURL: photoURL || '',
    challengeStart: '2026-10-07',
    challengeEnd: '2027-02-07',
    timezone: 'Asia/Kolkata',
    level: 1,
    xp: 0,
    rank: 'E',
    systemPower: 20,
    trainingStreak: 0,
    longestTrainingStreak: 0,
    consistencyStreak: 0,
    longestConsistencyStreak: 0,
    attributes: {
      strength: 20,
      endurance: 20,
      agility: 20,
      mobility: 20,
      discipline: 20,
      focus: 20
    },
    baseline: DAY1_DEFAULT_BASELINE,
    settings: {
      reminderEnabled: true,
      reminderTime: '17:30',
      reducedMotion: false
    },
    rewardTokens: 0,
    currentTitle: 'INITIATE',
    onboardingComplete: false,
    day1PhotosComplete: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
