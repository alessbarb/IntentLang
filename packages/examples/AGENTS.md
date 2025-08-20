# AGENTS.md — Examples & Goldens

**Scope**: canonical `.il` examples, `.ts` golden files, comparison runner and TS prelude.

## Principles

- **Public contract** of the transpiler: goldens define the expected output.
- **Determinism**: shared header/prelude; no dates or randomness without a seed.
- **Parity**: each `*.il` has a corresponding `goldens/*.ts` file.

## Structure

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
    payment.ts
    invoice.ts
    notification.ts
  scripts/
    goldens.mjs
```

## Flow to add/update an example

1. Create a minimal, readable `<feature>.il`.
2. Run `ilc build <feature>.il --target ts` to see the output.
3. Copy the output plus `_prelude.ts` to the matching golden file.
4. Run `ilc goldens run`.
5. If intentional, accept changes with `ilc goldens update --only <feature>` and open a PR.

## PR checklist (Examples)

- [ ] Idiomatic `.il` example with brief comments.
- [ ] Golden updated and valid (compiles as TS).
- [ ] No external dependencies; only the prelude.
- [ ] Golden runner passes in CI.

## Best practices

- Consistent names (`Email`, `UserId`, `PaymentId`).
- Exhaustive `match` for union examples.
- Simple inputs and outputs; avoid unnecessary business logic.
