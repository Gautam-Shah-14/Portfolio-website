import Image from "next/image"
import { contact, education, experiences, profile, projects, skillFilters, skills, type SkillCategory } from "@/lib/data"
import type { DeskTarget } from "./scene"

const filterLabel = Object.fromEntries(skillFilters.map((f) => [f.id, f.label])) as Record<string, string>

export function PanelBody({
  id,
  filter,
  onFilter,
}: {
  id: DeskTarget
  filter: SkillCategory | "all"
  onFilter: (f: SkillCategory | "all") => void
}) {
  if (id === "projects")
    return (
      <>
        <div className="eyebrow">on the laptop</div>
        <h2>Projects</h2>
        <p>Things I built end to end.</p>
        {projects.map((p) => (
          <div className="card" key={p.name}>
            <div className="img" style={{ background: p.background }}>
              <Image src={p.image} alt={p.name} width={480} height={300} style={{ objectFit: p.fit }} />
            </div>
            <div className="body">
              <div className="kind">{p.kind}</div>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <div className="tags">
                {p.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              {p.link && (
                <a className="btn" target="_blank" rel="noopener noreferrer" href={p.link}>
                  Visit
                </a>
              )}
            </div>
          </div>
        ))}
      </>
    )
  if (id === "about")
    return (
      <>
        <div className="eyebrow">from the notebook</div>
        <h2>{profile.headline}</h2>
        <AboutText />
        <h2 className="sub">Where I&apos;ve worked</h2>
        {experiences.map((e) => (
          <div className="job" key={e.role + e.period}>
            <h3>{e.role}</h3>
            <div className="when">
              {e.company} · {e.period}
            </div>
            <ul>
              {e.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        ))}
      </>
    )
  if (id === "skills") {
    const list = skills.filter((s) => filter === "all" || s.category === filter)
    return (
      <>
        <div className="eyebrow">from the board</div>
        <h2>Skills</h2>
        <div className="chips">
          {skillFilters.map((f) => (
            <button key={f.id} className={f.id === filter ? "on" : ""} onClick={() => onFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        {list.map((s) => (
          <div className="sk" key={s.name}>
            <i>{filterLabel[s.category]}</i>
            <b>{s.name}</b>
            <p>{s.description}</p>
          </div>
        ))}
      </>
    )
  }
  if (id === "education")
    return (
      <>
        <div className="eyebrow">from the shelf</div>
        <h2>Education</h2>
        {education.map((e) => (
          <div className="edu" key={e.title}>
            <b>{e.title}</b>
            <span>
              {e.school} · {e.period} · CGPA {e.cgpa}
            </span>
          </div>
        ))}
      </>
    )
  const rows: [string, string, string][] = [
    ["Email", contact.email, `mailto:${contact.email}`],
    ["Phone", contact.phone, `tel:${contact.phone.replace(/\s/g, "")}`],
    ["LinkedIn", "gautam-shah", contact.linkedin],
    ["GitHub", "Gautam-Shah-14", contact.github],
    ["LeetCode", "csvcmpMIGU", contact.leetcode],
  ]
  return (
    <>
      <div className="eyebrow">grab a coffee</div>
      <h2>Let&apos;s talk</h2>
      <p>{contact.note}</p>
      {rows.map(([k, v, href]) => (
        <a className="link" key={k} target="_blank" rel="noopener noreferrer" href={href}>
          <b>{k}</b>
          <span>{v}</span>
        </a>
      ))}
      <p>{contact.location}</p>
    </>
  )
}


function AboutText() {
  return <p>{profile.about}</p>
}
