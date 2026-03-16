import { NextResponse } from 'next/server';

interface CityAqi {
  name: string;
  country: string;
  lat: number;
  lon: number;
  pm25: number;
  aqi: number;
  source: string;
}

const POPULAR_CITIES = [
  { name: 'Gazipasha', country: 'Turkey', lat: 36.27, lon: 32.32 },
  { name: 'Alanya', country: 'Turkey', lat: 36.54, lon: 32.00 },
  { name: 'Antalya', country: 'Turkey', lat: 36.89, lon: 30.71 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.01, lon: 28.98 },
  { name: 'Barcelona', country: 'Spain', lat: 41.39, lon: 2.17 },
  { name: 'Lisbon', country: 'Portugal', lat: 38.72, lon: -9.14 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.76, lon: 100.50 },
  { name: 'Bali', country: 'Indonesia', lat: -8.34, lon: 115.09 },
  { name: 'Dubai', country: 'UAE', lat: 25.20, lon: 55.27 },
  { name: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.41 },
  { name: 'Moscow', country: 'Russia', lat: 55.76, lon: 37.62 },
  { name: 'Tbilisi', country: 'Georgia', lat: 41.69, lon: 44.80 },
];

function pm25ToAqi(pm25: number): number {
  if (pm25 <= 12) return Math.round((pm25 / 12) * 50);
  if (pm25 <= 35.4) return Math.round(51 + ((pm25 - 12.1) / 23.3) * 49);
  if (pm25 <= 55.4) return Math.round(101 + ((pm25 - 35.5) / 19.9) * 49);
  return Math.min(500, Math.round(151 + ((pm25 - 55.5) / 94.9) * 49));
}

async function fetchSensorMedian(lat: number, lon: number): Promise<number | null> {
  try {
    const res = await fetch(
      `https://data.sensor.community/airrohr/v1/filter/area=${lat},${lon},10`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data: Array<Record<string, unknown>> = await res.json();
    const pm25s: number[] = [];
    for (const s of data) {
      const vals = s.sensordatavalues as Array<Record<string, string>>;
      if (!vals) continue;
      for (const v of vals) {
        if (v.value_type === 'P2') {
          const val = parseFloat(v.value);
          if (val > 0 && val < 500) pm25s.push(val);
        }
      }
    }
    if (pm25s.length === 0) return null;
    pm25s.sort((a, b) => a - b);
    return pm25s[Math.floor(pm25s.length / 2)];
  } catch {
    return null;
  }
}

export async function GET() {
  // Fetch Open-Meteo model for all cities (single batch request)
  const lats = POPULAR_CITIES.map(c => c.lat).join(',');
  const lons = POPULAR_CITIES.map(c => c.lon).join(',');
  const modelUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}&current=pm2_5`;

  // Fetch sensors for all cities in parallel (5s timeout each)
  const [modelRes, ...sensorResults] = await Promise.allSettled([
    fetch(modelUrl).then(r => r.json()),
    ...POPULAR_CITIES.map(c => fetchSensorMedian(c.lat, c.lon)),
  ]);

  const modelData = modelRes.status === 'fulfilled' ? modelRes.value : null;
  const modelItems = Array.isArray(modelData) ? modelData : modelData ? [modelData] : [];

  const results: CityAqi[] = [];

  for (let i = 0; i < POPULAR_CITIES.length; i++) {
    const modelPm25 = modelItems[i]?.current?.pm2_5 ?? 0;
    const sensorPm25 = sensorResults[i]?.status === 'fulfilled'
      ? (sensorResults[i] as PromiseFulfilledResult<number | null>).value
      : null;

    // Merge: sensors primary, model fallback
    let pm25: number;
    let source: string;
    if (sensorPm25 != null && modelPm25 > 0) {
      const div = sensorPm25 > 1 ? Math.max(modelPm25 / sensorPm25, sensorPm25 / modelPm25) : 1;
      const mw = Math.min(0.2, 0.2 / (1 + Math.exp((div - 1) * 2)));
      pm25 = sensorPm25 * (1 - mw) + modelPm25 * mw;
      source = 'sensors';
    } else if (sensorPm25 != null) {
      pm25 = sensorPm25;
      source = 'sensors';
    } else {
      pm25 = modelPm25;
      source = 'model';
    }

    results.push({
      ...POPULAR_CITIES[i],
      pm25: Math.round(pm25 * 10) / 10,
      aqi: pm25ToAqi(pm25),
      source,
    });
  }

  results.sort((a, b) => a.aqi - b.aqi);

  return NextResponse.json({ cities: results });
}
