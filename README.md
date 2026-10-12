[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Gautam-Shah-14/Portfolio-website)

# Gautam Shah Portfolio: Ask my AI + MCP server

An AI-style portfolio that is also a real MCP server.

A polished AI-product look: a glowing 3D orb that reacts while the assistant thinks and speaks, a prompt bar, and a validated retrieval assistant that answers from the portfolio data. The site is also a real Model Context Protocol server at `/mcp`, so Claude or any MCP client can connect and ask about Gautam. A live inspector on the page talks to that endpoint.

## Features

- Chat-first hero: shader orb, streaming answers with visible steps and sources, clickable follow-ups
- Question validation before searching: typos, vague or loaded wording, capability questions, multi-part questions, comparisons, private details and prompt-injection attempts
- Real MCP server at `/mcp` (Streamable HTTP, JSON-RPC 2.0, stateless) with 8 read-only tools, 3 resources and 1 prompt
- Live MCP inspector on the page: connect, pick a tool, call it and read the raw JSON-RPC wire log
- Copy-paste connection snippets for Claude Code, Claude Desktop and any client
- Sections for projects, skills (filterable), experience, education and contact

## Tech stack

- [Next.js](https://nextjs.org) (App Router) and React 19
- TypeScript
- [Three.js](https://threejs.org) 0.128 for the 3D parts
- Plain CSS (no UI framework); fonts load from Google Fonts at runtime

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run start   # serve the production build
```

Requires Node.js 18.18 or newer.

## Project structure

```
app/                layout (fonts, metadata), global styles, the page
app/mcp/route.ts       the MCP endpoint (POST, plus CORS and 405 handling)
components/ai/
  home.tsx          page shell and navigation
  hero.tsx          orb, prompt bar and conversation
  orb.ts            Three.js shader orb
  use-assistant.ts  streaming assistant hook
  mcp-panel.tsx     connection snippets and live inspector
  sections.tsx      projects, skills, experience, contact
lib/
  mcp/server.ts     JSON-RPC handling, tools, resources, prompts
  mcp/rate-limit.ts best-effort per-IP limiter
  site.ts           the site URL and MCP path
  assistant.ts, retrieval.ts, knowledge.ts   validated retrieval assistant
  guard.ts          guardrail used by the check_prompt_safety tool
lib/data.ts         all portfolio content
public/assets/      images
```

## Editing the content

Everything visible comes from `lib/data.ts`: profile, contact details, experience, education, projects and skills. Edit that one file and every part of the page (and the assistant's knowledge, where there is one) updates. Project images go in `public/assets/` and are referenced from `data.ts`. Colours are CSS variables at the top of `app/globals.css`.

## The MCP server

Endpoint: `https://gautam-shah-portfolio.vercel.app/mcp` (set the address in `lib/site.ts`).

Connect a client:

```bash
# Claude Code
claude mcp add --transport http gautam-portfolio https://gautam-shah-portfolio.vercel.app/mcp
```

```json
// Claude Desktop (claude_desktop_config.json), through the mcp-remote bridge
{ "mcpServers": { "gautam-portfolio": { "command": "npx", "args": ["-y", "mcp-remote", "https://gautam-shah-portfolio.vercel.app/mcp"] } } }
```

| Kind | Name | What it does |
| --- | --- | --- |
| Tool | `get_profile` | Headline, role, location, summary |
| Tool | `list_projects`, `get_project` | Projects, and one in detail |
| Tool | `search_skills` | Keyword and category search over skills |
| Tool | `list_experience`, `list_education` | Experience with highlights, degrees |
| Tool | `ask_about_gautam` | Free-text question through the validated retrieval assistant |
| Tool | `check_prompt_safety` | Three-layer guardrail verdict and scores for a prompt |
| Resource | `portfolio://profile`, `portfolio://skills`, `portfolio://contact` | Markdown, JSON and text |
| Prompt | `recruiter_summary` | A recruiter brief, optionally for a role |

Try it locally with `npm run dev`, then:

```bash
curl -s -X POST http://localhost:3000/mcp -H 'Content-Type: application/json'   -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Notes:

- Transport is Streamable HTTP in stateless JSON mode. `GET` returns 405, because the server never starts its own streams.
- It is read-only and public. There is no login and nothing private is exposed.
- A best-effort limiter allows 60 requests per minute per IP. On serverless hosting each instance keeps its own counter, so treat it as a brake and not a guarantee.
- CORS is open (`*`) so browser-based clients and inspectors can call it.

## Deploying to Vercel

The app lives at the repository root.

1. Import the repository in Vercel and pick this branch as the production branch (or use the branch's preview deployment).
2. Leave **Root Directory** empty. The framework preset is **Next.js**, and the default build command (`next build`) and output settings work as they are.
3. No environment variables are needed.

## Browser support and accessibility

- Needs WebGL for the 3D scene. Without it the page falls back to a plain view that still shows all the content.
- Respects `prefers-reduced-motion`.
- Interactive controls are real buttons and links with visible keyboard focus.

## Notes

The assistant is rule-based and runs in the browser; it is not a live language model. The MCP server is read-only and serves only the public data in `lib/data.ts`. See the MCP section above for details.

## Other designs

This repository keeps each design on its own branch. Click a branch to open it on GitHub and use the branch selector to switch. Merge only one into `main`:

- [`design/desk`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/design/desk): a 3D desk where each object opens a section
- [`design/drive-world`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/design/drive-world): drive a 3D car to each section
- [`design/gs-os`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/design/gs-os): a tiny desktop OS with a terminal
- [`design/tunnel-flight`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/design/tunnel-flight): scroll to fly through a 3D tunnel
- [`ai/ask-gautam`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/ai/ask-gautam): chat with a retrieval assistant and a 3D vector space
- [`ai/break-the-guard`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/ai/break-the-guard): jailbreak a layered guardrail, AI-security portfolio
- [`ai/neural-net`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/ai/neural-net): an explorable 3D neural network
- [`ai/mcp-server`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/ai/mcp-server): AI-style design with a real MCP server at /mcp (this branch)

