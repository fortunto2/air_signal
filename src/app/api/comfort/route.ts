import { NextResponse } from 'next/server';
import { fetchComfortScores } from '@/lib/comfort-index';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lon = parseFloat(searchParams.get('lon') || '0');

  const result = await fetchComfortScores(lat, lon);
  return NextResponse.json(result);
}
