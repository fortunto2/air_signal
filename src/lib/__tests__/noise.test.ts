import { describe, it, expect } from 'vitest';
import { noiseModule } from '../modules/noise';

describe('noiseModule', () => {
  describe('normalize', () => {
    it('should return 100 for quiet environments (<= 40dB)', () => {
      expect(noiseModule.normalize({ decibels: 30 })).toBe(100);
      expect(noiseModule.normalize({ decibels: 40 })).toBe(100);
    });

    it('should return 0 for loud environments (>= 85dB)', () => {
      expect(noiseModule.normalize({ decibels: 85 })).toBe(0);
      expect(noiseModule.normalize({ decibels: 90 })).toBe(0);
    });

    it('should interpolate linearly between 40dB and 85dB', () => {
      // 62.5 is exactly halfway between 40 and 85
      // 100 - ((62.5 - 40) / 45) * 100 = 100 - (22.5 / 45) * 100 = 100 - 50 = 50
      expect(noiseModule.normalize({ decibels: 62.5 })).toBe(50);
      
      // 49 is 1/5th of the way from 40 to 85
      // 100 - ((49 - 40) / 45) * 100 = 100 - (9 / 45) * 100 = 100 - 20 = 80
      expect(noiseModule.normalize({ decibels: 49 })).toBe(80);
    });

    it('should handle missing data gracefully', () => {
      expect(noiseModule.normalize({})).toBe(100); // defaults to 40dB
      expect(noiseModule.normalize(null)).toBe(100);
    });
  });

  describe('fetch', () => {
    it('should return deterministic decibels based on lat/lon', async () => {
      const result1 = await noiseModule.fetch(40.7128, -74.0060); // NYC
      const result2 = await noiseModule.fetch(40.7128, -74.0060);
      
      expect(result1).toHaveProperty('decibels');
      expect(typeof (result1 as any).decibels).toBe('number');
      expect((result1 as any).decibels).toBe((result2 as any).decibels);
    });
  });
});
