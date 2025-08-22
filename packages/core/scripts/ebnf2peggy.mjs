#!/usr/bin/env node
/**
 * EBNF → Peggy (PEG.js) converter (extended, polished)
 *
 * Features:
 * - Rules with '=' or '::=' and ';' or '.' terminators
 * - Alternatives: |
 * - Grouping: ( ... )
 * - Optional: [ ... ]     → (...)? in PEG
 * - Repetition: { ... }   → (...)* in PEG
 * - Strings with escapes ('...' or "...")
 * - Ranges: 'A'..'Z', "\x30".."9", "\u0041".."\u005A" (after unescape must be 1 char each)
 * - Special sequences: ? ... ?  → common shorthands and natural-language heuristics
 * - Auto whitespace insertion between sequence items with --auto-ws (adds `_` rule)
 * - Direct left recursion elimination (single-rule, direct only)
 * - --start RuleName: emit an explicit start rule line
 *
 * Review checklist:
 * [ ] Indirect left recursion is NOT eliminated.
 * [ ] Special sequences mapped via dictionary + heuristics; unknown → epsilon with comment.
 * [ ] Complex multi-char ranges are not supported (only 1-char after unescape).
 */

import fs from "node:fs";

// ------------------------- CLI & Main Function -------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    inputFile: null,
    outputFile: null,
    autoWS: false,
    help: false,
    start: null,
  };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if ((a === "-i" || a === "--input") && args[i + 1]) {
      options.inputFile = args[++i];
    } else if ((a === "-o" || a === "--output") && args[i + 1]) {
      options.outputFile = args[++i];
    } else if (a === "--auto-ws") {
      options.autoWS = true;
    } else if (a === "--start" && args[i + 1]) {
      options.start = args[++i];
    } else if (a === "-h" || a === "--help") {
      options.help = true;
    } else if (!options.inputFile && !a.startsWith("-")) {
      options.inputFile = a;
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }
  return options;
}

function printHelp() {
  console.log(`Usage:
  node ebnf2peggy.mjs -i input.ebnf -o output.peggy [--auto-ws] [--start RuleName]

Options:
  -i, --input     Input EBNF file (or pass via STDIN if omitted)
  -o, --output    Output Peggy file (or writes to STDOUT if omitted)
  --auto-ws       Insert "_" between sequence items and add a whitespace rule
  --start         Force a specific start rule name in the output grammar

Notes:
  - Supports ::= or = as assignment.
  - Accepts ';' or '.' as production terminators.
  - Recognizes comments: // line, /* block */, (* block *).
  - Special sequences (? ... ?) mapped when recognized (e.g., ?digit?, ?letter?, ?alnum?, ?ws?, ?ws+?),
    plus heuristics for natural-language descriptions like:
      ? an uppercase letter from 'A' to 'Z' ?, ? any character until end of line ?, etc.
`);
}

