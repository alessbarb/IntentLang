# IntentLang

IntentLang (IL) is an early experiment with a minimal parser, type checker and
TypeScript transpiler.

## Packages

- **`@il/core`** – parser, AST, checker and runtime helpers.
- **`@il/cli`** – command‑line interface `ilc` for checking and building IL
  files.
- **`@intentlang/examples`** – canonical examples and golden tests.

## Getting started

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Run the test and lint suites:
   ```bash
   pnpm lint
   pnpm test
   ```
3. Build all packages:
   ```bash
   pnpm build
   ```

## Quick example

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
pnpm --filter @il/cli ilc test file.il --seed-rng 1 --seed-clock 0
pnpm --filter @il/cli ilc build file.il --seed-rng 1 --seed-clock 0
```

`--seed-rng` fixes the pseudo‑random generator; `--seed-clock` sets the initial
time returned by the runtime clock.
