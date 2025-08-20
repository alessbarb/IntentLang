# Basic Syntax

An `.il` file must follow this order of sections:

1. `intent` – describes the service and its tags.
2. `uses` – declares external capabilities.
3. `types` – defines domain types.
4. `func` – pure functions.
5. `effect` – functions with effects.

Minimal example:

```intentlang
intent "Ping" tags ["demo"]

uses {
  clock: Clock {}
}

types {
  type Ping = { at: DateTime };
}

effect sendPing(): Result<Ping, String> uses clock {
  // implementation pending
}
```

## Contracts

Before the body, functions and effects may declare optional contract clauses:

```intentlang
func add(a: Int, b: Int): Int requires a > 0 ensures a + b > 0 {
  return a + b;
}
```

- `requires` validates a precondition.
- `ensures` checks a postcondition before each `return`.

If any fail, the execution throws an `Error` in the generated code.

## Comments

- `//` for single-line comments.
- `/* ... */` for blocks.
