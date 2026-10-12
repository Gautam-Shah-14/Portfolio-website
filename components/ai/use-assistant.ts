"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { respond, type Context } from "@/lib/assistant"
import { buildKnowledge } from "@/lib/knowledge"
import { buildIndex, type Hit } from "@/lib/retrieval"
import type { OrbMode } from "./orb"

export interface Turn {
  id: number
  question: string
  steps: string[]
  text: string
  hits: Hit[]
  options: string[]
  links: { label: string; href: string }[]
  done: boolean
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Runs the validated retrieval assistant and streams each answer word by word. */
export function useAssistant(onMode: (mode: OrbMode) => void) {
  const chunks = useMemo(() => buildKnowledge(), [])
  const index = useMemo(() => buildIndex(chunks), [chunks])
  const [turns, setTurns] = useState<Turn[]>([])
  const [busy, setBusy] = useState(false)
  const context = useRef<Context>({ lastIds: [] })
  const nextId = useRef(0)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const patch = (id: number, change: Partial<Turn>) => setTurns((ts) => ts.map((t) => (t.id === id ? { ...t, ...change } : t)))

  const ask = useCallback(
    async (raw: string) => {
      const question = raw.trim()
      if (!question || busy) return
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const id = nextId.current++
      setBusy(true)
      onMode("thinking")
      setTurns((ts) => [...ts, { id, question, steps: [], text: "", hits: [], options: [], links: [], done: false }])

      const reply = respond(index, question, context.current)
      context.current = { lastIds: reply.hits.map((h) => h.chunk.id) }
      const steps = [reply.steps[0]]
      if (reply.hits.length) steps.push("embedding your question", `searching ${chunks.length} chunks`, `retrieved ${reply.hits.length}, writing answer`)
      for (let i = 0; i < steps.length; i++) {
        if (!alive.current) return
        patch(id, { steps: steps.slice(0, i + 1) })
        await wait(reduce ? 0 : 380)
      }

      onMode("speaking")
      const words = reply.text.split(/(\s+)/)
      if (reduce) patch(id, { text: reply.text })
      else {
        for (let i = 3; i < words.length + 3; i += 3) {
          if (!alive.current) return
          patch(id, { text: words.slice(0, i).join("") })
          await wait(26)
        }
      }
      patch(id, { text: reply.text, hits: reply.hits, options: reply.options, links: reply.links, done: true })
      onMode("idle")
      setBusy(false)
    },
    [busy, chunks, index, onMode],
  )

  return { turns, busy, ask, chunkCount: chunks.length }
}
