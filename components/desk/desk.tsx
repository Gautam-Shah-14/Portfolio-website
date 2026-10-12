"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { profile, projects, skillFilters, skills, type SkillCategory } from "@/lib/data"
import { PanelBody } from "./panels"
import { createDesk, type DeskTarget } from "./scene"

type Desk = NonNullable<ReturnType<typeof createDesk>>

const SECTIONS: { id: DeskTarget; label: string }[] = [
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
]

export default function DeskPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const deskRef = useRef<Desk | null>(null)
  const panelRef = useRef<HTMLElement>(null)
  const [current, setCurrent] = useState<DeskTarget | null>(null)
  const [filter, setFilter] = useState<SkillCategory | "all">("all")
  const [tip, setTip] = useState<{ label: string; sub: string; x: number; y: number } | null>(null)
  const [webgl, setWebgl] = useState(true)

  const open = useCallback((id: DeskTarget, cat?: SkillCategory) => {
    setCurrent(id)
    if (id === "skills" && cat) setFilter(cat)
    deskRef.current?.focus(id)
    panelRef.current?.scrollTo({ top: 0 })
  }, [])
  const close = useCallback(() => {
    setCurrent(null)
    deskRef.current?.focus("home")
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const desk = createDesk(canvas, {
      skills,
      categoryLabels: Object.fromEntries(skillFilters.map((f) => [f.id, f.label])),
      projects,
      reduceMotion: reduce,
      onOpen: open,
      onHover: setTip,
    })
    if (!desk) {
      setWebgl(false)
      return
    }
    deskRef.current = desk
    return () => {
      desk.dispose()
      deskRef.current = null
    }
  }, [open])

  useEffect(() => {
    deskRef.current?.setFilter(current === "skills" ? filter : "all")
  }, [filter, current])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [close])

  return (
    <main className="desk">
      <canvas ref={canvasRef} aria-label="An interactive 3D desk. Use the buttons below to open each section." />
      <div className={`title${current ? " hide" : ""}`}>
        <b>{profile.name}</b>
        <span>
          {profile.headline} · {profile.company}
        </span>
        <div className="hint">{webgl ? "poke around, things on the desk open" : "pick a section below"}</div>
      </div>
      <nav className="dock" aria-label="Sections">
        {SECTIONS.map((s) => (
          <button key={s.id} className={current === s.id ? "on" : ""} onClick={() => open(s.id)}>
            {s.label}
          </button>
        ))}
      </nav>
      {tip && (
        <div className="tip show" style={{ left: tip.x, top: tip.y }}>
          <b>{tip.label}</b>
          <small>{tip.sub}</small>
        </div>
      )}
      <aside ref={panelRef} className={`panel${current ? " open" : ""}`} aria-hidden={!current} aria-live="polite">
        <button className="x" onClick={close} aria-label="Close">
          ×
        </button>
        {current && <PanelBody id={current} filter={filter} onFilter={setFilter} />}
      </aside>
    </main>
  )
}
