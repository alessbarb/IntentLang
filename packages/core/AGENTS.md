# AGENTS.md — Core Package Guide

Refer first to the [repository-wide guide](../../AGENTS.md). This file adds rules specific to the core package.

**Scope**: AST, lexer, parser, checker, transpilers, runtime and public `index.ts`.

## Principles

- **Determinism**: outputs must be stable, independent of clock or RNG (seed the runtime).
- **Single source of truth**: the **AST** defines language capabilities; syntax, types and semantics changes start here.
- **Compatibility**: evolve with additive changes; breaking changes require migration notes and a minor version bump.
- **Exhaustiveness**: `match` and union types must be fully covered in the checker and goldens.

## Package responsibilities

- **`ast.ts`**: node contracts and spans. Keep **version comments** (v0.x) and optional fields for growth.
- **`lexer.ts`**: tokens, comments, numbers (int/float), strings. No production logs.
- **`parser.ts`**: recursive grammar, blocks, patterns. No side effects.
- **`checker.ts`**: symbols, internal types, exhaustiveness rules and capabilities. Emit **ILC02xx/ILC03xx**.
- **`transpilers/typescript.ts`**: IL→TS deterministic mapping; inline minimal prelude; fixed property order.
- **`runtime/`**: deterministic primitives (`initRuntime`, RNG, clock). Tiny and stable.

## Change flow

1. **Design**: if it affects semantics or syntax → open an RFC.
2. **AST**: add nodes/optional fields; avoid breaking existing ones when possible.
3. **Lexer/Parser**: add tokens and rules together; include error and recovery tests.
4. **Checker**: create/use new `ILC000x` codes; write messages with snippet and caret.
5. **Transpiler**: ensure determinism and stable ordering; adjust goldens.
6. **Runtime**: document any new primitive.

## PR checklist (Core)

- [ ] `pnpm -w build` passes.
- [ ] `intent check` on examples (if touched) passes.
- [ ] Tests for lexer/parser/checker/transpiler added.
- [ ] `intent goldens run` passes (or justified `update`).
- [ ] New intent codes documented and `--explain` updated.
- [ ] No `console.*` or new dependencies without justification.

## Suggested diagnostic codes

- **ILC010x**: lexing/parsing (unexpected token, unterminated string, etc.).
- **ILC020x**: typing/exhaustiveness (non-exhaustive match, incompatible types).
- **ILC030x**: capabilities/effects (effect used in pure context, undeclared capability).

## Performance

- Measure with `--trace`; avoid >10% regressions on medium examples. Explain cause/mitigation if it occurs.
