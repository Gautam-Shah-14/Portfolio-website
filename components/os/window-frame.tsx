"use client"

import { useRef, useState } from "react"

interface WindowFrameProps {
  title: string
  width: number
  x: number
  y: number
  z: number
  focused: boolean
  onFocus: () => void
  onClose: () => void
  children: React.ReactNode
}

export default function WindowFrame({ title, width, x, y, z, focused, onFocus, onClose, children }: WindowFrameProps) {
  const [pos, setPos] = useState({ x, y })
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === "BUTTON" || window.innerWidth <= 700) return
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    setPos({
      x: Math.max(-width + 80, Math.min(window.innerWidth - 80, d.ox + e.clientX - d.sx)),
      y: Math.max(0, Math.min(window.innerHeight - 90, d.oy + e.clientY - d.sy)),
    })
  }
  const endDrag = () => {
    drag.current = null
  }

  return (
    <section
      className={`win open${focused ? " focus" : ""}`}
      aria-label={title}
      style={{ width, left: Math.min(pos.x, Math.max(8, window.innerWidth - width - 16)), top: pos.y, zIndex: z }}
      onPointerDown={onFocus}
    >
      <div className="bar" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
        <span className="t">{title}</span>
        <button aria-label="Minimize" onClick={onClose}>
          _
        </button>
        <button aria-label="Close" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="body">{children}</div>
    </section>
  )
}
