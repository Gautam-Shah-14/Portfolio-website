import { respond, type Context } from "../assistant"
import { contact, education, experiences, profile, projects, skillFilters, skills } from "../data"
import { evaluate } from "../guard"
import { buildKnowledge } from "../knowledge"
import { buildIndex } from "../retrieval"
import { site } from "../site"

/* ---------- JSON-RPC 2.0 types ---------- */
export type RpcId = string | number | null
export interface RpcRequest {
  jsonrpc: "2.0"
  id?: RpcId
  method: string
  params?: Record<string, unknown>
}
export interface RpcResponse {
  jsonrpc: "2.0"
  id: RpcId
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

export const SUPPORTED_PROTOCOLS = ["2025-06-18", "2025-03-26", "2024-11-05"]

const index = buildIndex(buildKnowledge())
const categories = skillFilters.filter((f) => f.id !== "all").map((f) => f.id)

const text = (t: string) => ({ content: [{ type: "text", text: t }] })
const toolError = (t: string) => ({ isError: true, content: [{ type: "text", text: t }] })
const plain = (t: string) => t.replace(/\*\*/g, "")

interface Tool {
  name: string
  title: string
  description: string
  inputSchema: { type: "object"; properties: Record<string, unknown>; required?: string[]; additionalProperties: boolean }
  run: (args: Record<string, unknown>) => unknown
}

const noArgs = { type: "object" as const, properties: {}, additionalProperties: false }

/** Each assistant call keeps no state between requests, so the transport can stay stateless. */
const TOOLS: Tool[] = [
  {
    name: "get_profile",
    title: "Get profile",
    description: "Who Gautam is: headline, current role, location and summary.",
    inputSchema: noArgs,
    run: () => text(`${profile.name} · ${profile.headline}\n${profile.role} at ${profile.company}\n${profile.location}\n\n${profile.about}`),
  },
  {
    name: "list_projects",
    title: "List projects",
    description: "List his projects with a one-line summary.",
    inputSchema: noArgs,
    run: () => text(projects.map((p) => `• ${p.name} (${p.kind}): ${p.description.split(". ")[0]}.`).join("\n")),
  },
  {
    name: "get_project",
    title: "Get project",
    description: "Full details of one project by name.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Project name, for example VoxSecure" } },
      required: ["name"],
      additionalProperties: false,
    },
    run: (a) => {
      const p = projects.find((x) => x.name.toLowerCase() === String(a.name).toLowerCase())
      if (!p) return toolError(`No project named "${a.name}". Available: ${projects.map((x) => x.name).join(", ")}`)
      return text(`${p.name} (${p.kind})\n${p.description}\nStack: ${p.tags.join(", ")}`)
    },
  },
  {
    name: "search_skills",
    title: "Search skills",
    description: "Search skills by keyword and optionally filter by category.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keyword, for example rag or fastapi" },
        category: { type: "string", enum: categories, description: "Skill category" },
      },
      additionalProperties: false,
    },
    run: (a) => {
      const q = String(a.query ?? "").toLowerCase()
      const found = skills.filter((s) => (!a.category || s.category === a.category) && (!q || `${s.name} ${s.description}`.toLowerCase().includes(q)))
      return text(found.length ? found.map((s) => `• ${s.name} [${s.category}]: ${s.description}`).join("\n") : "No skills match.")
    },
  },
  {
    name: "list_experience",
    title: "List experience",
    description: "Work experience, newest first, with highlights.",
    inputSchema: noArgs,
    run: () => text(experiences.map((e) => `${e.role} at ${e.company} (${e.period})\n  ${e.highlights.join("\n  ")}`).join("\n\n")),
  },
  {
    name: "list_education",
    title: "List education",
    description: "Degrees and diplomas.",
    inputSchema: noArgs,
    run: () => text(education.map((e) => `${e.title}, ${e.school}, ${e.period}, CGPA ${e.cgpa}`).join("\n")),
  },
  {
    name: "ask_about_gautam",
    title: "Ask about Gautam",
    description: "Ask a free-text question. Uses the same validated retrieval assistant as the website chat (handles typos, loaded wording and capability questions).",
    inputSchema: {
      type: "object",
      properties: { question: { type: "string", description: "Your question" } },
      required: ["question"],
      additionalProperties: false,
    },
    run: (a) => {
      const context: Context = { lastIds: [] }
      return text(plain(respond(index, String(a.question), context).text))
    },
  },
  {
    name: "check_prompt_safety",
    title: "Check prompt safety",
    description: "Run a prompt through the three-layer guardrail (input filter, intent classifier, output check) and return the verdict and scores.",
    inputSchema: {
      type: "object",
      properties: { text: { type: "string", description: "Prompt to check" } },
      required: ["text"],
      additionalProperties: false,
    },
    run: (a) => {
      const r = evaluate(String(a.text))
      return text(
        JSON.stringify(
          { verdict: r.verdict, layer: r.layer, scores: { input_filter: +r.l1.toFixed(2), intent_classifier: +r.l2.toFixed(2), output_filter: +r.l3.toFixed(2) }, why: r.why },
          null,
          2,
        ),
      )
    },
  },
]

