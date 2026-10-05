/**
 * Evaluates whether a completed session yields a controlled random reward token.
 * Max ~2 tokens per week. Deterministic fallback after consecutive dry sessions.
 */
export function evaluateRandomRewardToken(params: {
  tokensEarnedThisWeek: number;
  consecutiveSessionsWithoutToken: number;
  isCompletedFullSession: boolean;
}): { granted: boolean; reason: string } {
  const { tokensEarnedThisWeek, consecutiveSessionsWithoutToken, isCompletedFullSession } = params;

  if (!isCompletedFullSession) {
    return { granted: false, reason: 'Requires full completed session' };
  }

  // Cap at 2 random token drops per week
  if (tokensEarnedThisWeek >= 2) {
    return { granted: false, reason: 'Weekly token ceiling reached' };
  }

  // Deterministic bad-luck protection: after 4 dry sessions, grant guaranteed token
  if (consecutiveSessionsWithoutToken >= 4) {
    return { granted: true, reason: 'Deterministic bad-luck protection' };
  }

  // Otherwise, ~25% random drop rate
  const roll = Math.random();
  if (roll < 0.28) {
    return { granted: true, reason: 'Random drop rolled' };
  }

  return { granted: false, reason: 'Roll missed' };
}
