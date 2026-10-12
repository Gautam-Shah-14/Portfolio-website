"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { profile } from "@/lib/data"
import { buildKnowledge, type Chunk } from "@/lib/knowledge"
import { respond, type Context } from "@/lib/assistant"
import { buildIndex, type Hit } from "@/lib/retrieval"
import RichText from "./rich-text"
import { createVectorSpace, type VectorSpace } from "./vector-space"

interface AiMessage {
  id: number
  role: "ai"
  steps: string[]
  /** words revealed so far, joined */
  text: string
  hits: Hit[]
  options: string[]
  links: { label: string; href: string }[]
  done: boolean
}
interface UserMessage {
  id: number
  role: "user"
  text: string
}
type Message = AiMessage | UserMessage

const SUGGESTIONS = [
  "What does Gautam do?",
  "Has he built MCP servers?",
  "Is he capable of handling heavy tasks?",
  "Tell me about VoxSecure",
  "What are his skills?",
  "How can I contact him?",
]

const GREETING =
  "Hi, I'm Gautam's portfolio assistant. Ask me anything about his **projects, MCP work, skills, experience or education**. Typos, vague or loaded questions are fine, I'll check what you mean first. I answer from a small knowledge base indexed in your browser, and you can watch the search happen on the right."

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export default function Chat() {
  const chunks = useMemo<Chunk[]>(() => buildKnowledge(), [])
  const index = useMemo(() => buildIndex(chunks), [chunks])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const spaceRef = useRef<VectorSpace | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(0)
  const context = useRef<Context>({ lastIds: [] })
  const alive = useRef(true)
  const reduce = useRef(false)

  useEffect(() => {
    alive.current = true
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const canvas = canvasRef.current
    if (canvas) {
      const titles = new Map(chunks.map((c) => [c.id, c.title]))
      spaceRef.current = createVectorSpace(
        canvas,
        chunks.map((c) => ({ id: c.id, topic: c.topic })),
        (id, x, y) => setTip(id ? { text: titles.get(id) ?? "", x, y } : null),
        reduce.current,
      )
    }
    return () => {
      alive.current = false
      spaceRef.current?.dispose()
      spaceRef.current = null
    }
  }, [chunks])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  const patch = (id: number, change: Partial<AiMessage>) =>
    setMessages((ms) => ms.map((m) => (m.id === id && m.role === "ai" ? { ...m, ...change } : m)))

  async function ask(raw: string) {
    const text = raw.trim()
    if (!text || busy) return
    setBusy(true)
    setInput("")
    const userId = nextId.current++
    const aiId = nextId.current++
    setMessages((ms) => [
      ...ms,
      { id: userId, role: "user", text },
      { id: aiId, role: "ai", steps: [], text: "", hits: [], options: [], links: [], done: false },
    ])

    const reply = respond(index, text, context.current)
    context.current = { lastIds: reply.hits.map((h) => h.chunk.id) }
    const hits = reply.hits
    const steps = [reply.steps[0]]
    if (hits.length) {
      steps.push("embedding your question", `searching ${chunks.length} chunks by similarity`, `retrieved ${hits.length} chunk${hits.length > 1 ? "s" : ""}, writing answer`)
    }
    const delay = reduce.current ? 0 : 420
    for (let i = 0; i < steps.length; i++) {
      if (!alive.current) return
      patch(aiId, { steps: steps.slice(0, i + 1) })
      if (i === 2) spaceRef.current?.setHits(hits.map((h) => ({ id: h.chunk.id, rel: h.rel })))
      await wait(delay)
    }
    if (!hits.length) spaceRef.current?.setHits([])

    const answer = reply.text
    const words = answer.split(/(\s+)/)
    if (reduce.current) {
      patch(aiId, { text: answer })
    } else {
      for (let i = 3; i < words.length + 3; i += 3) {
        if (!alive.current) return
        patch(aiId, { text: words.slice(0, i).join("") })
        await wait(28)
      }
    }
    patch(aiId, { text: answer, hits, options: reply.options, links: reply.links, done: true })
    setBusy(false)
  }

  return (
    <>
      <header className="top">
        <div className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.avatar} alt={profile.name} />
          <div>
            <b>Ask Gautam</b>
            <span>
              {profile.role} · {profile.company}
            </span>
          </div>
        </div>
        <div className="badges">
          <span className="badge">
            <i />
            gs-rag · runs in your browser
          </span>
          <span className="badge">{chunks.length} chunks indexed</span>
        </div>
      </header>

      <div className="main">
        <section className="chat" aria-label="Chat">
          <div className="msgs" ref={listRef} aria-live="polite">
            <div className="msg a">
              <div className="who">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={profile.avatar} alt="" />
                gs-rag
              </div>
              <div className="body">
                <p>
                  <RichText text={GREETING} />
                </p>
              </div>
            </div>
            {messages.map((m) =>
              m.role === "user" ? (
                <div className="msg u" key={m.id}>
                  {m.text}
                </div>
              ) : (
                <div className="msg a" key={m.id}>
                  <div className="who">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={profile.avatar} alt="" />
                    gs-rag
                  </div>
                  <div className="steps">
                    {m.steps.map((s) => (
                      <div key={s}>
                        <span className="ok">✓</span>
                        {s}
                      </div>
                    ))}
                  </div>
                  <div className="body">
                    {m.text.split("\n\n").map((para, i) => (
                      <p key={i} style={{ whiteSpace: "pre-line" }}>
                        <RichText text={para} />
                      </p>
                    ))}
                    {!m.done && m.text && <span className="cursor" />}
                    {m.done && m.links.length > 0 && (
                      <p>
                        {m.links.map((l, i) => (
                          <span key={l.href}>
                            {i > 0 && " · "}
                            <a href={l.href} target="_blank" rel="noopener noreferrer">
                              {l.label}
                            </a>
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                  {m.done && m.options.length > 0 && (
                    <div className="sugg" style={{ padding: "12px 0 0" }}>
                      {m.options.map((o) => (
                        <button type="button" key={o} onClick={() => ask(o)} disabled={busy}>
                          {o}
                        </button>
                      ))}
                    </div>
                  )}
                  {m.done && (
                    <div className="srcs">
                      {m.hits.map((h) => (
                        <button type="button" className="src" key={h.chunk.id} onClick={() => spaceRef.current?.focus(h.chunk.id)}>
                          {h.chunk.title}
                          <em>{h.sim.toFixed(2)}</em>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
          <div className="sugg">
            {SUGGESTIONS.map((s) => (
              <button type="button" key={s} onClick={() => ask(s)} disabled={busy}>
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              ask(input)
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about my projects, MCP work, skills..."
              autoComplete="off"
              aria-label="Your question"
            />
            <button type="submit" disabled={busy}>
              Ask
            </button>
          </form>
        </section>

        <aside className="space" aria-label="Retrieval space">
          <h2>Vector space</h2>
          <p className="sub">Every fact about me is a point. Your question lands in the cloud and pulls in its nearest neighbours.</p>
          <canvas ref={canvasRef} id="gl" aria-hidden="true" />
          {tip && (
            <div className="tip" style={{ left: tip.x, top: tip.y, opacity: 1, position: "fixed" }}>
              {tip.text}
            </div>
          )}
          <div className="legend">
            <span>
              <i style={{ background: "#b48aff" }} />
              chunk
            </span>
            <span>
              <i style={{ background: "#7dffc4" }} />
              retrieved
            </span>
            <span>
              <i style={{ background: "#fff" }} />
              your query
            </span>
            <span>drag to rotate</span>
          </div>
        </aside>
      </div>
    </>
  )
}