async function main() {
  try {
    let source = "";
    const options = parseArgs();

    if (options.help) {
      printHelp();
      process.exit(0);
    }

    if (options.inputFile) {
      source = fs.readFileSync(options.inputFile, "utf8");
    } else {
      source = await new Promise((resolve, reject) => {
        let buf = "";
        process.stdin.setEncoding("utf8");
        process.stdin.on("data", (chunk) => (buf += chunk));
        process.stdin.on("end", () => resolve(buf));
        process.stdin.on("error", reject);
      });
    }

    const lexer = new Lexer(source);
    const tokens = lexer.lex();

    const parser = new Parser(tokens);
    let ast = parser.parseGrammar();

    // Eliminate direct left recursion
    const { transformed, warnings: lrWarnings } =
      transformDirectLeftRecursion(ast);
    ast = transformed;
    for (const w of lrWarnings) console.error(`[warn] ${w}`);

    // Warn remaining potential left recursion (indirect or complex)
    warnLeftRecursion(ast);

    // Warn undefined nonterminals
    warnUndefinedRefs(ast);

    const output = generatePeggy(ast, {
      autoWS: options.autoWS,
      start: options.start,
    });

    if (options.outputFile) {
      fs.writeFileSync(options.outputFile, output, "utf8");
    } else {
      process.stdout.write(output);
    }
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

// ------------------------- Lexer -------------------------

class Lexer {
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.line = 1;
    this.col = 1;
  }

  error(message) {
    return new Error(`Lexer error at ${this.line}:${this.col}: ${message}`);
  }

  isAlpha(ch) {
    return /[A-Za-z_]/.test(ch);
  }
  isAlnum(ch) {
    return /[A-Za-z0-9_]/.test(ch);
  }

  skipWhitespaceAndComments() {
    while (this.pos < this.input.length) {
      const ch = this.input[this.pos];
      if (/\s/.test(ch)) {
        if (ch === "\n") {
          this.line++;
          this.col = 1;
        } else {
          this.col++;
        }
        this.pos++;
        continue;
      }
      // // line comment
      if (this.input.startsWith("//", this.pos)) {
        this.pos += 2;
        this.col += 2;
        while (this.pos < this.input.length && this.input[this.pos] !== "\n") {
          this.pos++;
          this.col++;
        }
        continue;
      }
      // /* block */
      if (this.input.startsWith("/*", this.pos)) {
        this.pos += 2;
        this.col += 2;
        while (
          this.pos < this.input.length &&
          !this.input.startsWith("*/", this.pos)
        ) {
          if (this.input[this.pos] === "\n") {
            this.line++;
            this.col = 1;
          } else {
            this.col++;
          }
          this.pos++;
        }
        if (this.pos >= this.input.length)
          throw this.error("Unterminated block comment '/*...'");
        this.pos += 2;
        this.col += 2;
        continue;
      }
      // (* block *)
      if (this.input.startsWith("(*", this.pos)) {
        this.pos += 2;
        this.col += 2;
        while (
          this.pos < this.input.length &&
          !this.input.startsWith("*)", this.pos)
        ) {
          if (this.input[this.pos] === "\n") {
            this.line++;
            this.col = 1;
          } else {
            this.col++;
          }
          this.pos++;
        }
        if (this.pos >= this.input.length)
          throw this.error("Unterminated block comment '(*...'");
        this.pos += 2;
        this.col += 2;
        continue;
      }
      break;
    }
  }

  lex() {
    const tokens = [];
    this.skipWhitespaceAndComments();
    while (this.pos < this.input.length) {
      const startCol = this.col;
      const startLine = this.line;
      const ch = this.input[this.pos];

      // Operators / multi-char
      if (this.input.startsWith("::=", this.pos)) {
        tokens.push(tok("ASSIGN", "::=", startLine, startCol));
        this.pos += 3;
        this.col += 3;
      } else if (this.input.startsWith("..", this.pos)) {
        tokens.push(tok("RANGE", "..", startLine, startCol));
        this.pos += 2;
        this.col += 2;
      } else if (ch === "=") {
        tokens.push(tok("ASSIGN", "=", startLine, startCol));
        this.pos++;
        this.col++;
      } else if (ch === "|") {
        tokens.push(tok("ALT", "|", startLine, startCol));
        this.pos++;
        this.col++;
      } else if (
        "()[]{}".includes(ch) ||
        ch === ";" ||
        ch === "." ||
        ch === ","
      ) {
        const typeMap = {
          "(": "LPAREN",
          ")": "RPAREN",
          "[": "LBRACK",
          "]": "RBRACK",
          "{": "LBRACE",
          "}": "RBRACE",
          ";": "SEMI",
          ".": "DOT",
          ",": "COMMA",
        };
        tokens.push(tok(typeMap[ch], ch, startLine, startCol));
        this.pos++;
        this.col++;
      } else if (ch === "'" || ch === '"') {
        const { value, quote } = this.readString();
        tokens.push({
          type: "STRING",
          value,
          quote,
          loc: { line: startLine, col: startCol },
        });
      } else if (ch === "?") {
        const content = this.readSpecial();
        tokens.push({
          type: "SPECIAL",
          value: content,
          loc: { line: startLine, col: startCol },
        });
      } else if (this.isAlpha(ch)) {
        let identifier = ch;
        this.pos++;
        this.col++;
        while (
          this.pos < this.input.length &&
          this.isAlnum(this.input[this.pos])
        ) {
          identifier += this.input[this.pos++];
          this.col++;
        }
        tokens.push(tok("IDENT", identifier, startLine, startCol));
      } else {
        throw this.error(`unexpected character '${ch}'`);
      }
      this.skipWhitespaceAndComments();
    }
    tokens.push({
      type: "EOF",
      value: null,
      loc: { line: this.line, col: this.col },
    });
    return tokens;
  }

  readString() {
    const quote = this.input[this.pos]; // ' or "
    const startLine = this.line,
      startCol = this.col;
    this.pos++;
    this.col++;
    let raw = "";
    let closed = false;
    while (this.pos < this.input.length) {
      const c = this.input[this.pos++];
      this.col++;
      if (c === "\\") {
        if (this.pos < this.input.length) {
          const esc = this.input[this.pos++];
          this.col++;
          raw += "\\" + esc; // keep escaped, unescape later
        }
      } else if (c === quote) {
        closed = true;
        break;
      } else {
        raw += c;
      }
    }
    if (!closed)
      throw new Error(
        `Lexer error at ${startLine}:${startCol}: unterminated string literal`,
      );
    return { value: unescapeString(raw), quote };
  }

  readSpecial() {
    // ? ... ? (no nesting)
    this.pos++;
    this.col++;
    let s = "";
    while (this.pos < this.input.length) {
      const c = this.input[this.pos++];
      this.col++;
      if (c === "?") break;
      s += c;
    }
    return s.trim();
  }
}

function tok(type, value, line, col) {
  return { type, value, loc: { line, col } };
}

/**
 * Converts EBNF escape sequences into standard JavaScript string characters.
 */
function unescapeString(raw) {
  let s = "";
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === "\\") {
      const next = raw[++i];
      switch (next) {
        case "n":
          s += "\n";
          break;
        case "t":
          s += "\t";
          break;
        case "r":
          s += "\r";
          break;
        case "x":
          s += String.fromCharCode(parseInt(raw.substring(i + 1, i + 3), 16));
          i += 2;
          break;
        case "u":
          s += String.fromCharCode(parseInt(raw.substring(i + 1, i + 5), 16));
          i += 4;
          break;
        case "\\":
          s += "\\";
          break;
        case '"':
          s += '"';
          break;
        case "'":
          s += "'";
          break;
        default:
          s += next;
          break;
      }
    } else {
      s += c;
    }
  }
  return s;
}

