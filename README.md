# IntentLang

Early experiment for IntentLang (IL) with a minimal parser, checker, and TypeScript transpiler.

```intentlang
uses { random: Random { } }

func add(a: Int, b: Int): Int
  requires a >= 0 && b >= 0
  ensures _ >= a && _ >= b
{ return a + b; }

test add_works { let r = random.int(); }
```

## Deterministic runs

`ilc` can produce reproducible outputs by seeding its runtime:

```bash
pnpm --filter @intentlang/cli ilc test file.il --seed-rng 1 --seed-clock 0
pnpm --filter @intentlang/cli ilc build file.il --seed-rng 1 --seed-clock 0
```

`--seed-rng` fixes the pseudo‑random generator; `--seed-clock` sets the initial time returned by the runtime clock.
