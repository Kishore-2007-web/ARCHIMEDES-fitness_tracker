import { httpsCallable } from 'firebase/functions';
import { functions } from './config';
import { ActiveSession, CompletedSession, ExceptionReason, DetectedPR } from '../../types/workout';
import { UserProfile } from '../../types/auth';
import { BossQuest, Achievement } from '../../types/gamification';
import { SystemEvent } from '../../types/events';
import { calculateSessionXP } from '../progression/xpCalculations';
import { calculateLevelFromXP } from '../progression/levelCalculations';
import { evaluateAllSessionPRs } from '../progression/prCalculations';
import { calculateAttributeGains, applyAttributeGains, calculateSystemPower } from '../progression/attributeCalculations';
import { evaluateBossQuests } from '../progression/bossEvaluator';
import { evaluateAchievements } from '../progression/achievementEvaluator';
import { evaluateRandomRewardToken } from '../progression/rewardTokenGenerator';
import { WORKOUT_SCHEDULE } from '../../data/workoutSchedule';
import {
  saveCompletedSession,
  removeActiveSession,
  saveUserProfile,
  addExerciseRecord,
  saveBoss,
  saveAchievement,
  addSystemEvent,
  addRewardTransaction,
  getCompletedSessions,
  getBosses,
  getAchievements,
  getExerciseHistory
} from './db';

export interface FinalizeSessionParams {
  uid: string;
  userProfile: UserProfile;
  activeSession: ActiveSession;
  exceptionReason?: ExceptionReason;
  isReduced?: boolean;
}

export interface FinalizeSessionResult {
  completedSession: CompletedSession;
  updatedProfile: UserProfile;
  prs: DetectedPR[];
  unlockedBosses: BossQuest[];
  unlockedAchievements: Achievement[];
  leveledUp: boolean;
  previousLevel: number;
  newLevel: number;
  rewardTokenGranted: boolean;
  systemEvents: SystemEvent[];
}

/**
 * Authoritative Session Finalization
 * Executes server-side Cloud Function if available, otherwise executes
 * authoritative client logic and commits transactions to Firestore.
 */
