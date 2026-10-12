import { correctTypos, search, STOP, tokens, type Hit, type Index } from "./retrieval"

export interface Context {
  /** chunk ids used in the previous answer, so "tell me more" has something to continue from */
  lastIds: string[]
}

export interface Reply {
  /** what the validation and retrieval stages did, shown to the visitor */
  steps: string[]
  /** paragraphs separated by blank lines, **double asterisks** mark bold */
  text: string
  hits: Hit[]
  /** clickable follow-ups, offered when the question was unclear */
  options: string[]
  links: { label: string; href: string }[]
}

const DEFAULT_OPTIONS = ["What has he built?", "Has he built MCP servers?", "What are his skills?", "Tell me about his experience", "How can I contact him?"]

/* ---------- question validation ---------- */
const INJECTION = /(ignore|disregard|forget|override|bypass)\b.{0,30}\b(previous|above|prior|all|earlier|your)\b.{0,30}\b(instruction|prompt|rule)|system prompt|you are now|pretend (you|to be)|jailbreak|developer mode|\bdan\b/i
const GREETING = /^(hi|hii+|hello|hey+|yo|good (morning|afternoon|evening)|namaste|sup)\b/i
const THANKS = /^(thanks|thank you|thx|ty|cool|nice|great|awesome|ok(ay)?|got it)\b/i
const BYE = /^(bye|goodbye|see you|cya)\b/i
const IDENTITY = /(who are you|what are you|are you (a )?(bot|ai|human|real)|what can you (do|answer))/i
const PRIVATE = /\b(salary|ctc|compensation|income|earnings?|net worth|how much (does|do|is) (he|you|his)\b.{0,20}(earn|make|paid|pay|cost)|age|how old|married|girlfriend|boyfriend|wife|religion|caste|home address|family|parents|politics)\b/i
const COMPARE = /(better than|best (developer|engineer|candidate)|worst|\bvs\b|versus|compare|top \d+|rank|who is better|cheaper than)/i
const CAPABILITY = /(capab|able to|can (he|gautam)|handle|handling|heavy|complex|difficult|hard task|large[- ]scale|at scale|production[- ]grade|reliab|good at|good enough|strong|expert|skilled|proficient|competent|ready for|fit for|suitable|trust|depend)/i
const NEGATION = /(\b(not|never|no|only|just|merely|nothing|without|lack|lacks|unable|cannot)\b|n'?t\b)/i
const HYPOTHETICAL = /\b(would|if he|what if|suppose|imagine|could he|hypothetic)/i
const FOLLOW_UP = /^(tell me more|more|more details|go on|continue|and|and\??|what else|else|elaborate|explain|why|how|really|details)\??$/i
const CAPABILITY_WORDS = new Set("capable capability capab able ability handle handling heavy complex difficult hard tasks task large scale production reliable good strong expert skilled proficient competent ready fit suitable trust depend work job build builds built building make create develop system systems able would should".split(" "))

function splitParts(q: string): string[] {
  const parts = q
    .split(/\?+|;|\band also\b|\balso\b|\band then\b|,?\s+and\s+(?=(what|how|does|do|is|has|have|can|where|which|who|tell|show))/i)
    .map((p) => (p ?? "").trim())
    .filter((p) => p.length > 2 && tokens(p).length >= 1)
  return parts.length ? parts.slice(0, 3) : [q.trim()]
}

function optionFor(h: Hit): string {
  if (h.chunk.id === "strengths") return "What is he strong at?"
  if (h.chunk.id === "about") return "Who is Gautam?"
  if (h.chunk.id.startsWith("exp-")) return `Tell me about his ${h.chunk.title.replace(" (past)", "")} role`
  if (h.chunk.id.startsWith("skills-")) return `What are his ${h.chunk.title.toLowerCase()}?`
  return `Tell me about ${h.chunk.title}`
}

const firstSentence = (s: string) => {
  const clean = s.replace(/\*\*/g, "")
  const m = clean.match(/^.{20,220}?[.!?](\s|$)/)
  return (m ? m[0] : clean.slice(0, 200)).trim()
}

interface PartResult {
  text: string
  hits: Hit[]
  kinds: string[]
  weak: boolean
  /** weak only because it is a follow-up: offer options without saying the question was unclear */
  quiet?: boolean
}

function answerPart(index: Index, part: string, ctx: Context, evidenceById: (id: string) => Hit | null): PartResult {
  const byIdHit = evidenceById
  const kinds: string[] = []
  const typo = correctTypos(index, part)
  if (typo.fixes.length) kinds.push(`fixed typo${typo.fixes.length > 1 ? "s" : ""} (${typo.fixes.map(([a, b]) => `${a}→${b}`).join(", ")})`)
  const query = typo.query
  const isCapability = CAPABILITY.test(query)
  const isNegated = NEGATION.test(query)
  const isHypothetical = HYPOTHETICAL.test(query)
  if (isCapability) kinds.push("capability question")
  if (isNegated) kinds.push("negation or loaded wording")
  if (isHypothetical) kinds.push("hypothetical")

  if (FOLLOW_UP.test(query.trim()) || tokens(query).length === 0) {
    kinds.push("follow-up without a topic")
    if (ctx.lastIds.length) {
      const next = ctx.lastIds
        .map((id) => evidenceById(id))
        .filter((h): h is Hit => !!h)
        .slice(0, 2)
      if (next.length) {
        return {
          text: `Building on the last answer: ${next.map((h) => firstSentence(h.chunk.evidence ?? h.chunk.answer)).join(" ")}\n\nWhich part should I go deeper on?`,
          hits: next,
          kinds,
          weak: true,
          quiet: true,
        }
      }
    }
    return { text: "I'm not sure which topic you mean yet. Pick one below or ask a full question.", hits: [], kinds, weak: true }
  }

  if (isCapability) {
    const topicQuery = tokens(query)
      .filter((w) => !CAPABILITY_WORDS.has(w) && !CAPABILITY_WORDS.has(w.slice(0, 5)))
      .join(" ")
    let hits = topicQuery ? search(index, topicQuery, 3).filter((h) => h.sim >= 0.5) : []
    const generic = hits.length === 0
    if (generic) {
      hits = ["strengths", "exp-0", "proj-storyburners"].map(evidenceById).filter((h): h is Hit => !!h)
    }
    const bullets = hits.slice(0, 3).map((h) => `• ${firstSentence(h.chunk.evidence ?? h.chunk.answer)}`)
    const text = [
      `I can't give a grade or a guarantee, but this is what his record shows${generic ? "" : " on that"}:`,
      bullets.join("\n"),
      "Not documented here: traffic or data volumes, team size and on-call history. For specifics on how heavy a workload he has handled, ask him directly.",
    ].join("\n\n")
    return { text, hits, kinds, weak: false }
  }

  const hits = search(index, query, 3)
  if (!hits.length) return { text: "", hits: [], kinds, weak: true }
  const weak = hits[0].sim < 0.56
  const lead = hits[0].chunk
  const extra = hits[1] && hits[1].rel >= 0.8 ? hits[1].chunk : null
  let body = [lead.answer, extra?.answer].filter(Boolean).join("\n\n")
  if (isNegated) {
    const strong = !weak
    const overall = byIdHit("strengths")
    body = `${strong ? "Checking that against his record:" : "I don't see that clearly in his record, so I can't confirm it. The closest match is:"}\n\n${body}${overall ? `\n\nFor the bigger picture: ${firstSentence(overall.chunk.evidence ?? overall.chunk.answer)}` : ""}`
    if (overall) hits.push(overall)
  } else if (isHypothetical) {
    body = `I can only speak to his actual record, not hypotheticals. The closest evidence:\n\n${body}`
  }
  return { text: body, hits, kinds, weak }
}

/** Validates the question, then answers it from the retrieved chunks. Pure function, no side effects. */
export function respond(index: Index, raw: string, ctx: Context): Reply {
  const text = raw.trim()
  const byId = (id: string): Hit | null => {
    const entry = index.entries.find((e) => e.chunk.id === id)
    return entry ? { chunk: entry.chunk, rel: 1, sim: 0.9 } : null
  }
  const empty = (steps: string[], body: string, options: string[] = []): Reply => ({ steps, text: body, hits: [], options, links: [] })

  if (INJECTION.test(text)) {
    return empty(["validating question: instruction-override attempt", "no retrieval performed"], "I'll stay on topic: I only answer questions about Gautam's work. Ask me about his **projects**, **MCP servers and clients**, **skills** or **experience**.", DEFAULT_OPTIONS.slice(0, 3))
  }
  if (GREETING.test(text) && tokens(text).length <= 2) {
    return empty(["validating question: greeting"], "Hi! I can tell you about Gautam's projects, MCP work, skills, experience and education. What would you like to know?", DEFAULT_OPTIONS.slice(0, 4))
  }
  if (THANKS.test(text) && tokens(text).length <= 3) return empty(["validating question: acknowledgement"], "Glad that helped. Anything else you'd like to know about his work?", DEFAULT_OPTIONS.slice(0, 3))
  if (BYE.test(text)) return empty(["validating question: goodbye"], "Thanks for stopping by. His email is on the contact section whenever you want to reach him.")
  if (IDENTITY.test(text)) {
    return empty(["validating question: about the assistant"], "I'm a small retrieval assistant that runs in your browser. I search a knowledge base built from Gautam's portfolio and answer from the closest matches. I'm not a live language model, so I can only tell you what's documented.", DEFAULT_OPTIONS.slice(0, 3))
  }
  if (PRIVATE.test(text)) {
    return empty(["validating question: personal or private detail"], "That's personal, so it isn't something I have or should guess. For anything like that, please ask Gautam directly. His contact details are in the contact section.", ["How can I contact him?", "What has he built?"])
  }

  const parts = splitParts(text)
  const steps: string[] = []
  const compare = COMPARE.test(text)
  const results = parts.map((p) => answerPart(index, p, ctx, byId))
  if (compare && !results.some((r) => r.text)) {
    const hits = ["strengths", "exp-0", "proj-storyburners"].map(byId).filter((h): h is Hit => !!h)
    results[0] = { text: hits.map((h) => `• ${firstSentence(h.chunk.evidence ?? h.chunk.answer)}`).join("\n"), hits, kinds: [], weak: false }
  }
  const kinds = [...new Set(results.flatMap((r) => r.kinds)), ...(compare ? ["comparison request"] : []), ...(parts.length > 1 ? [`${parts.length} questions`] : [])]
  steps.push(`validating question: ${kinds.length ? kinds.join(", ") : "clear and on topic"}`)

  const allHits: Hit[] = []
  results.forEach((r) => r.hits.forEach((h) => !allHits.some((x) => x.chunk.id === h.chunk.id) && allHits.push(h)))
  const anyAnswer = results.some((r) => r.text)
  const anyWeak = results.some((r) => r.weak) || !anyAnswer

  const blocks: string[] = []
  if (compare) blocks.push("I won't rank him against other people, because I can't see their work. Here is what his own record shows:")
  results.forEach((r, i) => {
    const heading = parts.length > 1 ? `**${i + 1}. ${parts[i].replace(/\s+/g, " ")}?**` : ""
    const body = r.text || "I couldn't match that one to anything in his record."
    blocks.push([heading, body].filter(Boolean).join("\n"))
  })

  let options: string[] = []
  if (anyWeak) {
    const fromHits = allHits.slice(0, 3).map((h) => optionFor(h))
    options = [...fromHits, ...DEFAULT_OPTIONS].filter((o, i, a) => a.indexOf(o) === i).slice(0, 4)
    if (!anyAnswer) {
      blocks.length = 0
      blocks.push("I only know about Gautam's work, and I couldn't tell what you were asking. Could you rephrase, or pick one of these?")
    } else if (results.some((r) => r.weak && !r.quiet)) {
      blocks.push("I'm not fully sure I understood the question. If I missed, pick one of these:")
    }
  }

  const links = allHits.flatMap((h) => h.chunk.links ?? []).filter((l, i, a) => a.findIndex((x) => x.href === l.href) === i)
  return { steps, text: blocks.join("\n\n"), hits: allHits, options, links }
}

export { STOP }
