import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gautam Shah - AI/ML & Flutter Developer",
  description: "Portfolio website of Gautam Shah, AI/ML and Flutter Developer",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="container max-w-6xl mx-auto px-4">
          <Header />
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}

