import { DataModule } from '../../types';
import { normalizeGeomagnetic } from '../airq-core';

export const geomagneticModule: DataModule = {
  id: 'geomagnetic',
  name: 'Geomagnetic',
  weight: 0.03,
  icon: 'compass',
  enabled: true,
  async fetch() {
    const url =
      'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';
    const response = await fetch(url);
    if (!response.ok) return { kp: 0 };
    const data: string[][] = await response.json();
    if (data.length < 2) return { kp: 0 };
    const latest = data[data.length - 1];
    return { kp: parseFloat(latest[1]) || 0 };
  },
  normalize(data: { kp: number }) {
    return normalizeGeomagnetic(data.kp);
  },
};
