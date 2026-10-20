/**
 * Exercise Duration Parser
 * Extracts target seconds and quick time options from exercise strings
 */

export interface ParsedDuration {
  primarySeconds: number;
  availableOptions: number[];
  label: string;
}

export function parseDurationFromText(text: string): ParsedDuration | null {
  if (!text) return null;

  // 1. Check range of seconds: e.g. "20–30 sec", "30-45 sec", "15–20 sec/side"
  const secRangeMatch = text.match(/(\d+)\s*(?:–|-)\s*(\d+)\s*(?:sec|seconds|s)\b/i);
  if (secRangeMatch) {
    const s1 = parseInt(secRangeMatch[1], 10);
    const s2 = parseInt(secRangeMatch[2], 10);
    if (!isNaN(s1) && !isNaN(s2) && s1 > 0) {
      return {
        primarySeconds: s1, // default to the lower bound (e.g. 30 sec for 30–45 sec)
        availableOptions: [s1, s2],
        label: `${s1}–${s2}s`
      };
    }
  }

  // 2. Check single seconds: e.g. "30 sec", "20 seconds", "45 sec/side"
  const singleSecMatch = text.match(/(\d+)\s*(?:sec|seconds|s)\b/i);
  if (singleSecMatch) {
    const s = parseInt(singleSecMatch[1], 10);
    if (!isNaN(s) && s > 0 && s <= 600) {
      return {
        primarySeconds: s,
        availableOptions: [s],
        label: `${s}s`
      };
    }
  }

  // 3. Check range of minutes: e.g. "1–2 min"
  const minRangeMatch = text.match(/(\d+)\s*(?:–|-)\s*(\d+)\s*(?:min|minutes|m)\b/i);
  if (minRangeMatch) {
    const m1 = parseInt(minRangeMatch[1], 10) * 60;
    const m2 = parseInt(minRangeMatch[2], 10) * 60;
    if (!isNaN(m1) && !isNaN(m2) && m1 > 0) {
      return {
        primarySeconds: m1,
        availableOptions: [m1, m2],
        label: `${minRangeMatch[1]}–${minRangeMatch[2]}m`
      };
    }
  }

  // 4. Check single minutes: e.g. "3 min", "5 minutes"
  const singleMinMatch = text.match(/(\d+)\s*(?:min|minutes|m)\b/i);
  if (singleMinMatch) {
    const m = parseInt(singleMinMatch[1], 10) * 60;
    if (!isNaN(m) && m > 0 && m <= 3600) {
      return {
        primarySeconds: m,
        availableOptions: [m],
        label: `${singleMinMatch[1]}m`
      };
    }
  }

  // 5. Open-ended hold terms like "near-max" or "max"
  if (/near-max|max hold|to failure/i.test(text)) {
    return {
      primarySeconds: 60,
      availableOptions: [30, 45, 60, 90],
      label: 'MAX'
    };
  }

  return null;
}
