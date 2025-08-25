// AST-first pretty printer for IntentLang
import * as AST from "../ast.js";

export type FormatOptions = {
  width?: number; // target line width (soft)
  indent?: number; // spaces per indent
  trailingCommas?: boolean;
};

const DEF: Required<FormatOptions> = {
  width: 80,
  indent: 2,
  trailingCommas: true,
};

class Writer {
  private buf: string[] = [];
  private lvl = 0;
  private atLineStart = true;
  constructor(public opt: Required<FormatOptions>) {}

  push(s: string) {
    if (this.atLineStart && s.length > 0)
      this.buf.push(" ".repeat(this.lvl * this.opt.indent));
    this.buf.push(s);
    this.atLineStart = false;
  }
  space() {
    if (!this.atLineStart) this.buf.push(" ");
  }
  nl(count = 1) {
    for (let i = 0; i < count; i++) this.buf.push("\n");
    this.atLineStart = true;
  }
  indent<T>(fn: () => T): T {
    this.lvl++;
    const r = fn();
    this.lvl--;
    return r;
  }
  text(): string {
    return this.buf.join("");
  }
}

/* =======================================================
   Public API
======================================================= */

export function formatProgram(
  prog: AST.Program,
  opts: FormatOptions = {},
): string {
  const w = new Writer({ ...DEF, ...opts });

  // Intent
  if (prog.intent) writeIntent(w, prog.intent);

  // Uses (file-level)
  if (prog.uses && prog.uses.entries.length > 0) {
    writeUses(w, prog.uses);
  }

  // Types
  if (prog.types && prog.types.declarations.length > 0) {
    writeTypes(w, prog.types);
  }

  // Top level items
  for (const it of prog.items) {
    if (
      it.kind === "IntentSection" ||
      it.kind === "UsesSection" ||
      it.kind === "TypesSection"
    )
      continue;

    w.nl();
    switch (it.kind) {
      case "FuncDecl":
        writeFuncDecl(w, it);
        break;
      case "EffectDecl":
        writeEffectDecl(w, it);
        break;
      case "TestDecl":
        writeTestDecl(w, it);
        break;
      default:
        /* TODO */ break;
    }
  }

  w.nl(); // EOF newline
  return w.text();
}

/* =======================================================
   Sections
======================================================= */

function writeIntent(w: Writer, sec: AST.IntentSection) {
  w.push(`intent ${q(sec.description)}`);
  if (sec.tags && sec.tags.length) {
    const inline = `tags [${sec.tags.map(q).join(", ")}]`.length <= 60;
    if (inline) {
      w.space();
      w.push(`tags [${sec.tags.map(q).join(", ")}]`);
      w.nl(2);
    } else {
      w.nl();
      w.push("tags [");
      w.nl();
      w.indent(() => {
        for (let i = 0; i < sec.tags!.length; i++) {
          w.push(q(sec.tags![i]));
          if (i < sec.tags!.length - 1 || w.opt.trailingCommas) w.push(",");
          w.nl();
        }
      });
      w.push("]");
      w.nl(2);
    }
  } else {
    w.nl(2);
  }
}

function writeUses(w: Writer, sec: AST.UsesSection) {
  w.push("uses {");
  w.nl();
  w.indent(() => {
    const entries = [...sec.entries].sort((a: any, b: any) =>
      (a?.name?.name ?? "").localeCompare(b?.name?.name ?? ""),
    );
    for (let i = 0; i < entries.length; i++) {
      const e: any = entries[i];
      const name = e?.name?.name ?? "unknown";
      const typeIdent = e?.typeName ?? e?.target;
      const typeName = typeIdent?.name ?? "Unknown";

      w.push(name);
      w.push(": ");
      w.push(typeName);

      const literalParams = extractUseParamsAsLiterals(e);
      if (literalParams && Object.keys(literalParams).length > 0) {
        const pairs = Object.entries(literalParams);
        const inline = pairs.every(
          ([k, v]) => k.length + literalLen(v) + 4 < 22,
        );
        if (inline) {
          w.space();
          w.push("{ ");
          for (let j = 0; j < pairs.length; j++) {
            if (j > 0) w.push(", ");
            const [k, v] = pairs[j];
            w.push(`${k}: ${literal(v)}`);
          }
          w.push(" }");
        } else {
          w.space();
          w.push("{");
          w.nl();
          w.indent(() => {
            for (let j = 0; j < pairs.length; j++) {
              const [k, v] = pairs[j];
              w.push(`${k}: ${literal(v)}`);
              if (j < pairs.length - 1 || w.opt.trailingCommas) w.push(",");
              w.nl();
            }
          });
          w.push("}");
        }
      }

      if (i < entries.length - 1 || w.opt.trailingCommas) w.push(",");
      w.nl();
    }
  });
  w.push("}");
  w.nl(2);
}

