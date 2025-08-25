// src/parse.ts
import { CharStream, CommonTokenStream } from "antlr4ng";
import { IntentLangLexer } from "./_generated/grammar/IntentLangLexer.js";
import { IntentLangParser } from "./_generated/grammar/IntentLangParser.js";
import { AstVisitor } from "./visitor/index.js";

class ThrowingErrorListener {
  syntaxError(
    _recognizer: any,
    _offending: any,
    line: number,
    col: number,
    msg: string,
  ) {
    throw new Error(`Syntax error at ${line}:${col} — ${msg}`);
  }
}

export function parseIL(code: string) {
  const input = CharStream.fromString(code);
  const lexer = new IntentLangLexer(input);
  const tokens = new CommonTokenStream(lexer);
  const parser = new IntentLangParser(tokens);

  const err = new ThrowingErrorListener();
  lexer.removeErrorListeners();
  (lexer as any).addErrorListener?.(err);
  parser.removeErrorListeners();
  parser.addErrorListener(err as any);

  parser.buildParseTrees = true;
  const tree = parser.file();
  return { tree, parser, tokens };
}

export function parseToAst(code: string) {
  const { tree } = parseIL(code);
  const v = new AstVisitor();
  return v.visit(tree);
}
