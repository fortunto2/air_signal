import { DataModule } from '../../types';
import { fetchOpenMeteo } from '../apis/open-meteo';

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
    if (!pressures.length) return 50;

    const current = pressures[pressures.length - 1];

    // Ideal: 1013 hPa (standard atmosphere)
    // Deviation penalty: ±20 hPa → 0
    const deviationScore = Math.max(0, 100 - Math.abs(current - 1013) * 5);

    // Rapid change penalty (migraine risk): >5 hPa/3h is bad
    if (pressures.length >= 4) {
      const recent = pressures.slice(-4);
      const change = Math.abs(recent[recent.length - 1] - recent[0]);
      if (change > 5) {
        return Math.max(0, deviationScore - change * 5);
      }
    }

    return deviationScore;
  },
};
