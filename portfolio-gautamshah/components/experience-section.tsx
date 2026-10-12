import AnimateOnScroll from "./animate-on-scroll"
import Card from "./card"
import { Rocket, Search } from "lucide-react"
import { experiences } from "@/lib/data"

const icons = { rocket: Rocket, search: Search }

export default function ExperienceSection() {
  return (
    <section id="experience" className="py-20">
      <AnimateOnScroll animation="fade-in-up">
        <h2 className="section-title">Work Experience</h2>
      </AnimateOnScroll>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {experiences.map(({ title, period, icon }, index) => {
          const Icon = icons[icon]
          return (
            <AnimateOnScroll key={title} animation="fade-in-right" delay={200 * (index + 1)}>
              <Card className="relative min-h-[220px] group">
                <div className="absolute top-5 right-5 text-primary group-hover:rotate-12 transition-transform duration-300">
                  <Icon size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4 min-h-16 leading-snug">{title}</h3>
                <p className="text-muted-foreground">{period}</p>
              </Card>
            </AnimateOnScroll>
          )
        })}
      </div>
    </section>
  )
}
