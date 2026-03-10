import { DataModule } from '../../types';
import { fetchOpenMeteo } from '../apis/open-meteo';

export const pollenModule: DataModule = {
  id: 'pollen',
  name: 'Pollen',
  weight: 0.05,
  icon: 'flower2',
  enabled: true,
  async fetch(lat, lon) {
    const data = await fetchOpenMeteo('air-quality', {
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'birch_pollen,grass_pollen,alder_pollen,ragweed_pollen',
    });
    return data.current;
  },
  normalize(data: {
    birch_pollen?: number;
    grass_pollen?: number;
    alder_pollen?: number;
    ragweed_pollen?: number;
  }) {
    const values = [
      data.birch_pollen ?? 0,
      data.grass_pollen ?? 0,
      data.alder_pollen ?? 0,
      data.ragweed_pollen ?? 0,
    ];
    const maxPollen = Math.max(...values);
    // 0 grains/m³ = 100 (perfect), ≥100 = 0 (severe)
    return Math.max(0, Math.min(100, 100 - maxPollen));
  },
};
