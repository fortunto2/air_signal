# Air Signal

Environmental comfort dashboard for any city. Real-time air quality with 14 signals, Leaflet map, city search, and Rust WASM core.

## Features

- Interactive dark map with AQI-colored city markers
- City search (autocomplete, any city in the world)
- 14-signal comfort index with sigmoid/gaussian normalization
- Top cities ranking by air quality
- Sensor.Community primary data, Open-Meteo CAMS model as fallback
- Dynamic merge: high divergence → sensors win, model ignored

## Stack

- **Frontend**: Next.js 16, Tailwind CSS v4, shadcn/ui, Leaflet, SWR
- **Core**: airq-core (Rust → WASM) — AQI, sigmoid normalize, cities DB
- **Deploy**: Cloudflare Pages

## Quick start

```bash
pnpm install
pnpm dev --webpack
# Open http://localhost:3000
```

## API Routes

| Route | What |
|-------|------|
| `/api/comfort?lat=X&lon=Y` | 14-signal comfort scores (Sensor.Community + Open-Meteo merge) |
| `/api/geocode?q=tokyo` | City search autocomplete |
| `/api/top` | Top 12 cities sorted by AQI |

## 14 Signals

All normalization runs in Rust (sigmoid/gaussian, no piecewise linear):

| Signal | Curve | Params |
|--------|-------|--------|
| Air (PM2.5) | sigmoid desc | AQI mid=75, k=0.04 |
| Temperature | gaussian | c=23°C, σ=12 |
| Wind | sigmoid desc | mid=25km/h, k=0.12 |
| Sea (waves) | sigmoid desc | mid=2m, k=1.5 |
| UV | sigmoid desc | mid=6, k=0.6 |
| Earthquake | sigmoid desc | mid=M4.5, k=1.2 |
| Fire | sigmoid asc | mid=30km, k=0.08 |
| Pollen | sigmoid desc | mid=50, k=0.06 |
| Pressure | gaussian | c=1013hPa, σ=10 |
| Geomagnetic | sigmoid desc | mid=Kp4, k=0.8 |
| Humidity | gaussian | c=50%, σ=25 |
| Daylight | sigmoid asc | mid=10h, k=0.5 |
| Noise | sigmoid desc | mid=60dB, k=0.15 |
| Moon | cosine | 50(cos(2πφ)+1) |

## Rebuild WASM

After changes to `airq-core`:

```bash
cd ../airq/airq-core
wasm-pack build --target web --features wasm --no-default-features
# Package auto-linked via pnpm local dependency
```

## Deploy

```bash
pnpm build --webpack
wrangler pages deploy .next --project-name air-signal
```

## License

MIT
