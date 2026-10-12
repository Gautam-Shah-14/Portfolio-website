"use client"

import { useState } from "react"
import { contact, education, experiences, projects, skillFilters, skills } from "@/lib/data"
import type { SectionKey } from "./scene"

export const SECTION_TITLES: Record<SectionKey, string> = {
  work: "Work",
  projects: "Projects",
  skills: "Skills",
  education: "Education",
  contact: "Contact",
}

function Work() {
  return (
    <>
      {experiences.map((e) => (
        <div className="item" key={e.role + e.period}>
          <span className="when">{e.period}</span>
          <h3>{e.role}</h3>
          <p>{e.company}</p>
        </div>
      ))}
    </>
  )
}

function Projects() {
  return (
    <>
      {projects.map((p) => (
        <div className="item" key={p.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="pimg"
            src={p.image}
            alt={`${p.name} logo`}
            style={{ background: p.background, objectFit: p.fit, height: 200, padding: p.fit === "contain" ? 12 : 0 }}
          />
          <h3>{p.name}</h3>
          <p>{p.description}</p>
          <div className="tags">
            {p.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

function Skills() {
  const [filter, setFilter] = useState<(typeof skillFilters)[number]["id"]>("all")
  return (
    <>
      <div className="chiprow" role="group" aria-label="Filter skills">
        {skillFilters.map((f) => (
          <button key={f.id} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
      {skills
        .filter((s) => filter === "all" || s.category === filter)
        .map((s) => (
          <div className="item" key={s.name}>
            <h3>{s.name}</h3>
            <p>{s.description}</p>
          </div>
        ))}
    </>
  )
}

function Education() {
  return (
    <>
      {education.map((e) => (
        <div className="item" key={e.title}>
          <span className="when">{e.period}</span>
          <h3>{e.title}</h3>
          <p>
            {e.school} · CGPA {e.cgpa}
          </p>
        </div>
      ))}
    </>
  )
}

function Contact() {
  return (
    <>
      <p style={{ marginBottom: 16 }}>{contact.note}</p>
      <div className="item">
        <p className="mono">{contact.email}</p>
        <p className="mono">{contact.phone}</p>
        <p style={{ marginTop: 10 }}>
          <a className="btn" href={`mailto:${contact.email}`}>
            Email me
          </a>
          <a className="btn o" target="_blank" rel="noopener noreferrer" href={contact.linkedin}>
            LinkedIn
          </a>
          <a className="btn o" target="_blank" rel="noopener noreferrer" href={contact.github}>
            GitHub
          </a>
        </p>
      </div>
    </>
  )
}

const CONTENT: Record<SectionKey, () => React.JSX.Element> = {
  work: Work,
  projects: Projects,
  skills: Skills,
  education: Education,
  contact: Contact,
}

export function SectionPanel({ section }: { section: SectionKey }) {
  const Content = CONTENT[section]
  return (
    <>
      <h2>{SECTION_TITLES[section]}</h2>
      <Content />
    </>
  )
}