// ------------------------- Parser -------------------------

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }

  peek() {
    return this.tokens[this.pos];
  }
  peekAhead(n) {
    return this.tokens[this.pos + n];
  }

  error(expectedType) {
    const t = this.peek();
    const got = t ? `${t.type} '${t.value ?? ""}'` : "EOF";
    return new Error(
      `Parse error at ${t.loc?.line ?? "?"}:${t.loc?.col ?? "?"}: expected ${expectedType}, got ${got}`,
    );
  }

  consume(type) {
    const t = this.peek();
    if (!t || t.type !== type) {
      throw this.error(type);
    }
    this.pos++;
    return t;
  }

  match(type) {
    if (this.peek()?.type === type) {
      return this.tokens[this.pos++];
    }
    return null;
  }

  parseGrammar() {
    const rules = [];
    while (this.peek()?.type !== "EOF") {
      rules.push(this.parseProduction());
      while (this.match("DOT")) {}
    }
    return { type: "Grammar", rules };
  }

  parseProduction() {
    const nameTok = this.consume("IDENT");
    const assign = this.match("ASSIGN");
    if (!assign) {
      throw this.error("'=' or '::='");
    }
    const expr = this.parseExpression();
    const end = this.match("SEMI") || this.match("DOT");
    if (!end) {
      throw this.error("';' or '.'");
    }
    return { type: "Rule", name: nameTok.value, expr };
  }

  parseExpression() {
    const first = this.parseSequence();
    const alts = [first];
    while (this.match("ALT")) {
      alts.push(this.parseSequence());
    }
    return alts.length === 1 ? first : { type: "Alt", alts };
  }

  parseSequence() {
    const items = [];
    while (true) {
      const t = this.peek();
      if (
        !t ||
        ["SEMI", "DOT", "ALT", "RPAREN", "RBRACK", "RBRACE", "EOF"].includes(
          t.type,
        )
      ) {
        break;
      }
      // EBNF comma separator: skip it (acts like whitespace)
      if (t.type === "COMMA") {
        this.pos++;
        continue;
      }

      // STRING RANGE STRING (attempt) — both sides must be 1 char after unescape at lexing time
      if (
        t.type === "STRING" &&
        this.peekAhead(1)?.type === "RANGE" &&
        this.peekAhead(2)?.type === "STRING"
      ) {
        const a = t;
        const c = this.peekAhead(2);
        if (a.value.length === 1 && c.value.length === 1) {
          this.pos += 3; // consume STRING, RANGE, STRING
          items.push({ type: "Range", from: a, to: c });
          continue;
        } else {
          console.error(
            `[warn] Non-single-char range '${a.value}'..'${c.value}' at ${t.loc.line}:${t.loc.col}; emitting as literals.`,
          );
        }
      }

      items.push(this.parsePrimary());
    }
    return items.length === 1 ? items[0] : { type: "Seq", items };
  }

  parsePrimary() {
    const t = this.peek();
    if (!t || t.type === "EOF") throw this.error("an expression");

    switch (t.type) {
      case "IDENT":
        this.pos++;
        return { type: "Ref", name: t.value };
      case "STRING":
        this.pos++;
        return { type: "Str", value: t.value, quote: t.quote };
      case "SPECIAL":
        this.pos++;
        return { type: "Special", value: t.value, loc: t.loc };
      case "LPAREN":
        this.consume("LPAREN");
        const e = this.parseExpression();
        this.consume("RPAREN");
        return { type: "Group", expr: e };
      case "LBRACK":
        this.consume("LBRACK");
        const opt = this.parseExpression();
        this.consume("RBRACK");
        return { type: "Opt", expr: opt };
      case "LBRACE":
        this.consume("LBRACE");
        const rep = this.parseExpression();
        this.consume("RBRACE");
        return { type: "Rep", expr: rep };
      default:
        throw this.error("IDENT, STRING, '?', '(', '[', or '{'");
    }
  }
}

