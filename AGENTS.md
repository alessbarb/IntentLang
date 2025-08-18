¡Perfecto, Alessandro! Si es un proyecto nuevo, te dejo el **kickoff completo** para arrancar **IntentLang (IL)** desde cero —con repo, estructura, CLI mínima, parser inicial, checker básico y transpiler a TypeScript. Código en **inglés**, explicación en **castellano**. Luego ya iteramos.

---

# Plan de arranque

**Meta del MVP (v0.1):**

* Parsear un **subset** de IL: `intent`, `uses`, `types`, `func`, `effect`.
* **Typecheck** básico: que los `effect ... uses ...` existan en `uses { ... }`.
* **Transpilar a TypeScript**: tipos, firmas y *stubs* con DI de capacidades —listo para que el equipo rellene lógica.
* **CLI**: `ilc check`, `ilc build --target ts`.

---

# Estructura del repo (pnpm workspaces)

```
intentlang/
├─ package.json
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
├─ packages/
│  ├─ core/            # parser + AST + checker + transpiler + runtime básico
│  │  ├─ package.json
│  │  ├─ tsconfig.json
│  │  └─ src/
│  │     ├─ ast.ts
│  │     ├─ lexer.ts
│  │     ├─ parser.ts
│  │     ├─ checker.ts
│  │     ├─ transpilers/
│  │     │  └─ typescript.ts
│  │     ├─ runtime/
│  │     │  └─ index.ts
│  │     └─ index.ts
│  ├─ cli/             # binario `ilc`
│  │  ├─ package.json
│  │  ├─ tsconfig.json
│  │  └─ src/
│  │     └─ index.ts
│  └─ examples/
│     ├─ package.json
│     └─ user_service.il
└─ README.md
```

---

## Archivos raíz

**`package.json` (root)**

```json
{
  "name": "intentlang",
  "private": true,
  "version": "0.1.0",
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "pnpm -r --filter ./packages... run build",
    "dev": "pnpm -r --filter ./packages... run dev",
    "lint": "pnpm -r --filter ./packages... run lint",
    "test": "pnpm -r --filter ./packages... run test"
  },
  "devDependencies": {
    "typescript": "^5.5.4"
  }
}
```

**`pnpm-workspace.yaml`**

```yaml
packages:
  - "packages/*"
```

**`tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "declaration": true,
    "strict": true,
    "skipLibCheck": true,
    "noEmitOnError": true,
    "resolveJsonModule": true,
    "verbatimModuleSyntax": true,
    "types": []
  }
}
```

---

## packages/core

**`packages/core/package.json`**

```json
{
  "name": "@intentlang/core",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "sideEffects": false,
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "dev": "tsc -p tsconfig.json -w",
    "lint": "echo \"(add eslint later)\"",
    "test": "echo \"(add vitest later)\""
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.5.4"
  }
}
```

**`packages/core/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

**`packages/core/src/ast.ts`** — (tipos del AST mínimo)

```ts
export type Position = { line: number; column: number; index: number };
export type Span = { start: Position; end: Position };

export type Identifier = { kind: "Identifier"; name: string; span: Span };

export type Program = {
  kind: "Program";
  intent?: IntentSection;
  uses?: UsesSection;
  types?: TypesSection;
  items: TopLevel[];
  span: Span;
};

export type IntentSection = {
  kind: "IntentSection";
  description: string;
  tags: string[];
  span: Span;
};

export type UsesSection = {
  kind: "UsesSection";
  entries: UseDecl[];
  span: Span;
};

export type UseDecl = {
  kind: "UseDecl";
  name: Identifier;         // e.g., http
  typeName: Identifier;     // e.g., Http
  params: Record<string, Literal>;
  span: Span;
};

export type TypesSection = {
  kind: "TypesSection";
  declarations: TypeDecl[];
  span: Span;
};

export type TypeDecl = {
  kind: "TypeDecl";
  name: Identifier;
  expr: TypeExpr;
  refinement?: string; // captured raw for now
  span: Span;
};

