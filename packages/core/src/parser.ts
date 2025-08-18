import { lex } from "./lexer.js";
import type { Token } from "./lexer.js";
import type {
  Program,
  IntentSection,
  UsesSection,
  UseDecl,
  TypesSection,
  TypeDecl,
  TypeExpr,
  FuncDecl,
  EffectDecl,
  Field,
  Variant,
} from "./ast.js";

function span(): { line: number; column: number; index: number } {
  return { line: 0, column: 0, index: 0 };
}

export function parse(input: string): Program {
  const tokens = lex(input);
  let i = 0;
  function peek(): Token | undefined {
    return tokens[i];
  }
  function consume(type?: string, value?: string): Token {
    const t = tokens[i++];
    if (!t) throw new Error("Unexpected EOF");
    if (type && t.type !== type) throw new Error(`Expected ${type} but got ${t.type}`);
    if (value && t.value !== value) throw new Error(`Expected ${value} but got ${t.value}`);
    return t;
  }
  function match(type: string, value?: string): boolean {
    const t = tokens[i];
    if (!t) return false;
    if (t.type !== type) return false;
    if (value && t.value !== value) return false;
    i++;
    return true;
  }
  function expectKeyword(value: string) {
    const t = consume("keyword");
    if (t.value !== value) throw new Error(`Expected keyword ${value}`);
  }

  const program: Program = {
    kind: "Program",
    funcs: [],
    effects: [],
    span: { start: span(), end: span() },
  } as Program;

  if (peek() && peek()!.type === "keyword" && peek()!.value === "intent") {
    program.intent = parseIntent();
  }
  if (peek() && peek()!.type === "keyword" && peek()!.value === "uses") {
    program.uses = parseUses();
  }
  if (peek() && peek()!.type === "keyword" && peek()!.value === "types") {
    program.types = parseTypes();
  }
  while (peek()) {
    const t = peek()!;
    if (t.type === "keyword" && t.value === "func") {
      program.funcs.push(parseFunc());
    } else if (t.type === "keyword" && t.value === "effect") {
      program.effects.push(parseEffect());
    } else {
      throw new Error(`Unexpected token ${t.value}`);
    }
  }
  return program;

  function parseIntent(): IntentSection {
    expectKeyword("intent");
    const desc = consume("string").value;
    expectKeyword("tags");
    consume("punct", "[");
    const tags: string[] = [];
    while (!match("punct", "]")) {
      const tag = consume("string").value;
      tags.push(tag);
      match("punct", ",");
    }
    return { kind: "IntentSection", description: desc, tags, span: { start: span(), end: span() } };
  }

  function parseUses(): UsesSection {
    expectKeyword("uses");
    consume("punct", "{");
    const entries: UseDecl[] = [];
    while (!match("punct", "}")) {
      const name = consume("identifier").value;
      consume("punct", ":");
      const typeName = consume("identifier").value;
      consume("punct", "{");
      const params: Record<string, any> = {};
      while (!match("punct", "}")) {
        const key = consume("identifier").value;
        consume("punct", ":");
        const valTok = consume();
        let val: any;
        if (valTok.type === "string") val = valTok.value;
        else if (valTok.type === "number") val = Number(valTok.value);
        else throw new Error("Expected literal in uses params");
        params[key] = val;
        match("punct", ",");
      }
      entries.push({ kind: "UseDecl", name, typeName, params, span: { start: span(), end: span() } });
      match("punct", ",");
    }
    return { kind: "UsesSection", entries, span: { start: span(), end: span() } };
  }

  function parseTypes(): TypesSection {
    expectKeyword("types");
    consume("punct", "{");
    const declarations: TypeDecl[] = [];
    while (!match("punct", "}")) {
      expectKeyword("type");
      const name = consume("identifier").value;
      consume("punct", "=");
      const expr = parseTypeExpr();
      match("punct", ";");
      declarations.push({ kind: "TypeDecl", name, expr, span: { start: span(), end: span() } });
    }
    return { kind: "TypesSection", declarations, span: { start: span(), end: span() } };
  }

  function parseTypeExpr(): TypeExpr {
    const t = peek();
    if (!t) throw new Error("Unexpected EOF in type expr");
    if (t.type === "identifier") {
      const name = consume("identifier").value;
      if (match("keyword", "brand")) {
        const brand = consume("string").value;
        let refinement: string | undefined;
        if (match("keyword", "where")) {
          const parts: string[] = [];
          while (peek() && !(peek()!.type === "punct" && [",", ";", "}", "|"] .includes(peek()!.value))) {
            parts.push(consume().value);
          }
          refinement = parts.join(" ");
        }
        return { kind: "BrandType", base: { kind: "BasicType", name }, brand, refinement };
      }
      return { kind: "BasicType", name };
    }
    if (match("punct", "{")) {
      const fields: Field[] = [];
      while (!match("punct", "}")) {
        const fname = consume("identifier").value;
        consume("punct", ":");
        const ftype = parseTypeExpr();
        let refinement: string | undefined;
        if (match("keyword", "where")) {
          const parts: string[] = [];
          while (peek() && !(peek()!.type === "punct" && [",", "}"] .includes(peek()!.value))) {
            parts.push(consume().value);
          }
          refinement = parts.join(" ");
        }
        fields.push({ name: fname, type: ftype, refinement });
        match("punct", ",");
      }
      return { kind: "RecordType", fields };
    }
    // union
    if (match("identifier")) {
      i--; // reset
    }
    const variants: Variant[] = [];
    while (true) {
      const vname = consume("identifier").value;
      let fields: Field[] = [];
      if (match("punct", "{")) {
        while (!match("punct", "}")) {
          const fname = consume("identifier").value;
          consume("punct", ":");
          const ftype = parseTypeExpr();
          let refinement: string | undefined;
          if (match("keyword", "where")) {
            const parts: string[] = [];
            while (peek() && !(peek()!.type === "punct" && [",", "}"] .includes(peek()!.value))) {
              parts.push(consume().value);
            }
            refinement = parts.join(" ");
          }
          fields.push({ name: fname, type: ftype, refinement });
          match("punct", ",");
        }
      }
      variants.push({ name: vname, fields });
      if (!match("punct", "|")) break;
    }
    return { kind: "UnionType", variants };
  }

  function parseFunc(): FuncDecl {
    expectKeyword("func");
    const name = consume("identifier").value;
    consume("punct", "(");
    const args = collectUntil(")");
    consume("punct", ")");
    consume("punct", ":");
    const ret = collectUntil("{");
    consume("punct", "{");
    const body = collectUntil("}");
    consume("punct", "}");
    return { kind: "FuncDecl", name, args, returnType: ret.trim(), body, span: { start: span(), end: span() } };
  }

  function parseEffect(): EffectDecl {
    expectKeyword("effect");
    const name = consume("identifier").value;
    consume("punct", "(");
    const args = collectUntil(")");
    consume("punct", ")");
    consume("punct", ":");
    const result = collectUntil("uses");
    expectKeyword("uses");
    const uses: string[] = [];
    while (true) {
      const u = consume("identifier").value;
      uses.push(u);
      if (!match("punct", ",")) break;
    }
    consume("punct", "{");
    const body = collectUntil("}");
    consume("punct", "}");
    return { kind: "EffectDecl", name, args, result: result.trim(), uses, body, span: { start: span(), end: span() } };
  }

  function collectUntil(endToken: string): string {
    const parts: string[] = [];
    let depth = 0;
    while (i < tokens.length) {
      const t = tokens[i];
      if (t.value === endToken && depth === 0) break;
      if (t.type === "punct") {
        if (t.value === "(") depth++;
        if (t.value === ")") depth--;
      }
      parts.push(t.value);
      i++;
    }
    return parts.join(" ");
  }
}
