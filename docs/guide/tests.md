# Testing

IntentLang lets you define test blocks using the `test` keyword. Each test may call existing functions or effects and is executed through the CLI.

```intentlang
uses { random: Random { } }

func add(a: Int, b: Int): Int
  requires a >= 0 && b >= 0
  ensures _ >= a && _ >= b
{ return a + b; }

effect rollDie(): Int uses random { }

test deterministic {
  let sum = add(2, 3);
  let r1 = rollDie();
  let r2 = rollDie();
  // assertions will come in future versions
}
```

Run tests with:

```bash
pnpm --filter @il/cli ilc test file.il
```

For reproducible results, fix RNG and clock seeds:

```bash
pnpm --filter @il/cli ilc test file.il --seed-rng 1 --seed-clock 0
```
