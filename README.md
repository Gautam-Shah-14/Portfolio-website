[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Gautam-Shah-14/Portfolio-website)

# Gautam Shah Portfolio: Neural Net

The portfolio as an explorable 3D neural network.

The portfolio is an explorable 3D neural network. Education feeds experience, experience feeds skills, skills build projects, and projects reach contact. Every node is real content built from `lib/data.ts`.

## Features

- Five layers (education, experience, skills, projects, contact) connected layer to layer, with travelling signal pulses
- Hover a node to light its connections, click it to read its details
- Run inference: a wave activates the layers while a loss counter falls
- Layer navigation, drag to rotate with momentum
- Node list fallback when WebGL is unavailable

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
components/network/
  neural-net.tsx  UI, detail card and layer navigation
  scene.ts        Three.js network scene
lib/
  network.ts      builds the layers and nodes from data.ts
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

Respects `prefers-reduced-motion` (no auto-rotation).

## Other designs

This repository keeps each design on its own branch. Merge only one into `main`:

- `design/drive-world`
- `design/gs-os`
- `design/tunnel-flight`
- `ai/ask-gautam`
- `ai/break-the-guard`
- `ai/neural-net` (this branch)

