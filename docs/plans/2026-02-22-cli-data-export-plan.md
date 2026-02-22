# CLI Data Export Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Export functype's CLI documentation data as a public subpath (`functype/cli`) and replace the MCP server's duplicated copy with imports.

**Architecture:** Create a barrel file in functype that re-exports CLI data without the CLI runner. Add the subpath to package.json exports and the build config. Then replace ~360 lines of copied data in functype-mcp-server with a thin re-export.

**Tech Stack:** TypeScript, tsdown, functype, functype-mcp-server

---

## Phase 1: functype changes

### Task 1: Create the CLI exports barrel

**Files:**

- Create: `/Users/jordanburke/IdeaProjects/functype/src/cli/exports.ts`

**Step 1: Write the barrel file**

```typescript
/**
 * Public API for functype CLI data.
 * Re-exports curated type/interface metadata for use by tooling (MCP servers, editors, etc.)
 */

export { CATEGORIES, INTERFACES, TYPES, VERSION } from "./data"
export type { InterfaceData, TypeData } from "./data"
export { FULL_INTERFACES } from "./full-interfaces"
```

**Step 2: Verify it compiles**

Run: `cd /Users/jordanburke/IdeaProjects/functype && pnpm typecheck`
Expected: PASS (no new errors)

**Step 3: Commit**

```bash
cd /Users/jordanburke/IdeaProjects/functype
git add src/cli/exports.ts
git commit -m "feat(cli): add public exports barrel for CLI data"
```

### Task 2: Add build entry for cli/exports

**Files:**

- Modify: `/Users/jordanburke/IdeaProjects/functype/tsdown.config.ts:9-11`

**Step 1: Add the entry point**

In the `entries` object, add `"cli/exports"` alongside the existing `"cli/index"`:

```typescript
const entries = {
  index: "src/index.ts",
  "cli/index": "src/cli/index.ts",
  "cli/exports": "src/cli/exports.ts",
  ...Object.fromEntries(
```

**Step 2: Build and verify output exists**

Run: `cd /Users/jordanburke/IdeaProjects/functype && pnpm build`
Expected: `dist/cli/exports.js` and `dist/cli/exports.d.ts` exist

Run: `ls /Users/jordanburke/IdeaProjects/functype/dist/cli/`
Expected: `exports.d.ts  exports.js  index.d.ts  index.js`

**Step 3: Commit**

```bash
cd /Users/jordanburke/IdeaProjects/functype
git add tsdown.config.ts
git commit -m "build: add cli/exports entry point to tsdown config"
```

### Task 3: Add subpath export to package.json

**Files:**

- Modify: `/Users/jordanburke/IdeaProjects/functype/package.json:60-155` (exports section)

**Step 1: Add `./cli` export**

Add this entry to the `exports` object in package.json, after the `"."` entry:

```json
"./cli": {
  "types": "./dist/cli/exports.d.ts",
  "import": "./dist/cli/exports.js",
  "default": "./dist/cli/exports.js"
},
```

**Step 2: Verify the export resolves**

Run: `cd /Users/jordanburke/IdeaProjects/functype && node -e "import('functype/cli').then(m => console.log(Object.keys(m)))"`

Note: This may not work from the same package. Alternative verification — check that `pnpm build` still succeeds and the dist files exist.

Run: `cd /Users/jordanburke/IdeaProjects/functype && pnpm build`
Expected: PASS

**Step 3: Run full validation**

Run: `cd /Users/jordanburke/IdeaProjects/functype && pnpm validate`
Expected: PASS (format, lint, typecheck, test, build all green)

**Step 4: Commit**

```bash
cd /Users/jordanburke/IdeaProjects/functype
git add package.json
git commit -m "feat(cli): expose functype/cli subpath export for tooling consumers"
```

### Task 4: Publish functype (or link locally)

**Step 1: Choose approach**

Option A — Publish to npm:

```bash
cd /Users/jordanburke/IdeaProjects/functype
# Bump patch version
npm version patch
pnpm validate
npm publish
```

Option B — Link locally for development:

```bash
cd /Users/jordanburke/IdeaProjects/functype
pnpm link --global
```

Then in MCP server:

```bash
cd /Users/jordanburke/IdeaProjects/functype-mcp-server
pnpm link functype --global
```

