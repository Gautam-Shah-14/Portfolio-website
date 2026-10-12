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

This repository keeps each design on its own branch. Merge only one into `main`:

- `design/drive-world`
- `design/gs-os`
- `design/tunnel-flight`
- `ai/ask-gautam` (this branch)
- `ai/break-the-guard`
- `ai/neural-net`

