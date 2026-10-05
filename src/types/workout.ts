export type MetricType =
  | 'WEIGHT_REPS'
  | 'BODYWEIGHT_REPS'
  | 'DURATION'
  | 'WEIGHT_DURATION'
  | 'ASSISTANCE_REPS'
  | 'TIME_BLOCK'
  | 'CHECK_ONLY';

export interface ExerciseDefinition {
  id: string;
  name: string;
  targetSets: number;
  targetRepOrDuration: string;
  metricType: MetricType;
  category: 'primary' | 'secondary' | 'support' | 'athletic' | 'calisthenics' | 'grip' | 'neck' | 'forearms';
  notes?: string;
  isBenchmark?: boolean;
}

export interface WorkoutScheduleDay {
  id: string;
  weekday: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  weekdayName: string;
  title: string;
  subtitle: string;
  baseXP: number;
  preparationMinutes: number;
  recoveryMinutes: number;
  walkingMinutes: number;
  preparationChecklist: string[];
  exercises: ExerciseDefinition[];
  recoveryChecklist: string[];
  primaryAttributes: ('strength' | 'endurance' | 'agility' | 'mobility' | 'discipline' | 'focus')[];
}

export interface LoggedSet {
  setNumber: number;
  weightKg?: number;
  reps?: number;
  durationSec?: number;
  assistanceKg?: number;
  completedAt: string;
}

export interface ExerciseLog {
  sets: LoggedSet[];
}

export interface ActiveSession {
  date: string;       // YYYY-MM-DD
  dayNumber: number;  // 1 to 120
  scheduleId: string;
  startedAt: string;
  status: 'in_progress' | 'completed' | 'exception' | 'missed';
  exercises: Record<string, ExerciseLog>;
  blocks: {
    preparationComplete: boolean;
    recoveryComplete: boolean;
    walkingComplete: boolean;
  };
  dailyMissionStatus: 'pending' | 'completed';
  isReducedSession?: boolean;
}

export type ExceptionReason =
  | 'SICK'
  | 'GYM_CLOSED'
  | 'COLLEGE_EXAM'
  | 'TRAVEL'
  | 'INJURY_PAIN'
  | 'GENUINELY_UNAVOIDABLE'
  | 'LOW_MOTIVATION'
  | 'NORMAL_MISS';

export interface DetectedPR {
  exerciseId: string;
  exerciseName: string;
  type: 'WEIGHT' | 'REPS' | 'VOLUME' | 'DURATION' | 'ASSISTANCE';
  previousValue: number;
  newValue: number;
  xpAwarded: number;
}

export interface CompletedSession {
  id: string;
  date: string;
  dayNumber: number;
  scheduleId: string;
  weekday: number;
  status: 'completed' | 'reduced' | 'exception' | 'missed';
  reason?: ExceptionReason;
  baseXP: number;
  bonusXP: number;
  totalXP: number;
  dailyMissionCompleted: boolean;
  performanceBonus: number;
  streakBonus: number;
  bossBonus: number;
  randomRewardTokenGranted?: boolean;
  prs: DetectedPR[];
  totalSets: number;
  totalVolume: number;
  completedAt: string;
}
