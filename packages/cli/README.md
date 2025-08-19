# @il/cli

Command-line interface for IntentLang. The `ilc` binary can typecheck and transpile
`.il` files to TypeScript.

## Usage

```bash
pnpm --filter @il/cli ilc check path/to/file.il
pnpm --filter @il/cli ilc build path/to/file.il --target ts --out dist
```

`ilc check` prints `OK` when the file typechecks, exits with code `1` on
diagnostics, and `2` for usage errors (missing file or unknown flag).
Use `--strict` to treat warnings as errors. Pass `--json` to emit machine-
readable diagnostics:

```bash
ilc check path/to/file.il --json
# {"status":"ok","diags":[]}
```

The `--seed-rng` and `--seed-clock` flags make runs deterministic.

## Development

```bash
pnpm --filter @il/cli build    # compile TypeScript
pnpm --filter @il/cli test     # run unit tests
```
