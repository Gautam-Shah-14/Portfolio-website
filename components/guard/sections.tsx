"use client"

import { useState } from "react"
import { contact, education, experiences, projects, skillFilters, skills } from "@/lib/data"

export function Cases() {
  return (
    <section id="cases">
      <span className="lab">Projects</span>
      <h2 className="sec-h">Case files</h2>
      <div className="cases">
        {projects.map((p, i) => (
          <article className="case" key={p.name}>
            <div className="img" style={{ background: p.background }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={`${p.name} logo`} style={{ objectFit: p.fit, padding: p.fit === "contain" ? 10 : 0 }} />
            </div>
            <div>
              <span className="id">CASE-{String(i + 1).padStart(3, "0")}</span>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <div className="tags">
                {p.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              {p.link && (
                <a className="live" href={p.link} target="_blank" rel="noopener noreferrer">
                  Visit {p.link.replace("https://", "")} ↗
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function Toolkit() {
  const [filter, setFilter] = useState<(typeof skillFilters)[number]["id"]>("all")
  return (
    <section id="skills">
      <span className="lab">Skills</span>
      <h2 className="sec-h tight">Toolkit</h2>
      <div className="chips" role="group" aria-label="Filter skills">
        {skillFilters.map((f) => (
          <button key={f.id} className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label.toLowerCase()}
          </button>
        ))}
      </div>
      <div className="sks">
        {skills
          .filter((s) => filter === "all" || s.category === filter)
          .map((s) => (
            <div className="sk" key={s.name}>
              <b>{s.name}</b>
              <span>{s.description}</span>
            </div>
          ))}
      </div>
    </section>
  )
}

export function Record() {
  return (
    <section id="record">
      <span className="lab">Record</span>
      <h2 className="sec-h">Experience and education</h2>
      <div className="grid2">
        {experiences.map((e) => (
          <div className="card" key={e.role + e.period}>
            <span className="w">{e.period}</span>
            <h3>{e.role}</h3>
            <p>{e.company}</p>
            <ul>
              {e.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        ))}
        {education.map((e) => (
          <div className="card" key={e.title}>
            <span className="w">
              {e.period} · CGPA {e.cgpa}
            </span>
            <h3>{e.title}</h3>
            <p>{e.school}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function ContactSection() {
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
    <section id="contact">
      <div className="contact">
        <span className="lab">Contact</span>
        <h2 style={{ marginTop: 12 }}>Let&apos;s build something secure.</h2>
        <p>{contact.note}</p>
        <p className="mono">
          {contact.email}
          <br />
          {contact.phone}
        </p>
        <div className="cta-row">
          <a className="btn" href={`mailto:${contact.email}`}>
            Email me
          </a>
          <button className="btn o" onClick={copy}>
            {copied ? "Copied" : "Copy email"}
          </button>
          <a className="btn o" target="_blank" rel="noopener noreferrer" href={contact.linkedin}>
            LinkedIn
          </a>
          <a className="btn o" target="_blank" rel="noopener noreferrer" href={contact.github}>
            GitHub
          </a>
        </div>
      </div>
    </section>
  )
}
