# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP (Model Context Protocol) server for the functype TypeScript FP library. Provides documentation lookup and compile-time code validation tools so AI editors can verify functype code before presenting it to users.

**SDK:** FastMCP + Zod
**Build:** ts-builds + tsdown with `__VERSION__` injection
**Transport:** stdio (default), httpStream (via `TRANSPORT_TYPE` env var)

## Development Commands

```bash
pnpm validate          # Main command: format + lint + typecheck + test + build
pnpm test              # Run tests
pnpm build             # Production build (NODE_ENV=production)
pnpm dev               # Development build with watch
pnpm typecheck         # TypeScript compilation check
pnpm inspect           # Build + launch MCP Inspector
pnpm serve:dev         # Dev server with tsx watch
```

### Running a Single Test

```bash
pnpm vitest run test/docs.spec.ts
pnpm vitest run test/validate.spec.ts
```

## Architecture

```
src/
  index.ts                      # FastMCP server + 4 tool registrations
  bin.ts                        # CLI entry point (--version, --help)
  lib/
    docs/
      data.ts                   # Type/interface data (adapted from functype CLI)
      full-interfaces.ts        # Full TypeScript interface definitions
      formatters.ts             # Markdown formatters for MCP output
    validator/
      compiler-host.ts          # Custom ts.CompilerHost for in-memory type-checking
      validate.ts               # Core validateCode() function
      types.ts                  # ValidationResult, ValidationDiagnostic types
test/
  docs.spec.ts                  # Documentation formatter tests
  validate.spec.ts              # TypeScript validator tests
```

## Tools

| Tool             | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| `search_docs`    | Search functype docs by keyword; omit query for full overview |
| `get_type_api`   | Detailed type reference with methods by category              |
| `get_interfaces` | Interface hierarchy (Functor, Monad, Foldable, etc.)          |
| `validate_code`  | Type-check functype code snippets via TypeScript Compiler API |

## Key Design Decisions

- **Docs data is copied from functype**, not imported — functype doesn't export CLI data publicly
- **Validator uses TypeScript Compiler API** with a custom CompilerHost that resolves functype `.d.ts` files from node_modules
- **Auto-import**: `validate_code` automatically prepends functype imports unless the code already contains them
- **Line number adjustment**: When imports are prepended, line numbers in diagnostics are offset to match the user's original code
- **No functype runtime dependency in formatters** — formatters are plain TypeScript for portability

## Updating Docs Data

When functype releases new types or methods:

1. Update `src/lib/docs/data.ts` — TYPES, INTERFACES, CATEGORIES
2. Update `src/lib/docs/full-interfaces.ts` — FULL_INTERFACES
3. Run `pnpm validate`

## Build Configuration

- `tsdown.config.ts` — Custom config (not ts-builds default) for dual entry points and `__VERSION__` injection
- `tsconfig.json` — Extends `ts-builds/tsconfig`
- Output: `dist/index.js` (server) + `dist/bin.js` (CLI)
