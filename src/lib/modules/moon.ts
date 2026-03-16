import { DataModule } from '../../types';
import { moonPhase, normalizeMoon } from '../airq-core';

export const moonModule: DataModule = {
  id: 'moon',
  name: 'Moon Phase',
  weight: 0.02,
  icon: 'moon',
  enabled: true,
  async fetch() {
    const now = new Date();
    const phase = moonPhase(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return { phase };
  },
  normalize(data: { phase: number }) {
    return normalizeMoon(data.phase);
  },
};
