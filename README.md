[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Gautam-Shah-14/Portfolio-website)

# Gautam Shah Portfolio

Personal portfolio built with Next.js (App Router), TypeScript and Three.js.

**Design: Break the Guard.** An AI-security portfolio. Visitors try to jailbreak a layered guardrail (rule-based simulation) and the allowed questions are answered by a validated retrieval assistant. Content comes from `lib/data.ts`.

## Structure

- `app/` - routes, layout and global styles
- `components/guard/` - arena, 3D shield and page sections
- `lib/guard.ts` - the three guardrail layers
- `lib/assistant.ts`, `lib/retrieval.ts`, `lib/knowledge.ts` - question validation (typos, ambiguity, capability and loaded questions) and retrieval
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
