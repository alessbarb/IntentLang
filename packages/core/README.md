# @intentlang/core

Core libraries for **IntentLang**: parser, AST, type checker, transpiler, and
runtime helpers used by the CLI.

## Usage

```ts
import { parse, check } from "@intentlang/core";
```

## `for` loops

The language provides a `for` statement to iterate over any iterable:

```intentlang
for x in [1, 2, 3] { }
```

It transpiles to `for…of` in TypeScript and to a regular `for` loop in Python.

---

## Development

### Build & Test

```bash
pnpm --filter @intentlang/core build    # compile TypeScript
pnpm --filter @intentlang/core test     # run unit tests
```

### When to run `pnpm run generate`

Run `pnpm run generate` after modifying the grammar or generation scripts. It
regenerates ANTLR artifacts and verifies that any `*.manual.ts` files remain
unchanged, aborting if they differ.

Once generation completes, run the test suite. `generation.spec.ts` checks that
every grammar rule has a corresponding `visitX` method and context node in the
generated sources. Failing tests indicate the grammar and generated files are
out of sync.

Skipping this step risks committing stale parser code or overwriting manual
patches, leading to confusing build or runtime errors.

### Grammar Workflow (EBNF → ANTLR → TS)

The grammar is maintained in **EBNF** (`grammar/intentlang.ebnf`) as the single
source of truth.

1. **Generate ANTLR grammar (`.g4`)**

```bash
pnpm --filter @intentlang/core run generate:g4
```

Creates `grammar/intentlang.g4`.

2. **Generate TypeScript parser/lexer/visitor**

```bash
pnpm --filter @intentlang/core run generate:antlr
```

Runs `antlr4ts-cli` and writes outputs under `src/generated/grammar/`.
Then `scripts/patch-antlr-esm.mjs` post-processes:

- Adds `.js` to relative imports (NodeNext/ESM).
- Fixes deep imports: `antlr4ts/foo` → `antlr4ts/foo.js`.
- Replaces `tryGetToken` → `getToken` (compat with `antlr4ts@0.5.0-alpha.4`).
- Applies `import type` where required.
- Forces `Token` and `ParserRuleContext` to be imported as **values**, not types.

3. **Build**

```bash
pnpm --filter @intentlang/core build
```

💡 Shortcut:

```bash
pnpm --filter @intentlang/core run generate:all
```

---

### Pipeline Diagram

```mermaid
flowchart LR
  A[EBNF\n(grammar/intentlang.ebnf)]
  B[ANTLR Grammar (.g4)\n(grammar/intentlang.g4)]
  C[antlr4ts-cli\nParser/Lexer/Visitor TS]
  D[Patch Script\nscripts/patch-antlr-esm.mjs]
  E[Generated ESM TS\nsrc/generated/grammar/*]
  F[TS Build\n(dist/*)]

  A -- pnpm generate:g4 --> B
  B -- pnpm generate:antlr --> C
  C -- outputs --> E
  E -- post-process --> D
  D -- fixes imports & types --> E
  E -- tsc --> F
```

---

### Quick Reference

- **Source of truth:** `grammar/intentlang.ebnf`
- **ANTLR grammar:** `grammar/intentlang.g4` (auto-generated, do not edit)
- **Generated code:** `src/generated/grammar/*`
- **Patch script:** `scripts/patch-antlr-esm.mjs`

---

## Troubleshooting TypeScript

- **TS1484 — “X is a type and must be imported using a type-only import”**
  Cause: `verbatimModuleSyntax: true` + type import missing `import type`.
  ✅ Solution: re-run generation; the patch adds `import type` automatically.

- **TS1361 — “Cannot use 'Token'/'ParserRuleContext' as a value because it was imported using 'import type'”**
  Cause: those two are used as runtime values (`Token.EOF`, `new ParserRuleContext(...)`).
  ✅ Solution: the patch forces them to normal (value) imports; regenerate.

- **Missing ANTLR submodules (e.g. `antlr4ts/tree/ParseTreeVisitor`)**
  Cause: missing `.js` extension under NodeNext.
  ✅ Solution: the patch appends `.js`. Example:

  ```ts
  import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor.js";
  ```

---

## Troubleshooting ANTLR (parser/lexer)

### Common messages and quick fixes

- **`error(50): '"' came as a complete surprise to me`**
  Use single quotes for char literals in ANTLR:
  `"A".."Z" → 'A'..'Z'`, `"_” → '_'`. Strings still use `"` in the `STRING` rule.

- **`imbalanced {} or missing }`**
  EBNF operators must be rewritten for ANTLR:
  `{ X } → ( X )*`, `[ X ] → ( X )?`.

- **`mismatched input '<EOF>' expecting SEMI`**
  Every rule (parser/lexer) must end with `;`.

- **Left recursion in expressions**
  Refactor to a precedence ladder:
  `assignment → or → and → equality → relational → additive → multiplicative → unary → primary`.

- **IDENT vs keyword conflicts**
  Define keywords **before** `IDENT` in the lexer.

- **Ambiguities / unreachable alternatives**
  Factor common prefixes, e.g.
  `A: 'if' expr ('else' expr)?;`

- **Comments/whitespace swallowing tokens**
  Ensure `WS`, `LINE_COMMENT`, `BLOCK_COMMENT` use `-> skip`.
  Prefer non-greedy `.*?` in block comments.

- **Token collisions**
  Don’t define identical lexemes in multiple token rules.

- **Case sensitivity**
  ANTLR is case-sensitive; normalize or provide variants if needed.

### Debugging checklist

1. Missing `;` at end of a rule?
2. Any `{}` / `[]` from EBNF left? Replace with `()*` / `()?`.
3. Char literals in single quotes?
4. Keywords before `IDENT`?
5. No left recursion in expressions?
6. Balanced braces/parentheses?
7. Try verbose messages:

   ```bash
   npx antlr4ts-cli -visitor -long-messages -o ./src/generated/grammar ./grammar/intentlang.g4
   ```

---

## Useful Scripts

- Regenerate everything and build:

```bash
pnpm --filter @intentlang/core run generate:all && pnpm --filter @intentlang/core build
```

- Only regenerate ANTLR and patch:

```bash
pnpm --filter @intentlang/core run generate:antlr
```

- Only regenerate `.g4` from EBNF:

```bash
pnpm --filter @intentlang/core run generate:g4
```
