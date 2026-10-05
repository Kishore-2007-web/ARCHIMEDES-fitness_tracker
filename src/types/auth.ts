export interface UserBaseline {
  bodyWeightKg: number;      // 109
  waistIn: number;           // 44
  maxPushUps: number;        // 3
  maxPullUps: number;        // 0
  maxPlankSec: number;       // 30
  squatBestWeightKg: number; // 80
  squatBestReps: number;     // 8
  benchBestWeightKg: number; // 30
  benchBestReps: number;     // 12
  deadliftBestWeightKg: number; // 80
  deadliftBestReps: number;     // 8
}

export interface UserSettings {
  reminderEnabled: boolean;
  reminderTime: string; // '17:30'
  reducedMotion: boolean;
}

export interface UserAttributes {
  strength: number;   // STR (starts 20, max 100)
  endurance: number;  // END
  agility: number;    // AGI
  mobility: number;   // MOB
  discipline: number; // DIS
  focus: number;      // FOC
}

export type RankTier = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  challengeStart: string; // '2026-10-11'
  challengeEnd: string;   // '2027-02-07'
  timezone: string;       // 'Asia/Kolkata'
  level: number;
  xp: number;
  rank: RankTier;
  systemPower: number;
  trainingStreak: number;
  longestTrainingStreak: number;
  consistencyStreak: number;
  longestConsistencyStreak: number;
  attributes: UserAttributes;
  baseline: UserBaseline;
  settings: UserSettings;
  rewardTokens: number;
  currentTitle: string;
  onboardingComplete: boolean;
  day1PhotosComplete: boolean;
  createdAt: string;
  updatedAt: string;
}
