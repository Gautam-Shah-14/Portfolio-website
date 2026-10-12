import * as THREE from "three"
import type { Skill, SkillCategory } from "@/lib/data"

export type DeskTarget = "projects" | "about" | "skills" | "education" | "contact"
export type ViewId = DeskTarget | "home"

export const CATEGORY_COLORS: Record<SkillCategory, string> = {
  ai: "#c9a9ff",
  mcp: "#ff9ecb",
  backend: "#ffe27a",
  data: "#8de6c0",
  frontend: "#8cc8ff",
  deploy: "#ffb27a",
}

export interface DeskProject {
  name: string
  kind: string
  tags: string[]
  background: string
}

export interface DeskOptions {
  skills: Skill[]
  categoryLabels: Record<string, string>
  projects: DeskProject[]
  reduceMotion: boolean
  onOpen: (target: DeskTarget, skillCategory?: SkillCategory) => void
  onHover: (info: { label: string; sub: string; x: number; y: number } | null) => void
}

const HAND = 'Caveat, "Segoe Script", "Comic Sans MS", cursive'
const SANS = '"Space Grotesk", system-ui, sans-serif'

const VIEWS: Record<ViewId, { p: [number, number, number]; l: [number, number, number] }> = {
  home: { p: [0, 6.2, 15.5], l: [0, 4.6, 0] },
  projects: { p: [0.2, 4.0, 6.2], l: [-0.3, 2.2, 0.8] },
  about: { p: [-4.6, 5.8, 6.8], l: [-5, 0, 2.4] },
  skills: { p: [0, 6.8, 5.4], l: [0, 6.7, -3] },
  education: { p: [4.8, 3.8, 4.4], l: [5.6, 0.9, -0.6] },
  contact: { p: [3.2, 3.6, 6.4], l: [4.1, 0.8, 2.5] },
}

interface CanvasTex {
  tex: THREE.CanvasTexture
  redraw: () => void
}

function makeTex(w: number, h: number, draw: (x: CanvasRenderingContext2D, w: number, h: number) => void): CanvasTex {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  const x = c.getContext("2d") as CanvasRenderingContext2D
  draw(x, w, h)
  const tex = new THREE.CanvasTexture(c)
  tex.encoding = THREE.sRGBEncoding
  tex.anisotropy = 4
  return {
    tex,
    redraw: () => {
      x.clearRect(0, 0, w, h)
      draw(x, w, h)
      tex.needsUpdate = true
    },
  }
}

function wrapText(x: CanvasRenderingContext2D, text: string, cx: number, y: number, maxW: number, lh: number) {
  const lines: string[] = []
  let line = ""
  text.split(" ").forEach((word) => {
    const t = line ? `${line} ${word}` : word
    if (x.measureText(t).width > maxW && line) {
      lines.push(line)
      line = word
    } else line = t
  })
  lines.push(line)
  lines.forEach((l, i) => x.fillText(l, cx, y + i * lh))
}

