import { contact, education, experiences, projects, skillFilters, skills } from "./data"

export interface NetNode {
  id: string
  title: string
  label: string
  meta?: string
  text: string
  items?: { name: string; description: string }[]
  tags?: string[]
  image?: { src: string; background: string; fit: "cover" | "contain" }
  link?: string
  contact?: boolean
}

export interface NetLayer {
  name: string
  sub: string
  color: number
  nodes: NetNode[]
}

/** The portfolio as five layers. Every node is built from lib/data.ts. */
export function buildNetwork(): NetLayer[] {
  return [
    {
      name: "Input",
      sub: "Education",
      color: 0xb48aff,
      nodes: education.map((e, i) => ({
        id: `edu-${i}`,
        title: e.title,
        label: `Education · ${e.period}`,
        meta: `CGPA ${e.cgpa}`,
        text: `${e.school}.`,
      })),
    },
    {
      name: "Hidden 1",
      sub: "Experience",
      color: 0x8a3ffc,
      nodes: [...experiences].reverse().map((e, i) => ({
        id: `exp-${i}`,
        title: e.role,
        label: `${e.company} · ${e.period}`,
        meta: e.current ? "current role" : undefined,
        text: e.highlights.join(" "),
      })),
    },
    {
      name: "Hidden 2",
      sub: "Skills",
      color: 0x6d28d9,
      nodes: skillFilters
        .filter((f) => f.id !== "all")
        .map((f) => {
          const group = skills.filter((s) => s.category === f.id)
          return {
            id: `skills-${f.id}`,
            title: f.label,
            label: `Skills · ${group.length}`,
            text: group.map((s) => s.name).join(", ") + ".",
            items: group.map((s) => ({ name: s.name, description: s.description })),
          }
        }),
    },
    {
      name: "Hidden 3",
      sub: "Projects",
      color: 0xa66cff,
      nodes: projects.map((p) => ({
        id: `proj-${p.name.toLowerCase().replace(/\W+/g, "-")}`,
        title: p.name,
        label: `Project · ${p.kind}`,
        text: p.description,
        tags: p.tags,
        image: { src: p.image, background: p.background, fit: p.fit },
        link: p.link,
      })),
    },
    {
      name: "Output",
      sub: "Contact",
      color: 0xff7ad9,
      nodes: [
        {
          id: "contact",
          title: "Contact",
          label: `Output · ${contact.location}`,
          text: contact.note,
          contact: true,
        },
      ],
    },
  ]
}
