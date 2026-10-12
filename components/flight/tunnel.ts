import * as THREE from "three"

const RING_COUNT = 40
const SPACING = 7

export interface TunnelFrame {
  /** scroll progress, 0 to 1 */
  progress: number
  /** how many panels the flight passes through */
  stops: number
  /** pointer position, -0.5 to 0.5 */
  mx: number
  my: number
  /** seconds */
  time: number
}

export interface Tunnel {
  render: (frame: TunnelFrame) => void
  pulse: () => void
  dispose: () => void
}

/** A violet hexagonal tunnel with drifting shards. Returns null when WebGL is unavailable. */
export function createTunnel(canvas: HTMLCanvasElement, reduceMotion: boolean): Tunnel | null {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  } catch {
    return null
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x050409)
  scene.fog = new THREE.FogExp2(0x050409, 0.028)
  const cam = new THREE.PerspectiveCamera(65, 1, 0.1, 300)

  const ringGeo = new THREE.TorusGeometry(6, 0.06, 8, 6)
  const rings: THREE.Mesh[] = []
  for (let i = 0; i < RING_COUNT; i++) {
    const m = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({ color: i % 5 === 0 ? 0xe4d8ff : 0x8a3ffc, transparent: true, opacity: 0.9 }),
    )
    m.position.z = -i * SPACING
    m.rotation.z = i * 0.35
    scene.add(m)
    rings.push(m)
  }

  const shardGeos = [new THREE.OctahedronGeometry(0.5), new THREE.TetrahedronGeometry(0.6), new THREE.BoxGeometry(0.7, 0.7, 0.7)]
  const shards: THREE.Mesh[] = []
  for (let s = 0; s < 70; s++) {
    const sh = new THREE.Mesh(
      shardGeos[s % 3],
      new THREE.MeshBasicMaterial({ color: s % 4 === 0 ? 0xe4d8ff : 0xb48aff, wireframe: s % 3 === 0 }),
    )
    const a = Math.random() * Math.PI * 2
    const r = 3 + Math.random() * 7
    sh.position.set(Math.cos(a) * r, Math.sin(a) * r, -Math.random() * RING_COUNT * SPACING)
    sh.userData = { spin: Math.random() * 2 }
    scene.add(sh)
    shards.push(sh)
  }

  const starCount = 2000
  const starPos = new Float32Array(starCount * 3)
  for (let k = 0; k < starCount; k++) {
    const a = Math.random() * Math.PI * 2
    const r = 8 + Math.random() * 30
    starPos[k * 3] = Math.cos(a) * r
    starPos[k * 3 + 1] = Math.sin(a) * r
    starPos[k * 3 + 2] = -Math.random() * RING_COUNT * SPACING
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3))
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.8 })))

  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight, false)
    cam.aspect = window.innerWidth / window.innerHeight
    cam.updateProjectionMatrix()
  }
  resize()
  window.addEventListener("resize", resize)

  let pulseValue = 0
  let sx = 0
  let sy = 0

  return {
    pulse: () => {
      pulseValue = 1
    },
    render: ({ progress, stops, mx, my, time }) => {
      const camZ = -progress * (stops - 1) * SPACING * 2.6
      sx += (mx - sx) * 0.05
      sy += (my - sy) * 0.05
      cam.position.set(sx * 4, -sy * 3, camZ)
      cam.rotation.set(sy * 0.2, -sx * 0.35, time * 0.04 + progress * 3)
      pulseValue *= 0.93
      rings.forEach((m, i) => {
        m.scale.setScalar(1 + pulseValue * 0.35 * Math.sin(i * 0.6 - time * 8) + (reduceMotion ? 0 : Math.sin(time + i) * 0.03))
        m.rotation.z += 0.002 * (i % 2 ? 1 : -1)
        // loop rings forward so the tunnel never ends
        if (m.position.z > camZ + SPACING) m.position.z -= RING_COUNT * SPACING
      })
      shards.forEach((s) => {
        s.rotation.x += 0.01 + s.userData.spin * 0.004
        s.rotation.y += 0.012
        if (s.position.z > camZ + 5) s.position.z -= RING_COUNT * SPACING
      })
      renderer.render(scene, cam)
    },
    dispose: () => {
      window.removeEventListener("resize", resize)
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
