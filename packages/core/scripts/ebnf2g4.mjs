#!/usr/bin/env node
/**
 * ebnf2antlr2.mjs — Genera *dos* gramáticas ANTLR4 (Lexer/Parser) desde un EBNF con directivas:
 *
 *   %keywords:  module, import, ...
 *   %punct:     "||" OROR, "&&" ANDAND, ...
 *   %lexer {    ... (cuerpo de reglas de lexer: IDENT, STRING, INT, FLOAT, BOOL, WS, comentarios) ... }
 *
 * Salida:
 *   - <Name>Lexer.g4
 *   - <Name>Parser.g4
 *
 * Uso:
 *   node ./scripts/ebnf2antlr_ast.mjs -i ./grammar/IntentLang.ebnf -o ./grammar --grammar IntentLang [--debug]
 */

import fs from "node:fs";
import path from "node:path";

/* ============= CLI ============= */
function parseArgs(argv) {
  const args = { i: null, outDir: null, grammar: "IntentLang", debug: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if ((a === "-i" || a === "--input") && argv[i + 1]) args.i = argv[++i];
    else if ((a === "-o" || a === "--out-dir") && argv[i + 1])
      args.outDir = argv[++i];
    else if ((a === "-g" || a === "--grammar") && argv[i + 1])
      args.grammar = argv[++i];
    else if (a === "-d" || a === "--debug") args.debug = true;
  }
  if (!args.i || !args.outDir) {
    console.error(
      "Usage: ebnf2antlr_ast.mjs -i <input.ebnf> -o <out-dir> [--grammar Name] [--debug]",
    );
    process.exit(2);
  }
  return args;
}

/* ===== util ===== */
const read = (f) => fs.readFileSync(f, "utf8");
const write = (f, s) => fs.writeFileSync(f, s, "utf8");
const ensureDir = (d) => fs.mkdirSync(d, { recursive: true });

/* ===== strip comments (fuera de comillas) ===== */
function protectQuotes(src) {
  const ph = [];
  const text = src.replace(/("([^"\\]|\\.)*"|'([^'\\]|\\.)*')/g, (m) => {
    const id = `__Q${ph.length}__`;
    ph.push(m);
    return id;
  });
  const restore = (s) => s.replace(/__Q(\d+)__/g, (_, i) => ph[+i]);
  return { text, restore, ph };
}
function stripCmt(src) {
  const { text, restore } = protectQuotes(src);

  // OJO: NO borramos `? ... ?` porque tu gramática usa `?` como cuantificador.
  // Quitamos:
  //   - (* ... *)   (EBNF estilo Pascal)
  //   - /* ... */   (C-style)
  //   - // ...      (línea)
  let out = text
    .replace(/\(\*[\s\S]*?\*\)/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\r\n]*/g, "");

  // Normaliza saltos de línea por si hay CRLF
  out = out.replace(/\r\n?/g, "\n");

  return restore(out);
}

/* ===== helpers para corte seguro de directivas ===== */
function scanSemicolon(text, i0) {
  // avanza hasta el primer ';' real (fuera de comillas)
  let i = i0,
    sq = false,
    dq = false;
  while (i < text.length) {
    const c = text[i];
    if (!dq && c === "'") sq = !sq;
    else if (!sq && c === '"') dq = !dq;
    else if (!sq && !dq && c === ";") return i;
    i++;
  }
  return -1;
}
function scanBraceClose(text, i0) {
  // avanza desde '{' inicial hasta su '}' emparejada (fuera de comillas)
  let i = i0,
    sq = false,
    dq = false,
    depth = 0;
  while (i < text.length) {
    const c = text[i];
    if (!dq && c === "'") {
      sq = !sq;
      i++;
      continue;
    }
    if (!sq && c === '"') {
      dq = !dq;
      i++;
      continue;
    }
    if (!sq && !dq) {
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) return i;
      }
    }
    i++;
  }
  return -1;
}

