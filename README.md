[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Gautam-Shah-14/Portfolio-website)

# Gautam Shah Portfolio: Drive World

A tiny 3D world you drive through.

The portfolio is a small 3D world. Each section (Work, Projects, Skills, Education, Contact) is a glowing platform. Drive a car to a platform and its panel opens, or use the menu to jump straight there.

## Features

- Drivable car with a chase camera, boost, collisions and dust trail (WASD or arrow keys, Space to boost)
- On-screen touch controls on phones and tablets
- Menu that auto-drives the car to any section
- Station signs, floor title and an avatar billboard rendered in 3D
- Falls back to a menu-only view when WebGL is unavailable

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
components/world/
  world.tsx     page shell: HUD, menu, panel, intro screen
  scene.ts      Three.js world, car physics and camera (framework-free)
  panels.tsx    the section panels (work, projects, skills, education, contact)
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

Keyboard controls are disabled until you press Start engine. Respects `prefers-reduced-motion` (no dust particles).

## Other designs

This repository keeps each design on its own branch. Merge only one into `main`:

- `design/drive-world` (this branch)
- `design/gs-os`
- `design/tunnel-flight`
- `ai/ask-gautam`
- `ai/break-the-guard`
- `ai/neural-net`

