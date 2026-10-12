"use client"

import { profile } from "@/lib/data"
import Hero from "./hero"
import McpPanel from "./mcp-panel"
import { Contact, Projects, Record, Skills } from "./sections"

const NAV = [
  ["Projects", "#projects"],
  ["Skills", "#skills"],
  ["Experience", "#experience"],
  ["MCP", "#mcp"],
  ["Contact", "#contact"],
]

export default function Home() {
  return (
    <>
      <div className="aurora" aria-hidden="true" />
      <header className="nav">
        <a className="logo" href="#top">
          <span>GS</span> {profile.name}
        </a>
        <nav aria-label="Sections">
          {NAV.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
      </header>
      <main>
        <Hero />
        <Projects />
        <Skills />
        <Record />
        <McpPanel />
        <Contact />
      </main>
      <footer>
        © {new Date().getFullYear()} {profile.name}. All rights reserved.
      </footer>
    </>
  )
}
