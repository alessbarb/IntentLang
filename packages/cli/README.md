# @il/cli

Command-line interface for IntentLang. The `ilc` binary can typecheck and transpile
`.il` files to TypeScript.

## Usage

```bash
pnpm --filter @il/cli ilc check path/to/file.il
pnpm --filter @il/cli ilc build path/to/file.il --target ts --out dist
```

The `--seed-rng` and `--seed-clock` flags make runs deterministic.

## Development

```bash
pnpm --filter @il/cli build    # compile TypeScript
pnpm --filter @il/cli test     # run unit tests
```