function extractUseParamsAsLiterals(
  e: unknown,
): Record<string, AST.Literal> | null {
  const anyE = e as any;
  if (anyE?.params && typeof anyE.params === "object") {
    const out: Record<string, AST.Literal> = {};
    for (const [k, v] of Object.entries(
      anyE.params as Record<string, AST.Literal>,
    )) {
      if (v && (v as AST.Literal).kind) out[k] = v as AST.Literal;
    }
    return out;
  }
  if (anyE?.config && anyE.config.kind === "ObjectExpr") {
    const out: Record<string, AST.Literal> = {};
    for (const f of anyE.config.fields as AST.ObjectField[]) {
      if (f.value?.kind === "LiteralExpr") out[f.key.name] = f.value.value;
    }
    return Object.keys(out).length ? out : null;
  }
  return null;
}

function writeTypes(w: Writer, sec: AST.TypesSection) {
  w.push("types {");
  w.nl();
  w.indent(() => {
    for (let i = 0; i < sec.declarations.length; i++) {
      writeTypeDecl(w, sec.declarations[i]);
      if (i < sec.declarations.length - 1) w.nl();
    }
  });
  w.push("}");
  w.nl(2);
}

/* =======================================================
   Type declarations & types
======================================================= */

function writeTypeDecl(w: Writer, d: AST.TypeDecl) {
  w.push("type ");
  w.push(d.name.name);
  w.push(" = ");
  writeType(w, d.expr);
  if (d.refinement) {
    w.space();
    w.push(`where ${d.refinement}`);
  }
  w.push(";");
}

function writeType(w: Writer, t: AST.TypeExpr) {
  switch (t.kind) {
    case "BasicType":
      w.push(t.name);
      return;
    case "BrandType":
      writeBrandType(w, t);
      return;
    case "LiteralType":
      w.push(q(t.value));
      return;
    case "ArrayType":
      w.push("Array<");
      writeType(w, t.element);
      w.push(">");
      return;
    case "MapType":
      w.push("Map<");
      writeType(w, t.key);
      w.push(", ");
      writeType(w, t.value);
      w.push(">");
      return;
    case "FuncType": {
      w.push("(");
      for (let i = 0; i < t.params.length; i++) {
        if (i > 0) w.push(", ");
        const p = t.params[i];
        if (p.name) w.push(`${p.name.name}: `);
        writeType(w, p.type);
      }
      w.push(") -> ");
      writeType(w, t.returnType);
      return;
    }
    case "GenericType": {
      w.push(t.name.name);
      w.push("<");
      for (let i = 0; i < t.params.length; i++) {
        if (i > 0) w.push(", ");
        writeType(w, t.params[i]);
      }
      w.push(">");
      return;
    }
    case "RecordType": {
      if (t.fields.length === 0) {
        w.push("{}");
        return;
      }
      const inline =
        t.fields.every((f) => fieldInlineLen(f) < 20) && t.fields.length <= 2;
      if (inline) {
        w.push("{ ");
        for (let i = 0; i < t.fields.length; i++) {
          if (i > 0) w.push(", ");
          const f = t.fields[i];
          w.push(`${f.name.name}: `);
          writeType(w, f.type);
          if (f.refinement) {
            w.space();
            w.push(`where ${f.refinement}`);
          }
        }
        w.push(" }");
      } else {
        w.push("{");
        w.nl();
        w.indent(() => {
          for (let i = 0; i < t.fields.length; i++) {
            const f = t.fields[i];
            w.push(`${f.name.name}: `);
            writeType(w, f.type);
            if (f.refinement) {
              w.space();
              w.push(`where ${f.refinement}`);
            }
            if (i < t.fields.length - 1 || w.opt.trailingCommas) w.push(",");
            w.nl();
          }
        });
        w.push("}");
      }
      return;
    }
    case "UnionType": {
      if (t.ctors.length === 0) {
        w.push("|");
        return;
      }
      const simple = t.ctors.length <= 3 && t.ctors.every(isInlineCtor);
      if (simple) {
        for (let i = 0; i < t.ctors.length; i++) {
          if (i > 0) {
            w.space();
            w.push("| ");
          }
          writeCtor(w, t.ctors[i]);
        }
      } else {
        w.nl();
        w.indent(() => {
          for (let i = 0; i < t.ctors.length; i++) {
            w.push("| ");
            writeCtor(w, t.ctors[i]);
            if (i < t.ctors.length - 1) w.nl();
          }
        });
      }
      return;
    }
    default: {
      // Soporte para extensiones manuales (p.ej. NamedType)
      const anyT = t as any;
      if (anyT?.kind === "NamedType" && anyT.name) {
        w.push(anyT.name.name ?? String(anyT.name));
        return;
      }
      w.push("/* TODO: unknown type */");
      return;
    }
  }
}

