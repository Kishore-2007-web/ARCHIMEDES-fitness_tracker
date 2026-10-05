export interface WeeklyReport {
  id: string;
  weekNumber: number; // 1 to 18
  startDay: number;
  endDay: number;
  startDate: string;
  endDate: string;
  completedSessions: number;
  reducedSessions: number;
  exceptionsCount: number;
  missedSessions: number;
  completionRate: number; // percentage
  consistencyRate: number;
  totalXPEarned: number;
  prsDetected: number;
  bossesCompleted: number;
  systemPower: number;
  measurementsRecorded?: {
    weightKg?: number;
    waistIn?: number;
  };
  generatedAt: string;
}

export interface MilestoneReport {
  id: string;
  milestoneDay: 30 | 60 | 90 | 120 | 124;
  title: string;
  date: string;
  level: number;
  rank: string;
  systemPower: number;
  attributes: {
    strength: number;
    endurance: number;
    agility: number;
    mobility: number;
    discipline: number;
    focus: number;
  };
  completionRate: number;
  consistencyRate: number;
  totalXP: number;
  totalPRs: number;
  bossesDefeated: number;
  weightChangeKg: number;
  waistChangeIn: number;
  pushUpChange: number;
  pullUpChange: number;
  plankChangeSec: number;
  squatBenchmark: { baseline: number; current: number };
  benchBenchmark: { baseline: number; current: number };
  deadliftBenchmark: { baseline: number; current: number };
  generatedAt: string;
}
