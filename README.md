[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Gautam-Shah-14/Portfolio-website)

# Gautam Shah Portfolio: Ask Gautam

The portfolio as a chat with a retrieval-augmented assistant.

The portfolio is a chat. Visitors ask questions and a retrieval assistant answers from knowledge chunks built from `lib/data.ts`. A 3D vector space beside the chat shows every search: the question lands in the cloud and pulls in its nearest chunks.

## Features

- Retrieval over knowledge chunks (about, experience, projects, skill groups, education, contact)
- Question validation before searching: fixes typos, handles vague or loaded wording, capability questions (answered with evidence and honest limits), multi-part questions, comparisons, private details and prompt-injection attempts
- Clickable follow-up options when a question is unclear, and context for follow-ups like "tell me more"
- Streaming answers with visible steps and source chips with similarity scores
- Draggable 3D vector space that highlights the retrieved chunks

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
components/chat/
  chat.tsx          chat UI, streaming and suggestions
  vector-space.ts   Three.js vector-space view
  rich-text.tsx     **bold** rendering
lib/
  assistant.ts      question validation and answer composition
  retrieval.ts      index, typo correction and the retriever
  knowledge.ts      knowledge chunks generated from data.ts
lib/data.ts         all portfolio content
public/assets/      images
```

## Editing the content

Everything visible comes from `lib/data.ts`: profile, contact details, experience, education, projects and skills. Edit that one file and every part of the page (and the assistant's knowledge, where there is one) updates. Project images go in `public/assets/` and are referenced from `data.ts`. Colours are CSS variables at the top of `app/globals.css`.

## MCP server

This design has no MCP endpoint of its own. The [`ai/mcp-server`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/ai/mcp-server) branch turns the portfolio into a real Model Context Protocol server at `/mcp` (8 read-only tools, 3 resources and 1 prompt), so Claude or any MCP client can connect and ask about Gautam. Its README explains the tools and how to connect. Once a deployment that includes the route is live, a client connects with:

```bash
claude mcp add --transport http gautam-portfolio https://gautam-shah-portfolio.vercel.app/mcp
```

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

The assistant is rule-based and runs entirely in the browser. It is not a live language model, so it only answers from what is in `lib/data.ts`.

## Other designs

This repository keeps each design on its own branch. Click a branch to open it on GitHub and use the branch selector to switch. Merge only one into `main`:

- [`design/drive-world`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/design/drive-world): drive a 3D car to each section
- [`design/gs-os`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/design/gs-os): a tiny desktop OS with a terminal
- [`design/tunnel-flight`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/design/tunnel-flight): scroll to fly through a 3D tunnel
- [`ai/ask-gautam`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/ai/ask-gautam): chat with a retrieval assistant and a 3D vector space (this branch)
- [`ai/break-the-guard`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/ai/break-the-guard): jailbreak a layered guardrail, AI-security portfolio
- [`ai/neural-net`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/ai/neural-net): an explorable 3D neural network
- [`ai/mcp-server`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/ai/mcp-server): AI-style design with a real MCP server at /mcp