export function createDesk(canvas: HTMLCanvasElement, opts: DeskOptions) {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  } catch {
    return null
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0b0710)
  scene.fog = new THREE.Fog(0x0b0710, 16, 34)
  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 80)

  const std = (color: number, o: THREE.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05, ...o })
  const box = (w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, parent?: THREE.Object3D) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
    m.position.set(x, y, z)
    m.castShadow = m.receiveShadow = true
    ;(parent ?? scene).add(m)
    return m
  }
  const pickables: THREE.Group[] = []
  const group = (target: string, label: string, sub: string) => {
    const g = new THREE.Group()
    g.userData = { target, label, sub }
    scene.add(g)
    pickables.push(g)
    return g
  }
  const redraws: (() => void)[] = []
  const tex = (w: number, h: number, draw: (x: CanvasRenderingContext2D, w: number, h: number) => void) => {
    const t = makeTex(w, h, draw)
    redraws.push(t.redraw)
    return t
  }

  /* lights */
  scene.add(new THREE.AmbientLight(0x6b4fa0, 0.6))
  const lampLight = new THREE.SpotLight(0xffd9a8, 2.2, 30, 0.75, 0.5, 1)
  lampLight.position.set(-5.5, 3.8, -1.4)
  lampLight.target.position.set(-1, 0, 1)
  lampLight.castShadow = true
  lampLight.shadow.mapSize.set(1024, 1024)
  lampLight.shadow.bias = -0.0004
  scene.add(lampLight, lampLight.target)
  const screenLight = new THREE.PointLight(0x8a3ffc, 1.6, 10)
  screenLight.position.set(0, 3.2, 1.8)
  scene.add(screenLight)
  const rim = new THREE.PointLight(0xb078ff, 0.9, 24)
  rim.position.set(7, 6, 6)
  scene.add(rim)

  /* wall and desk */
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), std(0x150e21, { roughness: 1 }))
  wall.position.set(0, 6, -3.3)
  wall.receiveShadow = true
  scene.add(wall)
  box(17, 0.5, 7.4, std(0x2b1d35, { roughness: 0.55 }), 0, -0.25, 0.4)
  box(17, 0.1, 0.1, std(0x4b3260), 0, 0.03, 4.1)
  ;[-7.6, 7.6].forEach((x) => box(0.5, 6, 6, std(0x1a1224), x, -3.2, 0.4))
  box(8.4, 0.04, 4.3, std(0x120b1b, { roughness: 0.9 }), -0.3, 0.02, 1.1)

  /* skills board */
  const skillsG = group("skills", "Skills", "sticky notes")
  const trim = std(0x8a3ffc, { emissive: 0x3a1280, emissiveIntensity: 0.6 })
  box(12, 6.5, 0.2, std(0x2a1f33, { roughness: 1 }), 0, 6.7, -3.15, skillsG)
  box(12.3, 0.18, 0.3, trim, 0, 10, -3.1, skillsG)
  box(12.3, 0.18, 0.3, trim, 0, 3.4, -3.1, skillsG)
  type Note = THREE.Mesh & { userData: { note: Skill; home: THREE.Vector3; tex: CanvasTex; dim?: boolean } }
  const notes: Note[] = []
  const cols = 5
  opts.skills.forEach((s, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const t = tex(256, 256, (x, w, h) => {
      x.fillStyle = CATEGORY_COLORS[s.category]
      x.fillRect(0, 0, w, h)
      const g = x.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, "rgba(255,255,255,.28)")
      g.addColorStop(1, "rgba(0,0,0,.12)")
      x.fillStyle = g
      x.fillRect(0, 0, w, h)
      x.fillStyle = "#2a1a3d"
      x.textAlign = "center"
      const n = s.name.length > 14 ? 44 : 54
      x.font = `700 ${n}px ${HAND}`
      wrapText(x, s.name, w / 2, h / 2 - 10, w - 40, n * 0.95)
      x.font = `500 28px ${HAND}`
      x.globalAlpha = 0.7
      x.fillText((opts.categoryLabels[s.category] ?? s.category).toLowerCase(), w / 2, h - 26)
    })
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 1.5),
      new THREE.MeshStandardMaterial({ map: t.tex, roughness: 0.9, transparent: true }),
    ) as unknown as Note
    m.position.set((col - (cols - 1) / 2) * 2.2 + (row % 2 ? 0.15 : -0.1), 9.2 - row * 1.55, -3.0)
    m.rotation.z = (((i * 37) % 11) - 5) * 0.016
    m.castShadow = true
    m.userData = { note: s, home: m.position.clone(), tex: t }
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), std(0xff4d6d, { emissive: 0x551020 }))
    pin.position.set(0, 0.62, 0.05)
    m.add(pin)
    skillsG.add(m)
    notes.push(m)
  })

  /* neon sign */
  const neon = tex(512, 200, (x, w, h) => {
    x.textAlign = "center"
    x.font = `700 120px ${HAND}`
    x.shadowColor = "#8a3ffc"
    x.shadowBlur = 30
    x.fillStyle = "#e9dcff"
    x.fillText("ship it.", w / 2, h / 2 + 38)
    x.fillText("ship it.", w / 2, h / 2 + 38)
  })
  const neonM = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.65), new THREE.MeshBasicMaterial({ map: neon.tex, transparent: true }))
  neonM.position.set(-8.6, 7.2, -3.2)
  scene.add(neonM)

  /* laptop */
  const lap = group("projects", "Projects", "open the laptop")
  lap.position.set(-0.3, 0, 0.6)
  const alu = std(0x2d2a38, { metalness: 0.6, roughness: 0.35 })
  box(5.2, 0.14, 3.4, alu, 0, 0.11, 0, lap)
  const keys = tex(1024, 672, (x) => {
    x.fillStyle = "#17141f"
    x.fillRect(0, 0, 1024, 672)
    x.fillStyle = "#262233"
    for (let r = 0; r < 6; r++) for (let c = 0; c < 14; c++) x.fillRect(40 + c * 67, 40 + r * 62, 58, 52)
    x.fillRect(250, 420, 520, 52)
    x.fillStyle = "#1d1a28"
    x.fillRect(380, 520, 260, 110)
  })
  const kp = new THREE.Mesh(new THREE.PlaneGeometry(5.1, 3.3), new THREE.MeshStandardMaterial({ map: keys.tex, roughness: 0.6 }))
  kp.rotation.x = -Math.PI / 2
  kp.position.set(0, 0.19, 0)
  lap.add(kp)
  const hinge = new THREE.Group()
  hinge.position.set(0, 0.18, -1.6)
  hinge.rotation.x = -0.18
  lap.add(hinge)
  box(5.2, 3.3, 0.1, alu, 0, 1.65, 0, hinge)
  let blink = 0
  const screenTex = tex(1024, 640, (x, w, h) => {
    x.fillStyle = "#0f0a18"
    x.fillRect(0, 0, w, h)
    x.fillStyle = "#1c1230"
    x.fillRect(0, 0, w, 54)
    ;["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
      x.fillStyle = c
      x.beginPath()
      x.arc(30 + i * 28, 27, 8, 0, 7)
      x.fill()
    })
    x.fillStyle = "#8f7fb3"
    x.font = `500 22px ${SANS}`
    x.textAlign = "left"
    x.fillText("gautam@desk  ~/projects", 140, 35)
    x.fillStyle = "#e9dcff"
    x.font = `700 44px ${SANS}`
    x.fillText("Things I built", 50, 130)
    opts.projects.forEach((p, i) => {
      const y = 170 + i * 135
      x.fillStyle = "#1a1230"
      x.strokeStyle = "#33264f"
      x.lineWidth = 2
      x.beginPath()
      x.rect(50, y, 924, 112)
      x.fill()
      x.stroke()
      x.fillStyle = p.background
      x.fillRect(70, y + 16, 80, 80)
      x.fillStyle = "#fff"
      x.font = `700 38px ${SANS}`
      x.textAlign = "center"
      x.fillText(p.name[0], 110, y + 68)
      x.textAlign = "left"
      x.font = `700 32px ${SANS}`
      x.fillText(p.name, 175, y + 48)
      x.fillStyle = "#a99bc7"
      x.font = `500 22px ${SANS}`
      x.fillText(`${p.kind}  ·  ${p.tags.slice(0, 3).join(" · ")}`, 175, y + 84)
      x.fillStyle = "#8a3ffc"
      x.font = `700 26px ${SANS}`
      x.textAlign = "right"
      x.fillText("open ›", 945, y + 66)
    })
    x.textAlign = "left"
    x.fillStyle = "#8a3ffc"
    x.font = "500 26px monospace"
    x.fillText(`$ ls projects/${blink % 2 ? "_" : ""}`, 50, h - 22)
  })
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 3.06), new THREE.MeshBasicMaterial({ map: screenTex.tex }))
  screen.position.set(0, 1.66, 0.06)
  hinge.add(screen)

  /* notebook */
  const nb = group("about", "About", "open the notebook")
  nb.position.set(-5, 0, 2.4)
  nb.rotation.y = 0.28
  box(3.1, 0.09, 4.1, std(0x6a35c9, { roughness: 0.6 }), 0, 0.09, 0, nb)
  const cover = tex(600, 800, (x, w, h) => {
    x.fillStyle = "#5a2bb0"
    x.fillRect(0, 0, w, h)
    x.fillStyle = "#f5eeff"
    x.fillRect(80, 120, 440, 300)
    x.fillStyle = "#2a1a3d"
    x.textAlign = "center"
    x.font = `700 76px ${HAND}`
    x.fillText("notes", w / 2, 230)
    x.font = `500 44px ${HAND}`
    x.fillText("who i am &", w / 2, 300)
    x.fillText("where i've worked", w / 2, 355)
    x.strokeStyle = "#8a3ffc"
    x.lineWidth = 4
    x.beginPath()
    x.moveTo(150, 385)
    x.bezierCurveTo(250, 415, 350, 360, 450, 390)
    x.stroke()
    x.fillStyle = "#f5eeff"
    x.font = `500 36px ${HAND}`
    x.fillText("— G. Shah", w / 2, 700)
  })
  const cvp = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 4.1), new THREE.MeshStandardMaterial({ map: cover.tex, roughness: 0.7 }))
  cvp.rotation.x = -Math.PI / 2
  cvp.position.y = 0.141
  nb.add(cvp)
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 12), std(0xf3f0ff))
  pen.rotation.z = Math.PI / 2
  pen.rotation.y = 0.5
  pen.position.set(2.1, 0.14, 0.3)
  pen.castShadow = true
  nb.add(pen)

  /* books */
  const bk = group("education", "Education", "the books")
  bk.position.set(5.6, 0, -0.6)
  const book = (w: number, d: number, h: number, color: string, label: string, y: number, rot: number, xo: number) => {
    const spine = tex(512, 128, (x, wd, ht) => {
      x.fillStyle = color
      x.fillRect(0, 0, wd, ht)
      x.fillStyle = "rgba(255,255,255,.35)"
      x.fillRect(0, 14, wd, 4)
      x.fillRect(0, ht - 18, wd, 4)
      x.fillStyle = "#fff"
      x.font = `700 44px ${SANS}`
      x.textAlign = "center"
      x.fillText(label, wd / 2, 78)
    })
    const side = new THREE.MeshStandardMaterial({ color: 0xefe6d6, roughness: 0.9 })
    const cov = new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
    const sp = new THREE.MeshStandardMaterial({ map: spine.tex, roughness: 0.6 })
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [side, cov, cov, cov, sp, cov])
    m.position.set(xo, y, 0)
    m.rotation.y = rot
    m.castShadow = m.receiveShadow = true
    bk.add(m)
  }
  book(3.2, 2.3, 0.55, "#4c1d95", "B.Tech · CSE (AI)", 0.275, 0.08, 0)
  book(2.9, 2.1, 0.45, "#be185d", "Diploma · Android", 0.775, -0.12, 0.1)
  book(2.6, 1.9, 0.4, "#1d4ed8", "Parul University", 1.2, 0.2, -0.05)

  /* mug */
  const mug = group("contact", "Contact", "get in touch")
  mug.position.set(4.1, 0, 2.5)
  const mugTex = tex(512, 256, (x, w) => {
    x.fillStyle = "#f4efff"
    x.fillRect(0, 0, w, 256)
    x.fillStyle = "#8a3ffc"
    x.font = `700 60px ${SANS}`
    x.textAlign = "center"
    x.fillText("</> coffee", w / 2, 150)
  })
  const ceramic = () => new THREE.MeshStandardMaterial({ color: 0xf4efff, roughness: 0.35 })
  const mugM = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.55, 1.2, 32), [
    new THREE.MeshStandardMaterial({ map: mugTex.tex, roughness: 0.35 }),
    ceramic(),
    ceramic(),
  ])
  mugM.position.y = 0.64
  mugM.rotation.y = -0.5
  mugM.castShadow = true
  mug.add(mugM)
  const cof = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.02, 32), std(0x2a140a, { roughness: 0.2 }))
  cof.position.y = 1.17
  mug.add(cof)
  const hd = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.09, 10, 20, Math.PI), ceramic())
  hd.rotation.z = -Math.PI / 2
  hd.position.set(0.72, 0.66, 0)
  mug.add(hd)
  const puff = makeTex(64, 64, (x, w, h) => {
    const g = x.createRadialGradient(32, 32, 2, 32, 32, 30)
    g.addColorStop(0, "rgba(255,255,255,.7)")
    g.addColorStop(1, "rgba(255,255,255,0)")
    x.fillStyle = g
    x.fillRect(0, 0, w, h)
  })
  const steam: THREE.Sprite[] = []
  for (let i = 0; i < 10; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: puff.tex, transparent: true, depthWrite: false, opacity: 0 }))
    sp.userData.o = i / 10
    mug.add(sp)
    steam.push(sp)
  }

  /* lamp */
  const lamp = group("lamp", "Desk lamp", "click to toggle")
  lamp.position.set(-7.6, 0, -1.4)
  lamp.scale.setScalar(0.8)
  const lm = std(0x3b2b4d, { metalness: 0.5, roughness: 0.4 })
  box(1.4, 0.16, 1.4, lm, 0, 0.08, 0, lamp)
  const a1 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.6, 10), lm)
  a1.position.set(0.1, 1.9, 0)
  a1.rotation.z = -0.12
  a1.castShadow = true
  lamp.add(a1)
  const a2 = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.8, 10), lm)
  a2.position.set(1.44, 4.52, 0)
  a2.rotation.z = -0.93
  a2.castShadow = true
  lamp.add(a2)
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.75, 0.9, 24, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x8a3ffc, side: THREE.DoubleSide, roughness: 0.5, emissive: 0x2d0e66 }),
  )
  shade.position.set(2.56, 4.95, 0)
  lamp.add(shade)
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffe9c4 }))
  bulb.position.set(2.56, 4.6, 0)
  lamp.add(bulb)
  let lampOn = true

  /* dust */
  const dustN = 120
  const dp = new Float32Array(dustN * 3)
  for (let i = 0; i < dustN; i++) {
    dp[i * 3] = -8 + Math.random() * 12
    dp[i * 3 + 1] = Math.random() * 7
    dp[i * 3 + 2] = -2 + Math.random() * 7
  }
  const dg = new THREE.BufferGeometry()
  dg.setAttribute("position", new THREE.BufferAttribute(dp, 3))
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.04, color: 0xd9c6ff, transparent: true, opacity: 0.5 }))
  scene.add(dust)

  /* camera */
  const curP = new THREE.Vector3()
  const curL = new THREE.Vector3()
  const tgtP = new THREE.Vector3()
  const tgtL = new THREE.Vector3()
  let viewX = 0
  let tgtViewX = 0
  let currentView: ViewId = "home"
  const mouse = { x: 0, y: 0 }
  const focus = (id: ViewId) => {
    currentView = id
    const v = VIEWS[id]
    const k = id === "home" && window.innerWidth / window.innerHeight < 1 ? 1.05 : 1
    tgtP.set(v.p[0], v.p[1], v.p[2] * k)
    tgtL.set(...v.l)
    tgtViewX = id !== "home" && window.innerWidth > 700 ? 240 : 0
  }
  focus("home")
  curP.copy(tgtP)
  curL.copy(tgtL)
  const resize = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.fov = w / h < 1 ? 64 : 44
    camera.updateProjectionMatrix()
    focus(currentView)
  }
  window.addEventListener("resize", resize)
  resize()

  /* hover and click */
  const ray = new THREE.Raycaster()
  const mv = new THREE.Vector2()
  let hovered: THREE.Group | null = null
  let hoveredNote: Note | null = null
  const pick = (cx: number, cy: number) => {
    mv.set((cx / window.innerWidth) * 2 - 1, -(cy / window.innerHeight) * 2 + 1)
    ray.setFromCamera(mv, camera)
    const hits = ray.intersectObjects(pickables, true)
    if (!hits.length) return null
    let o: THREE.Object3D | null = hits[0].object
    let note: Note | null = null
    while (o) {
      if (o.userData.note && !note) note = o as Note
      if (o.userData.target) return { g: o as THREE.Group, note }
      o = o.parent
    }
    return null
  }
  const setGlow = (g: THREE.Group, on: boolean) => {
    g.traverse((o) => {
      const mesh = o as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial | undefined
      if (!mat || !mat.emissive || o.userData.note || o === shade) return
      if (on) {
        o.userData.e ??= mat.emissive.getHex()
        o.userData.i ??= mat.emissiveIntensity
        mat.emissive.setHex(0x4b2a99)
        mat.emissiveIntensity = 0.55
      } else if (o.userData.e !== undefined) {
        mat.emissive.setHex(o.userData.e)
        mat.emissiveIntensity = o.userData.i
      }
    })
  }
  const onMove = (e: PointerEvent) => {
    mouse.x = e.clientX / window.innerWidth - 0.5
    mouse.y = e.clientY / window.innerHeight - 0.5
    const r = pick(e.clientX, e.clientY)
    const g = r?.g ?? null
    if (g !== hovered) {
      if (hovered) setGlow(hovered, false)
      hovered = g
      if (g) setGlow(g, true)
      canvas.style.cursor = g ? "pointer" : "default"
    }
    hoveredNote = r?.note ?? null
    if (g) {
      const u = g.userData
      opts.onHover({ label: u.label, sub: hoveredNote ? hoveredNote.userData.note.name : u.sub, x: e.clientX, y: e.clientY })
    } else opts.onHover(null)
  }
  const onLeave = () => opts.onHover(null)
  const onClick = (e: MouseEvent) => {
    const r = pick(e.clientX, e.clientY)
    if (!r) return
    const t = r.g.userData.target as string
    if (t === "lamp") {
      lampOn = !lampOn
      return
    }
    opts.onOpen(t as DeskTarget, t === "skills" && r.note ? r.note.userData.note.category : undefined)
  }
  canvas.addEventListener("pointermove", onMove)
  canvas.addEventListener("pointerleave", onLeave)
  canvas.addEventListener("click", onClick)

  let filter: SkillCategory | "all" = "all"
  const clock = new THREE.Clock()
  let acc = 0
  let raf = 0
  const frame = () => {
    const dt = Math.min(clock.getDelta(), 0.05)
    const t = clock.elapsedTime
    acc += dt
    if (acc > 0.5 && !opts.reduceMotion) {
      acc = 0
      blink++
      screenTex.redraw()
    }
    const par = currentView === "home" && !opts.reduceMotion ? 1 : 0
    const kk = 1 - Math.exp(-dt * (opts.reduceMotion ? 30 : 4.5))
    curP.lerp(tgtP, kk)
    curL.lerp(tgtL, kk)
    camera.position.set(curP.x + mouse.x * 1.2 * par, curP.y - mouse.y * 0.7 * par, curP.z)
    camera.lookAt(curL)
    viewX += (tgtViewX - viewX) * kk
    if (Math.abs(viewX) > 0.5) camera.setViewOffset(window.innerWidth, window.innerHeight, viewX, 0, window.innerWidth, window.innerHeight)
    else camera.clearViewOffset()
    notes.forEach((n) => {
      const h = n === hoveredNote
      n.position.z += (n.userData.home.z + (h ? 0.35 : 0) - n.position.z) * 0.2
      const s = n.scale.x + ((h ? 1.12 : 1) - n.scale.x) * 0.2
      n.scale.set(s, s, 1)
      const mat = n.material as THREE.MeshStandardMaterial
      const dim = filter !== "all" && n.userData.note.category !== filter
      mat.opacity += ((dim ? 0.25 : 1) - mat.opacity) * 0.15
    })
    if (!opts.reduceMotion) {
      steam.forEach((s) => {
        const u = (s.userData.o + t * 0.18) % 1
        s.position.set(Math.sin(u * 9 + s.userData.o * 7) * 0.2, 1.3 + u * 2.1, 0)
        const sc = 0.4 + u
        s.scale.set(sc, sc, 1)
        ;(s.material as THREE.SpriteMaterial).opacity = Math.sin(u * Math.PI) * 0.4
      })
      const pos = dust.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < dustN; i++) {
        pos[i * 3 + 1] += dt * 0.12
        pos[i * 3] += Math.sin(t + i) * dt * 0.04
        if (pos[i * 3 + 1] > 7) pos[i * 3 + 1] = 0
      }
      dust.geometry.attributes.position.needsUpdate = true
    }
    lampLight.intensity += ((lampOn ? 2.2 : 0) - lampLight.intensity) * 0.15
    bulb.material.color.setHex(lampOn ? 0xffe9c4 : 0x4a3d55)
    screenLight.intensity = 1.3 + Math.sin(t * 2) * 0.1
    renderer.render(scene, camera)
    raf = requestAnimationFrame(frame)
  }

  const start = () => {
    redraws.forEach((r) => r())
    raf = requestAnimationFrame(frame)
  }
  let cancelled = false
  const fonts = document.fonts?.load
    ? Promise.race([document.fonts.load("700 40px Caveat"), new Promise((r) => setTimeout(r, 1500))])
    : Promise.resolve()
  fonts.then(() => {
    if (!cancelled) start()
  })

  return {
    focus,
    setFilter: (f: SkillCategory | "all") => {
      filter = f
    },
    dispose: () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("pointermove", onMove)
      canvas.removeEventListener("pointerleave", onLeave)
      canvas.removeEventListener("click", onClick)
      renderer.dispose()
    },
  }
}