const RESOURCES = [
  {
    uri: "portfolio://profile",
    name: "Profile",
    description: "Summary of Gautam as Markdown",
    mimeType: "text/markdown",
    read: () => `# ${profile.name}\n${profile.headline}\n\n${profile.about}`,
  },
  {
    uri: "portfolio://skills",
    name: "Skills",
    description: "All skills as JSON",
    mimeType: "application/json",
    read: () => JSON.stringify(skills, null, 2),
  },
  {
    uri: "portfolio://contact",
    name: "Contact",
    description: "How to reach Gautam",
    mimeType: "text/plain",
    read: () => `Email: ${contact.email}\nPhone: ${contact.phone}\nLinkedIn: ${contact.linkedin}\nGitHub: ${contact.github}\nLocation: ${contact.location}`,
  },
]

const PROMPTS = [
  {
    name: "recruiter_summary",
    description: "A short brief for a recruiter, tailored to a role.",
    arguments: [{ name: "role", description: "Role being hired for", required: false }],
    get: (a: Record<string, unknown>) => [
      {
        role: "user",
        content: {
          type: "text",
          text: `Write a five-line recruiter brief for ${profile.name}${a.role ? ` for a ${a.role} role` : ""}, using only these facts:\n${profile.about}\nSkills: ${skills.map((s) => s.name).join(", ")}`,
        },
      },
    ],
  },
]

const ok = (id: RpcId, result: unknown): RpcResponse => ({ jsonrpc: "2.0", id, result })
const fail = (id: RpcId, code: number, message: string, data?: unknown): RpcResponse => ({ jsonrpc: "2.0", id, error: { code, message, data } })

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v)

/** Handles one JSON-RPC message. Returns null for notifications, which get no response. */
export function handleMessage(msg: unknown): RpcResponse | null {
  if (!isRecord(msg) || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return fail(isRecord(msg) && (typeof msg.id === "string" || typeof msg.id === "number") ? msg.id : null, -32600, "Invalid Request")
  }
  const isNotification = msg.id === undefined
  const id = (isNotification ? null : msg.id) as RpcId
  const method = msg.method
  const params = isRecord(msg.params) ? msg.params : {}

  if (isNotification) return null // notifications/initialized, notifications/cancelled and so on

  switch (method) {
    case "initialize": {
      const asked = typeof params.protocolVersion === "string" ? params.protocolVersion : ""
      return ok(id, {
        protocolVersion: SUPPORTED_PROTOCOLS.includes(asked) ? asked : SUPPORTED_PROTOCOLS[0],
        capabilities: { tools: { listChanged: false }, resources: { listChanged: false }, prompts: { listChanged: false } },
        serverInfo: { name: site.serverName, title: "Gautam Shah's portfolio", version: site.serverVersion },
        instructions: "Read-only server about Gautam Shah's portfolio. Start with get_profile, or use ask_about_gautam for free-text questions.",
      })
    }
    case "ping":
      return ok(id, {})
    case "tools/list":
      return ok(id, {
        tools: TOOLS.map((t) => ({ name: t.name, title: t.title, description: t.description, inputSchema: t.inputSchema, annotations: { readOnlyHint: true, openWorldHint: false } })),
      })
    case "tools/call": {
      const tool = TOOLS.find((t) => t.name === params.name)
      if (!tool) return fail(id, -32602, `Unknown tool: ${String(params.name)}`)
      const args = isRecord(params.arguments) ? params.arguments : {}
      const missing = (tool.inputSchema.required ?? []).filter((k) => args[k] === undefined || args[k] === "")
      if (missing.length) return ok(id, toolError(`Missing required argument: ${missing.join(", ")}`))
      try {
        return ok(id, tool.run(args))
      } catch (e) {
        return ok(id, toolError(e instanceof Error ? e.message : "Tool failed"))
      }
    }
    case "resources/list":
      return ok(id, { resources: RESOURCES.map(({ uri, name, description, mimeType }) => ({ uri, name, description, mimeType })) })
    case "resources/read": {
      const r = RESOURCES.find((x) => x.uri === params.uri)
      return r ? ok(id, { contents: [{ uri: r.uri, mimeType: r.mimeType, text: r.read() }] }) : fail(id, -32002, `Resource not found: ${String(params.uri)}`)
    }
    case "prompts/list":
      return ok(id, { prompts: PROMPTS.map(({ name, description, arguments: args }) => ({ name, description, arguments: args })) })
    case "prompts/get": {
      const p = PROMPTS.find((x) => x.name === params.name)
      const args = isRecord(params.arguments) ? params.arguments : {}
      return p ? ok(id, { description: p.description, messages: p.get(args) }) : fail(id, -32602, `Prompt not found: ${String(params.name)}`)
    }
    default:
      return fail(id, -32601, `Method not found: ${method}`)
  }
}

/** Handles a request body: a single message or a batch. Returns null when there is nothing to send back. */
export function handleBody(body: unknown): RpcResponse | RpcResponse[] | null {
  if (Array.isArray(body)) {
    if (body.length === 0) return fail(null, -32600, "Invalid Request")
    const out = body.map(handleMessage).filter((r): r is RpcResponse => r !== null)
    return out.length ? out : null
  }
  return handleMessage(body)
}

export const PARSE_ERROR = fail(null, -32700, "Parse error")
export const RATE_LIMITED = fail(null, -32000, "Rate limit exceeded. Try again in a minute.")
