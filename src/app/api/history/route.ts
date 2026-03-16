import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lon = parseFloat(searchParams.get('lon') || '0');
  const days = parseInt(searchParams.get('days') || '7');

  if (lat === 0 && lon === 0) {
    return NextResponse.json({ error: 'lat and lon required' }, { status: 400 });
  }

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5,pm10&past_days=${days}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return NextResponse.json({ error: 'API error' }, { status: 502 });

  const data = await res.json();
  const times: string[] = data.hourly?.time || [];
  const pm25: (number | null)[] = data.hourly?.pm2_5 || [];
  const pm10: (number | null)[] = data.hourly?.pm10 || [];

  // Aggregate to daily averages
  const daily: Record<string, { pm25Sum: number; pm10Sum: number; count: number }> = {};
  for (let i = 0; i < times.length; i++) {
    const date = times[i].split('T')[0];
    if (!daily[date]) daily[date] = { pm25Sum: 0, pm10Sum: 0, count: 0 };
    if (pm25[i] != null) {
      daily[date].pm25Sum += pm25[i]!;
      daily[date].pm10Sum += (pm10[i] ?? 0);
      daily[date].count++;
    }
  }

  const points = Object.entries(daily)
    .filter(([, v]) => v.count > 0)
    .map(([date, v]) => ({
      date,
      pm25: Math.round(v.pm25Sum / v.count * 10) / 10,
      pm10: Math.round(v.pm10Sum / v.count * 10) / 10,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ points, source: 'open-meteo-model' });
}
