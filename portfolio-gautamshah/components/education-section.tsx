import AnimateOnScroll from "./animate-on-scroll"

export default function EducationSection() {
  return (
    <section id="education" className="py-20">
      <AnimateOnScroll animation="fade-in-up">
        <h2 className="section-title">Education</h2>
      </AnimateOnScroll>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimateOnScroll animation="fade-in-right" delay={200}>
          <div className="bg-muted rounded-xl p-8 h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_25px_rgba(255,127,0,0.2)]">
            <h3 className="text-xl md:text-2xl font-bold mb-4 leading-snug min-h-14">
              B.Tech. - CSE - Artificial Intelligence
            </h3>
            <p className="mb-2">Parul University | 2022 - 2026</p>
            <p>CGPA: 7.80 / 10</p>
          </div>
        </AnimateOnScroll>
        <AnimateOnScroll animation="fade-in-left" delay={400}>
          <div className="bg-muted rounded-xl p-8 h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_25px_rgba(255,127,0,0.2)]">
            <h3 className="text-xl md:text-2xl font-bold mb-4 leading-snug min-h-14">
              1-Year Diploma in Native Mobile Application Development
            </h3>
            <p className="mb-2">Parul University | 2023 - 2024</p>
            <p>CGPA: 7.30 / 10</p>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}