export type TypeExpr =
  | BasicType
  | BrandType
  | RecordType
  | UnionType
  | GenericType
  | LiteralType;

export type LiteralType = { kind: "LiteralType"; value: string; span: Span };
export type BasicType = { kind: "BasicType"; name: "Bool"|"Int"|"Float"|"String"|"Bytes"|"Uuid"|"DateTime"; span: Span };
export type BrandType = { kind: "BrandType"; base: BasicType; brand: string; span: Span };

export type RecordField = {
  kind: "RecordField";
  name: Identifier;
  type: TypeExpr;
  refinement?: string;
  span: Span;
};

export type RecordType = {
  kind: "RecordType";
  fields: RecordField[];
  span: Span;
};

export type UnionCtor = {
  kind: "UnionCtor";
  name: Identifier;
  fields?: RecordType;
  span: Span;
};

export type UnionType = {
  kind: "UnionType";
  ctors: UnionCtor[];
  span: Span;
};

export type GenericType = {
  kind: "GenericType";
  name: Identifier;        // List, Map, Option, Result...
  params: TypeExpr[];
  span: Span;
};

export type FuncDecl = {
  kind: "FuncDecl";
  name: Identifier;
  params: ParamSig[];
  returnType: TypeExpr;
  bodyRaw: string; // v0.1: keep body as raw IL text for scaffolding
  span: Span;
};

export type EffectDecl = {
  kind: "EffectDecl";
  name: Identifier;
  params: ParamSig[];
  returnType: TypeExpr;
  uses: Identifier[];
  bodyRaw: string; // v0.1: keep body as raw IL text
  span: Span;
};

export type ParamSig = {
  kind: "ParamSig";
  name: Identifier;
  type: TypeExpr;
  span: Span;
};

export type TopLevel = FuncDecl | EffectDecl | TypesSection | UsesSection | IntentSection;

export type Literal =
  | { kind: "String"; value: string; span: Span }
  | { kind: "Number"; value: number; span: Span }
  | { kind: "Bool"; value: boolean; span: Span };
```

**`packages/core/src/lexer.ts`** — (lexer ligero para tokens clave; simplificado)

```ts
export type Token = {
  type:
    | "kw_intent" | "kw_tags" | "kw_uses" | "kw_types"
    | "kw_type" | "kw_where" | "kw_func" | "kw_effect"
    | "kw_uses_in_effect" // captures 'uses' after effect signature
    | "ident" | "string" | "number" | "lbrace" | "rbrace"
    | "lparen" | "rparen" | "lbrack" | "rbrack"
    | "colon" | "comma" | "semi" | "eq" | "pipe" | "arrow" | "lt" | "gt"
    | "bar" | "brand" | "eof";
  value?: string;
  index: number;
  line: number;
  column: number;
};

const kw = new Map<string, Token["type"]>([
  ["intent", "kw_intent"],
  ["tags", "kw_tags"],
  ["uses", "kw_uses"],
  ["types", "kw_types"],
  ["type", "kw_type"],
  ["where", "kw_where"],
  ["func", "kw_func"],
  ["effect", "kw_effect"]
]);

