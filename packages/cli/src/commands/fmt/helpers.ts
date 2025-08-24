/**
 * Qué cubre y qué no (ahora mismo)
 *
 * Cubre:
 * - intent, tags, uses, types, type (record/union/generic/func/array/map/brand/literal),
 * - func/effect/test (firma, contratos, uses en effect),
 * - block/stmt (let/const/assign/update/return/if/match/for/while/try/catch/expr),
 * - exprs: literales, id, obj/arr/map, call/member/index, unary/binary, cond,
 *   Ok/Err/Some/None, brand, variant, match-expr, lambda, y patrones.
 *
 * Aun no cubre:
 * - imports/exports (tu AST todavía no los modela). Puedes dejarlos para el pase textual
 *   o añadirlos al AST y te adapto el printer en nada.
 */

import fs from "node:fs";
import { parse, formatProgram } from "@intentlang/core";
// Si el core expone pretty-printer, mejor usarlo:
// import { formatProgram } from "@intentlang/core";
import type { FmtFlags, FmtResult } from "./types.js";

/**
 * Entrada unificada: si `src` es string, formatea; si no, devuelve el mismo.
 * Aquí reunimos las reglas de organización (imports/exports) y el pretty-print.
 */
export function formatSource(src: string, flags: FmtFlags): string {
  const ast = parse(src);
  // De momento, imports/exports no están en el AST.
  // Si quieres seguir organizándolos, puedes hacerlo ANTES o DESPUÉS
  // de formatear (textual), pero aquí mantenemos sólo AST-first:
  const pretty = formatProgram(ast, {
    width: flags.width ?? 80,
    indent: 2,
    trailingCommas: true,
  });
  return pretty;
}

/** Ordena bloques imports/exports de forma textual (fallback sin AST). */
function organizeImportsTextual(src: string): string {
  const re = /imports\s*\{([\s\S]*?)\}/m;
  const m = re.exec(src);
  if (!m) return src;
  const body = m[1];
  const lines = body
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  // agrupa por "from X.Y: ..."
  const entries = lines
    .join(" ")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/\s+/g, " "));
  const normalized = entries.map((e) => {
    // from a.b: items
    const mm = /^from\s+([A-Za-z_][\w.]*?)\s*:\s*(.*?)$/.exec(e);
    if (!mm) return e;
    const mod = mm[1];
    const items = mm[2]
      .replace(/\s*,\s*;/g, ";")
      .replace(/;$/, "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    // separamos "* as alias" de nombrados
    const star = items.filter((x) => /^\*\s+as\s+/.test(x)).sort();
    const named = items
      .filter((x) => !/^\*\s+as\s+/.test(x))
      .map((x) => {
        const m2 = /^([A-Za-z_]\w*)(?:\s+as\s+([A-Za-z_]\w*))?$/.exec(x);
        if (!m2) return { pub: x, raw: x };
        const pub = m2[2] ?? m2[1];
        return { pub, raw: m2[2] ? `${m2[1]} as ${m2[2]}` : m2[1] };
      })
      .sort((a, b) => a.pub.localeCompare(b.pub))
      .map((x) => x.raw);

    const itemsOut = [...star, ...named].join(", ") + ", ";
    return { mod, out: `from ${mod}: ${itemsOut};` };
  });

  const ordered = normalized
    .filter((x: any) => typeof x === "object")
    .sort((a: any, b: any) => a.mod.localeCompare(b.mod))
    .map((x: any) => x.out);

  return src.replace(re, `imports {\n  ${ordered.join("\n  ")}\n}`);
}

function organizeExportsTextual(src: string): string {
  const re = /exports\s*\{([\s\S]*?)\}/m;
  const m = re.exec(src);
  if (!m) return src;
  const body = m[1];

  // separa groups y items sueltos
  const entries = body
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  const groups: Record<string, string[]> = {
    func: [],
    effect: [],
    type: [],
    const: [],
  };

  for (const e of entries) {
    // group: kind: a, b as c,
    const mg = /^(func|effect|type|const)\s*:\s*(.*)$/i.exec(e);
    if (mg) {
      const kind = mg[1] as keyof typeof groups;
      const items = mg[2]
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
      groups[kind].push(...items);
      continue;
    }
    // item: kind name [as alias]
    const mi =
      /^(func|effect|type|const)\s+([A-Za-z_]\w*)(?:\s+as\s+([A-Za-z_]\w*))?$/i.exec(
        e,
      );
    if (mi) {
      const kind = mi[1] as keyof typeof groups;
      const raw = mi[3] ? `${mi[2]} as ${mi[3]}` : mi[2];
      groups[kind].push(raw);
    }
  }

  // orden por nombre público
  const sortByPub = (arr: string[]) =>
    arr
      .map((x) => {
        const m = /^([A-Za-z_]\w*)(?:\s+as\s+([A-Za-z_]\w*))?$/.exec(x);
        const pub = m?.[2] ?? m?.[1] ?? x;
        return { pub, raw: x };
      })
      .sort((a, b) => a.pub.localeCompare(b.pub))
      .map((x) => x.raw);

  const order: (keyof typeof groups)[] = ["func", "effect", "type", "const"];
  const lines: string[] = [];
  for (const k of order) {
    if (groups[k].length === 0) continue;
    const items = sortByPub(groups[k]).join(", ") + ", ";
    lines.push(`${k}: ${items};`);
  }

  return src.replace(re, `exports {\n  ${lines.join("\n  ")}\n}`);
}

/** Pretty printer mínimo (textual). Para producción, muévelo al core con AST. */
function prettyPrintTextual(src: string, opts: { width: number }): string {
  let out = src;

  // normaliza llaves de bloque: `} else {`
  out = out.replace(/\}\s*\n\s*else\s*\{/g, "} else {");

  // indent básico 2 espacios en bloques { ... }
  // (para una versión robusta usa AST; aquí mantenemos simple)
  out = out
    .split("\n")
    .map((s) => s.replace(/\t/g, "  "))
    .join("\n");

  // espacio tras comas y alrededor de :
  out = out.replace(/,\s*/g, ", ").replace(/\s*:\s*/g, ": ");

  // ; finales únicos
  out = out.replace(/;;+/g, ";");

  // trim de espacios finales de línea
  out = out.replace(/[ \t]+$/gm, "");

  // línea en blanco única entre secciones mayores
  out = out.replace(/\n{3,}/g, "\n\n");

  return out;
}

export function formatFile(pathname: string, flags: FmtFlags): FmtResult {
  const src = fs.readFileSync(pathname, "utf8");
  const formatted = formatSource(src, flags);
  const changed = formatted !== src;
  if (changed && flags.write) fs.writeFileSync(pathname, formatted, "utf8");
  return { path: pathname, changed };
}

export async function formatFromStdin(flags: FmtFlags): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const c of process.stdin)
    chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c));
  const src = Buffer.concat(chunks).toString("utf8");
  return formatSource(src, flags);
}
