import { describe, it, expect } from 'vitest';
import {
  getChallengeDay,
  getChallengeDayNumber,
  getDateStringForDayNumber,
  formatChallengeDate
} from '../lib/dates/challengeDates';
import {
  calculateSessionXP,
  BASE_XP_MAP,
  REDUCED_XP_MAP
} from '../lib/progression/xpCalculations';
import {
  getCumulativeXPForLevel,
  getXPNeededForLevelIncrement,
  calculateLevelFromXP
} from '../lib/progression/levelCalculations';
import { detectExercisePRs, evaluateAllSessionPRs } from '../lib/progression/prCalculations';
import { calculateSystemPower, calculateAttributeGains, applyAttributeGains } from '../lib/progression/attributeCalculations';
import { evaluateBossQuests } from '../lib/progression/bossEvaluator';
import { evaluateRandomRewardToken } from '../lib/progression/rewardTokenGenerator';
import { DAY1_DEFAULT_BASELINE } from '../data/baseline';
import { SYSTEM_BOSSES } from '../data/bosses';

describe('1. Challenge Date Engine', () => {
  it('Day 1 correctly maps to 07 Oct 2026, Wednesday', () => {
    const day1 = getChallengeDay('2026-10-07');
    expect(day1.dayNumber).toBe(1);
    expect(day1.weekday).toBe(3); // Wednesday
    expect(day1.weekdayName).toBe('WEDNESDAY');
    expect(day1.workoutTitle).toBe('DEADLIFT + FULL BODY STRENGTH');
    expect(day1.baseXP).toBe(300);
    expect(day1.isInsideChallenge).toBe(true);
    expect(day1.isPhotoCheckpoint).toBe(true);
    expect(day1.checkpointId).toBe('day001');
  });

  it('Day 30 correctly maps to 05 Nov 2026, Thursday with Iron Gate unlock', () => {
    const dateStr = getDateStringForDayNumber(30);
    expect(dateStr).toBe('2026-11-05');
    const day30 = getChallengeDay(dateStr);
    expect(day30.dayNumber).toBe(30);
    expect(day30.hasBossUnlock).toBe(true);
    expect(day30.bossId).toBe('boss_iron_gate');
    expect(day30.isPhotoCheckpoint).toBe(true);
    expect(day30.checkpointId).toBe('day030');
  });

  it('Day 60 correctly maps to 05 Dec 2026, Saturday', () => {
    const dateStr = getDateStringForDayNumber(60);
    expect(dateStr).toBe('2026-12-05');
    const day60 = getChallengeDay(dateStr);
    expect(day60.dayNumber).toBe(60);
    expect(day60.weekdayName).toBe('SATURDAY');
    expect(day60.checkpointId).toBe('day060');
  });

  it('Day 90 correctly maps to 04 Jan 2027, Monday', () => {
    const dateStr = getDateStringForDayNumber(90);
    expect(dateStr).toBe('2027-01-04');
    const day90 = getChallengeDay(dateStr);
    expect(day90.dayNumber).toBe(90);
    expect(day90.weekdayName).toBe('MONDAY');
    expect(day90.checkpointId).toBe('day090');
  });

  it('Day 124 correctly maps to 07 Feb 2027, Sunday (Challenge finale)', () => {
    const dateStr = getDateStringForDayNumber(124);
    expect(dateStr).toBe('2027-02-07');
    const day124 = getChallengeDay(dateStr);
    expect(day124.dayNumber).toBe(124);
    expect(day124.weekday).toBe(0); // Sunday
    expect(day124.weekdayName).toBe('SUNDAY');
    expect(day124.workoutTitle).toBe('ACTIVE RECOVERY');
    expect(day124.baseXP).toBe(100);
    expect(day124.isInsideChallenge).toBe(true);
    expect(day124.isPhotoCheckpoint).toBe(true);
    expect(day124.checkpointId).toBe('day124');
    expect(day124.hasBossUnlock).toBe(true);
    expect(day124.bossId).toBe('boss_final');
  });

  it('Correctly identifies dates before and after challenge', () => {
    const before = getChallengeDay('2026-10-06');
    expect(before.isBeforeChallenge).toBe(true);
    expect(before.isInsideChallenge).toBe(false);

    const after = getChallengeDay('2027-02-08');
    expect(after.isAfterChallenge).toBe(true);
    expect(after.isInsideChallenge).toBe(false);
  });
});

