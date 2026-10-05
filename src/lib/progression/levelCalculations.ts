/**
 * ARCHIMEDES Level Progression Formula:
 * XP required from Level N to N + 1:
 * Delta XP = 250 + 40 * (N - 1)
 *
 * Cumulative XP threshold for reaching Level L:
 * Cumulative(L) = (L - 1) * 250 + 20 * (L - 1) * (L - 2)
 */

export interface LevelInfo {
  level: number;
  currentLevelThreshold: number;
  nextLevelThreshold: number;
  xpIntoCurrentLevel: number;
  xpRequiredForNextLevel: number;
  progressPercent: number; // 0 to 100
}

/**
 * Calculates cumulative XP required to reach level L (where L >= 1)
 */
export function getCumulativeXPForLevel(level: number): number {
  if (level <= 1) return 0;
  const nMinus1 = level - 1;
  return nMinus1 * 250 + 20 * nMinus1 * (level - 2);
}

/**
 * Calculates XP required to move from level N to N + 1
 */
export function getXPNeededForLevelIncrement(level: number): number {
  return 250 + 40 * (level - 1);
}

/**
 * Resolves level information given total cumulative XP
 */
export function calculateLevelFromXP(totalXP: number): LevelInfo {
  const safeXP = Math.max(0, Math.floor(totalXP));
  let level = 1;

  while (getCumulativeXPForLevel(level + 1) <= safeXP) {
    level++;
  }

  const currentLevelThreshold = getCumulativeXPForLevel(level);
  const nextLevelThreshold = getCumulativeXPForLevel(level + 1);
  const xpIntoCurrentLevel = safeXP - currentLevelThreshold;
  const xpRequiredForNextLevel = nextLevelThreshold - currentLevelThreshold;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpIntoCurrentLevel / xpRequiredForNextLevel) * 100))
  );

  return {
    level,
    currentLevelThreshold,
    nextLevelThreshold,
    xpIntoCurrentLevel,
    xpRequiredForNextLevel,
    progressPercent
  };
}
