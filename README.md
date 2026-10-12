[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Gautam-Shah-14/Portfolio-website)

# Gautam Shah Portfolio: GS OS

The portfolio as a tiny desktop operating system.

The portfolio is a tiny operating system. A boot screen leads to a desktop with icons that open draggable windows, a taskbar, a working terminal and a 3D viewer.

## Features

- Draggable, focusable windows with a taskbar and start menu
- Working terminal: `help`, `about`, `projects`, `skills`, `experience`, `education`, `contact`, `open <app>`, `whoami`, `sudo hire-me`, `matrix`, `clear` (arrow keys for history)
- 3D viewer: a cube carrying your avatar that you can spin with momentum
- Boot sequence with a skip button, CRT scanline overlay
- On phones, windows open full width

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
components/os/
  desktop.tsx       desktop, icons, taskbar, window manager state
  window-frame.tsx  draggable window chrome
  apps.tsx          about, experience, projects, skills, education, contact
  terminal.tsx      the terminal and its commands
  viewer.tsx        Three.js cube viewer
  boot.tsx          boot screen
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

The boot screen is skipped when the visitor prefers reduced motion.

## Other designs

This repository keeps each design on its own branch. Click a branch to open it on GitHub and use the branch selector to switch. Merge only one into `main`:

- [`design/drive-world`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/design/drive-world): drive a 3D car to each section
- [`design/gs-os`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/design/gs-os): a tiny desktop OS with a terminal (this branch)
- [`design/tunnel-flight`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/design/tunnel-flight): scroll to fly through a 3D tunnel
- [`ai/ask-gautam`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/ai/ask-gautam): chat with a retrieval assistant and a 3D vector space
- [`ai/break-the-guard`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/ai/break-the-guard): jailbreak a layered guardrail, AI-security portfolio
- [`ai/neural-net`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/ai/neural-net): an explorable 3D neural network
- [`ai/mcp-server`](https://github.com/Gautam-Shah-14/Portfolio-website/tree/ai/mcp-server): AI-style design with a real MCP server at /mcp

