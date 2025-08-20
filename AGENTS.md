# AGENTS.md — Guide for IntentLang (IL)

> Living document for automated agents and humans. It describes what you may change, how, and with what guarantees in this monorepo.

## TL;DR

- Work deterministically, safely, and with minimal changes.
- Use `ilc` for everything: `check | build | test | fmt | inspect | goldens`.
- Before opening a PR: update EBNF/lexer/parser together, run golden tests, add tests.
- Never commit secrets or make unapproved network calls. Escalate to a human if unsure.

---

## 1) Repository context

**Main packages:**

- `packages/core` — AST, lexer, parser, checker, transpiler, runtime.
- `packages/cli` — `ilc` command-line tool.
- `packages/examples` — canonical examples and golden outputs (expected TS code).

**Language architecture (summary):**

- AST with `Program` and sections (`intent`, `uses`, `types`) plus top-level items (`func`, `effect`, `test`).
- Total typing with `Option`/`Result` and exhaustive `match`.
- Main transpilation target → TypeScript.

---

## 2) Principles for agents

1. **Determinism first** — use seeds and fixed clock when needed.
2. **Minimal changes** — avoid large refactors without an RFC.
3. **Zero-Fault Authoring** — keep the repo green; new rules need tests or golden updates.
4. **Exhaustiveness** — changes to `match`, `union` or `types` must be covered in checker and goldens.
5. **No surprises** — avoid new dependencies; document flags and error codes.
6. **Privacy and security** — never export code/files to external services.

---

## 3) Scope and limits

**Allowed:**

- Edit code in `core`, `cli`, `examples` following this guide.
- Open small or medium PRs.
- Write/update documentation and goldens.

**Disallowed:**

- Change licenses or privacy policies.
- Introduce remote telemetry.
- Publish releases without human approval.

If a change affects **language semantics** (e.g., new syntax, AST breakage, exhaustiveness rules), open an **RFC** first.

---

## 4) Project tools

Expected `ilc` commands:

```bash
ilc check <files/globs> [--strict] [--json] [--watch] [--max-errors N]
ilc build <files/globs> --target ts|js --out <dir> [--sourcemap] [--watch]
ilc test [--only PATTERN] [--bail] [--reporter json|junit]
ilc fmt <files/globs> [--check]
ilc inspect <tokens|ast|types|diags> <file.il> [--json]
ilc goldens run|update [--only NAME] [--yes]
ilc doctor
```

Node/pnpm helpers:

```bash
pnpm i
pnpm -w build
pnpm -w typecheck
```

Runtime determinism flags: `--seed-rng`, `--seed-clock`.

---

## 5) Standard change flow

### 5.1 Grammar/syntax changes

1. Update the **EBNF** in documentation or README.
2. Modify **lexer** and **parser** together — avoid inconsistent intermediate states.
3. Add **parsing tests** and include `.il` examples.
4. Run `ilc inspect tokens|ast` to validate trees.
5. If it affects the checker/transpiler, follow 5.2/5.3.

### 5.2 Checker changes

1. Add new **diagnostics** with code `ILC000x` and clear message.
2. Implement the rule and cover with unit tests and `.il` examples.
3. If the rule changes expected outputs, update **goldens**.

### 5.3 Transpiler changes

1. Ensure **stable, deterministic output** (order of fields/cases).
2. Add/update relevant goldens in `packages/examples/goldens`.
3. Run `ilc goldens run` and verify diffs.

### 5.4 CLI changes

1. Add the command/flag and its `--help` output.
2. Implement **human** and **JSON** output when applicable.
3. Add E2E tests with `.il` fixtures.

### 5.5 Runtime changes

1. Keep APIs small; document seeds and clock.
2. Cover with unit tests.

---

## 6) PR checklist (required)

Tick what applies before requesting review:

