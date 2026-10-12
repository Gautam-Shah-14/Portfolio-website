"use client"

import { useEffect, useRef } from "react"
import { profile } from "@/lib/data"
import Arena from "./arena"
import { Cases, ContactSection, Record, Toolkit } from "./sections"
import { createShield, type Shield } from "./shield"

const NAV = [
  ["Arena", "#arena"],
  ["Projects", "#cases"],
  ["Skills", "#skills"],
  ["Record", "#record"],
  ["Contact", "#contact"],
]

export default function GuardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shield = useRef<Shield | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) shield.current = createShield(canvas, window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return () => {
      shield.current?.dispose()
      shield.current = null
    }
  }, [])

  return (
    <div className="wrap">
      <header className="nav">
        <a className="logo" href="#top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.avatar} alt={profile.name} />
          GS
        </a>
        <nav>
          <ul>
            {NAV.map(([label, href]) => (
              <li key={href}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div>
            <span className="lab">
              {profile.headline} · AI Security
            </span>
            <h1>
              {profile.name} builds AI that <em>holds up</em> under attack.
            </h1>
            <p>
              I ship complete products, from database and API to interface: secure LLM apps, MCP servers and clients, and backends for production. Don&apos;t take my word for it: try to break the guard below.
            </p>
            <div className="cta">
              <a className="btn" href="#arena">
                Try to break it
              </a>
              <a className="btn o" href="#cases">
                See the projects
              </a>
            </div>
          </div>
          <canvas ref={canvasRef} id="gl" aria-label="3D shield with three layers that react to attacks. Drag to rotate." />
        </section>

        <section id="arena">
          <span className="lab">Live demo</span>
          <h2 className="sec-h">Break Guardian-1</h2>
          <Arena onLayer={(n, s) => shield.current?.flashLayer(n, s)} onVerdict={(v) => shield.current?.verdict(v)} />
        </section>

        <Cases />
        <Toolkit />
        <Record />
        <ContactSection />
      </main>
      <footer>
        © {new Date().getFullYear()} {profile.name}. All rights reserved.
      </footer>
    </div>
  )
}
