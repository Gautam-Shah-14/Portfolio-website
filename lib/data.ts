export const profile = {
  name: "Gautam Shah",
  firstName: "Gautam",
  lastName: "Shah",
  role: "Software Development Engineer",
  company: "Saint Fox Consultancy",
  intro:
    "I build secure AI products: LLM-powered apps, GenAI features and FastAPI backends that hold up in production.",
  about:
    "Software Development Engineer specializing in AI Security, Generative AI and Backend Development. I build AI-powered applications, MCP servers and clients, integrate Large Language Models (LLMs) and develop scalable backend systems with FastAPI. Passionate about secure, intelligent, production-ready solutions that solve real-world problems.",
  avatar: "/assets/avatar.png",
}

export const contact = {
  email: "gautm.shah1404@gmail.com",
  phone: "+91 8511854391",
  linkedin: "https://www.linkedin.com/in/gautam-shah-558090246",
  github: "https://github.com/Gautam-Shah-14",
  note: "I'm looking to join a cross-functional team that values improving people's lives through accessible design. Got a project in mind? Let's connect.",
}

export const experiences = [
  { role: "Software Developer Engineer", company: "Saint Fox Consultancy", period: "Jun 2026 - Present", current: true },
  { role: "GenAI Intern", company: "Saint Fox Consultancy", period: "Jan 2026 - Apr 2026", current: false },
  { role: "ML Intern", company: "IT idol Technologies", period: "May 2024 - Jun 2024 (1 month)", current: false },
]

export const education = [
  {
    title: "B.Tech. CSE, Artificial Intelligence",
    school: "Parul University",
    period: "2022 - 2026",
    cgpa: "8.05 / 10",
  },
  {
    title: "1-Year Diploma, Native Mobile Application Development",
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
  /** CSS background behind the image (the logo files have transparent or flat backgrounds) */
  background: string
  fit: "cover" | "contain"
}

export const projects: Project[] = [
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
  {
    name: "ReVibe",
    kind: "Team project",
    description:
      "A mental wellness app with AI mood tracking, personalized tasks and a game layer. You earn Vibe Coins for wellness activities and spend them on real resources, with professional support and peer forums. I work on development, UI/UX, AI/ML and documentation.",
    tags: ["Mobile", "AI / ML", "Gamification"],
    image: "/assets/revibe.jpg",
    background: "#dccbff",
    fit: "contain",
  },
  {
    name: "VoxSecure",
    kind: "Security",
    description:
      "A mobile app that helps people spot voice scams. Call audio goes to the VoxSecure AI service, which checks whether the voice is real and whether the caller is trying to defraud you. Results are saved to your secure history.",
    tags: ["Voice AI", "Fraud detection", "Mobile"],
    image: "/assets/voxsecure-logo.png",
    background: "#8a3ffc",
    fit: "contain",
  },
]

export type SkillCategory = "ai" | "mcp" | "development" | "design"

export interface Skill {
  name: string
  category: SkillCategory
  description: string
}

export const skillFilters: { id: "all" | SkillCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI & GenAI" },
  { id: "mcp", label: "MCP & Agents" },
  { id: "development", label: "Development" },
  { id: "design", label: "Design" },
]

export const skills: Skill[] = [
  { name: "MCP Servers", category: "mcp", description: "Building Model Context Protocol servers that expose tools, resources and prompts so AI assistants can work with real systems and data." },
  { name: "MCP Clients", category: "mcp", description: "Building MCP clients that connect LLM applications to MCP servers, discover their tools and call them on the model's behalf." },
  { name: "Generative AI & LLMs", category: "ai", description: "Integrating large language models into applications: prompting, tool use, structured outputs and production-ready GenAI features." },
  { name: "RAG", category: "ai", description: "Retrieval-Augmented Generation that grounds model answers in your own data, as used in PaperGenie." },
  { name: "AI Security", category: "ai", description: "Designing AI systems that resist misuse: guardrails, prompt-injection defence and fraud detection like VoxSecure." },
  { name: "Machine Learning", category: "ai", description: "Creating predictive models and training algorithms for complex problems." },
  { name: "Deep Learning", category: "ai", description: "Building neural networks for image recognition and advanced pattern detection." },
  { name: "FastAPI", category: "development", description: "Building high-performance APIs with automatic interactive documentation." },
  { name: "Firebase", category: "development", description: "Implementing backend services with authentication, storage, and real-time databases." },
  { name: "Flutter", category: "development", description: "Developing cross-platform mobile applications with beautiful UI/UX." },
  { name: "UI/UX Design", category: "design", description: "Creating intuitive user interfaces with focus on user experience." },
]
