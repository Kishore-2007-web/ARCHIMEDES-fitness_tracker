import { BossQuest } from '../types/gamification';

export const SYSTEM_BOSSES: BossQuest[] = [
  {
    id: 'boss_d14',
    dayNumber: 14,
    title: 'KINETIC THRESHOLD',
    subtitle: 'Mini-Boss: First 14-Day Kinetic Adaptation Test',
    type: 'mini',
    targetMetric: {
      type: 'CONSISTENCY',
      targetValue: 14,
      description: 'Maintain 14 consecutive days of verified training and active recovery.'
    },
    reward: {
      xp: 400,
      attributeBonus: { attribute: 'discipline', amount: 3 }
    },
    status: 'locked',
    rewardGranted: false
  },
  {
    id: 'boss_iron_gate',
    dayNumber: 30,
    title: 'IRON GATE',
    subtitle: 'Milestone Boss: Baseline Strength Breach',
    type: 'milestone',
    exerciseId: 'back_squat',
    targetMetric: {
      type: 'WEIGHT_REPS',
      targetValue: 85,
      secondaryTargetValue: 8,
      description: 'Back Squat 85 kg × 8 reps (or Deadlift 85 kg × 8 reps).'
    },
    reward: {
      xp: 500,
      tokens: 1,
      attributeBonus: { attribute: 'strength', amount: 5 },
      titleUnlocked: 'BOSS BREAKER'
    },
    status: 'locked',
    rewardGranted: false
  },
  {
    id: 'boss_d45',
    dayNumber: 45,
    title: 'STEEL GRIP',
    subtitle: 'Mini-Boss: Grip & Isometric Tenacity',
    type: 'mini',
    exerciseId: 'dead_hang',
    targetMetric: {
      type: 'DURATION',
      targetValue: 60,
      description: 'Hold a strict Dead Hang for 60 continuous seconds.'
    },
    reward: {
      xp: 450,
      attributeBonus: { attribute: 'endurance', amount: 3 }
    },
    status: 'locked',
    rewardGranted: false
  },
  {
    id: 'boss_d60',
    dayNumber: 60,
    title: 'THE MONOLITH',
    subtitle: 'Milestone Boss: Halfway Structural Load',
    type: 'milestone',
    exerciseId: 'conventional_deadlift',
    targetMetric: {
      type: 'WEIGHT_REPS',
      targetValue: 95,
      secondaryTargetValue: 5,
      description: 'Conventional Deadlift 95 kg × 5 reps with verified neutral spine.'
    },
    reward: {
      xp: 700,
      tokens: 1,
      attributeBonus: { attribute: 'strength', amount: 6 },
      titleUnlocked: 'IRON DISCIPLE'
    },
    status: 'locked',
    rewardGranted: false
  },
  {
    id: 'boss_d75',
    dayNumber: 75,
    title: 'AGILITY TEMPEST',
    subtitle: 'Mini-Boss: Reaction Precision & Footwork Speed',
    type: 'mini',
    exerciseId: 'jump_rope_thu',
    targetMetric: {
      type: 'DURATION',
      targetValue: 900, // 15 min
      description: 'Complete full 15-minute continuous jump rope cadence.'
    },
    reward: {
      xp: 500,
      attributeBonus: { attribute: 'agility', amount: 4 }
    },
    status: 'locked',
    rewardGranted: false
  },
  {
    id: 'boss_d90',
    dayNumber: 90,
    title: 'GRAVITY BREAKER',
    subtitle: 'Milestone Boss: Calisthenic & Relative Force Test',
    type: 'milestone',
    exerciseId: 'push_ups',
    targetMetric: {
      type: 'REPS',
      targetValue: 15,
      description: 'Perform 15 strict chest-to-deck unbroken push-ups.'
    },
    reward: {
      xp: 800,
      tokens: 1,
      attributeBonus: { attribute: 'endurance', amount: 6 }
    },
    status: 'locked',
    rewardGranted: false
  },
  {
    id: 'boss_d105',
    dayNumber: 105,
    title: 'UNBREAKABLE CHAIN',
    subtitle: 'Mini-Boss: 105-Day Willpower Anchor',
    type: 'mini',
    targetMetric: {
      type: 'CONSISTENCY',
      targetValue: 105,
      description: 'Reach Day 105 with unbroken Consistency Status.'
    },
    reward: {
      xp: 600,
      attributeBonus: { attribute: 'discipline', amount: 5 }
    },
    status: 'locked',
    rewardGranted: false
  },
  {
    id: 'boss_final',
    dayNumber: 120,
    title: 'ARCHIMEDES CORE',
    subtitle: 'Final Boss: Protocol Culmination & Full Ascension',
    type: 'final',
    targetMetric: {
      type: 'CONSISTENCY',
      targetValue: 120,
      description: 'Reach and complete Day 120 of the ARCHIMEDES progression system.'
    },
    reward: {
      xp: 1500,
      tokens: 3,
      attributeBonus: { attribute: 'focus', amount: 10 },
      titleUnlocked: 'ASCENDED'
    },
    status: 'locked',
    rewardGranted: false
  }
];
