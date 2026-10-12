[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Gautam-Shah-14/Portfolio-website)

# Gautam Shah Portfolio

Personal portfolio built with Next.js (App Router), TypeScript and Three.js.

**Design: Ask Gautam.** The portfolio is a chat with a retrieval-augmented assistant. Answers come from knowledge chunks built from `lib/data.ts`, and a 3D vector space shows each search.

## Structure

- `app/` - routes, layout and global styles
- `components/chat/` - chat UI and the 3D vector space
- `lib/knowledge.ts`, `lib/retrieval.ts` - knowledge chunks and the retriever
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