// ------------------------- AST Transformations -------------------------

function transformDirectLeftRecursion(grammar) {
  const newRules = [];
  const warnings = [];

  for (const rule of grammar.rules) {
    const name = rule.name;
    const alts = rule.expr.type === "Alt" ? rule.expr.alts : [rule.expr];
    const recursiveAlts = [];
    const nonRecursiveAlts = [];

    for (const alt of alts) {
      const firsts = firstSymbol(alt);
      if (
        firsts.length > 0 &&
        firsts[0].kind === "Ref" &&
        firsts[0].name === name
      ) {
        // left-recursive alternative
        const alpha =
          alt.type === "Seq"
            ? { type: "Seq", items: alt.items.slice(1) }
            : { type: "Seq", items: [] };
        if (alpha.items.length === 0) {
          warnings.push(
            `Rule '${name}' has a direct left-recursive alternative with no trailing expression.`,
          );
        }
        recursiveAlts.push(alpha);
      } else {
        nonRecursiveAlts.push(alt);
      }
    }

    if (recursiveAlts.length > 0) {
      warnings.push(`Eliminated direct left recursion in rule '${name}'.`);
      const betaRaw =
        nonRecursiveAlts.length > 1
          ? { type: "Alt", alts: nonRecursiveAlts }
          : nonRecursiveAlts[0];
      const beta =
        betaRaw?.type === "Alt" ? { type: "Group", expr: betaRaw } : betaRaw;
      const alpha =
        recursiveAlts.length > 1
          ? { type: "Alt", alts: recursiveAlts }
          : recursiveAlts[0];
      const rep = { type: "Rep", expr: { type: "Group", expr: alpha } };
      const newExpr = { type: "Seq", items: [beta, rep] };
      newRules.push({ type: "Rule", name, expr: newExpr });
    } else {
      newRules.push(rule);
    }
  }
  return { transformed: { type: "Grammar", rules: newRules }, warnings };
}

