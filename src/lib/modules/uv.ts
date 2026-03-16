import { DataModule } from '../../types';
import { fetchOpenMeteo } from '../apis/open-meteo';
import { normalizeUv } from '../airq-core';

export const uvModule: DataModule = {
  id: 'uv',
  name: 'UV Index',
  weight: 0.08,
  icon: 'sun',
  enabled: true,
  async fetch(lat, lon) {
    const data = await fetchOpenMeteo('forecast', {
      latitude: lat.toString(),
      longitude: lon.toString(),
      hourly: 'uv_index',
    });
    return data.hourly.uv_index[0] || 0;
  },
  normalize(uv: number) {
    return normalizeUv(uv);
  },
};
