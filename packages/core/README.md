# @intentlang/core

Core libraries for IntentLang: parser, AST, type checker, transpiler and
runtime helpers used by the CLI.

## Usage

```ts
import { parse, check } from "@intentlang/coreang/core";
```

## `for` loops

The language offers a `for` statement to iterate over any iterable.

```intentlang
for x in [1, 2, 3] { }
```

It transpiles to `for…of` in TypeScript and a `for` loop in Python.

## Development

```bash
pnpm --filter @intentlang/coreang/core build    # compile TypeScript
pnpm --filter @intentlang/coreang/core test     # run unit tests
```
