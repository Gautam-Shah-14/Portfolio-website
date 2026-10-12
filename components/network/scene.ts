import * as THREE from "three"
import type { NetLayer, NetNode } from "@/lib/network"

export interface NetworkHandlers {
  onSelect: (node: NetNode) => void
  onHover: (node: NetNode | null, x: number, y: number) => void
  onStats: (loss: number) => void
}

export interface NetworkScene {
  select: (id: string | null) => void
  infer: () => void
  dispose: () => void
}

const GAP = 3.4

/** 3D neural network: one sphere per node, edges between consecutive layers and pulses travelling along them. */
export function createNetworkScene(
  canvas: HTMLCanvasElement,
  layers: NetLayer[],
  handlers: NetworkHandlers,
  reduceMotion: boolean,
): NetworkScene | null {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  } catch {
    return null
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x05040a)
  scene.fog = new THREE.Fog(0x05040a, 14, 38)
  const cam = new THREE.PerspectiveCamera(48, 1, 0.1, 100)
  scene.add(new THREE.AmbientLight(0xffffff, 0.7))
  const dl = new THREE.DirectionalLight(0xffffff, 1)
  dl.position.set(4, 6, 8)
  scene.add(dl)
  const net = new THREE.Group()
  scene.add(net)

  interface N {
    node: NetNode
    layer: number
    pos: THREE.Vector3
    mesh: THREE.Mesh
    halo: THREE.Mesh
    big: boolean
    glow: number
  }
  const all: N[] = []
  const byLayer: N[][] = []
  layers.forEach((L, li) => {
    const count = L.nodes.length
    const list: N[] = []
    L.nodes.forEach((node, ni) => {
      const x = (li - (layers.length - 1) / 2) * GAP * 1.15
      let y = 0
      let z = 0
      if (count === 1) {
        y = 0
      } else if (count <= 3) {
        y = (ni - (count - 1) / 2) * 2.4
        z = ((ni % 2) - 0.5) * 1.2
      } else {
        const a = (ni / count) * Math.PI * 2
        const r = 2 + count * 0.18
        y = Math.sin(a) * r
        z = Math.cos(a) * r
      }
      const big = !!node.contact
      const radius = big ? 0.62 : 0.34
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 24, 24),
        new THREE.MeshStandardMaterial({ color: L.color, emissive: L.color, emissiveIntensity: 0.35, roughness: 0.4, metalness: 0.2 }),
      )
      mesh.position.set(x, y, z)
      const halo = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.9, 16, 16), new THREE.MeshBasicMaterial({ color: L.color, transparent: true, opacity: 0.1 }))
      mesh.add(halo)
      mesh.userData.id = node.id
      net.add(mesh)
      const n: N = { node, layer: li, pos: mesh.position.clone(), mesh, halo, big, glow: 0 }
      all.push(n)
      list.push(n)
    })
    byLayer.push(list)
  })
  const meshes = all.map((n) => n.mesh)
  const byId = new Map(all.map((n) => [n.node.id, n]))

  interface Edge {
    a: N
    b: N
  }
  const edges: Edge[] = []
  const edgePositions: number[] = []
  for (let li = 0; li < layers.length - 1; li++) {
    byLayer[li].forEach((a) =>
      byLayer[li + 1].forEach((b) => {
        edges.push({ a, b })
        edgePositions.push(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z)
      }),
    )
  }
  const edgeGeo = new THREE.BufferGeometry()
  edgeGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(edgePositions), 3))
  const edgeColors = new Float32Array(edges.length * 6)
  const baseColor = new THREE.Color(0x3a2a6a)
  const litColor = new THREE.Color(0xb48aff)
  const waveColor = new THREE.Color(0xff7ad9)
  const setEdgeColor = (e: number, c: THREE.Color) => {
    edgeColors[e * 6] = edgeColors[e * 6 + 3] = c.r
    edgeColors[e * 6 + 1] = edgeColors[e * 6 + 4] = c.g
    edgeColors[e * 6 + 2] = edgeColors[e * 6 + 5] = c.b
  }
  edges.forEach((_, e) => setEdgeColor(e, baseColor))
  edgeGeo.setAttribute("color", new THREE.BufferAttribute(edgeColors, 3))
  net.add(new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9 })))
  const outgoing = new Map<N, Edge[]>()
  edges.forEach((e) => outgoing.set(e.a, [...(outgoing.get(e.a) ?? []), e]))

  /* signal pulses */
  const PULSES = 70
  const pulsePos = new Float32Array(PULSES * 3)
  const pulseGeo = new THREE.BufferGeometry()
  pulseGeo.setAttribute("position", new THREE.BufferAttribute(pulsePos, 3))
  net.add(new THREE.Points(pulseGeo, new THREE.PointsMaterial({ color: 0xe4d8ff, size: 0.16, transparent: true, opacity: 0.95, depthWrite: false })))
  const pulses = Array.from({ length: PULSES }, () => ({ edge: edges[Math.floor(Math.random() * edges.length)], t: Math.random(), speed: 0.25 + Math.random() * 0.35 }))

  const fit = () => {
    const narrow = window.innerWidth < 860
    cam.position.z = narrow ? 31 : 19.5
    net.position.set(narrow ? 0 : -2.4, narrow ? -1.5 : -0.2, 0)
  }
  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight, false)
    cam.aspect = window.innerWidth / window.innerHeight
    cam.updateProjectionMatrix()
    fit()
  }
  resize()
  window.addEventListener("resize", resize)

  /* interaction */
  let rx = 0.18
  let ry = -0.5
  let vx = 0
  let vy = reduceMotion ? 0 : 0.0018
  let dragging = false
  let moved = 0
  let lx = 0
  let ly = 0
  let selected: N | null = null
  let hovered: N | null = null
  let inside = false
  const ray = new THREE.Raycaster()
  const ptr = new THREE.Vector2()
  const setPtr = (e: PointerEvent) => ptr.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)

  const down = (e: PointerEvent) => {
    dragging = true
    moved = 0
    lx = e.clientX
    ly = e.clientY
    canvas.setPointerCapture(e.pointerId)
    canvas.classList.add("drag")
  }
  const move = (e: PointerEvent) => {
    setPtr(e)
    inside = true
    handlers.onHover(hovered?.node ?? null, e.clientX, e.clientY)
    if (dragging) {
      const dx = e.clientX - lx
      const dy = e.clientY - ly
      lx = e.clientX
      ly = e.clientY
      moved += Math.abs(dx) + Math.abs(dy)
      vy = dx * 0.005
      vx = dy * 0.005
      ry += vy
      rx += vx
    }
  }
  const up = (e: PointerEvent) => {
    dragging = false
    canvas.classList.remove("drag")
    if (moved < 6) {
      setPtr(e)
      ray.setFromCamera(ptr, cam)
      const h = ray.intersectObjects(meshes)
      if (h.length) {
        const n = byId.get(h[0].object.userData.id as string)
        if (n) {
          selected = n
          handlers.onSelect(n.node)
        }
      }
    }
  }
  const cancel = () => {
    dragging = false
    canvas.classList.remove("drag")
  }
  const leave = () => {
    inside = false
    hovered = null
    handlers.onHover(null, 0, 0)
  }
  canvas.addEventListener("pointerdown", down)
  canvas.addEventListener("pointermove", move)
  canvas.addEventListener("pointerup", up)
  canvas.addEventListener("pointercancel", cancel)
  canvas.addEventListener("pointerleave", leave)

  /* inference: activate layer by layer while the loss falls */
  const run = { on: false, t: 0 }
  let loss = 1

  let raf = 0
  let last = performance.now()
  const t0 = last
  const tmp = new THREE.Color()
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    const t = (now - t0) / 1000
    if (!dragging) {
      vx *= 0.94
      vy += ((reduceMotion ? 0 : 0.0018) - vy) * 0.02
      rx += vx
      ry += vy
    }
    rx = Math.max(-0.9, Math.min(0.9, rx))
    net.rotation.x = rx
    net.rotation.y = ry

    if (inside && !dragging) {
      ray.setFromCamera(ptr, cam)
      const h = ray.intersectObjects(meshes)
      const n = h.length ? (byId.get(h[0].object.userData.id as string) ?? null) : null
      if (n !== hovered) {
        hovered = n
        canvas.style.cursor = n ? "pointer" : "grab"
      }
    }

    let waveLayer = -1
    if (run.on) {
      run.t += dt
      waveLayer = Math.floor(run.t / 0.55)
      if (waveLayer > layers.length - 1) run.on = false
      loss = Math.max(0.012, loss * Math.pow(0.9, dt * 6))
      handlers.onStats(loss)
    }

    const focus = hovered ?? selected
    all.forEach((n) => {
      let target = 0
      if (n === selected || n === hovered) target = 1
      else if (focus && Math.abs(n.layer - focus.layer) === 1) target = 0.35
      if (run.on && n.layer === waveLayer) target = Math.max(target, 0.9)
      n.glow += (target - n.glow) * 0.15
      n.mesh.scale.setScalar(1 + n.glow * 0.5 + (n.big ? Math.sin(t * 2.2) * 0.06 : 0))
      const mat = n.mesh.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.35 + n.glow * 1.1
      ;(n.halo.material as THREE.MeshBasicMaterial).opacity = 0.1 + n.glow * 0.25
    })
    edges.forEach((ed, e) => {
      const lit = focus && (ed.a === focus || ed.b === focus)
      const wave = run.on && (ed.a.layer === waveLayer || ed.a.layer === waveLayer - 1)
      setEdgeColor(e, lit ? litColor : wave ? waveColor : baseColor)
    })
    edgeGeo.attributes.color.needsUpdate = true

    pulses.forEach((p, i) => {
      p.t += dt * p.speed * (run.on ? 3 : 1)
      if (p.t >= 1) {
        const next = outgoing.get(p.edge.b)
        p.edge = next?.length && Math.random() < 0.85 ? next[Math.floor(Math.random() * next.length)] : edges[Math.floor(Math.random() * edges.length)]
        p.t = 0
      }
      const a = p.edge.a.pos
      const b = p.edge.b.pos
      pulsePos[i * 3] = a.x + (b.x - a.x) * p.t
      pulsePos[i * 3 + 1] = a.y + (b.y - a.y) * p.t
      pulsePos[i * 3 + 2] = a.z + (b.z - a.z) * p.t
    })
    pulseGeo.attributes.position.needsUpdate = true
    tmp.set(0xe4d8ff)
    renderer.render(scene, cam)
  }
  raf = requestAnimationFrame(frame)

  return {
    select: (id) => {
      selected = id ? (byId.get(id) ?? null) : null
    },
    infer: () => {
      run.on = true
      run.t = 0
    },
    dispose: () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("pointerdown", down)
      canvas.removeEventListener("pointermove", move)
      canvas.removeEventListener("pointerup", up)
      canvas.removeEventListener("pointercancel", cancel)
      canvas.removeEventListener("pointerleave", leave)
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