export function lex(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0, line = 1, col = 1;

  const push = (type: Token["type"], value?: string) =>
    tokens.push({ type, value, index: i, line, column: col });

  const advance = (n = 1) => {
    for (let k = 0; k < n; k++) {
      if (input[i] === "\n") { line++; col = 1; }
      else col++;
      i++;
    }
  };

  const isAlpha = (c: string) => /[A-Za-z_]/.test(c);
  const isAlnum = (c: string) => /[A-Za-z0-9_]/.test(c);
  const isDigit = (c: string) => /[0-9]/.test(c);
  const peek = () => input[i] ?? "";
  const peek2 = () => input[i+1] ?? "";

  while (i < input.length) {
    const c = peek();

    // skip spaces/comments
    if (/\s/.test(c)) { advance(); continue; }
    if (c === "/" && peek2() === "/") {
      while (i < input.length && peek() !== "\n") advance();
      continue;
    }
    if (c === "/" && peek2() === "*") {
      advance(2);
      while (i < input.length && !(peek() === "*" && peek2() === "/")) advance();
      advance(2);
      continue;
    }

    // punctuation
    if (c === "{") { push("lbrace"); advance(); continue; }
    if (c === "}") { push("rbrace"); advance(); continue; }
    if (c === "(") { push("lparen"); advance(); continue; }
    if (c === ")") { push("rparen"); advance(); continue; }
    if (c === "[") { push("lbrack"); advance(); continue; }
    if (c === "]") { push("rbrack"); advance(); continue; }
    if (c === ":") { push("colon"); advance(); continue; }
    if (c === ",") { push("comma"); advance(); continue; }
    if (c === ";") { push("semi"); advance(); continue; }
    if (c === "=" && peek2() !== ">") { push("eq"); advance(); continue; }
    if (c === "|") { push("pipe"); advance(); continue; }
    if (c === "<") { push("lt"); advance(); continue; }
    if (c === ">") { push("gt"); advance(); continue; }
    if (c === "-" && peek2() === ">") { push("arrow"); advance(2); continue; }

    // string
    if (c === '"' || c === "'") {
      const quote = c; advance();
      let out = "";
      while (i < input.length && peek() !== quote) {
        if (peek() === "\\" && (peek2() === quote || peek2() === "\\")) {
          advance(); out += peek(); advance(); continue;
        }
        out += peek(); advance();
      }
      advance(); // closing
      push("string", out);
      continue;
    }

    // number
    if (isDigit(c)) {
      let out = c; advance();
      while (isDigit(peek())) { out += peek(); advance(); }
      push("number", out);
      continue;
    }

    // ident / keyword
    if (isAlpha(c)) {
      let out = c; advance();
      while (isAlnum(peek())) { out += peek(); advance(); }
      const t = kw.get(out);
      push(t ?? "ident", out);
      continue;
    }

    throw new Error(`Unexpected char '${c}' at ${line}:${col}`);
  }
  tokens.push({ type: "eof", index: i, line, column: col });
  return tokens;
}
```

**`packages/core/src/parser.ts`** — (parser recursivo pequeño para el subset v0.1)

```ts
import type {
  Program, IntentSection, UsesSection, UseDecl, TypesSection, TypeDecl, TypeExpr,
  BasicType, BrandType, RecordType, RecordField, UnionType, UnionCtor, GenericType,
  Identifier, FuncDecl, EffectDecl, ParamSig, Span
} from "./ast";
import { lex, type Token } from "./lexer";

