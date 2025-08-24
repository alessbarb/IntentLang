// compare-normalize.ts
// Normalizadores de línea para emparejar IL ↔ TS sin alterar el render original.

// -------------------- Helpers --------------------
function ilBasicToTs(tok: string): string {
  switch (tok) {
    case "Bool":
      return "boolean";
    case "Int":
    case "Float":
      return "number";
    case "String":
      return "string";
    case "Bytes":
      return "Uint8Array";
    case "Uuid":
      return "string";
    case "DateTime":
      return "Date";
    default:
      return tok;
  }
}

/** Convierte `a: T, b: U` (IL) en `a: T; b: U` (TS-like) con básicos mapeados. */
function normalizeInlineFieldsIL(inner: string): string {
  const parts = inner
    .split(",")
    .map((raw) => raw.trim())
    .filter(Boolean);
  const norm = parts.map((p) => {
    // k: Type [where ...]
    const m = /^([A-Za-z_]\w*)\s*:\s*([^,]+?)\s*(?:where\s+.+)?$/.exec(p);
    if (!m) return p;
    const [, k, ty0] = m;
    const ty = ty0.replace(
      /\b(Bool|Int|Float|String|Bytes|Uuid|DateTime)\b/g,
      (t) => ilBasicToTs(t),
    );
    return `${k}: ${ty}`;
  });
  return norm.join("; ");
}

/** Reemplaza básicos en strings (Map<String,T> → Map<string,T>, etc.) */
function replaceBasicsEverywhereIL(s: string): string {
  return s.replace(/\b(Bool|Int|Float|String|Bytes|Uuid|DateTime)\b/g, (t) =>
    ilBasicToTs(t),
  );
}

