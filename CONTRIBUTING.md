# Contributing to IntentLang

👋 Welcome! Thank you for contributing to **IntentLang (IL)**.  
This document explains how to set up your environment, follow the code style, and validate changes with the **goldens test suite**.

---

## 1. Project setup

We use **pnpm workspaces**. To bootstrap:

```bash
pnpm install
pnpm build
```

---

## 2. Code style: IntentLang v0.1

IntentLang is designed to be **AI-first** and **error-resistant**.
Please follow these rules when writing `.il` files:

### File order

1. `intent` — purpose + tags
2. `uses` — declared external capabilities (http, clock, random, …)
3. `types` — brands → records → unions
4. `func` — pure helpers (no I/O)
5. `effect` — functions with side effects, must declare `uses`

### Naming

- **Types**: `PascalCase` → `User`, `ApiError`
- **Functions/effects/fields**: `camelCase` → `createUser`, `createdAt`
- **Capabilities**: nouns → `http`, `clock`, `random`
- **Union constructors**: `PascalCase` → `Card {…}`, `Cash {…}`

### Rules

- No `null` or `undefined` — use `Option<T>` or `Result<T,E>`.
- All fallible operations must return `Result<T,E>` with a **typed error**, never a raw string.
- Effects must **always** declare `uses`.
- Records with more than 3 fields → one field per line.
- String literals use **double quotes**.
- Always prefer **brands** (`Email`, `Uuid`) over plain strings for domain types.

---

## 3. Tooling

### CLI

- `ilc check file.il` → parses & checks capabilities/types.
- `ilc build file.il --target ts -o dist` → transpiles IL → TypeScript.

### Goldens test suite

We use goldens as **reference outputs** to ensure the transpiler produces stable TypeScript code.

- Run all tests:

```bash
pnpm test:goldens
```

- Update all goldens after an intentional change:

```bash
pnpm test:goldens:update
```

- Run only a subset of examples (substring or regex):

```bash
pnpm test:goldens --only order
pnpm test:goldens --only "/payment/i"
pnpm test:goldens:update --only notification
```

> ✅ In CI, only `pnpm test:goldens` is run.
> 📝 Use `--update` locally when accepting new transpiler outputs.

---

## 4. Golden dataset

The folder `/goldens` contains reference `.ts` outputs for each example under `packages/examples`.
**Never edit goldens by hand**. They are updated only via:

```bash
pnpm test:goldens:update
```

Examples included:

- User Service
- Order Service
- Invoice Service
- Payment Service
- Notification Service

---

## 5. Contribution workflow

1. **Fork & branch**: create a branch from `main`.
2. **Implement**: make changes in parser, checker, transpiler, or examples.
3. **Check**: run `pnpm build` and `pnpm test:goldens`.
4. **Update goldens (if needed)**: if differences are intentional → `pnpm test:goldens:update`.
5. **Commit**: include both the `.il` changes and updated goldens.
6. **PR**: open a Pull Request with a clear description.

---

## 6. Checklist before commit

- [ ] File order respected (`intent → uses → types → func → effect`).
- [ ] All effects declare their `uses`.
- [ ] All fallible operations return `Result<T,E>` with typed `E`.
- [ ] No unknown types or missing imports.
- [ ] Union types use named constructors and are matched exhaustively.
- [ ] `pnpm test:goldens` passes with no mismatches.

---

## 7. Questions & discussions

For doubts about **style**, **language evolution**, or **tooling**, open a GitHub Discussion or tag `@maintainers` in your PR.

---

🎉 That’s it! Following this guide ensures IntentLang remains consistent, robust, and contributor-friendly. Thank you for being part of the project!
