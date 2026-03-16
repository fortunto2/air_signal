import { NextResponse } from 'next/server';

interface CityResult {
  name: string;
  country: string;
  lat: number;
  lon: number;
  pm25: number;
  aqi: number;
  sensors: number;
  source: 'sensors' | 'no-sensors';
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

// In-memory cache (survives across requests in same serverless instance)
let cache: { cities: CityResult[]; ts: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 min

async function fetchSensorData(lat: number, lon: number): Promise<{ median: number; count: number } | null> {
  try {
    const res = await fetch(
      `https://data.sensor.community/airrohr/v1/filter/area=${lat},${lon},10`,
      { signal: AbortSignal.timeout(12000) } // 12s — wait, don't rush
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
    return { median: pm25s[Math.floor(pm25s.length / 2)], count: pm25s.length };
  } catch {
    return null;
  }
}

async function buildRanking(): Promise<CityResult[]> {
  // Fetch all cities sensors in parallel — wait for all, no model fallback
  const sensorResults = await Promise.allSettled(
    POPULAR_CITIES.map(c => fetchSensorData(c.lat, c.lon))
  );

  const results: CityResult[] = [];

  for (let i = 0; i < POPULAR_CITIES.length; i++) {
    const sensor = sensorResults[i].status === 'fulfilled'
      ? (sensorResults[i] as PromiseFulfilledResult<{ median: number; count: number } | null>).value
      : null;

    if (sensor) {
      results.push({
        ...POPULAR_CITIES[i],
        pm25: Math.round(sensor.median * 10) / 10,
        aqi: pm25ToAqi(sensor.median),
        sensors: sensor.count,
        source: 'sensors',
      });
    } else {
      // No sensors — show city but mark clearly
      results.push({
        ...POPULAR_CITIES[i],
        pm25: 0,
        aqi: 0,
        sensors: 0,
        source: 'no-sensors',
      });
    }
  }

  // Sort: cities with sensors first (by AQI), then no-sensor cities last
  results.sort((a, b) => {
    if (a.source === 'no-sensors' && b.source !== 'no-sensors') return 1;
    if (a.source !== 'no-sensors' && b.source === 'no-sensors') return -1;
    return a.aqi - b.aqi;
  });

  return results;
}

export async function GET() {
  // Return cache if fresh
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json({ cities: cache.cities, cached: true });
  }

  const cities = await buildRanking();
  cache = { cities, ts: Date.now() };

  return NextResponse.json({ cities, cached: false });
}