function parsePunctBody(body) {
  const items = [];
  let i = 0;

  const skipWS = () => {
    while (i < body.length && /\s/.test(body[i])) i++;
  };

  const readString = () => {
    if (body[i] !== '"') return null;
    i++; // skip opening "
    let s = "";
    while (i < body.length) {
      const c = body[i++];
      if (c === "\\") {
        if (i < body.length) s += c + body[i++];
        continue;
      }
      if (c === '"') break;
      s += c;
    }
    return s;
  };

  const readName = () => {
    const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(body.slice(i));
    if (!m) return null;
    i += m[0].length;
    return m[0];
  };

  while (i < body.length) {
    skipWS();
    if (i >= body.length) break;
    const lit = readString();
    if (!lit) break;
    skipWS();
    const name = readName();
    if (!name) break;
    items.push({ lit, name });
    // skip until next quoted literal or semicolon
    while (i < body.length && body[i] !== '"' && body[i] !== ";") i++;
    if (body[i] === ";") break;
  }
  return items;
}

function findFirstProdIndex(src) {
  const n = src.length;
  let i = 0,
    lineStart = 0;
  let inDQ = false,
    inSQ = false,
    inML = false,
    inPascal = false,
    inLexer = false,
    braceDepth = 0;

  while (i < n) {
    const c = src[i],
      c2 = src[i + 1];

    // newline → track start of next line
    if (c === "\n") {
      lineStart = i + 1;
      i++;
      continue;
    }

    // strings
    if (inDQ) {
      if (c === "\\") i += 2;
      else {
        if (c === '"') inDQ = false;
        i++;
      }
      continue;
    }
    if (inSQ) {
      if (c === "\\") i += 2;
      else {
        if (c === "'") inSQ = false;
        i++;
      }
      continue;
    }

    // comments
    if (!inML && !inPascal && c === "/" && c2 === "/") {
      // //
      i += 2;
      while (i < n && src[i] !== "\n") i++;
      continue;
    }
    if (!inML && !inPascal && c === "/" && c2 === "*") {
      // /* ... */
      inML = true;
      i += 2;
      continue;
    }
    if (inML) {
      if (c === "*" && c2 === "/") {
        inML = false;
        i += 2;
      } else i++;
      continue;
    }

    if (!inML && !inPascal && c === "(" && c2 === "*") {
      // (* ... *)
      inPascal = true;
      i += 2;
      continue;
    }
    if (inPascal) {
      if (c === "*" && c2 === ")") {
        inPascal = false;
        i += 2;
      } else i++;
      continue;
    }

    // strings (enter)
    if (c === '"') {
      inDQ = true;
      i++;
      continue;
    }
    if (c === "'") {
      inSQ = true;
      i++;
      continue;
    }

    // %lexer { ... } block (skip entirely, with brace depth)
    if (!inLexer && src.startsWith("%lexer", i)) {
      i += 7;
      while (i < n && /\s/.test(src[i])) i++;
      if (src[i] === "{") {
        inLexer = true;
        braceDepth = 1;
        i++;
        while (i < n && inLexer) {
          const d = src[i];
          if (d === '"') {
            // skip strings inside lexer
            i++;
            while (i < n) {
              const e = src[i++];
              if (e === "\\") i++;
              else if (e === '"') break;
            }
            continue;
          }
          if (d === "'") {
            i++;
            while (i < n) {
              const e = src[i++];
              if (e === "\\") i++;
              else if (e === "'") break;
            }
            continue;
          }
          if (d === "{") {
            braceDepth++;
            i++;
            continue;
          }
          if (d === "}") {
            braceDepth--;
            i++;
            if (braceDepth === 0) inLexer = false;
            continue;
          }
          i++;
        }
      }
      continue;
    }

    // Fuera de comentarios/lexer/strings → busca al INICIO DE LÍNEA (saltando indentación)
    if (i === lineStart) {
      // salta espacios/tabs de indentación
      let j = i;
      while (j < n && (src[j] === " " || src[j] === "\t")) j++;
      // Ident = ...
      if (/[A-Za-z_]/.test(src[j])) {
        // lee el identificador
        j++;
        while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
        // salta espacios hasta el posible '='
        let k = j;
        while (k < n && /\s/.test(src[k]) && src[k] !== "\n") k++;
        // comprobamos que sea el '=' de producción (no '=>' ni '->')
        if (src[k] === "=") {
          const k1 = k + 1;
          const next = src[k1] ?? "";
          if (next !== ">" /* evita '=>' */) {
            return i; // índice del comienzo de la línea de la primera producción
          }
        }
      }
    }

    i++;
  }

  return 0; // fallback
}

