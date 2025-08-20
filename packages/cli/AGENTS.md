# AGENTS.md — CLI Package (`ilc`)

**Scope**: binary, flag parsing, human/JSON reporting, exit codes and UX.

## Principles

- **Clear UX**: short actionable messages with normalized paths.
- **Dual output**: human by default and `--json` for machines.
- **Stable codes**: `0` success, `1` logical failures, `2` usage/flags/config errors.

## Expected subcommands

`check` `build` `test` `fmt` `inspect` `goldens (run|update)` `doctor` `init` `targets` `cache`

## Implementation rules

- **Global flags**: `--strict`, `--json`, `--watch`, `--seed-rng`, `--seed-clock`.
- **Diagnostics**: printed with snippet and caret; in `--json` mode as `diags[]` + `status`.
- **Watch mode**: 100–300 ms debounce, optional screen clearing.
- **Globs**: cross-platform expansion; support `-` for `stdin`.
- **Help**: `ilc --help` and `<cmd> --help` with examples.
- **No telemetry**: no network usage by default.

## PR checklist (CLI)

- [ ] Subcommand/flag documented in `--help`.
- [ ] Human/JSON reporters consistent and tested.
- [ ] Correct `exitCode` for error scenarios.
- [ ] E2E tests with `.il` fixtures and snapshots (include `stdin`).
- [ ] Cross-platform paths (Windows) checked.

## CLI errors (ILC04xx)

- **ILC0401**: unknown flag or invalid combination.
- **ILC0402**: file not found or empty pattern.
- **ILC0403**: invalid config.