- [ ] `ilc fmt` has no pending changes or passes with `--check`.
- [ ] `ilc check` reports no errors (and no warnings with `--strict` in CI).
- [ ] Unit and E2E tests pass.
- [ ] `ilc goldens run` shows no diffs — or `goldens update` is justified in the description.
- [ ] Documentation updated (README/EBNF/AGENTS if applicable).
- [ ] No unjustified new dependencies.
- [ ] No external calls or secret leakage.

---

## 7) Commit and PR conventions

- **Conventional Commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `perf:`.
- Prefer small PRs with a clear intent.
- Provide a short description with **motivation**, **change**, **risks**, and **how to test**.

PR template:

```md
### Motivation

What problem does it solve? Why now?

### Changes

Short bullet list.

### Risks and mitigations

Impact on parser/checker/transpiler/CLI, flags, backward-compat.

### Tests

Commands run, goldens affected.
```

---

## 8) Diagnostic policy (ILC000x)

- Every public error/warning must have a **unique code**.
- `--explain ILC000x` prints context and a minimal example.
- Avoid ambiguous terms; include position (line/column) and snippet with `^`.

Example categories:

- ILC010x — Lexing/Parser.
- ILC020x — Typing/Exhaustiveness.
- ILC030x — Capabilities/Effects.
- ILC040x — CLI/Flags/Config.

---

## 9) Goldens and examples

- Each `.il` example must have a matching `.ts` **golden**.
- The TS **prelude** for goldens lives in `packages/examples/goldens/_prelude.ts`.
- Use `ilc goldens update --only <name>` to accept deliberate changes.

Suggested example structure:

```tree
packages/examples/
  user.il
  order.il
  payment.il
  invoice.il
  notification.il
  goldens/
    _prelude.ts
    user.ts
    order.ts
    ...
```

---

## 10) Security and privacy

- Do not commit keys, tokens or private paths.
- Do not add telemetry or dependencies that make **network** calls by default.
- If fixtures contain data, **anonymize** it.

Mandatory escalation:

- Changes to license, governance or compliance.
- Network integrations, sandboxing or execution of untrusted code.

---

## 11) Performance and tracing

- Use `ilc --trace` to time `lex|parse|check|emit|write`.
- If a change worsens timings >10% on medium goldens, mention it in the PR and offer alternatives.

---

## 12) AST stability and versioning

- Breaking AST changes → **minor** bump in `@il/core` and migration notes.
- Prefer adding optional nodes/fields over breaking existing ones.
- Document in `CHANGELOG.md` and adjust goldens.

---

## 13) Code style and formatting

- TypeScript ESM, Node ≥20.
- No debug `console.*` in production code.
- `ilc fmt` is the source of truth for `.il` files.

---

## 14) Quick templates for agents

### 14.1 Small parser change

- [ ] Updated EBNF.
- [ ] Changed tokens in `lexer.ts`.
- [ ] Adjusted `parser.ts` and added printer case if needed.
- [ ] Added `.il` example and test.
- [ ] `ilc inspect ast` OK.

### 14.2 New checker rule

- [ ] Added `ILC02xx` code and message.
- [ ] Covered with failing and passing `.il` tests.
- [ ] Updated `--explain` docs.

### 14.3 Transpiler change

- [ ] Deterministic output and ordering.
- [ ] Goldens updated consciously.
- [ ] `ilc goldens run` passes.

---

## 15) Frequently asked questions

**Can I rename public symbols?** — Only with migration notes and a breaking change.

**Can I add dependencies?** — Avoid it. If essential, justify size, security, license and use.

**Can I touch all folders at once?** — Prefer splitting into separate PRs and describe the plan.

---

## 16) Contact and governance

- Maintainers: assign the PR to those in `CODEOWNERS` (if present) or tag `lang-core`, `cli`, `examples` according to area.
- RFCs live in `/rfcs` with a template and a 5 business day comment period.

---

## 17) Final word

Work with intent—small, safe, clear. If something doesn't fit these principles, **stop and ask**. Better a small well-explained PR than a “big improvement” that breaks everything.
