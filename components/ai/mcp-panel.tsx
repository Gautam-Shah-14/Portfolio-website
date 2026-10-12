"use client"

import { useRef, useState } from "react"
import { mcpUrl, site } from "@/lib/site"

interface ToolDef {
  name: string
  title?: string
  description: string
  inputSchema: { properties?: Record<string, { type?: string; description?: string; enum?: string[] }>; required?: string[] }
}
interface LogLine {
  id: number
  dir: "out" | "in"
  label: string
  json: string
  ms?: number
  error?: boolean
}

const SNIPPETS = {
  "Claude Code": `claude mcp add --transport http ${site.serverName} ${mcpUrl}`,
  "Claude Desktop": JSON.stringify({ mcpServers: { [site.serverName]: { command: "npx", args: ["-y", "mcp-remote", mcpUrl] } } }, null, 2),
  "Any client": mcpUrl,
} as const

export default function McpPanel() {
  const [tools, setTools] = useState<ToolDef[]>([])
  const [selected, setSelected] = useState<ToolDef | null>(null)
  const [args, setArgs] = useState<Record<string, string>>({})
  const [log, setLog] = useState<LogLine[]>([])
  const [result, setResult] = useState<{ text: string; error: boolean } | null>(null)
  const [status, setStatus] = useState<"idle" | "connecting" | "ready" | "failed">("idle")
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState<keyof typeof SNIPPETS>("Claude Code")
  const [copied, setCopied] = useState(false)
  const nextId = useRef(1)
  const logId = useRef(0)

  async function rpc(method: string, params?: unknown, notification = false) {
    const message: Record<string, unknown> = { jsonrpc: "2.0", method }
    if (!notification) message.id = nextId.current++
    if (params !== undefined) message.params = params
    setLog((l) => [...l, { id: logId.current++, dir: "out", label: method, json: JSON.stringify(message, null, 2) }])
    const t0 = performance.now()
    const res = await fetch(site.mcpPath, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
      body: JSON.stringify(message),
    })
    if (res.status === 202) return null
    const json = await res.json()
    const ms = Math.round(performance.now() - t0)
    setLog((l) => [
      ...l,
      { id: logId.current++, dir: "in", label: json.error ? `error ${json.error.code}` : "result", json: JSON.stringify(json, null, 2), ms, error: !!json.error || !!json.result?.isError },
    ])
    return json
  }

  async function connect() {
    setStatus("connecting")
    setLog([])
    nextId.current = 1
    try {
      await rpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "portfolio-inspector", version: "1.0.0" } })
      await rpc("notifications/initialized", undefined, true)
      const list = await rpc("tools/list", {})
      const t: ToolDef[] = list.result.tools
      setTools(t)
      choose(t[0])
      setStatus("ready")
    } catch {
      setStatus("failed")
    }
  }

  function choose(tool: ToolDef) {
    setSelected(tool)
    setArgs({})
    setResult(null)
  }

  async function call() {
    if (!selected || busy) return
    setBusy(true)
    try {
      const clean = Object.fromEntries(Object.entries(args).filter(([, v]) => v !== ""))
      const json = await rpc("tools/call", { name: selected.name, arguments: clean })
      if (json.error) setResult({ text: `Error ${json.error.code}: ${json.error.message}`, error: true })
      else setResult({ text: json.result.content.map((c: { text: string }) => c.text).join("\n"), error: !!json.result.isError })
    } catch {
      setResult({ text: "The request failed. Is the server reachable?", error: true })
    }
    setBusy(false)
  }

  const copy = () =>
    navigator.clipboard?.writeText(SNIPPETS[tab]).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      },
      () => {},
    )

  return (
    <section className="sec" id="mcp">
      <header className="sec-head">
        <span className="eyebrow">Model Context Protocol</span>
        <h2>
          Plug my portfolio into <span className="grad">your AI</span>
        </h2>
        <p>This site is also an MCP server. Connect it to Claude or any MCP client and ask about me from there, or try it live below. The panel talks to the real endpoint.</p>
      </header>

      <div className="mcp-grid">
        <div className="glass">
          <div className="tabs" role="tablist">
            {(Object.keys(SNIPPETS) as (keyof typeof SNIPPETS)[]).map((k) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>
                {k}
              </button>
            ))}
          </div>
          <pre className="code">{SNIPPETS[tab]}</pre>
          <div className="row">
            <button className="btn ghost sm" onClick={copy}>
              {copied ? "Copied" : "Copy"}
            </button>
            <span className="url">{mcpUrl}</span>
          </div>
          <ul className="facts">
            <li>Streamable HTTP, JSON-RPC 2.0, stateless</li>
            <li>8 read-only tools, 3 resources, 1 prompt</li>
            <li>Rate limited, no login, public data only</li>
          </ul>
        </div>

        <div className="glass inspector">
          <div className="insp-head">
            <b>Live inspector</b>
            <span className={`state ${status}`}>
              <i />
              {status === "idle" ? "not connected" : status === "connecting" ? "connecting..." : status === "ready" ? "connected" : "failed"}
            </span>
            <button className="btn sm" onClick={connect} disabled={status === "connecting"}>
              {status === "ready" ? "Reconnect" : "Connect"}
            </button>
          </div>

          {status === "failed" && <p className="warn">Could not reach /mcp. It is served by the deployed app, so run it with npm run dev or deploy it.</p>}

          {status === "ready" && (
            <div className="insp-body">
              <div className="toollist" role="listbox" aria-label="Tools">
                {tools.map((t) => (
                  <button key={t.name} role="option" aria-selected={selected?.name === t.name} onClick={() => choose(t)}>
                    {t.name}
                  </button>
                ))}
              </div>
              {selected && (
                <div className="builder">
                  <p>{selected.description}</p>
                  {Object.entries(selected.inputSchema.properties ?? {}).map(([name, prop]) => (
                    <label key={name}>
                      <span>
                        {name}
                        {selected.inputSchema.required?.includes(name) && <i> *</i>}
                      </span>
                      {prop.enum ? (
                        <select value={args[name] ?? ""} onChange={(e) => setArgs({ ...args, [name]: e.target.value })}>
                          <option value="">(any)</option>
                          {prop.enum.map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={args[name] ?? ""}
                          placeholder={prop.description}
                          onChange={(e) => setArgs({ ...args, [name]: e.target.value })}
                          onKeyDown={(e) => e.key === "Enter" && call()}
                        />
                      )}
                    </label>
                  ))}
                  <button className="btn sm" onClick={call} disabled={busy}>
                    Call tool
                  </button>
                  {result && <pre className={`result${result.error ? " err" : ""}`}>{result.text}</pre>}
                </div>
              )}
            </div>
          )}

          <div className="wire" aria-label="Wire log">
            {log.length === 0 ? (
              <span className="muted">The JSON-RPC messages appear here once you connect.</span>
            ) : (
              log.map((l) => (
                <details key={l.id} className={`${l.dir}${l.error ? " bad" : ""}`}>
                  <summary>
                    <span>{l.dir === "out" ? "→" : "←"}</span> {l.label}
                    {l.ms !== undefined && <em>{l.ms} ms</em>}
                  </summary>
                  <pre>{l.json}</pre>
                </details>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
