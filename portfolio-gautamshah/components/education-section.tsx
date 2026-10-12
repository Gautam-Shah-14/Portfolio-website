import AnimateOnScroll from "./animate-on-scroll"
import Card from "./card"
import { education } from "@/lib/data"

export default function EducationSection() {
  return (
    <section id="education" className="py-20">
      <AnimateOnScroll animation="fade-in-up">
        <h2 className="section-title">Education</h2>
      </AnimateOnScroll>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {education.map(({ title, institution, cgpa }, index) => (
          <AnimateOnScroll key={title} animation="fade-in-right" delay={200 * (index + 1)}>
            <Card>
              <h3 className="text-xl md:text-2xl font-bold mb-4 leading-snug min-h-14">{title}</h3>
              <p className="mb-2">{institution}</p>
              <p>CGPA: {cgpa}</p>
            </Card>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  )
}
