/**
 * Best-effort fixed-window limiter, kept in memory. On serverless hosting each instance has its own
 * counters, so this slows down abuse but is not a hard guarantee.
 */
const WINDOW_MS = 60_000
const MAX_REQUESTS = 60
const hits = new Map<string, { count: number; reset: number }>()

export function allow(key: string, now = Date.now()): boolean {
  const entry = hits.get(key)
  if (!entry || now > entry.reset) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS })
    if (hits.size > 5000) for (const [k, v] of hits) if (now > v.reset) hits.delete(k)
    return true
  }
  entry.count++
  return entry.count <= MAX_REQUESTS
}