export function parse(input: string): Program {
  const tokens = lex(input);
  let p = 0;

  const cur = () => tokens[p];
  const eat = (type?: Token["type"]) => {
    const t = tokens[p++];
    if (type && t.type !== type) throw err(`Expected ${type} but got ${t.type}`, t);
    return t;
  };
  const peek = (type: Token["type"]) => cur().type === type;
  const err = (msg: string, t = cur()) => new Error(`${msg} at ${t.line}:${t.column}`);

  const pos = (): Span => ({
    start: { line: cur().line, column: cur().column, index: cur().index },
    end: { line: cur().line, column: cur().column, index: cur().index }
  });

  const ident = (): Identifier => {
    const t = eat("ident");
    return { kind: "Identifier", name: t.value!, span: pos() };
  };

  const string = () => eat("string").value!;
  const number = () => Number(eat("number").value!);

  // --- parse sections ---
  let intent: IntentSection | undefined;
  let uses: UsesSection | undefined;
  let types: TypesSection | undefined;
  const items: (FuncDecl | EffectDecl | TypesSection | UsesSection | IntentSection)[] = [];

  while (!peek("eof")) {
    if (peek("kw_intent")) {
      items.push(intent = parseIntent());
      continue;
    }
    if (peek("kw_uses")) {
      items.push(uses = parseUses());
      continue;
    }
    if (peek("kw_types")) {
      items.push(types = parseTypes());
      continue;
    }
    if (peek("kw_func")) {
      items.push(parseFunc());
      continue;
    }
    if (peek("kw_effect")) {
      items.push(parseEffect());
      continue;
    }
    throw err(`Unexpected token ${cur().type}`);
  }

  const span = { start: { line: 1, column: 1, index: 0 }, end: cur().line ? { line: cur().line, column: cur().column, index: cur().index } : { line: 1, column: 1, index: 0 } };
  return { kind: "Program", intent, uses, types, items, span };

  function parseIntent(): IntentSection {
    const start = pos();
    eat("kw_intent");
    const description = eat("string").value!;
    eat("kw_tags");
    eat("lbrack");
    const tags: string[] = [];
    if (!peek("rbrack")) {
      tags.push(string());
      while (peek("comma")) { eat("comma"); tags.push(string()); }
    }
    eat("rbrack");
    return { kind: "IntentSection", description, tags, span: start };
  }

  function parseUses(): UsesSection {
    const start = pos();
    eat("kw_uses");
    eat("lbrace");
    const entries: UseDecl[] = [];
    while (!peek("rbrace")) {
      const name = ident();
      eat("colon");
      const typeName = ident();
      let params: Record<string, any> = {};
      if (peek("lbrace")) {
        eat("lbrace");
        params = parseParams();
        eat("rbrace");
      }
      if (peek("comma")) eat("comma");
      entries.push({ kind: "UseDecl", name, typeName, params, span: start });
    }
    eat("rbrace");
    return { kind: "UsesSection", entries, span: start };
  }

  function parseParams(): Record<string, any> {
    const out: Record<string, any> = {};
    while (!peek("rbrace")) {
      const k = ident().name;
      eat("colon");
      if (peek("string")) out[k] = string();
      else if (peek("number")) out[k] = number();
      else if (peek("ident")) out[k] = cur().value!, eat("ident");
      else throw err("Expected literal param");
      if (peek("comma")) eat("comma");
    }
    return out;
  }

  function parseTypes(): TypesSection {
    const start = pos();
    eat("kw_types");
    eat("lbrace");
    const declarations: TypeDecl[] = [];
    while (!peek("rbrace")) {
      declarations.push(parseTypeDecl());
    }
    eat("rbrace");
    return { kind: "TypesSection", declarations, span: start };
  }

  function parseTypeDecl(): TypeDecl {
    const start = pos();
    eat("kw_type");
    const name = ident();
    eat("eq");
    const expr = parseTypeExpr();
    let refinement: string | undefined;
    if (peek("kw_where")) {
      eat("kw_where");
      // v0.1: capture remainder of line as refinement text
      refinement = captureUntil(["semi", "comma", "rbrace"]);
    }
    if (peek("semi")) eat("semi");
    if (peek("comma")) eat("comma");
    return { kind: "TypeDecl", name, expr, refinement, span: start };
  }

  function parseTypeExpr(): TypeExpr {
    // Basic | Branded | Record | Union | Generic | LiteralType
    if (peek("lbrace")) return parseRecordType();
    // Generic like Option<T>
    if (peek("ident") && tokens[p+1]?.type === "lt") return parseGenericType();

    // Union A | B | C
    const first = parseCtorOrBasicOrBrandOrLiteral();
    if (peek("pipe")) {
      const ctors: UnionCtor[] = [asCtor(first)];
      while (peek("pipe")) {
        eat("pipe");
        ctors.push(parseCtor());
      }
      return { kind: "UnionType", ctors, span: first.span };
    }
    return first;

    function asCtor(x: TypeExpr): UnionCtor {
      if (x.kind === "LiteralType") return { kind: "UnionCtor", name: { kind: "Identifier", name: JSON.stringify(x.value), span: x.span }, span: x.span };
      if (x.kind === "BasicType" || x.kind === "BrandType" || x.kind === "GenericType")
        return { kind: "UnionCtor", name: { kind: "Identifier", name: typeToString(x), span: x.span }, span: x.span };
      if (x.kind === "RecordType") throw err("Record not allowed as bare ctor");
      // fallback
      return { kind: "UnionCtor", name: { kind: "Identifier", name: "Unknown", span: x.span }, span: x.span };
    }
  }

  function parseCtor(): UnionCtor {
    const name = ident();
    let fields: RecordType | undefined;
    if (peek("lbrace")) fields = parseRecordType();
    return { kind: "UnionCtor", name, fields, span: name.span };
  }

  function parseRecordType(): RecordType {
    const start = pos();
    eat("lbrace");
    const fields: RecordField[] = [];
    while (!peek("rbrace")) {
      const fname = ident();
      eat("colon");
      const ftype = parseTypeExpr();
      let refinement: string | undefined;
      if (peek("kw_where")) { eat("kw_where"); refinement = captureUntil(["comma", "rbrace"]); }
      if (peek("comma")) eat("comma");
      fields.push({ kind: "RecordField", name: fname, type: ftype, refinement, span: start });
    }
    eat("rbrace");
    return { kind: "RecordType", fields, span: start };
  }

  function parseGenericType(): GenericType {
    const name = ident();
    eat("lt");
    const params: TypeExpr[] = [];
    params.push(parseTypeExpr());
    while (peek("comma")) { eat("comma"); params.push(parseTypeExpr()); }
    eat("gt");
    return { kind: "GenericType", name, params, span: name.span };
  }

  function parseCtorOrBasicOrBrandOrLiteral(): TypeExpr {
    if (peek("string")) return { kind: "LiteralType", value: string(), span: pos() };
    const nameTok = eat("ident");
    const basicNames = new Set(["Bool","Int","Float","String","Bytes","Uuid","DateTime"]);
    const base: BasicType = basicNames.has(nameTok.value!)
      ? { kind: "BasicType", name: nameTok.value! as any, span: pos() }
      : { kind: "BasicType", name: "String", span: pos() }; // treat unknown as alias to String for v0.1

    if (peek("ident") && cur().value === "brand") {
      eat("ident"); // brand
      const brandName = eat("string").value!;
      return { kind: "BrandType", base, brand: brandName, span: base.span };
    }
    return base;
  }

  function captureUntil(stops: Token["type"][]): string {
    const parts: string[] = [];
    while (!stops.includes(cur().type)) {
      parts.push(cur().value ?? cur().type);
      p++;
    }
    return parts.join(" ").trim();
  }

  function parseParamsSig(): ParamSig[] {
    const out: ParamSig[] = [];
    if (!peek("rparen")) {
      out.push(parseParam());
      while (peek("comma")) { eat("comma"); out.push(parseParam()); }
    }
    return out;

    function parseParam(): ParamSig {
      const name = ident();
      eat("colon");
      const type = parseTypeExpr();
      return { kind: "ParamSig", name, type, span: name.span };
    }
  }

  function parseFunc(): FuncDecl {
    const start = pos();
    eat("kw_func");
    const name = ident();
    eat("lparen");
    const params = parseParamsSig();
    eat("rparen");
    eat("colon");
    const ret = parseTypeExpr();
    const bodyRaw = parseBlockRaw();
    return { kind: "FuncDecl", name, params, returnType: ret, bodyRaw, span: start };
  }

  function parseEffect(): EffectDecl {
    const start = pos();
    eat("kw_effect");
    const name = ident();
    eat("lparen");
    const params = parseParamsSig();
    eat("rparen");
    eat("colon");
    const ret = parseTypeExpr();
    // 'uses a, b, c'
    eat("ident"); // 'uses' (v0.1: not tokenized specially)
    const uses: Identifier[] = [ident()];
    while (peek("comma")) { eat("comma"); uses.push(ident()); }
    const bodyRaw = parseBlockRaw();
    return { kind: "EffectDecl", name, params, returnType: ret, uses, bodyRaw, span: start };
  }

  function parseBlockRaw(): string {
    // Capture balanced braces as raw text
    eat("lbrace");
    let depth = 1;
    const startIndex = tokens[p].index;
    let endIndex = startIndex;
    while (p < tokens.length && depth > 0) {
      if (cur().type === "lbrace") depth++;
      if (cur().type === "rbrace") depth--;
      endIndex = cur().index;
      p++;
    }
    // slice original text — simpler: not implemented since we don't pass original string span.
    // v0.1: return empty body placeholder
    return "// TODO: body parsing in v0.2";
  }

  function typeToString(t: TypeExpr): string {
    switch (t.kind) {
      case "BasicType": return t.name;
      case "BrandType": return `${t.base.name} & Brand<"${t.brand}">`;
      case "LiteralType": return JSON.stringify(t.value);
      case "GenericType": return `${t.name.name}<${t.params.map(typeToString).join(", ")}>`;
      case "RecordType": return `{ ${t.fields.map(f => `${f.name.name}: ${typeToString(f.type)}`).join("; ")} }`;
      case "UnionType": return t.ctors.map(c => c.name.name).join(" | ");
    }
  }
}
```

**`packages/core/src/checker.ts`** — (checker mínimo de capacidades)

```ts
import type { Program, EffectDecl } from "./ast";

