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

## Comentarios

- `//` para comentarios de una línea.
- `/* ... */` para bloques.