function isInlineCtor(c: AST.UnionCtor): boolean {
  if (c.kind === "LiteralCtor") return q(c.literal.value).length <= 16;
  if (!c.fields) return true;
  return (
    c.fields.fields.length <= 2 &&
    c.fields.fields.every((f) => fieldInlineLen(f) < 18)
  );
}

function writeCtor(w: Writer, c: AST.UnionCtor) {
  if (c.kind === "LiteralCtor") {
    w.push(q(c.literal.value));
    return;
  }
  w.push(c.name.name);
  if (c.fields) {
    const f = c.fields.fields;
    if (f.length === 0) {
      w.push(" {}");
      return;
    }
    const inline = f.length <= 2 && f.every((x) => fieldInlineLen(x) < 18);
    if (inline) {
      w.push(" { ");
      for (let i = 0; i < f.length; i++) {
        if (i > 0) w.push(", ");
        w.push(`${f[i].name.name}: `);
        writeType(w, f[i].type);
      }
      w.push(" }");
    } else {
      w.push(" {");
      w.nl();
      w.indent(() => {
        for (let i = 0; i < f.length; i++) {
          const x = f[i];
          w.push(`${x.name.name}: `);
          writeType(w, x.type);
          if (i < f.length - 1 || w.opt.trailingCommas) w.push(",");
          w.nl();
        }
      });
      w.push("}");
    }
  }
}

function writeBrandType(w: Writer, t: AST.BrandType) {
  writeType(w, t.base);
  w.space();
  w.push(`brand ${q(t.brand)}`);
}

function fieldInlineLen(f: AST.RecordField): number {
  return f.name.name.length + 2 + 8; // name + ": " + approx(type)
}

/* =======================================================
   Declarations
======================================================= */

function writeFuncDecl(w: Writer, d: AST.FuncDecl) {
  w.push("func ");
  w.push(d.name.name);
  writeParamSigList(w, d.params);
  w.push(": ");
  writeType(w, d.returnType);
  writeContracts(w, d.contracts);
  w.space();
  writeBlock(w, d.body);
}

function writeEffectDecl(w: Writer, d: AST.EffectDecl) {
  w.push("effect ");
  w.push(d.name.name);
  writeParamSigList(w, d.params);
  w.push(": ");
  writeType(w, d.returnType);
  writeContracts(w, d.contracts);
  if (d.uses && d.uses.length) {
    w.space();
    w.push("uses ");
    for (let i = 0; i < d.uses.length; i++) {
      if (i > 0) w.push(", ");
      w.push(d.uses[i].name);
    }
  }
  w.space();
  writeBlock(w, d.body);
}

function writeTestDecl(w: Writer, d: AST.TestDecl) {
  w.push("test ");
  w.push(d.name.name);
  w.space();
  writeBlock(w, d.body);
}

