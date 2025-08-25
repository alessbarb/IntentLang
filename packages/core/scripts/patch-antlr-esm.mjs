#!/usr/bin/env node
/**
 * Patch ANTLR TS outputs for TS NodeNext + verbatimModuleSyntax:
 * 1) Añade ".js" a imports/exports relativos sin extensión.
 * 2) Añade ".js" a cualquier submódulo de antlr4ng: `antlr4ng/<X>` -> `antlr4ng/<X>.js`.
 * 3) Reemplaza `tryGetToken(` -> `getToken(` (compat con antlr4ng 0.5.0-alpha.4).
 * 4) Convierte a `import type` los imports que son solo tipos (antlr4ng y locales).
 * 5) Fuerza `Token` y `ParserRuleContext` a ser import **de valor** (no type).
 *
 * Uso: node ./scripts/patch-antlr-esm.mjs ./src/_generated
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.argv[2] || "./src/_generated";

// ---- Config ----
const TYPE_ONLY_NAMES = new Set([
  // antlr4ng que sí son solo tipos en los generados
  "CharStream",
  "TokenStream",
  "Vocabulary",
  "ParseTreeVisitor",
  "ParseTreeListener",
  "TerminalNode",
  "ParseTree",
  // locales generados (interfaces)
  "IntentLangParserListener",
  "IntentLangParserVisitor",
]);
// ¡OJO! Estos dos se usan como valores:
const FORCE_VALUE_IMPORT = new Set(["Token", "ParserRuleContext"]);

// ---- Helpers ----
const isRelative = (p) => p.startsWith("./") || p.startsWith("../");
const hasExt = (p) => /\.[cm]?[tj]sx?$/.test(p);

const IMPORT_FROM = /(from\s+["'])([^"']+)(["'])/g; // import ... from "x"
const EXPORT_FROM = /(export\s+[^;]*\s+from\s+["'])([^"']+)(["'])/g; // export ... from "x"

// ---- Patches ----
function patchRelativeSpecifiers(src) {
  const addJsRel = (_m, a, p, b) =>
    !isRelative(p) || hasExt(p) ? `${a}${p}${b}` : `${a}${p}.js${b}`;
  return src.replace(IMPORT_FROM, addJsRel).replace(EXPORT_FROM, addJsRel);
}

function patchAntlrDeepImports(src) {
  return src.replace(
    /(from\s+["'])antlr4ng\/([^"']+?)(["'])/g,
    (_m, a, sub, b) => `${a}antlr4ng/${hasExt(sub) ? sub : sub + ".js"}${b}`,
  );
}

function patchTryGetToken(src) {
  return src.replace(/\btryGetToken\(/g, "getToken(");
}

function patchTypeOnlyImports(src) {
  // a) antlr4ng y submódulos: si TODOS son tipos conocidos -> import type
  src = src.replace(
    /(^|\n)\s*import\s*\{\s*([^}]+)\s*\}\s*from\s*["'](antlr4ng(?:\/[^"']+)?)["'];?/g,
    (full, lead, names, spec) => {
      const list = names
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (list.every((n) => TYPE_ONLY_NAMES.has(n))) {
        return `${lead}import type { ${list.join(", ")} } from "${spec}";`;
      }
      return full;
    },
  );

  // b) locales relativos listener/visitor -> type
  src = src.replace(
    /(^|\n)\s*import\s*\{\s*(IntentLangParserListener|IntentLangParserVisitor)\s*\}\s*from\s*["'](\.\/[^"']+)["'];?/g,
    (full, lead, name, spec) =>
      `${lead}import type { ${name} } from "${spec}";`,
  );

  return src;
}

// Paso FINAL: garantizar que Token/ParserRuleContext NO quedan como import type
function patchForceValueImports(src) {
  // Cualquier import type {...} que contenga Token o ParserRuleContext -> import {...}
  return src.replace(
    /(^|\n)\s*import\s+type\s*\{\s*([^}]+)\s*\}\s*from\s*["']([^"']+)["'];?/g,
    (full, lead, names, spec) => {
      const arr = names
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (arr.some((n) => FORCE_VALUE_IMPORT.has(n))) {
        return `${lead}import { ${names} } from "${spec}";`;
      }
      return full;
    },
  );
}

function patchContent(src) {
  let out = src;
  out = patchRelativeSpecifiers(out);
  out = patchAntlrDeepImports(out);
  out = patchTryGetToken(out);
  out = patchTypeOnlyImports(out);
  out = patchForceValueImports(out); // <- importante
  return out;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.isFile() && full.endsWith(".ts")) {
      const src = fs.readFileSync(full, "utf8");
      const out = patchContent(src);
      if (out !== src) fs.writeFileSync(full, out, "utf8");
    }
  }
}

walk(ROOT);
console.log(`Patched ANTLR outputs under ${ROOT}`);
