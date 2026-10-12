import * as THREE from "three"

export type OrbMode = "idle" | "thinking" | "speaking"

export interface Orb {
  setMode: (mode: OrbMode) => void
  dispose: () => void
}

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  varying vec3 vN;
  varying vec3 vP;
  varying float vD;
  void main() {
    vec3 p = position;
    float n = sin(p.x * 2.1 + uTime * 1.1) * sin(p.y * 2.3 + uTime * 0.9) * sin(p.z * 2.5 + uTime * 1.3);
    float n2 = sin(p.x * 4.0 - uTime * 1.7 + p.y * 3.0) * 0.5;
    float d = (n + n2 * 0.5) * uAmp;
    vec3 np = p + normal * d;
    vD = d;
    vN = normalize(normalMatrix * normal);
    vP = (modelViewMatrix * vec4(np, 1.0)).xyz;
    gl_Position = projectionMatrix * vec4(vP, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform float uTime;
  varying vec3 vN;
  varying vec3 vP;
  varying float vD;
  void main() {
    vec3 V = normalize(-vP);
    float f = pow(1.0 - max(dot(normalize(vN), V), 0.0), 2.2);
    vec3 c1 = vec3(0.30, 0.10, 0.80);
    vec3 c2 = vec3(0.95, 0.45, 0.92);
    vec3 c3 = vec3(0.35, 0.85, 1.0);
    vec3 col = mix(c1, c2, clamp(f * 1.25 + vD * 1.6, 0.0, 1.0));
    col = mix(col, c3, smoothstep(0.6, 1.0, f) * 0.55);
    col += f * 0.3 + 0.05 * sin(uTime + vP.y * 3.0);
    gl_FragColor = vec4(col, 1.0);
  }
`

/** A softly deforming gradient orb with orbiting particles. Reacts to the pointer and to the assistant's mode. */
export function createOrb(canvas: HTMLCanvasElement, reduceMotion: boolean): Orb | null {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  } catch {
    return null
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  const scene = new THREE.Scene()
  const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 50)
  cam.position.z = 6

  const uniforms = { uTime: { value: 0 }, uAmp: { value: 0.16 } }
  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 28), new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment }))
  scene.add(orb)

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(1.9, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x8a3ffc, transparent: true, opacity: 0.12, side: THREE.BackSide }),
  )
  scene.add(halo)

  const count = 420
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2
    const b = Math.acos(2 * Math.random() - 1)
    const r = 2.2 + Math.random() * 1.6
    positions[i * 3] = r * Math.sin(b) * Math.cos(a)
    positions[i * 3 + 1] = r * Math.sin(b) * Math.sin(a)
    positions[i * 3 + 2] = r * Math.cos(b)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  const particles = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xe4d8ff, size: 0.028, transparent: true, opacity: 0.8, depthWrite: false }))
  scene.add(particles)

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

  let mx = 0
  let my = 0
  let sx = 0
  let sy = 0
  const onMove = (e: PointerEvent) => {
    mx = e.clientX / window.innerWidth - 0.5
    my = e.clientY / window.innerHeight - 0.5
  }
  window.addEventListener("pointermove", onMove)

  let target = 0.16
  let speed = 1
  const t0 = performance.now()
  let raf = 0
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    const t = (now - t0) / 1000
    uniforms.uTime.value = reduceMotion ? 0 : t * speed
    uniforms.uAmp.value += (target - uniforms.uAmp.value) * 0.06
    sx += (mx - sx) * 0.05
    sy += (my - sy) * 0.05
    orb.rotation.y = t * 0.12 + sx * 0.8
    orb.rotation.x = sy * 0.6
    halo.scale.setScalar(1 + uniforms.uAmp.value * 0.5)
    particles.rotation.y = t * 0.05
    particles.rotation.x = Math.sin(t * 0.1) * 0.1
    renderer.render(scene, cam)
  }
  raf = requestAnimationFrame(frame)

  return {
    setMode: (mode) => {
      target = mode === "thinking" ? 0.42 : mode === "speaking" ? 0.27 : 0.16
      speed = mode === "thinking" ? 2.4 : mode === "speaking" ? 1.6 : 1
    },
    dispose: () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener("pointermove", onMove)
      orb.geometry.dispose()
      ;(orb.material as THREE.Material).dispose()
      halo.geometry.dispose()
      ;(halo.material as THREE.Material).dispose()
      geo.dispose()
      ;(particles.material as THREE.Material).dispose()
      renderer.dispose()
    },
  }
}