describe('2. Progression & XP Calculations', () => {
  it('awards full base XP for each weekday', () => {
    expect(BASE_XP_MAP[1]).toBe(300); // Mon
    expect(BASE_XP_MAP[2]).toBe(200); // Tue
    expect(BASE_XP_MAP[3]).toBe(300); // Wed
    expect(BASE_XP_MAP[4]).toBe(200); // Thu
    expect(BASE_XP_MAP[5]).toBe(300); // Fri
    expect(BASE_XP_MAP[6]).toBe(250); // Sat
    expect(BASE_XP_MAP[0]).toBe(100); // Sun
  });

  it('awards ~60% XP for reduced sessions', () => {
    expect(REDUCED_XP_MAP[1]).toBe(180);
    expect(REDUCED_XP_MAP[2]).toBe(120);
    expect(REDUCED_XP_MAP[6]).toBe(150);
    expect(REDUCED_XP_MAP[0]).toBe(60);
  });

  it('handles SICK exception: 0 XP, streak paused, consistency maintained', () => {
    const result = calculateSessionXP({
      weekday: 3,
      isCompleted: false,
      isReduced: false,
      dailyMissionCompleted: false,
      exceptionReason: 'SICK',
      currentTrainingStreak: 5,
      currentConsistencyStreak: 5
    });

    expect(result.baseXP).toBe(0);
    expect(result.totalXP).toBe(0);
    expect(result.streakAction).toBe('pause');
    expect(result.consistencyAction).toBe('maintain');
  });

  it('handles GYM_CLOSED exception: 75 XP, consistency maintained', () => {
    const result = calculateSessionXP({
      weekday: 1,
      isCompleted: false,
      isReduced: false,
      dailyMissionCompleted: false,
      exceptionReason: 'GYM_CLOSED',
      currentTrainingStreak: 5,
      currentConsistencyStreak: 5
    });

    expect(result.baseXP).toBe(75);
    expect(result.totalXP).toBe(75);
    expect(result.streakAction).toBe('pause');
    expect(result.consistencyAction).toBe('maintain');
  });

  it('handles NORMAL_MISS: 0 XP, streaks reset', () => {
    const result = calculateSessionXP({
      weekday: 3,
      isCompleted: false,
      isReduced: false,
      dailyMissionCompleted: false,
      exceptionReason: 'NORMAL_MISS',
      currentTrainingStreak: 12,
      currentConsistencyStreak: 12
    });

    expect(result.baseXP).toBe(0);
    expect(result.totalXP).toBe(0);
    expect(result.streakAction).toBe('reset');
    expect(result.consistencyAction).toBe('reset');
  });

  it('awards daily mission +25 XP upon completion', () => {
    const result = calculateSessionXP({
      weekday: 3,
      isCompleted: true,
      isReduced: false,
      dailyMissionCompleted: true,
      currentTrainingStreak: 0,
      currentConsistencyStreak: 0
    });

    expect(result.baseXP).toBe(300);
    expect(result.dailyMissionXP).toBe(25);
    expect(result.totalXP).toBe(325);
  });
});

