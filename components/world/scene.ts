import * as THREE from "three"

export type SectionKey = "work" | "projects" | "skills" | "education" | "contact"

interface StationDef {
  key: SectionKey
  title: string
  color: number
  x: number
  z: number
}

export const STATIONS: StationDef[] = [
  { key: "work", title: "Work", color: 0x8a3ffc, x: -16, z: -4 },
  { key: "projects", title: "Projects", color: 0xb48aff, x: 16, z: -6 },
  { key: "skills", title: "Skills", color: 0xdccbff, x: -18, z: -26 },
  { key: "education", title: "Education", color: 0x8a3ffc, x: 16, z: -30 },
  { key: "contact", title: "Contact", color: 0xb48aff, x: 0, z: -40 },
]

export interface WorldOptions {
  avatarUrl: string
  reduceMotion: boolean
  onNear: (key: SectionKey | null) => void
  onSpeed: (kmh: number) => void
}

export interface WorldHandle {
  start: () => void
  driveTo: (key: SectionKey) => void
  setKey: (key: string, down: boolean) => void
  dispose: () => void
}

const NEAR_RADIUS = 5.6
const WORLD_LIMIT = 70

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  const g = c.getContext("2d")!
  draw(g)
  const t = new THREE.CanvasTexture(c)
  t.anisotropy = 4
  return t
}

function labelTexture(text: string, color: string) {
  return canvasTexture(512, 160, (g) => {
    const r = 40
    const w = 512
    const h = 160
    g.fillStyle = "#120f1d"
    g.strokeStyle = color
    g.lineWidth = 10
    g.beginPath()
    g.moveTo(r, 6)
    g.arcTo(w - 6, 6, w - 6, h - 6, r)
    g.arcTo(w - 6, h - 6, 6, h - 6, r)
    g.arcTo(6, h - 6, 6, 6, r)
    g.arcTo(6, 6, w - 6, 6, r)
    g.fill()
    g.stroke()
    g.fillStyle = "#fff"
    g.font = "64px Bungee, Impact, sans-serif"
    g.textAlign = "center"
    g.textBaseline = "middle"
    g.fillText(text.toUpperCase(), w / 2, h / 2 + 4)
  })
}

function flat(color: number) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.2, flatShading: true })
}

function buildStationObject(key: SectionKey, color: number) {
  const obj = new THREE.Group()
  if (key === "work") {
    for (let i = 0; i < 3; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(2.4 - i * 0.5, 0.9, 2.4 - i * 0.5), flat(i % 2 ? 0xe4d8ff : color))
      b.position.y = -1 + i
      obj.add(b)
    }
  } else if (key === "projects") {
    for (let j = 0; j < 3; j++) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.8, 0.2), flat(j === 1 ? 0xe4d8ff : color))
      s.position.set((j - 1) * 1.5, 0, j === 1 ? 0.4 : 0)
      s.rotation.y = (j - 1) * 0.35
      obj.add(s)
    }
  } else if (key === "skills") {
    const geos = [
      new THREE.IcosahedronGeometry(0.7),
      new THREE.OctahedronGeometry(0.7),
      new THREE.TetrahedronGeometry(0.8),
      new THREE.DodecahedronGeometry(0.65),
      new THREE.BoxGeometry(1, 1, 1),
    ]
    geos.forEach((geo, m) => {
      const o = new THREE.Mesh(geo, flat(m % 2 ? 0xe4d8ff : color))
      const a = (m / geos.length) * Math.PI * 2
      o.position.set(Math.cos(a) * 1.8, Math.sin(a * 2) * 0.5, Math.sin(a) * 1.8)
      obj.add(o)
    })
  } else if (key === "education") {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(3, 0.18, 3), flat(0x120f1d))
    cap.rotation.y = Math.PI / 4
    obj.add(cap)
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 0.9, 4), flat(color))
    top.position.y = -0.55
    top.rotation.y = Math.PI / 4
    obj.add(top)
    const tassel = new THREE.Mesh(new THREE.SphereGeometry(0.15), flat(0xe4d8ff))
    tassel.position.set(1.5, -0.2, 0)
    obj.add(tassel)
  } else {
    obj.add(new THREE.Mesh(new THREE.TorusKnotGeometry(1.1, 0.38, 120, 16), flat(color)))
  }
  return obj
}

