export interface SubScore {
  id: string;
  value: number;
  normalized: number; // 0 to 100
  weight: number;
}

export interface ComfortResult {
  totalScore: number;
  subScores: Record<string, SubScore>;
}

export interface DataModule {
  id: string;
  name: string;
  weight: number;
  icon: string;
  enabled: boolean;
  fetch(lat: number, lon: number): Promise<unknown>;
  normalize(data: unknown): number;
}

export interface CityConfig {
  name: string;
  lat: number;
  lon: number;
}
