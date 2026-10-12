"use client"

import { useEffect, useState } from "react"

const LINES = [
  "GS-BIOS v2026.10  (c) Gautam Shah",
  "cpu ............ violet-core x8",
  "mem ............ 16384 MB ok",
  "loading ai-security.ko ....... ok",
  "loading genai-runtime ........ ok",
  "loading fastapi.service ...... ok",
  "mounting /home/gautam/projects ... ok",
  "",
  "welcome, guest.",
]

export default function Boot({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0)
  const [off, setOff] = useState(false)

  const finish = () => {
    setOff(true)
    onDone()
  }

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOff(true)
      onDone()
      return
    }
    if (shown >= LINES.length) {
      const t = setTimeout(() => {
        setOff(true)
        onDone()
      }, 400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setShown((n) => n + 1), 170)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown])

  return (
    <div className={`boot${off ? " off" : ""}`} aria-hidden={off}>
      <button className="skip" onClick={finish}>
        skip ▸
      </button>
      {LINES.slice(0, shown).join("\n")}
    </div>
  )
}
