import { ExceptionReason } from '../../types/workout';

export const BASE_XP_MAP: Record<number, number> = {
  1: 300, // Monday
  2: 200, // Tuesday
  3: 300, // Wednesday
  4: 200, // Thursday
  5: 300, // Friday
  6: 250, // Saturday
  0: 100  // Sunday
};

export const REDUCED_XP_MAP: Record<number, number> = {
  1: 180, // 60% of 300
  2: 120, // 60% of 200
  3: 180, // 60% of 300
  4: 120, // 60% of 200
  5: 180, // 60% of 300
  6: 150, // 60% of 250
  0: 60   // 60% of 100
};

export const DAILY_MISSION_XP = 25;
export const MINIMUM_VIABLE_DAY_XP = 75;

export const STREAK_MILESTONES: Record<number, number> = {
  7: 100,
  14: 150,
  30: 300,
  60: 500,
  90: 800,
  120: 1500,
  124: 1500
};

export interface XPCalculationResult {
  baseXP: number;
  bonusXP: number;
  dailyMissionXP: number;
  streakBonusXP: number;
  prBonusXP: number;
  bossBonusXP: number;
  totalXP: number;
  status: 'completed' | 'reduced' | 'exception' | 'missed';
  reason?: ExceptionReason;
  streakAction: 'increment' | 'pause' | 'reset';
  consistencyAction: 'increment' | 'maintain' | 'reset';
  unlockedMilestoneDay?: number;
}

/**
 * Calculates XP and streak state for a workout session or exception
 */
export function calculateSessionXP(params: {
  weekday: number;
  isCompleted: boolean;
  isReduced: boolean;
  dailyMissionCompleted: boolean;
  exceptionReason?: ExceptionReason;
  prBonusTotal?: number;
  bossBonusTotal?: number;
  currentTrainingStreak: number;
  currentConsistencyStreak: number;
  claimedStreakMilestones?: number[];
}): XPCalculationResult {
  const {
    weekday,
    isCompleted,
    isReduced,
    dailyMissionCompleted,
    exceptionReason,
    prBonusTotal = 0,
    bossBonusTotal = 0,
    currentConsistencyStreak,
    claimedStreakMilestones = []
  } = params;

  let baseXP = 0;
  let status: 'completed' | 'reduced' | 'exception' | 'missed' = 'completed';
  let streakAction: 'increment' | 'pause' | 'reset' = 'increment';
  let consistencyAction: 'increment' | 'maintain' | 'reset' = 'increment';

  // PR bonus is capped at 150 XP per session per spec Section 39
  const prBonusXP = Math.min(150, Math.max(0, prBonusTotal));
  const bossBonusXP = Math.max(0, bossBonusTotal);

  if (exceptionReason) {
    status = exceptionReason === 'NORMAL_MISS' ? 'missed' : 'exception';

    switch (exceptionReason) {
      case 'SICK':
        baseXP = 0;
        streakAction = 'pause';
        consistencyAction = 'maintain';
        break;
      case 'INJURY_PAIN':
        baseXP = 0;
        streakAction = 'pause';
        consistencyAction = 'maintain';
        break;
      case 'GYM_CLOSED':
        baseXP = MINIMUM_VIABLE_DAY_XP; // 75 XP
        streakAction = 'pause';
        consistencyAction = 'maintain';
        break;
      case 'COLLEGE_EXAM':
        baseXP = MINIMUM_VIABLE_DAY_XP; // 75 XP
        streakAction = 'pause';
        consistencyAction = 'maintain';
        break;
      case 'TRAVEL':
        baseXP = MINIMUM_VIABLE_DAY_XP; // 75 XP
        streakAction = 'pause';
        consistencyAction = 'maintain';
        break;
      case 'GENUINELY_UNAVOIDABLE':
        baseXP = MINIMUM_VIABLE_DAY_XP; // 75 XP
        streakAction = 'pause';
        consistencyAction = 'maintain';
        break;
      case 'LOW_MOTIVATION':
        if (isReduced) {
          baseXP = REDUCED_XP_MAP[weekday] ?? 120;
          status = 'reduced';
          streakAction = 'increment';
          consistencyAction = 'increment';
        } else {
          baseXP = BASE_XP_MAP[weekday] ?? 200;
          streakAction = 'increment';
          consistencyAction = 'increment';
        }
        break;
      case 'NORMAL_MISS':
      default:
        baseXP = 0;
        streakAction = 'reset';
        consistencyAction = 'reset';
        break;
    }
  } else if (isCompleted) {
    if (isReduced) {
      baseXP = REDUCED_XP_MAP[weekday] ?? 120;
      status = 'reduced';
    } else {
      baseXP = BASE_XP_MAP[weekday] ?? 200;
      status = 'completed';
    }
    streakAction = 'increment';
    consistencyAction = 'increment';
  } else {
    baseXP = 0;
    status = 'missed';
    streakAction = 'reset';
    consistencyAction = 'reset';
  }

  // Daily mission XP (only awarded on completed sessions, 0 on missed/pure sickness)
  const dailyMissionXP = dailyMissionCompleted && status !== 'missed' && exceptionReason !== 'SICK'
    ? DAILY_MISSION_XP
    : 0;

  // Streak bonus evaluation
  let streakBonusXP = 0;
  let unlockedMilestoneDay: number | undefined;

  if (consistencyAction === 'increment') {
    const newStreak = currentConsistencyStreak + 1;
    if (STREAK_MILESTONES[newStreak] && !claimedStreakMilestones.includes(newStreak)) {
      streakBonusXP = STREAK_MILESTONES[newStreak];
      unlockedMilestoneDay = newStreak;
    }
  }

  const bonusXP = dailyMissionXP + streakBonusXP + prBonusXP + bossBonusXP;
  const totalXP = baseXP + bonusXP;

  return {
    baseXP,
    bonusXP,
    dailyMissionXP,
    streakBonusXP,
    prBonusXP,
    bossBonusXP,
    totalXP,
    status,
    reason: exceptionReason,
    streakAction,
    consistencyAction,
    unlockedMilestoneDay
  };
}
