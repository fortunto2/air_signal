import { NextResponse } from 'next/server';

interface SensorPoint {
  id: number;
  lat: number;
  lon: number;
  pm25: number;
  pm10: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lon = parseFloat(searchParams.get('lon') || '0');
  const radius = parseInt(searchParams.get('radius') || '15');

  if (lat === 0 && lon === 0) {
    return NextResponse.json({ sensors: [] });
  }

  try {
    const url = `https://data.sensor.community/airrohr/v1/filter/area=${lat},${lon},${radius}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return NextResponse.json({ sensors: [] });

    const data: Array<Record<string, unknown>> = await res.json();
    const seen = new Map<number, SensorPoint>();

    for (const s of data) {
      const sid = (s.sensor as Record<string, unknown>)?.id as number;
      if (!sid) continue;

      const loc = s.location as Record<string, unknown>;
      const slat = parseFloat(loc?.latitude as string);
      const slon = parseFloat(loc?.longitude as string);
      if (isNaN(slat) || isNaN(slon)) continue;

      const values = s.sensordatavalues as Array<Record<string, string>>;
      if (!values) continue;

      let pm25 = 0, pm10 = 0;
      for (const v of values) {
        const val = parseFloat(v.value);
        if (isNaN(val) || val <= 0 || val > 500) continue;
        if (v.value_type === 'P2') pm25 = val;
        if (v.value_type === 'P1') pm10 = val;
      }

      if (pm25 > 0 || pm10 > 0) {
        seen.set(sid, { id: sid, lat: slat, lon: slon, pm25, pm10 });
      }
    }

    return NextResponse.json({
      sensors: Array.from(seen.values()),
      count: seen.size,
    });
  } catch {
    return NextResponse.json({ sensors: [], count: 0 });
  }
}
