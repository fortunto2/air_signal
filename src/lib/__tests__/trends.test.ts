import { describe, it, expect } from 'vitest';
import { generateMockTrend } from '../trends';

describe('generateMockTrend', () => {
  it('returns correct number of points', () => {
    const trend = generateMockTrend('Alanya', 7);
    expect(trend.length).toBe(7);
  });

  it('is deterministic: same input = same output', () => {
    const trend1 = generateMockTrend('Antalya', 14);
    const trend2 = generateMockTrend('Antalya', 14);
    expect(trend1).toEqual(trend2);
  });

  it('scores are within 40-90 range', () => {
    const trend = generateMockTrend('Gazipasha', 30);
    for (const point of trend) {
      expect(point.score).toBeGreaterThanOrEqual(40);
      expect(point.score).toBeLessThanOrEqual(90);
    }
  });

  it('different cities produce different trends', () => {
    const trend1 = generateMockTrend('Alanya', 7);
    const trend2 = generateMockTrend('Antalya', 7);
    expect(trend1).not.toEqual(trend2);
  });
});
