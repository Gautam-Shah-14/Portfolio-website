/** Public address of the deployed site. The MCP endpoint lives at `${site.url}/mcp`. */
export const site = {
  url: "https://gautam-shah-portfolio.vercel.app",
  mcpPath: "/mcp",
  serverName: "gautam-portfolio",
  serverVersion: "1.0.0",
}

export const mcpUrl = `${site.url}${site.mcpPath}`
