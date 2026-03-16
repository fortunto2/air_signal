import { NextResponse } from 'next/server';

import { getSensorHistory } from '@/lib/sensor-history';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lon = parseFloat(searchParams.get('lon') || '0');
  const days = parseInt(searchParams.get('days') || '7');

  if (lat === 0 && lon === 0) {
    return NextResponse.json({ error: 'lat and lon required' }, { status: 400 });
  }

  // 1. Model history (Open-Meteo) — always available, labeled as estimate
  const modelUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5,pm10&past_days=${days}`;
  const modelRes = await fetch(modelUrl, { next: { revalidate: 3600 } }).catch(() => null);
  const modelData = modelRes?.ok ? await modelRes.json() : null;

  const modelTimes: string[] = modelData?.hourly?.time || [];
  const modelPm25: (number | null)[] = modelData?.hourly?.pm2_5 || [];
  const modelPm10: (number | null)[] = modelData?.hourly?.pm10 || [];

  // Aggregate model to daily
  const modelDaily: Record<string, { pm25: number; pm10: number; n: number }> = {};
  for (let i = 0; i < modelTimes.length; i++) {
    const date = modelTimes[i].split('T')[0];
    if (!modelDaily[date]) modelDaily[date] = { pm25: 0, pm10: 0, n: 0 };
    if (modelPm25[i] != null) {
      modelDaily[date].pm25 += modelPm25[i]!;
      modelDaily[date].pm10 += (modelPm10[i] ?? 0);
      modelDaily[date].n++;
    }
  }

  // 2. Sensor history (accumulated from comfort API calls)
  const sensorHist = getSensorHistory(lat, lon);

  // Aggregate sensor to daily
  const sensorDaily: Record<string, { pm25: number; pm10: number; n: number }> = {};
  for (const r of sensorHist) {
    const date = new Date(r.ts).toISOString().split('T')[0];
    if (!sensorDaily[date]) sensorDaily[date] = { pm25: 0, pm10: 0, n: 0 };
    sensorDaily[date].pm25 += r.pm25;
    sensorDaily[date].pm10 += r.pm10;
    sensorDaily[date].n++;
  }

  // Combine: all dates from both sources
  const allDates = new Set([...Object.keys(modelDaily), ...Object.keys(sensorDaily)]);
  const points = Array.from(allDates)
    .sort()
    .map(date => {
      const m = modelDaily[date];
      const s = sensorDaily[date];
      return {
        date,
        model_pm25: m ? Math.round(m.pm25 / m.n * 10) / 10 : null,
        sensor_pm25: s ? Math.round(s.pm25 / s.n * 10) / 10 : null,
        // Use sensor if available, model as fallback
        pm25: s ? Math.round(s.pm25 / s.n * 10) / 10
             : m ? Math.round(m.pm25 / m.n * 10) / 10 : null,
      };
    });

  return NextResponse.json({
    points,
    sensor_readings: sensorHist.length,
    note: sensorHist.length > 0
      ? 'Sensor data available (accumulated from visits). Model shown as reference.'
      : 'No sensor history yet. Showing model estimate. Sensor data accumulates with each visit.',
  });
}