export type Diagnostic = {
  level: "error" | "warning";
  message: string;
};

export function checkCapabilities(program: Program): Diagnostic[] {
  const diags: Diagnostic[] = [];
  const declared = new Set(
    program.uses?.entries.map(u => u.name.name) ?? []
  );

  for (const item of program.items) {
    if (item.kind === "EffectDecl") {
      for (const u of item.uses) {
        if (!declared.has(u.name)) {
          diags.push({
            level: "error",
            message: `Effect '${item.name.name}' uses undeclared capability '${u.name}'.`
          });
        }
      }
    }
  }
  return diags;
}

export function check(program: Program): Diagnostic[] {
  return [
    ...checkCapabilities(program),
    // TODO: duplicate names, unknown types, union exhaustiveness (later)
  ];
}
```

**`packages/core/src/transpilers/typescript.ts`** — (emisor TS)

```ts
import type {
  Program, TypeDecl, TypeExpr, RecordType, UnionType, BrandType, BasicType, LiteralType, GenericType,
  FuncDecl, EffectDecl
} from "../ast";

export function emitTypeScript(program: Program): string {
  const out: string[] = [];
  out.push(`// Generated by IntentLang v0.1`);
  out.push(`// DO NOT EDIT MANUALLY\n`);

  out.push(runtimePrelude());

  if (program.types) {
    for (const t of program.types.declarations) {
      out.push(emitTypeDecl(t));
    }
    out.push("");
  }

  const usesDecl = program.uses?.entries ?? [];
  if (usesDecl.length) {
    out.push(`// Declared capabilities`);
    out.push(`export type Capabilities = {`);
    for (const u of usesDecl) {
      out.push(`  ${u.name.name}: ${u.typeName.name};`);
    }
    out.push(`};\n`);
  } else {
    out.push(`export type Capabilities = {};`);
  }

  for (const item of program.items) {
    if (item.kind === "FuncDecl") out.push(emitFunc(item));
    if (item.kind === "EffectDecl") out.push(emitEffect(item));
  }

  return out.join("\n");
}