function writeParamSigList(w: Writer, ps: AST.ParamSig[]) {
  const inline = ps.length <= 2 && ps.every((p) => p.name.name.length + 2 < 12);
  w.push("(");
  if (ps.length === 0) {
    w.push(")");
    return;
  }
  if (inline) {
    for (let i = 0; i < ps.length; i++) {
      if (i > 0) w.push(", ");
      const p = ps[i];
      w.push(`${p.name.name}: `);
      writeType(w, p.type);
    }
    w.push(")");
  } else {
    w.nl();
    w.indent(() => {
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        w.push(`${p.name.name}: `);
        writeType(w, p.type);
        if (i < ps.length - 1 || w.opt.trailingCommas) w.push(",");
        w.nl();
      }
    });
    w.push(")");
  }
}

function writeContracts(
  w: Writer,
  c?: { requires?: AST.Expr; ensures?: AST.Expr },
) {
  if (!c) return;
  if (c.requires) {
    w.space();
    w.push("requires ");
    writeExpr(w, c.requires);
  }
  if (c.ensures) {
    w.space();
    w.push("ensures ");
    writeExpr(w, c.ensures);
  }
}

/* =======================================================
   Blocks, statements, expressions
======================================================= */

function writeBlock(w: Writer, b: AST.Block) {
  w.push("{");
  w.nl();
  w.indent(() => {
    for (let i = 0; i < b.statements.length; i++) {
      writeStmt(w, b.statements[i]);
      w.nl();
    }
  });
  w.push("}");
}

function writeStmt(w: Writer, s: AST.Stmt) {
  switch (s.kind) {
    case "LetStmt":
      w.push(`let ${s.id.name} = `);
      writeExpr(w, s.init);
      w.push(";");
      return;
    case "ConstStmt":
      w.push(`const ${s.id.name} = `);
      writeExpr(w, s.init);
      w.push(";");
      return;
    case "AssignStmt":
      writeLValue(w, s.target);
      w.space();
      w.push(s.op);
      w.space();
      writeExpr(w, s.value);
      w.push(";");
      return;
    case "UpdateStmt":
      writeLValue(w, s.target);
      w.space();
      w.push(s.op);
      w.push(";");
      return;
    case "ReturnStmt":
      w.push("return");
      if (s.argument) {
        w.space();
        writeExpr(w, s.argument);
      }
      w.push(";");
      return;
    case "IfStmt":
      w.push("if ");
      writeExpr(w, s.test);
      w.space();
      writeBlock(w, s.consequent);
      if (s.alternate) {
        w.space();
        w.push("else ");
        writeBlock(w, s.alternate);
      }
      return;
    case "MatchStmt": {
      const m: AST.MatchExpr = (s as any).match ?? {
        kind: "MatchExpr",
        expr: (s as any).expr,
        cases: (s as any).cases,
        span: (s as any).span,
      };
      writeMatch(w, m);
      w.push(";");
      return;
    }
    case "ForStmt":
      w.push("for ");
      w.push(s.iterator.name);
      w.space();
      w.push("in ");
      writeExpr(w, s.iterable);
      w.space();
      writeBlock(w, s.body);
      return;
    case "WhileStmt":
      w.push("while ");
      writeExpr(w, s.test);
      w.space();
      writeBlock(w, s.body);
      return;
    case "TryStmt":
      w.push("try ");
      writeBlock(w, s.tryBlock);
      w.space();
      w.push("catch (");
      w.push(s.catchParam.name);
      w.push(") ");
      writeBlock(w, s.catchBlock);
      return;
    case "BreakStmt":
      w.push("break;");
      return;
    case "ContinueStmt":
      w.push("continue;");
      return;
    case "ExprStmt":
      writeExpr(w, s.expression);
      w.push(";");
      return;
  }
}

function writeLValue(w: Writer, lv: AST.LValue) {
  w.push(lv.base.name);
  for (const step of lv.path) {
    if (step.kind === "LvProp") {
      w.push(".");
      w.push(step.name.name);
    } else {
      w.push("[");
      writeExpr(w, step.index);
      w.push("]");
    }
  }
}

