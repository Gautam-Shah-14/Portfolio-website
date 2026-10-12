import HeroSection from "@/components/hero-section"
import ExperienceSection from "@/components/experience-section"
import ProjectsSection from "@/components/projects-section"
import SkillsSection from "@/components/skills-section"
import EducationSection from "@/components/education-section"
import ContactSection from "@/components/contact-section"

export default function Home() {
  return (
    <main>
      <HeroSection />
      <ExperienceSection />
      <ProjectsSection />
      <SkillsSection />
      <EducationSection />
      <ContactSection />
    </main>
  )
}

