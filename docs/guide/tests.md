# Pruebas

IntentLang permite definir bloques de pruebas con la palabra clave `test`.
Cada prueba puede invocar funciones o efectos existentes y se ejecuta a través de la CLI.

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
  // asserts vendrán en futuras versiones
}
```

Ejecuta las pruebas con:

```bash
pnpm --filter @il/cli ilc test archivo.il
```

Para resultados reproducibles, fija las semillas del RNG y del reloj:

```bash
pnpm --filter @il/cli ilc test archivo.il --seed-rng 1 --seed-clock 0
```