function warnLeftRecursion(grammar) {
  for (const rule of grammar.rules) {
    const name = rule.name;
    const firsts = firstSymbol(rule.expr);
    if (firsts.some((f) => f.kind === "Ref" && f.name === name)) {
      console.error(
        `[warn] Possible indirect/complex left recursion in rule '${name}'. PEG parsers cannot handle it.`,
      );
    }
  }
}

function firstSymbol(expr) {
  switch (expr?.type) {
    case "Ref":
      return [{ kind: "Ref", name: expr.name }];
    case "Str":
    case "Range":
    case "Special":
      return [{ kind: expr.type }];
    case "Epsilon":
      return [{ kind: "Epsilon" }];
    case "Group":
      return firstSymbol(expr.expr);
    case "Opt":
    case "Rep":
      return firstSymbol(expr.expr);
    case "Seq":
      if (expr.items.length === 0) return [];
      return firstSymbol(expr.items[0]);
    case "Alt":
      return expr.alts.flatMap((e) => firstSymbol(e));
    default:
      return [];
  }
}

function warnUndefinedRefs(grammar) {
  const defined = new Set(grammar.rules.map((r) => r.name));
  const refs = [];
  function walk(e) {
    if (!e) return;
    if (e.type === "Ref") refs.push(e.name);
    if (e.type === "Seq") e.items.forEach(walk);
    if (e.type === "Alt") e.alts.forEach(walk);
    if (e.type === "Group" || e.type === "Opt" || e.type === "Rep")
      walk(e.expr);
  }
  for (const r of grammar.rules) walk(r.expr);
  for (const name of new Set(refs)) {
    if (!defined.has(name)) {
      console.error(`[warn] Reference to undefined rule '${name}'.`);
    }
  }
}

// ------------------------- Specials: dictionary + heuristics -------------------------

const specialMap = {
  digit: "[0-9]",
  digits: "[0-9]+",
  letter: "[A-Za-z]",
  letters: "[A-Za-z]+",
  alnum: "[A-Za-z0-9_]",
  "alnum+": "[A-Za-z0-9_]+",
  id_start: "[A-Za-z_]",
  id_part: "[A-Za-z0-9_]",
  ws: "[ \\t\\n\\r]",
  "ws+": "[ \\t\\n\\r]+",
  sp: "[ \\t]",
  "sp+": "[ \\t]+",
  nl: "[\\n\\r]+",
  space: "[ ]",
  tab: "\\t",
  lower: "[a-z]",
  upper: "[A-Z]",
  word: "[A-Za-z_]",
  "word+": "[A-Za-z_][A-Za-z0-9_]*",
};