describe('3. Level Calculation Formulas', () => {
  it('verifies exact level thresholds per Section 35', () => {
    expect(getCumulativeXPForLevel(1)).toBe(0);
    expect(getCumulativeXPForLevel(2)).toBe(250);
    expect(getCumulativeXPForLevel(3)).toBe(540); // 250 + 290
    expect(getCumulativeXPForLevel(4)).toBe(870); // 540 + 330
    expect(getXPNeededForLevelIncrement(1)).toBe(250);
    expect(getXPNeededForLevelIncrement(2)).toBe(290);
    expect(getXPNeededForLevelIncrement(3)).toBe(330);
  });

  it('accurately resolves level from cumulative XP', () => {
    const l1 = calculateLevelFromXP(100);
    expect(l1.level).toBe(1);
    expect(l1.xpIntoCurrentLevel).toBe(100);
    expect(l1.xpRequiredForNextLevel).toBe(250);

    const l2 = calculateLevelFromXP(250);
    expect(l2.level).toBe(2);
    expect(l2.xpIntoCurrentLevel).toBe(0);

    const l3 = calculateLevelFromXP(600);
    expect(l3.level).toBe(3);
    expect(l3.xpIntoCurrentLevel).toBe(60);
  });
});

describe('4. PR Detection Engine', () => {
  it('detects Weight PR when exceeding baseline', () => {
    const prs = detectExercisePRs({
      exerciseId: 'back_squat',
      exerciseName: 'Barbell Back Squat',
      metricType: 'WEIGHT_REPS',
      todaySets: [
        { setNumber: 1, weightKg: 85, reps: 5, completedAt: '' }
      ],
      historicalRecords: [],
      baseline: DAY1_DEFAULT_BASELINE // baseline squat weight is 80kg
    });

    expect(prs.length).toBeGreaterThan(0);
    const weightPR = prs.find((p) => p.type === 'WEIGHT');
    expect(weightPR).toBeDefined();
    expect(weightPR?.newValue).toBe(85);
    expect(weightPR?.xpAwarded).toBe(50);
  });

  it('does not create PR for identical or lower performance', () => {
    const prs = detectExercisePRs({
      exerciseId: 'back_squat',
      exerciseName: 'Barbell Back Squat',
      metricType: 'WEIGHT_REPS',
      todaySets: [
        { setNumber: 1, weightKg: 75, reps: 5, completedAt: '' }
      ],
      historicalRecords: [],
      baseline: DAY1_DEFAULT_BASELINE // baseline is 80kg
    });

    const weightPR = prs.find((p) => p.type === 'WEIGHT');
    expect(weightPR).toBeUndefined();
  });

  it('caps total session PR bonus at 150 XP per Section 39', () => {
    const res = evaluateAllSessionPRs({
      exercises: {
        back_squat: { sets: [{ setNumber: 1, weightKg: 100, reps: 10, completedAt: '' }] },
        bench_press: { sets: [{ setNumber: 1, weightKg: 60, reps: 15, completedAt: '' }] },
        conventional_deadlift: { sets: [{ setNumber: 1, weightKg: 120, reps: 10, completedAt: '' }] }
      },
      exerciseDefinitions: {
        back_squat: { name: 'Squat', metricType: 'WEIGHT_REPS' },
        bench_press: { name: 'Bench', metricType: 'WEIGHT_REPS' },
        conventional_deadlift: { name: 'Deadlift', metricType: 'WEIGHT_REPS' }
      },
      historicalRecords: [],
      baseline: DAY1_DEFAULT_BASELINE
    });

    expect(res.totalPRBonusXP).toBeLessThanOrEqual(150);
  });
});

describe('5. Boss Quest Verification', () => {
  it('verifies Iron Gate completion when 85kg x 8 is logged', () => {
    const res = evaluateBossQuests({
      bosses: SYSTEM_BOSSES,
      dayNumber: 30,
      currentStreak: 30,
      todayExercises: {
        back_squat: {
          sets: [{ setNumber: 1, weightKg: 85, reps: 8, completedAt: '' }]
        }
      },
      completedSessions: []
    });

    const ironGate = res.completedBosses.find((b) => b.id === 'boss_iron_gate');
    expect(ironGate).toBeDefined();
    expect(res.totalBossXP).toBeGreaterThanOrEqual(500);
    expect(res.totalBossTokens).toBe(1);
    expect(res.unlockedTitles).toContain('BOSS BREAKER');
  });

  it('does not complete boss if target metric is not met', () => {
    const res = evaluateBossQuests({
      bosses: SYSTEM_BOSSES,
      dayNumber: 30,
      currentStreak: 30,
      todayExercises: {
        back_squat: {
          sets: [{ setNumber: 1, weightKg: 82.5, reps: 8, completedAt: '' }] // under 85kg
        }
      },
      completedSessions: []
    });

    const ironGate = res.completedBosses.find((b) => b.id === 'boss_iron_gate');
    expect(ironGate).toBeUndefined();
  });
});

