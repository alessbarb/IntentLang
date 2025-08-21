# IntentLang

IntentLang (IL) is an early experiment with a minimal parser, type checker and
TypeScript transpiler.

## Packages

- **`@intentlang/core`** – parser, AST, checker and runtime helpers.
- **`@intentlang/cli`** – command‑line interface `intent` for checking and building IL
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
   pnpm -w typecheck
   ```
3. Build all packages:
   ```bash
   pnpm -w build
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

`intent` can produce reproducible outputs by seeding its runtime:

```bash
pnpm --filter @intentlang/cli intent test file.il --seed-rng 1 --seed-clock 0
pnpm --filter @intentlang/cli intent build file.il --seed-rng 1 --seed-clock 0
```

`--seed-rng` fixes the pseudo‑random generator; `--seed-clock` sets the initial
time returned by the runtime clock.

## Documentation

See the [docs](docs/) directory for detailed guides and references, including the
[Quick Start Guide](docs/guide/quickstart.md), the [Testing Guide](docs/guide/tests.md),
the [language reference](docs/reference/syntax.md), and the full [grammar specification](docs/grammar/EBNF.md).
