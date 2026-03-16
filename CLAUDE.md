# CLAUDE.md — Air Signal

Environmental comfort dashboard. Any city, real-time, Rust WASM core.

## Stack

- Next.js 16 (App Router) + TypeScript strict
- Tailwind CSS v4 + shadcn/ui
- Leaflet (dark map with AQI markers)
- SWR for data fetching
- airq-core WASM (Rust: sigmoid normalize, comfort index, cities DB)
- Cloudflare Pages hosting
- pnpm

## Commands

```bash
pnpm dev --webpack     # Dev server (webpack for WASM support)
pnpm build --webpack   # Production build
pnpm lint              # ESLint

# Rebuild WASM after airq-core changes:
cd ../airq/airq-core && wasm-pack build --target web --features wasm --no-default-features
```

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Main dashboard: map + search + top + comfort
│   ├── [city]/page.tsx       # City detail page
│   └── api/
│       ├── comfort/route.ts  # Comfort scores (Sensor.Community + Open-Meteo merge)
│       ├── geocode/route.ts  # City search (Open-Meteo Geocoding)
│       ├── top/route.ts      # Top 12 cities AQI ranking
│       └── sensor/route.ts   # Gazipasha sensor proxy
├── components/
│   ├── CityMap.tsx           # Leaflet dark map, AQI-colored circles
│   ├── CitySearch.tsx        # Autocomplete with debounce
│   ├── ComfortPanel.tsx      # 14-signal bar chart
│   ├── TopCities.tsx         # Ranked AQI sidebar
│   ├── AirqCoreProvider.tsx  # WASM init on client
│   └── ui/card.tsx           # shadcn card
├── lib/
│   ├── airq-core.ts          # WASM bridge — all Rust functions typed
│   ├── comfort-index.ts      # Delegates to Rust signalComfort()
│   ├── cities.ts             # Hardcoded presets (Gazipasha, Alanya, Antalya)
│   └── modules/              # 14 DataModule plugins (fetch + Rust normalize)
│       ├── air.ts            # PM2.5 → normalizeAir (sigmoid)
│       ├── weather.ts        # Temperature → gaussian(23, 12)
│       ├── wind.ts           # Wind speed → sigmoid_desc(25, 0.12)
│       └── ...               # uv, marine, earthquake, fire, pollen, pressure,
│                             # geomagnetic, humidity, daylight, noise, moon
└── types/index.ts            # DataModule, SubScore, ComfortResult, CityConfig
```

## Data Flow

```
API Routes (server-side):
  /api/comfort → fetch Sensor.Community + Open-Meteo → merge (dynamic weight) → sigmoid scores
  /api/top     → batch Open-Meteo AQI for 12 cities → sort
  /api/geocode → Open-Meteo Geocoding → autocomplete results

Client (WASM):
  airq-core.ts → init() → normalizeAir/Temperature/... → ComfortPanel renders bars
  signalNames(), signalWeights() → from Rust macro constants (no JS duplicates)
```

## Key Design Decisions

- **Sensor.Community primary, Open-Meteo fallback** — merge by divergence in /api/comfort
- **All normalize in Rust** — sigmoid/gaussian, no JS fallbacks
- **Weights from Rust macro** — `signalWeights()` WASM call, no hardcoded JS weights
- **14 signals** — air, temperature, wind, sea, uv, earthquake, fire, pollen, pressure, geomagnetic, humidity, daylight, noise, moon
- **WASM 1.49MB** — cities DB embedded (~40K cities for offline search)
- **Dark mode** default, mobile-first

## APIs Used (server-side, all free)

- Sensor.Community: live PM2.5/PM10 from real sensors (10km radius)
- Open-Meteo: AQ model, weather, marine, pollen, UV, geocoding
- USGS: earthquakes
- NOAA SWPC: geomagnetic Kp
