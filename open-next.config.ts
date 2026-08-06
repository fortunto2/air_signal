import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Cloudflare Workers adapter for Next.js.
 *
 * Caching is left on the defaults deliberately. Every dynamic route here is a thin proxy over
 * an upstream that already caps its own freshness (Sensor.Community 5 min, Open-Meteo hourly),
 * and the route handlers pass `next: { revalidate }` themselves — so an incremental cache in KV
 * would be a second, slower copy of a decision already made one layer up. Add one only when a
 * page's own render becomes expensive, not because the config field exists.
 */
export default defineCloudflareConfig();
