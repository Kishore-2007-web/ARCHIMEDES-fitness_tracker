import { Achievement } from '../../types/gamification';
import { CompletedSession, LoggedSet } from '../../types/workout';

export interface AchievementEvaluationResult {
  newlyUnlocked: Achievement[];
  totalAchievementXP: number;
}

/**
 * Checks for newly unlocked achievements based on current progression state
 */
export function evaluateAchievements(params: {
  currentAchievements: Achievement[];
  completedSessions: CompletedSession[];
  todaySession: CompletedSession;
  todayExercises: Record<string, { sets: LoggedSet[] }>;
  consistencyStreak: number;
  completedBossIds: string[];
}): AchievementEvaluationResult {
  const {
    currentAchievements,
    completedSessions,
    todaySession,
    todayExercises,
    consistencyStreak,
    completedBossIds
  } = params;

  const newlyUnlocked: Achievement[] = [];
  let totalAchievementXP = 0;

  for (const ach of currentAchievements) {
    if (ach.unlocked) continue; // Already unlocked

    let conditionMet = false;

    switch (ach.id) {
      case 'ach_first_session':
        if (completedSessions.length >= 1 || todaySession.status === 'completed') {
          conditionMet = true;
        }
        break;

      case 'ach_first_pr':
        if (todaySession.prs && todaySession.prs.length > 0) {
          conditionMet = true;
        }
        break;

      case 'ach_iron_gate':
        if (completedBossIds.includes('boss_iron_gate')) {
          conditionMet = true;
        }
        break;

      case 'ach_streak_7':
        if (consistencyStreak >= 7) conditionMet = true;
        break;

      case 'ach_streak_30':
        if (consistencyStreak >= 30) conditionMet = true;
        break;

      case 'ach_streak_60':
        if (consistencyStreak >= 60) conditionMet = true;
        break;

      case 'ach_streak_120':
      case 'ach_streak_124':
        if (consistencyStreak >= 120 || todaySession.dayNumber >= 120) conditionMet = true;
        break;

      case 'ach_recovery_discipline':
        if (todaySession.weekday === 0 && todaySession.status === 'completed') {
          conditionMet = true;
        }
        break;

      case 'ach_secret_century_squat': {
        const squatLog = todayExercises['back_squat'] || todayExercises['back_squat_b'];
        if (squatLog && squatLog.sets.some((s) => (s.weightKg ?? 0) >= 100 && (s.reps ?? 0) > 0)) {
          conditionMet = true;
        }
        break;
      }

      case 'ach_secret_first_pullup': {
        const pullUpLog = todayExercises['assisted_pull_ups'];
        if (pullUpLog && pullUpLog.sets.some((s) => (s.assistanceKg ?? 999) === 0 && (s.reps ?? 0) >= 1)) {
          conditionMet = true;
        }
        break;
      }

      case 'ach_secret_unyielding':
        if (todaySession.reason === 'LOW_MOTIVATION' && todaySession.status === 'completed') {
          conditionMet = true;
        }
        break;

      case 'ach_secret_heavy_deadlift': {
        const deadliftLog = todayExercises['conventional_deadlift'];
        if (deadliftLog && deadliftLog.sets.some((s) => (s.weightKg ?? 0) >= 110 && (s.reps ?? 0) > 0)) {
          conditionMet = true;
        }
        break;
      }
    }

    if (conditionMet) {
      newlyUnlocked.push({
        ...ach,
        unlocked: true,
        unlockedAt: new Date().toISOString()
      });
      totalAchievementXP += ach.xpReward;
    }
  }

  return { newlyUnlocked, totalAchievementXP };
}