/* ===== parse directives (sin regex “codiciosas”) ===== */
function parseDirectives(src, debug, outDir) {
  // 1) decide where directives end, using a robust scanner
  const cut = findFirstProdIndex(src);
  // Si no encontramos producción (p.ej., por formato inesperado),
  // aún así escanea TODO el archivo para extraer directivas,
  // pero no pierdas el cuerpo para el parser.
  const headerRaw = cut > 0 ? src.slice(0, cut) : src;
  const restRaw = cut > 0 ? src.slice(cut) : src; // conserva el texto completo

  // 2) we only need quote protection on the HEADER (where directives live)
  const { text: headerQ, restore } = protectQuotes(headerRaw);

  const keywords = [];
  const punct = [];
  let lexerBody = "";
  let header = headerQ;

  // Helpers (same as before)
  const scanSemicolon = (text, i0) => {
    let i = i0,
      sq = false,
      dq = false;
    while (i < text.length) {
      const c = text[i];
      if (!dq && c === "'") sq = !sq;
      else if (!sq && c === '"') dq = !dq;
      else if (!sq && !dq && c === ";") return i;
      i++;
    }
    return -1;
  };
  const scanBraceClose = (text, i0) => {
    let i = i0,
      sq = false,
      dq = false,
      depth = 0;
    while (i < text.length) {
      const c = text[i];
      if (!dq && c === "'") {
        sq = !sq;
        i++;
        continue;
      }
      if (!sq && c === '"') {
        dq = !dq;
        i++;
        continue;
      }
      if (!sq && !dq) {
        if (c === "{") depth++;
        else if (c === "}") {
          depth--;
          if (depth === 0) return i;
        }
      }
      i++;
    }
    return -1;
  };

  // 1) %keywords: ... ;   (in HEADER only)
  {
    const m = header.match(/%keywords\s*:\s*/);
    if (m) {
      const start = m.index + m[0].length;
      const end = scanSemicolon(header, start);
      if (end >= 0) {
        const bodyMasked = header.slice(start, end);
        const body = restore(bodyMasked);
        body
          .split(/[,\s]+/)
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((k) => keywords.push(k));
        header = header.slice(0, m.index) + header.slice(end + 1);
      }
    }
  }

  // 2) %punct: ... ;
  {
    const m = header.match(/%punct\s*:\s*/);
    if (m) {
      const start = m.index + m[0].length;
      const end = scanSemicolon(header, start);
      if (end >= 0) {
        const bodyMasked = header.slice(start, end);
        const body = restore(bodyMasked);
        parsePunctBody(body).forEach((p) => punct.push(p));
        header = header.slice(0, m.index) + header.slice(end + 1);
      }
    }
  }

  // 3) %lexer { ... }  (HEADER only)
  {
    const kw = "%lexer";
    const i0 = header.indexOf(kw);
    if (i0 !== -1) {
      let j = i0 + kw.length;
      while (j < header.length && /\s/.test(header[j])) j++;
      if (header[j] === "{") {
        const braceOpen = j;
        const braceClose = scanBraceClose(header, braceOpen);
        if (braceClose >= 0) {
          const bodyMasked = header.slice(braceOpen + 1, braceClose);
          let chunk = restore(bodyMasked).trim();
          chunk = chunk.replace(/[ \t]*\}[\s\S]*$/, "");
          chunk = chunk.replace(/\n\(\*[\s\S]*$/, "");
          lexerBody = chunk;
          header = header.slice(0, i0) + header.slice(braceClose + 1);
        } else {
          // Fallback: the simplest safe regex
          const mm = /%lexer\s*{([\s\S]*?)}/.exec(header);
          if (mm) {
            lexerBody = restore(mm[1]).trim();
            header = header.replace(mm[0], "");
          }
        }
      }
    }
  }

  // REST (the grammar) is exactly what comes after the first production
  const srcNoDirectives = restRaw.replace(/\r\n?/g, "\n");

  if (debug) {
    try {
      ensureDir(outDir);
      write(
        path.join(outDir, ".keywords.debug.txt"),
        keywords.join("\n") + "\n",
      );
      write(
        path.join(outDir, ".punct.debug.txt"),
        punct.map((p) => `${p.name} <- "${p.lit}"`).join("\n") + "\n",
      );
      write(
        path.join(outDir, ".lexer.body.debug.txt"),
        (lexerBody || "") + "\n",
      );
      write(
        path.join(outDir, ".ebnf.after_directives.debug.txt"),
        srcNoDirectives,
      );
      write(
        path.join(outDir, ".ebnf.after_directives.after_comments.debug.txt"),
        stripCmt(srcNoDirectives),
      );
    } catch {}
    console.log(
      `• Keywords: ${keywords.length}, punct: ${punct.length}, lexerBody: ${lexerBody ? "sí" : "no"}`,
    );
  }

  if (lexerBody) {
    lexerBody = lexerBody.replace(/^[ \t]*\}[\s\S]*$/m, "").trim();
  }

  return { keywords, punct, lexerBody, srcNoDirectives };
}

