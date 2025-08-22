## [1.12.0](https://github.com/alessbarb/IntentLang/compare/v1.11.0...v1.12.0) (2025-08-22)

### Features

* **core:** add match guards ([39cb16e](https://github.com/alessbarb/IntentLang/commit/39cb16e9b8c8c2ade3a8360dfff2539da2a797b0))

## [1.11.0](https://github.com/alessbarb/IntentLang/compare/v1.10.0...v1.11.0) (2025-08-21)

### ⚠ BREAKING CHANGES

* **cli:** Introduces ilconfig.json and a new stdlib package for intrinsic functions. The CLI now reads configuration from files.

### Features

* **cli:** add config loading and stdlib package ([eafee5b](https://github.com/alessbarb/IntentLang/commit/eafee5bcae6c0eaccfaf59014a5641b1aaefddc1))
* **core:** add for/in keywords to lexer ([c6ed6eb](https://github.com/alessbarb/IntentLang/commit/c6ed6eb8ea0c55c665ef9ce5f77598d4f22d76ca))
* **core:** emit for loops in python transpiler ([2344032](https://github.com/alessbarb/IntentLang/commit/23440329be47dfc6b5cdc11b56c05b1b4130fe92))
* **core:** transpile for-of statements ([8fad488](https://github.com/alessbarb/IntentLang/commit/8fad48879038caa154d377c50ab7b89ac90a786d))
* extend python transpiler for new operators ([359e5a4](https://github.com/alessbarb/IntentLang/commit/359e5a43d36bf05a76c45d005af9051ceb336d35))

### Bug Fixes

* formats and error in package name ([132729c](https://github.com/alessbarb/IntentLang/commit/132729c3b57f3a45800d1ab0ef68bb934cf64091))
* handle refinements and for loop tests ([a51007a](https://github.com/alessbarb/IntentLang/commit/a51007a33fcb00cd762d290ffae4a7234bdc31b9))

### Refactors

* **core:** align transpilers and simplify AST handling ([6674bca](https://github.com/alessbarb/IntentLang/commit/6674bca6a4594f1e3e51c4b6471e36386102ecd4))

## [Unreleased]

### Features

- **core:** add match guards to `match` expressions.

### Docs

- document diagnostic codes and message templates.

### Tests

- add golden tests for human and JSON diagnostic output.

## [1.10.0](https://github.com/alessbarb/IntentLang/compare/v1.9.0...v1.10.0) (2025-08-20)

### Features

- **cli:** implement rich diagnostic reporter ([6af8b39](https://github.com/alessbarb/IntentLang/commit/6af8b39dfb07a966ca9a61681c858e95427893ae)), closes [#21](https://github.com/alessbarb/IntentLang/issues/21)
- **core:** introduce centralized diagnostics system ([b1117ea](https://github.com/alessbarb/IntentLang/commit/b1117eadcdd5a56fabf08bfe698f10f4614e0803))

### Refactors

- **cli:** reorganize command structure and output handling ([b235909](https://github.com/alessbarb/IntentLang/commit/b235909e80ea9d0ed543abb7f92f2a3edff53aab))
- **cli:** reorganize command structure and output handling ([eeac117](https://github.com/alessbarb/IntentLang/commit/eeac117eabfc89a57568c92aa3e5445c91478ddf))

## [1.9.0](https://github.com/alessbarb/IntentLang/compare/v1.8.0...v1.9.0) (2025-08-20)

### Features

- **core:** add Python transpiler and export from core index ([b3d00c6](https://github.com/alessbarb/IntentLang/commit/b3d00c654d2f99b0dad487a91cb90d28292ed389))

### Refactors

- **examples:** split examples into intentlang and goldens (ts/py); add datasets and export script ([8f80e45](https://github.com/alessbarb/IntentLang/commit/8f80e45e30801ca97d45c5e8966e1a5e81ed682f))

## [1.8.0](https://github.com/alessbarb/IntentLang/compare/v1.7.0...v1.8.0) (2025-08-20)

### Features

- implement example function bodies ([2932687](https://github.com/alessbarb/IntentLang/commit/2932687214e209c5987e94c2489295007f2675ba))

## [1.7.0](https://github.com/alessbarb/IntentLang/compare/v1.6.0...v1.7.0) (2025-08-20)

### Features

- **core:** extend parser and checker with new constructs ([01899fc](https://github.com/alessbarb/IntentLang/commit/01899fcf6dc6aa2bc2dced7607e4c9f9c60e40fe))
- **examples:** update dataset export script and example intent ([86e5bad](https://github.com/alessbarb/IntentLang/commit/86e5badb8daf0ab089ad4a5662706ca9bca9f2d7))

## [1.6.0](https://github.com/alessbarb/IntentLang/compare/v1.5.0...v1.6.0) (2025-08-20)

### Features

- **cli:** cross-platform globbing ([db48ba6](https://github.com/alessbarb/IntentLang/commit/db48ba68ec576e657f9da7f67e3530b36c56a1b4))

## [1.5.0](https://github.com/alessbarb/IntentLang/compare/v1.4.0...v1.5.0) (2025-08-20)

### Features

- **examples:** export IL to TS dataset ([3eed159](https://github.com/alessbarb/IntentLang/commit/3eed15991723e3d910daf05fede2d1169bd6ab55))

## [1.4.0](https://github.com/alessbarb/IntentLang/compare/v1.3.0...v1.4.0) (2025-08-20)

### Features

- **cli:** truncate error output ([7c21094](https://github.com/alessbarb/IntentLang/commit/7c2109497d5da77fd688c7bc880015aad5fa79a5))

## [Unreleased]

### Features

- **runtime:** add `Fixed2` brand type and `fixed2Mul` helper.
- **cli:** limit printed errors with `--max-errors` and show truncation summary.
- **cli:** expand globs cross-platform and exit `2` when no files match.

## [1.3.0](https://github.com/alessbarb/IntentLang/compare/v1.2.0...v1.3.0) (2025-08-19)

### Features

- **cli:** add --max-errors and align global help ([52fda6b](https://github.com/alessbarb/IntentLang/commit/52fda6b3d11e619503d4610c39bd5d12850ab403))
- **cli:** allow globs and directories in 'check' inputs; validate existence only for non-globs ([fbf9965](https://github.com/alessbarb/IntentLang/commit/fbf996590bca02571b53c241e89155162901773e))
- **cli:** implement 'intent check --watch' with 200ms debounce, globbing and cached parse; Ctrl+C exits 0 ([1402705](https://github.com/alessbarb/IntentLang/commit/1402705e94ab3ec4ba094b4fbd8aa2825e46e5f8))

## [1.2.0](https://github.com/alessbarb/IntentLang/compare/v1.1.0...v1.2.0) (2025-08-19)

### Features

- **cli:** add json output for check ([de56051](https://github.com/alessbarb/IntentLang/commit/de5605127862966c76b6e13cc802e9c47ec40960))
- **cli:** split into commands (check|build|test), add --strict/--json and strict-aware exit codes; migrate to NodeNext ESM with .js specifiers ([eacd38b](https://github.com/alessbarb/IntentLang/commit/eacd38bf3726dbda189a09aac754b9af0a82cedd))

### Bug Fixes

- **core:** export .js for ESM runtime; keep types to .d.ts ([5ebfd44](https://github.com/alessbarb/IntentLang/commit/5ebfd44a20578ac70f71b6a05d387fc4a4a902a3))

## [1.1.0](https://github.com/alessbarb/IntentLang/compare/v1.0.0...v1.1.0) (2025-08-19)

### Features

- **cli:** add robust check command ([5418a7d](https://github.com/alessbarb/IntentLang/commit/5418a7d55646f3db75905ce4fa69933ba4bb7a53))

# Changelog

## [0.4.0] — 2025-08-19

### Added

- Initial **test suites** for core and CLI, including unit and end-to-end tests.
- **Testing guide** and examples in the documentation.
- **Function contracts** support with dedicated docs.
- **Documentation** on deterministic seeds for RNG and clock.
- New core tests: `contracts.test.mjs`, `test-blocks.test.mjs`.

### Changed

- **Core**
  - Refined **parser** and **checker**.
  - Improvements to the **TypeScript transpiler**.
  - Export tweaks in `runtime/index.ts`.

- **CLI**
  - Better entrypoint and command wiring.
  - Expanded CLI tests.

- **Workspace**
  - Aligned root and package `package.json` files.
  - Adjusted `packages/core/tsconfig.json`.
  - Minor improvements to `packages/examples/package.json`.

- **Docs**
  - Updated `STYLEGUIDE.md`, `docs/README.md`, and `CHANGELOG.md`.

### Removed

- Minor diff cleanups from refactors.

### Migration notes

- Tests use **ESM (`.mjs`)**. Recommend **Node.js ≥ 20** (ideally 22) and run with `vitest`/`node --test`.
- Keep `pnpm-lock.yaml` as the reference lockfile; do not use `package-lock.json` in subpackages.

---

## [0.3.0] — 2025-08-18

### Added

- **Trunk** configuration and baseline for linters/formatters.
- **Documentation**:
  - `docs/plan.md`, `README.md`, and `AGENTS.md`.
  - Contribution and style guides (`CONTRIBUTING.md`, `STYLEGUIDE.md`).

- **IntentLang examples**:
  - `.il` files synced with golden outputs (`invoice_service`, `order_service`, `payment_service`, `user_service`, `notification_service`).

- Project **license**.

### Changed

- **Language core**
  - Expanded **AST**, **checker**, **lexer**, and **parser**.
  - Improvements to the **TypeScript transpiler**.
  - Export review in `runtime/index.ts` and `src/index.ts`.

- **CLI**
  - Improved entrypoint and command structure.

- **Workspace/Build**
  - Aligned `pnpm-workspace.yaml`, `tsconfig.base.json`, package `package.json` files, and `pnpm-lock.yaml`.
  - Refreshed `.gitignore` with temporaries and artifacts.

- **Tests**
  - Migrated from `.mts` to **ESM (`.mjs`)** and relocated to `packages/core/tests/`.

### Removed

- Obsolete `.mts` tests after migration to `.mjs`.

### Notes

- Established solid groundwork for **release notes** and QA automation with Trunk.
- Keep ignored artifacts (`node_modules/`, linter outputs, temporaries in `tmp/`, etc.) out of the repo.

---

## [Unreleased]

### Ideas / Next steps

- Consolidate **contracts** across all language constructs (parser → checker → transpiler).
- Extend **E2E suites** for CLI (composite commands and error paths).
- Document **best practices** for writing IL specs and generating goldens.
- Integrate with CI to publish example artifacts and coverage reports.

---

## History and coherence

- The monorepo uses **pnpm**; `pnpm-lock.yaml` is the source of truth.
- Tests are consolidated in ESM with a uniform structure per package.
- Documentation stays alive with a focus on **practical examples**, **contracts**, and **testing guides**.
