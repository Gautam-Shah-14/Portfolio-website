"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section className="py-24 flex flex-col md:flex-row items-center relative">
      <div
        className={`flex-1 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <h1 className="text-5xl font-bold mb-5">
          Hello! I am <span className="text-primary">Gautam Shah</span>
        </h1>
        <h2 className="text-4xl font-bold mb-5">
          I'm a <span className="text-primary">Software Engineer</span>
        </h2>
        <p className="mb-5">
          Currently working as <span className="text-primary">GenAI Intern at Saint Fox Consultancy</span>
        </p>
        <p className="text-lg text-muted-foreground max-w-xl">
          A passionate AI/ML and Flutter developer with expertise in integrating AI models into applications to solve
          real-world problems. Skilled in large language models, Firebase, and cross-platform development, I build
          scalable, user-centric solutions.
        </p>
      </div>
      <div
        className={`flex-1 text-center transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl opacity-30 animate-pulse"></div>
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Avatar-udxerhqIiwPIOf2iVrbCPhRzWGpGRB.png"
            alt="Gautam Shah Avatar"
            width={400}
            height={400}
            className="relative z-10 mx-auto hover:scale-105 transition-transform duration-500"
            priority
          />
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,127,0,0.2),transparent_40%)] -z-10"></div>
    </section>
  )
}

