# Canonical Examples & Golden Tests

This directory contains the **canonical examples** for IntentLang (IL). Each subdirectory represents a specific domain or feature and serves as a reference implementation for writing idiomatic IL code.

---

## The Role of Goldens

This directory is intrinsically linked to the `/goldens` folder **inside this package**:
`packages/examples/goldens/`.

- For every `<feature>.il` file here, there is a corresponding `<feature>.ts` file in `packages/examples/goldens/`.
- This `.ts` file is the **"golden" reference output** — the exact, expected TypeScript code that the `ilc` transpiler should generate.

These examples and their golden outputs act as a **snapshot test suite** for the transpiler. They form a contract that ensures any changes to the compiler do not introduce unintended regressions.

## How It Works in CI

The test suite is run automatically in our Continuous Integration (CI) pipeline via the command:

```bash
pnpm test:goldens
```

This command transpiles every `.il` file here and compares the output against its corresponding golden file. If there is any difference, the test fails.

## Adding a New Example

To add a new canonical example and its golden test:

1.  Create a new subdirectory (e.g., `packages/examples/new_feature/`).
2.  Add your `new_feature.il` file inside it.
3.  Run the golden test suite in **update mode**, filtering for your new file:
    ```bash
    pnpm test:goldens:update --only new_feature
    ```
4.  This will generate the initial `.ts` golden file in the `/goldens` directory.
5.  Commit both the new `.il` file and its generated `.ts` golden in `packages/examples/goldens/`.

## Current Examples

- **add.il**: muestra `test`, contratos y capacidades con semillas.
- **/user/**: Basic CRUD operations, brands, and records.
- **/order/**: Usage of multiple capabilities (`http`, `clock`, `random`).
- **/invoice/**: Complex record structures and multiple pure `func` helpers.
- **/payment/**: Union types with exhaustive `match` expressions.
- **/notification/**: Union types for multi-channel dispatch.

## Development

```bash
pnpm --filter @intentlang/examples test:goldens      # run golden tests
pnpm --filter @intentlang/examples test:goldens:update --only <name>  # update
```
