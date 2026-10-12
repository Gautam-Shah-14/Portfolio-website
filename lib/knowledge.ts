import { contact, education, experiences, profile, projects, skillFilters, skills } from "./data"

export interface Chunk {
  id: string
  title: string
  /** cluster in the 3D vector space: 0 about, 1 experience, 2 projects, 3 skills, 4 education, 5 contact */
  topic: number
  keywords: string
  /** answer text, **double asterisks** mark bold */
  answer: string
  /** one-line evidence used when someone asks what he is capable of */
  evidence?: string
  links?: { label: string; href: string }[]
}

/** Every chunk is derived from lib/data.ts, so the assistant never drifts from the rest of the site. */
export function buildKnowledge(): Chunk[] {
  const chunks: Chunk[] = [
    {
      id: "about",
      title: "About",
      topic: 0,
      keywords: "who gautam about introduce summary do work engineer profile mcp full-stack backend founder location pune remote",
      answer: `I'm a **${profile.headline}**, currently ${profile.role} at ${profile.company}, based in ${profile.location}. ${profile.about}`,
    },
    {
      id: "strengths",
      title: "Strengths and track record",
      topic: 0,
      keywords: "strengths strong good best capable capability capable able ability handle handling heavy complex hard difficult tasks track record reliable production scale ship shipping end-to-end full-stack workflow quality",
      answer: `He ships complete products end to end, from database and API through to the interface. He builds backend services and integrations that he tests against live systems, and reviews AI-generated code against real behavior, rebuilding a component from scratch when the first version proves unreliable.`,
      evidence: "Ships complete products end to end, from database and API through to the interface.",
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
      keywords: `experience job work role current intern internship employer company career ${e.role} ${e.company} ${e.period} ${e.highlights.join(" ")}`,
      answer: `**${e.role}** at **${e.company}**, ${e.period}. ${e.highlights.join(" ")}`,
      evidence: `${e.role} at ${e.company} (${e.period}): ${e.highlights[0]}`,
    }),
  )

  projects.forEach((p) =>
    chunks.push({
      id: `proj-${p.name.toLowerCase().replace(/\W+/g, "-")}`,
      title: p.name,
      topic: 2,
      keywords: `project built portfolio product ${p.name} ${p.kind} ${p.tags.join(" ")} ${p.description}`,
      answer: `**${p.name}** (${p.kind}): ${p.description}${p.link ? ` Live at ${p.link.replace("https://", "")}.` : ""}`,
      evidence: `${p.name} (${p.kind}): ${p.description.split(". ")[0]}.`,
      links: p.link ? [{ label: `${p.name} live`, href: p.link }] : undefined,
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
        keywords: `skills stack technical tools technology languages ${f.label} ${group.map((s) => `${s.name} ${s.description}`).join(" ")}`,
        answer: group.map((s) => `**${s.name}**: ${s.description}`).join(" "),
        evidence: `${f.label}: ${group.map((s) => s.name).join(", ")}.`,
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
    keywords: "contact email phone reach hire linkedin github leetcode connect message mail call talk opportunities location remote pune",
    answer: `Email: **${contact.email}** · Phone: **${contact.phone}** · Based in ${contact.location}. ${contact.note}`,
    links: [
      { label: "LinkedIn", href: contact.linkedin },
      { label: "GitHub", href: contact.github },
      { label: "LeetCode", href: contact.leetcode },
    ],
  })

  return chunks
}
