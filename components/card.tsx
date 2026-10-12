import type React from "react"

export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-muted rounded-xl p-8 h-full transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_25px_rgba(255,127,0,0.2)] ${className}`}
    >
      {children}
    </div>
  )
}
