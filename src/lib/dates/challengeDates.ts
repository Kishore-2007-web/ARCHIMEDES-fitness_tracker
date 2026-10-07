export const CHALLENGE_START_DATE = '2026-10-07';
export const CHALLENGE_END_DATE = '2027-02-07';
export const CHALLENGE_TIMEZONE = 'Asia/Kolkata';
export const TOTAL_CHALLENGE_DAYS = 124;

export interface ChallengeDayInfo {
  dayNumber: number; // 1 to 124
  dateString: string; // YYYY-MM-DD
  formattedDate: string; // "07 OCT 2026"
  weekday: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  weekdayName: string; // "WEDNESDAY"
  isBeforeChallenge: boolean;
  isAfterChallenge: boolean;
  isInsideChallenge: boolean;
  scheduleId: string;
  workoutTitle: string;
  baseXP: number;
  dailyMission: string;
  hasBossUnlock?: boolean;
  bossId?: string;
  isPhotoCheckpoint?: boolean;
  checkpointId?: 'day001' | 'day030' | 'day060' | 'day090' | 'day120' | 'day124';
}

const MONTH_NAMES = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

const WEEKDAY_NAMES = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY',
  'THURSDAY', 'FRIDAY', 'SATURDAY'
];

// Weekday schedule mapping
export const WEEKDAY_SCHEDULE_METADATA: Record<number, { id: string; title: string; baseXP: number; mission: string }> = {
  1: {
    id: 'strength_a',
    title: 'SQUAT + BENCH STRENGTH A',
    baseXP: 300,
    mission: 'Complete all primary Squat and Bench sets with recorded weights.'
  },
  2: {
    id: 'agility_athleticism',
    title: 'MOBILITY + AGILITY + ATHLETICISM',
    baseXP: 200,
    mission: 'Execute the full 30-minute agility block without truncating reaction sets.'
  },
  3: {
    id: 'deadlift_strength',
    title: 'DEADLIFT + FULL BODY STRENGTH',
    baseXP: 300,
    mission: 'Complete primary conventional deadlift working sets with clean technique.'
  },
  4: {
    id: 'athletic_mobility',
    title: 'ATHLETIC + MOBILITY DAY',
    baseXP: 200,
    mission: 'Complete conditioning block and thorough 15-minute recovery.'
  },
  5: {
    id: 'strength_b',
    title: 'SQUAT + BENCH STRENGTH B',
    baseXP: 300,
    mission: 'Perform light secondary deadlift strictly between 50-65% intensity.'
  },
  6: {
    id: 'calisthenics_strength',
    title: 'CALISTHENICS + ATHLETIC STRENGTH',
    baseXP: 250,
    mission: 'Execute push-ups and assisted pull-ups with verified controlled reps.'
  },
  0: {
    id: 'active_recovery',
    title: 'ACTIVE RECOVERY',
    baseXP: 100,
    mission: 'Complete 45-minute continuous walk and low-intensity mobility protocol.'
  }
};

/**
 * Returns current date string formatted in Asia/Kolkata timezone
 */
export function getCurrentKolkataDateString(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: CHALLENGE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const formatter = new Intl.DateTimeFormat('en-CA', options); // returns YYYY-MM-DD
  return formatter.format(now);
}

/**
 * Formats a Date or date string to '07 OCT 2026'
 */
export function formatChallengeDate(dateStr: string): string {
  const parts = dateStr.split('-');
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parts[2].padStart(2, '0');
  return `${day} ${MONTH_NAMES[monthIdx]} ${year}`;
}

/**
 * Given a challenge day number (1 to 120), returns the exact ISO date string (YYYY-MM-DD)
 */
