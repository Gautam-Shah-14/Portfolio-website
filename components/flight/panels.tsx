"use client"

import { useState } from "react"
import { contact, education, experiences, profile, projects, skills } from "@/lib/data"

export interface PanelDef {
  name: string
  render: (go: (index: number) => void) => React.ReactNode
}

function ProjectPanel({ index }: { index: number }) {
  const p = projects[index]
  return (
    <>
      <span className="lab">Project</span>
      <div className="card pj" style={{ marginTop: 14 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image} alt={`${p.name} logo`} style={{ background: p.background, objectFit: p.fit, padding: p.fit === "cover" ? 0 : 8 }} />
        <div>
          <h3>{p.name}</h3>
          <p>{p.description}</p>
          {p.tags.map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}

function SkillsPanel() {
  const [active, setActive] = useState<string | null>(null)
  const selected = skills.find((s) => s.name === active)
  return (
    <>
      <span className="lab">Skills</span>
      <h2 className="sec">What I use</h2>
      <div className="skw">
        {skills.map((s) => (
          <button key={s.name} aria-pressed={active === s.name} onClick={() => setActive(s.name)}>
            {s.name}
          </button>
        ))}
      </div>
      <div className="card skd">
        <h3>{selected ? selected.name : "Tap a skill"}</h3>
        <p style={{ color: "var(--lilac)" }}>{selected ? selected.description : "Each one opens a short note on how I use it."}</p>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <span className="lab">Education</span>
        <p style={{ marginTop: 8 }}>
          {education.map((e) => (
            <span key={e.title} style={{ display: "block" }}>
              <b>{e.title}</b> · {e.school} · {e.period} · CGPA {e.cgpa}
            </span>
          ))}
        </p>
      </div>
    </>
  )
}

function ContactPanel() {
  const [copied, setCopied] = useState(false)
  const copy = () =>
    navigator.clipboard?.writeText(contact.email).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      },
      () => {},
    )
  return (
    <>
      <span className="lab">Contact</span>
      <h2 className="sec">Let&apos;s talk</h2>
      <p className="lead" style={{ marginTop: 0, marginBottom: 22 }}>
        {contact.note}
      </p>
      <a className="big-mail" href={`mailto:${contact.email}`}>
        {contact.email}
      </a>
      <p style={{ marginTop: 14, color: "var(--lilac)" }}>{contact.phone}</p>
      <div className="cta">
        <button className="btn" onClick={copy}>
          {copied ? "Copied" : "Copy email"}
        </button>
        <a className="btn o" target="_blank" rel="noopener noreferrer" href={contact.linkedin}>
          LinkedIn
        </a>
        <a className="btn o" target="_blank" rel="noopener noreferrer" href={contact.github}>
          GitHub
        </a>
      </div>
      <p style={{ marginTop: 26, color: "var(--mute)", fontSize: 14 }}>
        © {new Date().getFullYear()} {profile.name}. All rights reserved.
      </p>
    </>
  )
}

export const PANELS: PanelDef[] = [
  {
    name: "Start",
    render: (go) => (
      <div className="hero-grid">
        <div>
          <span className="lab">{profile.role}</span>
          <h1 className="big" style={{ marginTop: 14 }}>
            {profile.firstName}
            <br />
            <span className="o">{profile.lastName}</span>
          </h1>
          <p className="lead">{profile.intro}</p>
          <div className="cta">
            <button className="btn" onClick={() => go(2)}>
              Fly in
            </button>
            <button className="btn o" onClick={() => go(6)}>
              Contact
            </button>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={profile.avatar} alt={`${profile.name} avatar`} />
      </div>
    ),
  },
  {
    name: "Work",
    render: () => (
      <>
        <span className="lab">Experience</span>
        <h2 className="sec">Where I&apos;ve worked</h2>
        <div className="row3">
          {experiences.map((e) => (
            <div className="card xp" key={e.role + e.period}>
              <span className="w">{e.period}</span>
              <h3>{e.role}</h3>
              <p>{e.company}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  { name: projects[0].name, render: () => <ProjectPanel index={0} /> },
  { name: projects[1].name, render: () => <ProjectPanel index={1} /> },
  { name: projects[2].name, render: () => <ProjectPanel index={2} /> },
  { name: "Skills", render: () => <SkillsPanel /> },
  { name: "Contact", render: () => <ContactPanel /> },
]
