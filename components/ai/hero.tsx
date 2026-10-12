"use client"

import { useEffect, useRef, useState } from "react"
import { profile } from "@/lib/data"
import { createOrb, type Orb, type OrbMode } from "./orb"
import RichText from "./rich-text"
import { useAssistant } from "./use-assistant"

const SUGGESTIONS = [
  "What has Gautam built?",
  "Has he built MCP servers?",
  "Is he capable of handling heavy tasks?",
  "What are his skills?",
  "How can I contact him?",
]

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const orbRef = useRef<Orb | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")

  const { turns, busy, ask, chunkCount } = useAssistant((mode: OrbMode) => orbRef.current?.setMode(mode))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    orbRef.current = createOrb(canvas, window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return () => {
      orbRef.current?.dispose()
      orbRef.current = null
    }
  }, [])

  useEffect(() => {
    const el = listRef.current
    if (el && turns.length) el.lastElementChild?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [turns])

  const submit = (text: string) => {
    setInput("")
    ask(text)
  }

  return (
    <section className="hero" id="top">
      <canvas ref={canvasRef} className="orb" aria-hidden="true" />
      <span className="chip-top">
        <i /> {profile.headline} · {profile.company}
      </span>
      <h1>
        Hi, I&apos;m <span className="grad">{profile.firstName}&apos;s AI.</span>
      </h1>
      <p className="lede">
        Ask me anything about {profile.name}: his projects, MCP servers, skills and experience. I answer from his real record, and I&apos;ll tell you when I don&apos;t know.
      </p>

      <form
        className="prompt"
        onSubmit={(e) => {
          e.preventDefault()
          submit(input)
        }}
      >
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Ask about ${profile.firstName}...`} aria-label="Ask a question" autoComplete="off" />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Send">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
      <div className="suggest">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" onClick={() => submit(s)} disabled={busy}>
            {s}
          </button>
        ))}
      </div>
      <p className="micro">Runs in your browser · {chunkCount} knowledge chunks · typos and loaded questions are fine</p>

      <div className="turns" ref={listRef} aria-live="polite">
        {turns.map((t) => (
          <article className="turn" key={t.id}>
            <div className="q">{t.question}</div>
            <div className="a">
              <div className="steps">
                {t.steps.map((s) => (
                  <span key={s}>
                    <i>✓</i>
                    {s}
                  </span>
                ))}
              </div>
              <div className="body">
                {t.text.split("\n\n").map((para, i) => (
                  <p key={i}>
                    <RichText text={para} />
                  </p>
                ))}
                {!t.done && t.text && <span className="caret" />}
              </div>
              {t.done && t.links.length > 0 && (
                <div className="links">
                  {t.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              )}
              {t.done && t.hits.length > 0 && (
                <div className="sources">
                  {t.hits.map((h) => (
                    <span key={h.chunk.id}>
                      {h.chunk.title} <em>{h.sim.toFixed(2)}</em>
                    </span>
                  ))}
                </div>
              )}
              {t.done && t.options.length > 0 && (
                <div className="suggest tight">
                  {t.options.map((o) => (
                    <button key={o} type="button" onClick={() => submit(o)} disabled={busy}>
                      {o}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
