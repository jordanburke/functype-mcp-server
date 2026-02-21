import { FastMCP } from "fastmcp"
import { z } from "zod"

import { VERSION } from "./lib/docs/data"
import { formatInterfaces, formatOverview, formatType, getTypeByName, searchTypes } from "./lib/docs/formatters"
import { FULL_INTERFACES } from "./lib/docs/full-interfaces"
import { validateCode } from "./lib/validator/validate"

declare const __VERSION__: string
const SERVER_VERSION = (
  typeof __VERSION__ !== "undefined" ? __VERSION__ : "0.0.0-dev"
) as `${number}.${number}.${number}`

const server = new FastMCP({
  name: "functype-mcp-server",
  version: SERVER_VERSION,
  instructions: `Functype MCP Server — documentation lookup and code validation for the functype TypeScript FP library (v${VERSION}).

Available tools:
- search_docs: Search functype documentation by keyword or type name
- get_type_api: Get detailed API reference for a specific type
- get_interfaces: Get the interface hierarchy (Functor, Monad, Foldable, etc.)
- validate_code: Type-check functype code snippets at compile time

Use validate_code to verify your functype code is type-correct before presenting it to the user.`,
})

server.addTool({
  name: "search_docs",
  description:
    "Search functype documentation by keyword or type name. Omit query for a full overview of all types and categories.",
  parameters: z.object({
    query: z.string().optional().describe("Type name or keyword to search for. Omit for full overview."),
  }),
  execute: async (args) => {
    if (!args.query || args.query.trim() === "") {
      return formatOverview()
    }
    return searchTypes(args.query)
  },
})

server.addTool({
  name: "get_type_api",
  description:
    "Get detailed API reference for a specific functype type including methods by category and optionally the full TypeScript interface definition.",
  parameters: z.object({
    type_name: z.string().describe("The type name (e.g., Option, Either, List, IO)"),
    include_full_interface: z
      .boolean()
      .optional()
      .default(false)
      .describe("Include full TypeScript interface definition"),
  }),
  execute: async (args) => {
    const found = getTypeByName(args.type_name)
    if (!found) {
      const available = Object.keys(FULL_INTERFACES).join(", ")
      return `Type "${args.type_name}" not found. Available types: ${available}`
    }
    return formatType(found.name, found.data, args.include_full_interface)
  },
})

server.addTool({
  name: "get_interfaces",
  description:
    "Get the functype interface hierarchy — Functor, Monad, Foldable, Extractable, Matchable, etc. — with their methods and inheritance.",
  parameters: z.object({}),
  execute: async () => {
    return formatInterfaces()
  },
})

server.addTool({
  name: "validate_code",
  description:
    "Type-check a functype code snippet using the TypeScript compiler. Returns PASSED or a list of type errors with line/column/message. Use this to verify functype code is type-correct before presenting to users.",
  parameters: z.object({
    code: z.string().describe("TypeScript code snippet using functype to type-check"),
    auto_import: z
      .boolean()
      .optional()
      .default(true)
      .describe("Automatically import all functype types if no import statement is present. Default: true"),
  }),
  execute: async (args) => {
    const result = validateCode(args.code, { autoImport: args.auto_import })

    if (result.success) {
      const importNote = result.importsPrepended ? " (functype imports auto-added)" : ""
      return `Validation PASSED${importNote}\n\nThe code is type-correct.`
    }

    const errorLines = result.diagnostics.map((d) => `- Line ${d.line}, Col ${d.column}: ${d.message} (TS${d.code})`)
    const importNote = result.importsPrepended ? "\n\nNote: functype imports were auto-added." : ""

    return `Validation FAILED — ${result.diagnostics.length} error(s):\n\n${errorLines.join("\n")}${importNote}`
  },
})

async function main() {
  const useHttp = process.env.TRANSPORT_TYPE === "httpStream" || process.env.TRANSPORT_TYPE === "http"
  const port = parseInt(process.env.PORT || "3000")
  const host = process.env.HOST || "0.0.0.0"

  if (useHttp) {
    console.error(`[functype-mcp] Starting HTTP server on ${host}:${port}`)
    await server.start({
      transportType: "httpStream",
      httpStream: { port, host, endpoint: "/mcp" },
    })
    console.error(`[functype-mcp] HTTP server ready at http://${host}:${port}/mcp`)
  } else {
    console.error("[functype-mcp] Starting in stdio mode")
    await server.start({ transportType: "stdio" })
  }
}

process.on("SIGINT", () => process.exit(0))
process.on("SIGTERM", () => process.exit(0))

main().catch(console.error)
