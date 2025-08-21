# @intentlang/cli

Command-line interface for IntentLang. The `intent` binary can typecheck and transpile
`.il` files to TypeScript.

## Usage

```bash
pnpm --filter @intentlang/cli intent check path/to/file.il
pnpm --filter @intentlang/cli intent build path/to/file.il --target ts --out dist
# Watch mode (revalidate on save)
pnpm --filter @intentlang/cli intent check "src/**/*.il" --watch --max-errors 50
# Read from stdin
cat path/to/file.il | pnpm --filter @intentlang/cli intent check -
```

`intent check` prints `OK` when the file typechecks, exits with code `1` on
diagnostics, and `2` for usage errors (missing file or unknown flag).
Use `--strict` to treat warnings as errors. Pass `--json` to emit machine-
readable diagnostics:

```bash
intent check path/to/file.il --json
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
pnpm --filter @intentlang/cli build    # compile TypeScript
pnpm --filter @intentlang/cli test     # run unit tests
```
