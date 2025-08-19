# AGENTS.md — Guía del paquete **Examples & Goldens**

**Ámbito**: ejemplos canónicos `.il`, goldens `.ts`, runner de comparaciones y prelude TS.

## Principios

- **Contrato público** del transpiler: los goldens definen la salida esperada.
- **Determinismo**: encabezado/prelude común; sin fechas ni aleatoriedad sin seed.
- **Paridad**: cada `*.il` tiene su `goldens/*.ts` correspondiente.

## Estructura

```tree
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
    payment.ts
    invoice.ts
    notification.ts
  scripts/
    goldens.mjs
```

## Flujo para añadir/actualizar un ejemplo

1. Crear `<feature>.il` minimal y legible.
2. Ejecutar `ilc build <feature>.il --target ts` para ver salida.
3. Copiar salida + `_prelude.ts` al golden equivalente.
4. Correr `ilc goldens run`.
5. Si el cambio es intencional, `ilc goldens update --only <feature>` y abre PR.

## Checklist de PR (Examples)

- [ ] Ejemplo `.il` idiomático y con comentarios breves.
- [ ] Golden actualizado y válido (compila como TS).
- [ ] No usa dependencias externas; solo el prelude.
- [ ] Runner de goldens pasa en CI.

## Buenas prácticas

- Nombres consistentes (`Email`, `UserId`, `PaymentId`).
- `match` exhaustivos en ejemplos de uniones.
- Inputs y outputs simples; evita lógica de negocio innecesaria.
