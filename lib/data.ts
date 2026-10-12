export const profile = {
  name: "Gautam Shah",
  firstName: "Gautam",
  lastName: "Shah",
  role: "Software Development Engineer",
  headline: "Full-Stack Engineer (Backend-Leaning)",
  company: "Saint Fox Consultancy",
  location: "Pune, India (open to remote)",
  intro:
    "I ship complete products, from database and API through to the interface, with a focus on secure AI: LLM apps, MCP servers and clients, and backends that hold up in production.",
  about:
    "Backend-leaning full-stack engineer who ships complete products, from database and API through to the interface. Software Development Engineer at Saint Fox Consultancy since June 2026, building backend services and integrations for an enterprise software product. Founder of TokenBurners, a product studio with a live product (StoryBurners) on Next.js, Node.js and PostgreSQL. I work AI-native with Claude Code: I read the code it generates, check it against live systems and test results, and fix weak output before it ships.",
  avatar: "/assets/avatar.png",
}

export const contact = {
  email: "gautm.shah1404@gmail.com",
  phone: "+91 8511854391",
  linkedin: "https://www.linkedin.com/in/gautam-shah-558090246",
  github: "https://github.com/Gautam-Shah-14",
  leetcode: "https://leetcode.com/u/csvcmpMIGU",
  location: "Pune, India (open to remote)",
  note: "I'm looking to join a cross-functional team that values improving people's lives through accessible design. Got a project in mind? Let's connect.",
}

export interface Experience {
  role: string
  company: string
  period: string
  current: boolean
  highlights: string[]
}

export const experiences: Experience[] = [
  {
    role: "Software Development Engineer",
    company: "Saint Fox Consultancy",
    period: "Jun 2026 - Present",
    current: true,
    highlights: [
      "Build backend services and third-party SaaS integrations using OAuth2, platform APIs and webhooks, testing each against live systems.",
      "Review AI-generated code against real behavior, fix wrong assumptions, and rebuild a component from scratch when the first version proves unreliable.",
    ],
  },
  {
    role: "GenAI Intern",
    company: "Saint Fox Consultancy",
    period: "Jan 2026 - Apr 2026",
    current: false,
    highlights: [
      "Worked on AI security for GenAI applications with the DeepTeam and Guardrails frameworks, covering prompt safety checks and LLM risk mitigation, and helped integrate them into application environments.",
    ],
  },
  {
    role: "ML Intern",
    company: "IT idol Technologies",
    period: "May 2024 - Jun 2024 (1 month)",
    current: false,
    highlights: [
      "Built ARIMA/SARIMA forecasting models, a logistic regression text classifier and a CNN-based ASL recognition system, including preprocessing, training and deployment.",
    ],
  },
]

export const education = [
  {
    title: "B.Tech. CSE, Artificial Intelligence",
    school: "Parul University",
    period: "2022 - 2026",
    cgpa: "8.05 / 10",
  },
  {
    title: "Diploma, Native Mobile Application Development (Android, Java)",
    school: "Parul University",
    period: "2023 - 2024",
    cgpa: "7.30 / 10",
  },
]

export interface Project {
  name: string
  kind: string
  description: string
  tags: string[]
  image: string
  /** CSS background behind the image */
  background: string
  fit: "cover" | "contain"
  /** public link, when the project is live */
  link?: string
}

