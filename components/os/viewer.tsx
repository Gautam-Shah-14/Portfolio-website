"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { profile } from "@/lib/data"

function faceTexture(text: string, background: string) {
  const c = document.createElement("canvas")
  c.width = c.height = 256
  const g = c.getContext("2d")!
  g.fillStyle = background
  g.fillRect(0, 0, 256, 256)
  g.strokeStyle = "#e4d8ff"
  g.lineWidth = 6
  g.strokeRect(10, 10, 236, 236)
  g.fillStyle = "#fff"
  g.font = '700 56px "Pixelify Sans", monospace'
  g.textAlign = "center"
  g.textBaseline = "middle"
  const lines = text.split("|")
  lines.forEach((l, i) => g.fillText(l, 128, 128 + (i - (lines.length - 1) / 2) * 60))
  return new THREE.CanvasTexture(c)
}

/** A cube with the avatar on one face. Drag to spin, it keeps its momentum. */
export default function Viewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    } catch {
      setSupported(false)
      return
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const w = canvas.clientWidth
    const h = 260
    renderer.setSize(w, h, false)
    const scene = new THREE.Scene()
    const cam = new THREE.PerspectiveCamera(40, w / h, 0.1, 50)
    cam.position.z = 6
    scene.add(new THREE.AmbientLight(0xffffff, 0.8))
    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(3, 4, 5)
    scene.add(light)

    const mats = ["AI|SEC", "GEN|AI", "FAST|API", "FLUT|TER", "FIRE|BASE", "UI|UX"].map(
      (t, i) => new THREE.MeshStandardMaterial({ map: faceTexture(t, i % 2 ? "#5b21b6" : "#8a3ffc"), roughness: 0.5 }),
    )
    const cube = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.4), mats)
    scene.add(cube)
    new THREE.TextureLoader().load(profile.avatar, (t) => {
      mats[0].map = t
      mats[0].needsUpdate = true
    })
    const wire = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 3.2, 3.2),
      new THREE.MeshBasicMaterial({ color: 0xb48aff, wireframe: true, transparent: true, opacity: 0.35 }),
    )
    scene.add(wire)

    let vx = reduce ? 0 : 0.01
    let vy = reduce ? 0 : 0.015
    let dragging = false
    let lx = 0
    let ly = 0
    const down = (e: PointerEvent) => {
      dragging = true
      lx = e.clientX
      ly = e.clientY
      canvas.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      vy = (e.clientX - lx) * 0.01
      vx = (e.clientY - ly) * 0.01
      lx = e.clientX
      ly = e.clientY
      cube.rotation.y += vy
      cube.rotation.x += vx
    }
    const up = () => {
      dragging = false
    }
    canvas.addEventListener("pointerdown", down)
    canvas.addEventListener("pointermove", move)
    canvas.addEventListener("pointerup", up)
    canvas.addEventListener("pointercancel", up)

    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (!dragging) {
        vx *= 0.97
        vy *= 0.97
        if (!reduce) vy += (0.004 - vy) * 0.01
        cube.rotation.x += vx
        cube.rotation.y += vy
      }
      wire.rotation.copy(cube.rotation)
      wire.rotation.y *= -0.5
      renderer.render(scene, cam)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener("pointerdown", down)
      canvas.removeEventListener("pointermove", move)
      canvas.removeEventListener("pointerup", up)
      canvas.removeEventListener("pointercancel", up)
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose()
      })
      renderer.dispose()
    }
  }, [])

  if (!supported) return <p>3D is not available in this browser.</p>
  return (
    <>
      <canvas ref={canvasRef} className="cv" />
      <p className="hint">Drag the cube to spin it. It remembers where you let go.</p>
    </>
  )
}
