import { NextResponse } from 'next/server';

interface PollutionSource {
  name: string;
  type: string;
  lat: number;
  lon: number;
}

// In-memory cache per location (key: "lat,lon")
const cache = new Map<string, { sources: PollutionSource[]; ts: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lon = parseFloat(searchParams.get('lon') || '0');
  const radius = parseInt(searchParams.get('radius') || '15');

  if (lat === 0 && lon === 0) {
    return NextResponse.json({ sources: [] });
  }

  const key = `${lat.toFixed(2)},${lon.toFixed(2)},${radius}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({ sources: cached.sources, cached: true });
  }

  // Overpass query: factories, power plants, industrial areas, major highways nearby
  const query = `
    [out:json][timeout:10];
    (
      nwr["man_made"="works"](around:${radius * 1000},${lat},${lon});
      nwr["power"="plant"](around:${radius * 1000},${lat},${lon});
      nwr["industrial"](around:${radius * 1000},${lat},${lon});
      nwr["landuse"="industrial"](around:${radius * 1000},${lat},${lon});
    );
    out center 50;
  `;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) return NextResponse.json({ sources: [] });

    const data = await res.json();
    const sources: PollutionSource[] = [];
    const seen = new Set<string>();

    for (const el of data.elements || []) {
      const elLat = el.center?.lat ?? el.lat;
      const elLon = el.center?.lon ?? el.lon;
      if (!elLat || !elLon) continue;

      const name = el.tags?.name || el.tags?.operator || el.tags?.['industrial'] || 'Unknown';
      const posKey = `${elLat.toFixed(3)},${elLon.toFixed(3)}`;
      if (seen.has(posKey)) continue;
      seen.add(posKey);

      let type = 'industrial';
      if (el.tags?.['power'] === 'plant') type = 'power_plant';
      else if (el.tags?.['man_made'] === 'works') type = 'factory';

      sources.push({ name, type, lat: elLat, lon: elLon });
    }

    cache.set(key, { sources, ts: Date.now() });
    return NextResponse.json({ sources, cached: false });
  } catch {
    return NextResponse.json({ sources: [] });
  }
}
