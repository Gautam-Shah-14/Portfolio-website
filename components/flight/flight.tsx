"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { PANELS } from "./panels"
import { createTunnel } from "./tunnel"

const STOPS = PANELS.length

export default function Flight() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const panelRefs = useRef<(HTMLElement | null)[]>([])
  const progressRef = useRef<HTMLDivElement>(null)
  const depthRef = useRef<HTMLElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const pulseRef = useRef<(() => void) | null>(null)
  const [active, setActive] = useState(0)
  const [webgl, setWebgl] = useState(true)

  const go = useCallback((index: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({ top: (max * index) / (STOPS - 1), behavior: reduce ? "auto" : "smooth" })
  }, [])

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const canvas = canvasRef.current
    const tunnel = canvas ? createTunnel(canvas, reduce) : null
    if (!tunnel) setWebgl(false)
    pulseRef.current = tunnel ? tunnel.pulse : null

    let mx = 0
    let my = 0
    let smooth = 0
    let lastActive = 0
    let raf = 0
    let last = performance.now()
    const onMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5
      my = e.clientY / window.innerHeight - 0.5
    }
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button,a")) return
      tunnel?.pulse()
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerdown", onDown)

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const max = document.documentElement.scrollHeight - window.innerHeight
      const target = max > 0 ? window.scrollY / max : 0
      smooth += (target - smooth) * Math.min(1, dt * 6)
      const pos = smooth * (STOPS - 1)

      if (progressRef.current) progressRef.current.style.width = `${smooth * 100}%`
      if (depthRef.current) depthRef.current.textContent = String(Math.round(pos * 7 * 3))
      if (hintRef.current) hintRef.current.style.opacity = smooth < 0.03 ? "1" : "0"

      panelRefs.current.forEach((el, i) => {
        if (!el) return
        const d = i - pos // > 0 ahead of you, < 0 already passed
        const visible = d > -1.1 && d < 1.6
        el.classList.toggle("vis", visible)
        if (!visible) return
        const z = d >= 0 ? -d * 1400 : -d * 900
        const opacity = d >= 0 ? Math.max(0, 1 - d * 1.7) : Math.max(0, 1 + d * 1.8)
        el.style.opacity = String(opacity)
        el.style.transform = `translate3d(${-mx * 40 * (1 + Math.abs(d))}px,${-my * 30}px,${z}px) rotateY(${mx * 6 - d * 8}deg) rotateX(${-my * 5}deg)`
        el.style.pointerEvents = opacity > 0.6 ? "auto" : "none"
      })

      const nearest = Math.round(pos)
      if (nearest !== lastActive) {
        lastActive = nearest
        setActive(nearest)
      }
      tunnel?.render({ progress: smooth, stops: STOPS, mx, my, time: now / 1000 })
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerdown", onDown)
      tunnel?.dispose()
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} id="gl" aria-hidden="true" className={webgl ? undefined : "nogl"} />
      <div className="nav">
        <a
          className="logo"
          href="#"
          onClick={(e) => {
            e.preventDefault()
            go(0)
          }}
        >
          GS
        </a>
      </div>
      <div className="dots" aria-label="Sections">
        {PANELS.map((p, i) => (
          <button key={p.name} className={active === i ? "on" : undefined} aria-label={p.name} onClick={() => go(i)}>
            <span>{p.name}</span>
          </button>
        ))}
      </div>
      <div className="prog" ref={progressRef} />
      <div className="speed">
        DEPTH <b ref={depthRef}>0</b> m
      </div>
      <div className="hint" ref={hintRef}>
        scroll to fly · move your mouse to steer · click to pulse
      </div>

      <div className="stage">
        {PANELS.map((p, i) => (
          <section
            key={p.name}
            className="pn"
            ref={(el) => {
              panelRefs.current[i] = el
            }}
          >
            {p.render(go)}
          </section>
        ))}
      </div>
    </>
  )
}
