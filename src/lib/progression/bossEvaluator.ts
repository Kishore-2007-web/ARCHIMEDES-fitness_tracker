import { BossQuest } from '../../types/gamification';
import { CompletedSession, LoggedSet } from '../../types/workout';

export interface BossEvaluationResult {
  completedBosses: BossQuest[];
  totalBossXP: number;
  totalBossTokens: number;
  attributeBonus?: { attribute: 'strength' | 'endurance' | 'agility' | 'mobility' | 'discipline' | 'focus'; amount: number };
  unlockedTitles: string[];
}

/**
 * Authoritatively verifies boss quests against completed session logs and streaks
 */
export function evaluateBossQuests(params: {
  bosses: BossQuest[];
  dayNumber: number;
  currentStreak: number;
  todayExercises: Record<string, { sets: LoggedSet[] }>;
  completedSessions: CompletedSession[];
}): BossEvaluationResult {
  const { bosses, dayNumber, currentStreak, todayExercises } = params;

  const completedBosses: BossQuest[] = [];
  let totalBossXP = 0;
  let totalBossTokens = 0;
  let attributeBonus: { attribute: 'strength' | 'endurance' | 'agility' | 'mobility' | 'discipline' | 'focus'; amount: number } | undefined;
  const unlockedTitles: string[] = [];

  for (const boss of bosses) {
    // Only evaluate bosses that are unlocked and not yet rewarded
    if (boss.rewardGranted || boss.status === 'completed') {
      continue;
    }

    // Boss must be available by challenge day
    if (dayNumber < boss.dayNumber) {
      continue;
    }

    let isDefeated = false;

    if (boss.targetMetric.type === 'CONSISTENCY') {
      if (currentStreak >= boss.targetMetric.targetValue) {
        isDefeated = true;
      }
    } else if (boss.exerciseId && todayExercises[boss.exerciseId]) {
      const sets = todayExercises[boss.exerciseId].sets;
      const targetVal = boss.targetMetric.targetValue;
      const secTargetVal = boss.targetMetric.secondaryTargetValue ?? 1;

      for (const set of sets) {
        if (boss.targetMetric.type === 'WEIGHT_REPS') {
          if ((set.weightKg ?? 0) >= targetVal && (set.reps ?? 0) >= secTargetVal) {
            isDefeated = true;
            break;
          }
        } else if (boss.targetMetric.type === 'REPS') {
          if ((set.reps ?? 0) >= targetVal) {
            isDefeated = true;
            break;
          }
        } else if (boss.targetMetric.type === 'DURATION') {
          if ((set.durationSec ?? 0) >= targetVal) {
            isDefeated = true;
            break;
          }
        }
      }
    }

    if (isDefeated) {
      const updatedBoss: BossQuest = {
        ...boss,
        status: 'completed',
        completedAt: new Date().toISOString(),
        rewardGranted: true
      };
      completedBosses.push(updatedBoss);
      totalBossXP += boss.reward.xp;
      totalBossTokens += boss.reward.tokens ?? 0;
      if (boss.reward.attributeBonus) {
        attributeBonus = boss.reward.attributeBonus;
      }
      if (boss.reward.titleUnlocked) {
        unlockedTitles.push(boss.reward.titleUnlocked);
      }
    }
  }

  return {
    completedBosses,
    totalBossXP,
    totalBossTokens,
    attributeBonus,
    unlockedTitles
  };
}
