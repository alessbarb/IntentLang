// Reemplaza tu implementación manual por este adapter.
// Mantiene la misma firma: parse(input: string): Program

import type {
  Program,
  IntentSection,
  UsesSection,
  TypesSection,
} from "../ast/index.js";

import { CharStreams } from "antlr4ts/CharStreams.js";
import { CommonTokenStream } from "antlr4ts/CommonTokenStream.js";

import { IntentLangLexer } from "../generated/grammar/IntentLangLexer.js";
import {
  IntentLangParser,
  type ProgramContext,
} from "../generated/grammar/IntentLangParser.js";

import { AstBuilderVisitor } from "./visitor.js";

export function parse(input: string): Program {
  // 1) CharStream -> Lexer -> Tokens -> Parser
  const inputStream = CharStreams.fromString(input);
  const lexer = new IntentLangLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new IntentLangParser(tokenStream);

  // 2) Regla inicial (ajústala si tu start rule tiene otro nombre)
  const tree: ProgramContext = parser.program();

  // 3) Visitar el árbol y construir AST propio
  const visitor = new AstBuilderVisitor();
  const ast = visitor.visitProgram(tree);

  return ast;
}
