[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Gautam-Shah-14/Portfolio-website)

# Gautam Shah Portfolio

Personal portfolio built with Next.js (App Router), TypeScript and Three.js.

**Design: Neural Net.** The portfolio is an explorable 3D neural network. Education feeds experience, experience feeds skills, skills build projects, projects reach contact. Hover a node to light its connections, click to read it, or press Run inference. Nodes are built from `lib/data.ts` by `lib/network.ts`.

## Structure

- `app/` - routes, layout and global styles
- `components/network/` - the 3D scene and UI
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