// Heuristics for natural-language specials (as seen in user EBNF)
function mapNaturalSpecial(raw) {
  const s = String(raw).trim().toLowerCase();

  // uppercase letters 'A' to 'Z'
  if (/'a'\s*to\s*'z'/.test(s) && /uppercase/.test(s)) return "[A-Z]"; // forgiving typo
  if (/'a'\s*-\s*'z'/.test(s) && /uppercase/.test(s)) return "[A-Z]";
  if (/'a'/.test(s) && /'z'/.test(s) && /uppercase/.test(s)) return "[A-Z]";
  if (/'a'\s*to\s*'z'/.test(s) && /'A'/.test(s)) return "[A-Z]"; // extra-forgiving

  if (/'a'\s*to\s*'z'/.test(s) && /lowercase/.test(s)) return "[a-z]";
  if (/'a'\s*-\s*'z'/.test(s) && /lowercase/.test(s)) return "[a-z]";
  if (/'a'/.test(s) && /'z'/.test(s) && /lowercase/.test(s)) return "[a-z]";

  // digits '0' to '9'
  if (/'0'/.test(s) && /'9'/.test(s) && /(digit|number)/.test(s))
    return "[0-9]";

  // any character until end of line
  if (/any character until end of line/.test(s)) return `(!"\\n" .)*`;

  // any character until "*/"
  if (/any character until\s*"\*\/"/.test(s)) return `(!"*/" .)*`;

  // any string character, including escapes
  if (/any string character/.test(s) && /including escapes/.test(s)) {
    // One char of a string: either an escape, or a non-quote non-backslash
    // PEG emitted text (explained):
    //   "\\" .          => backslash + any char   (escape)
    //   !["\\"] .       => any char except " or \
    return `( "\\\\\\" . / (!["\\\\\\\\"] .) )`;
  }

  return null;
}

// ------------------------- Generator (PEG) -------------------------

function escapeClass(ch) {
  return ch.replace(/[-\\[\]^]/g, (m) => "\\" + m);
}

function genExpr(expr, ctx) {
  switch (expr.type) {
    case "Ref":
      return expr.name;
    case "Str": {
      const quoted = JSON.stringify(expr.value);
      return quoted;
    }
    case "Range": {
      const fromVal =
        typeof expr.from === "string" ? expr.from : expr.from.value;
      const toVal = typeof expr.to === "string" ? expr.to : expr.to.value;
      const from = escapeClass(fromVal);
      const to = escapeClass(toVal);
      return `[${from}-${to}]`;
    }
    case "Special": {
      const key = String(expr.value).trim().toLowerCase();
      let peggyExpr = specialMap[key] ?? mapNaturalSpecial(expr.value);
      // Support inline quantifiers in key, e.g., "word+" or "alnum*"
      if (!peggyExpr) {
        const m = key.match(/^([a-z_]+)([+*])$/);
        if (m && specialMap[m[1]]) peggyExpr = `(${specialMap[m[1]]})${m[2]}`;
      }
      if (peggyExpr) return peggyExpr;
      console.warn(
        `[warn] No recognized mapping for special sequence '${expr.value}'. Emitting empty string.`,
      );
      return `"" /* ?${expr.value}? */`;
    }
    case "Group": {
      const inner = genExpr(expr.expr, ctx);
      return `(${inner})`;
    }
    case "Opt":
    case "Rep": {
      const inner = genExpr(expr.expr, ctx);
      const modifier = { Opt: "?", Rep: "*" }[expr.type];
      return `(${inner})${modifier}`;
    }
    case "Seq": {
      const parts = expr.items.map((it) => genExpr(it, ctx));
      return ctx.autoWS ? parts.join(" _ ") : parts.join(" ");
    }
    case "Alt": {
      const parts = expr.alts.map((it) => genExpr(it, ctx));
      return parts.join(" / ");
    }
    case "Epsilon":
      return `""`;
    default:
      throw new Error(`Unknown expr type: ${expr.type}`);
  }
}

function generatePeggy(grammar, { autoWS, start }) {
  const lines = [];
  if (start) {
    lines.push(`start = ${start}`);
    lines.push("");
  }
  for (const rule of grammar.rules) {
    lines.push(`${rule.name}`);
    const body = genExpr(rule.expr, { autoWS });
    lines.push(`  = ${body}`);
    lines.push("");
  }
  if (autoWS) {
    lines.push(`_ "whitespace"`);
    lines.push(`  = [ \\t\\n\\r]*`);
    lines.push("");
  }
  return lines.join("\n");
}

main();
