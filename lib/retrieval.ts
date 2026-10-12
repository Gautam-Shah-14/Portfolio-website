import type { Chunk } from "./knowledge"

export interface Hit {
  chunk: Chunk
  /** relevance relative to the best hit, 0 to 1 */
  rel: number
  /** pseudo cosine similarity shown to the visitor */
  sim: number
}

const STOP = new Set(
  "a an the is are was were of to in on for and or with what whats which who how do does did can you your his he me my i tell about gautam shah at by it its this that be as from".split(" "),
)

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9. ]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w))
}

interface Indexed {
  chunk: Chunk
  keyWords: string[]
  allWords: Set<string>
}

export function buildIndex(chunks: Chunk[]): Indexed[] {
  return chunks.map((chunk) => ({
    chunk,
    keyWords: tokens(`${chunk.keywords} ${chunk.title}`),
    allWords: new Set(tokens(`${chunk.keywords} ${chunk.title} ${chunk.answer}`)),
  }))
}

/** Small keyword-weighted retriever: title/keyword hits count most, then body hits, with 4-letter stem matching. */
export function search(index: Indexed[], query: string, k = 3): Hit[] {
  const q = tokens(query)
  if (!q.length) return []
  const scored = index
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
