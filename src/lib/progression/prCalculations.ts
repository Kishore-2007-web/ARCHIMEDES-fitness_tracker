import { DetectedPR, LoggedSet } from '../../types/workout';
import { UserBaseline } from '../../types/auth';
import { ExerciseHistoricalRecord } from '../../types/progress';

export interface PRDetectionResult {
  prs: DetectedPR[];
  totalPRBonusXP: number;
}

/**
 * Detects PRs for a given exercise compared against historical records and baseline
 */
export function detectExercisePRs(params: {
  exerciseId: string;
  exerciseName: string;
  metricType: string;
  todaySets: LoggedSet[];
  historicalRecords: ExerciseHistoricalRecord[];
  baseline: UserBaseline;
}): DetectedPR[] {
  const { exerciseId, exerciseName, metricType, todaySets, historicalRecords, baseline } = params;
  const detected: DetectedPR[] = [];

  if (!todaySets || todaySets.length === 0) return detected;

  // Filter valid sets
  const validSets = todaySets.filter((s) => {
    if (metricType === 'WEIGHT_REPS') return (s.weightKg ?? 0) > 0 && (s.reps ?? 0) > 0;
    if (metricType === 'BODYWEIGHT_REPS') return (s.reps ?? 0) > 0;
    if (metricType === 'DURATION' || metricType === 'WEIGHT_DURATION') return (s.durationSec ?? 0) > 0;
    if (metricType === 'ASSISTANCE_REPS') return (s.reps ?? 0) > 0;
    return false;
  });

  if (validSets.length === 0) return detected;

  // Find historical bests
  let priorBestWeight = 0;
  let priorBestRepsAtOrAboveWeight = 0;
  let priorBestVolume = 0;
  let priorBestDuration = 0;
  let priorMinAssistance = 999;

  // Initialize from baseline if matching benchmark exercise
  if (exerciseId === 'back_squat' || exerciseId === 'back_squat_b') {
    priorBestWeight = baseline.squatBestWeightKg;
    priorBestRepsAtOrAboveWeight = baseline.squatBestReps;
    priorBestVolume = baseline.squatBestWeightKg * baseline.squatBestReps * 5;
  } else if (exerciseId === 'bench_press' || exerciseId === 'bench_press_b') {
    priorBestWeight = baseline.benchBestWeightKg;
    priorBestRepsAtOrAboveWeight = baseline.benchBestReps;
    priorBestVolume = baseline.benchBestWeightKg * baseline.benchBestReps * 5;
  } else if (exerciseId === 'conventional_deadlift') {
    priorBestWeight = baseline.deadliftBestWeightKg;
    priorBestRepsAtOrAboveWeight = baseline.deadliftBestReps;
    priorBestVolume = baseline.deadliftBestWeightKg * baseline.deadliftBestReps * 4;
  } else if (exerciseId === 'push_ups') {
    priorBestRepsAtOrAboveWeight = baseline.maxPushUps;
  } else if (exerciseId === 'plank_hold') {
    priorBestDuration = baseline.maxPlankSec;
  }

  // Update with recorded history
  for (const record of historicalRecords) {
    if (record.exerciseId !== exerciseId) continue;
    if (record.bestWeight && record.bestWeight > priorBestWeight) {
      priorBestWeight = record.bestWeight;
    }
    if (record.bestReps && record.bestReps > priorBestRepsAtOrAboveWeight) {
      priorBestRepsAtOrAboveWeight = record.bestReps;
    }
    if (record.totalVolume && record.totalVolume > priorBestVolume) {
      priorBestVolume = record.totalVolume;
    }
    if (record.bestDurationSec && record.bestDurationSec > priorBestDuration) {
      priorBestDuration = record.bestDurationSec;
    }
    if (record.minAssistanceKg !== undefined && record.minAssistanceKg < priorMinAssistance) {
      priorMinAssistance = record.minAssistanceKg;
    }
  }

  // Evaluate today's sets
  let todayMaxWeight = 0;
  let todayMaxRepsAtMaxWeight = 0;
  let todayVolume = 0;
  let todayMaxDuration = 0;
  let todayMinAssistance = 999;

  for (const set of validSets) {
    const w = set.weightKg ?? 0;
    const r = set.reps ?? 0;
    const d = set.durationSec ?? 0;
    const a = set.assistanceKg ?? 999;

    if (w > todayMaxWeight) {
      todayMaxWeight = w;
      todayMaxRepsAtMaxWeight = r;
    } else if (w === todayMaxWeight && r > todayMaxRepsAtMaxWeight) {
      todayMaxRepsAtMaxWeight = r;
    }

    if (w > 0 && r > 0) {
      todayVolume += w * r;
    }

    if (d > todayMaxDuration) {
      todayMaxDuration = d;
    }

    if (a < todayMinAssistance && r > 0) {
      todayMinAssistance = a;
    }
  }

  // Check Weight PR (+50 XP)
  if (todayMaxWeight > priorBestWeight && priorBestWeight > 0) {
    detected.push({
      exerciseId,
      exerciseName,
      type: 'WEIGHT',
      previousValue: priorBestWeight,
      newValue: todayMaxWeight,
      xpAwarded: 50
    });
  }

  // Check Rep PR (+25 XP)
  if (
    todayMaxWeight >= priorBestWeight &&
    todayMaxRepsAtMaxWeight > priorBestRepsAtOrAboveWeight &&
    priorBestRepsAtOrAboveWeight > 0
  ) {
    detected.push({
      exerciseId,
      exerciseName,
      type: 'REPS',
      previousValue: priorBestRepsAtOrAboveWeight,
      newValue: todayMaxRepsAtMaxWeight,
      xpAwarded: 25
    });
  }

  // Check Volume PR (+25 XP)
  if (todayVolume > priorBestVolume && priorBestVolume > 0) {
    detected.push({
      exerciseId,
      exerciseName,
      type: 'VOLUME',
      previousValue: priorBestVolume,
      newValue: todayVolume,
      xpAwarded: 25
    });
  }

  // Check Duration PR (+25 XP)
  if (todayMaxDuration > priorBestDuration && priorBestDuration > 0) {
    detected.push({
      exerciseId,
      exerciseName,
      type: 'DURATION',
      previousValue: priorBestDuration,
      newValue: todayMaxDuration,
      xpAwarded: 25
    });
  }

  // Check Assistance PR (+25 XP) (Lower assistance is an improvement)
  if (todayMinAssistance < priorMinAssistance && priorMinAssistance < 999) {
    detected.push({
      exerciseId,
      exerciseName,
      type: 'ASSISTANCE',
      previousValue: priorMinAssistance,
      newValue: todayMinAssistance,
      xpAwarded: 25
    });
  }

  return detected;
}

/**
 * Evaluates PRs across all exercises in a session and caps bonus at 150 XP
 */
export function evaluateAllSessionPRs(params: {
  exercises: Record<string, { sets: LoggedSet[] }>;
  exerciseDefinitions: Record<string, { name: string; metricType: string }>;
  historicalRecords: ExerciseHistoricalRecord[];
  baseline: UserBaseline;
}): PRDetectionResult {
  const { exercises, exerciseDefinitions, historicalRecords, baseline } = params;
  let allPRs: DetectedPR[] = [];

  for (const [exerciseId, log] of Object.entries(exercises)) {
    const def = exerciseDefinitions[exerciseId];
    if (!def) continue;

    const prs = detectExercisePRs({
      exerciseId,
      exerciseName: def.name,
      metricType: def.metricType,
      todaySets: log.sets,
      historicalRecords,
      baseline
    });

    allPRs = allPRs.concat(prs);
  }

  const rawTotalXP = allPRs.reduce((sum, p) => sum + p.xpAwarded, 0);
  const totalPRBonusXP = Math.min(150, rawTotalXP);

  return {
    prs: allPRs,
    totalPRBonusXP
  };
}
