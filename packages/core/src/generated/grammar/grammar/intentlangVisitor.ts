// Generated from ./grammar/intentlang.g4 by ANTLR 4.9.0-SNAPSHOT
import type { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor.js";

import { FileContext } from "./intentlangParser.js";
import { ProgramContext } from "./intentlangParser.js";
import { IntentSectionContext } from "./intentlangParser.js";
import { TagListContext } from "./intentlangParser.js";
import { UsesSectionContext } from "./intentlangParser.js";
import { TypesSectionContext } from "./intentlangParser.js";
import { UseDeclContext } from "./intentlangParser.js";
import { TypeDeclContext } from "./intentlangParser.js";
import { TypeExprContext } from "./intentlangParser.js";
import { UnionTypeContext } from "./intentlangParser.js";
import { TypeAtomContext } from "./intentlangParser.js";
import { NamedTypeContext } from "./intentlangParser.js";
import { RecordTypeContext } from "./intentlangParser.js";
import { FieldContext } from "./intentlangParser.js";
import { TupleTypeContext } from "./intentlangParser.js";
import { LiteralTypeContext } from "./intentlangParser.js";
import { ItemContext } from "./intentlangParser.js";
import { FuncDeclContext } from "./intentlangParser.js";
import { EffectDeclContext } from "./intentlangParser.js";
import { TestDeclContext } from "./intentlangParser.js";
import { ParamsContext } from "./intentlangParser.js";
import { ParamContext } from "./intentlangParser.js";
import { BlockContext } from "./intentlangParser.js";
import { StmtContext } from "./intentlangParser.js";
import { ExprContext } from "./intentlangParser.js";
import { AssignmentExprContext } from "./intentlangParser.js";
import { OrExprContext } from "./intentlangParser.js";
import { AndExprContext } from "./intentlangParser.js";
import { EqualityExprContext } from "./intentlangParser.js";
import { RelationalExprContext } from "./intentlangParser.js";
import { AdditiveExprContext } from "./intentlangParser.js";
import { MultiplicativeExprContext } from "./intentlangParser.js";
import { UnaryExprContext } from "./intentlangParser.js";
import { PrimaryExprContext } from "./intentlangParser.js";
import { LiteralContext } from "./intentlangParser.js";
import { StringLiteralContext } from "./intentlangParser.js";

/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `intentlangParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface intentlangVisitor<Result> extends ParseTreeVisitor<Result> {
  /**
   * Visit a parse tree produced by `intentlangParser.file`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitFile?: (ctx: FileContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.program`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitProgram?: (ctx: ProgramContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.intentSection`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitIntentSection?: (ctx: IntentSectionContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.tagList`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitTagList?: (ctx: TagListContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.usesSection`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitUsesSection?: (ctx: UsesSectionContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.typesSection`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitTypesSection?: (ctx: TypesSectionContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.useDecl`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitUseDecl?: (ctx: UseDeclContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.typeDecl`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitTypeDecl?: (ctx: TypeDeclContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.typeExpr`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitTypeExpr?: (ctx: TypeExprContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.unionType`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitUnionType?: (ctx: UnionTypeContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.typeAtom`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitTypeAtom?: (ctx: TypeAtomContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.namedType`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitNamedType?: (ctx: NamedTypeContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.recordType`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitRecordType?: (ctx: RecordTypeContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.field`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitField?: (ctx: FieldContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.tupleType`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitTupleType?: (ctx: TupleTypeContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.literalType`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitLiteralType?: (ctx: LiteralTypeContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.item`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitItem?: (ctx: ItemContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.funcDecl`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitFuncDecl?: (ctx: FuncDeclContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.effectDecl`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitEffectDecl?: (ctx: EffectDeclContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.testDecl`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitTestDecl?: (ctx: TestDeclContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.params`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitParams?: (ctx: ParamsContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.param`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitParam?: (ctx: ParamContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.block`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitBlock?: (ctx: BlockContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.stmt`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitStmt?: (ctx: StmtContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.expr`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitExpr?: (ctx: ExprContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.assignmentExpr`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitAssignmentExpr?: (ctx: AssignmentExprContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.orExpr`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitOrExpr?: (ctx: OrExprContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.andExpr`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitAndExpr?: (ctx: AndExprContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.equalityExpr`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitEqualityExpr?: (ctx: EqualityExprContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.relationalExpr`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitRelationalExpr?: (ctx: RelationalExprContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.additiveExpr`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitAdditiveExpr?: (ctx: AdditiveExprContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.multiplicativeExpr`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitMultiplicativeExpr?: (ctx: MultiplicativeExprContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.unaryExpr`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitUnaryExpr?: (ctx: UnaryExprContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.primaryExpr`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitPrimaryExpr?: (ctx: PrimaryExprContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.literal`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitLiteral?: (ctx: LiteralContext) => Result;

  /**
   * Visit a parse tree produced by `intentlangParser.stringLiteral`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitStringLiteral?: (ctx: StringLiteralContext) => Result;
}
