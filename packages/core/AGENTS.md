# AGENTS.md — Guía del paquete **Core**

**Ámbito**: AST, lexer, parser, checker, transpiler(s), runtime y `index.ts` público.

## Principios

- **Determinismo**: salidas estables, sin dependencia del reloj ni RNG (usa semillas del runtime).
- **Fuente única de verdad**: el **AST** define capacidades del lenguaje; cualquier cambio en sintaxis, tipos o semántica empieza allí.
- **Compatibilidad**: evoluciona con cambios _aditivos_; las rupturas requieren nota de migración y `minor` bump.
- **Exhaustividad**: `match` y uniones deben tener cobertura total en checker y goldens.

## Responsabilidades del paquete

- **`ast.ts`**: contratos de nodos y spans. Mantén **comentarios de versión** (v0.x) y _fields_ opcionales para crecer.
- **`lexer.ts`**: tokens, comentarios, números (int/float), strings. No _logs_ en producción.
- **`parser.ts`**: gramática recursiva, bloques, patrones. Sin efectos laterales.
- **`checker.ts`**: símbolos, tipos internos, reglas de exhaustividad y capacidades. Emite **ILC02xx/ILC03xx**.
- **`transpilers/typescript.ts`**: mapeo IL→TS determinista; prelude mínimo inline; orden fijo de propiedades.
- **`runtime/`**: primitivos deterministas (`initRuntime`, RNG, clock). Super pequeño y estable.

## Flujo de cambio

1. **Diseño**: si afecta semántica/sintaxis → abre RFC.
2. **AST**: añade nodos/campos opcionales; no rompas existentes si puedes evitarlo.
3. **Lexer/Parser**: añade tokens y reglas juntas; incluye tests de error y recuperación.
4. **Checker**: crea/usa códigos **ILC000x** nuevos; redacta mensajes con snippet y caret.
5. **Transpiler**: garantiza idempotencia y orden estable; ajusta goldens.
6. **Runtime**: documenta cualquier nueva primitiva.

## Checklist de PR (Core)

- [ ] `pnpm -w build` sin errores.
- [ ] `ilc check` a repo de ejemplos (si aplica) sin errores.
- [ ] Tests de lexer/parser/checker/transpiler añadidos.
- [ ] `ilc goldens run` sin diffs (o `update` justificado).
- [ ] Nuevos códigos ILC documentados y `--explain` actualizado.
- [ ] Sin `console.*` ni dependencias nuevas sin justificación.

## Códigos de diagnóstico sugeridos

- **ILC010x**: léxico/parsing (token inesperado, string sin cierre, etc.).
- **ILC020x**: tipos/exhaustividad (match no exhaustivo, tipos incompatibles).
- **ILC030x**: capacidades/efectos (uso en contexto puro, capability no declarada).

## Rendimiento

- Mide con `--trace`; evita regresiones >10% en ejemplos medianos. Si sucede, explica causa/mitigación.
