import { DataModule } from '../../types';
import { fetchOpenMeteo } from '../apis/open-meteo';

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
    // UV Index: 0-2=100, >11=0
    return Math.max(0, 100 - (uv * 9));
  }
};
