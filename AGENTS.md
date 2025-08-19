# AGENTS.md — Guía para agentes en IntentLang (IL)

> Documento vivo. Orienta a agentes automatizados y humanos sobre **qué pueden hacer**, **cómo** y **con qué garantías** en este monorepo.

## TL;DR

- Trabaja **determinista**, seguro y con cambios mínimos.
- Usa `ilc` para todo: `check | build | test | fmt | inspect | goldens`.
- Antes de abrir PR: actualiza EBNF/lexer/parser **en conjunto**, ejecuta **goldens**, añade pruebas.
- Nunca subas secretos ni hagas llamadas externas no aprobadas. Si hay dudas —eleva a humana/o.

---

## 1) Contexto del repo

**Paquetes principales**

- `packages/core` — AST, lexer, parser, checker, transpiler, runtime.
- `packages/cli` — CLI `ilc`.
- `packages/examples` — ejemplos canónicos y **goldens** (salida TS esperada).

**Arquitectura del lenguaje** (resumen):

- AST con `Program` + secciones (`intent`, `uses`, `types`) y _top-level items_ (`func`, `effect`, `test`).
- Tipado total con `Option`/`Result`, `match` exhaustivo.
- Transpilación principal → TypeScript.

---

## 2) Principios para agentes

1. **Determinismo primero** — usa semillas y reloj fijo cuando corresponda.
2. **Cambios mínimos** — evita refactors masivos sin RFC.
3. **Contrato ZFA** (Zero‑Fault Authoring) — no dejes el repo en rojo: si introduces una regla, añade test o golden.
4. **Exhaustividad** — si tocas `match`, `union` o `types`, asegúrate de coberturas en checker y goldens.
5. **Sin sorpresas** — no añadas dependencias sin justificar; documenta flags y códigos de error.
6. **Privacidad y seguridad** — no exportes código/ficheros a servicios externos.

---

## 3) Alcance y límites

**Puede**

- Editar código en `core`, `cli`, `examples` siguiendo esta guía.
- Abrir PRs con cambios pequeños o medianos.
- Escribir/actualizar documentación y goldens.

**No puede**

- Cambiar licencias o políticas de privacidad.
- Introducir telemetría remota.
- Publicar versiones o crear releases sin aprobación humana.

Si el cambio afecta **semántica del lenguaje** (p. ej., sintaxis nueva, ruptura del AST, reglas de exhaustividad), **abre una RFC** antes.

---

## 4) Herramientas del proyecto

Comandos `ilc` esperados (algunos pueden vivir tras flags si aún no existen):

```bash
ilc check <files/globs> [--strict] [--json] [--watch] [--max-errors N]
ilc build <files/globs> --target ts|js --out <dir> [--sourcemap] [--watch]
ilc test [--only PATTERN] [--bail] [--reporter json|junit]
ilc fmt <files/globs> [--check]
ilc inspect <tokens|ast|types|diags> <file.il> [--json]
ilc goldens run|update [--only NAME] [--yes]
ilc doctor
```

Utilidades de Node/pnpm:

```bash
pnpm i
pnpm -w build
pnpm -w typecheck
```

Flags de determinismo (runtime): `--seed-rng`, `--seed-clock`.

---

## 5) Flujo estándar de cambios

### 5.1 Cambios en gramática/sintaxis

1. Actualiza la **EBNF** en documentación (o sección README correspondiente).
2. Modifica **lexer** y **parser** en conjunto —evita estados intermedios incoherentes.
3. Añade **tests** de parsing e incluye ejemplos `.il`.
4. Ejecuta `ilc inspect tokens|ast` para validar árboles.
5. Si afecta al checker/transpiler, sigue los flujos 5.2/5.3.

### 5.2 Cambios en checker

1. Añade nuevos **diagnósticos** con código `ILC000x` y mensaje claro.
2. Implementa la regla y cubre con tests unitarios y ejemplos `.il`.
3. Si la regla cambia salidas esperadas, actualiza **goldens**.

### 5.3 Cambios en transpiler

1. Garantiza **salida estable** y determinista (orden de campos/casos).
2. Añade/actualiza goldens relevantes en `packages/examples/goldens`.
3. Ejecuta `ilc goldens run` y verifica diffs.

### 5.4 Cambios en CLI

1. Añade el comando/flag y su ayuda (`--help`).
2. Implementa salida **humana** y **JSON** si aplica.
3. Añade tests E2E con fixtures `.il`.

### 5.5 Cambios en runtime

1. Mantén APIs pequeñas; documenta seeds y reloj.
2. Cubre con tests unitarios.

---

## 6) Checklist de PR (obligatorio)

Marca todo lo que aplique antes de pedir revisión:

