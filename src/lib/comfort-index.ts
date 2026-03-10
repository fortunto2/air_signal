import { SubScore, ComfortResult } from '../types';

export const WEIGHTS = {
  air: 0.22,
  temperature: 0.18,
  wind: 0.12,
  uv: 0.08,
  sea: 0.12,
  earthquake: 0.08,
  fire: 0.05,
  pollen: 0.05,
  pressure: 0.05,
  geomagnetic: 0.03,
  daylight: 0.02,
};

export const calculateComfortIndex = (scores: Record<string, SubScore>): ComfortResult => {
  const enabledScores = Object.values(scores).filter((s) => s.weight > 0);
  const totalWeight = enabledScores.reduce((sum, s) => sum + s.weight, 0);
  
  const totalScore = totalWeight > 0 
    ? enabledScores.reduce((sum, s) => sum + (s.normalized * (s.weight / totalWeight)), 0)
    : 0;

  return {
    totalScore,
    subScores: scores,
  };
};
