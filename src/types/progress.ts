export interface ProgressCheckpoint {
  checkpointId: 'day001' | 'day030' | 'day060' | 'day090' | 'day124';
  dayNumber: number;
  date: string;
  bodyWeightKg?: number;
  waistIn?: number;
  maxPushUps?: number;
  maxPullUps?: number;
  maxPlankSec?: number;
  photos: {
    front?: string; // Private storage path or object URL
    side?: string;
    back?: string;
  };
  photosComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseHistoricalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  date: string;
  dayNumber: number;
  bestWeight?: number;
  bestReps?: number;
  bestDurationSec?: number;
  minAssistanceKg?: number;
  totalVolume?: number;
  isPR?: boolean;
  sets: {
    setNumber: number;
    weightKg?: number;
    reps?: number;
    durationSec?: number;
    assistanceKg?: number;
  }[];
}
