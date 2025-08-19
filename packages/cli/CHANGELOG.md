## [1.3.0](https://github.com/alessbarb/IntentLang/compare/@il/cli-v1.2.0...@il/cli-v1.3.0) (2025-08-19)

### Features

- **cli:** add --max-errors and align global help ([52fda6b](https://github.com/alessbarb/IntentLang/commit/52fda6b3d11e619503d4610c39bd5d12850ab403))
- **cli:** allow globs and directories in 'check' inputs; validate existence only for non-globs ([fbf9965](https://github.com/alessbarb/IntentLang/commit/fbf996590bca02571b53c241e89155162901773e))
- **cli:** implement 'ilc check --watch' with 200ms debounce, globbing and cached parse; Ctrl+C exits 0 ([1402705](https://github.com/alessbarb/IntentLang/commit/1402705e94ab3ec4ba094b4fbd8aa2825e46e5f8))
- **cli:** split into commands (check|build|test), add --strict/--json and strict-aware exit codes; migrate to NodeNext ESM with .js specifiers ([eacd38b](https://github.com/alessbarb/IntentLang/commit/eacd38bf3726dbda189a09aac754b9af0a82cedd))

### Bug Fixes

- **core:** export .js for ESM runtime; keep types to .d.ts ([5ebfd44](https://github.com/alessbarb/IntentLang/commit/5ebfd44a20578ac70f71b6a05d387fc4a4a902a3))

## [1.2.0](https://github.com/alessbarb/IntentLang/compare/@il/cli-v1.1.0...@il/cli-v1.2.0) (2025-08-19)

### Features

- **cli:** add json output for check ([de56051](https://github.com/alessbarb/IntentLang/commit/de5605127862966c76b6e13cc802e9c47ec40960))

* **cli:** `ilc check --watch` with debounce (200ms), globbing, cached parse; support `--max-errors`; Ctrl+C exits 0.

# CHANGELOG

## [1.1.0](https://github.com/alessbarb/IntentLang/compare/@il/cli-v1.0.0...@il/cli-v1.1.0) (2025-08-19)

### Features

- **cli:** add robust check command ([5418a7d](https://github.com/alessbarb/IntentLang/commit/5418a7d55646f3db75905ce4fa69933ba4bb7a53))

## 1.0.2 (2025-08-19)

### Features

- **cli:** add `--json` flag to `check` for machine-readable diagnostics

## 1.0.1 (2025-08-19)

### Fixes

- **cli:** return exit code `2` for missing files or unknown flags in `ilc check`

## 1.0.0 (2025-08-19)

### Features

- **cli:** improve CLI entrypoint and command wiring ([86d21ba](https://github.com/alessbarb/IntentLang/commit/86d21ba9320b62c7df111b65e73559b8ffbe8e0f))
- **cli:** improve CLI entrypoint and extend tests ([441e0c2](https://github.com/alessbarb/IntentLang/commit/441e0c25032606a1777058d6290bc471572d989c))
- **core:** extend AST, type checker, lexer/parser and TS transpiler ([9e26a50](https://github.com/alessbarb/IntentLang/commit/9e26a50270ee40fe0fcecc7b961a39fc2d71cd05))
- **core:** improve parser and checker; refine TS transpiler and index exports ([882fab5](https://github.com/alessbarb/IntentLang/commit/882fab556f62c356f495760f760922b5dabe5fbf))
- **core:** refine checker, parser and TypeScript transpiler ([3a9da41](https://github.com/alessbarb/IntentLang/commit/3a9da411693a2e8958cb7ccc154d28f08ee973ea))
- **transpiler:** bind match pattern fields ([bc84040](https://github.com/alessbarb/IntentLang/commit/bc8404051de4d04148e9c867bb0a67ae9f0234e2))
