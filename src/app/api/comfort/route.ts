import { NextResponse } from 'next/server';
import { SubScore } from '@/types';
import { calculateComfortIndex, WEIGHTS } from '@/lib/comfort-index';
import { airModule } from '@/lib/modules/air';
import { weatherModule } from '@/lib/modules/weather';
import { uvModule } from '@/lib/modules/uv';
import { earthquakeModule } from '@/lib/modules/earthquake';
import { marineModule } from '@/lib/modules/marine';

const modules = [airModule, weatherModule, uvModule, earthquakeModule, marineModule];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lon = parseFloat(searchParams.get('lon') || '0');

  const subScores: Record<string, SubScore> = {};

  for (const mod of modules) {
    if (mod.enabled) {
      const raw = await mod.fetch(lat, lon);
      const normalized = mod.normalize(raw);
      subScores[mod.id] = {
        id: mod.id,
        value: typeof raw === 'number' ? raw : 0,
        normalized,
        weight: WEIGHTS[mod.id as keyof typeof WEIGHTS] || 0,
      };
    }
  }

  const result = calculateComfortIndex(subScores);
  return NextResponse.json(result);
}