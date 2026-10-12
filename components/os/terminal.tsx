"use client"

import { useEffect, useRef, useState } from "react"
import { contact, education, experiences, profile, projects, skills } from "@/lib/data"
import type { AppId } from "./desktop"

type Line = { id: number; node: React.ReactNode }

interface TerminalProps {
  apps: { id: AppId; name: string }[]
  open: (id: AppId) => void
}

export default function Terminal({ apps, open }: TerminalProps) {
  const [lines, setLines] = useState<Line[]>([])
  const [value, setValue] = useState("")
  const history = useRef<string[]>([])
  const cursor = useRef(0)
  const nextId = useRef(0)
  const scroller = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const timers = useRef<number[]>([])

  const print = (node: React.ReactNode) => setLines((l) => [...l, { id: nextId.current++, node }])

  useEffect(() => {
    print(
      <>
        GS OS terminal v1.0. Type <b className="p">help</b> to see commands.
      </>,
    )
    input.current?.focus()
    const pending = timers.current
    return () => pending.forEach((t) => window.clearInterval(t))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
  }, [lines])

  const commands: Record<string, () => React.ReactNode> = {
    help: () => "about · projects · skills · experience · education · contact · open <app> · whoami · sudo hire-me · matrix · clear",
    about: () => `${profile.name}, ${profile.role} at ${profile.company}. AI Security, GenAI, FastAPI backends.`,
    whoami: () => "guest. But you could be my next teammate.",
    projects: () => projects.map((p) => `${p.name.padEnd(11)} - ${p.kind}: ${p.tags.join(", ")}`).join("\n"),
    skills: () => skills.map((s) => `• ${s.name}`).join("\n"),
    experience: () => experiences.map((e) => `${e.period.padEnd(20)} ${e.role}, ${e.company}`).join("\n"),
    education: () => education.map((e) => `${e.title}, ${e.school}, ${e.period}, CGPA ${e.cgpa}`).join("\n"),
    contact: () => (
      <>
        {contact.email} · {contact.phone}
        {"\n"}
        <a target="_blank" rel="noopener noreferrer" href={contact.github}>
          github
        </a>{" "}
        ·{" "}
        <a target="_blank" rel="noopener noreferrer" href={contact.linkedin}>
          linkedin
        </a>
      </>
    ),
    "sudo hire-me": () => {
      document.body.animate([{ filter: "hue-rotate(0)" }, { filter: "hue-rotate(360deg)" }], { duration: 1200 })
      return `Permission granted. Sending offer letter to ${contact.email} ...\nJust kidding, but please do email me.`
    },
    matrix: () => {
      let n = 0
      const id = window.setInterval(() => {
        print(Array.from({ length: 46 }, () => (Math.random() < 0.5 ? "1" : "0")).join(""))
        if (++n > 8) window.clearInterval(id)
      }, 90)
      timers.current.push(id)
      return "wake up, guest..."
    },
  }

  const run = (raw: string) => {
    const cmd = raw.trim()
    if (!cmd) return
    history.current.push(cmd)
    cursor.current = history.current.length
    print(
      <>
        <span className="p">guest@gs-os:~$</span> {cmd}
      </>,
    )
    const lc = cmd.toLowerCase()
    const openMatch = lc.match(/^open (\w+)/)
    if (openMatch) {
      const app = apps.find((a) => a.id === openMatch[1])
      if (app) {
        open(app.id)
        print(`opening ${app.name} ...`)
      } else print(`no such app. apps: ${apps.map((a) => a.id).join(", ")}`)
    } else if (lc === "clear") {
      setLines([])
    } else if (commands[lc]) {
      print(commands[lc]())
    } else {
      print(`command not found: ${cmd}. Try help.`)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(value)
      setValue("")
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (cursor.current > 0) setValue(history.current[--cursor.current])
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (cursor.current < history.current.length - 1) setValue(history.current[++cursor.current])
      else {
        cursor.current = history.current.length
        setValue("")
      }
    }
  }

  return (
    <div className="term" ref={scroller} onClick={() => input.current?.focus()}>
      {lines.map((l) => (
        <div key={l.id}>{l.node}</div>
      ))}
      <div className="in">
        <span className="p">guest@gs-os:~$</span>
        <input
          ref={input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
          aria-label="Terminal input"
        />
      </div>
    </div>
  )
}
