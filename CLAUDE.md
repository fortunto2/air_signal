# CLAUDE.md — Air Signal

> Modular life signal platform: environmental comfort + personal biometrics.

## Stack

- Next.js 15 (App Router) + TypeScript strict
- Tailwind CSS v4 + shadcn/ui
- Recharts for charts
- SWR for data fetching
- Cloudflare Pages hosting
- pnpm package manager

## Commands

```bash
pnpm dev          # Development server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check (tsc --noEmit)
```

## Architecture

Every data source is a **DataModule** plugin:

```
src/lib/modules/    # DataModule implementations (air, weather, marine, uv, earthquake, fire, pollen, pressure, geomagnetic, moon, daylight)
src/lib/apis/       # API client functions (open-meteo, usgs, nasa-firms, noaa-swpc)
src/lib/comfort-index.ts  # Weighted comfort score calculation
src/components/     # UI components (ComfortScore, MetricCard, CitySelector, etc.)
src/app/[city]/     # Dynamic city dashboard
src/app/compare/    # City comparison
src/app/cities/     # SEO city pages (SSG)
src/types/          # TypeScript interfaces
```

### DataModule Interface

```typescript
interface DataModule {
  id: string;
  name: string;
  fetch(lat: number, lon: number): Promise<ModuleData>;
  normalize(raw: unknown): SubScore;  // → 0-100
  weight: number;
  icon: string;
  enabled: boolean;
}
```

## Key APIs (all free, no auth except FIRMS)

- Open-Meteo: weather, air quality, marine, pollen, geocoding
- USGS: earthquakes (GeoJSON feed)
- NASA FIRMS: active fires
- NOAA SWPC: geomagnetic Kp index
- Sensor.Community: local air sensors

## Principles

- SOLID, DRY, KISS
- TDD for business logic (comfort index, normalization)
- Schemas-first: TypeScript interfaces for ALL API responses
- Modular: every data source is a plug-in module
- Mobile-first responsive design
- Dark mode default
- Privacy-first (Phase 2 health data on-device only)

## Current State

- Basic project scaffolded with Next.js + Tailwind + shadcn
- Single AirQualityDisplay component exists
- API route for sensor data exists
- Need: full DataModule system, comfort index, city dashboard, comparison, charts

## Phase 1 MVP Scope

See docs/prd.md for full PRD. Phase 1:
1. F1: Multi-city dashboard with comfort score (0-100)
2. F2: City comparison view (2-3 cities side-by-side)
3. F3: Historical charts (24h/7d/30d)
4. F4: Programmatic city pages (SEO)
