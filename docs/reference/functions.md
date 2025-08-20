# Functions and Effects

**Functions** (`func`) are pure and deterministic, while **effects** (`effect`) interact with the outside world and must declare their capabilities in `uses`.

## Pure functions

```intentlang
func toUpper(s: String): String {
  // no effects
}
```

## Effects with dependencies

```intentlang
effect now(): DateTime uses clock {
  clock.now()
}
```

Dependencies (e.g., `clock` above) are injected when generating TypeScript code.

## Contracts (`requires` / `ensures`)

Functions and effects may declare **contracts** to document and validate assumptions.

```intentlang
func add(a: Int, b: Int): Int requires a > 0 ensures a + b > 0 {
  return a + b;
}
```

- `requires <expr>` runs at the start and aborts if false.
- `ensures <expr>` runs before each `return`.
- Expressions must return `Bool` and only use variables in scope.

In the TypeScript output, contracts become `if` statements that throw `Error` when not satisfied.
