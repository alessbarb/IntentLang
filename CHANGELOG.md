## [1.5.0](https://github.com/alessbarb/IntentLang/compare/v1.4.0...v1.5.0) (2025-08-20)

### Features

* **examples:** export IL to TS dataset ([3eed159](https://github.com/alessbarb/IntentLang/commit/3eed15991723e3d910daf05fede2d1169bd6ab55))

## [1.4.0](https://github.com/alessbarb/IntentLang/compare/v1.3.0...v1.4.0) (2025-08-20)

### Features

* **cli:** truncate error output ([7c21094](https://github.com/alessbarb/IntentLang/commit/7c2109497d5da77fd688c7bc880015aad5fa79a5))

## [Unreleased]

### Features

- **runtime:** add `Fixed2` brand type and `fixed2Mul` helper.
- **cli:** limit printed errors with `--max-errors` and show truncation summary.
- **cli:** expand globs cross-platform and exit `2` when no files match.

## [1.3.0](https://github.com/alessbarb/IntentLang/compare/v1.2.0...v1.3.0) (2025-08-19)

### Features

- **cli:** add --max-errors and align global help ([52fda6b](https://github.com/alessbarb/IntentLang/commit/52fda6b3d11e619503d4610c39bd5d12850ab403))
- **cli:** allow globs and directories in 'check' inputs; validate existence only for non-globs ([fbf9965](https://github.com/alessbarb/IntentLang/commit/fbf996590bca02571b53c241e89155162901773e))
- **cli:** implement 'ilc check --watch' with 200ms debounce, globbing and cached parse; Ctrl+C exits 0 ([1402705](https://github.com/alessbarb/IntentLang/commit/1402705e94ab3ec4ba094b4fbd8aa2825e46e5f8))

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
