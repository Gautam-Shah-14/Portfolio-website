import type { Chunk } from "./knowledge"

export interface Hit {
  chunk: Chunk
  /** relevance relative to the best hit, 0 to 1 */
  rel: number
  /** pseudo cosine similarity shown to the visitor */
  sim: number
}

export const STOP = new Set(
  "a an the is are was were of to in on for and or with what whats which who how do does did can you your his he me my i tell about gautam shah at by it its this that be as from there their they them so very really also just please any some".split(" "),
)

export function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9. ]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w))
}

export interface Index {
  entries: { chunk: Chunk; keyWords: string[]; allWords: Set<string> }[]
  vocab: Set<string>
}

export function buildIndex(chunks: Chunk[]): Index {
  const entries = chunks.map((chunk) => ({
    chunk,
    keyWords: tokens(`${chunk.keywords} ${chunk.title}`),
    allWords: new Set(tokens(`${chunk.keywords} ${chunk.title} ${chunk.answer}`)),
  }))
  const vocab = new Set<string>()
  entries.forEach((e) => e.allWords.forEach((w) => vocab.add(w)))
  return { entries, vocab }
}

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return row[b.length]
}

/** Fixes small typos by snapping unknown words to the closest word the knowledge base knows. */
export function correctTypos(index: Index, query: string): { query: string; fixes: [string, string][] } {
  const fixes: [string, string][] = []
  const out = query
    .split(/(\s+)/)
    .map((raw) => {
      const w = raw.toLowerCase().replace(/[^a-z0-9.]/g, "")
      if (w.length < 6 || STOP.has(w) || index.vocab.has(w)) return raw
      const limit = w.length >= 7 ? 2 : 1
      let best: string | null = null
      let bestD = limit + 1
      index.vocab.forEach((v) => {
        if (v[0] !== w[0] || Math.abs(v.length - w.length) > limit) return
        const d = Math.min(distance(w, v), distance(w, `${v}s`))
        if (d < bestD) {
          bestD = d
          best = v
        }
      })
      if (best) {
        fixes.push([w, best])
        return best
      }
      return raw
    })
    .join("")
  return { query: out, fixes }
}

/** Keyword-weighted retriever: title/keyword hits count most, then body hits, with 4-letter stem matching. */
export function search(index: Index, query: string, k = 3): Hit[] {
  const q = tokens(query)
  if (!q.length) return []
  const scored = index.entries
    .map(({ chunk, keyWords, allWords }) => {
      let score = 0
      for (const w of q) {
        const stem = w.length > 4 ? w.slice(0, 4) : w
        if (keyWords.includes(w)) score += 3
        else if (stem.length >= 4 && keyWords.some((t) => t.length > 3 && t.startsWith(stem))) score += 2
        else if (allWords.has(w)) score += 1
      }
      return { chunk, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
  if (!scored.length) return []
  const max = scored[0].score
  return scored
    .slice(0, k)
    .map((r) => ({
      chunk: r.chunk,
      rel: r.score / max,
      sim: Math.min(0.97, 0.42 + 0.08 * r.score) * (0.82 + (0.18 * r.score) / max),
    }))
    .filter((h) => h.rel >= 0.4)
}
