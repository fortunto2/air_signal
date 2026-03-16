export interface TrendPoint {
  date: string;
  score: number;
}

export function generateMockTrend(cityName: string, days: number): TrendPoint[] {
  // Deterministic seed based on city name
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) {
    hash = cityName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Normalize hash to 0-1
  const seed = Math.abs(hash) / 2147483647;
  
  const points: TrendPoint[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Base 65. Sine wave amplitude 15. City offset -10 to 10.
    // Min: 65 - 15 - 10 = 40. Max: 65 + 15 + 10 = 90.
    const cityOffsetAdjusted = (seed * 20) - 10; // -10 to 10
    
    // Use i and seed to create a deterministic sine wave
    const wave = Math.sin((i + seed * 10) * 0.5) * 15;
    
    let score = 65 + wave + cityOffsetAdjusted;
    
    // Clamp to 40-90 just in case
    score = Math.max(40, Math.min(90, score));
    
    points.push({
      date: date.toISOString().split('T')[0],
      score: Math.round(score)
    });
  }
  
  return points;
}
