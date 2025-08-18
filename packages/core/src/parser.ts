// Parser recursivo con expresiones, sentencias y match exhaustivo (estructura)
import {
  type Program,
  type IntentSection,
  type UsesSection,
  type UseDecl,
  type TypesSection,
  type TypeDecl,
  type TypeExpr,
  type BasicType,
  type BrandType,
  type RecordType,
  type RecordField,
  type UnionType,
  type UnionCtor,
  type GenericType,
  type LiteralType,
  type Identifier,
  type FuncDecl,
  type EffectDecl,
  type ParamSig,
  type Block,
  type Stmt,
  type LetStmt,
  type ReturnStmt,
  type IfStmt,
  type MatchStmt,
  type ExprStmt,
  type Expr,
  type Literal,
  type LiteralExpr,
  type IdentifierExpr,
  type ObjectExpr,
  type ObjectField,
  type ArrayExpr,
  type CallExpr,
  type MemberExpr,
  type UnaryExpr,
  type BinaryExpr,
  type ResultOkExpr,
  type ResultErrExpr,
  type OptionSomeExpr,
  type OptionNoneExpr,
  type BrandCastExpr,
  type VariantExpr,
  type MatchExpr,
  type CaseClause,
  type Pattern,
  type PatternField,
  type VariantPattern,
  type LiteralPattern,
  type Span,
} from "./ast";
import { lex, type Token } from "./lexer";

