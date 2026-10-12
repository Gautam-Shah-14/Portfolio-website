import * as THREE from "three"
import type { Verdict } from "@/lib/guard"

export interface Shield {
  /** flash one layer ring (1 to 3) in the colour of its score */
  flashLayer: (layer: number, score: number) => void
  /** shake or tint the core for a final verdict */
  verdict: (v: Verdict) => void
  dispose: () => void
}

/** Three rings, one per guardrail layer, around a secret core. Returns null if WebGL is unavailable. */
export function createShield(canvas: HTMLCanvasElement, reduceMotion: boolean): Shield | null {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  } catch {
    return null
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  const scene = new THREE.Scene()
  const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 50)
  cam.position.z = 12
  scene.add(new THREE.AmbientLight(0xffffff, 0.7))
  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(3, 4, 5)
  scene.add(light)
  const group = new THREE.Group()
  scene.add(group)

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1, 1),
    new THREE.MeshStandardMaterial({ color: 0x8a3ffc, emissive: 0x3b1a85, roughness: 0.35, metalness: 0.3, flatShading: true }),
  )
  group.add(core)
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.35, 1),
    new THREE.MeshBasicMaterial({ color: 0xe4d8ff, wireframe: true, transparent: true, opacity: 0.25 }),
  )
  group.add(shell)

  const rings = [2.2, 3, 3.8].map((radius, i) => {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.045, 10, 90), new THREE.MeshBasicMaterial({ color: 0x8a3ffc }))
    mesh.rotation.x = 1.1 + i * 0.5
    mesh.rotation.y = i * 0.8
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), new THREE.MeshBasicMaterial({ color: 0xe4d8ff }))
    node.position.x = radius
    mesh.add(node)
    group.add(mesh)
    return { mesh, flash: 0, color: new THREE.Color(0x8a3ffc), speed: 0.3 + i * 0.12, dir: i % 2 ? 1 : -1 }
  })

  const base = new THREE.Color(0x8a3ffc)
  const coreTarget = new THREE.Color(0x8a3ffc)
  let shake = 0
  let resetTimer: ReturnType<typeof setTimeout> | undefined

  const resize = () => {
    const w = canvas.clientWidth
    if (w) renderer.setSize(w, w, false)
  }
  resize()
  window.addEventListener("resize", resize)

  let rx = 0.3
  let ry = 0
  let vx = 0
  let vy = reduceMotion ? 0 : 0.004
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
    vy = (e.clientX - lx) * 0.008
    vx = (e.clientY - ly) * 0.008
    ry += vy
    rx += vx
    lx = e.clientX
    ly = e.clientY
  }
  const up = () => {
    dragging = false
  }
  canvas.addEventListener("pointerdown", down)
  canvas.addEventListener("pointermove", move)
  canvas.addEventListener("pointerup", up)
  canvas.addEventListener("pointercancel", up)

  const t0 = performance.now()
  const tmp = new THREE.Color()
  let raf = 0
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    const t = (now - t0) / 1000
    if (!dragging) {
      vx *= 0.95
      vy += ((reduceMotion ? 0 : 0.004) - vy) * 0.02
      rx += vx
      ry += vy
    }
    group.rotation.x = Math.max(-1.2, Math.min(1.2, rx))
    group.rotation.y = ry
    core.rotation.y = t * 0.5
    core.rotation.x = t * 0.3
    shell.rotation.y = -t * 0.2
    const mat = core.material as THREE.MeshStandardMaterial
    mat.color.lerp(coreTarget, 0.1)
    mat.emissive.copy(mat.color).multiplyScalar(0.35)
    shake *= 0.92
    core.position.set((Math.random() - 0.5) * shake * 0.25, (Math.random() - 0.5) * shake * 0.25, 0)
    core.scale.setScalar(1 + shake * 0.1)
    rings.forEach((r) => {
      if (!reduceMotion) r.mesh.rotation.z += 0.004 * r.dir * r.speed * 3
      r.flash *= 0.96
      tmp.copy(base).lerp(r.color, r.flash)
      ;(r.mesh.material as THREE.MeshBasicMaterial).color.copy(tmp)
      r.mesh.scale.setScalar(1 + r.flash * 0.06)
    })
    renderer.render(scene, cam)
  }
  raf = requestAnimationFrame(frame)

  return {
    flashLayer: (layer, score) => {
      const r = rings[layer - 1]
      if (!r) return
      r.flash = 1
      r.color.set(score >= 0.6 ? 0xff5d7a : score >= 0.3 ? 0xffc65a : 0x5df2a8)
    },
    verdict: (v) => {
      shake = v === "blocked" ? 1 : v === "flagged" ? 0.5 : 0
      coreTarget.set(v === "allowed" ? 0x5df2a8 : v === "blocked" ? 0xff5d7a : 0xffc65a)
      clearTimeout(resetTimer)
      resetTimer = setTimeout(() => coreTarget.set(0x8a3ffc), 1400)
    },
    dispose: () => {
      cancelAnimationFrame(raf)
      clearTimeout(resetTimer)
      window.removeEventListener("resize", resize)
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
    },
  }
}
