# Sintaxis básica

Un archivo `.il` debe seguir este orden de secciones:

1. `intent` – describe el servicio y sus etiquetas.
2. `uses` – declara capacidades externas.
3. `types` – define tipos de dominio.
4. `func` – funciones puras.
5. `effect` – funciones con efectos.

Ejemplo mínimo:

```intentlang
intent "Ping" tags ["demo"]

uses {
  clock: Clock {}
}

types {
  type Ping = { at: DateTime };
}

effect sendPing(): Result<Ping, String> uses clock {
  // implementación pendiente
}
```

## Contratos

Antes del cuerpo, las funciones y efectos pueden declarar cláusulas de contrato opcionales:

```intentlang
func add(a: Int, b: Int): Int requires a > 0 ensures a + b > 0 {
  return a + b;
}
```

- `requires` valida una precondición.
- `ensures` verifica una postcondición antes de cada `return`.

Si alguna falla, la ejecución arroja un `Error` en el código generado.

## Comentarios

- `//` para comentarios de una línea.
- `/* ... */` para bloques.