export const projects: Project[] = [
  {
    name: "StoryBurners",
    kind: "Live product",
    description:
      "A live story generator. You pick a category, tone and idea count, select one idea, and get a full script sized to a chosen duration. Real-topic mode runs a web search first, token usage and cost are tracked per generation, and payments run through Razorpay.",
    tags: ["Next.js", "Node.js", "Supabase", "Groq", "Razorpay"],
    image: "/assets/storyburners.svg",
    background: "#8a3ffc",
    fit: "contain",
    link: "https://storyburners.tokenburners.co.in",
  },
  {
    name: "TokenBurners Studio",
    kind: "Studio site",
    description:
      "The studio site for TokenBurners, my product studio, built and launched on its own domain with schema markup, per-service landing pages, llms.txt and a sitemap. Four rounds of SEO and AI-search audits raised its audit score from 64 to 81 out of 100.",
    tags: ["Next.js", "Vercel", "SEO", "llms.txt"],
    image: "/assets/tokenburners.svg",
    background: "#8a3ffc",
    fit: "contain",
    link: "https://tokenburners.co.in",
  },
  {
    name: "VoxSecure",
    kind: "Security",
    description:
      "A voice-clone and fraud detection app, built solo. A Flutter and Firebase mobile app is backed by a custom FastAPI service that runs Hugging Face models and detection logic to flag cloned voices and fraud, then saves the result to your secure history.",
    tags: ["Flutter", "Firebase", "FastAPI", "Hugging Face"],
    image: "/assets/voxsecure-logo.png",
    background: "#8a3ffc",
    fit: "contain",
  },
  {
    name: "ReVibe",
    kind: "Team project",
    description:
      "A mental wellness app for college students. It is emotion-aware, with AI-driven task and productivity support, a gamified wellness system (Vibe Coins) on a Firebase backend, and peer community support.",
    tags: ["Flutter", "Firebase", "NLP"],
    image: "/assets/revibe.jpg",
    background: "#dccbff",
    fit: "contain",
  },
  {
    name: "PaperGenie",
    kind: "Solo build",
    description:
      "An educational app that writes custom question papers with AI. Pick the topic, marks and difficulty and it generates the exam. I'm adding Retrieval-Augmented Generation (RAG) so the questions stay accurate and grounded. Firebase handles sign-in and cloud storage.",
    tags: ["Flutter", "Firebase", "RAG", "GenAI"],
    image: "/assets/papergenie.png",
    background: "#8a3ffc",
    fit: "cover",
  },
]

export type SkillCategory = "ai" | "mcp" | "backend" | "data" | "frontend" | "deploy"

export interface Skill {
  name: string
  category: SkillCategory
  description: string
}

export const skillFilters: { id: "all" | SkillCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI & GenAI" },
  { id: "mcp", label: "MCP & Agents" },
  { id: "backend", label: "Backend" },
  { id: "data", label: "Databases" },
  { id: "frontend", label: "Frontend" },
  { id: "deploy", label: "Deployment" },
]

export const skills: Skill[] = [
  { name: "MCP Servers", category: "mcp", description: "Building Model Context Protocol servers that expose tools, resources and prompts so AI assistants can work with real systems and data." },
  { name: "MCP Clients", category: "mcp", description: "Building MCP clients that connect LLM applications to MCP servers, discover their tools and call them on the model's behalf." },
  { name: "LLM APIs", category: "ai", description: "Building with Groq, OpenAI, Anthropic and Gemini APIs, and running models locally with Ollama." },
  { name: "RAG", category: "ai", description: "Retrieval-Augmented Generation that grounds model answers in your own data." },
  { name: "AI Security", category: "ai", description: "Prompt-safety checks and LLM risk mitigation for GenAI applications with the DeepTeam and Guardrails frameworks." },
  { name: "Claude Code workflow", category: "ai", description: "AI-native building, review and debugging: reading generated code, checking it against live systems and tests, and fixing weak output before it ships." },
  { name: "Machine Learning", category: "ai", description: "Forecasting with ARIMA/SARIMA, text classification with logistic regression and CNN-based image recognition, from preprocessing to deployment." },
  { name: "Hugging Face models", category: "ai", description: "Running Hugging Face models behind a custom API for voice-clone and fraud detection." },
  { name: "Node.js & Express", category: "backend", description: "Backend services and REST APIs on Node.js and Express." },
  { name: "Python & FastAPI", category: "backend", description: "High-performance Python APIs with FastAPI and automatic interactive documentation." },
  { name: "C# / .NET", category: "backend", description: "Backend development in C# on .NET." },
  { name: "Integrations", category: "backend", description: "Third-party SaaS integrations with OAuth2 (including PKCE), platform APIs and webhooks, tested against live systems." },
  { name: "PostgreSQL (Supabase)", category: "data", description: "Schema design and production data on PostgreSQL through Supabase." },
  { name: "SQLite & Redis queues", category: "data", description: "Lightweight storage with SQLite and background jobs with Redis queues (BullMQ)." },
  { name: "Next.js & React", category: "frontend", description: "Full-stack web apps and sites with Next.js, React and TypeScript." },
  { name: "Flutter & Dart", category: "frontend", description: "Cross-platform mobile apps with Flutter and Dart, backed by Firebase." },
  { name: "Vercel & Render", category: "deploy", description: "Shipping and hosting web apps and services on Vercel and Render." },
  { name: "Azure Linux VM", category: "deploy", description: "Running services on an Azure Linux VM with nginx and pm2." },
  { name: "Razorpay payments", category: "deploy", description: "Taking payments in production with Razorpay." },
]
