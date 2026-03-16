import { SubScore, ComfortResult } from '../types';
import { signalComfort, signalWeights, signalNames, type SignalComfort } from './airq-core';

// Weights come from Rust matrix macro — no JS duplicates
export const WEIGHTS: Record<string, number> = (() => {
  const names = signalNames();
  const weights = signalWeights();
  const map: Record<string, number> = {};
  names.forEach((n, i) => { map[n] = weights[i]; });
  return map;
})();

export const calculateComfortIndex = (scores: Record<string, SubScore>): ComfortResult => {
  const input: Omit<SignalComfort, 'total'> = {
    air: scores.air?.normalized ?? 50,
    temperature: scores.temperature?.normalized ?? 50,
    uv: scores.uv?.normalized ?? 50,
    sea: scores.sea?.normalized ?? 50,
    earthquake: scores.earthquake?.normalized ?? 50,
    fire: scores.fire?.normalized ?? 50,
    pollen: scores.pollen?.normalized ?? 50,
    pressure: scores.pressure?.normalized ?? 50,
    geomagnetic: scores.geomagnetic?.normalized ?? 50,
    moon: scores.moon?.normalized ?? 50,
    daylight: scores.daylight?.normalized ?? 50,
  };

  const result = signalComfort(input);

  return {
    totalScore: result.total,
    subScores: scores,
  };
};
