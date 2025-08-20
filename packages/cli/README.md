# @il/cli

Command-line interface for IntentLang. The `ilc` binary can typecheck and transpile
`.il` files to TypeScript.

## Usage

```bash
pnpm --filter @il/cli ilc check path/to/file.il
pnpm --filter @il/cli ilc build path/to/file.il --target ts --out dist
# Watch mode (revalidate on save)
pnpm --filter @il/cli ilc check "src/**/*.il" --watch --max-errors 50
# Read from stdin
cat path/to/file.il | pnpm --filter @il/cli ilc check -
```

`ilc check` prints `OK` when the file typechecks, exits with code `1` on
diagnostics, and `2` for usage errors (missing file or unknown flag).
Use `--strict` to treat warnings as errors. Pass `--json` to emit machine-
readable diagnostics:

```bash
ilc check path/to/file.il --json
# New shape (preferred):
# {
#   "kind": "check",
#   "meta": { "strict": false },
#   "counts": { "errors": 0, "warnings": 0 },
#   "diagnostics": [],
#   "status": "ok",           // legacy-compat
#   "diags": [],              // legacy-compat
#   "exitCode": 0
# }
```

The `--seed-rng` and `--seed-clock` flags make runs deterministic.
Use `--watch` to keep the process running and revalidate on file changes. Press **Ctrl+C** to exit (status **0**).

## Development

```bash
pnpm --filter @il/cli build    # compile TypeScript
pnpm --filter @il/cli test     # run unit tests
```
