# Funciones y efectos

Las **funciones** (`func`) son puras y deterministas, mientras que los **efectos** (`effect`) interactúan con el exterior y deben declarar sus capacidades en `uses`.

## Funciones puras

```intentlang
func toUpper(s: String): String {
  // sin efectos
}
```

## Efectos con dependencias

```intentlang
effect now(): DateTime uses clock {
  clock.now()
}
```

Las dependencias (`clock` en el ejemplo) se resuelven por inyección al generar el código TypeScript.
