export function padDayNumber(day: number): string {
  return String(Math.max(0, day)).padStart(3, '0');
}

export function formatXPNumber(xp: number): string {
  return new Intl.NumberFormat('en-US').format(Math.max(0, Math.floor(xp)));
}

export function formatSecondsToTimer(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safeSec / 60);
  const s = safeSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatWeightKg(kg: number): string {
  return `${Number(kg.toFixed(1))} kg`;
}
