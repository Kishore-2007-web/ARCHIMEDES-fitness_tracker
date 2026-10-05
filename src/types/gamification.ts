export interface BossQuest {
  id: string;
  dayNumber: number;
  title: string;
  subtitle: string;
  type: 'milestone' | 'mini' | 'final';
  exerciseId?: string;
  targetMetric: {
    type: 'WEIGHT_REPS' | 'REPS' | 'DURATION' | 'CONSISTENCY';
    targetValue: number;
    secondaryTargetValue?: number; // e.g. reps if target is weight
    description: string;
  };
  reward: {
    xp: number;
    tokens?: number;
    attributeBonus?: {
      attribute: 'strength' | 'endurance' | 'agility' | 'mobility' | 'discipline' | 'focus';
      amount: number;
    };
    titleUnlocked?: string;
  };
  status: 'locked' | 'available' | 'completed';
  completedAt?: string;
  rewardGranted: boolean;
  isStretchChallenge?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  secretDescription?: string;
  isSecret: boolean;
  category: 'onboarding' | 'consistency' | 'performance' | 'boss' | 'discipline';
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  iconType: string;
}

export interface TitleItem {
  id: string;
  name: string;
  requirement: string;
  unlocked: boolean;
}

export interface RewardItem {
  id: string;
  title: string;
  category: string;
  isCustom?: boolean;
}

export interface RewardTransaction {
  id: string;
  type: 'EARNED' | 'REDEEMED';
  title: string;
  timestamp: string;
  tokens: number;
}

export interface SystemUnlock {
  level: number;
  name: string;
  description: string;
  isUnlocked: boolean;
}
