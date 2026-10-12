[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Gautam-Shah-14/Portfolio-website)

# Gautam Shah Portfolio

Personal portfolio built with Next.js (App Router), TypeScript and Three.js.

**Design: Drive World.** The portfolio is a small 3D world. Drive a car (WASD or arrows, on-screen buttons on touch devices) to a platform to open that section, or use the menu.

## Structure

- `app/` - routes, layout and global styles
- `components/world/` - the 3D scene (`scene.ts`), section panels and the page shell
- `lib/data.ts` - all portfolio content (experience, projects, skills, education, contact)
- `public/assets/` - images

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Deploying

The app lives at the repository root, so Vercel needs no custom Root Directory.
