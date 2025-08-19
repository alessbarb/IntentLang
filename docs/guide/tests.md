# Pruebas

IntentLang permite definir bloques de pruebas con la palabra clave `test`.
Cada prueba puede invocar funciones o efectos existentes y se ejecuta a través de la CLI.

```intentlang
func add(a: Int, b: Int): Int {
  return a + b;
}

test add_works {
  let sum = add(2, 3);
  // assertions vendrán en futuras versiones
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
