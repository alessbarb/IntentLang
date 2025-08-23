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

### Grammar Workflow (EBNF → ANTLR → TS)

The grammar is maintained in **EBNF** (`grammar/IntentLang.ebnf`) as the single
source of truth. Regenerate parser and AST helpers with:

```bash
pnpm --filter @intentlang/core run generate
```

This command:

1. Converts `grammar/IntentLang.ebnf` to `grammar/IntentLang.g4`.
2. Runs `antlr4ts` and outputs to `src/generated/grammar`.
3. Applies `scripts/patch-antlr-esm.mjs` on the generated files.
4. Regenerates `visitor.gen.ts` and `nodes.gen.ts`.
5. Formats results using `intent fmt`.

After generation, compile TypeScript with:

```bash
pnpm --filter @intentlang/core build
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

  A -- pnpm generate --> B
  B -- pnpm generate --> C
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

- Regenerate grammar, parser and AST helpers:

```bash
pnpm --filter @intentlang/core run generate
```