/** Builds the drivable 3D world. Returns null when WebGL is unavailable. */
export function createWorld(canvas: HTMLCanvasElement, opts: WorldOptions): WorldHandle | null {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  } catch {
    return null
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x07060b)
  scene.fog = new THREE.Fog(0x07060b, 22, 70)
  const cam = new THREE.PerspectiveCamera(55, 1, 0.1, 200)
  scene.add(new THREE.AmbientLight(0x8d6bd8, 0.8))
  const sun = new THREE.DirectionalLight(0xffffff, 1)
  sun.position.set(10, 20, 8)
  scene.add(sun)

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ color: 0x0e0b18, roughness: 1 }))
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)
  const grid = new THREE.GridHelper(160, 80, 0x8a3ffc, 0x2a1f4a)
  grid.position.y = 0.01
  scene.add(grid)

  /* title painted on the floor at spawn */
  const floorTitle = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 5),
    new THREE.MeshBasicMaterial({
      transparent: true,
      map: canvasTexture(1024, 400, (g) => {
        g.textAlign = "center"
        g.font = "120px Bungee, Impact, sans-serif"
        g.fillStyle = "#e4d8ff"
        g.fillText("GAUTAM", 512, 170)
        g.fillStyle = "#8a3ffc"
        g.fillText("SHAH", 512, 330)
        g.fillStyle = "#a79fc0"
        g.font = "34px Outfit, sans-serif"
        g.fillText("FULL-STACK ENGINEER (BACKEND-LEANING)", 512, 390)
      }),
    }),
  )
  floorTitle.rotation.x = -Math.PI / 2
  floorTitle.position.set(0, 0.03, 8)
  scene.add(floorTitle)

  /* avatar billboard */
  const avatarMesh = new THREE.Mesh(new THREE.CircleGeometry(1.5, 48), new THREE.MeshBasicMaterial({ color: 0x8a3ffc }))
  avatarMesh.position.set(0, 3.2, 12)
  scene.add(avatarMesh)
  new THREE.TextureLoader().load(opts.avatarUrl, (t) => {
    avatarMesh.material = new THREE.MeshBasicMaterial({ map: t })
  })
  const avatarRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.1, 12, 60),
    new THREE.MeshStandardMaterial({ color: 0x8a3ffc, emissive: 0x4b1d9c }),
  )
  avatarRing.position.copy(avatarMesh.position)
  scene.add(avatarRing)
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.2), new THREE.MeshStandardMaterial({ color: 0x2a1f4a }))
  post.position.set(0, 1.6, 12)
  scene.add(post)

  /* stations */
  const stations = STATIONS.map((def) => {
    const g = new THREE.Group()
    g.position.set(def.x, 0, def.z)
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(4, 4.4, 0.4, 40),
      new THREE.MeshStandardMaterial({ color: 0x1a1330, emissive: def.color, emissiveIntensity: 0.25 }),
    )
    base.position.y = 0.2
    g.add(base)
    const ring = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.08, 8, 60), new THREE.MeshBasicMaterial({ color: def.color }))
    ring.rotation.x = Math.PI / 2
    ring.position.y = 0.45
    g.add(ring)
    const spin = new THREE.Group()
    spin.position.y = 3
    spin.add(buildStationObject(def.key, def.color))
    g.add(spin)
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 1.56),
      new THREE.MeshBasicMaterial({ map: labelTexture(def.title, "#" + def.color.toString(16).padStart(6, "0")), transparent: true }),
    )
    sign.position.y = 6.2
    g.add(sign)
    scene.add(g)
    return { def, g, spin, sign, ring }
  })

  /* scattered blocks */
  const props: { x: number; z: number; r: number }[] = []
  for (let i = 0; i < 46; i++) {
    const px = -60 + Math.random() * 120
    const pz = -60 + Math.random() * 120
    const nearStation = stations.some((s) => Math.hypot(s.def.x - px, s.def.z - pz) < 9)
    if (nearStation || Math.hypot(px, pz - 8) < 10) continue
    const h = 0.8 + Math.random() * 2.6
    const color = Math.random() < 0.3 ? 0xe4d8ff : Math.random() < 0.5 ? 0x8a3ffc : 0x2a1f4a
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.8 + Math.random(), h, 0.8 + Math.random()), flat(color))
    b.position.set(px, h / 2, pz)
    b.rotation.y = Math.random() * 3
    scene.add(b)
    props.push({ x: px, z: pz, r: 1.2 })
  }

  /* car */
  const car = new THREE.Group()
  scene.add(car)
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 2.6), flat(0x8a3ffc))
  body.position.y = 0.55
  car.add(body)
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.3), flat(0xe4d8ff))
  cab.position.set(0, 1, -0.2)
  car.add(cab)
  const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.3, 16)
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 })
  ;[
    [-0.85, 0.34, 0.85],
    [0.85, 0.34, 0.85],
    [-0.85, 0.34, -0.85],
    [0.85, 0.34, -0.85],
  ].forEach(([x, y, z]) => {
    const w = new THREE.Mesh(wheelGeo, wheelMat)
    w.rotation.z = Math.PI / 2
    w.position.set(x, y, z)
    car.add(w)
  })
  const headlight = new THREE.PointLight(0xe4d8ff, 1.4, 14)
  headlight.position.set(0, 0.8, 2.4)
  car.add(headlight)
  const taillight = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.06), new THREE.MeshBasicMaterial({ color: 0xff4fa3 }))
  taillight.position.set(0, 0.62, -1.32)
  car.add(taillight)
  car.position.set(0, 0, 18)

  /* dust */
  const DUST = 60
  const dustPos = new Float32Array(DUST * 3)
  const dustLife = new Array<number>(DUST).fill(0)
  const dustVel: number[][] = []
  for (let q = 0; q < DUST; q++) {
    dustPos[q * 3 + 1] = -50
    dustVel.push([0, 0, 0])
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3))
  scene.add(
    new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xb48aff, size: 0.22, transparent: true, opacity: 0.7, depthWrite: false })),
  )
  let dustIndex = 0

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false)
    cam.aspect = window.innerWidth / window.innerHeight
    cam.updateProjectionMatrix()
  }
  resize()
  window.addEventListener("resize", resize)

  /* input */
  const keys: Record<string, boolean> = {}
  let started = false
  const onKeyDown = (e: KeyboardEvent) => {
    if (!started) return
    const k = e.key.toLowerCase()
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault()
    keys[k] = true
  }
  const onKeyUp = (e: KeyboardEvent) => {
    keys[e.key.toLowerCase()] = false
  }
  window.addEventListener("keydown", onKeyDown)
  window.addEventListener("keyup", onKeyUp)

  /* simulation */
  let auto: { x: number; z: number } | null = null
  let vel = 0
  let heading = Math.PI
  let steer = 0
  let nearest: SectionKey | null = null
  let lastSpeed = -1
  let raf = 0
  let last = performance.now()
  const t0 = last
  const camPos = new THREE.Vector3(0, 7, 28)
  const camLook = new THREE.Vector3()
  const camTarget = new THREE.Vector3()

  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    const t = (now - t0) / 1000
    const up = keys.w || keys.arrowup
    const down = keys.s || keys.arrowdown
    const left = keys.a || keys.arrowleft
    const right = keys.d || keys.arrowright
    const boost = keys[" "]

    if (auto) {
      const dx = auto.x - car.position.x
      const dz = auto.z - car.position.z
      const dist = Math.hypot(dx, dz)
      const want = Math.atan2(dx, dz)
      const diff = ((want - heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI
      heading += diff * Math.min(1, dt * 5)
      vel += ((dist > 1.6 ? Math.min(16, dist * 1.2) : 0) - vel) * Math.min(1, dt * 3)
      if (dist < 1.2 || up || down || left || right) auto = null
    } else if (started) {
      const maxV = boost ? 24 : 14
      if (up) vel += 18 * dt
      else if (down) vel -= 22 * dt
      else vel -= Math.sign(vel) * Math.min(Math.abs(vel), 10 * dt)
      vel = Math.max(-6, Math.min(maxV, vel))
      steer = (left ? 1 : 0) - (right ? 1 : 0)
      heading += steer * dt * 2.1 * Math.min(1, Math.abs(vel) / 5) * (vel >= 0 ? 1 : -1)
    }

    car.rotation.y = heading
    car.position.x = Math.max(-WORLD_LIMIT, Math.min(WORLD_LIMIT, car.position.x + Math.sin(heading) * vel * dt))
    car.position.z = Math.max(-WORLD_LIMIT, Math.min(WORLD_LIMIT, car.position.z + Math.cos(heading) * vel * dt))
    for (const p of props) {
      const dx = car.position.x - p.x
      const dz = car.position.z - p.z
      const d = Math.hypot(dx, dz)
      const min = p.r + 1.1
      if (d < min && d > 0) {
        car.position.x = p.x + (dx / d) * min
        car.position.z = p.z + (dz / d) * min
        vel *= 0.6
      }
    }
    car.rotation.z = -steer * Math.min(0.12, Math.abs(vel) / 100)

    const kmh = Math.round(Math.abs(vel) * 5)
    if (kmh !== lastSpeed) {
      lastSpeed = kmh
      opts.onSpeed(kmh)
    }

    if (Math.abs(vel) > 6 && !opts.reduceMotion) {
      const i = dustIndex++ % DUST
      dustPos[i * 3] = car.position.x - Math.sin(heading) * 1.4 + (Math.random() - 0.5) * 0.8
      dustPos[i * 3 + 1] = 0.2
      dustPos[i * 3 + 2] = car.position.z - Math.cos(heading) * 1.4 + (Math.random() - 0.5) * 0.8
      dustVel[i] = [(Math.random() - 0.5) * 0.02, 0.015 + Math.random() * 0.02, (Math.random() - 0.5) * 0.02]
      dustLife[i] = 1
    }
    for (let j = 0; j < DUST; j++) {
      if (dustLife[j] > 0) {
        dustLife[j] -= dt * 1.2
        dustPos[j * 3] += dustVel[j][0]
        dustPos[j * 3 + 1] += dustVel[j][1]
        dustPos[j * 3 + 2] += dustVel[j][2]
        if (dustLife[j] <= 0) dustPos[j * 3 + 1] = -50
      }
    }
    dustGeo.attributes.position.needsUpdate = true

    let best: (typeof stations)[number] | null = null
    let bestDist = Infinity
    stations.forEach((s, i) => {
      s.spin.rotation.y = t * 0.6 + i
      s.spin.position.y = 3 + Math.sin(t * 1.4 + i) * 0.25
      s.sign.lookAt(cam.position.x, s.sign.position.y + s.g.position.y, cam.position.z)
      const d = Math.hypot(s.def.x - car.position.x, s.def.z - car.position.z)
      s.ring.scale.setScalar(d < 5 ? 1.08 + Math.sin(t * 6) * 0.04 : 1)
      if (d < bestDist) {
        bestDist = d
        best = s
      }
    })
    const bestKey: SectionKey | null = best && bestDist < NEAR_RADIUS ? (best as (typeof stations)[number]).def.key : null
    if (bestKey !== nearest) {
      nearest = bestKey
      opts.onNear(bestKey)
    }

    avatarRing.rotation.y = t * 0.8
    avatarMesh.lookAt(cam.position.x, avatarMesh.position.y, cam.position.z)
    avatarRing.lookAt(cam.position.x, avatarMesh.position.y, cam.position.z)

    const back = Math.min(1, Math.abs(vel) / 20)
    camTarget.set(
      car.position.x - Math.sin(heading) * (9 + back * 3),
      6.5 + back * 1.5,
      car.position.z - Math.cos(heading) * (9 + back * 3),
    )
    camPos.lerp(camTarget, Math.min(1, dt * 3))
    cam.position.copy(camPos)
    camLook.set(car.position.x + Math.sin(heading) * 5, 1, car.position.z + Math.cos(heading) * 5)
    cam.lookAt(camLook)
    cam.fov = 55 + back * 10
    cam.updateProjectionMatrix()
    renderer.render(scene, cam)
  }
  raf = requestAnimationFrame(frame)

  return {
    start: () => {
      started = true
    },
    driveTo: (key) => {
      started = true
      const s = STATIONS.find((d) => d.key === key)
      if (s) auto = { x: s.x, z: s.z + 3 }
    },
    setKey: (key, down) => {
      keys[key] = down
    },
    dispose: () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
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