function writeExpr(w: Writer, e: AST.Expr) {
  switch (e.kind) {
    case "LiteralExpr":
      w.push(literal(e.value));
      return;
    case "IdentifierExpr":
      w.push(e.id.name);
      return;
    case "ObjectExpr":
      writeObjectExpr(w, e);
      return;
    case "ArrayExpr":
      writeArrayExpr(w, e);
      return;
    case "MapExpr": {
      if (e.entries.length === 0) {
        w.push("Map {}");
        return;
      }
      w.push("Map {");
      w.nl();
      w.indent(() => {
        for (let i = 0; i < e.entries.length; i++) {
          const kv = e.entries[i];
          w.push("(");
          writeExpr(w, kv.key);
          w.push(": ");
          writeExpr(w, kv.value);
          w.push(")");
          if (i < e.entries.length - 1 || w.opt.trailingCommas) w.push(",");
          w.nl();
        }
      });
      w.push("}");
      return;
    }
    case "CallExpr":
      writeExpr(w, e.callee);
      w.push("(");
      for (let i = 0; i < e.args.length; i++) {
        if (i > 0) w.push(", ");
        writeExpr(w, e.args[i]);
      }
      w.push(")");
      return;
    case "MemberExpr":
      writeExpr(w, e.object);
      w.push(".");
      w.push(e.property.name);
      return;
    case "IndexExpr":
      writeExpr(w, e.object);
      w.push("[");
      writeExpr(w, e.index);
      w.push("]");
      return;
    case "UnaryExpr":
      w.push(e.op);
      writeExpr(w, e.argument);
      return;
    case "PostfixUpdateExpr":
      writeExpr(w, e.argument);
      w.push(e.op);
      return;
    case "BinaryExpr":
      writeExpr(w, e.left);
      w.space();
      w.push(e.op);
      w.space();
      writeExpr(w, e.right);
      return;
    case "ConditionalExpr":
      writeExpr(w, e.test);
      w.space();
      w.push("? ");
      writeExpr(w, e.consequent);
      w.space();
      w.push(": ");
      writeExpr(w, e.alternate);
      return;
    case "ResultOkExpr":
      w.push("Ok(");
      writeExpr(w, e.value);
      w.push(")");
      return;
    case "ResultErrExpr":
      w.push("Err(");
      writeExpr(w, e.error);
      w.push(")");
      return;
    case "OptionSomeExpr":
      w.push("Some(");
      writeExpr(w, e.value);
      w.push(")");
      return;
    case "OptionNoneExpr":
      w.push("None");
      return;
    case "BrandCastExpr":
      w.push("brand<");
      w.push(e.target.name);
      w.push(">(");
      writeExpr(w, e.value);
      w.push(")");
      return;
    case "VariantExpr":
      w.push(e.ctor.name);
      if (e.fields && e.fields.length > 0) {
        const inline = e.fields.length <= 2;
        if (inline) {
          w.push(" { ");
          for (let i = 0; i < e.fields.length; i++) {
            if (i > 0) w.push(", ");
            w.push(`${e.fields[i].key.name}: `);
            writeExpr(w, e.fields[i].value);
          }
          w.push(" }");
        } else {
          w.push(" {");
          w.nl();
          w.indent(() => {
            for (let i = 0; i < e.fields!.length; i++) {
              const f = e.fields![i];
              w.push(`${f.key.name}: `);
              writeExpr(w, f.value);
              if (i < e.fields!.length - 1 || w.opt.trailingCommas) w.push(",");
              w.nl();
            }
          });
          w.push("}");
        }
      }
      return;
    case "MatchExpr":
      writeMatch(w, e);
      return;
    case "LambdaExpr":
      w.push("fn(");
      for (let i = 0; i < e.params.length; i++) {
        if (i > 0) w.push(", ");
        w.push(`${e.params[i].name.name}: `);
        writeType(w, e.params[i].type);
      }
      w.push(")");
      if (e.returnType) {
        w.push(": ");
        writeType(w, e.returnType);
      }
      w.space();
      w.push("=> ");
      if ((e.body as any).kind === "Block") writeBlock(w, e.body as AST.Block);
      else writeExpr(w, e.body as AST.Expr);
      return;
  }
}

