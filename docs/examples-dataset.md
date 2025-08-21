# Example Dataset Export

This document describes how to gather IntentLang (`.il`) examples and their TypeScript goldens into a reusable dataset.

## 1. Compile missing goldens

Run the CLI for any example lacking a `goldens/<name>.ts` file:

```bash
pnpm --filter @intentlang/cli intent build packages/examples/<name>.il --target ts
```

If the file transpiles successfully, copy the output to `packages/examples/goldens/<name>.ts`.

## 2. Generate the dataset

The dataset is generated during the workspace build. Run:

```bash
pnpm -w build
```

This writes `{source_il, transpiled_ts, ast}` triples to `packages/examples/dataset.jsonl`. Entries without goldens are skipped and files that fail to parse will have `ast: null`.

To regenerate just the dataset after other packages are built, run:

```bash
pnpm --filter @intentlang/entlang/examples build
```

## 3. Next steps

The dataset can be fed to downstream tooling or model training. Regenerate it after updating examples or goldens.
