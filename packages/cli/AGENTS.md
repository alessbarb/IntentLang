# AGENTS.md — Guía del paquete **CLI** (`ilc`)

**Ámbito**: binario, parsing de flags, reporting humano/JSON, códigos de salida y UX.

## Principios

- **UX clara**: mensajes cortos, accionables y con rutas normalizadas.
- **Salida dual**: humana por defecto y `--json` para máquinas.
- **Códigos estables**: `0` ok, `1` fallos lógicos, `2` uso/flags/config.

## Subcomandos esperados

- `check` `build` `test` `fmt` `inspect` `goldens (run|update)` `doctor` `init` `targets` `cache`.

## Reglas de implementación

- **Flags globales**: `--strict`, `--json`, `--watch`, `--seed-rng`, `--seed-clock`.
- **Diagnósticos**: imprimidos con snippet y caret; en `--json` como array `diags[]` + `status`.
- **Watch**: _debounce_ de 100–300 ms, limpieza de pantalla opcional.
- **Globs**: expándelos de forma cross‑platform; soporta `-` para `stdin`.
- **Help**: `ilc --help` y `<cmd> --help` con ejemplos.
- **Sin telemetría**: nada de red por defecto.

## Checklist de PR (CLI)

- [ ] Subcomando/flag documentado en `--help`.
- [ ] Reporters humano/JSON coherentes y testeados.
- [ ] `exitCode` correcto en escenarios de error.
- [ ] E2E con fixtures `.il` y snapshots (incluye casos de `stdin`).
- [ ] Cross‑platform (Windows paths) probado.

## Errores CLI (ILC04xx)

- **ILC0401**: flag desconocido / combinación inválida.
- **ILC0402**: archivo no encontrado o patrón vacío.
- **ILC0403**: config inválida.