function writeObjectExpr(w: Writer, o: AST.ObjectExpr) {
  if (o.fields.length === 0) {
    w.push("{ }");
    return;
  }
  const shorthand = (f: AST.ObjectField) =>
    f.value?.kind === "IdentifierExpr" && f.value.id.name === f.key.name;

  const inline = o.fields.length <= 2 && o.fields.every(shorthand);
  if (inline) {
    w.push("{ ");
    for (let i = 0; i < o.fields.length; i++) {
      if (i > 0) w.push(", ");
      const f = o.fields[i];
      if (shorthand(f)) w.push(f.key.name);
      else {
        w.push(f.key.name);
        w.push(": ");
        writeExpr(w, f.value!);
      }
    }
    w.push(" }");
  } else {
    w.push("{");
    w.nl();
    w.indent(() => {
      for (let i = 0; i < o.fields.length; i++) {
        const f = o.fields[i];
        if (shorthand(f)) w.push(f.key.name);
        else {
          w.push(f.key.name);
          w.push(": ");
          writeExpr(w, f.value!);
        }
        if (i < o.fields.length - 1 || w.opt.trailingCommas) w.push(",");
        w.nl();
      }
    });
    w.push("}");
  }
}

function writeArrayExpr(w: Writer, a: AST.ArrayExpr) {
  if (a.elements.length === 0) {
    w.push("[]");
    return;
  }
  const inline =
    a.elements.length <= 3 && a.elements.every((el) => shortExpr(el));
  if (inline) {
    w.push("[");
    for (let i = 0; i < a.elements.length; i++) {
      if (i > 0) w.push(", ");
      writeExpr(w, a.elements[i]);
    }
    w.push("]");
  } else {
    w.push("[");
    w.nl();
    w.indent(() => {
      for (let i = 0; i < a.elements.length; i++) {
        writeExpr(w, a.elements[i]);
        if (i < a.elements.length - 1 || w.opt.trailingCommas) w.push(",");
        w.nl();
      }
    });
    w.push("]");
  }
}

function writeMatch(w: Writer, m: AST.MatchExpr) {
  w.push("match ");
  writeExpr(w, m.expr);
  w.space();
  w.push("{");
  w.nl();
  w.indent(() => {
    for (let i = 0; i < m.cases.length; i++) {
      const c = m.cases[i];
      writePattern(w, c.pattern);
      if (c.guard) {
        w.space();
        w.push("if ");
        writeExpr(w, c.guard);
      }
      w.space();
      w.push("=> ");
      if ((c.body as any).kind === "Block") writeBlock(w, c.body as AST.Block);
      else writeExpr(w, c.body as AST.Expr);
      w.push(";");
      w.nl();
    }
  });
  w.push("}");
}

function writePattern(w: Writer, p: AST.Pattern) {
  if (p.kind === "LiteralPattern") {
    w.push(literal(p.value));
    return;
  }
  if ((p as any).kind === "VariantPattern") {
    const vp = p as any;
    w.push(vp.head.name.name);
    const fs: AST.PatternField[] | undefined = vp.fields;
    if (fs && fs.length > 0) {
      const inline = fs.length <= 2;
      if (inline) {
        w.push(" { ");
        for (let i = 0; i < fs.length; i++) {
          if (i > 0) w.push(", ");
          const f = fs[i];
          w.push(f.name.name);
          if (f.alias && f.alias.name !== f.name.name) {
            w.push(": ");
            w.push(f.alias.name);
          }
        }
        w.push(" }");
      } else {
        w.push(" {");
        w.nl();
        w.indent(() => {
          for (let i = 0; i < fs.length; i++) {
            const f = fs[i];
            w.push(f.name.name);
            if (f.alias && f.alias.name !== f.name.name) {
              w.push(": ");
              w.push(f.alias.name);
            }
            if (i < fs.length - 1 || w.opt.trailingCommas) w.push(",");
            w.nl();
          }
        });
        w.push("}");
      }
    }
    return;
  }
  // WildcardPattern (o simplificado)
  w.push("_");
}

/* =======================================================
   Small helpers
======================================================= */

function q(s: string) {
  return JSON.stringify(s);
}

function literal(l: AST.Literal): string {
  switch (l.kind) {
    case "String":
      return q(l.value);
    case "Number":
      return String(l.value);
    case "Bool":
      return l.value ? "true" : "false";
  }
}
function literalLen(l: AST.Literal): number {
  return literal(l).length;
}

function shortExpr(e: AST.Expr): boolean {
  switch (e.kind) {
    case "LiteralExpr":
      return literal(e.value).length <= 8;
    case "IdentifierExpr":
      return e.id.name.length <= 10;
    default:
      return false;
  }
}
