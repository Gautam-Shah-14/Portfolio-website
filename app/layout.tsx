import type { Metadata, Viewport } from "next"
import type React from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Gautam Shah | Software Development Engineer",
  description:
    "Portfolio of Gautam Shah, a Software Development Engineer building secure AI products. Drive around a 3D world to explore his work.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07060b",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bungee&family=Outfit:wght@400;500;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
