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

This repository keeps each design on its own branch. Merge only one into `main`:

- `design/drive-world`
- `design/gs-os` (this branch)
- `design/tunnel-flight`
- `ai/ask-gautam`
- `ai/break-the-guard`
- `ai/neural-net`