- [ ] `ilc fmt` sin cambios pendientes o `--check` limpio.
- [ ] `ilc check` sin errores —y sin _warnings_ si `--strict` se usa en CI.
- [ ] Tests unitarios y E2E pasan.
- [ ] `ilc goldens run` sin diffs —o `goldens update` justificado en la descripción.
- [ ] Documentación actualizada (README/EBNF/AGENTS.md si aplica).
- [ ] Sin dependencias nuevas no justificadas.
- [ ] Sin llamadas externas ni exposición de secretos.

---

## 7) Convenciones de commits y PRs

- **Conventional Commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `perf:`.
- Prefiere PRs pequeños, con una intención clara.
- Descripción breve con **motivación**, **cambio**, **riesgos** y **cómo probar**.

Plantilla de PR:

```md
### Motivo

¿Qué problema resuelve? ¿Por qué ahora?

### Cambios

Lista corta con bullets.

### Riesgos y mitigaciones

Impacto en parser/checker/transpiler/CLI, flags, backward-compat.

### Pruebas

Comandos ejecutados, goldens afectados.
```

---

## 8) Política de diagnósticos (ILC000x)

- Todo mensaje de error/aviso público debe tener un **código único**.
- `--explain ILC000x` imprime contexto y ejemplo mínimo.
- Evita términos ambiguos; incluye posición (línea/columna) y _snippet_ con `^`.

Ejemplos de categorías:

- ILC010x — Léxico/Parser.
- ILC020x — Tipado/Exhaustividad.
- ILC030x — Capacidades/Efectos.
- ILC040x — CLI/Flags/Config.

---

## 9) Goldens y ejemplos

- Cada ejemplo `.il` debe tener su **golden** `.ts` equivalente.
- El **prelude** TS para goldens vive en `packages/examples/goldens/_prelude.ts`.
- Usa `ilc goldens update --only <name>` para aceptar cambios deliberados.

Estructura sugerida de ejemplo:

```
packages/examples/
  user.il
  order.il
  payment.il
  invoice.il
  notification.il
  goldens/
    _prelude.ts
    user.ts
    order.ts
    ...
```

---

## 10) Seguridad y privacidad

- No subas llaves, tokens ni rutas privadas.
- No agregues telemetría ni dependencias que hagan **red** por defecto.
- Si necesitas _fixtures_ con datos, **anonimiza**.

Escalada obligatoria:

- Cambios de licencia, gobernanza o _compliance_.
- Integraciones de red, sandbox o ejecución de código no confiable.

---

## 11) Rendimiento y trazas

- Usa `ilc --trace` para cronometrar `lex|parse|check|emit|write`.
- Si un cambio empeora tiempos >10% en goldens medianos, coméntalo en el PR y aporta alternativa.

---

## 12) Estabilidad del AST y versionado

- Cambios que rompen AST → **minor** en `@il/core` y nota de migración.
- Añadir nodos/campos opcionales es preferible a romper campos existentes.
- Documenta en `CHANGELOG.md` y ajusta goldens.

---

## 13) Estilo de código y formato

- TypeScript ESM, Node ≥20.
- Sin `console.*` de depuración en código de producción.
- `ilc fmt` es fuente de verdad para `.il`.

---

## 14) Plantillas rápidas para agentes

### 14.1 Cambio pequeño en parser

- [ ] Actualicé EBNF.
- [ ] Cambié tokens en `lexer.ts`.
- [ ] Ajusté `parser.ts` y añadí caso al _printer_ si aplica.
- [ ] Añadí ejemplo `.il` y test.
- [ ] `ilc inspect ast` OK.

### 14.2 Nueva regla de checker

- [ ] Añadí código `ILC02xx` y mensaje.
- [ ] Cobertura con test `.il` que falla y otro que pasa.
- [ ] Actualicé docs `--explain`.

### 14.3 Cambio en transpiler

- [ ] Salida ordenada y determinista.
- [ ] Goldens actualizados conscientemente.
- [ ] `ilc goldens run` pasa.

---

## 15) Preguntas frecuentes (para agentes)

**¿Puedo renombrar símbolos públicos?** — Solo con migración y nota de ruptura.

**¿Puedo añadir dependencias?** — Evítalo. Si es imprescindible, justifica: tamaño, seguridad, licencia, uso.

**¿Puedo tocar todas las carpetas a la vez?** — Mejor no. Divide por PRs y describe el plan.

---

## 16) Contacto y gobernanza

- Mantainers: asigna el PR a quienes figuren en `CODEOWNERS` (si existe) o etiqueta `lang-core`, `cli`, `examples` según el área.
- Las RFCs se abren en `/rfcs` con plantilla y tiempo de comentarios de 5 días laborables.

---

## 17) Última palabra

Trabaja con intención —pequeño, seguro, claro. Si algo no encaja con estos principios, **para y consulta**. Mejor un PR pequeño bien explicado que una “gran mejora” que rompa todo.