/* ===== split productions Name = RHS ;  ===== */
function splitProductions(srcNoDirectives, debug) {
  const chunks = [];
  let buf = "";
  let sq = false,
    dq = false,
    par = 0,
    br = 0,
    bk = 0;

  const push = () => {
    const t = buf.trim();
    if (!t) return;
    const m = t.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([\s\S]+)$/);
    if (m) chunks.push({ name: m[1], rhs: m[2].trim() });
    buf = "";
  };

  for (let i = 0; i < srcNoDirectives.length; i++) {
    const c = srcNoDirectives[i];
    if (!dq && c === "'") sq = !sq;
    else if (!sq && c === '"') dq = !dq;

    if (!sq && !dq) {
      if (c === "(") par++;
      else if (c === ")") par = Math.max(0, par - 1);
      else if (c === "{") br++;
      else if (c === "}") br = Math.max(0, br - 1);
      else if (c === "[") bk++;
      else if (c === "]") bk = Math.max(0, bk - 1);
    }
    if (c === ";" && !sq && !dq && par === 0 && br === 0 && bk === 0) push();
    else buf += c;
  }
  push();

  if (debug) {
    console.log(`• splitProductions (scanner): ${chunks.length} producciones`);
  }

  // Fallback: regex global "name = ... ;"
  if (chunks.length === 0) {
    const fallback = [];
    const re = /(^|\n)\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([\s\S]*?);/g;
    let m;
    while ((m = re.exec(srcNoDirectives))) {
      fallback.push({ name: m[2], rhs: m[3].trim() });
    }
    if (debug) {
      console.log(
        `• splitProductions (fallback regex): ${fallback.length} producciones`,
      );
      if (fallback.length === 0) {
        console.log("• SNAPSHOT (primeros 400 chars tras directivas):");
        console.log(srcNoDirectives.slice(0, 400).replace(/\n/g, "\\n"));
      }
    }
    return fallback;
  }

  return chunks;
}

