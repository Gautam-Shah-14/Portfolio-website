"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { profile } from "@/lib/data"
import { SectionPanel, SECTION_TITLES } from "./panels"
import { createWorld, STATIONS, type SectionKey, type WorldHandle } from "./scene"

const SECTION_KEYS = STATIONS.map((s) => s.key)

export default function World() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const speedRef = useRef<HTMLSpanElement>(null)
  const worldRef = useRef<WorldHandle | null>(null)
  const [started, setStarted] = useState(false)
  const [webgl, setWebgl] = useState(true)
  const [section, setSection] = useState<SectionKey | null>(null)
  const [toast, setToast] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    const init = () => {
      if (cancelled) return
      const world = createWorld(canvas, {
        avatarUrl: profile.avatar,
        reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        onNear: setSection,
        onSpeed: (kmh) => {
          if (speedRef.current) speedRef.current.textContent = String(kmh)
        },
      })
      worldRef.current = world
      if (!world) setWebgl(false)
    }
    // canvas text (station signs, floor title) needs the web fonts first
    const fonts = document.fonts
    if (fonts?.load) {
      Promise.race([
        Promise.all([fonts.load("64px Bungee"), fonts.load("34px Outfit")]),
        new Promise((r) => setTimeout(r, 1500)),
      ]).then(init, init)
    } else init()
    return () => {
      cancelled = true
      worldRef.current?.dispose()
      worldRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    worldRef.current?.start()
    setStarted(true)
    setToast(true)
    setTimeout(() => setToast(false), 2600)
  }, [])

  const goTo = useCallback((key: SectionKey) => {
    setStarted(true)
    if (worldRef.current) worldRef.current.driveTo(key)
    else setSection(key)
  }, [])

  const hold = (key: string) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault()
      worldRef.current?.setKey(key, true)
    },
    onPointerUp: () => worldRef.current?.setKey(key, false),
    onPointerLeave: () => worldRef.current?.setKey(key, false),
    onPointerCancel: () => worldRef.current?.setKey(key, false),
  })

  return (
    <>
      <canvas ref={canvasRef} id="gl" aria-label="3D world. Use arrow keys or WASD to drive, or use the menu." />

      <div className="hud brand">
        <span>GS</span>
      </div>
      <nav className="hud menu" aria-label="Sections">
        {SECTION_KEYS.map((k) => (
          <button key={k} className={section === k ? "on" : undefined} onClick={() => goTo(k)}>
            {SECTION_TITLES[k]}
          </button>
        ))}
      </nav>
      <div className="hud keys">
        <kbd>W</kbd>
        <kbd>A</kbd>
        <kbd>S</kbd>
        <kbd>D</kbd> or arrows to drive · <kbd>Space</kbd> boost
      </div>
      <div className="hud speed">
        <span ref={speedRef}>0</span>
        <small>km/h</small>
      </div>

      <div className="pad l">
        <button aria-label="Steer left" {...hold("a")}>
          ◀
        </button>
        <button aria-label="Steer right" {...hold("d")}>
          ▶
        </button>
      </div>
      <div className="pad r">
        <button aria-label="Gas" {...hold("w")}>
          ▲
        </button>
        <button aria-label="Brake" {...hold("s")}>
          ▼
        </button>
      </div>
      <div className={`toast${toast ? " on" : ""}`}>Drive to a glowing platform</div>

      <aside className={`panel${section ? " open" : ""}`} aria-live="polite">
        <button className="close" aria-label="Close" onClick={() => setSection(null)}>
          ✕
        </button>
        <div>{section && <SectionPanel key={section} section={section} />}</div>
      </aside>

      <div className={`intro${started ? " off" : ""}`}>
        <div className="box">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.avatar} alt={`${profile.name} avatar`} />
          <h1>
            Hi, I&apos;m
            <br />
            <em>{profile.name}</em>
          </h1>
          <p>
            {profile.role} building secure AI products. This portfolio is a tiny world.{" "}
            {webgl ? "Drive to a station to open it, or use the menu up top." : "3D is not available in this browser, but every section is in the menu."}
          </p>
          <button className="go" onClick={start}>
            {webgl ? "Start engine" : "Enter"}
          </button>
        </div>
      </div>
    </>
  )
}
