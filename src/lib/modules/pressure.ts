import { DataModule } from '../../types';
import { fetchOpenMeteo } from '../apis/open-meteo';
import { normalizePressure } from '../airq-core';

export const pressureModule: DataModule = {
  id: 'pressure',
  name: 'Pressure',
  weight: 0.05,
  icon: 'gauge',
  enabled: true,
  async fetch(lat, lon) {
    const data = await fetchOpenMeteo('forecast', {
      latitude: lat.toString(),
      longitude: lon.toString(),
      hourly: 'surface_pressure',
      forecast_days: '1',
    });
    return data.hourly?.surface_pressure ?? [];
  },
  normalize(pressures: number[]) {
    if (!pressures.length) return normalizePressure(1013);

    const current = pressures[pressures.length - 1];
    let change3h: number | undefined;

    if (pressures.length >= 4) {
      const recent = pressures.slice(-4);
      change3h = Math.abs(recent[recent.length - 1] - recent[0]);
    }

    return normalizePressure(current, change3h);
  },
};