/* ===== token tables ===== */
function kwToTokenName(k) {
  const base = k.replace(/[^A-Za-z0-9]+/g, "_").toUpperCase();
  return `${base}KW`; // evita colisión con INT/FLOAT/BOOL
}
function buildTokenTables({ keywords, punct }) {
  const KW = new Map();
  for (const k of keywords) KW.set(k, kwToTokenName(k));
  const P = new Map();
  for (const { lit, name } of punct) P.set(lit, name);
  return { KW, P };
}

/* ===== AST EBNF RHS ===== */
function tokenizeRhs(text) {
  const out = [];
  let i = 0;
  const push = (type, val) => out.push({ type, val });

  while (i < text.length) {
    const c = text[i];

    // espacios
    if (/\s/.test(c)) {
      i++;
      continue;
    }

    // separadores / operadores unicaracter
    if ("|,()[]{}".includes(c)) {
      push(c, c);
      i++;
      continue;
    }

    // cuantificadores sufijo
    if (c === "?" || c === "*" || c === "+") {
      push(c, c);
      i++;
      continue;
    }

    // literales con comillas dobles
    if (c === '"') {
      let j = i + 1,
        s = '"';
      while (j < text.length) {
        const d = text[j];
        s += d;
        if (d === "\\") {
          j++;
          if (j < text.length) s += text[j];
        } else if (d === '"') {
          j++;
          break;
        }
        j++;
      }
      push("STR", s);
      i = j;
      continue;
    }

    // identificadores
    if (/[A-Za-z_]/.test(c)) {
      let j = i + 1;
      while (j < text.length && /[A-Za-z0-9_]/.test(text[j])) j++;
      push("ID", text.slice(i, j));
      i = j;
      continue;
    }

    // cualquier otro símbolo inesperado
    push("CHR", c);
    i++;
  }
  return out;
}

function parseRhs(text) {
  const t = tokenizeRhs(text);
  let p = 0;
  const LA = () => t[p];
  const eat = (ty, v) => {
    const x = t[p];
    if (!x || x.type !== ty || (v && x.val !== v))
      throw new Error(
        `expected ${ty}${v ? " " + v : ""} at ${p}, got ${x ? x.type + " " + x.val : "EOF"}`,
      );
    p++;
    return x;
  };
  const starts = (x) =>
    x &&
    (x.type === "(" ||
      x.type === "[" ||
      x.type === "{" ||
      x.type === "STR" ||
      x.type === "ID");

  function Unit() {
    const x = LA();
    if (!x) throw new Error("EOF in Unit");

    let node;
    if (x.type === "(") {
      eat("(", "(");
      const e = Expr();
      eat(")", ")");
      node = { k: "G", e };
    } else if (x.type === "[") {
      eat("[", "[");
      const e = Expr();
      eat("]", "]");
      node = { k: "O", e }; // opcional []
    } else if (x.type === "{") {
      eat("{", "{");
      const e = Expr();
      eat("}", "}");
      node = { k: "R", e }; // repetición {}
    } else if (x.type === "STR") {
      node = { k: "S", v: eat("STR").val };
    } else if (x.type === "ID") {
      node = { k: "I", v: eat("ID").val };
    } else {
      throw new Error("Unexpected token " + x.type + " " + x.val);
    }

    // cuantificadores sufijo sobre la unidad
    while (
      LA() &&
      (LA().type === "?" || LA().type === "*" || LA().type === "+")
    ) {
      const q = eat(LA().type).type;
      if (q === "?") node = { k: "O", e: node };
      else if (q === "*") node = { k: "R", e: node };
      else if (q === "+") node = { k: "P", e: node }; // plus (1+)
    }
    return node;
  }

  function Seq() {
    const items = [];
    if (!starts(LA())) return { k: "Seq", a: [] };
    items.push(Unit());
    while (true) {
      if (LA() && LA().type === ",") eat(",", ","); // coma opcional
      if (starts(LA())) items.push(Unit());
      else break;
    }
    return items.length === 1 ? items[0] : { k: "Seq", a: items };
  }

  function Alt() {
    const parts = [Seq()];
    while (LA() && LA().type === "|") {
      eat("|", "|");
      parts.push(Seq());
    }
    return parts.length === 1 ? parts[0] : { k: "Alt", a: parts };
  }

  function Expr() {
    return Alt();
  }

  const ast = Expr();
  if (p !== t.length) throw new Error("Trailing tokens at " + p);
  return ast;
}

