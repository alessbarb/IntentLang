# Example Dataset Export

This document describes how to gather IntentLang (`.il`) examples and their TypeScript goldens into a reusable dataset.

## 1. Compile missing goldens

Run the CLI for any example lacking a `goldens/<name>.ts` file:

```bash
pnpm --filter @il/cli ilc build packages/examples/<name>.il --target ts
```

If the file transpiles successfully, copy the output to `packages/examples/goldens/<name>.ts`.

## 2. Generate the dataset

Use the helper script to export `{source_il, transpiled_ts, ast}` triples in JSON Lines format:

```bash
node packages/examples/scripts/export-dataset.mjs
```

This creates `packages/examples/dataset.jsonl` with one JSON object per line. Entries without goldens are skipped and files that fail to parse will have `ast: null`.

## 3. Next steps

The dataset can be fed to downstream tooling or model training. Regenerate it after updating examples or goldens.
