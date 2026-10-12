"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { contact, profile } from "@/lib/data"
import { buildNetwork, type NetNode } from "@/lib/network"
import { createNetworkScene, type NetworkScene } from "./scene"

function DetailCard({ node, onClose }: { node: NetNode | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  if (!node) {
    return (
      <aside className="card" aria-live="polite">
        <span className="lab">How to read this</span>
        <h2>Every node is something I have done</h2>
        <p>
          Hover a node to light its connections, click it to read more. Press <b>Run inference</b> to send a signal from my education all the way to the output.
        </p>
      </aside>
    )
  }
  const copy = () =>
    navigator.clipboard?.writeText(contact.email).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      },
      () => {},
    )
  return (
    <aside className="card" aria-live="polite">
      <button className="x" aria-label="Close" onClick={onClose}>
        ✕
      </button>
      <span className="lab">{node.label}</span>
      {node.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={node.image.src}
          alt={`${node.title} logo`}
          style={{ background: node.image.background, objectFit: node.image.fit, padding: node.image.fit === "contain" ? 12 : 0 }}
        />
      )}
      <h2>{node.title}</h2>
      {node.meta && <div className="meta">{node.meta}</div>}
      <p>{node.text}</p>
      {node.items && (
        <div className="items">
          {node.items.map((i) => (
            <div key={i.name}>
              <b>{i.name}</b>
              <span>{i.description}</span>
            </div>
          ))}
        </div>
      )}
      {node.tags && (
        <div className="tags">
          {node.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      )}
      {node.link && (
        <div className="acts">
          <a href={node.link} target="_blank" rel="noopener noreferrer">
            Visit {node.link.replace("https://", "")} ↗
          </a>
        </div>
      )}
      {node.contact && (
        <>
          <p className="meta" style={{ marginTop: 14 }}>
            {contact.email}
            <br />
            {contact.phone}
          </p>
          <div className="acts">
            <a href={`mailto:${contact.email}`}>Email me</a>
            <button className="o" onClick={copy}>
              {copied ? "Copied" : "Copy email"}
            </button>
            <a className="o" target="_blank" rel="noopener noreferrer" href={contact.linkedin}>
              LinkedIn
            </a>
            <a className="o" target="_blank" rel="noopener noreferrer" href={contact.github}>
              GitHub
            </a>
          </div>
        </>
      )}
    </aside>
  )
}

export default function NeuralNet() {
  const layers = useMemo(() => buildNetwork(), [])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<NetworkScene | null>(null)
  const lossRef = useRef<HTMLElement>(null)
  const [selected, setSelected] = useState<NetNode | null>(null)
  const [epoch, setEpoch] = useState(0)
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null)
  const [webgl, setWebgl] = useState(true)

  const all = useMemo(() => layers.flatMap((l) => l.nodes), [layers])
  const nodeCount = all.length
  const edgeCount = layers.slice(0, -1).reduce((sum, l, i) => sum + l.nodes.length * layers[i + 1].nodes.length, 0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const scene = createNetworkScene(
      canvas,
      layers,
      {
        onSelect: setSelected,
        onHover: (node, x, y) => setTip(node ? { text: node.title, x, y } : null),
        onStats: (loss) => {
          if (lossRef.current) lossRef.current.textContent = loss.toFixed(4)
        },
      },
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    )
    sceneRef.current = scene
    if (!scene) setWebgl(false)
    return () => {
      scene?.dispose()
      sceneRef.current = null
    }
  }, [layers])

  const choose = (node: NetNode | null) => {
    setSelected(node)
    sceneRef.current?.select(node?.id ?? null)
  }
  const infer = () => {
    setEpoch((e) => e + 1)
    sceneRef.current?.infer()
  }
  const contactNode = layers[layers.length - 1].nodes[0]

  return (
    <>
      <canvas
        ref={canvasRef}
        id="gl"
        aria-label="Interactive 3D neural network. Each node is a part of Gautam's portfolio. Drag to rotate, click a node to read it."
        style={webgl ? undefined : { display: "none" }}
      />
      {tip && (
        <div className="tip" style={{ left: tip.x, top: tip.y, opacity: 1 }}>
          {tip.text}
        </div>
      )}

      <div className="hud title">
        <span className="lab">
          {profile.headline} · {profile.company}
        </span>
        <h1>
          {profile.firstName} <em>{profile.lastName}</em>
        </h1>
        <p>I build secure AI products. This portfolio is a small neural network: education feeds experience, experience feeds skills, skills build projects, projects reach you.</p>
        <div className="btns">
          <button className="btn" onClick={infer}>
            Run inference
          </button>
          <button
            className="btn o"
            onClick={() => {
              choose(contactNode)
              infer()
            }}
          >
            Jump to output
          </button>
        </div>
      </div>

      <nav className="hud layers" aria-label="Layers">
        {layers.map((l) => (
          <button key={l.name} className={selected && l.nodes.some((n) => n.id === selected.id) ? "on" : undefined} onClick={() => choose(l.nodes[0])}>
            <small>{l.name}</small>
            {l.sub}
          </button>
        ))}
      </nav>

      <div className="hud stats">
        <span>
          epoch <b>{epoch}</b>
        </span>
        <span>
          loss{" "}
          <b className="loss" ref={lossRef}>
            1.0000
          </b>
        </span>
        <span>
          nodes <b>{nodeCount}</b> · edges <b>{edgeCount}</b>
        </span>
      </div>
      <div className="hud drag-hint">drag to rotate · click a node · hover a node to light its connections</div>

      <DetailCard node={selected} onClose={() => choose(null)} />

      {!webgl && (
        <div style={{ position: "fixed", inset: 0, overflow: "auto", padding: "220px 20px 40px", zIndex: 4 }}>
          {all.map((n) => (
            <button key={n.id} className="btn o" style={{ margin: 4 }} onClick={() => choose(n)}>
              {n.title}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