describe('6. System Power & Attributes', () => {
  it('correctly calculates weighted System Power composite clamped 0-100', () => {
    const { systemPower, rank } = calculateSystemPower({
      attributes: {
        strength: 20,
        endurance: 20,
        agility: 20,
        mobility: 20,
        discipline: 20,
        focus: 20
      },
      consistencyScore: 20,
      completionScore: 20,
      performanceProgress: 20,
      bossScore: 0
    });

    expect(systemPower).toBeGreaterThanOrEqual(0);
    expect(systemPower).toBeLessThanOrEqual(100);
    expect(rank).toBe('E');
  });

  it('calculates attribute gains and applies them safely', () => {
    const gains = calculateAttributeGains({
      weekday: 1, // Monday: STR, DIS, FOC
      status: 'completed',
      prCount: 1
    });
    expect(gains.strength).toBeGreaterThan(0);
    expect(gains.discipline).toBeGreaterThan(0);

    const initialAttrs = {
      strength: 20,
      endurance: 20,
      agility: 20,
      mobility: 20,
      discipline: 20,
      focus: 20
    };
    const updated = applyAttributeGains(initialAttrs, gains);
    expect(updated.strength).toBeGreaterThan(20);
    expect(updated.discipline).toBeGreaterThan(20);
  });
});

describe('7. Date Formatting & Reward Token Generator', () => {
  it('formats challenge date and computes day numbers correctly', () => {
    expect(formatChallengeDate('2026-10-07')).toBe('07 OCT 2026');
    expect(getChallengeDayNumber('2026-10-07')).toBe(1);
    expect(getChallengeDayNumber('2026-10-08')).toBe(2);
  });

  it('evaluates reward token with weekly cap and bad-luck protection', () => {
    // Over weekly cap
    const capped = evaluateRandomRewardToken({
      tokensEarnedThisWeek: 2,
      consecutiveSessionsWithoutToken: 1,
      isCompletedFullSession: true
    });
    expect(capped.granted).toBe(false);

    // Guaranteed bad-luck protection
    const badLuckProtected = evaluateRandomRewardToken({
      tokensEarnedThisWeek: 0,
      consecutiveSessionsWithoutToken: 4,
      isCompletedFullSession: true
    });
    expect(badLuckProtected.granted).toBe(true);
  });
});

