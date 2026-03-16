import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en`;
  const res = await fetch(url);
  const data = await res.json();

  const results = (data.results || []).map((r: Record<string, unknown>) => ({
    name: r.name,
    country: r.country,
    lat: r.latitude,
    lon: r.longitude,
    admin1: r.admin1 || '',
  }));

  return NextResponse.json({ results });
}
