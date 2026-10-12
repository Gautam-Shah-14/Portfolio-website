import type { Metadata, Viewport } from "next"
import type React from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Gautam Shah | Neural Net Portfolio",
  description:
    "Portfolio of Gautam Shah, a backend-leaning full-stack engineer building secure AI products and MCP servers, as an explorable 3D neural network.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#05040a",
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
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;800&family=Fira+Code:wght@400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