**Step 2: Commit version bump if publishing**

```bash
cd /Users/jordanburke/IdeaProjects/functype
git push
```

---

## Phase 2: functype-mcp-server changes

### Task 5: Replace data.ts with thin re-export

**Files:**

- Modify: `/Users/jordanburke/IdeaProjects/functype-mcp-server/src/lib/docs/data.ts`

**Step 1: Replace the entire file**

Replace all contents of `data.ts` with:

```typescript
/**
 * Re-export functype CLI data.
 * Source of truth is functype/src/cli/data.ts — no duplication needed.
 */

export { CATEGORIES, FULL_INTERFACES, INTERFACES, TYPES, VERSION } from "functype/cli"
export type { InterfaceData, TypeData } from "functype/cli"
```

**Step 2: Verify it compiles**

Run: `cd /Users/jordanburke/IdeaProjects/functype-mcp-server && pnpm typecheck`
Expected: PASS (or errors from full-interfaces.ts imports — handled in next task)

**Step 3: Commit**

```bash
cd /Users/jordanburke/IdeaProjects/functype-mcp-server
git add src/lib/docs/data.ts
git commit -m "refactor: import CLI data from functype/cli instead of duplicating"
```

### Task 6: Delete full-interfaces.ts and update imports

**Files:**

- Delete: `/Users/jordanburke/IdeaProjects/functype-mcp-server/src/lib/docs/full-interfaces.ts`
- Modify: `/Users/jordanburke/IdeaProjects/functype-mcp-server/src/lib/docs/formatters.ts:8`
- Modify: `/Users/jordanburke/IdeaProjects/functype-mcp-server/src/index.ts:6`

**Step 1: Delete full-interfaces.ts**

```bash
rm /Users/jordanburke/IdeaProjects/functype-mcp-server/src/lib/docs/full-interfaces.ts
```

**Step 2: Update formatters.ts import**

In `formatters.ts`, change line 8 from:

```typescript
import { FULL_INTERFACES } from "./full-interfaces"
```

to:

```typescript
import { FULL_INTERFACES } from "./data"
```

(Since `data.ts` now re-exports `FULL_INTERFACES` from functype/cli)

**Step 3: Update index.ts import**

In `src/index.ts`, change line 6 from:

```typescript
import { FULL_INTERFACES } from "./lib/docs/full-interfaces"
```

to:

```typescript
import { FULL_INTERFACES } from "./lib/docs/data"
```

**Step 4: Verify it compiles**

Run: `cd /Users/jordanburke/IdeaProjects/functype-mcp-server && pnpm typecheck`
Expected: PASS

**Step 5: Commit**

```bash
cd /Users/jordanburke/IdeaProjects/functype-mcp-server
git add -A
git commit -m "refactor: remove duplicated full-interfaces, import from functype/cli"
```

### Task 7: Run full validation

**Step 1: Run tests**

Run: `cd /Users/jordanburke/IdeaProjects/functype-mcp-server && pnpm test`
Expected: All tests pass. The tests import from `formatters.ts` and `data.ts` which now re-export from functype — same data, same behavior.

**Step 2: Run full validation**

Run: `cd /Users/jordanburke/IdeaProjects/functype-mcp-server && pnpm validate`
Expected: PASS (format, lint, typecheck, test, build all green)

**Step 3: Commit any formatting changes**

If `pnpm validate` auto-formats anything:

```bash
cd /Users/jordanburke/IdeaProjects/functype-mcp-server
git add -A
git commit -m "style: formatting"
```

---

## Phase 3: Verify end-to-end

### Task 8: Test MCP server with imported data

**Step 1: Build and run inspector**

Run: `cd /Users/jordanburke/IdeaProjects/functype-mcp-server && pnpm inspect`

**Step 2: Verify tools work**

In the MCP Inspector:

- Call `search_docs` with no query — should return full overview with version number
- Call `get_type_api` with `type_name: "Option"` — should return method categories
- Call `get_interfaces` — should return interface hierarchy
- Call `validate_code` with `const x = Option(42).map(n => n + 1)` — should PASS

**Step 3: Final commit if needed**

```bash
cd /Users/jordanburke/IdeaProjects/functype-mcp-server
git add -A
git commit -m "feat: functype CLI data now imported from functype/cli"
```
