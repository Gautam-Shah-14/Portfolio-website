import { contact, education, experiences, profile, projects, skillFilters, skills } from "./data"

export interface Chunk {
  id: string
  title: string
  /** cluster in the 3D vector space: 0 about, 1 experience, 2 projects, 3 skills, 4 education, 5 contact */
  topic: number
  keywords: string
  /** answer text, **double asterisks** mark bold */
  answer: string
  links?: { label: string; href: string }[]
}

/** Every chunk is derived from lib/data.ts, so the chat never drifts from the rest of the site. */
export function buildKnowledge(): Chunk[] {
  const chunks: Chunk[] = [
    {
      id: "about",
      title: "About",
      topic: 0,
      keywords: "who gautam about introduce summary do work engineer profile mcp",
      answer: `I'm a **${profile.role}** at ${profile.company}. ${profile.about}`,
    },
    {
      id: "interests",
      title: "What I care about",
      topic: 0,
      keywords: "interest passion care security ai safety trust production real-world problems goals looking",
      answer: "I care about **secure, trustworthy AI**: systems that are intelligent but also safe in production, and that solve real-world problems.",
    },
  ]

  experiences.forEach((e, i) =>
    chunks.push({
      id: `exp-${i}`,
      title: `${e.role}${e.current ? "" : " (past)"}`,
      topic: 1,
      keywords: `experience job work role current intern internship employer company career ${e.role} ${e.company} ${e.period}`,
      answer: `**${e.role}** at **${e.company}**, ${e.period}.`,
    }),
  )

  projects.forEach((p) =>
    chunks.push({
      id: `proj-${p.name.toLowerCase()}`,
      title: p.name,
      topic: 2,
      keywords: `project built portfolio ${p.name} ${p.kind} ${p.tags.join(" ")} ${p.description}`,
      answer: `**${p.name}**: ${p.description}`,
    }),
  )

  skillFilters
    .filter((f) => f.id !== "all")
    .forEach((f) => {
      const group = skills.filter((s) => s.category === f.id)
      chunks.push({
        id: `skills-${f.id}`,
        title: `${f.label} skills`,
        topic: 3,
        keywords: `skills stack technical tools technology ${f.label} ${group.map((s) => `${s.name} ${s.description}`).join(" ")}`,
        answer: group.map((s) => `**${s.name}**: ${s.description}`).join(" "),
      })
    })

  education.forEach((e, i) =>
    chunks.push({
      id: `edu-${i}`,
      title: e.title.split(",")[0],
      topic: 4,
      keywords: `education degree study college university school cgpa graduate course ${e.title} ${e.school}`,
      answer: `**${e.title}** at ${e.school}, ${e.period}, CGPA **${e.cgpa}**.`,
    }),
  )

  chunks.push({
    id: "contact",
    title: "Contact",
    topic: 5,
    keywords: "contact email phone reach hire linkedin github connect message mail call talk opportunities",
    answer: `Email: **${contact.email}** · Phone: **${contact.phone}**. ${contact.note}`,
    links: [
      { label: "LinkedIn", href: contact.linkedin },
      { label: "GitHub", href: contact.github },
    ],
  })

  return chunks
}