/* ===== emit RHS for Parser.g4 ===== */
function litToTokenName(s, KW, P) {
  // s viene como literal con comillas dobles, p.ej. "\";\"" → raw=";"
  const raw = s.length >= 2 ? s.slice(1, -1) : s;

  // Normalizaciones defensivas (hemos visto casos degenerados):
  if (raw === "" || raw === '"') return "SEMI"; // trata "" o '"' como ';'

  // Keywords y puntuación definidas por directivas
  if (KW.has(raw)) return KW.get(raw);
  if (P.has(raw)) return P.get(raw);

  // Casos mínimos a prueba de balas si algo no estuvo en %punct
  if (raw === ";") return "SEMI";
  if (raw === ",") return "COMMA";

  // No emitimos literales crudos en el parser: obliga a declarar en %keywords/%punct
  throw new Error(
    `Literal no reconocido "${raw}" en RHS. Añádelo a %keywords o %punct.`,
  );
}

const DROP_IN_PARSER = new Set(["ws", "comment", "kw"]);
function emitAst(node, KW, P, nameMap) {
  switch (node.k) {
    case "S":
      return litToTokenName(node.v, KW, P);
    case "I": {
      const n = node.v;
      if (DROP_IN_PARSER.has(n)) return "";
      if (["ident", "string", "int", "float", "bool"].includes(n)) return n;
      return nameMap.get(n) || n[0].toLowerCase() + n.slice(1);
    }
    case "G":
      return "(" + emitAst(node.e, KW, P, nameMap) + ")";
    case "O": {
      const inner = emitAst(node.e, KW, P, nameMap);
      const need = node.e.k === "Alt" || node.e.k === "Seq";
      return (need ? "(" : "") + inner + (need ? ")?" : "?");
    }
    case "R": {
      const inner = emitAst(node.e, KW, P, nameMap);
      const need = node.e.k === "Alt" || node.e.k === "Seq";
      return (need ? "(" : "") + inner + (need ? ")*" : "*");
    }
    case "P": {
      // plus
      const inner = emitAst(node.e, KW, P, nameMap);
      const need = node.e.k === "Alt" || node.e.k === "Seq";
      return (need ? "(" : "") + inner + (need ? ")+" : "+");
    }
    case "Seq": {
      const parts = node.a
        .map((x) => emitAst(x, KW, P, nameMap))
        .filter((s) => s && s.trim());
      const body = parts.join(" ");
      return parts.length > 1 ? "(" + body + ")" : body;
    }
    case "Alt":
      return node.a.map((x) => emitAst(x, KW, P, nameMap)).join(" | ");
    default:
      throw new Error("Unknown AST node");
  }
}

