import AnimateOnScroll from "./animate-on-scroll"
import { projects } from "@/lib/data"

export default function ProjectsSection() {
  return (
    <section id="projects" className="py-20">
      <AnimateOnScroll animation="fade-in-up">
        <h2 className="section-title">Projects</h2>
      </AnimateOnScroll>

      {projects.map(({ name, description, badges, image, imageClassName }, index) => {
        const reversed = index % 2 === 1
        const isLast = index === projects.length - 1
        return (
          <AnimateOnScroll key={name} animation="fade-in-up" delay={200 * (index + 1)}>
            <div
              className={`flex flex-col ${reversed ? "md:flex-row-reverse" : "md:flex-row"} items-center group ${
                isLast ? "" : "mb-24"
              }`}
            >
              <div className={`flex-1 ${reversed ? "md:pl-12" : "md:pr-12"} mb-8 md:mb-0`}>
                <div className="text-muted-foreground mb-2">Featured Project</div>
                <h3 className="text-2xl font-bold mb-4 text-primary">{name}</h3>
                <p className="mb-6">{description}</p>
                <div className="flex gap-4">
                  {badges.map((badge) => (
                    <div
                      key={badge}
                      className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    >
                      {badge}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex justify-center transition-transform duration-700 group-hover:scale-105 group-hover:rotate-1">
                <div className="w-full max-w-sm h-[400px] flex items-center justify-center rounded-xl border border-[rgba(255,127,0,0.3)] hover:shadow-[0_10px_25px_rgba(255,127,0,0.3)] transition-shadow duration-300 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={`${name} project`} className={`rounded-xl ${imageClassName}`} />
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        )
      })}
    </section>
  )
}
