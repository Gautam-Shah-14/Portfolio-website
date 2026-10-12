[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Gautam-Shah-14/Portfolio-website)

# Gautam Shah Portfolio

Personal portfolio built with Next.js (App Router), TypeScript and Three.js.

**Design: GS OS.** The portfolio is a tiny operating system. Icons open draggable windows, there is a working terminal (`help` lists the commands) and a 3D viewer.

## Structure

- `app/` - routes, layout and global styles
- `components/os/` - desktop shell, window frame, apps, terminal and 3D viewer
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
