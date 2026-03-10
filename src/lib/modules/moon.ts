import { DataModule } from '../../types';

export const moonModule: DataModule = {
  id: 'moon',
  name: 'Moon Phase',
  weight: 0.02,
  icon: 'moon',
  enabled: true,
  async fetch() {
    // Pure calculation — no API needed
    const now = new Date();
    const phase = getMoonPhase(now);
    return { phase };
  },
  normalize(data: { phase: number }) {
    // phase: 0 = new moon, 0.5 = full moon
    // Full moon (0.5) correlates with poorer sleep quality
    // New moon & quarter moons = best sleep
    // Score: distance from full moon → higher is better
    const distFromFull = Math.abs(data.phase - 0.5);
    // distFromFull: 0 (full) to 0.5 (new)
    return Math.round(distFromFull * 200); // 0-100
  },
};

/** Calculate moon phase 0-1 using Conway's algorithm */
function getMoonPhase(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let r = year % 100;
  r %= 19;
  if (r > 9) r -= 19;
  r = ((r * 11) % 30) + month + day;
  if (month < 3) r += 2;
  r -= (year < 2000 ? 4 : 8.3);
  r = Math.floor(r + 0.5) % 30;
  if (r < 0) r += 30;

  return r / 30; // 0 to ~1
}
