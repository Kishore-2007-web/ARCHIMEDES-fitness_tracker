import { UserAttributes, RankTier } from '../../types/auth';

export interface AttributeGains {
  strength: number;
  endurance: number;
  agility: number;
  mobility: number;
  discipline: number;
  focus: number;
}

/**
 * Calculates attribute progression for a session
 */
export function calculateAttributeGains(params: {
  weekday: number;
  status: 'completed' | 'reduced' | 'exception' | 'missed';
  prCount: number;
  bossBonusAttribute?: { attribute: keyof UserAttributes; amount: number };
}): AttributeGains {
  const { weekday, status, prCount, bossBonusAttribute } = params;

  const gains: AttributeGains = {
    strength: 0,
    endurance: 0,
    agility: 0,
    mobility: 0,
    discipline: 0,
    focus: 0
  };

  if (status === 'missed') {
    return gains; // No gains on unapproved missed workouts
  }

  // Multiplier based on status
  const multiplier = status === 'reduced' ? 0.6 : status === 'exception' ? 0.2 : 1.0;

  // Base fractional gains per weekday
  switch (weekday) {
    case 1: // Monday: STR, DIS, FOC
      gains.strength += 0.5 * multiplier;
      gains.discipline += 0.4 * multiplier;
      gains.focus += 0.3 * multiplier;
      break;
    case 2: // Tuesday: AGI, MOB, END, DIS
      gains.agility += 0.5 * multiplier;
      gains.mobility += 0.4 * multiplier;
      gains.endurance += 0.4 * multiplier;
      gains.discipline += 0.3 * multiplier;
      break;
    case 3: // Wednesday: STR, END, DIS
      gains.strength += 0.5 * multiplier;
      gains.endurance += 0.4 * multiplier;
      gains.discipline += 0.4 * multiplier;
      break;
    case 4: // Thursday: AGI, END, MOB
      gains.agility += 0.5 * multiplier;
      gains.endurance += 0.4 * multiplier;
      gains.mobility += 0.4 * multiplier;
      break;
    case 5: // Friday: STR, DIS, FOC
      gains.strength += 0.5 * multiplier;
      gains.discipline += 0.4 * multiplier;
      gains.focus += 0.3 * multiplier;
      break;
    case 6: // Saturday: STR, END, AGI, DIS
      gains.strength += 0.4 * multiplier;
      gains.endurance += 0.4 * multiplier;
      gains.agility += 0.4 * multiplier;
      gains.discipline += 0.4 * multiplier;
      break;
    case 0: // Sunday: MOB, END, FOC
      gains.mobility += 0.5 * multiplier;
      gains.endurance += 0.3 * multiplier;
      gains.focus += 0.4 * multiplier;
      break;
  }

  // PR bonus (+0.3 per PR, up to 1.0)
  if (prCount > 0 && status === 'completed') {
    const prGain = Math.min(1.0, prCount * 0.3);
    gains.strength += prGain;
    gains.focus += prGain * 0.5;
  }

  // Boss bonus attribute
  if (bossBonusAttribute) {
    gains[bossBonusAttribute.attribute] += bossBonusAttribute.amount;
  }

  return gains;
}

/**
 * Applies gains to existing attributes and clamps between 20 and 100
 */
export function applyAttributeGains(
  current: UserAttributes,
  gains: AttributeGains
): UserAttributes {
  const clamp = (val: number) => Math.min(100, Math.max(20, Math.round((val + Number.EPSILON) * 10) / 10));

  return {
    strength: clamp(current.strength + gains.strength),
    endurance: clamp(current.endurance + gains.endurance),
    agility: clamp(current.agility + gains.agility),
    mobility: clamp(current.mobility + gains.mobility),
    discipline: clamp(current.discipline + gains.discipline),
    focus: clamp(current.focus + gains.focus)
  };
}

/**
 * Computes System Power and Rank according to Section 51 & 52
 */
export function calculateSystemPower(params: {
  attributes: UserAttributes;
  consistencyScore: number;     // 0 to 100
  completionScore: number;      // 0 to 100
  performanceProgress: number;  // 0 to 100
  bossScore: number;            // 0 to 100
}): { systemPower: number; rank: RankTier } {
  const { attributes, consistencyScore, completionScore, performanceProgress, bossScore } = params;

  // Attribute Composite:
  // STR * 0.20 + END * 0.15 + AGI * 0.15 + MOB * 0.15 + DIS * 0.20 + FOC * 0.15
  const attributeComposite =
    attributes.strength * 0.20 +
    attributes.endurance * 0.15 +
    attributes.agility * 0.15 +
    attributes.mobility * 0.15 +
    attributes.discipline * 0.20 +
    attributes.focus * 0.15;

  // System Power =
  // Composite * 0.35 + Consistency * 0.20 + Completion * 0.20 + Performance * 0.15 + Boss * 0.10
  const rawPower =
    attributeComposite * 0.35 +
    consistencyScore * 0.20 +
    completionScore * 0.20 +
    performanceProgress * 0.15 +
    bossScore * 0.10;

  const systemPower = Math.min(100, Math.max(0, Math.round(rawPower)));

  let rank: RankTier = 'E';
  if (systemPower >= 85) rank = 'S';
  else if (systemPower >= 70) rank = 'A';
  else if (systemPower >= 55) rank = 'B';
  else if (systemPower >= 40) rank = 'C';
  else if (systemPower >= 25) rank = 'D';
  else rank = 'E';

  return { systemPower, rank };
}
