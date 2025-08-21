## 1.0.0 (2025-08-21)

### ⚠ BREAKING CHANGES

- **cli:** Introduces ilconfig.json and a new stdlib package for intrinsic functions. The CLI now reads configuration from files.

### Features

- **cli:** add --max-errors and align global help ([52fda6b](https://github.com/alessbarb/IntentLang/commit/52fda6b3d11e619503d4610c39bd5d12850ab403))
- **cli:** add config loading and stdlib package ([eafee5b](https://github.com/alessbarb/IntentLang/commit/eafee5bcae6c0eaccfaf59014a5641b1aaefddc1))
- **cli:** add json output for check ([de56051](https://github.com/alessbarb/IntentLang/commit/de5605127862966c76b6e13cc802e9c47ec40960))
- **cli:** add robust check command ([5418a7d](https://github.com/alessbarb/IntentLang/commit/5418a7d55646f3db75905ce4fa69933ba4bb7a53))
- **cli:** allow globs and directories in 'check' inputs; validate existence only for non-globs ([fbf9965](https://github.com/alessbarb/IntentLang/commit/fbf996590bca02571b53c241e89155162901773e))
- **cli:** cross-platform globbing ([db48ba6](https://github.com/alessbarb/IntentLang/commit/db48ba68ec576e657f9da7f67e3530b36c56a1b4))
- **cli:** implement 'ilc check --watch' with 200ms debounce, globbing and cached parse; Ctrl+C exits 0 ([1402705](https://github.com/alessbarb/IntentLang/commit/1402705e94ab3ec4ba094b4fbd8aa2825e46e5f8))
- **cli:** implement rich diagnostic reporter ([6af8b39](https://github.com/alessbarb/IntentLang/commit/6af8b39dfb07a966ca9a61681c858e95427893ae)), closes [#21](https://github.com/alessbarb/IntentLang/issues/21)
- **cli:** improve CLI entrypoint and command wiring ([86d21ba](https://github.com/alessbarb/IntentLang/commit/86d21ba9320b62c7df111b65e73559b8ffbe8e0f))
- **cli:** improve CLI entrypoint and extend tests ([441e0c2](https://github.com/alessbarb/IntentLang/commit/441e0c25032606a1777058d6290bc471572d989c))
- **cli:** split into commands (check|build|test), add --strict/--json and strict-aware exit codes; migrate to NodeNext ESM with .js specifiers ([eacd38b](https://github.com/alessbarb/IntentLang/commit/eacd38bf3726dbda189a09aac754b9af0a82cedd))
- **cli:** truncate error output ([7c21094](https://github.com/alessbarb/IntentLang/commit/7c2109497d5da77fd688c7bc880015aad5fa79a5))
- **core:** add for/in keywords to lexer ([c6ed6eb](https://github.com/alessbarb/IntentLang/commit/c6ed6eb8ea0c55c665ef9ce5f77598d4f22d76ca))
- **core:** add Python transpiler and export from core index ([b3d00c6](https://github.com/alessbarb/IntentLang/commit/b3d00c654d2f99b0dad487a91cb90d28292ed389))
- **core:** emit for loops in python transpiler ([2344032](https://github.com/alessbarb/IntentLang/commit/23440329be47dfc6b5cdc11b56c05b1b4130fe92))
- **core:** extend AST, type checker, lexer/parser and TS transpiler ([9e26a50](https://github.com/alessbarb/IntentLang/commit/9e26a50270ee40fe0fcecc7b961a39fc2d71cd05))
- **core:** extend parser and checker with new constructs ([01899fc](https://github.com/alessbarb/IntentLang/commit/01899fcf6dc6aa2bc2dced7607e4c9f9c60e40fe))
- **core:** improve parser and checker; refine TS transpiler and index exports ([882fab5](https://github.com/alessbarb/IntentLang/commit/882fab556f62c356f495760f760922b5dabe5fbf))
- **core:** introduce centralized diagnostics system ([b1117ea](https://github.com/alessbarb/IntentLang/commit/b1117eadcdd5a56fabf08bfe698f10f4614e0803))
- **core:** refine checker, parser and TypeScript transpiler ([3a9da41](https://github.com/alessbarb/IntentLang/commit/3a9da411693a2e8958cb7ccc154d28f08ee973ea))
- **core:** transpile for-of statements ([8fad488](https://github.com/alessbarb/IntentLang/commit/8fad48879038caa154d377c50ab7b89ac90a786d))
- **examples:** export IL to TS dataset ([3eed159](https://github.com/alessbarb/IntentLang/commit/3eed15991723e3d910daf05fede2d1169bd6ab55))
- **examples:** update dataset export script and example intent ([86e5bad](https://github.com/alessbarb/IntentLang/commit/86e5badb8daf0ab089ad4a5662706ca9bca9f2d7))
- extend python transpiler for new operators ([359e5a4](https://github.com/alessbarb/IntentLang/commit/359e5a43d36bf05a76c45d005af9051ceb336d35))
- implement example function bodies ([2932687](https://github.com/alessbarb/IntentLang/commit/2932687214e209c5987e94c2489295007f2675ba))
- **transpiler:** bind match pattern fields ([bc84040](https://github.com/alessbarb/IntentLang/commit/bc8404051de4d04148e9c867bb0a67ae9f0234e2))

### Bug Fixes

- **core:** export .js for ESM runtime; keep types to .d.ts ([5ebfd44](https://github.com/alessbarb/IntentLang/commit/5ebfd44a20578ac70f71b6a05d387fc4a4a902a3))
- handle refinements and for loop tests ([a51007a](https://github.com/alessbarb/IntentLang/commit/a51007a33fcb00cd762d290ffae4a7234bdc31b9))

## [1.2.0](https://github.com/alessbarb/IntentLang/compare/@intentlang/core-v1.1.0...@intentlang/core-v1.2.0) (2025-08-20)

### Features

- **cli:** cross-platform globbing ([db48ba6](https://github.com/alessbarb/IntentLang/commit/db48ba68ec576e657f9da7f67e3530b36c56a1b4))
- **cli:** truncate error output ([7c21094](https://github.com/alessbarb/IntentLang/commit/7c2109497d5da77fd688c7bc880015aad5fa79a5))
- **core:** add Python transpiler and export from core index ([b3d00c6](https://github.com/alessbarb/IntentLang/commit/b3d00c654d2f99b0dad487a91cb90d28292ed389))
- **core:** extend parser and checker with new constructs ([01899fc](https://github.com/alessbarb/IntentLang/commit/01899fcf6dc6aa2bc2dced7607e4c9f9c60e40fe))
- **examples:** export IL to TS dataset ([3eed159](https://github.com/alessbarb/IntentLang/commit/3eed15991723e3d910daf05fede2d1169bd6ab55))
- **examples:** update dataset export script and example intent ([86e5bad](https://github.com/alessbarb/IntentLang/commit/86e5badb8daf0ab089ad4a5662706ca9bca9f2d7))
- implement example function bodies ([2932687](https://github.com/alessbarb/IntentLang/commit/2932687214e209c5987e94c2489295007f2675ba))

## [Unreleased]

### Features

- **runtime:** add `Fixed2` brand type and `fixed2Mul` helper.

## [1.1.0](https://github.com/alessbarb/IntentLang/compare/@intentlang/core-v@intentlang/core@intentlang/core-v1.1.0) (2025-08-19)

### Features

- **cli:** add --max-errors and align global help ([52fda6b](https://github.com/alessbarb/IntentLang/commit/52fda6b3d11e619503d4610c39bd5d12850ab403))
- **cli:** add json output for check ([de56051](https://github.com/alessbarb/IntentLang/commit/de5605127862966c76b6e13cc802e9c47ec40960))
- **cli:** add robust check command ([5418a7d](https://github.com/alessbarb/IntentLang/commit/5418a7d55646f3db75905ce4fa69933ba4bb7a53))
- **cli:** allow globs and directories in 'check' inputs; validate existence only for non-globs ([fbf9965](https://github.com/alessbarb/IntentLang/commit/fbf996590bca02571b53c241e89155162901773e))
- **cli:** implement 'intent check --watch' with 200ms debounce, globbing and cached parse; Ctrl+C exits 0 ([1402705](https://github.com/alessbarb/IntentLang/commit/1402705e94ab3ec4ba094b4fbd8aa2825e46e5f8))
- **cli:** split into commands (check|build|test), add --strict/--json and strict-aware exit codes; migrate to NodeNext ESM with .js specifiers ([eacd38b](https://github.com/alessbarb/IntentLang/commit/eacd38bf3726dbda189a09aac754b9af0a82cedd))

### Bug Fixes

- **core:** export .js for ESM runtime; keep types to .d.ts ([5ebfd44](https://github.com/alessbarb/IntentLang/commit/5ebfd44a20578ac70f71b6a05d387fc4a4a902a3))

# CHANGELOG

## 1.0.0 (2025-08-19)

### Features

- **cli:** improve CLI entrypoint and command wiring ([86d21ba](https://github.com/alessbarb/IntentLang/commit/86d21ba9320b62c7df111b65e73559b8ffbe8e0f))
- **cli:** improve CLI entrypoint and extend tests ([441e0c2](https://github.com/alessbarb/IntentLang/commit/441e0c25032606a1777058d6290bc471572d989c))
- **core:** extend AST, type checker, lexer/parser and TS transpiler ([9e26a50](https://github.com/alessbarb/IntentLang/commit/9e26a50270ee40fe0fcecc7b961a39fc2d71cd05))
- **core:** improve parser and checker; refine TS transpiler and index exports ([882fab5](https://github.com/alessbarb/IntentLang/commit/882fab556f62c356f495760f760922b5dabe5fbf))
- **core:** refine checker, parser and TypeScript transpiler ([3a9da41](https://github.com/alessbarb/IntentLang/commit/3a9da411693a2e8958cb7ccc154d28f08ee973ea))
- **transpiler:** bind match pattern fields ([bc84040](https://github.com/alessbarb/IntentLang/commit/bc8404051de4d04148e9c867bb0a67ae9f0234e2))