function emitTypeDecl(t: TypeDecl): string {
  return `export type ${t.name.name} = ${tsType(t.expr)};`;
}

function tsType(t: TypeExpr): string {
  switch (t.kind) {
    case "BasicType": return basicToTs(t);
    case "BrandType": return `(${basicToTs(t.base)}) & Brand<"${t.brand}">`;
    case "LiteralType": return JSON.stringify(t.value);
    case "RecordType":
      return `{\n${t.fields.map(f => `  ${f.name.name}: ${tsType(f.type)};`).join("\n")}\n}`;
    case "UnionType":
      return t.ctors.map(c => c.fields
        ? `{ type: "${c.name.name}", ${c.fields.fields.map(f => `${f.name.name}: ${tsType(f.type)}`).join("; ")} }`
        : `{ type: "${c.name.name}" }`
      ).join(" | ");
    case "GenericType":
      return `${t.name.name}<${t.params.map(tsType).join(", ")}>`;
  }
}

function basicToTs(b: BasicType): string {
  switch (b.name) {
    case "Bool": return "boolean";
    case "Int":
    case "Float": return "number";
    case "String": return "string";
    case "Bytes": return "Uint8Array";
    case "Uuid": return "string";
    case "DateTime": return "string";
  }
}

function emitFunc(fn: FuncDecl): string {
  const paramsTs = fn.params.map(p => `${p.name.name}: ${tsType(p.type)}`).join(", ");
  const retTs = tsType(fn.returnType);
  return [
    `export function ${fn.name.name}(${paramsTs}): ${retTs} {`,
    `  // IL body (v0.1 placeholder)`,
    `  throw new Error("Not implemented");`,
    `}\n`,
  ].join("\n");
}

