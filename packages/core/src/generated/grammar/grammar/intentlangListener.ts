// Generated from ./grammar/intentlang.g4 by ANTLR 4.9.0-SNAPSHOT
import type { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener.js";

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
 * This interface defines a complete listener for a parse tree produced by
 * `intentlangParser`.
 */
export interface intentlangListener extends ParseTreeListener {
  /**
   * Enter a parse tree produced by `intentlangParser.file`.
   * @param ctx the parse tree
   */
  enterFile?: (ctx: FileContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.file`.
   * @param ctx the parse tree
   */
  exitFile?: (ctx: FileContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.program`.
   * @param ctx the parse tree
   */
  enterProgram?: (ctx: ProgramContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.program`.
   * @param ctx the parse tree
   */
  exitProgram?: (ctx: ProgramContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.intentSection`.
   * @param ctx the parse tree
   */
  enterIntentSection?: (ctx: IntentSectionContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.intentSection`.
   * @param ctx the parse tree
   */
  exitIntentSection?: (ctx: IntentSectionContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.tagList`.
   * @param ctx the parse tree
   */
  enterTagList?: (ctx: TagListContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.tagList`.
   * @param ctx the parse tree
   */
  exitTagList?: (ctx: TagListContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.usesSection`.
   * @param ctx the parse tree
   */
  enterUsesSection?: (ctx: UsesSectionContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.usesSection`.
   * @param ctx the parse tree
   */
  exitUsesSection?: (ctx: UsesSectionContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.typesSection`.
   * @param ctx the parse tree
   */
  enterTypesSection?: (ctx: TypesSectionContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.typesSection`.
   * @param ctx the parse tree
   */
  exitTypesSection?: (ctx: TypesSectionContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.useDecl`.
   * @param ctx the parse tree
   */
  enterUseDecl?: (ctx: UseDeclContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.useDecl`.
   * @param ctx the parse tree
   */
  exitUseDecl?: (ctx: UseDeclContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.typeDecl`.
   * @param ctx the parse tree
   */
  enterTypeDecl?: (ctx: TypeDeclContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.typeDecl`.
   * @param ctx the parse tree
   */
  exitTypeDecl?: (ctx: TypeDeclContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.typeExpr`.
   * @param ctx the parse tree
   */
  enterTypeExpr?: (ctx: TypeExprContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.typeExpr`.
   * @param ctx the parse tree
   */
  exitTypeExpr?: (ctx: TypeExprContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.unionType`.
   * @param ctx the parse tree
   */
  enterUnionType?: (ctx: UnionTypeContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.unionType`.
   * @param ctx the parse tree
   */
  exitUnionType?: (ctx: UnionTypeContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.typeAtom`.
   * @param ctx the parse tree
   */
  enterTypeAtom?: (ctx: TypeAtomContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.typeAtom`.
   * @param ctx the parse tree
   */
  exitTypeAtom?: (ctx: TypeAtomContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.namedType`.
   * @param ctx the parse tree
   */
  enterNamedType?: (ctx: NamedTypeContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.namedType`.
   * @param ctx the parse tree
   */
  exitNamedType?: (ctx: NamedTypeContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.recordType`.
   * @param ctx the parse tree
   */
  enterRecordType?: (ctx: RecordTypeContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.recordType`.
   * @param ctx the parse tree
   */
  exitRecordType?: (ctx: RecordTypeContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.field`.
   * @param ctx the parse tree
   */
  enterField?: (ctx: FieldContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.field`.
   * @param ctx the parse tree
   */
  exitField?: (ctx: FieldContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.tupleType`.
   * @param ctx the parse tree
   */
  enterTupleType?: (ctx: TupleTypeContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.tupleType`.
   * @param ctx the parse tree
   */
  exitTupleType?: (ctx: TupleTypeContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.literalType`.
   * @param ctx the parse tree
   */
  enterLiteralType?: (ctx: LiteralTypeContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.literalType`.
   * @param ctx the parse tree
   */
  exitLiteralType?: (ctx: LiteralTypeContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.item`.
   * @param ctx the parse tree
   */
  enterItem?: (ctx: ItemContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.item`.
   * @param ctx the parse tree
   */
  exitItem?: (ctx: ItemContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.funcDecl`.
   * @param ctx the parse tree
   */
  enterFuncDecl?: (ctx: FuncDeclContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.funcDecl`.
   * @param ctx the parse tree
   */
  exitFuncDecl?: (ctx: FuncDeclContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.effectDecl`.
   * @param ctx the parse tree
   */
  enterEffectDecl?: (ctx: EffectDeclContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.effectDecl`.
   * @param ctx the parse tree
   */
  exitEffectDecl?: (ctx: EffectDeclContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.testDecl`.
   * @param ctx the parse tree
   */
  enterTestDecl?: (ctx: TestDeclContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.testDecl`.
   * @param ctx the parse tree
   */
  exitTestDecl?: (ctx: TestDeclContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.params`.
   * @param ctx the parse tree
   */
  enterParams?: (ctx: ParamsContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.params`.
   * @param ctx the parse tree
   */
  exitParams?: (ctx: ParamsContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.param`.
   * @param ctx the parse tree
   */
  enterParam?: (ctx: ParamContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.param`.
   * @param ctx the parse tree
   */
  exitParam?: (ctx: ParamContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.block`.
   * @param ctx the parse tree
   */
  enterBlock?: (ctx: BlockContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.block`.
   * @param ctx the parse tree
   */
  exitBlock?: (ctx: BlockContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.stmt`.
   * @param ctx the parse tree
   */
  enterStmt?: (ctx: StmtContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.stmt`.
   * @param ctx the parse tree
   */
  exitStmt?: (ctx: StmtContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.expr`.
   * @param ctx the parse tree
   */
  enterExpr?: (ctx: ExprContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.expr`.
   * @param ctx the parse tree
   */
  exitExpr?: (ctx: ExprContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.assignmentExpr`.
   * @param ctx the parse tree
   */
  enterAssignmentExpr?: (ctx: AssignmentExprContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.assignmentExpr`.
   * @param ctx the parse tree
   */
  exitAssignmentExpr?: (ctx: AssignmentExprContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.orExpr`.
   * @param ctx the parse tree
   */
  enterOrExpr?: (ctx: OrExprContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.orExpr`.
   * @param ctx the parse tree
   */
  exitOrExpr?: (ctx: OrExprContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.andExpr`.
   * @param ctx the parse tree
   */
  enterAndExpr?: (ctx: AndExprContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.andExpr`.
   * @param ctx the parse tree
   */
  exitAndExpr?: (ctx: AndExprContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.equalityExpr`.
   * @param ctx the parse tree
   */
  enterEqualityExpr?: (ctx: EqualityExprContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.equalityExpr`.
   * @param ctx the parse tree
   */
  exitEqualityExpr?: (ctx: EqualityExprContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.relationalExpr`.
   * @param ctx the parse tree
   */
  enterRelationalExpr?: (ctx: RelationalExprContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.relationalExpr`.
   * @param ctx the parse tree
   */
  exitRelationalExpr?: (ctx: RelationalExprContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.additiveExpr`.
   * @param ctx the parse tree
   */
  enterAdditiveExpr?: (ctx: AdditiveExprContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.additiveExpr`.
   * @param ctx the parse tree
   */
  exitAdditiveExpr?: (ctx: AdditiveExprContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.multiplicativeExpr`.
   * @param ctx the parse tree
   */
  enterMultiplicativeExpr?: (ctx: MultiplicativeExprContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.multiplicativeExpr`.
   * @param ctx the parse tree
   */
  exitMultiplicativeExpr?: (ctx: MultiplicativeExprContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.unaryExpr`.
   * @param ctx the parse tree
   */
  enterUnaryExpr?: (ctx: UnaryExprContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.unaryExpr`.
   * @param ctx the parse tree
   */
  exitUnaryExpr?: (ctx: UnaryExprContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.primaryExpr`.
   * @param ctx the parse tree
   */
  enterPrimaryExpr?: (ctx: PrimaryExprContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.primaryExpr`.
   * @param ctx the parse tree
   */
  exitPrimaryExpr?: (ctx: PrimaryExprContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.literal`.
   * @param ctx the parse tree
   */
  enterLiteral?: (ctx: LiteralContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.literal`.
   * @param ctx the parse tree
   */
  exitLiteral?: (ctx: LiteralContext) => void;

  /**
   * Enter a parse tree produced by `intentlangParser.stringLiteral`.
   * @param ctx the parse tree
   */
  enterStringLiteral?: (ctx: StringLiteralContext) => void;
  /**
   * Exit a parse tree produced by `intentlangParser.stringLiteral`.
   * @param ctx the parse tree
   */
  exitStringLiteral?: (ctx: StringLiteralContext) => void;
}
