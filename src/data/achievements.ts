import { Achievement } from '../types/gamification';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_session',
    title: 'SYSTEM INITIALIZED',
    description: 'Complete your first workout session and log every working set.',
    isSecret: false,
    category: 'onboarding',
    xpReward: 50,
    unlocked: false,
    iconType: 'terminal'
  },
  {
    id: 'ach_first_pr',
    title: 'FORCE AMPLIFIED',
    description: 'Establish a new personal record in weight, reps, or volume.',
    isSecret: false,
    category: 'performance',
    xpReward: 75,
    unlocked: false,
    iconType: 'arrow-up'
  },
  {
    id: 'ach_iron_gate',
    title: 'GATEWAY BREACHED',
    description: 'Defeat the Day 30 Iron Gate milestone boss.',
    isSecret: false,
    category: 'boss',
    xpReward: 150,
    unlocked: false,
    iconType: 'shield'
  },
  {
    id: 'ach_streak_7',
    title: 'ONE WEEK DISCIPLINE',
    description: 'Maintain 7 consecutive days of verified training & active recovery.',
    isSecret: false,
    category: 'consistency',
    xpReward: 100,
    unlocked: false,
    iconType: 'calendar'
  },
  {
    id: 'ach_streak_30',
    title: 'HABITUAL FORTRESS',
    description: 'Achieve a 30-day unbroken streak.',
    isSecret: false,
    category: 'consistency',
    xpReward: 300,
    unlocked: false,
    iconType: 'flame'
  },
  {
    id: 'ach_streak_60',
    title: 'HALF PROTOCOL',
    description: 'Reach 60 days of disciplined execution.',
    isSecret: false,
    category: 'consistency',
    xpReward: 500,
    unlocked: false,
    iconType: 'check-circle'
  },
  {
    id: 'ach_streak_120',
    title: 'PROTOCOL COMPLETE',
    description: 'Complete all 120 days of the ARCHIMEDES Challenge.',
    isSecret: false,
    category: 'consistency',
    xpReward: 1500,
    unlocked: false,
    iconType: 'crown'
  },
  {
    id: 'ach_recovery_discipline',
    title: 'REST PROTOCOL OBSERVER',
    description: 'Complete Sunday active recovery without skipping mobility or walk.',
    isSecret: false,
    category: 'discipline',
    xpReward: 60,
    unlocked: false,
    iconType: 'heart'
  },
  // Hidden Achievements
  {
    id: 'ach_secret_century_squat',
    title: 'CENTURY SQUAT',
    description: 'Cross the 100 kg threshold on Barbell Back Squat.',
    secretDescription: 'Exceed triple digits in Barbell Back Squat load.',
    isSecret: true,
    category: 'performance',
    xpReward: 250,
    unlocked: false,
    iconType: 'award'
  },
  {
    id: 'ach_secret_first_pullup',
    title: 'GRAVITY DEFIED',
    description: 'Log your first zero-assistance bodyweight pull-up.',
    secretDescription: 'Perform an unassisted bodyweight pull-up.',
    isSecret: true,
    category: 'performance',
    xpReward: 250,
    unlocked: false,
    iconType: 'target'
  },
  {
    id: 'ach_secret_unyielding',
    title: 'IRON WILL',
    description: 'Execute the 10-Minute Rule during low motivation and complete the full workout.',
    secretDescription: 'Overcome low motivation using the 10-Minute Protocol.',
    isSecret: true,
    category: 'discipline',
    xpReward: 100,
    unlocked: false,
    iconType: 'zap'
  },
  {
    id: 'ach_secret_heavy_deadlift',
    title: 'GROUND BREAKER',
    description: 'Log a Conventional Deadlift of 110 kg or higher.',
    secretDescription: 'Lift 110 kg off the floor.',
    isSecret: true,
    category: 'performance',
    xpReward: 200,
    unlocked: false,
    iconType: 'hexagon'
  }
];