function emitEffect(eff: EffectDecl): string {
  const paramsTs = ["deps: Capabilities", ...eff.params.map(p => `${p.name.name}: ${tsType(p.type)}`)].join(", ");
  const retTs = tsType(eff.returnType);
  return [
    `export async function ${eff.name.name}(${paramsTs}): Promise<${retTs}> {`,
    `  // Required capabilities: ${eff.uses.map(u => u.name).join(", ")}`,
    `  // IL body (v0.1 placeholder)`,
    `  throw new Error("Not implemented");`,
    `}\n`,
  ].join("\n");
}

function runtimePrelude(): string {
  return `
export type Brand<K extends string> = { __brand: K };

export type Option<T> = { kind: "some"; value: T } | { kind: "none" };
export const None: Option<never> = { kind: "none" };
export const Some = <T>(value: T): Option<T> => ({ kind: "some", value });

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
export const Ok = <T, E = never>(value: T): Result<T, E> => ({ ok: true, value });
export const Err = <T = never, E = unknown>(error: E): Result<T, E> => ({ ok: false, error });
  `.trim();
}
```

**`packages/core/src/runtime/index.ts`** — (exporta runtime por si alguien lo necesita)

```ts
export type Brand<K extends string> = { __brand: K };

export type Option<T> = { kind: "some"; value: T } | { kind: "none" };
export const None: Option<never> = { kind: "none" };
export const Some = <T>(value: T): Option<T> => ({ kind: "some", value });

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
export const Ok = <T, E = never>(value: T): Result<T, E> => ({ ok: true, value });
export const Err = <T = never, E = unknown>(error: E): Result<T, E> => ({ ok: false, error });
```

**`packages/core/src/index.ts`**

```ts
export * as AST from "./ast";
export { parse } from "./parser";
export { check } from "./checker";
export { emitTypeScript } from "./transpilers/typescript";
```

---

## packages/cli

**`packages/cli/package.json`**

```json
{
  "name": "@intentlang/cli",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "ilc": "dist/index.js"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "dev": "tsc -p tsconfig.json -w",
    "lint": "echo \"(add eslint later)\"",
    "test": "echo \"(add vitest later)\""
  },
  "dependencies": {
    "@intentlang/core": "0.1.0",
    "commander": "^12.1.0"
  },
  "devDependencies": {
    "typescript": "^5.5.4"
  }
}
```

**`packages/cli/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

**`packages/cli/src/index.ts`** — (CLI mínima)

