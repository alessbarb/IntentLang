# IntentLang

Early experiment for IntentLang (IL) with a minimal parser, checker, and TypeScript transpiler.

## Deterministic runs

`ilc` can produce reproducible outputs by seeding its runtime:

```bash
pnpm --filter @intentlang/cli ilc test file.il --seed-rng 1 --seed-clock 0
pnpm --filter @intentlang/cli ilc build file.il --seed-rng 1 --seed-clock 0
```

`--seed-rng` fixes the pseudo‑random generator; `--seed-clock` sets the initial time returned by the runtime clock.
