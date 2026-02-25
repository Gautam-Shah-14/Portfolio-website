import AnimateOnScroll from "./animate-on-scroll"
import { Rocket, Search } from "lucide-react"

export default function ExperienceSection() {
  return (
    <section id="experience" className="py-20">
      <AnimateOnScroll animation="fade-in-up">
        <h2 className="section-title">Work Experience</h2>
      </AnimateOnScroll>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimateOnScroll animation="fade-in-right" delay={200}>
          <div className="bg-muted rounded-xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_25px_rgba(255,127,0,0.2)] relative h-full min-h-[220px] group">
            <div className="absolute top-5 right-5 text-primary group-hover:rotate-12 transition-transform duration-300">
              <Rocket size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-4 min-h-16 leading-snug">GenAI Intern at Saint Fox Consultancy</h3>
            <p className="text-muted-foreground">Jan 2026 - Present</p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="fade-in-left" delay={400}>
          <div className="bg-muted rounded-xl p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_25px_rgba(255,127,0,0.2)] relative h-full min-h-[220px] group">
            <div className="absolute top-5 right-5 text-primary group-hover:rotate-12 transition-transform duration-300">
              <Search size={24} />
            </div>
            <h3 className="text-2xl font-bold mb-4 min-h-16 leading-snug">ML Intern at IT idol Technologies</h3>
            <p className="text-muted-foreground">May 2024 - Jun 2024 (1 Month)</p>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