```ts
#!/usr/bin/env node
import { Command } from "commander";
import * as fs from "node:fs";
import * as path from "node:path";
import { parse, check, emitTypeScript } from "@intentlang/core";

const program = new Command();
program.name("ilc").description("IntentLang CLI").version("0.1.0");

program
  .command("check")
  .argument("<file>", "IL source file")
  .action((file) => {
    const src = fs.readFileSync(file, "utf8");
    const ast = parse(src);
    const diags = check(ast);
    if (diags.length) {
      console.error("Diagnostics:");
      for (const d of diags) {
        console.error(`- [${d.level}] ${d.message}`);
      }
      process.exitCode = 1;
    } else {
      console.log("OK: no issues found.");
    }
  });

program
  .command("build")
  .argument("<file>", "IL source file")
  .option("--target <target>", "Output target", "ts")
  .option("-o, --out <dir>", "Output dir", "dist")
  .action((file, opts) => {
    const src = fs.readFileSync(file, "utf8");
    const ast = parse(src);
    const diags = check(ast);
    if (diags.length) {
      console.error("Build aborted due to diagnostics:");
      for (const d of diags) console.error(`- [${d.level}] ${d.message}`);
      process.exitCode = 1;
      return;
    }
    if (opts.target !== "ts") {
      console.error(`Unsupported target: ${opts.target}`);
      process.exitCode = 2;
      return;
    }
    const out = emitTypeScript(ast);
    fs.mkdirSync(opts.out, { recursive: true });
    const base = path.basename(file).replace(/\.il$/, ".ts");
    const dest = path.join(opts.out, base);
    fs.writeFileSync(dest, out, "utf8");
    console.log(`Built: ${dest}`);
  });

program.parse();
```

---

## packages/examples

**`packages/examples/package.json`**

```json
{
  "name": "@intentlang/examples",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "echo \"Examples only\""
  }
}
```

**`packages/examples/user_service.il`** — (demo simple)

```intentlang
intent "User service" tags ["api", "users"]

uses {
  http: Http { baseUrl: "https://api.example.com", timeoutMs: 2500 },
  clock: Clock { }
}

types {
  type Email  = String brand "Email" where matches("^[^@]+@[^@]+\\.[^@]+$");
  type UserId = Uuid;
  type User = {
    id: UserId,
    name: String where _.length >= 2,
    email: Email,
    createdAt: DateTime,
  };
  type CreateUserInput = { name: String, email: Email };
  type ApiError = { code: Int, message: String };
  type ResultUser = Result<User, ApiError>;
}

func toEmail(s: String): Result<String, String> : {
  // TODO: implement in v0.2
}

effect createUser(input: CreateUserInput): ResultUser uses http, clock {
  // TODO: implement in v0.2
}
```

---

# Cómo correrlo

1. Instala dependencias:

```bash
pnpm install
```

2. Build de todo:

```bash
pnpm build
```

3. Chequear un archivo:

```bash
pnpm --filter @intentlang/cli ilc check packages/examples/user_service.il
```

4. Transpilar a TypeScript:

```bash
pnpm --filter @intentlang/cli ilc build packages/examples/user_service.il --target ts --out dist/examples
```

Se generará `dist/examples/user_service.ts` con:

* Tipos TS equivalentes
* `Capabilities` derivado de `uses`
* Stubs de `toEmail` y `createUser` —con DI en `createUser(deps: Capabilities, input: ...)`

---

# Roadmap inmediato (v0.2 → v0.4)

* **v0.2**: parser de **expresiones** y **bloques** (let/if/call/match), `Result` helpers, `match` exhaustivo con chequeo en compile-time.
* **v0.3**: **refinements** evaluables (subconjunto: `length`, `matches`, comparadores), parseadores seguros (`parseUuid`, `parseDateTime`).
* **v0.4**: **tests** integrados (`test` block), **contracts** (`requires/ensures` → asserts TS), seeds deterministas para RNG/Clock.

---

# Por qué este MVP ya aporta valor

* Te da **tipos y firmas** correctas a la primera —la IA puede completar la lógica sin “pegarse” con imports o deps.
* Obliga a declarar **capacidades** —la asincronía y los efectos quedan claras, ¿no te parece?
* Sirve como **scaffolder** seguro: crea la capa TS con DI y runtime mínimo.

---

Si te cuadra, lo dejamos así como **base ejecutable**. A partir de aquí, preparo la **v0.2** con el parser de expresiones y el `match` exhaustivo —y te convierto el ejemplo `createUser` completo a TS funcional con `Ok/Err`. ¿Seguimos por ahí?