export async function finalizeWorkoutSession(
  params: FinalizeSessionParams
): Promise<FinalizeSessionResult> {
  const { uid, userProfile, activeSession, exceptionReason, isReduced = false } = params;

  // 1. Try calling Cloud Function
  try {
    const cloudFn = httpsCallable<{ params: FinalizeSessionParams }, FinalizeSessionResult>(
      functions,
      'finalizeSession'
    );
    const result = await cloudFn({ params });
    if (result.data) {
      return result.data;
    }
  } catch (err: any) {
    // If functions not deployed or network fallback, execute authoritative local logic
    console.info('Using local authoritative progression evaluator:', err.message);
  }

  // 2. Authoritative evaluation
  const dayNumber = activeSession.dayNumber;
  const weekday = new Date(activeSession.date + 'T00:00:00Z').getUTCDay();
  const scheduleDay = WORKOUT_SCHEDULE[weekday];

  // Retrieve prior data for PR & achievement evaluation
  const [priorSessions, priorBosses, priorAchievements, historicalRecords] = await Promise.all([
    getCompletedSessions(uid),
    getBosses(uid),
    getAchievements(uid),
    getExerciseHistory(uid, undefined, 50)
  ]);

  // Evaluate PRs
  const exerciseDefs: Record<string, { name: string; metricType: string }> = {};
  scheduleDay.exercises.forEach((ex) => {
    exerciseDefs[ex.id] = { name: ex.name, metricType: ex.metricType };
  });

  const prResult = evaluateAllSessionPRs({
    exercises: activeSession.exercises,
    exerciseDefinitions: exerciseDefs,
    historicalRecords,
    baseline: userProfile.baseline
  });

  // Evaluate Bosses
  const bossResult = evaluateBossQuests({
    bosses: priorBosses,
    dayNumber,
    currentStreak: userProfile.trainingStreak,
    todayExercises: activeSession.exercises,
    completedSessions: priorSessions
  });

  // Evaluate XP
  const isCompleted = activeSession.status === 'completed' || !exceptionReason;
  const isDailyMissionCompleted = activeSession.dailyMissionStatus === 'completed';

  const xpResult = calculateSessionXP({
    weekday,
    isCompleted,
    isReduced,
    dailyMissionCompleted: isDailyMissionCompleted,
    exceptionReason,
    prBonusTotal: prResult.totalPRBonusXP,
    bossBonusTotal: bossResult.totalBossXP,
    currentTrainingStreak: userProfile.trainingStreak,
    currentConsistencyStreak: userProfile.consistencyStreak,
    claimedStreakMilestones: []
  });

  // Evaluate Controlled Random Reward Token
  const rewardTokenResult = evaluateRandomRewardToken({
    tokensEarnedThisWeek: 0, // In standard session
    consecutiveSessionsWithoutToken: 1,
    isCompletedFullSession: isCompleted && !isReduced && !exceptionReason
  });

  // Total XP update & Level calculations
  const newTotalXP = userProfile.xp + xpResult.totalXP;
  const prevLevelInfo = calculateLevelFromXP(userProfile.xp);
  const newLevelInfo = calculateLevelFromXP(newTotalXP);
  const leveledUp = newLevelInfo.level > prevLevelInfo.level;

  // Streak adjustments
  let newTrainingStreak = userProfile.trainingStreak;
  let newConsistencyStreak = userProfile.consistencyStreak;

  if (xpResult.streakAction === 'increment') {
    newTrainingStreak += 1;
  } else if (xpResult.streakAction === 'reset') {
    newTrainingStreak = 0;
  }

  if (xpResult.consistencyAction === 'increment') {
    newConsistencyStreak += 1;
  } else if (xpResult.consistencyAction === 'reset') {
    newConsistencyStreak = 0;
  }

  const longestTrainingStreak = Math.max(userProfile.longestTrainingStreak, newTrainingStreak);
  const longestConsistencyStreak = Math.max(userProfile.longestConsistencyStreak, newConsistencyStreak);

  // Attribute Gains
  const attributeGains = calculateAttributeGains({
    weekday,
    status: xpResult.status,
    prCount: prResult.prs.length,
    bossBonusAttribute: bossResult.attributeBonus
  });

  const updatedAttributes = applyAttributeGains(userProfile.attributes, attributeGains);

  // System Power & Rank
  const totalCompletedCount = priorSessions.length + (isCompleted ? 1 : 0);
  const completionRate = Math.min(100, Math.round((totalCompletedCount / Math.max(1, dayNumber)) * 100));
  const consistencyRate = Math.min(100, Math.round((newConsistencyStreak / Math.max(1, dayNumber)) * 100));

  const { systemPower, rank } = calculateSystemPower({
    attributes: updatedAttributes,
    consistencyScore: consistencyRate,
    completionScore: completionRate,
    performanceProgress: Math.min(100, 20 + prResult.prs.length * 5),
    bossScore: Math.min(100, bossResult.completedBosses.length * 25)
  });

  // Assemble immutable completed session
  let totalSets = 0;
  let totalVolume = 0;
  for (const log of Object.values(activeSession.exercises)) {
    totalSets += log.sets.length;
    for (const set of log.sets) {
      if ((set.weightKg ?? 0) > 0 && (set.reps ?? 0) > 0) {
        totalVolume += (set.weightKg ?? 0) * (set.reps ?? 0);
      }
    }
  }

  const sessionId = `session_${activeSession.date}`;
  const completedSession: CompletedSession = {
    id: sessionId,
    date: activeSession.date,
    dayNumber: activeSession.dayNumber,
    scheduleId: activeSession.scheduleId,
    weekday,
    status: xpResult.status,
    reason: exceptionReason,
    baseXP: xpResult.baseXP,
    bonusXP: xpResult.bonusXP,
    totalXP: xpResult.totalXP,
    dailyMissionCompleted: isDailyMissionCompleted,
    performanceBonus: prResult.totalPRBonusXP,
    streakBonus: xpResult.streakBonusXP,
    bossBonus: bossResult.totalBossXP,
    randomRewardTokenGranted: rewardTokenResult.granted,
    prs: prResult.prs,
    totalSets,
    totalVolume,
    completedAt: new Date().toISOString()
  };

  // Evaluate Achievements
  const achievementResult = evaluateAchievements({
    currentAchievements: priorAchievements,
    completedSessions: priorSessions,
    todaySession: completedSession,
    todayExercises: activeSession.exercises,
    consistencyStreak: newConsistencyStreak,
    completedBossIds: bossResult.completedBosses.map((b) => b.id)
  });

  // Calculate Tokens
  const tokensAdded = (rewardTokenResult.granted ? 1 : 0) + bossResult.totalBossTokens;
  const newRewardTokens = userProfile.rewardTokens + tokensAdded;

  // New Title Unlock
  let newCurrentTitle = userProfile.currentTitle;
  if (bossResult.unlockedTitles.length > 0) {
    newCurrentTitle = bossResult.unlockedTitles[0];
  }

  const updatedProfile: UserProfile = {
    ...userProfile,
    xp: newTotalXP + achievementResult.totalAchievementXP,
    level: calculateLevelFromXP(newTotalXP + achievementResult.totalAchievementXP).level,
    rank,
    systemPower,
    trainingStreak: newTrainingStreak,
    longestTrainingStreak,
    consistencyStreak: newConsistencyStreak,
    longestConsistencyStreak,
    attributes: updatedAttributes,
    rewardTokens: newRewardTokens,
    currentTitle: newCurrentTitle,
    updatedAt: new Date().toISOString()
  };

  // Create System Events
  const systemEvents: SystemEvent[] = [];
  const nowTs = new Date().toISOString();

  systemEvents.push({
    id: `ev_session_${Date.now()}`,
    type: 'SESSION_COMPLETE',
    title: 'SESSION FINALIZED',
    detail: `Earned +${completedSession.totalXP} XP. Status: ${completedSession.status.toUpperCase()}`,
    timestamp: nowTs
  });

  if (prResult.prs.length > 0) {
    for (const pr of prResult.prs) {
      systemEvents.push({
        id: `ev_pr_${Date.now()}_${pr.exerciseId}`,
        type: 'PR_DETECTED',
        title: `PR DETECTED // ${pr.exerciseName.toUpperCase()}`,
        detail: `New ${pr.type} Record: ${pr.newValue} (+${pr.xpAwarded} XP)`,
        timestamp: nowTs
      });
    }
  }

  if (leveledUp) {
    systemEvents.push({
      id: `ev_lvl_${Date.now()}`,
      type: 'LEVEL_UP',
      title: 'SYSTEM LEVEL INCREASE',
      detail: `Level ${prevLevelInfo.level} → ${newLevelInfo.level}`,
      timestamp: nowTs
    });
  }

  for (const b of bossResult.completedBosses) {
    systemEvents.push({
      id: `ev_boss_${Date.now()}_${b.id}`,
      type: 'BOSS_COMPLETE',
      title: `BOSS DEFEATED // ${b.title}`,
      detail: `Earned +${b.reward.xp} XP and system accolades.`,
      timestamp: nowTs
    });
  }

  for (const ach of achievementResult.newlyUnlocked) {
    systemEvents.push({
      id: `ev_ach_${Date.now()}_${ach.id}`,
      type: 'ACHIEVEMENT_UNLOCKED',
      title: `ACHIEVEMENT // ${ach.title}`,
      detail: ach.description,
      timestamp: nowTs
    });
  }

  if (rewardTokenResult.granted) {
    systemEvents.push({
      id: `ev_tok_${Date.now()}`,
      type: 'REWARD_TOKEN',
      title: 'SYSTEM REWARD // TOKEN ACQUIRED',
      detail: 'Reward token +1 added to Vault.',
      timestamp: nowTs
    });
  }

  // 3. Persist to Firestore
  await Promise.all([
    saveCompletedSession(uid, completedSession),
    removeActiveSession(uid, activeSession.date),
    saveUserProfile(updatedProfile),
    ...Object.entries(activeSession.exercises).map(([exId, log]) => {
      const def = exerciseDefs[exId];
      if (!def || log.sets.length === 0) return Promise.resolve();
      let bestW = 0;
      let bestR = 0;
      let bestD = 0;
      let vol = 0;
      log.sets.forEach((s) => {
        if ((s.weightKg ?? 0) > bestW) { bestW = s.weightKg ?? 0; bestR = s.reps ?? 0; }
        if ((s.durationSec ?? 0) > bestD) bestD = s.durationSec ?? 0;
        if ((s.weightKg ?? 0) > 0 && (s.reps ?? 0) > 0) vol += (s.weightKg ?? 0) * (s.reps ?? 0);
      });
      return addExerciseRecord(uid, {
        id: `rec_${exId}_${activeSession.date}`,
        exerciseId: exId,
        exerciseName: def.name,
        date: activeSession.date,
        dayNumber: activeSession.dayNumber,
        bestWeight: bestW,
        bestReps: bestR,
        bestDurationSec: bestD,
        totalVolume: vol,
        isPR: prResult.prs.some((p) => p.exerciseId === exId),
        sets: log.sets
      });
    }),
    ...bossResult.completedBosses.map((b) => saveBoss(uid, b)),
    ...achievementResult.newlyUnlocked.map((a) => saveAchievement(uid, a)),
    ...systemEvents.map((ev) => addSystemEvent(uid, ev)),
    ...(rewardTokenResult.granted
      ? [
          addRewardTransaction(uid, {
            id: `tx_${Date.now()}`,
            type: 'EARNED',
            title: `Session Day ${padDay(activeSession.dayNumber)} Drop`,
            timestamp: nowTs,
            tokens: 1
          })
        ]
      : [])
  ]);

  return {
    completedSession,
    updatedProfile,
    prs: prResult.prs,
    unlockedBosses: bossResult.completedBosses,
    unlockedAchievements: achievementResult.newlyUnlocked,
    leveledUp,
    previousLevel: prevLevelInfo.level,
    newLevel: newLevelInfo.level,
    rewardTokenGranted: rewardTokenResult.granted,
    systemEvents
  };
}

function padDay(n: number): string {
  return String(n).padStart(3, '0');
}
