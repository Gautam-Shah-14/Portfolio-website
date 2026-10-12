"use client"

import { useState } from "react"
import { contact, education, experiences, profile, projects, skillFilters, skills } from "@/lib/data"
import type { AppId } from "./desktop"

export function About({ open }: { open: (id: AppId) => void }) {
  return (
    <>
      <div className="avwrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={profile.avatar} alt={profile.name} />
        <div>
          <h1>
            {profile.firstName} <em>{profile.lastName}</em>
          </h1>
          <span className="when">
            ● online · {profile.headline} @ {profile.company}
          </span>
        </div>
      </div>
      <p>{profile.about}</p>
      <p>
        <button className="btn" onClick={() => open("projects")}>
          Open projects
        </button>
        <button className="btn" onClick={() => open("terminal")}>
          Try the terminal
        </button>
        <button className="btn" onClick={() => open("contact")}>
          Contact
        </button>
      </p>
    </>
  )
}

export function Experience() {
  return (
    <>
      {experiences.map((e) => (
        <div className="row" key={e.role + e.period}>
          <span className="when">{e.period}</span>
          <h2>{e.role}</h2>
          <p>{e.company}</p>
          {e.highlights.map((h) => (
            <p key={h} style={{ fontSize: 13, color: "var(--mute)" }}>
              {h}
            </p>
          ))}
        </div>
      ))}
    </>
  )
}

export function Projects() {
  return (
    <>
      {projects.map((p) => (
        <div className="row proj" key={p.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image} alt={`${p.name} logo`} style={{ background: p.background, objectFit: p.fit, padding: p.fit === "cover" ? 0 : 6 }} />
          <div>
            <h2>{p.name}</h2>
            <p>{p.description}</p>
            {p.tags.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
            {p.link && (
              <p style={{ marginTop: 8 }}>
                <a href={p.link} target="_blank" rel="noopener noreferrer">
                  {p.link.replace("https://", "")} ↗
                </a>
              </p>
            )}
          </div>
        </div>
      ))}
    </>
  )
}

export function Skills() {
  const [filter, setFilter] = useState<(typeof skillFilters)[number]["id"]>("all")
  return (
    <>
      <div className="tabs">
        {skillFilters.map((f) => (
          <button key={f.id} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.id === "ai" ? "ai-ml" : f.id}
          </button>
        ))}
      </div>
      {skills
        .filter((s) => filter === "all" || s.category === filter)
        .map((s) => (
          <div className="row" key={s.name}>
            <h2>{s.name}</h2>
            <p>{s.description}</p>
          </div>
        ))}
    </>
  )
}

export function Education() {
  return (
    <>
      {education.map((e) => (
        <div className="row" key={e.title}>
          <span className="when">{e.period}</span>
          <h2>{e.title}</h2>
          <p>
            {e.school} · CGPA {e.cgpa}
          </p>
        </div>
      ))}
    </>
  )
}

export function Contact() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard?.writeText(contact.email).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      },
      () => {},
    )
  }
  return (
    <>
      <p>{contact.note}</p>
      <div className="row">
        <p>{contact.email}</p>
        <p>{contact.phone}</p>
        <a className="btn" href={`mailto:${contact.email}`}>
          Email
        </a>
        <button className="btn" onClick={copy}>
          {copied ? "Copied" : "Copy email"}
        </button>
        <a className="btn" target="_blank" rel="noopener noreferrer" href={contact.linkedin}>
          LinkedIn
        </a>
        <a className="btn" target="_blank" rel="noopener noreferrer" href={contact.github}>
          GitHub
        </a>
      </div>
    </>
  )
}