/* ===== Build Grammars ===== */
function buildParsers(prods, KW, P) {
  const nameMap = new Map();
  for (const { name } of prods) {
    nameMap.set(
      name,
      /^[a-z]/.test(name) ? name : name[0].toLowerCase() + name.slice(1),
    );
  }

  const rules = [];
  for (const { name, rhs } of prods) {
    if (["ident", "string", "int", "float", "bool"].includes(name)) {
      const nm = nameMap.get(name);
      const tok = name.toUpperCase();
      rules.push(`${nm}\n  : ${tok}\n  ;`);
      continue;
    }
    let ast;
    try {
      ast = parseRhs(rhs);
    } catch (e) {
      console.error(
        `❌ RHS parse error in ${name}: ${e.message}\n   RHS: ${rhs}`,
      );
      process.exit(1);
    }
    const body = emitAst(ast, KW, P, nameMap);
    rules.push(`${nameMap.get(name)}\n  : ${body}\n  ;`);
  }

  const txt = rules.join("\n\n");

  const bridgeSpecs = [
    ["ident", "IDENT"],
    ["string", "STRING"],
    ["int", "INT"],
    ["float", "FLOAT"],
    ["bool", "BOOL"],
  ];

  const bridges = bridgeSpecs
    .filter(([name]) => !new RegExp(`(^|\\n)${name}\\s*:\\s`, "m").test(txt))
    .map(([name, tok]) => `${name}\n  : ${tok}\n  ;`);

  return [...bridges, ...rules].join("\n\n");
}
function buildLexer(grammar, KW, P, lexerBody) {
  const header = `lexer grammar ${grammar}Lexer;\n\n`;
  const kwRules = [...KW.keys()]
    .map((k) => `${KW.get(k)}  : '${k}' ;`)
    .join("\n");
  const punctRules = [...P.entries()]
    .sort((a, b) => b[0].length - a[0].length)
    .map(([lit, name]) => `${name} : '${lit.replace(/'/g, "\\'")}' ;`)
    .join("\n");
  const body = lexerBody.trim() ? lexerBody.trim() + "\n\n" : "";
  let out =
    header +
    `// --- Palabras clave (antes de IDENT) ---\n` +
    kwRules +
    `\n\n// --- Operadores y puntuación ---\n` +
    punctRules +
    `\n\n// --- Cuerpo de lexer definido en %lexer ---\n` +
    body;
  // Asegura tokens básicos
  if (![...P.values()].includes("SEMI")) out += `SEMI : ';' ;\n`;
  if (![...P.values()].includes("COMMA")) out += `COMMA : ',' ;\n`;
  return out.trimEnd() + "\n";
}
function buildParser(grammar, parserRules) {
  const txt = `parser grammar ${grammar}Parser;

options { tokenVocab=${grammar}Lexer; }

// === Reglas de parser ===
${parserRules}
`;
  return txt.trimEnd() + "\n";
}

/* ============= main ============= */
function main() {
  const args = parseArgs(process.argv);
  const raw = read(args.i);

  // 1) Quitar directivas de forma quote-aware
  const { keywords, punct, lexerBody, srcNoDirectives } = parseDirectives(
    raw, // <— antes pasábamos stripCmt(raw)
    args.debug,
    args.outDir,
  );

  // 2) Quitar comentarios del EBNF resultante
  const srcClean = stripCmt(srcNoDirectives);

  // 3) Split de producciones sobre el texto saneado
  const prods = splitProductions(srcClean, args.debug);

  if (args.debug) {
    console.warn("ℹ️ Recortado el encabezado hasta la primera producción.");
  }

  console.log(`• Producciones detectadas: ${prods.length}`);
  if (prods.length) {
    console.log(
      "  Primeras:",
      prods
        .slice(0, 8)
        .map((p) => p.name)
        .join(", ") + (prods.length > 8 ? ", ..." : ""),
    );
  }
  if (!prods.length) {
    console.error("No productions found. Did you terminate with ';'?");
    process.exit(1);
  }

  const { KW, P } = buildTokenTables({ keywords, punct });
  const parserRules = buildParsers(prods, KW, P);
  const lexerG4 = buildLexer(args.grammar, KW, P, lexerBody);
  const parserG4 = buildParser(args.grammar, parserRules);

  ensureDir(args.outDir);
  const lexPath = path.join(args.outDir, `${args.grammar}Lexer.g4`);
  const parPath = path.join(args.outDir, `${args.grammar}Parser.g4`);
  write(lexPath, lexerG4);
  write(parPath, parserG4);

  console.log(`✅ Generated:\n  - ${lexPath}\n  - ${parPath}`);
}

main();