export function getDateStringForDayNumber(dayNumber: number): string {
  // Day 1 corresponds to CHALLENGE_START_DATE
  const [sYear, sMonth, sDay] = CHALLENGE_START_DATE.split('-').map(Number);
  const start = new Date(Date.UTC(sYear, sMonth - 1, sDay));
  const target = new Date(start.getTime() + (dayNumber - 1) * 86400000);
  const y = target.getUTCFullYear();
  const m = String(target.getUTCMonth() + 1).padStart(2, '0');
  const d = String(target.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Computes calendar day difference between CHALLENGE_START_DATE and given date string
 */
export function getChallengeDayNumber(dateStr: string): number {
  const [sYear, sMonth, sDay] = CHALLENGE_START_DATE.split('-').map(Number);
  const start = new Date(Date.UTC(sYear, sMonth - 1, sDay));
  const parts = dateStr.split('-').map(Number);
  const target = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  const diffMs = target.getTime() - start.getTime();
  const dayDiff = Math.floor(diffMs / 86400000);
  return dayDiff + 1;
}

/**
 * Deterministic Challenge Day Engine
 */
export function getChallengeDay(dateInput?: string | Date): ChallengeDayInfo {
  let dateStr: string;
  if (!dateInput) {
    dateStr = getCurrentKolkataDateString();
  } else if (typeof dateInput === 'string') {
    dateStr = dateInput;
  } else {
    const y = dateInput.getFullYear();
    const m = String(dateInput.getMonth() + 1).padStart(2, '0');
    const d = String(dateInput.getDate()).padStart(2, '0');
    dateStr = `${y}-${m}-${d}`;
  }

  const dayNumber = getChallengeDayNumber(dateStr);
  const parts = dateStr.split('-').map(Number);
  // UTC date object to determine accurate day of week without local TZ interference
  const dateObj = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  const weekday = dateObj.getUTCDay();
  const weekdayName = WEEKDAY_NAMES[weekday];
  const formattedDate = formatChallengeDate(dateStr);

  const isBeforeChallenge = dayNumber < 1;
  const isAfterChallenge = dayNumber > TOTAL_CHALLENGE_DAYS;
  const isInsideChallenge = !isBeforeChallenge && !isAfterChallenge;

  const schedule = WEEKDAY_SCHEDULE_METADATA[weekday];

  // Boss unlock milestones
  let hasBossUnlock = false;
  let bossId: string | undefined;
  if (dayNumber === 14) { hasBossUnlock = true; bossId = 'boss_d14'; }
  else if (dayNumber === 30) { hasBossUnlock = true; bossId = 'boss_iron_gate'; }
  else if (dayNumber === 45) { hasBossUnlock = true; bossId = 'boss_d45'; }
  else if (dayNumber === 60) { hasBossUnlock = true; bossId = 'boss_d60'; }
  else if (dayNumber === 75) { hasBossUnlock = true; bossId = 'boss_d75'; }
  else if (dayNumber === 90) { hasBossUnlock = true; bossId = 'boss_d90'; }
  else if (dayNumber === 105) { hasBossUnlock = true; bossId = 'boss_d105'; }
  else if (dayNumber === 120 || dayNumber === 124) { hasBossUnlock = true; bossId = 'boss_final'; }

  // Photo checkpoint milestones (Day 1, 30, 60, 90, 120)
  let isPhotoCheckpoint = false;
  let checkpointId: 'day001' | 'day030' | 'day060' | 'day090' | 'day120' | 'day124' | undefined;
  if (dayNumber === 1) { isPhotoCheckpoint = true; checkpointId = 'day001'; }
  else if (dayNumber === 30) { isPhotoCheckpoint = true; checkpointId = 'day030'; }
  else if (dayNumber === 60) { isPhotoCheckpoint = true; checkpointId = 'day060'; }
  else if (dayNumber === 90) { isPhotoCheckpoint = true; checkpointId = 'day090'; }
  else if (dayNumber === 120) { isPhotoCheckpoint = true; checkpointId = 'day120'; }
  else if (dayNumber === 124) { isPhotoCheckpoint = true; checkpointId = 'day124'; }

  return {
    dayNumber,
    dateString: dateStr,
    formattedDate,
    weekday,
    weekdayName,
    isBeforeChallenge,
    isAfterChallenge,
    isInsideChallenge,
    scheduleId: schedule.id,
    workoutTitle: schedule.title,
    baseXP: schedule.baseXP,
    dailyMission: schedule.mission,
    hasBossUnlock,
    bossId,
    isPhotoCheckpoint,
    checkpointId
  };
}
