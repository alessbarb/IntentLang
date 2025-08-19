## [1.1.0](https://github.com/alessbarb/IntentLang/compare/v1.0.0...v1.1.0) (2025-08-19)

### Features

* **cli:** add robust check command ([5418a7d](https://github.com/alessbarb/IntentLang/commit/5418a7d55646f3db75905ce4fa69933ba4bb7a53))

# Changelog

## [0.4.0] — 2025-08-19

### Añadido

- **Suites de tests** iniciales para _core_ y _CLI_; incorporación de **unit** y **end-to-end tests**.
- **Guía de testing** y ejemplos en la documentación.
- **Soporte de contratos en funciones** (documentación específica incluida).
- **Documentación** sobre _seeds deterministas_ para RNG y clock.
- Nuevos casos de prueba en _core_: `contracts.test.mjs`, `test-blocks.test.mjs`.

### Cambiado

- **Core**
  - Refinado del **parser** y **checker**.
  - Mejoras en el **transpiler TypeScript**.
  - Ajustes de exportaciones en `runtime/index.ts`.

- **CLI**
  - Mejora del _entrypoint_ y cableado de comandos.
  - Ampliación de los tests del CLI.

- **Workspace**
  - Alineación de `package.json` en raíz y paquetes.
  - Ajustes en `packages/core/tsconfig.json`.
  - Pequeñas mejoras en `packages/examples/package.json`.

- **Docs**
  - Actualización de `STYLEGUIDE.md`, `docs/README.md` y `CHANGELOG.md`.

### Eliminado

- Limpiezas menores en diffs (remociones puntuales derivadas de refactors).

### Notas de migración

- Los tests están en **ESM (`.mjs`)**. Recomendado **Node.js ≥ 20** (idealmente 22) y ejecutar con `vitest`/`node --test` según corresponda.
- Mantener `pnpm-lock.yaml` como _lockfile_ de referencia (no usar `package-lock.json` en subpaquetes).

---

## [0.3.0] — 2025-08-18

### Añadido

- **Configuración de Trunk** y _baseline_ de linters/formatters.
- **Documentación**:
  - `docs/plan.md`, `README.md` y `AGENTS.md`.
  - Guías de contribución y estilo (`CONTRIBUTING.md`, `STYLEGUIDE.md`).

- **Ejemplos** de IntentLang:
  - Ficheros `.il` sincronizados con _golden outputs_ (`invoice_service`, `order_service`, `payment_service`, `user_service`, `notification_service`).

- **Licencia** del proyecto.

### Cambiado

- **Core del lenguaje**
  - Ampliación del **AST**, **checker**, **lexer** y **parser**.
  - Mejoras en el **transpiler a TypeScript**.
  - Revisión de exportaciones en `runtime/index.ts` y en `src/index.ts`.

- **CLI**
  - Mejora del _entrypoint_ y estructura de comandos.

- **Workspace/Build**
  - Alineación de `pnpm-workspace.yaml`, `tsconfig.base.json`, `package.json` de paquetes y `pnpm-lock.yaml`.
  - Refresco de `.gitignore` (añadidos temporales y artefactos).

- **Tests**
  - Migración desde `.mts` a **ESM (`.mjs`)** y reubicación en `packages/core/tests/`.

### Eliminado

- Tests obsoletos en formato `.mts` tras la migración a `.mjs`.

### Notas

- Se establecen bases sólidas para **release notes** y automatización de QA con Trunk.
- Mantener fuera del repo artefactos ignorados (`node_modules/`, salidas de _linters_, temporales en `tmp/`, etc.).

---

## [Unreleased]

### Ideas / Próximos pasos

- Consolidar **contratos** a lo largo de todas las construcciones del lenguaje (parser → checker → transpiler).
- Extender **suites E2E** para CLI (comandos compuestos y _error paths_).
- Documentar _best practices_ para escritura de especificaciones IL + generación de _goldens_.
- Integración con _CI_ para publicar _artifacts_ de ejemplos y _reports_ de cobertura.

---

## Historial y coherencia

- Se adopta **pnpm** como gestor de paquetes del monorepo; `pnpm-lock.yaml` es el _source of truth_.
- Se consolidan **tests** en ESM y estructura homogénea por paquete.
- La documentación se mantiene viva con foco en **ejemplos prácticos**, **contratos** y **guías de testing**.
