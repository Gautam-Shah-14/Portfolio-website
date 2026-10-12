[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Gautam-Shah-14/Portfolio-website)

# Gautam Shah Portfolio: Gautam's Desk

A 3D desk where every object opens a section.

The portfolio is a dark, violet-lit 3D desk. The laptop shows the projects, the notebook holds the about text and work history, sticky notes on a wall board are the skills, the stack of books is education and the coffee mug is contact. Clicking an object moves the camera to it and opens a panel.

## Features

- Clickable 3D objects: laptop (projects), notebook (about and experience), sticky notes (skills), books (education), mug (contact)
- 19 sticky notes generated from `lib/data.ts`, color-coded by category, lifting on hover; filter chips dim the notes outside the chosen category
- Camera that drifts with the pointer and glides to each object, with the scene shifted aside while the panel is open
- Desk lamp you can switch off and on, steam from the mug, drifting dust, a neon sign
- Bottom button bar so every section is reachable by keyboard, touch or screen reader; Escape closes the panel

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
components/desk/
  desk.tsx     page shell: button bar, tooltip, side panel
  scene.ts     Three.js desk scene, canvas textures and camera (framework-free)
  panels.tsx   the section panels
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

Respects `prefers-reduced-motion` (no steam, dust or screen blink, and the camera jumps instead of gliding). The laptop screen, notes, notebook and book spines are drawn on canvases, so edit the text in `lib/data.ts` and they update. Fonts are Caveat and Space Grotesk, loaded from Google Fonts in `app/layout.tsx`.

## Other designs

This repository keeps each design on its own branch. Click a branch to open it on GitHub and use the branch selector to switch. Merge only one into `main`:

- [`design/desk`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/design/desk): a 3D desk where each object opens a section (this branch)
- [`design/drive-world`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/design/drive-world): drive a 3D car to each section
- [`design/gs-os`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/design/gs-os): a tiny desktop OS with a terminal
- [`design/tunnel-flight`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/design/tunnel-flight): scroll to fly through a 3D tunnel
- [`ai/ask-gautam`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/ai/ask-gautam): chat with a retrieval assistant and a 3D vector space
- [`ai/break-the-guard`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/ai/break-the-guard): jailbreak a layered guardrail, AI-security portfolio
- [`ai/neural-net`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/ai/neural-net): an explorable 3D neural network
- [`ai/mcp-server`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/ai/mcp-server): AI-style design with a real MCP server at /mcp

