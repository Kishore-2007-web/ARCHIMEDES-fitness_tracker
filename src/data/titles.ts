import { TitleItem, SystemUnlock } from '../types/gamification';

export const SYSTEM_TITLES: TitleItem[] = [
  { id: 'initiate', name: 'INITIATE', requirement: 'Complete Day 1 Baseline and Onboarding', unlocked: true },
  { id: 'consistency_protocol', name: 'CONSISTENCY PROTOCOL', requirement: 'Attain a 7-day verified streak', unlocked: false },
  { id: 'iron_disciple', name: 'IRON DISCIPLE', requirement: 'Defeat The Monolith on Day 60', unlocked: false },
  { id: 'system_user', name: 'SYSTEM USER', requirement: 'Reach Level 10', unlocked: false },
  { id: 'boss_breaker', name: 'BOSS BREAKER', requirement: 'Defeat the Iron Gate on Day 30', unlocked: false },
  { id: 'recovery_master', name: 'RECOVERY MASTER', requirement: 'Log 4 consecutive Sunday active recovery sessions', unlocked: false },
  { id: 'ascended', name: 'ASCENDED', requirement: 'Complete the 124-day protocol on Day 124', unlocked: false }
];

export const SYSTEM_UNLOCKS: SystemUnlock[] = [
  { level: 1, name: 'Core Workout Engine', description: 'Real-time workout logging, timer and active session sync', isUnlocked: true },
  { level: 2, name: 'Exercise History', description: 'Detailed historical logs per movement', isUnlocked: false },
  { level: 5, name: 'Titles & Persona', description: 'Cosmetic title selection and profile designation', isUnlocked: false },
  { level: 8, name: 'Advanced PR Archive', description: 'Deep PR tracking for weight, reps and volume', isUnlocked: false },
  { level: 10, name: 'Boss Archive', description: 'Inspect completed and upcoming milestone bosses', isUnlocked: false },
  { level: 15, name: 'Advanced Reports', description: 'Weekly analytical breakdowns and benchmark shifts', isUnlocked: false },
  { level: 20, name: 'Reward Vault', description: 'Token redemption and custom self-treat management', isUnlocked: false },
  { level: 25, name: 'Extended Progress Analysis', description: 'Advanced delta calculations across challenge checkpoints', isUnlocked: false },
  { level: 30, name: 'Final Phase Preview', description: 'Culmination protocol requirements and finish criteria', isUnlocked: false }
];

export const DEFAULT_REWARDS = [
  { id: 'rew_1', title: 'Movie Night', category: 'Leisure', isCustom: false },
  { id: 'rew_2', title: 'Extended Gaming Session', category: 'Leisure', isCustom: false },
  { id: 'rew_3', title: 'Favorite High-Protein Feast', category: 'Nutrition', isCustom: false },
  { id: 'rew_4', title: 'Personal Small Purchase', category: 'Gear', isCustom: false },
  { id: 'rew_5', title: 'Full Afternoon Offline Rest', category: 'Recovery', isCustom: false }
];
