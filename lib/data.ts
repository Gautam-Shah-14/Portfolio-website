export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
]

export const footerNavLinks = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Education", href: "#education" },
]

export const contact = {
  email: "gautm.shah1404@gmail.com",
  phone: "+91 8511854391",
  phoneHref: "tel:+918511854391",
  linkedin: "https://www.linkedin.com/in/gautam-shah-558090246",
  github: "https://github.com/Gautam-Shah-14",
}

export const experiences = [
  { title: "Software Developer Engineer at Saint Fox Consultancy", period: "Jun 2026 - Present", icon: "rocket" },
  { title: "GenAI Intern at Saint Fox Consultancy", period: "Jan 2026 - April 2026", icon: "rocket" },
  { title: "ML Intern at IT idol Technologies", period: "May 2024 - Jun 2024 (1 Month)", icon: "search" },
] as const

export const education = [
  {
    title: "B.Tech. - CSE - Artificial Intelligence",
    institution: "Parul University | 2022 - 2026",
    cgpa: "8.05 / 10",
  },
  {
    title: "1-Year Diploma in Native Mobile Application Development",
    institution: "Parul University | 2023 - 2024",
    cgpa: "7.30 / 10",
  },
]

export const projects = [
  {
    name: "PaperGenie",
    description:
      "PaperGenie is my solo-developed educational app that automates custom question paper creation using AI. Now integrating the Retrieval-Augmented Generation (RAG) framework for improved accuracy and better contextual understanding of generated questions. It generates exams based on topics, marks, and difficulty levels. With Firebase Authentication and cloud storage, the app offers a secure and scalable solution for educators.",
    badges: ["⚛️", "🔥"],
    image: "/assets/papergenie.png",
    imageClassName: "w-full h-full object-cover",
  },
  {
    name: "ReVibe",
    description:
      "ReVibe is a mental wellness app integrating AI-driven mood tracking, gamification, and personalized tasks to enhance focus and resilience. Users earn Vibe Coins for completing wellness activities, redeemable for valuable resources. The app also offers professional support and peer forums. I contribute to development, UI/UX, AI/ML, and documentation.",
    badges: ["📱", "🔥"],
    image: "/assets/revibe.jpg",
    imageClassName: "w-full object-contain bg-[#dccbff]",
  },
  {
    name: "VoxSecure",
    description:
      "VoxSecure is a mobile app that helps people identify and reduce the risk of voice-based scams. It connects your call audio to the VoxSecure AI service, which checks both voice authenticity and fraud intent, then stores the result in your secure history.",
    badges: ["🛡️", "🎙️"],
    image: "/assets/voxsecure-logo.png",
    imageClassName: "w-[270px] h-[270px] max-w-full max-h-full object-contain",
  },
]

export interface Skill {
  name: string
  icon: string
  category: string
  description: string
}

export const skillCategories = [
  { id: "all", name: "All Skills" },
  { id: "ai", name: "AI & ML" },
  { id: "development", name: "Development" },
  { id: "design", name: "Design" },
]

export const skills: Skill[] = [
  {
    name: "Artificial Intelligence",
    icon: "🤖",
    category: "ai",
    description: "Building advanced AI systems and integrating them into practical applications.",
  },
  {
    name: "Machine Learning",
    icon: "🧠",
    category: "ai",
    description: "Creating predictive models and training algorithms for complex problems.",
  },
  {
    name: "Deep Learning",
    icon: "⚙️",
    category: "ai",
    description: "Building neural networks for image recognition and advanced pattern detection.",
  },
  {
    name: "Flutter",
    icon: "📱",
    category: "development",
    description: "Developing cross-platform mobile applications with beautiful UI/UX.",
  },
  {
    name: "Firebase",
    icon: "🔥",
    category: "development",
    description: "Implementing backend services with authentication, storage, and real-time databases.",
  },
  {
    name: "FastAPI",
    icon: "🚀",
    category: "development",
    description: "Building high-performance APIs with automatic interactive documentation.",
  },
  {
    name: "UI/UX Design",
    icon: "🎨",
    category: "design",
    description: "Creating intuitive user interfaces with focus on user experience.",
  },
]
