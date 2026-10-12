"use client"

import { useEffect, useRef, useState } from "react"
import { evaluate, SAMPLE_PROMPTS, type GuardResult, type Verdict } from "@/lib/guard"

interface ArenaProps {
  onLayer: (layer: number, score: number) => void
  onVerdict: (v: Verdict) => void
}

const scoreColor = (v: number) => (v >= 0.6 ? "var(--bad)" : v >= 0.3 ? "var(--warn)" : "var(--ok)")

interface LogLine {
  id: number
  verdict: Verdict
  text: string
}

export default function Arena({ onLayer, onVerdict }: ArenaProps) {
  const [prompt, setPrompt] = useState("")
  const [scores, setScores] = useState<[number, number, number]>([0, 0, 0])
  const [result, setResult] = useState<GuardResult | null>(null)
  const [scanning, setScanning] = useState(false)
  const [reply, setReply] = useState("I answer questions about Gautam's work. I will never reveal my secret.")
  const [counts, setCounts] = useState({ all: 0, blocked: 0, flagged: 0, allowed: 0 })
  const [log, setLog] = useState<LogLine[]>([])
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const logId = useRef(0)

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const run = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    timers.current.forEach(clearTimeout)
    timers.current = []
    const r = evaluate(text)
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const d = reduce ? 0 : 420
    setScanning(true)
    setResult(null)
    setScores([0, 0, 0])
    setReply("")
    const at = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms))
    at(d * 0.3, () => {
      setScores((s) => [r.l1, s[1], s[2]])
      onLayer(1, r.l1)
    })
    at(d * 1.3, () => {
      setScores((s) => [s[0], r.l2, s[2]])
      onLayer(2, r.l2)
    })
    at(d * 2.3, () => {
      setScores([r.l1, r.l2, r.l3])
      onLayer(3, r.l3)
      onVerdict(r.verdict)
      setScanning(false)
      setResult(r)
      setReply(r.reply)
      setCounts((c) => ({ ...c, all: c.all + 1, [r.verdict]: c[r.verdict] + 1 }))
      setLog((l) => [{ id: logId.current++, verdict: r.verdict, text }, ...l])
    })
  }

  return (
    <div className="arena">
      <div className="arena-head">
        <b>Guardian-1 · guarded assistant</b>
        <span className="secret">
          secret: <span>••••••••••</span>
        </span>
      </div>
      <div className="arena-body">
        <div className="col">
          <div className="attacks">
            {SAMPLE_PROMPTS.map((s) => (
              <button
                key={s.text}
                type="button"
                className={s.benign ? "good" : undefined}
                title={s.text}
                onClick={() => {
                  setPrompt(s.text)
                  run(s.text)
                }}
              >
                {s.text.length > 34 ? `${s.text.slice(0, 32)}...` : s.text}
              </button>
            ))}
          </div>
          <form
            className="pform"
            onSubmit={(e) => {
              e.preventDefault()
              run(prompt)
            }}
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              aria-label="Your prompt"
              placeholder="Write a prompt. Try to make the assistant reveal its secret, or just ask about Gautam."
            />
            <button className="btn" type="submit">
              Send
            </button>
          </form>
          <div className="reply">
            <div className="who">guardian-1</div>
            {reply}
          </div>
          <p className="note">This is a rule-based simulation, not a live model. It shows how layered guardrails score and stop common prompt attacks.</p>
        </div>
        <div className="col">
          <div className="layers">
            {[
              ["L1 · input filter", "(patterns)"],
              ["L2 · intent classifier", "(semantic)"],
              ["L3 · output filter", "(leak check)"],
            ].map(([name, kind], i) => (
              <div className="layer" key={name}>
                <div className="row">
                  <span>
                    {name} <b>{kind}</b>
                  </span>
                  <b>{scores[i].toFixed(2)}</b>
                </div>
                <div className="bar">
                  <i style={{ width: `${Math.round(scores[i] * 100)}%`, background: scoreColor(scores[i]) }} />
                </div>
              </div>
            ))}
          </div>
          <div className={`verdict${result ? ` ${result.verdict}` : ""}`}>
            {scanning ? (
              <>
                <span className="pill">SCANNING</span>
                <span>running 3 layers...</span>
              </>
            ) : result ? (
              <>
                <span className="pill">{result.verdict.toUpperCase()}</span>
                <span>
                  {result.verdict === "blocked" ? `stopped at ${result.layer}` : result.verdict === "flagged" ? "answered safely, logged" : "passed all layers"}
                </span>
              </>
            ) : (
              <>
                <span className="pill">IDLE</span>
                <span>waiting for a prompt</span>
              </>
            )}
          </div>
          <div className="why">{result?.why}</div>
        </div>
      </div>
      <div className="stats">
        <div>
          <b>{counts.all}</b>attempts
        </div>
        <div>
          <b>{counts.blocked}</b>blocked
        </div>
        <div>
          <b>{counts.flagged}</b>flagged
        </div>
        <div>
          <b>{counts.allowed}</b>allowed
        </div>
      </div>
      <div className="log">
        {log.length === 0
          ? "threat log is empty"
          : log.map((l) => (
              <div key={l.id} className={l.verdict[0]}>
                {l.verdict.toUpperCase()} &quot;{l.text.length > 60 ? `${l.text.slice(0, 57)}...` : l.text}&quot;
              </div>
            ))}
      </div>
    </div>
  )
}
