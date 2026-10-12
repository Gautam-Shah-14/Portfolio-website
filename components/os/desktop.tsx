"use client"

import { useCallback, useEffect, useState } from "react"
import { About, Contact, Education, Experience, Projects, Skills } from "./apps"
import Boot from "./boot"
import Terminal from "./terminal"
import Viewer from "./viewer"
import WindowFrame from "./window-frame"

export type AppId = "about" | "experience" | "projects" | "skills" | "education" | "viewer" | "terminal" | "contact"

interface AppDef {
  id: AppId
  icon: string
  name: string
  width: number
  x: number
  y: number
}

const APPS: AppDef[] = [
  { id: "about", icon: "GS", name: "about.txt", width: 560, x: 260, y: 40 },
  { id: "experience", icon: "XP", name: "experience/", width: 520, x: 370, y: 90 },
  { id: "projects", icon: "PR", name: "projects/", width: 640, x: 310, y: 60 },
  { id: "skills", icon: "SK", name: "skills.exe", width: 520, x: 430, y: 50 },
  { id: "education", icon: "ED", name: "education/", width: 520, x: 490, y: 120 },
  { id: "viewer", icon: "3D", name: "3d-viewer", width: 420, x: 630, y: 80 },
  { id: "terminal", icon: ">_", name: "terminal", width: 600, x: 350, y: 150 },
  { id: "contact", icon: "@", name: "contact.vcf", width: 500, x: 410, y: 70 },
]

export default function Desktop() {
  const [open, setOpen] = useState<AppId[]>([])
  const [order, setOrder] = useState<AppId[]>([]) // last item is on top
  const [menu, setMenu] = useState(false)
  const [time, setTime] = useState("")

  const focus = useCallback((id: AppId) => setOrder((o) => [...o.filter((x) => x !== id), id]), [])
  const openApp = useCallback(
    (id: AppId) => {
      setOpen((o) => (o.includes(id) ? o : [...o, id]))
      focus(id)
      setMenu(false)
    },
    [focus],
  )
  const closeApp = useCallback((id: AppId) => {
    setOpen((o) => o.filter((x) => x !== id))
    setOrder((o) => o.filter((x) => x !== id))
  }, [])

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const top = order[order.length - 1]
  const content: Record<AppId, React.ReactNode> = {
    about: <About open={openApp} />,
    experience: <Experience />,
    projects: <Projects />,
    skills: <Skills />,
    education: <Education />,
    viewer: <Viewer />,
    terminal: <Terminal apps={APPS} open={openApp} />,
    contact: <Contact />,
  }

  return (
    <div onClick={() => setMenu(false)}>
      <div className="wall" />
      <div className="wm" aria-hidden="true">
        GS
        <br />
        OS
      </div>
      <div className="crt" />

      <div className="icons">
        {APPS.map((a) => (
          <button key={a.id} className="icon" onClick={() => openApp(a.id)}>
            <span className="g">{a.icon}</span>
            {a.name}
          </button>
        ))}
      </div>

      {open.map((id) => {
        const app = APPS.find((a) => a.id === id)!
        return (
          <WindowFrame
            key={id}
            title={app.name}
            width={app.width}
            x={app.x}
            y={app.y}
            z={10 + order.indexOf(id)}
            focused={top === id}
            onFocus={() => focus(id)}
            onClose={() => closeApp(id)}
          >
            {content[id]}
          </WindowFrame>
        )
      })}

      <div className={`menu${menu ? " open" : ""}`} onClick={(e) => e.stopPropagation()}>
        {APPS.map((a) => (
          <button key={a.id} onClick={() => openApp(a.id)}>
            {a.icon}  {a.name}
          </button>
        ))}
      </div>
      <div className="task" onClick={(e) => e.stopPropagation()}>
        <button className="start" onClick={() => setMenu((m) => !m)}>
          ◆ GS
        </button>
        <div className="apps">
          {open.map((id) => (
            <button key={id} className={top === id ? "on" : undefined} onClick={() => (top === id ? closeApp(id) : focus(id))}>
              {APPS.find((a) => a.id === id)!.name}
            </button>
          ))}
        </div>
        <span className="clock">{time}</span>
      </div>

      <Boot onDone={() => openApp("about")} />
    </div>
  )
}
