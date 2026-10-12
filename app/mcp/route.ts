import { NextResponse } from "next/server"
import { handleBody, PARSE_ERROR, RATE_LIMITED } from "@/lib/mcp/server"
import { allow } from "@/lib/mcp/rate-limit"

export const dynamic = "force-dynamic"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Protocol-Version, Mcp-Session-Id, Authorization",
  "Access-Control-Max-Age": "86400",
}

/** Streamable HTTP transport, stateless: every POST carries one JSON-RPC message (or a batch) and gets a JSON reply. */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown"
  if (!allow(ip)) return NextResponse.json(RATE_LIMITED, { status: 429, headers: { ...CORS, "Retry-After": "60" } })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(PARSE_ERROR, { status: 400, headers: CORS })
  }

  const reply = handleBody(body)
  if (reply === null) return new NextResponse(null, { status: 202, headers: CORS }) // notifications only
  return NextResponse.json(reply, { headers: CORS })
}

/** Server-initiated streams are not supported, which the spec allows for a stateless server. */
export function GET() {
  return new NextResponse("This MCP server accepts POST requests only.", { status: 405, headers: { ...CORS, Allow: "POST, OPTIONS" } })
}

export function DELETE() {
  return new NextResponse(null, { status: 405, headers: { ...CORS, Allow: "POST, OPTIONS" } })
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}
