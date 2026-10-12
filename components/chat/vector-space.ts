import * as THREE from "three"

export interface SpacePoint {
  id: string
  topic: number
}

export interface SpaceHit {
  id: string
  rel: number
}

export interface VectorSpace {
  setHits: (hits: SpaceHit[], positions?: boolean) => void
  focus: (id: string) => void
  dispose: () => void
}

const CENTERS = [
  [0, 0, 0],
  [-3.2, 1.6, 1],
  [3.2, 1.4, -1],
  [-2.4, -2.2, -1.4],
  [2.6, -2, 1.6],
  [0, 3.2, -2.2],
]

/** A 3D cloud where every knowledge chunk is a point. Returns null if WebGL is unavailable. */
export function createVectorSpace(
  canvas: HTMLCanvasElement,
  points: SpacePoint[],
  onHover: (id: string | null, x: number, y: number) => void,
  reduceMotion: boolean,
): VectorSpace | null {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  } catch {
    return null
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  const scene = new THREE.Scene()
  const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  cam.position.z = 13
  const group = new THREE.Group()
  scene.add(group)

  let seed = 7
  const rnd = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647 - 0.5
  }

  const nodes = new Map<string, THREE.Mesh>()
  const positions = new Map<string, THREE.Vector3>()
  const meshes: THREE.Mesh[] = []
  points.forEach((p) => {
    const c = CENTERS[p.topic] ?? CENTERS[0]
    const pos = new THREE.Vector3(c[0] + rnd() * 2.4, c[1] + rnd() * 2.4, c[2] + rnd() * 2.4)
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 20), new THREE.MeshBasicMaterial({ color: 0xb48aff }))
    m.position.copy(pos)
    m.userData.id = p.id
    m.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshBasicMaterial({ color: 0x8a3ffc, transparent: true, opacity: 0.14 })))
    group.add(m)
    meshes.push(m)
    nodes.set(p.id, m)
    positions.set(p.id, pos)
  })

  const dust = 260
  const dustPos = new Float32Array(dust * 3)
  for (let i = 0; i < dust; i++) {
    const c = CENTERS[i % CENTERS.length]
    dustPos[i * 3] = c[0] + rnd() * 5
    dustPos[i * 3 + 1] = c[1] + rnd() * 5
    dustPos[i * 3 + 2] = c[2] + rnd() * 5
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3))
  group.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0x8a3ffc, size: 0.05, transparent: true, opacity: 0.65 })))

  const queryMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.3), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true }))
  queryMesh.visible = false
  group.add(queryMesh)
  const lines = new THREE.Group()
  group.add(lines)

  let hitIds: string[] = []
  let queryTarget: THREE.Vector3 | null = null

  const resize = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    cam.aspect = w / h
    cam.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)

  const clear = () => {
    hitIds.forEach((id) => {
      const m = nodes.get(id)
      if (m) {
        ;(m.material as THREE.MeshBasicMaterial).color.set(0xb48aff)
        m.scale.setScalar(1)
      }
    })
    hitIds = []
    while (lines.children.length) {
      const l = lines.children[0] as THREE.Line
      l.geometry.dispose()
      ;(l.material as THREE.Material).dispose()
      lines.remove(l)
    }
  }

  let rx = 0.25
  let ry = 0
  let vx = 0
  let vy = reduceMotion ? 0 : 0.002
  let dragging = false
  let lx = 0
  let ly = 0
  const ray = new THREE.Raycaster()
  const ptr = new THREE.Vector2()
  let over = false
  let hoverId: string | null = null

  const down = (e: PointerEvent) => {
    dragging = true
    lx = e.clientX
    ly = e.clientY
    canvas.setPointerCapture(e.pointerId)
  }
  const move = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    over = true
    if (dragging) {
      vy = (e.clientX - lx) * 0.006
      vx = (e.clientY - ly) * 0.006
      ry += vy
      rx += vx
      lx = e.clientX
      ly = e.clientY
    }
    onHover(hoverId, e.clientX, e.clientY)
  }
  const up = () => {
    dragging = false
  }
  const leave = () => {
    over = false
    hoverId = null
    onHover(null, 0, 0)
  }
  canvas.addEventListener("pointerdown", down)
  canvas.addEventListener("pointermove", move)
  canvas.addEventListener("pointerup", up)
  canvas.addEventListener("pointercancel", up)
  canvas.addEventListener("pointerleave", leave)

  let raf = 0
  const frame = () => {
    raf = requestAnimationFrame(frame)
    if (!dragging) {
      vx *= 0.95
      vy += ((reduceMotion ? 0 : 0.002) - vy) * 0.02
      rx += vx
      ry += vy
    }
    rx = Math.max(-1.2, Math.min(1.2, rx))
    group.rotation.x = rx
    group.rotation.y = ry
    if (queryTarget) queryMesh.position.lerp(queryTarget, 0.12)
    queryMesh.rotation.y += 0.03
    queryMesh.rotation.x += 0.02
    const now = performance.now()
    hitIds.forEach((id) => nodes.get(id)?.scale.setScalar(1.6 + Math.sin(now / 200) * 0.12))
    if (over && !dragging) {
      ray.setFromCamera(ptr, cam)
      const h = ray.intersectObjects(meshes)
      const id = h.length ? (h[0].object.userData.id as string) : null
      if (id !== hoverId) {
        hoverId = id
        canvas.style.cursor = id ? "pointer" : "grab"
      }
    }
    renderer.render(scene, cam)
  }
  raf = requestAnimationFrame(frame)

  return {
    setHits: (hits) => {
      clear()
      if (!hits.length) {
        queryMesh.visible = false
        queryTarget = null
        return
      }
      const c = new THREE.Vector3()
      let wsum = 0
      hits.forEach((h) => {
        const p = positions.get(h.id)
        if (p) {
          c.add(p.clone().multiplyScalar(h.rel))
          wsum += h.rel
        }
      })
      c.multiplyScalar(1 / wsum).add(new THREE.Vector3(0.6, 0.5, 0.4))
      queryTarget = c
      queryMesh.position.set(c.x + 5, c.y + 4, c.z + 3)
      queryMesh.visible = true
      hits.forEach((h) => {
        const m = nodes.get(h.id)
        const p = positions.get(h.id)
        if (!m || !p) return
        hitIds.push(h.id)
        ;(m.material as THREE.MeshBasicMaterial).color.set(0x7dffc4)
        lines.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([c, p]), new THREE.LineBasicMaterial({ color: 0x7dffc4, transparent: true, opacity: 0.8 })))
      })
    },
    focus: (id) => {
      const m = nodes.get(id)
      if (!m) return
      m.scale.setScalar(2.2)
    },
    dispose: () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener("pointerdown", down)
      canvas.removeEventListener("pointermove", move)
      canvas.removeEventListener("pointerup", up)
      canvas.removeEventListener("pointercancel", up)
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