describe('8. Updated Workout Schedule Structure', () => {
  it('contains the exact 7-day schedule with all required exercises', async () => {
    const { WORKOUT_SCHEDULE, COMMON_WARMUP_CHECKLIST, COMMON_RECOVERY_CHECKLIST } = await import('../data/workoutSchedule');

    // Warm-up and recovery counts
    expect(COMMON_WARMUP_CHECKLIST.length).toBe(15);
    expect(COMMON_RECOVERY_CHECKLIST.length).toBe(13);

    // Monday: Squat + Bench Strength A
    const monday = WORKOUT_SCHEDULE[1];
    expect(monday.title).toBe('SQUAT + BENCH STRENGTH A');
    expect(monday.exercises.map((e) => e.name)).toEqual([
      'Barbell Back Squat',
      'Barbell Bench Press',
      'Machine/Cable Row',
      'Farmer Carry',
      'Dead Hang',
      'Cable Triceps Pushdown',
      'Calf Raises'
    ]);
    expect(monday.walkingRange).toBe('30–45 min');

    // Tuesday: Shoulders + Arms
    const tuesday = WORKOUT_SCHEDULE[2];
    expect(tuesday.title).toBe('SHOULDERS + ARMS');
    expect(tuesday.exercises.map((e) => e.name)).toEqual([
      'Landmine Press',
      'Bottoms-Up Kettlebell Carry',
      'Cable/Band External Rotation',
      'Face Pull',
      'Hammer Curl',
      'Plate Pinch Hold',
      'Mobility'
    ]);

    // Wednesday: Deadlift + Full Body Strength
    const wednesday = WORKOUT_SCHEDULE[3];
    expect(wednesday.title).toBe('DEADLIFT + FULL BODY STRENGTH');
    expect(wednesday.exercises.map((e) => e.name)).toEqual([
      'Conventional Deadlift',
      'Leg Press',
      'Lat Pulldown',
      'Dumbbell Bench Press',
      'Back Extension',
      'Grip Trainer'
    ]);

    // Thursday: Athletic + Core + Neck
    const thursday = WORKOUT_SCHEDULE[4];
    expect(thursday.title).toBe('ATHLETIC + CORE + NECK');
    expect(thursday.exercises.map((e) => e.name)).toEqual([
      'Sled Push',
      'Barbell/Dumbbell High Pull OR Upright Row',
      'Shrugs',
      'Dumbbell/Plate Isometric Neck Press',
      'Deep-Squat Behind-the-Neck Barbell Press',
      'Cable Crunch',
      'Pallof Press',
      'Dead Bug',
      'Footwork'
    ]);

    // Friday: Squat + Bench Strength B
    const friday = WORKOUT_SCHEDULE[5];
    expect(friday.title).toBe('SQUAT + BENCH STRENGTH B');
    expect(friday.exercises.map((e) => e.name)).toEqual([
      'Back Squat',
      'Bench Press',
      'Seated Row',
      'Overhead Press',
      'Reverse Curls'
    ]);

    // Saturday: Calisthenics + Athletic
    const saturday = WORKOUT_SCHEDULE[6];
    expect(saturday.title).toBe('CALISTHENICS + ATHLETIC');
    expect(saturday.exercises.map((e) => e.name)).toEqual([
      'Pull-up Progression',
      'Push-up Progression',
      'Bodyweight Squat',
      'Farmer Carry',
      'Calf Raises'
    ]);

    // Sunday: Active Recovery
    const sunday = WORKOUT_SCHEDULE[0];
    expect(sunday.title).toBe('ACTIVE RECOVERY');
    expect(sunday.exercises.map((e) => e.name)).toEqual([
      'Easy Walking',
      'Light Stretching',
      'Optional deep breathing'
    ]);
  });
});

describe('9. Calendar Dynamic Completion Logic', () => {
  it('correctly manages dynamic completedDays and computes current day', () => {
    // Initial challenge state: Day 1 and Day 2 completed
    const initialCompletedDays = [1, 2];

    const getDayState = (day: number, completed: number[], current: number) => {
      if (completed.includes(day)) return 'completed';
      if (day === current) return 'current';
      return 'incomplete';
    };

    const currentDay = Math.max(...initialCompletedDays) + 1; // Day 3
    expect(currentDay).toBe(3);

    expect(getDayState(1, initialCompletedDays, currentDay)).toBe('completed');
    expect(getDayState(2, initialCompletedDays, currentDay)).toBe('completed');
    expect(getDayState(3, initialCompletedDays, currentDay)).toBe('current');
    expect(getDayState(4, initialCompletedDays, currentDay)).toBe('incomplete');
    expect(getDayState(124, initialCompletedDays, currentDay)).toBe('incomplete');

    // Dynamic progression: Completing Day 3
    const updatedCompletedDays = [...initialCompletedDays, 3];
    const nextCurrentDay = Math.max(...updatedCompletedDays) + 1; // Day 4

    expect(getDayState(1, updatedCompletedDays, nextCurrentDay)).toBe('completed');
    expect(getDayState(2, updatedCompletedDays, nextCurrentDay)).toBe('completed');
    expect(getDayState(3, updatedCompletedDays, nextCurrentDay)).toBe('completed');
    expect(getDayState(4, updatedCompletedDays, nextCurrentDay)).toBe('current');
    expect(getDayState(5, updatedCompletedDays, nextCurrentDay)).toBe('incomplete');
  });
});
