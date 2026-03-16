/**
 * airq-core WASM bridge.
 * All calculations run in Rust via WASM. No JS fallbacks.
 */

import init, {
  wasm_pm25_aqi,
  wasm_pm10_aqi,
  wasm_overall_aqi,
  wasm_aqi_category,
  wasm_comfort_score,
  wasm_pollutant_status,
  wasm_geomagnetic,
  wasm_pollen_status,
  wasm_haversine,
  wasm_wind_direction,
  wasm_normalize_air,
  wasm_normalize_temperature,
  wasm_normalize_uv,
  wasm_normalize_marine,
  wasm_normalize_earthquake,
  wasm_normalize_fire,
  wasm_normalize_pollen,
  wasm_normalize_pressure,
  wasm_normalize_geomagnetic,
  wasm_normalize_moon,
  wasm_normalize_daylight,
  wasm_normalize_humidity,
  wasm_normalize_noise,
  wasm_moon_phase,
  wasm_signal_comfort,
  wasm_signal_vector,
  wasm_feature_names,
  wasm_progress_bar,
  wasm_matrix_push,
  wasm_matrix_latest,
  wasm_matrix_slice,
  wasm_matrix_ml_vector,
  wasm_matrix_summary,
  wasm_signal_names,
  wasm_signal_weights,
} from 'airq-core';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AqiCategoryInfo {
  label: string;
  emoji: string;
  color: string;
}

export interface SignalComfort {
  total: number;
  air: number;
  temperature: number;
  uv: number;
  sea: number;
  earthquake: number;
  fire: number;
  pollen: number;
  pressure: number;
  geomagnetic: number;
  moon: number;
  daylight: number;
}

export interface PollenStatus {
  significant: boolean;
  grass?: string;
  birch?: string;
  alder?: string;
  ragweed?: string;
}

export interface WindDirection {
  label: string;
  arrow: string;
}

export interface SignalVector {
  features: number[]; // 11 floats 0.0-1.0
  comfort: number;    // weighted 0.0-1.0
  label: string;      // "excellent" | "good" | "fair" | "poor" | "bad"
}

// ---------------------------------------------------------------------------
// Init — must be called before any other function
// ---------------------------------------------------------------------------

let ready = false;

export async function initAirqCore(): Promise<void> {
  if (ready) return;
  await init();
  ready = true;
}

export function isReady(): boolean {
  return ready;
}

// ---------------------------------------------------------------------------
// AQI
// ---------------------------------------------------------------------------

export const pm25Aqi = wasm_pm25_aqi;
export const pm10Aqi = wasm_pm10_aqi;

export function overallAqi(json: string): number {
  return wasm_overall_aqi(json);
}

export function aqiCategory(aqi: number): AqiCategoryInfo {
  return JSON.parse(wasm_aqi_category(aqi));
}

export function pollutantStatus(
  pollutant: 'pm25' | 'pm10' | 'co' | 'no2' | 'so2' | 'o3',
  value: number,
): AqiCategoryInfo {
  return JSON.parse(wasm_pollutant_status(pollutant, value));
}

// ---------------------------------------------------------------------------
// Signal normalize (all modules)
// ---------------------------------------------------------------------------

export const normalizeAir = wasm_normalize_air;
export const normalizeTemperature = wasm_normalize_temperature;
export const normalizeUv = wasm_normalize_uv;
export const normalizeMarine = wasm_normalize_marine;
export const normalizeEarthquake = wasm_normalize_earthquake;
export const normalizeFire = wasm_normalize_fire;
export const normalizePollen = wasm_normalize_pollen;
export const normalizeGeomagnetic = wasm_normalize_geomagnetic;
export const normalizeMoon = wasm_normalize_moon;
export const normalizeDaylight = wasm_normalize_daylight;
export const normalizeHumidity = wasm_normalize_humidity;
export const normalizeNoise = wasm_normalize_noise;
export const moonPhase = wasm_moon_phase;

export function normalizePressure(currentHpa: number, change3h?: number): number {
  return wasm_normalize_pressure(currentHpa, change3h ?? NaN);
}

// ---------------------------------------------------------------------------
// Signal comfort index (full 11-module weighted)
// ---------------------------------------------------------------------------

export function signalComfort(scores: Omit<SignalComfort, 'total'>): SignalComfort {
  const input = { ...scores, total: 0 };
  return JSON.parse(wasm_signal_comfort(JSON.stringify(input)));
}

// ---------------------------------------------------------------------------
// Feature vector for ML / classification
// ---------------------------------------------------------------------------

export function signalVector(scores: Omit<SignalComfort, 'total'>): SignalVector {
  const input = { ...scores, total: 0 };
  return JSON.parse(wasm_signal_vector(JSON.stringify(input)));
}

export function featureNames(): string[] {
  return JSON.parse(wasm_feature_names());
}

// ---------------------------------------------------------------------------
// Comfort (original 6-component for CLI compat)
// ---------------------------------------------------------------------------

export function comfortScore(json: string): string {
  return wasm_comfort_score(json);
}

// ---------------------------------------------------------------------------
// Geo & utilities
// ---------------------------------------------------------------------------

export function geomagnetic(kp: number): { kp_index: number; label: string } {
  return JSON.parse(wasm_geomagnetic(kp));
}

export function pollenStatus(json: string): PollenStatus {
  return JSON.parse(wasm_pollen_status(json));
}

export const haversine = wasm_haversine;

export function windDirection(degrees: number): WindDirection {
  return JSON.parse(wasm_wind_direction(degrees));
}

export const progressBar = wasm_progress_bar;

// ---------------------------------------------------------------------------
// Matrix (time-series + single-point)
// ---------------------------------------------------------------------------

export interface MatrixSummary {
  rows: number;
  columns: Array<{
    name: string;
    min: number;
    max: number;
    mean: number;
    std_dev: number;
    count: number;
  }>;
}

export interface MlVector {
  features: number[];
  names: string[];
  comfort: number;
  label: string;
}

/** Push a row into a matrix. Returns updated matrix JSON string. */
export function matrixPush(matrixJson: string, ts: number, scores: number[]): string {
  return wasm_matrix_push(matrixJson, ts, JSON.stringify(scores));
}

/** Get latest row as SignalComfort. */
export function matrixLatest(matrixJson: string): SignalComfort {
  return JSON.parse(wasm_matrix_latest(matrixJson));
}

/** Get sub-matrix for last N hours. */
export function matrixSlice(matrixJson: string, hours: number): string {
  return wasm_matrix_slice(matrixJson, hours);
}

/** Get 35-dim ML feature vector from matrix. */
export function matrixMlVector(matrixJson: string): MlVector {
  return JSON.parse(wasm_matrix_ml_vector(matrixJson));
}

/** Get per-column summary statistics. */
export function matrixSummary(matrixJson: string): MatrixSummary {
  return JSON.parse(wasm_matrix_summary(matrixJson));
}

/** Signal column names from Rust macro. */
export function signalNames(): string[] {
  return JSON.parse(wasm_signal_names());
}

/** Signal weights from Rust macro. */
export function signalWeights(): number[] {
  return JSON.parse(wasm_signal_weights());
}
