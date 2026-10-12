"use client"

import { useState } from "react"
import { contact, education, experiences, projects, skillFilters, skills } from "@/lib/data"

function Head({ eyebrow, title, sub }: { eyebrow: string; title: React.ReactNode; sub?: string }) {
  return (
    <header className="sec-head">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </header>
  )
}

export function Projects() {
  return (
    <section className="sec" id="projects">
      <Head eyebrow="Projects" title={<>Things I&apos;ve <span className="grad">built</span></>} sub="Mobile apps, AI services and security tooling." />
      <div className="cards3">
        {projects.map((p) => (
          <article className="glass project" key={p.name}>
            <div className="thumb" style={{ background: p.background }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={`${p.name} logo`} style={{ objectFit: p.fit, padding: p.fit === "contain" ? 14 : 0 }} />
            </div>
            <span className="kind">{p.kind}</span>
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <div className="tags">
              {p.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function Skills() {
  const [filter, setFilter] = useState<(typeof skillFilters)[number]["id"]>("all")
  return (
    <section className="sec" id="skills">
      <Head eyebrow="Skills" title={<>What I <span className="grad">work with</span></>} sub="From MCP servers and LLM apps to backends, databases and mobile." />
      <div className="filters" role="group" aria-label="Filter skills">
        {skillFilters.map((f) => (
          <button key={f.id} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="cards3 tight">
        {skills
          .filter((s) => filter === "all" || s.category === filter)
          .map((s) => (
            <article className="glass skill" key={s.name}>
              <h3>{s.name}</h3>
              <p>{s.description}</p>
            </article>
          ))}
      </div>
    </section>
  )
}

export function Record() {
  return (
    <section className="sec" id="experience">
      <Head eyebrow="Experience and education" title={<>Where I&apos;ve <span className="grad">worked and studied</span></>} />
      <div className="cards3 two">
        {experiences.map((e) => (
          <article className="glass" key={e.role + e.period}>
            <span className="kind">{e.period}</span>
            <h3>{e.role}</h3>
            <p className="who">{e.company}</p>
            <ul>
              {e.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </article>
        ))}
        {education.map((e) => (
          <article className="glass" key={e.title}>
            <span className="kind">
              {e.period} · CGPA {e.cgpa}
            </span>
            <h3>{e.title}</h3>
            <p className="who">{e.school}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export function Contact() {
  return (
    <section className="sec" id="contact">
      <div className="glass cta">
        <span className="eyebrow">Contact</span>
        <h2>
          Let&apos;s build something <span className="grad">secure</span>.
        </h2>
        <p>{contact.note}</p>
        <div className="cta-row">
          <a className="btn" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
          <a className="btn ghost" href={contact.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a className="btn ghost" href={contact.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
        <small>
          {contact.phone} · {contact.location}
        </small>
      </div>
    </section>
  )
}
