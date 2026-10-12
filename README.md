[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Gautam-Shah-14/Portfolio-website)

# Gautam Shah Portfolio

Personal portfolio built with Next.js (App Router), TypeScript and Three.js.

**Design: Tunnel Flight.** Scrolling flies you forward through a 3D tunnel. Each section floats toward you in depth, the pointer steers the tunnel and a click sends a pulse through it.

## Structure

- `app/` - routes, layout and global styles
- `components/flight/` - the tunnel scene (`tunnel.ts`), section panels and the scroll-driven shell
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