export function parse(input: string): Program {
  const tokens = lex(input);
  let p = 0;

  const cur = () => tokens[p];
  const next = () => tokens[p + 1];
  const peek = (t: Token["type"]) => cur().type === t;
  const atEnd = () => cur().type === "eof";

  const expect = (type: Token["type"], msg?: string) => {
    const t = cur();
    if (t.type !== type) error(msg ?? `Expected ${type}, got ${t.type}`);
    p++;
    return t;
  };
  function eat(type: Token["type"]) {
    if (cur().type === type) {
      const t = cur();
      p++;
      return t;
    }
    return null;
  }
  function error(msg: string): never {
    throw new Error(`${msg} at ${cur().line}:${cur().column}`);
  }

  const spanHere = (): Span => ({
    start: { line: cur().line, column: cur().column, index: cur().index },
    end: { line: cur().line, column: cur().column, index: cur().index },
  });

  /* ========= Program ========= */
  let intent: IntentSection | undefined;
  let uses: UsesSection | undefined;
  let types: TypesSection | undefined;
  const items: Array<
    FuncDecl | EffectDecl | TypesSection | UsesSection | IntentSection
  > = [];

  while (!atEnd()) {
    if (peek("kw_intent")) {
      const s = parseIntent();
      intent = s;
      items.push(s);
      continue;
    }
    if (peek("kw_uses")) {
      const s = parseUses();
      uses = s;
      items.push(s);
      continue;
    }
    if (peek("kw_types")) {
      const s = parseTypes();
      types = s;
      items.push(s);
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
    error(`Unexpected token ${cur().type} in top-level`);
  }

  const span: Span = {
    start: { line: 1, column: 1, index: 0 },
    end: { line: cur().line, column: cur().column, index: cur().index },
  };
  return { kind: "Program", intent, uses, types, items, span };

  /* ========= Sections ========= */

  function parseIntent(): IntentSection {
    const s = spanHere();
    expect("kw_intent");
    const description = expect("string").value!;
    expect("kw_tags");
    expect("lbrack");
    const tags: string[] = [];
    if (!peek("rbrack")) {
      tags.push(expect("string").value!);
      while (eat("comma")) tags.push(expect("string").value!);
    }
    expect("rbrack");
    return { kind: "IntentSection", description, tags, span: s };
  }

  function parseUses(): UsesSection {
    const s = spanHere();
    expect("kw_uses");
    expect("lbrace");
    const entries: UseDecl[] = [];
    while (!peek("rbrace")) {
      const name = parseIdent();
      expect("colon");
      const typeName = parseIdent();
      let params: Record<string, Literal> = {};
      if (eat("lbrace")) {
        params = parseParams();
        expect("rbrace");
      }
      if (eat("comma")) {
        /*optional*/
      }
      entries.push({ kind: "UseDecl", name, typeName, params, span: s });
    }
    expect("rbrace");
    return { kind: "UsesSection", entries, span: s };
  }

  function parseParams(): Record<string, Literal> {
    const out: Record<string, Literal> = {};
    while (!peek("rbrace")) {
      const k = parseIdent().name;
      expect("colon");
      out[k] = parseLiteral();
      if (eat("comma")) continue;
    }
    return out;
  }

  function parseTypes(): TypesSection {
    const s = spanHere();
    expect("kw_types");
    expect("lbrace");
    const declarations: TypeDecl[] = [];
    while (!peek("rbrace")) declarations.push(parseTypeDecl());
    expect("rbrace");
    return { kind: "TypesSection", declarations, span: s };
  }

  function parseTypeDecl(): TypeDecl {
    const s = spanHere();
    expect("kw_type");
    const name = parseIdent();
    expect("eq");
    const expr = parseTypeExpr();
    let refinement: string | undefined;
    if (eat("kw_where")) refinement = captureUntil(["semi", "comma", "rbrace"]);
    eat("semi");
    eat("comma");
    return { kind: "TypeDecl", name, expr, refinement, span: s };
  }

  /* ========= TypeExpr ========= */

  function parseTypeExpr(): TypeExpr {
    const save = p;
    const union = tryParseUnionType();
    if (union) return union;

    if (peek("lbrace")) return parseRecordType();
    if (peek("string")) return parseLiteralType();

    if (peek("ident")) {
      if (next().type === "lt") return parseGenericType();
      const basic = parseBasicTypeOrIdentAsBasic();
      if (eat("kw_brand")) {
        const brandName = expect("string").value!;
        const t: BrandType = {
          kind: "BrandType",
          base: basic,
          brand: brandName,
          span: basic.span,
        };
        return t;
      }
      return basic;
    }
    p = save;
    error("Invalid type expression");
    throw new Error("Unexpected token in type expression");
  }

  function tryParseUnionType(): UnionType | null {
    const save = p;

    if (peek("string")) {
      const ctors: UnionCtor[] = [
        { kind: "LiteralCtor", literal: parseLiteralType(), span: spanHere() },
      ];
      if (!eat("pipe")) {
        p = save;
        return null;
      }
      do {
        ctors.push({
          kind: "LiteralCtor",
          literal: parseLiteralType(),
          span: spanHere(),
        });
      } while (eat("pipe"));
      return { kind: "UnionType", ctors, span: spanHere() };
    }

    if (peek("ident")) {
      const ctor1 = parseNamedCtorMaybe();
      if (!ctor1) {
        p = save;
        return null;
      }
      if (!eat("pipe")) {
        p = save;
        return null;
      }
      const ctors: UnionCtor[] = [ctor1];
      do {
        const c = parseNamedCtorMaybe();
        if (!c) error("Expected union constructor after '|'");
        ctors.push(c);
      } while (eat("pipe"));
      return { kind: "UnionType", ctors, span: spanHere() };
    }

    p = save;
    return null;
  }

  function parseNamedCtorMaybe(): UnionCtor | null {
    if (!peek("ident")) return null;
    const name = parseIdent();
    let fields: RecordType | undefined;
    if (peek("lbrace")) fields = parseRecordType();
    return { kind: "NamedCtor", name, fields, span: name.span };
  }

  function parseRecordType(): RecordType {
    const s = spanHere();
    expect("lbrace");
    const fields: RecordField[] = [];
    while (!peek("rbrace")) {
      const fname = parseIdent();
      expect("colon");
      const ftype = parseTypeExpr();
      let refinement: string | undefined;
      if (eat("kw_where")) refinement = captureUntil(["comma", "rbrace"]);
      eat("comma");
      fields.push({
        kind: "RecordField",
        name: fname,
        type: ftype,
        refinement,
        span: s,
      });
    }
    expect("rbrace");
    return { kind: "RecordType", fields, span: s };
  }

  function parseGenericType(): GenericType {
    const name = parseIdent();
    expect("lt");
    const params: TypeExpr[] = [];
    params.push(parseTypeExpr());
    while (eat("comma")) params.push(parseTypeExpr());
    expect("gt");
    return { kind: "GenericType", name, params, span: name.span };
  }

  function parseLiteralType(): LiteralType {
    const s = spanHere();
    const lit = expect("string").value!;
    return { kind: "LiteralType", value: lit, span: s };
  }

  function parseBasicTypeOrIdentAsBasic(): BasicType {
    const t = expect("ident");
    const name = t.value!;
    const basicSet = new Set([
      "Bool",
      "Int",
      "Float",
      "String",
      "Bytes",
      "Uuid",
      "DateTime",
    ]);
    const typeName = basicSet.has(name)
      ? (name as BasicType["name"])
      : "String";
    return { kind: "BasicType", name: typeName, span: spanHere() };
  }

  function parseIdent(): Identifier {
    const t = expect("ident");
    return { kind: "Identifier", name: t.value!, span: spanHere() };
  }

  function captureUntil(stops: Token["type"][]): string {
    const parts: string[] = [];
    while (!stops.includes(cur().type)) {
      parts.push(cur().value ?? cur().type);
      p++;
    }
    return parts.join(" ").trim();
  }

  /* ========= Decls ========= */

  function parseFunc(): FuncDecl {
    const s = spanHere();
    expect("kw_func");
    const name = parseIdent();
    expect("lparen");
    const params = parseParamSigList();
    expect("rparen");
    expect("colon");
    const ret = parseTypeExpr();
    const body = parseBlock();
    return { kind: "FuncDecl", name, params, returnType: ret, body, span: s };
  }

  function parseEffect(): EffectDecl {
    const s = spanHere();
    expect("kw_effect");
    const name = parseIdent();
    expect("lparen");
    const params = parseParamSigList();
    expect("rparen");
    expect("colon");
    const ret = parseTypeExpr();
    expect("kw_uses");
    const uses: Identifier[] = [parseIdent()];
    while (eat("comma")) uses.push(parseIdent());
    const body = parseBlock();
    return {
      kind: "EffectDecl",
      name,
      params,
      returnType: ret,
      uses,
      body,
      span: s,
    };
  }

  function parseParamSigList(): ParamSig[] {
    const out: ParamSig[] = [];
    if (!peek("rparen")) {
      out.push(parseParamSig());
      while (eat("comma")) out.push(parseParamSig());
    }
    return out;
  }
  function parseParamSig(): ParamSig {
    const name = parseIdent();
    expect("colon");
    const type = parseTypeExpr();
    return { kind: "ParamSig", name, type, span: name.span };
  }

  /* ========= Blocks & Statements ========= */

  function parseBlock(): Block {
    const s = spanHere();
    expect("lbrace");
    const statements: Stmt[] = [];
    while (!peek("rbrace")) statements.push(parseStmt());
    expect("rbrace");
    return { kind: "Block", statements, span: s };
  }

  function parseStmt(): Stmt {
    if (peek("kw_let")) return parseLetStmt();
    if (peek("kw_return")) return parseReturnStmt();
    if (peek("kw_if")) return parseIfStmt();
    if (peek("kw_match")) return parseMatchStmt();
    const expr = parseExpr();
    eat("semi");
    return { kind: "ExprStmt", expression: expr, span: spanHere() };
  }

  function parseLetStmt(): LetStmt {
    const s = spanHere();
    expect("kw_let");
    const id = parseIdent();
    expect("eq");
    const init = parseExpr();
    eat("semi");
    return { kind: "LetStmt", id, init, span: s };
  }

  function parseReturnStmt(): ReturnStmt {
    const s = spanHere();
    expect("kw_return");
    if (peek("semi")) {
      eat("semi");
      return { kind: "ReturnStmt", argument: undefined, span: s };
    }
    const arg = parseExpr();
    eat("semi");
    return { kind: "ReturnStmt", argument: arg, span: s };
  }

  function parseIfStmt(): IfStmt {
    const s = spanHere();
    expect("kw_if");
    const test = parseExpr();
    const consequent = parseBlock();
    let alternate: Block | undefined;
    if (eat("kw_else")) alternate = parseBlock();
    return { kind: "IfStmt", test, consequent, alternate, span: s };
  }

  function parseMatchStmt(): MatchStmt {
    const s = spanHere();
    const m = parseMatchExpr();
    eat("semi");
    return { kind: "MatchStmt", expr: m.expr, cases: m.cases, span: s };
  }

  /* ========= Expressions ========= */

  function parseExpr(): Expr {
    return parseOr();
  }

  function parseOr(): Expr {
    let left = parseAnd();
    while (eat("oror")) {
      const right = parseAnd();
      left = { kind: "BinaryExpr", op: "||", left, right, span: spanHere() };
    }
    return left;
  }
  function parseAnd(): Expr {
    let left = parseEquality();
    while (eat("andand")) {
      const right = parseEquality();
      left = { kind: "BinaryExpr", op: "&&", left, right, span: spanHere() };
    }
    return left;
  }
  function parseEquality(): Expr {
    let left = parseRel();
    while (true) {
      if (eat("eqeq")) {
        const right = parseRel();
        left = { kind: "BinaryExpr", op: "==", left, right, span: spanHere() };
        continue;
      }
      if (eat("neq")) {
        const right = parseRel();
        left = { kind: "BinaryExpr", op: "!=", left, right, span: spanHere() };
        continue;
      }
      break;
    }
    return left;
  }
  function parseRel(): Expr {
    let left = parseAdd();
    while (true) {
      if (eat("lt")) {
        const right = parseAdd();
        left = { kind: "BinaryExpr", op: "<", left, right, span: spanHere() };
        continue;
      }
      if (eat("lte")) {
        const right = parseAdd();
        left = { kind: "BinaryExpr", op: "<=", left, right, span: spanHere() };
        continue;
      }
      if (eat("gt")) {
        const right = parseAdd();
        left = { kind: "BinaryExpr", op: ">", left, right, span: spanHere() };
        continue;
      }
      if (eat("gte")) {
        const right = parseAdd();
        left = { kind: "BinaryExpr", op: ">=", left, right, span: spanHere() };
        continue;
      }
      break;
    }
    return left;
  }
  function parseAdd(): Expr {
    let left = parseMul();
    while (true) {
      if (eat("plus")) {
        const right = parseMul();
        left = { kind: "BinaryExpr", op: "+", left, right, span: spanHere() };
        continue;
      }
      if (eat("minus")) {
        const right = parseMul();
        left = { kind: "BinaryExpr", op: "-", left, right, span: spanHere() };
        continue;
      }
      break;
    }
    return left;
  }
  function parseMul(): Expr {
    let left = parseUnary();
    while (true) {
      if (eat("star")) {
        const right = parseUnary();
        left = { kind: "BinaryExpr", op: "*", left, right, span: spanHere() };
        continue;
      }
      if (eat("slash")) {
        const right = parseUnary();
        left = { kind: "BinaryExpr", op: "/", left, right, span: spanHere() };
        continue;
      }
      if (eat("percent")) {
        const right = parseUnary();
        left = { kind: "BinaryExpr", op: "%", left, right, span: spanHere() };
        continue;
      }
      break;
    }
    return left;
  }
  function parseUnary(): Expr {
    if (eat("bang")) {
      const arg = parseUnary();
      return { kind: "UnaryExpr", op: "!", argument: arg, span: spanHere() };
    }
    if (eat("minus")) {
      const arg = parseUnary();
      return { kind: "UnaryExpr", op: "-", argument: arg, span: spanHere() };
    }
    return parsePostfix();
  }
  function parsePostfix(): Expr {
    let expr = parsePrimary();
    while (true) {
      if (eat("dot")) {
        const prop = parseIdent();
        expr = {
          kind: "MemberExpr",
          object: expr,
          property: prop,
          span: spanHere(),
        };
        continue;
      }
      if (eat("lparen")) {
        const args: Expr[] = [];
        if (!peek("rparen")) {
          args.push(parseExpr());
          while (eat("comma")) args.push(parseExpr());
        }
        expect("rparen");
        expr = { kind: "CallExpr", callee: expr, args, span: spanHere() };
        continue;
      }
      break;
    }
    return expr;
  }

  function parsePrimary(): Expr {
    if (peek("kw_match")) return parseMatchExpr();

    if (peek("string") || peek("number") || peek("kw_true") || peek("kw_false"))
      return parseLiteralExpr();

    if (eat("lbrack")) {
      const elements: Expr[] = [];
      if (!peek("rbrack")) {
        elements.push(parseExpr());
        while (eat("comma")) elements.push(parseExpr());
      }
      expect("rbrack");
      return { kind: "ArrayExpr", elements, span: spanHere() };
    }
    if (peek("lbrace")) return parseObjectExpr();
    if (eat("lparen")) {
      const e = parseExpr();
      expect("rparen");
      return e;
    }

    if (eat("kw_Ok")) {
      expect("lparen");
      const v = parseExpr();
      expect("rparen");
      return { kind: "ResultOkExpr", value: v, span: spanHere() };
    }
    if (eat("kw_Err")) {
      expect("lparen");
      const e = parseExpr();
      expect("rparen");
      return { kind: "ResultErrExpr", error: e, span: spanHere() };
    }
    if (eat("kw_Some")) {
      expect("lparen");
      const v = parseExpr();
      expect("rparen");
      return { kind: "OptionSomeExpr", value: v, span: spanHere() };
    }
    if (eat("kw_None")) {
      return { kind: "OptionNoneExpr", span: spanHere() };
    }

    if (eat("kw_brand")) {
      expect("lt");
      const target = parseIdent();
      expect("gt");
      expect("lparen");
      const value = parseExpr();
      expect("rparen");
      return { kind: "BrandCastExpr", target, value, span: spanHere() };
    }

    if (peek("ident")) {
      if (next().type === "lbrace") {
        const ctor = parseIdent();
        const fields = parseObjectFields();
        return { kind: "VariantExpr", ctor, fields, span: spanHere() };
      }
      const id = parseIdent();
      return { kind: "IdentifierExpr", id, span: spanHere() };
    }

    error(`Unexpected token ${cur().type} in expression`);
    throw new Error("Unexpected token in primary expression");
  }

  function parseLiteralExpr(): LiteralExpr {
    const s = spanHere();
    if (eat("kw_true"))
      return {
        kind: "LiteralExpr",
        value: { kind: "Bool", value: true, span: s },
        span: s,
      };
    if (eat("kw_false"))
      return {
        kind: "LiteralExpr",
        value: { kind: "Bool", value: false, span: s },
        span: s,
      };
    if (peek("number")) {
      const v = Number(expect("number").value!);
      return {
        kind: "LiteralExpr",
        value: { kind: "Number", value: v, span: s },
        span: s,
      };
    }
    if (peek("string")) {
      const v = expect("string").value!;
      return {
        kind: "LiteralExpr",
        value: { kind: "String", value: v, span: s },
        span: s,
      };
    }
    error("Invalid literal");
    throw new Error("Unexpected literal expression");
  }

  function parseObjectExpr(): ObjectExpr {
    const s = spanHere();
    expect("lbrace");
    const fields: ObjectField[] = [];
    while (!peek("rbrace")) {
      const key = parseIdent();
      expect("colon");
      const value = parseExpr();
      fields.push({ kind: "ObjectField", key, value, span: s });
      eat("comma");
    }
    expect("rbrace");
    return { kind: "ObjectExpr", fields, span: s };
  }

  function parseObjectFields(): {
    kind: "VariantFieldInit";
    key: Identifier;
    value: Expr;
    span: Span;
  }[] {
    expect("lbrace");
    const items: {
      kind: "VariantFieldInit";
      key: Identifier;
      value: Expr;
      span: Span;
    }[] = [];
    while (!peek("rbrace")) {
      const key = parseIdent();
      expect("colon");
      const value = parseExpr();
      items.push({ kind: "VariantFieldInit", key, value, span: spanHere() });
      eat("comma");
    }
    expect("rbrace");
    return items;
  }

  function parseMatchExpr(): MatchExpr {
    const s = spanHere();
    expect("kw_match");
    const e = parseExpr();
    expect("lbrace");
    const cases: CaseClause[] = [];
    while (!peek("rbrace")) {
      const pat = parsePattern();
      expect("fat_arrow");
      let body: Block | Expr;
      if (peek("lbrace")) body = parseBlock();
      else body = parseExpr();
      eat("semi");
      cases.push({ kind: "CaseClause", pattern: pat, body, span: s });
    }
    expect("rbrace");
    return { kind: "MatchExpr", expr: e, cases, span: s };
  }

  function parsePattern(): Pattern {
    if (
      peek("string") ||
      peek("number") ||
      peek("kw_true") ||
      peek("kw_false")
    ) {
      const lit = parseLiteralExpr().value;
      const s = spanHere();
      return { kind: "LiteralPattern", value: lit, span: s } as LiteralPattern;
    }
    const name = parseIdent();
    let fields: PatternField[] | undefined;
    if (eat("lbrace")) {
      fields = [];
      while (!peek("rbrace")) {
        const fname = parseIdent();
        let alias: Identifier | undefined;
        if (eat("colon")) alias = parseIdent();
        fields.push({
          kind: "PatternField",
          name: fname,
          alias,
          span: spanHere(),
        });
        eat("comma");
      }
      expect("rbrace");
    }
    const vp: VariantPattern = {
      kind: "VariantPattern",
      head: { tag: "Named", name },
      fields,
      span: name.span,
    };
    return vp;
  }

  function parseLiteral(): Literal {
    const s = spanHere();
    if (eat("kw_true")) return { kind: "Bool", value: true, span: s };
    if (eat("kw_false")) return { kind: "Bool", value: false, span: s };
    if (peek("number"))
      return {
        kind: "Number",
        value: Number(expect("number").value!),
        span: s,
      };
    if (peek("string"))
      return { kind: "String", value: expect("string").value!, span: s };
    error("Expected literal");
    throw new Error("Unexpected literal");
  }
}