/** Limpieza común: EOL, ; y , finales, comillas y espacios. */
function base(s: string): string {
  return s
    .replace(/\r/g, "")
    .replace(/\t/g, "  ")
    .replace(/ +$/gm, "")
    .replace(/;$/gm, "") // quita ; final por línea
    .replace(/,(\s*)$/gm, "$1") // quita coma final de campo
    .replace(/'/g, '"')
    .replace(/\s*:\s*/g, ": ")
    .replace(/\s*=>\s*/g, " => ");
}

/** Shorthand de objetos en una sola línea: `{ x }` → `{ x: x }` */
function expandShorthand(s: string): string {
  return s.replace(/{([^\n\r{}]+)}/g, (m, inner) => {
    const parts = inner.split(",").map((part: string) => {
      const p = part.trim();
      if (!p) return p;
      if (/^[A-Za-z_]\w*\s*:/.test(p)) return p;
      if (/^[A-Za-z_]\w*$/.test(p)) return `${p}: ${p}`;
      return p;
    });
    return `{ ${parts.join(", ")} }`;
  });
}

// -------------------- IL → forma comparable --------------------
export function normalizeLineIL(text: string): string {
  let s = base(text);

  // Cabeceras de sección
  s = s.replace(/^\s*types\s*\{\s*$/gm, "// TYPES");

  // test NAME { → function test_NAME() {
  s = s.replace(/^\s*test\s+([A-Za-z_]\w*)\s*\{\s*$/gm, "function test_$1() {");

  // func name(...): Ret { → function name(...) {
  s = s.replace(
    /^\s*func\s+([A-Za-z_]\w*)\s*\([^\n\r]*\)\s*:\s*[^\n\r{}]+\{\s*$/gm,
    "function $1(...) {",
  );

  // func name(...): Ret        → function name(...)      (llave en la línea siguiente)
  s = s.replace(
    /^\s*func\s+([A-Za-z_]\w*)\s*\([^\n\r]*\)\s*:\s*[^\n\r{}]+\s*$/gm,
    "function $1(...)",
  );

  // effect name(...): Ret uses ... { → async function name(...) {
  s = s.replace(
    /^\s*effect\s+([A-Za-z_]\w*)\s*\([^\n\r]*\)\s*:\s*[^\n\r{}]+?\s+uses\s+[^\n\r{]+\{\s*$/gm,
    "async function $1(...) {",
  );

  // effect name(...): Ret uses ...  → async function name(...)  (llave en la línea siguiente)
  s = s.replace(
    /^\s*effect\s+([A-Za-z_]\w*)\s*\([^\n\r]*\)\s*:\s*[^\n\r{}]+?\s+uses\s+[^\n\r{]+\s*$/gm,
    "async function $1(...)",
  );

  // for x in [1,2,3] {  →  for (const x of [1,2,3]) {
  s = s.replace(
    /^[ \t]*for[ \t]+([A-Za-z_]\w*)[ \t]+in[ \t]+(\[[^\n\r]*?\])[ \t]*\{[ \t]*$/gm,
    "for (const $1 of $2) {",
  );

  // --------- Record en UNA línea: type X = { a: T, b: U }; ----------
  s = s.replace(
    /^\s*type\s+([A-Za-z_]\w*)\s*=\s*\{\s*([^\n\r}]*)\s*\}\s*;?\s*$/gm,
    (_m, name: string, inner: string) => {
      const fields = normalizeInlineFieldsIL(inner)
        .split(/\s*;\s*/)
        .filter(Boolean)
        .map((f) => `  ${f};`)
        .join("\n");
      return `interface ${name} {\n${fields}\n}`;
    },
  );

  // --------- Records multi-línea (type {...} → interface {...}) ----------
  s = s.replace(/^\s*type\s+([A-Za-z_]\w*)\s*=\s*\{\s*$/gm, "interface $1 {");
  s = s.replace(
    /^\s*([A-Za-z_]\w*)\s*:\s*([A-Za-z_]\w*)(?:\s+where\s+.+?)?\s*,?\s*$/gm,
    (_m, k: string, ty: string) => `${k}: ${ilBasicToTs(ty)}`,
  );
  s = s.replace(/^\s*\};\s*$/gm, "}"); // fin de record

  // --------- Aliases con brand ----------
  s = s.replace(
    /^\s*type\s+([A-Za-z_]\w*)\s*=\s*([A-Za-z_]\w*)\s+brand\s+"([^"]+)"(?:\s+where\s+.+?)?\s*;?\s*$/gm,
    (_m, name: string, baseT: string, brand: string) =>
      `type ${name} = ${ilBasicToTs(baseT)} & Brand<"${brand}">`,
  );

  // --------- Aliases con genéricos (evita records/unions tras '=') ----------
  s = s.replace(
    /^\s*type\s+([A-Za-z_]\w*)\s*=\s*(?!\{|\|)([^;]+?)\s*;?\s*$/gm,
    (_m, name: string, rhs: string) =>
      `type ${name} = ${replaceBasicsEverywhereIL(rhs)}`,
  );

  // --------- Uniones con constructores nombrados ----------
  s = s.replace(
    /^\s*\|\s*([A-Za-z_]\w*)\s*\{\s*\}\s*;?\s*$/gm,
    (_m, ctor: string) => `| { type: "${ctor}" }`,
  );
  s = s.replace(
    /^\s*\|\s*([A-Za-z_]\w*)\s*\{\s*([^}]*)\s*\}\s*;?\s*$/gm,
    (_m, ctor: string, fields: string) =>
      `| { type: "${ctor}"; ${normalizeInlineFieldsIL(fields)} }`,
  );

  // --------- Expresiones auxiliares ----------
  // brand<Id>(x) ≈ (x as Id)
  s = s.replace(
    /\bbrand\s*<\s*([A-Za-z_]\w*)\s*>\s*\(\s*([^)]+?)\s*\)/g,
    "($2 as $1)",
  );
  // Shorthand objetos
  s = expandShorthand(s);
  // Homogeneiza let/const
  s = s.replace(/^\s*const(\s+)/gm, "let$1");

  // --------- matches / Result ----------
  // if matches("regex", s) { → return /regex/.test(s)
  s = s.replace(
    /^\s*if\s+matches\(\s*"([^"]+)"\s*,\s*([A-Za-z_]\w*)\s*\)\s*\{\s*$/gm,
    (_m, pat: string, v: string) => {
      const lit = pat.replace(/\\\\/g, "\\").replace(/\//g, "\\/");
      return `return /${lit}/.test(${v})`;
    },
  );
  // } else {  →  :
  s = s.replace(/^\s*\}\s*else\s*\{\s*$/gm, ":");
  // return Ok(x);  →  ? { type: "Ok", value: x }
  s = s.replace(
    /^\s*return\s+Ok\((.+)\)\s*;\s*$/gm,
    (_m, val: string) => `? { type: "Ok", value: ${val} }`,
  );
  // return Err(e); →  : { type: "Err", error: e }
  s = s.replace(
    /^\s*return\s+Err\((.+)\)\s*;\s*$/gm,
    (_m, err: string) => `: { type: "Err", error: ${err} }`,
  );

  return s;
}

// -------------------- TS → forma comparable --------------------
export function normalizeLineTS(text: string): string {
  let s = base(text);

  // test_…(): Promise<void> { → function test_…() {
  s = s.replace(
    /^[ \t]*export[ \t]+async[ \t]+function[ \t]+test_([A-Za-z_]\w*)[ \t]*\(\)[ \t]*:[ \t]*Promise[ \t]*<[ \t]*void[ \t]*>[ \t]*\{[ \t]*$/gm,
    "function test_$1() {",
  );
  // test(...) sin llave en la misma línea
  s = s.replace(
    /^\s*export\s+async\s+function\s+test_([A-Za-z_]\w*)\s*\(\)\s*:\s*Promise\s*<\s*void\s*>\s*$/gm,
    "function test_$1()",
  );

  // export async function foo( …multilínea… ): Promise<…> { → async function foo(...) {
  s = s.replace(
    /export[ \t]+async[ \t]+function[ \t]+([A-Za-z_]\w*)[ \t]*\([\s\S]*?\)[ \t]*:[ \t]*Promise[ \t]*<[^>]+>[ \t]*\{[ \t]*/g,
    "async function $1(...) {",
  );

  // export function foo( …multilínea… ): T { → function foo(...) {
  s = s.replace(
    /export[ \t]+function[ \t]+([A-Za-z_]\w*)[ \t]*\([\s\S]*?\)[ \t]*:[ \t]*[^{\n\r]+[ \t]*\{[ \t]*/g,
    "function $1(...) {",
  );

  // Tipos / interfaces
  // export [declare] interface Name {  →  interface Name {
  s = s.replace(
    /^\s*export\s+(?:declare\s+)?interface\s+([A-Za-z_]\w*)\s*\{\s*(?:\/\/.*)?$/gm,
    "interface $1 {",
  );
  // Fallback (por si no coincide el anterior por formato raro)
  s = s.replace(
    /[ \t]*export[ \t]+interface[ \t]+([A-Za-z_]\w*)[ \t]*\{/g,
    "interface $1 {",
  );

  // export type X = …  →  type X = …
  s = s.replace(/^[ \t]*export[ \t]+type[ \t]+/gm, "type ");
  s = s.replace(/^\s*\/\/\s*-+\s*Types\s*-+\s*$/gm, "// TYPES");

  // type Alias genérico: reemplaza básicos dentro del RHS (Map<String,T> → Map<string,T>, etc.)
  s = s.replace(
    /^\s*type\s+([A-Za-z_]\w*)\s*=\s*(?!\{|\|)([^;]+?)\s*;?\s*$/gm,
    (_m, name, rhs) => `type ${name} = ${replaceBasicsEverywhereIL(rhs)}`,
  );

  // Elimina imports del prelude (con o sin 'type')
  s = s.replace(
    /^[ \t]*import[ \t]+(?:type[ \t]+)?\{[^}]+\}[ \t]+from[ \t]+["']\.\/_prelude["'];?[ \t]*$/gm,
    "",
  );

  // Pequeños ajustes de estilo
  s = s.replace(/\)\s*;\s*$/gm, ")"); // return /.../.test(...);
  s = expandShorthand(s);
  s = s.replace(/^\s*const(\s+)/gm, "let$1");

  return s;
}
