// Generated from ./grammar/intentlang.g4 by ANTLR 4.9.0-SNAPSHOT

import { ATN } from "antlr4ts/atn/ATN.js";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer.js";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException.js";
import { NotNull } from "antlr4ts/Decorators.js";
import { NoViableAltException } from "antlr4ts/NoViableAltException.js";
import { Override } from "antlr4ts/Decorators.js";
import { Parser } from "antlr4ts/Parser.js";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext.js";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator.js";
import type { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener.js";
import type { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor.js";
import { RecognitionException } from "antlr4ts/RecognitionException.js";
import { RuleContext } from "antlr4ts/RuleContext.js";
//import { RuleVersion } from "antlr4ts/RuleVersion.js";
import type { TerminalNode } from "antlr4ts/tree/TerminalNode.js";
import { Token } from "antlr4ts/Token.js";
import type { TokenStream } from "antlr4ts/TokenStream.js";
import type { Vocabulary } from "antlr4ts/Vocabulary.js";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl.js";

import * as Utils from "antlr4ts/misc/Utils.js";
import type { intentlangListener } from "./intentlangListener.js";
import type { intentlangVisitor } from "./intentlangVisitor.js";

export class intentlangParser extends Parser {
  public static readonly INTENT = 1;
  public static readonly USES = 2;
  public static readonly TYPES = 3;
  public static readonly TAGS = 4;
  public static readonly TYPEKW = 5;
  public static readonly EFFECT = 6;
  public static readonly FN = 7;
  public static readonly TEST = 8;
  public static readonly RETURN = 9;
  public static readonly LET = 10;
  public static readonly AS = 11;
  public static readonly BOOL = 12;
  public static readonly IDENT = 13;
  public static readonly STRING = 14;
  public static readonly FLOAT = 15;
  public static readonly INT = 16;
  public static readonly LBRACE = 17;
  public static readonly RBRACE = 18;
  public static readonly LPAREN = 19;
  public static readonly RPAREN = 20;
  public static readonly LBRACK = 21;
  public static readonly RBRACK = 22;
  public static readonly COMMA = 23;
  public static readonly SEMI = 24;
  public static readonly COLON = 25;
  public static readonly DOT = 26;
  public static readonly LT = 27;
  public static readonly GT = 28;
  public static readonly LTE = 29;
  public static readonly GTE = 30;
  public static readonly EQEQ = 31;
  public static readonly BANGEQ = 32;
  public static readonly ASSIGN = 33;
  public static readonly PLUS = 34;
  public static readonly MINUS = 35;
  public static readonly STAR = 36;
  public static readonly SLASH = 37;
  public static readonly PERCENT = 38;
  public static readonly BANG = 39;
  public static readonly OR = 40;
  public static readonly OROR = 41;
  public static readonly ANDAND = 42;
  public static readonly LINE_COMMENT = 43;
  public static readonly BLOCK_COMMENT = 44;
  public static readonly WS = 45;
  public static readonly RULE_file = 0;
  public static readonly RULE_program = 1;
  public static readonly RULE_intentSection = 2;
  public static readonly RULE_tagList = 3;
  public static readonly RULE_usesSection = 4;
  public static readonly RULE_typesSection = 5;
  public static readonly RULE_useDecl = 6;
  public static readonly RULE_typeDecl = 7;
  public static readonly RULE_typeExpr = 8;
  public static readonly RULE_unionType = 9;
  public static readonly RULE_typeAtom = 10;
  public static readonly RULE_namedType = 11;
  public static readonly RULE_recordType = 12;
  public static readonly RULE_field = 13;
  public static readonly RULE_tupleType = 14;
  public static readonly RULE_literalType = 15;
  public static readonly RULE_item = 16;
  public static readonly RULE_funcDecl = 17;
  public static readonly RULE_effectDecl = 18;
  public static readonly RULE_testDecl = 19;
  public static readonly RULE_params = 20;
  public static readonly RULE_param = 21;
  public static readonly RULE_block = 22;
  public static readonly RULE_stmt = 23;
  public static readonly RULE_expr = 24;
  public static readonly RULE_assignmentExpr = 25;
  public static readonly RULE_orExpr = 26;
  public static readonly RULE_andExpr = 27;
  public static readonly RULE_equalityExpr = 28;
  public static readonly RULE_relationalExpr = 29;
  public static readonly RULE_additiveExpr = 30;
  public static readonly RULE_multiplicativeExpr = 31;
  public static readonly RULE_unaryExpr = 32;
  public static readonly RULE_primaryExpr = 33;
  public static readonly RULE_literal = 34;
  public static readonly RULE_stringLiteral = 35;
  // tslint:disable:no-trailing-whitespace
  public static readonly ruleNames: string[] = [
    "file",
    "program",
    "intentSection",
    "tagList",
    "usesSection",
    "typesSection",
    "useDecl",
    "typeDecl",
    "typeExpr",
    "unionType",
    "typeAtom",
    "namedType",
    "recordType",
    "field",
    "tupleType",
    "literalType",
    "item",
    "funcDecl",
    "effectDecl",
    "testDecl",
    "params",
    "param",
    "block",
    "stmt",
    "expr",
    "assignmentExpr",
    "orExpr",
    "andExpr",
    "equalityExpr",
    "relationalExpr",
    "additiveExpr",
    "multiplicativeExpr",
    "unaryExpr",
    "primaryExpr",
    "literal",
    "stringLiteral",
  ];

  private static readonly _LITERAL_NAMES: Array<string | undefined> = [
    undefined,
    "'intent'",
    "'uses'",
    "'types'",
    "'tags'",
    "'type'",
    "'effect'",
    "'fn'",
    "'test'",
    "'return'",
    "'let'",
    "'as'",
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "'{'",
    "'}'",
    "'('",
    "')'",
    "'['",
    "']'",
    "','",
    "';'",
    "':'",
    "'.'",
    "'<'",
    "'>'",
    "'<='",
    "'>='",
    "'=='",
    "'!='",
    "'='",
    "'+'",
    "'-'",
    "'*'",
    "'/'",
    "'%'",
    "'!'",
    "'|'",
    "'||'",
    "'&&'",
  ];
  private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
    undefined,
    "INTENT",
    "USES",
    "TYPES",
    "TAGS",
    "TYPEKW",
    "EFFECT",
    "FN",
    "TEST",
    "RETURN",
    "LET",
    "AS",
    "BOOL",
    "IDENT",
    "STRING",
    "FLOAT",
    "INT",
    "LBRACE",
    "RBRACE",
    "LPAREN",
    "RPAREN",
    "LBRACK",
    "RBRACK",
    "COMMA",
    "SEMI",
    "COLON",
    "DOT",
    "LT",
    "GT",
    "LTE",
    "GTE",
    "EQEQ",
    "BANGEQ",
    "ASSIGN",
    "PLUS",
    "MINUS",
    "STAR",
    "SLASH",
    "PERCENT",
    "BANG",
    "OR",
    "OROR",
    "ANDAND",
    "LINE_COMMENT",
    "BLOCK_COMMENT",
    "WS",
  ];
  public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(
    intentlangParser._LITERAL_NAMES,
    intentlangParser._SYMBOLIC_NAMES,
    [],
  );

  // @Override
  // @NotNull
  public get vocabulary(): Vocabulary {
    return intentlangParser.VOCABULARY;
  }
  // tslint:enable:no-trailing-whitespace

  // @Override
  public get grammarFileName(): string {
    return "intentlang.g4";
  }

  // @Override
  public get ruleNames(): string[] {
    return intentlangParser.ruleNames;
  }

  // @Override
  public get serializedATN(): string {
    return intentlangParser._serializedATN;
  }

  protected createFailedPredicateException(
    predicate?: string,
    message?: string,
  ): FailedPredicateException {
    return new FailedPredicateException(this, predicate, message);
  }

  constructor(input: TokenStream) {
    super(input);
    this._interp = new ParserATNSimulator(intentlangParser._ATN, this);
  }
  // @RuleVersion(0)
  public file(): FileContext {
    let _localctx: FileContext = new FileContext(this._ctx, this.state);
    this.enterRule(_localctx, 0, intentlangParser.RULE_file);
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 72;
        this.program();
        this.state = 73;
        this.match(intentlangParser.EOF);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public program(): ProgramContext {
    let _localctx: ProgramContext = new ProgramContext(this._ctx, this.state);
    this.enterRule(_localctx, 2, intentlangParser.RULE_program);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 76;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === intentlangParser.INTENT) {
          {
            this.state = 75;
            this.intentSection();
          }
        }

        this.state = 79;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === intentlangParser.USES) {
          {
            this.state = 78;
            this.usesSection();
          }
        }

        this.state = 82;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === intentlangParser.TYPES) {
          {
            this.state = 81;
            this.typesSection();
          }
        }

        this.state = 87;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (
          ((_la & ~0x1f) === 0 &&
            ((1 << _la) &
              ((1 << intentlangParser.EFFECT) |
                (1 << intentlangParser.FN) |
                (1 << intentlangParser.TEST) |
                (1 << intentlangParser.RETURN) |
                (1 << intentlangParser.LET) |
                (1 << intentlangParser.BOOL) |
                (1 << intentlangParser.IDENT) |
                (1 << intentlangParser.STRING) |
                (1 << intentlangParser.FLOAT) |
                (1 << intentlangParser.INT) |
                (1 << intentlangParser.LBRACE) |
                (1 << intentlangParser.LPAREN))) !==
              0) ||
          _la === intentlangParser.MINUS ||
          _la === intentlangParser.BANG
        ) {
          {
            {
              this.state = 84;
              this.item();
            }
          }
          this.state = 89;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public intentSection(): IntentSectionContext {
    let _localctx: IntentSectionContext = new IntentSectionContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 4, intentlangParser.RULE_intentSection);
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 90;
        this.match(intentlangParser.INTENT);
        this.state = 91;
        this.stringLiteral();
        this.state = 92;
        this.match(intentlangParser.TAGS);
        this.state = 93;
        this.tagList();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public tagList(): TagListContext {
    let _localctx: TagListContext = new TagListContext(this._ctx, this.state);
    this.enterRule(_localctx, 6, intentlangParser.RULE_tagList);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 95;
        this.match(intentlangParser.LBRACK);
        this.state = 104;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === intentlangParser.STRING) {
          {
            this.state = 96;
            this.stringLiteral();
            this.state = 101;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while (_la === intentlangParser.COMMA) {
              {
                {
                  this.state = 97;
                  this.match(intentlangParser.COMMA);
                  this.state = 98;
                  this.stringLiteral();
                }
              }
              this.state = 103;
              this._errHandler.sync(this);
              _la = this._input.LA(1);
            }
          }
        }

        this.state = 106;
        this.match(intentlangParser.RBRACK);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public usesSection(): UsesSectionContext {
    let _localctx: UsesSectionContext = new UsesSectionContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 8, intentlangParser.RULE_usesSection);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 108;
        this.match(intentlangParser.USES);
        this.state = 109;
        this.match(intentlangParser.LBRACE);
        this.state = 113;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === intentlangParser.IDENT) {
          {
            {
              this.state = 110;
              this.useDecl();
            }
          }
          this.state = 115;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
        this.state = 116;
        this.match(intentlangParser.RBRACE);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public typesSection(): TypesSectionContext {
    let _localctx: TypesSectionContext = new TypesSectionContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 10, intentlangParser.RULE_typesSection);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 118;
        this.match(intentlangParser.TYPES);
        this.state = 119;
        this.match(intentlangParser.LBRACE);
        this.state = 123;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === intentlangParser.TYPEKW) {
          {
            {
              this.state = 120;
              this.typeDecl();
            }
          }
          this.state = 125;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
        this.state = 126;
        this.match(intentlangParser.RBRACE);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public useDecl(): UseDeclContext {
    let _localctx: UseDeclContext = new UseDeclContext(this._ctx, this.state);
    this.enterRule(_localctx, 12, intentlangParser.RULE_useDecl);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 128;
        this.match(intentlangParser.IDENT);
        this.state = 131;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === intentlangParser.AS) {
          {
            this.state = 129;
            this.match(intentlangParser.AS);
            this.state = 130;
            this.match(intentlangParser.IDENT);
          }
        }

        this.state = 135;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === intentlangParser.COLON) {
          {
            this.state = 133;
            this.match(intentlangParser.COLON);
            this.state = 134;
            this.match(intentlangParser.IDENT);
          }
        }

        this.state = 139;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === intentlangParser.LBRACE) {
          {
            this.state = 137;
            this.match(intentlangParser.LBRACE);
            this.state = 138;
            this.match(intentlangParser.RBRACE);
          }
        }

        this.state = 142;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === intentlangParser.SEMI) {
          {
            this.state = 141;
            this.match(intentlangParser.SEMI);
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public typeDecl(): TypeDeclContext {
    let _localctx: TypeDeclContext = new TypeDeclContext(this._ctx, this.state);
    this.enterRule(_localctx, 14, intentlangParser.RULE_typeDecl);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 144;
        this.match(intentlangParser.TYPEKW);
        this.state = 145;
        this.match(intentlangParser.IDENT);
        this.state = 146;
        this.match(intentlangParser.ASSIGN);
        this.state = 147;
        this.typeExpr();
        this.state = 149;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === intentlangParser.SEMI) {
          {
            this.state = 148;
            this.match(intentlangParser.SEMI);
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public typeExpr(): TypeExprContext {
    let _localctx: TypeExprContext = new TypeExprContext(this._ctx, this.state);
    this.enterRule(_localctx, 16, intentlangParser.RULE_typeExpr);
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 151;
        this.unionType();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public unionType(): UnionTypeContext {
    let _localctx: UnionTypeContext = new UnionTypeContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 18, intentlangParser.RULE_unionType);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 153;
        this.typeAtom();
        this.state = 158;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === intentlangParser.OR) {
          {
            {
              this.state = 154;
              this.match(intentlangParser.OR);
              this.state = 155;
              this.typeAtom();
            }
          }
          this.state = 160;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public typeAtom(): TypeAtomContext {
    let _localctx: TypeAtomContext = new TypeAtomContext(this._ctx, this.state);
    this.enterRule(_localctx, 20, intentlangParser.RULE_typeAtom);
    try {
      this.state = 169;
      this._errHandler.sync(this);
      switch (this.interpreter.adaptivePredict(this._input, 14, this._ctx)) {
        case 1:
          this.enterOuterAlt(_localctx, 1);
          {
            this.state = 161;
            this.namedType();
          }
          break;

        case 2:
          this.enterOuterAlt(_localctx, 2);
          {
            this.state = 162;
            this.literalType();
          }
          break;

        case 3:
          this.enterOuterAlt(_localctx, 3);
          {
            this.state = 163;
            this.recordType();
          }
          break;

        case 4:
          this.enterOuterAlt(_localctx, 4);
          {
            this.state = 164;
            this.tupleType();
          }
          break;

        case 5:
          this.enterOuterAlt(_localctx, 5);
          {
            this.state = 165;
            this.match(intentlangParser.LPAREN);
            this.state = 166;
            this.typeExpr();
            this.state = 167;
            this.match(intentlangParser.RPAREN);
          }
          break;
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public namedType(): NamedTypeContext {
    let _localctx: NamedTypeContext = new NamedTypeContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 22, intentlangParser.RULE_namedType);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 171;
        this.match(intentlangParser.IDENT);
        this.state = 183;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === intentlangParser.LT) {
          {
            this.state = 172;
            this.match(intentlangParser.LT);
            this.state = 173;
            this.typeExpr();
            this.state = 178;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            while (_la === intentlangParser.COMMA) {
              {
                {
                  this.state = 174;
                  this.match(intentlangParser.COMMA);
                  this.state = 175;
                  this.typeExpr();
                }
              }
              this.state = 180;
              this._errHandler.sync(this);
              _la = this._input.LA(1);
            }
            this.state = 181;
            this.match(intentlangParser.GT);
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public recordType(): RecordTypeContext {
    let _localctx: RecordTypeContext = new RecordTypeContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 24, intentlangParser.RULE_recordType);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 185;
        this.match(intentlangParser.LBRACE);
        this.state = 186;
        this.field();
        this.state = 191;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === intentlangParser.COMMA) {
          {
            {
              this.state = 187;
              this.match(intentlangParser.COMMA);
              this.state = 188;
              this.field();
            }
          }
          this.state = 193;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
        this.state = 194;
        this.match(intentlangParser.RBRACE);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public field(): FieldContext {
    let _localctx: FieldContext = new FieldContext(this._ctx, this.state);
    this.enterRule(_localctx, 26, intentlangParser.RULE_field);
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 196;
        this.match(intentlangParser.IDENT);
        this.state = 197;
        this.match(intentlangParser.COLON);
        this.state = 198;
        this.typeExpr();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public tupleType(): TupleTypeContext {
    let _localctx: TupleTypeContext = new TupleTypeContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 28, intentlangParser.RULE_tupleType);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 200;
        this.match(intentlangParser.LPAREN);
        this.state = 201;
        this.typeExpr();
        this.state = 204;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        do {
          {
            {
              this.state = 202;
              this.match(intentlangParser.COMMA);
              this.state = 203;
              this.typeExpr();
            }
          }
          this.state = 206;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        } while (_la === intentlangParser.COMMA);
        this.state = 208;
        this.match(intentlangParser.RPAREN);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public literalType(): LiteralTypeContext {
    let _localctx: LiteralTypeContext = new LiteralTypeContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 30, intentlangParser.RULE_literalType);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 210;
        _la = this._input.LA(1);
        if (
          !(
            (_la & ~0x1f) === 0 &&
            ((1 << _la) &
              ((1 << intentlangParser.BOOL) |
                (1 << intentlangParser.STRING) |
                (1 << intentlangParser.FLOAT) |
                (1 << intentlangParser.INT))) !==
              0
          )
        ) {
          this._errHandler.recoverInline(this);
        } else {
          if (this._input.LA(1) === Token.EOF) {
            this.matchedEOF = true;
          }

          this._errHandler.reportMatch(this);
          this.consume();
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public item(): ItemContext {
    let _localctx: ItemContext = new ItemContext(this._ctx, this.state);
    this.enterRule(_localctx, 32, intentlangParser.RULE_item);
    try {
      this.state = 216;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case intentlangParser.FN:
          this.enterOuterAlt(_localctx, 1);
          {
            this.state = 212;
            this.funcDecl();
          }
          break;
        case intentlangParser.EFFECT:
          this.enterOuterAlt(_localctx, 2);
          {
            this.state = 213;
            this.effectDecl();
          }
          break;
        case intentlangParser.TEST:
          this.enterOuterAlt(_localctx, 3);
          {
            this.state = 214;
            this.testDecl();
          }
          break;
        case intentlangParser.RETURN:
        case intentlangParser.LET:
        case intentlangParser.BOOL:
        case intentlangParser.IDENT:
        case intentlangParser.STRING:
        case intentlangParser.FLOAT:
        case intentlangParser.INT:
        case intentlangParser.LBRACE:
        case intentlangParser.LPAREN:
        case intentlangParser.MINUS:
        case intentlangParser.BANG:
          this.enterOuterAlt(_localctx, 4);
          {
            this.state = 215;
            this.stmt();
          }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public funcDecl(): FuncDeclContext {
    let _localctx: FuncDeclContext = new FuncDeclContext(this._ctx, this.state);
    this.enterRule(_localctx, 34, intentlangParser.RULE_funcDecl);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 218;
        this.match(intentlangParser.FN);
        this.state = 219;
        this.match(intentlangParser.IDENT);
        this.state = 220;
        this.match(intentlangParser.LPAREN);
        this.state = 222;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === intentlangParser.IDENT) {
          {
            this.state = 221;
            this.params();
          }
        }

        this.state = 224;
        this.match(intentlangParser.RPAREN);
        this.state = 227;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === intentlangParser.COLON) {
          {
            this.state = 225;
            this.match(intentlangParser.COLON);
            this.state = 226;
            this.typeExpr();
          }
        }

        this.state = 230;
        this._errHandler.sync(this);
        switch (this.interpreter.adaptivePredict(this._input, 22, this._ctx)) {
          case 1:
            {
              this.state = 229;
              this.block();
            }
            break;
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public effectDecl(): EffectDeclContext {
    let _localctx: EffectDeclContext = new EffectDeclContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 36, intentlangParser.RULE_effectDecl);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 232;
        this.match(intentlangParser.EFFECT);
        this.state = 233;
        this.match(intentlangParser.IDENT);
        this.state = 234;
        this.match(intentlangParser.LPAREN);
        this.state = 236;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === intentlangParser.IDENT) {
          {
            this.state = 235;
            this.params();
          }
        }

        this.state = 238;
        this.match(intentlangParser.RPAREN);
        this.state = 241;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === intentlangParser.COLON) {
          {
            this.state = 239;
            this.match(intentlangParser.COLON);
            this.state = 240;
            this.typeExpr();
          }
        }

        this.state = 243;
        this.match(intentlangParser.USES);
        this.state = 244;
        this.match(intentlangParser.IDENT);
        this.state = 246;
        this._errHandler.sync(this);
        switch (this.interpreter.adaptivePredict(this._input, 25, this._ctx)) {
          case 1:
            {
              this.state = 245;
              this.block();
            }
            break;
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public testDecl(): TestDeclContext {
    let _localctx: TestDeclContext = new TestDeclContext(this._ctx, this.state);
    this.enterRule(_localctx, 38, intentlangParser.RULE_testDecl);
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 248;
        this.match(intentlangParser.TEST);
        this.state = 249;
        this.match(intentlangParser.IDENT);
        this.state = 250;
        this.block();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public params(): ParamsContext {
    let _localctx: ParamsContext = new ParamsContext(this._ctx, this.state);
    this.enterRule(_localctx, 40, intentlangParser.RULE_params);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 252;
        this.param();
        this.state = 257;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === intentlangParser.COMMA) {
          {
            {
              this.state = 253;
              this.match(intentlangParser.COMMA);
              this.state = 254;
              this.param();
            }
          }
          this.state = 259;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public param(): ParamContext {
    let _localctx: ParamContext = new ParamContext(this._ctx, this.state);
    this.enterRule(_localctx, 42, intentlangParser.RULE_param);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 260;
        this.match(intentlangParser.IDENT);
        this.state = 263;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === intentlangParser.COLON) {
          {
            this.state = 261;
            this.match(intentlangParser.COLON);
            this.state = 262;
            this.typeExpr();
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public block(): BlockContext {
    let _localctx: BlockContext = new BlockContext(this._ctx, this.state);
    this.enterRule(_localctx, 44, intentlangParser.RULE_block);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 265;
        this.match(intentlangParser.LBRACE);
        this.state = 269;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (
          ((_la - 9) & ~0x1f) === 0 &&
          ((1 << (_la - 9)) &
            ((1 << (intentlangParser.RETURN - 9)) |
              (1 << (intentlangParser.LET - 9)) |
              (1 << (intentlangParser.BOOL - 9)) |
              (1 << (intentlangParser.IDENT - 9)) |
              (1 << (intentlangParser.STRING - 9)) |
              (1 << (intentlangParser.FLOAT - 9)) |
              (1 << (intentlangParser.INT - 9)) |
              (1 << (intentlangParser.LBRACE - 9)) |
              (1 << (intentlangParser.LPAREN - 9)) |
              (1 << (intentlangParser.MINUS - 9)) |
              (1 << (intentlangParser.BANG - 9)))) !==
            0
        ) {
          {
            {
              this.state = 266;
              this.stmt();
            }
          }
          this.state = 271;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
        this.state = 272;
        this.match(intentlangParser.RBRACE);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public stmt(): StmtContext {
    let _localctx: StmtContext = new StmtContext(this._ctx, this.state);
    this.enterRule(_localctx, 46, intentlangParser.RULE_stmt);
    let _la: number;
    try {
      this.state = 289;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case intentlangParser.RETURN:
          this.enterOuterAlt(_localctx, 1);
          {
            this.state = 274;
            this.match(intentlangParser.RETURN);
            this.state = 275;
            this.expr();
            this.state = 276;
            this.match(intentlangParser.SEMI);
          }
          break;
        case intentlangParser.LET:
          this.enterOuterAlt(_localctx, 2);
          {
            this.state = 278;
            this.match(intentlangParser.LET);
            this.state = 279;
            this.match(intentlangParser.IDENT);
            this.state = 282;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
            if (_la === intentlangParser.ASSIGN) {
              {
                this.state = 280;
                this.match(intentlangParser.ASSIGN);
                this.state = 281;
                this.expr();
              }
            }

            this.state = 284;
            this.match(intentlangParser.SEMI);
          }
          break;
        case intentlangParser.LBRACE:
          this.enterOuterAlt(_localctx, 3);
          {
            this.state = 285;
            this.block();
          }
          break;
        case intentlangParser.BOOL:
        case intentlangParser.IDENT:
        case intentlangParser.STRING:
        case intentlangParser.FLOAT:
        case intentlangParser.INT:
        case intentlangParser.LPAREN:
        case intentlangParser.MINUS:
        case intentlangParser.BANG:
          this.enterOuterAlt(_localctx, 4);
          {
            this.state = 286;
            this.expr();
            this.state = 287;
            this.match(intentlangParser.SEMI);
          }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public expr(): ExprContext {
    let _localctx: ExprContext = new ExprContext(this._ctx, this.state);
    this.enterRule(_localctx, 48, intentlangParser.RULE_expr);
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 291;
        this.assignmentExpr();
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public assignmentExpr(): AssignmentExprContext {
    let _localctx: AssignmentExprContext = new AssignmentExprContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 50, intentlangParser.RULE_assignmentExpr);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 293;
        this.orExpr();
        this.state = 296;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        if (_la === intentlangParser.ASSIGN) {
          {
            this.state = 294;
            this.match(intentlangParser.ASSIGN);
            this.state = 295;
            this.assignmentExpr();
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public orExpr(): OrExprContext {
    let _localctx: OrExprContext = new OrExprContext(this._ctx, this.state);
    this.enterRule(_localctx, 52, intentlangParser.RULE_orExpr);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 298;
        this.andExpr();
        this.state = 303;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === intentlangParser.OROR) {
          {
            {
              this.state = 299;
              this.match(intentlangParser.OROR);
              this.state = 300;
              this.andExpr();
            }
          }
          this.state = 305;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public andExpr(): AndExprContext {
    let _localctx: AndExprContext = new AndExprContext(this._ctx, this.state);
    this.enterRule(_localctx, 54, intentlangParser.RULE_andExpr);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 306;
        this.equalityExpr();
        this.state = 311;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (_la === intentlangParser.ANDAND) {
          {
            {
              this.state = 307;
              this.match(intentlangParser.ANDAND);
              this.state = 308;
              this.equalityExpr();
            }
          }
          this.state = 313;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public equalityExpr(): EqualityExprContext {
    let _localctx: EqualityExprContext = new EqualityExprContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 56, intentlangParser.RULE_equalityExpr);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 314;
        this.relationalExpr();
        this.state = 319;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (
          _la === intentlangParser.EQEQ ||
          _la === intentlangParser.BANGEQ
        ) {
          {
            {
              this.state = 315;
              _la = this._input.LA(1);
              if (
                !(
                  _la === intentlangParser.EQEQ ||
                  _la === intentlangParser.BANGEQ
                )
              ) {
                this._errHandler.recoverInline(this);
              } else {
                if (this._input.LA(1) === Token.EOF) {
                  this.matchedEOF = true;
                }

                this._errHandler.reportMatch(this);
                this.consume();
              }
              this.state = 316;
              this.relationalExpr();
            }
          }
          this.state = 321;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public relationalExpr(): RelationalExprContext {
    let _localctx: RelationalExprContext = new RelationalExprContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 58, intentlangParser.RULE_relationalExpr);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 322;
        this.additiveExpr();
        this.state = 327;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (
          (_la & ~0x1f) === 0 &&
          ((1 << _la) &
            ((1 << intentlangParser.LT) |
              (1 << intentlangParser.GT) |
              (1 << intentlangParser.LTE) |
              (1 << intentlangParser.GTE))) !==
            0
        ) {
          {
            {
              this.state = 323;
              _la = this._input.LA(1);
              if (
                !(
                  (_la & ~0x1f) === 0 &&
                  ((1 << _la) &
                    ((1 << intentlangParser.LT) |
                      (1 << intentlangParser.GT) |
                      (1 << intentlangParser.LTE) |
                      (1 << intentlangParser.GTE))) !==
                    0
                )
              ) {
                this._errHandler.recoverInline(this);
              } else {
                if (this._input.LA(1) === Token.EOF) {
                  this.matchedEOF = true;
                }

                this._errHandler.reportMatch(this);
                this.consume();
              }
              this.state = 324;
              this.additiveExpr();
            }
          }
          this.state = 329;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public additiveExpr(): AdditiveExprContext {
    let _localctx: AdditiveExprContext = new AdditiveExprContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 60, intentlangParser.RULE_additiveExpr);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 330;
        this.multiplicativeExpr();
        this.state = 335;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (
          _la === intentlangParser.PLUS ||
          _la === intentlangParser.MINUS
        ) {
          {
            {
              this.state = 331;
              _la = this._input.LA(1);
              if (
                !(
                  _la === intentlangParser.PLUS ||
                  _la === intentlangParser.MINUS
                )
              ) {
                this._errHandler.recoverInline(this);
              } else {
                if (this._input.LA(1) === Token.EOF) {
                  this.matchedEOF = true;
                }

                this._errHandler.reportMatch(this);
                this.consume();
              }
              this.state = 332;
              this.multiplicativeExpr();
            }
          }
          this.state = 337;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public multiplicativeExpr(): MultiplicativeExprContext {
    let _localctx: MultiplicativeExprContext = new MultiplicativeExprContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 62, intentlangParser.RULE_multiplicativeExpr);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 338;
        this.unaryExpr();
        this.state = 343;
        this._errHandler.sync(this);
        _la = this._input.LA(1);
        while (
          ((_la - 36) & ~0x1f) === 0 &&
          ((1 << (_la - 36)) &
            ((1 << (intentlangParser.STAR - 36)) |
              (1 << (intentlangParser.SLASH - 36)) |
              (1 << (intentlangParser.PERCENT - 36)))) !==
            0
        ) {
          {
            {
              this.state = 339;
              _la = this._input.LA(1);
              if (
                !(
                  ((_la - 36) & ~0x1f) === 0 &&
                  ((1 << (_la - 36)) &
                    ((1 << (intentlangParser.STAR - 36)) |
                      (1 << (intentlangParser.SLASH - 36)) |
                      (1 << (intentlangParser.PERCENT - 36)))) !==
                    0
                )
              ) {
                this._errHandler.recoverInline(this);
              } else {
                if (this._input.LA(1) === Token.EOF) {
                  this.matchedEOF = true;
                }

                this._errHandler.reportMatch(this);
                this.consume();
              }
              this.state = 340;
              this.unaryExpr();
            }
          }
          this.state = 345;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public unaryExpr(): UnaryExprContext {
    let _localctx: UnaryExprContext = new UnaryExprContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 64, intentlangParser.RULE_unaryExpr);
    let _la: number;
    try {
      this.state = 349;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case intentlangParser.MINUS:
        case intentlangParser.BANG:
          this.enterOuterAlt(_localctx, 1);
          {
            this.state = 346;
            _la = this._input.LA(1);
            if (
              !(_la === intentlangParser.MINUS || _la === intentlangParser.BANG)
            ) {
              this._errHandler.recoverInline(this);
            } else {
              if (this._input.LA(1) === Token.EOF) {
                this.matchedEOF = true;
              }

              this._errHandler.reportMatch(this);
              this.consume();
            }
            this.state = 347;
            this.unaryExpr();
          }
          break;
        case intentlangParser.BOOL:
        case intentlangParser.IDENT:
        case intentlangParser.STRING:
        case intentlangParser.FLOAT:
        case intentlangParser.INT:
        case intentlangParser.LPAREN:
          this.enterOuterAlt(_localctx, 2);
          {
            this.state = 348;
            this.primaryExpr();
          }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public primaryExpr(): PrimaryExprContext {
    let _localctx: PrimaryExprContext = new PrimaryExprContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 66, intentlangParser.RULE_primaryExpr);
    try {
      this.state = 357;
      this._errHandler.sync(this);
      switch (this._input.LA(1)) {
        case intentlangParser.BOOL:
        case intentlangParser.STRING:
        case intentlangParser.FLOAT:
        case intentlangParser.INT:
          this.enterOuterAlt(_localctx, 1);
          {
            this.state = 351;
            this.literal();
          }
          break;
        case intentlangParser.IDENT:
          this.enterOuterAlt(_localctx, 2);
          {
            this.state = 352;
            this.match(intentlangParser.IDENT);
          }
          break;
        case intentlangParser.LPAREN:
          this.enterOuterAlt(_localctx, 3);
          {
            this.state = 353;
            this.match(intentlangParser.LPAREN);
            this.state = 354;
            this.expr();
            this.state = 355;
            this.match(intentlangParser.RPAREN);
          }
          break;
        default:
          throw new NoViableAltException(this);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public literal(): LiteralContext {
    let _localctx: LiteralContext = new LiteralContext(this._ctx, this.state);
    this.enterRule(_localctx, 68, intentlangParser.RULE_literal);
    let _la: number;
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 359;
        _la = this._input.LA(1);
        if (
          !(
            (_la & ~0x1f) === 0 &&
            ((1 << _la) &
              ((1 << intentlangParser.BOOL) |
                (1 << intentlangParser.STRING) |
                (1 << intentlangParser.FLOAT) |
                (1 << intentlangParser.INT))) !==
              0
          )
        ) {
          this._errHandler.recoverInline(this);
        } else {
          if (this._input.LA(1) === Token.EOF) {
            this.matchedEOF = true;
          }

          this._errHandler.reportMatch(this);
          this.consume();
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }
  // @RuleVersion(0)
  public stringLiteral(): StringLiteralContext {
    let _localctx: StringLiteralContext = new StringLiteralContext(
      this._ctx,
      this.state,
    );
    this.enterRule(_localctx, 70, intentlangParser.RULE_stringLiteral);
    try {
      this.enterOuterAlt(_localctx, 1);
      {
        this.state = 361;
        this.match(intentlangParser.STRING);
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re;
        this._errHandler.reportError(this, re);
        this._errHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return _localctx;
  }

  public static readonly _serializedATN: string =
    "\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03/\u016E\x04\x02" +
    "\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
    "\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
    "\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
    "\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
    "\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C\x04" +
    '\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04"\t"\x04#' +
    "\t#\x04$\t$\x04%\t%\x03\x02\x03\x02\x03\x02\x03\x03\x05\x03O\n\x03\x03" +
    "\x03\x05\x03R\n\x03\x03\x03\x05\x03U\n\x03\x03\x03\x07\x03X\n\x03\f\x03" +
    "\x0E\x03[\v\x03\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x05\x03\x05" +
    "\x03\x05\x03\x05\x07\x05f\n\x05\f\x05\x0E\x05i\v\x05\x05\x05k\n\x05\x03" +
    "\x05\x03\x05\x03\x06\x03\x06\x03\x06\x07\x06r\n\x06\f\x06\x0E\x06u\v\x06" +
    "\x03\x06\x03\x06\x03\x07\x03\x07\x03\x07\x07\x07|\n\x07\f\x07\x0E\x07" +
    "\x7F\v\x07\x03\x07\x03\x07\x03\b\x03\b\x03\b\x05\b\x86\n\b\x03\b\x03\b" +
    "\x05\b\x8A\n\b\x03\b\x03\b\x05\b\x8E\n\b\x03\b\x05\b\x91\n\b\x03\t\x03" +
    "\t\x03\t\x03\t\x03\t\x05\t\x98\n\t\x03\n\x03\n\x03\v\x03\v\x03\v\x07\v" +
    "\x9F\n\v\f\v\x0E\v\xA2\v\v\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03" +
    "\f\x05\f\xAC\n\f\x03\r\x03\r\x03\r\x03\r\x03\r\x07\r\xB3\n\r\f\r\x0E\r" +
    "\xB6\v\r\x03\r\x03\r\x05\r\xBA\n\r\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x07" +
    "\x0E\xC0\n\x0E\f\x0E\x0E\x0E\xC3\v\x0E\x03\x0E\x03\x0E\x03\x0F\x03\x0F" +
    "\x03\x0F\x03\x0F\x03\x10\x03\x10\x03\x10\x03\x10\x06\x10\xCF\n\x10\r\x10" +
    "\x0E\x10\xD0\x03\x10\x03\x10\x03\x11\x03\x11\x03\x12\x03\x12\x03\x12\x03" +
    "\x12\x05\x12\xDB\n\x12\x03\x13\x03\x13\x03\x13\x03\x13\x05\x13\xE1\n\x13" +
    "\x03\x13\x03\x13\x03\x13\x05\x13\xE6\n\x13\x03\x13\x05\x13\xE9\n\x13\x03" +
    "\x14\x03\x14\x03\x14\x03\x14\x05\x14\xEF\n\x14\x03\x14\x03\x14\x03\x14" +
    "\x05\x14\xF4\n\x14\x03\x14\x03\x14\x03\x14\x05\x14\xF9\n\x14\x03\x15\x03" +
    "\x15\x03\x15\x03\x15\x03\x16\x03\x16\x03\x16\x07\x16\u0102\n\x16\f\x16" +
    "\x0E\x16\u0105\v\x16\x03\x17\x03\x17\x03\x17\x05\x17\u010A\n\x17\x03\x18" +
    "\x03\x18\x07\x18\u010E\n\x18\f\x18\x0E\x18\u0111\v\x18\x03\x18\x03\x18" +
    "\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x05\x19" +
    "\u011D\n\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x05\x19\u0124\n\x19" +
    "\x03\x1A\x03\x1A\x03\x1B\x03\x1B\x03\x1B\x05\x1B\u012B\n\x1B\x03\x1C\x03" +
    "\x1C\x03\x1C\x07\x1C\u0130\n\x1C\f\x1C\x0E\x1C\u0133\v\x1C\x03\x1D\x03" +
    "\x1D\x03\x1D\x07\x1D\u0138\n\x1D\f\x1D\x0E\x1D\u013B\v\x1D\x03\x1E\x03" +
    "\x1E\x03\x1E\x07\x1E\u0140\n\x1E\f\x1E\x0E\x1E\u0143\v\x1E\x03\x1F\x03" +
    "\x1F\x03\x1F\x07\x1F\u0148\n\x1F\f\x1F\x0E\x1F\u014B\v\x1F\x03 \x03 \x03" +
    " \x07 \u0150\n \f \x0E \u0153\v \x03!\x03!\x03!\x07!\u0158\n!\f!\x0E!" +
    '\u015B\v!\x03"\x03"\x03"\x05"\u0160\n"\x03#\x03#\x03#\x03#\x03#\x03' +
    "#\x05#\u0168\n#\x03$\x03$\x03%\x03%\x03%\x02\x02\x02&\x02\x02\x04\x02" +
    "\x06\x02\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18" +
    '\x02\x1A\x02\x1C\x02\x1E\x02 \x02"\x02$\x02&\x02(\x02*\x02,\x02.\x02' +
    "0\x022\x024\x026\x028\x02:\x02<\x02>\x02@\x02B\x02D\x02F\x02H\x02\x02" +
    '\b\x04\x02\x0E\x0E\x10\x12\x03\x02!"\x03\x02\x1D \x03\x02$%\x03\x02&' +
    "(\x04\x02%%))\x02\u0179\x02J\x03\x02\x02\x02\x04N\x03\x02\x02\x02\x06" +
    "\\\x03\x02\x02\x02\ba\x03\x02\x02\x02\nn\x03\x02\x02\x02\fx\x03\x02\x02" +
    "\x02\x0E\x82\x03\x02\x02\x02\x10\x92\x03\x02\x02\x02\x12\x99\x03\x02\x02" +
    "\x02\x14\x9B\x03\x02\x02\x02\x16\xAB\x03\x02\x02\x02\x18\xAD\x03\x02\x02" +
    "\x02\x1A\xBB\x03\x02\x02\x02\x1C\xC6\x03\x02\x02\x02\x1E\xCA\x03\x02\x02" +
    '\x02 \xD4\x03\x02\x02\x02"\xDA\x03\x02\x02\x02$\xDC\x03\x02\x02\x02&' +
    "\xEA\x03\x02\x02\x02(\xFA\x03\x02\x02\x02*\xFE\x03\x02\x02\x02,\u0106" +
    "\x03\x02\x02\x02.\u010B\x03\x02\x02\x020\u0123\x03\x02\x02\x022\u0125" +
    "\x03\x02\x02\x024\u0127\x03\x02\x02\x026\u012C\x03\x02\x02\x028\u0134" +
    "\x03\x02\x02\x02:\u013C\x03\x02\x02\x02<\u0144\x03\x02\x02\x02>\u014C" +
    "\x03\x02\x02\x02@\u0154\x03\x02\x02\x02B\u015F\x03\x02\x02\x02D\u0167" +
    "\x03\x02\x02\x02F\u0169\x03\x02\x02\x02H\u016B\x03\x02\x02\x02JK\x05\x04" +
    "\x03\x02KL\x07\x02\x02\x03L\x03\x03\x02\x02\x02MO\x05\x06\x04\x02NM\x03" +
    "\x02\x02\x02NO\x03\x02\x02\x02OQ\x03\x02\x02\x02PR\x05\n\x06\x02QP\x03" +
    "\x02\x02\x02QR\x03\x02\x02\x02RT\x03\x02\x02\x02SU\x05\f\x07\x02TS\x03" +
    '\x02\x02\x02TU\x03\x02\x02\x02UY\x03\x02\x02\x02VX\x05"\x12\x02WV\x03' +
    "\x02\x02\x02X[\x03\x02\x02\x02YW\x03\x02\x02\x02YZ\x03\x02\x02\x02Z\x05" +
    "\x03\x02\x02\x02[Y\x03\x02\x02\x02\\]\x07\x03\x02\x02]^\x05H%\x02^_\x07" +
    "\x06\x02\x02_`\x05\b\x05\x02`\x07\x03\x02\x02\x02aj\x07\x17\x02\x02bg" +
    "\x05H%\x02cd\x07\x19\x02\x02df\x05H%\x02ec\x03\x02\x02\x02fi\x03\x02\x02" +
    "\x02ge\x03\x02\x02\x02gh\x03\x02\x02\x02hk\x03\x02\x02\x02ig\x03\x02\x02" +
    "\x02jb\x03\x02\x02\x02jk\x03\x02\x02\x02kl\x03\x02\x02\x02lm\x07\x18\x02" +
    "\x02m\t\x03\x02\x02\x02no\x07\x04\x02\x02os\x07\x13\x02\x02pr\x05\x0E" +
    "\b\x02qp\x03\x02\x02\x02ru\x03\x02\x02\x02sq\x03\x02\x02\x02st\x03\x02" +
    "\x02\x02tv\x03\x02\x02\x02us\x03\x02\x02\x02vw\x07\x14\x02\x02w\v\x03" +
    "\x02\x02\x02xy\x07\x05\x02\x02y}\x07\x13\x02\x02z|\x05\x10\t\x02{z\x03" +
    "\x02\x02\x02|\x7F\x03\x02\x02\x02}{\x03\x02\x02\x02}~\x03\x02\x02\x02" +
    "~\x80\x03\x02\x02\x02\x7F}\x03\x02\x02\x02\x80\x81\x07\x14\x02\x02\x81" +
    "\r\x03\x02\x02\x02\x82\x85\x07\x0F\x02\x02\x83\x84\x07\r\x02\x02\x84\x86" +
    "\x07\x0F\x02\x02\x85\x83\x03\x02\x02\x02\x85\x86\x03\x02\x02\x02\x86\x89" +
    "\x03\x02\x02\x02\x87\x88\x07\x1B\x02\x02\x88\x8A\x07\x0F\x02\x02\x89\x87" +
    "\x03\x02\x02\x02\x89\x8A\x03\x02\x02\x02\x8A\x8D\x03\x02\x02\x02\x8B\x8C" +
    "\x07\x13\x02\x02\x8C\x8E\x07\x14\x02\x02\x8D\x8B\x03\x02\x02\x02\x8D\x8E" +
    "\x03\x02\x02\x02\x8E\x90\x03\x02\x02\x02\x8F\x91\x07\x1A\x02\x02\x90\x8F" +
    "\x03\x02\x02\x02\x90\x91\x03\x02\x02\x02\x91\x0F\x03\x02\x02\x02\x92\x93" +
    "\x07\x07\x02\x02\x93\x94\x07\x0F\x02\x02\x94\x95\x07#\x02\x02\x95\x97" +
    "\x05\x12\n\x02\x96\x98\x07\x1A\x02\x02\x97\x96\x03\x02\x02\x02\x97\x98" +
    "\x03\x02\x02\x02\x98\x11\x03\x02\x02\x02\x99\x9A\x05\x14\v\x02\x9A\x13" +
    "\x03\x02\x02\x02\x9B\xA0\x05\x16\f\x02\x9C\x9D\x07*\x02\x02\x9D\x9F\x05" +
    "\x16\f\x02\x9E\x9C\x03\x02\x02\x02\x9F\xA2\x03\x02\x02\x02\xA0\x9E\x03" +
    "\x02\x02\x02\xA0\xA1\x03\x02\x02\x02\xA1\x15\x03\x02\x02\x02\xA2\xA0\x03" +
    "\x02\x02\x02\xA3\xAC\x05\x18\r\x02\xA4\xAC\x05 \x11\x02\xA5\xAC\x05\x1A" +
    "\x0E\x02\xA6\xAC\x05\x1E\x10\x02\xA7\xA8\x07\x15\x02\x02\xA8\xA9\x05\x12" +
    "\n\x02\xA9\xAA\x07\x16\x02\x02\xAA\xAC\x03\x02\x02\x02\xAB\xA3\x03\x02" +
    "\x02\x02\xAB\xA4\x03\x02\x02\x02\xAB\xA5\x03\x02\x02\x02\xAB\xA6\x03\x02" +
    "\x02\x02\xAB\xA7\x03\x02\x02\x02\xAC\x17\x03\x02\x02\x02\xAD\xB9\x07\x0F" +
    "\x02\x02\xAE\xAF\x07\x1D\x02\x02\xAF\xB4\x05\x12\n\x02\xB0\xB1\x07\x19" +
    "\x02\x02\xB1\xB3\x05\x12\n\x02\xB2\xB0\x03\x02\x02\x02\xB3\xB6\x03\x02" +
    "\x02\x02\xB4\xB2\x03\x02\x02\x02\xB4\xB5\x03\x02\x02\x02\xB5\xB7\x03\x02" +
    "\x02\x02\xB6\xB4\x03\x02\x02\x02\xB7\xB8\x07\x1E\x02\x02\xB8\xBA\x03\x02" +
    "\x02\x02\xB9\xAE\x03\x02\x02\x02\xB9\xBA\x03\x02\x02\x02\xBA\x19\x03\x02" +
    "\x02\x02\xBB\xBC\x07\x13\x02\x02\xBC\xC1\x05\x1C\x0F\x02\xBD\xBE\x07\x19" +
    "\x02\x02\xBE\xC0\x05\x1C\x0F\x02\xBF\xBD\x03\x02\x02\x02\xC0\xC3\x03\x02" +
    "\x02\x02\xC1\xBF\x03\x02\x02\x02\xC1\xC2\x03\x02\x02\x02\xC2\xC4\x03\x02" +
    "\x02\x02\xC3\xC1\x03\x02\x02\x02\xC4\xC5\x07\x14\x02\x02\xC5\x1B\x03\x02" +
    "\x02\x02\xC6\xC7\x07\x0F\x02\x02\xC7\xC8\x07\x1B\x02\x02\xC8\xC9\x05\x12" +
    "\n\x02\xC9\x1D\x03\x02\x02\x02\xCA\xCB\x07\x15\x02\x02\xCB\xCE\x05\x12" +
    "\n\x02\xCC\xCD\x07\x19\x02\x02\xCD\xCF\x05\x12\n\x02\xCE\xCC\x03\x02\x02" +
    "\x02\xCF\xD0\x03\x02\x02\x02\xD0\xCE\x03\x02\x02\x02\xD0\xD1\x03\x02\x02" +
    "\x02\xD1\xD2\x03\x02\x02\x02\xD2\xD3\x07\x16\x02\x02\xD3\x1F\x03\x02\x02" +
    "\x02\xD4\xD5\t\x02\x02\x02\xD5!\x03\x02\x02\x02\xD6\xDB\x05$\x13\x02\xD7" +
    "\xDB\x05&\x14\x02\xD8\xDB\x05(\x15\x02\xD9\xDB\x050\x19\x02\xDA\xD6\x03" +
    "\x02\x02\x02\xDA\xD7\x03\x02\x02\x02\xDA\xD8\x03\x02\x02\x02\xDA\xD9\x03" +
    "\x02\x02\x02\xDB#\x03\x02\x02\x02\xDC\xDD\x07\t\x02\x02\xDD\xDE\x07\x0F" +
    "\x02\x02\xDE\xE0\x07\x15\x02\x02\xDF\xE1\x05*\x16\x02\xE0\xDF\x03\x02" +
    "\x02\x02\xE0\xE1\x03\x02\x02\x02\xE1\xE2\x03\x02\x02\x02\xE2\xE5\x07\x16" +
    "\x02\x02\xE3\xE4\x07\x1B\x02\x02\xE4\xE6\x05\x12\n\x02\xE5\xE3\x03\x02" +
    "\x02\x02\xE5\xE6\x03\x02\x02\x02\xE6\xE8\x03\x02\x02\x02\xE7\xE9\x05." +
    "\x18\x02\xE8\xE7\x03\x02\x02\x02\xE8\xE9\x03\x02\x02\x02\xE9%\x03\x02" +
    "\x02\x02\xEA\xEB\x07\b\x02\x02\xEB\xEC\x07\x0F\x02\x02\xEC\xEE\x07\x15" +
    "\x02\x02\xED\xEF\x05*\x16\x02\xEE\xED\x03\x02\x02\x02\xEE\xEF\x03\x02" +
    "\x02\x02\xEF\xF0\x03\x02\x02\x02\xF0\xF3\x07\x16\x02\x02\xF1\xF2\x07\x1B" +
    "\x02\x02\xF2\xF4\x05\x12\n\x02\xF3\xF1\x03\x02\x02\x02\xF3\xF4\x03\x02" +
    "\x02\x02\xF4\xF5\x03\x02\x02\x02\xF5\xF6\x07\x04\x02\x02\xF6\xF8\x07\x0F" +
    "\x02\x02\xF7\xF9\x05.\x18\x02\xF8\xF7\x03\x02\x02\x02\xF8\xF9\x03\x02" +
    "\x02\x02\xF9\'\x03\x02\x02\x02\xFA\xFB\x07\n\x02\x02\xFB\xFC\x07\x0F\x02" +
    "\x02\xFC\xFD\x05.\x18\x02\xFD)\x03\x02\x02\x02\xFE\u0103\x05,\x17\x02" +
    "\xFF\u0100\x07\x19\x02\x02\u0100\u0102\x05,\x17\x02\u0101\xFF\x03\x02" +
    "\x02\x02\u0102\u0105\x03\x02\x02\x02\u0103\u0101\x03\x02\x02\x02\u0103" +
    "\u0104\x03\x02\x02\x02\u0104+\x03\x02\x02\x02\u0105\u0103\x03\x02\x02" +
    "\x02\u0106\u0109\x07\x0F\x02\x02\u0107\u0108\x07\x1B\x02\x02\u0108\u010A" +
    "\x05\x12\n\x02\u0109\u0107\x03\x02\x02\x02\u0109\u010A\x03\x02\x02\x02" +
    "\u010A-\x03\x02\x02\x02\u010B\u010F\x07\x13\x02\x02\u010C\u010E\x050\x19" +
    "\x02\u010D\u010C\x03\x02\x02\x02\u010E\u0111\x03\x02\x02\x02\u010F\u010D" +
    "\x03\x02\x02\x02\u010F\u0110\x03\x02\x02\x02\u0110\u0112\x03\x02\x02\x02" +
    "\u0111\u010F\x03\x02\x02\x02\u0112\u0113\x07\x14\x02\x02\u0113/\x03\x02" +
    "\x02\x02\u0114\u0115\x07\v\x02\x02\u0115\u0116\x052\x1A\x02\u0116\u0117" +
    "\x07\x1A\x02\x02\u0117\u0124\x03\x02\x02\x02\u0118\u0119\x07\f\x02\x02" +
    "\u0119\u011C\x07\x0F\x02\x02\u011A\u011B\x07#\x02\x02\u011B\u011D\x05" +
    "2\x1A\x02\u011C\u011A\x03\x02\x02\x02\u011C\u011D\x03\x02\x02\x02\u011D" +
    "\u011E\x03\x02\x02\x02\u011E\u0124\x07\x1A\x02\x02\u011F\u0124\x05.\x18" +
    "\x02\u0120\u0121\x052\x1A\x02\u0121\u0122\x07\x1A\x02\x02\u0122\u0124" +
    "\x03\x02\x02\x02\u0123\u0114\x03\x02\x02\x02\u0123\u0118\x03\x02\x02\x02" +
    "\u0123\u011F\x03\x02\x02\x02\u0123\u0120\x03\x02\x02\x02\u01241\x03\x02" +
    "\x02\x02\u0125\u0126\x054\x1B\x02\u01263\x03\x02\x02\x02\u0127\u012A\x05" +
    "6\x1C\x02\u0128\u0129\x07#\x02\x02\u0129\u012B\x054\x1B\x02\u012A\u0128" +
    "\x03\x02\x02\x02\u012A\u012B\x03\x02\x02\x02\u012B5\x03\x02\x02\x02\u012C" +
    "\u0131\x058\x1D\x02\u012D\u012E\x07+\x02\x02\u012E\u0130\x058\x1D\x02" +
    "\u012F\u012D\x03\x02\x02\x02\u0130\u0133\x03\x02\x02\x02\u0131\u012F\x03" +
    "\x02\x02\x02\u0131\u0132\x03\x02\x02\x02\u01327\x03\x02\x02\x02\u0133" +
    "\u0131\x03\x02\x02\x02\u0134\u0139\x05:\x1E\x02\u0135\u0136\x07,\x02\x02" +
    "\u0136\u0138\x05:\x1E\x02\u0137\u0135\x03\x02\x02\x02\u0138\u013B\x03" +
    "\x02\x02\x02\u0139\u0137\x03\x02\x02\x02\u0139\u013A\x03\x02\x02\x02\u013A" +
    "9\x03\x02\x02\x02\u013B\u0139\x03\x02\x02\x02\u013C\u0141\x05<\x1F\x02" +
    "\u013D\u013E\t\x03\x02\x02\u013E\u0140\x05<\x1F\x02\u013F\u013D\x03\x02" +
    "\x02\x02\u0140\u0143\x03\x02\x02\x02\u0141\u013F\x03\x02\x02\x02\u0141" +
    "\u0142\x03\x02\x02\x02\u0142;\x03\x02\x02\x02\u0143\u0141\x03\x02\x02" +
    "\x02\u0144\u0149\x05> \x02\u0145\u0146\t\x04\x02\x02\u0146\u0148\x05>" +
    " \x02\u0147\u0145\x03\x02\x02\x02\u0148\u014B\x03\x02\x02\x02\u0149\u0147" +
    "\x03\x02\x02\x02\u0149\u014A\x03\x02\x02\x02\u014A=\x03\x02\x02\x02\u014B" +
    "\u0149\x03\x02\x02\x02\u014C\u0151\x05@!\x02\u014D\u014E\t\x05\x02\x02" +
    "\u014E\u0150\x05@!\x02\u014F\u014D\x03\x02\x02\x02\u0150\u0153\x03\x02" +
    "\x02\x02\u0151\u014F\x03\x02\x02\x02\u0151\u0152\x03\x02\x02\x02\u0152" +
    '?\x03\x02\x02\x02\u0153\u0151\x03\x02\x02\x02\u0154\u0159\x05B"\x02\u0155' +
    '\u0156\t\x06\x02\x02\u0156\u0158\x05B"\x02\u0157\u0155\x03\x02\x02\x02' +
    "\u0158\u015B\x03\x02\x02\x02\u0159\u0157\x03\x02\x02\x02\u0159\u015A\x03" +
    "\x02\x02\x02\u015AA\x03\x02\x02\x02\u015B\u0159\x03\x02\x02\x02\u015C" +
    '\u015D\t\x07\x02\x02\u015D\u0160\x05B"\x02\u015E\u0160\x05D#\x02\u015F' +
    "\u015C\x03\x02\x02\x02\u015F\u015E\x03\x02\x02\x02\u0160C\x03\x02\x02" +
    "\x02\u0161\u0168\x05F$\x02\u0162\u0168\x07\x0F\x02\x02\u0163\u0164\x07" +
    "\x15\x02\x02\u0164\u0165\x052\x1A\x02\u0165\u0166\x07\x16\x02\x02\u0166" +
    "\u0168\x03\x02\x02\x02\u0167\u0161\x03\x02\x02\x02\u0167\u0162\x03\x02" +
    "\x02\x02\u0167\u0163\x03\x02\x02\x02\u0168E\x03\x02\x02\x02\u0169\u016A" +
    "\t\x02\x02\x02\u016AG\x03\x02\x02\x02\u016B\u016C\x07\x10\x02\x02\u016C" +
    "I\x03\x02\x02\x02*NQTYgjs}\x85\x89\x8D\x90\x97\xA0\xAB\xB4\xB9\xC1\xD0" +
    "\xDA\xE0\xE5\xE8\xEE\xF3\xF8\u0103\u0109\u010F\u011C\u0123\u012A\u0131" +
    "\u0139\u0141\u0149\u0151\u0159\u015F\u0167";
  public static __ATN: ATN;
  public static get _ATN(): ATN {
    if (!intentlangParser.__ATN) {
      intentlangParser.__ATN = new ATNDeserializer().deserialize(
        Utils.toCharArray(intentlangParser._serializedATN),
      );
    }

    return intentlangParser.__ATN;
  }
}

export class FileContext extends ParserRuleContext {
  public program(): ProgramContext {
    return this.getRuleContext(0, ProgramContext);
  }
  public EOF(): TerminalNode {
    return this.getToken(intentlangParser.EOF, 0);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_file;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterFile) {
      listener.enterFile(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitFile) {
      listener.exitFile(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitFile) {
      return visitor.visitFile(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class ProgramContext extends ParserRuleContext {
  public intentSection(): IntentSectionContext | undefined {
    return this.tryGetRuleContext(0, IntentSectionContext);
  }
  public usesSection(): UsesSectionContext | undefined {
    return this.tryGetRuleContext(0, UsesSectionContext);
  }
  public typesSection(): TypesSectionContext | undefined {
    return this.tryGetRuleContext(0, TypesSectionContext);
  }
  public item(): ItemContext[];
  public item(i: number): ItemContext;
  public item(i?: number): ItemContext | ItemContext[] {
    if (i === undefined) {
      return this.getRuleContexts(ItemContext);
    } else {
      return this.getRuleContext(i, ItemContext);
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_program;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterProgram) {
      listener.enterProgram(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitProgram) {
      listener.exitProgram(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitProgram) {
      return visitor.visitProgram(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class IntentSectionContext extends ParserRuleContext {
  public INTENT(): TerminalNode {
    return this.getToken(intentlangParser.INTENT, 0);
  }
  public stringLiteral(): StringLiteralContext {
    return this.getRuleContext(0, StringLiteralContext);
  }
  public TAGS(): TerminalNode {
    return this.getToken(intentlangParser.TAGS, 0);
  }
  public tagList(): TagListContext {
    return this.getRuleContext(0, TagListContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_intentSection;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterIntentSection) {
      listener.enterIntentSection(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitIntentSection) {
      listener.exitIntentSection(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitIntentSection) {
      return visitor.visitIntentSection(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class TagListContext extends ParserRuleContext {
  public LBRACK(): TerminalNode {
    return this.getToken(intentlangParser.LBRACK, 0);
  }
  public RBRACK(): TerminalNode {
    return this.getToken(intentlangParser.RBRACK, 0);
  }
  public stringLiteral(): StringLiteralContext[];
  public stringLiteral(i: number): StringLiteralContext;
  public stringLiteral(
    i?: number,
  ): StringLiteralContext | StringLiteralContext[] {
    if (i === undefined) {
      return this.getRuleContexts(StringLiteralContext);
    } else {
      return this.getRuleContext(i, StringLiteralContext);
    }
  }
  public COMMA(): TerminalNode[];
  public COMMA(i: number): TerminalNode;
  public COMMA(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.COMMA);
    } else {
      return this.getToken(intentlangParser.COMMA, i);
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_tagList;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterTagList) {
      listener.enterTagList(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitTagList) {
      listener.exitTagList(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitTagList) {
      return visitor.visitTagList(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class UsesSectionContext extends ParserRuleContext {
  public USES(): TerminalNode {
    return this.getToken(intentlangParser.USES, 0);
  }
  public LBRACE(): TerminalNode {
    return this.getToken(intentlangParser.LBRACE, 0);
  }
  public RBRACE(): TerminalNode {
    return this.getToken(intentlangParser.RBRACE, 0);
  }
  public useDecl(): UseDeclContext[];
  public useDecl(i: number): UseDeclContext;
  public useDecl(i?: number): UseDeclContext | UseDeclContext[] {
    if (i === undefined) {
      return this.getRuleContexts(UseDeclContext);
    } else {
      return this.getRuleContext(i, UseDeclContext);
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_usesSection;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterUsesSection) {
      listener.enterUsesSection(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitUsesSection) {
      listener.exitUsesSection(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitUsesSection) {
      return visitor.visitUsesSection(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class TypesSectionContext extends ParserRuleContext {
  public TYPES(): TerminalNode {
    return this.getToken(intentlangParser.TYPES, 0);
  }
  public LBRACE(): TerminalNode {
    return this.getToken(intentlangParser.LBRACE, 0);
  }
  public RBRACE(): TerminalNode {
    return this.getToken(intentlangParser.RBRACE, 0);
  }
  public typeDecl(): TypeDeclContext[];
  public typeDecl(i: number): TypeDeclContext;
  public typeDecl(i?: number): TypeDeclContext | TypeDeclContext[] {
    if (i === undefined) {
      return this.getRuleContexts(TypeDeclContext);
    } else {
      return this.getRuleContext(i, TypeDeclContext);
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_typesSection;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterTypesSection) {
      listener.enterTypesSection(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitTypesSection) {
      listener.exitTypesSection(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitTypesSection) {
      return visitor.visitTypesSection(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class UseDeclContext extends ParserRuleContext {
  public IDENT(): TerminalNode[];
  public IDENT(i: number): TerminalNode;
  public IDENT(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.IDENT);
    } else {
      return this.getToken(intentlangParser.IDENT, i);
    }
  }
  public AS(): TerminalNode | undefined {
    return this.getToken(intentlangParser.AS, 0);
  }
  public COLON(): TerminalNode | undefined {
    return this.getToken(intentlangParser.COLON, 0);
  }
  public LBRACE(): TerminalNode | undefined {
    return this.getToken(intentlangParser.LBRACE, 0);
  }
  public RBRACE(): TerminalNode | undefined {
    return this.getToken(intentlangParser.RBRACE, 0);
  }
  public SEMI(): TerminalNode | undefined {
    return this.getToken(intentlangParser.SEMI, 0);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_useDecl;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterUseDecl) {
      listener.enterUseDecl(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitUseDecl) {
      listener.exitUseDecl(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitUseDecl) {
      return visitor.visitUseDecl(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class TypeDeclContext extends ParserRuleContext {
  public TYPEKW(): TerminalNode {
    return this.getToken(intentlangParser.TYPEKW, 0);
  }
  public IDENT(): TerminalNode {
    return this.getToken(intentlangParser.IDENT, 0);
  }
  public ASSIGN(): TerminalNode {
    return this.getToken(intentlangParser.ASSIGN, 0);
  }
  public typeExpr(): TypeExprContext {
    return this.getRuleContext(0, TypeExprContext);
  }
  public SEMI(): TerminalNode | undefined {
    return this.getToken(intentlangParser.SEMI, 0);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_typeDecl;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterTypeDecl) {
      listener.enterTypeDecl(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitTypeDecl) {
      listener.exitTypeDecl(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitTypeDecl) {
      return visitor.visitTypeDecl(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class TypeExprContext extends ParserRuleContext {
  public unionType(): UnionTypeContext {
    return this.getRuleContext(0, UnionTypeContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_typeExpr;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterTypeExpr) {
      listener.enterTypeExpr(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitTypeExpr) {
      listener.exitTypeExpr(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitTypeExpr) {
      return visitor.visitTypeExpr(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class UnionTypeContext extends ParserRuleContext {
  public typeAtom(): TypeAtomContext[];
  public typeAtom(i: number): TypeAtomContext;
  public typeAtom(i?: number): TypeAtomContext | TypeAtomContext[] {
    if (i === undefined) {
      return this.getRuleContexts(TypeAtomContext);
    } else {
      return this.getRuleContext(i, TypeAtomContext);
    }
  }
  public OR(): TerminalNode[];
  public OR(i: number): TerminalNode;
  public OR(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.OR);
    } else {
      return this.getToken(intentlangParser.OR, i);
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_unionType;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterUnionType) {
      listener.enterUnionType(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitUnionType) {
      listener.exitUnionType(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitUnionType) {
      return visitor.visitUnionType(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class TypeAtomContext extends ParserRuleContext {
  public namedType(): NamedTypeContext | undefined {
    return this.tryGetRuleContext(0, NamedTypeContext);
  }
  public literalType(): LiteralTypeContext | undefined {
    return this.tryGetRuleContext(0, LiteralTypeContext);
  }
  public recordType(): RecordTypeContext | undefined {
    return this.tryGetRuleContext(0, RecordTypeContext);
  }
  public tupleType(): TupleTypeContext | undefined {
    return this.tryGetRuleContext(0, TupleTypeContext);
  }
  public LPAREN(): TerminalNode | undefined {
    return this.getToken(intentlangParser.LPAREN, 0);
  }
  public typeExpr(): TypeExprContext | undefined {
    return this.tryGetRuleContext(0, TypeExprContext);
  }
  public RPAREN(): TerminalNode | undefined {
    return this.getToken(intentlangParser.RPAREN, 0);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_typeAtom;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterTypeAtom) {
      listener.enterTypeAtom(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitTypeAtom) {
      listener.exitTypeAtom(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitTypeAtom) {
      return visitor.visitTypeAtom(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class NamedTypeContext extends ParserRuleContext {
  public IDENT(): TerminalNode {
    return this.getToken(intentlangParser.IDENT, 0);
  }
  public LT(): TerminalNode | undefined {
    return this.getToken(intentlangParser.LT, 0);
  }
  public typeExpr(): TypeExprContext[];
  public typeExpr(i: number): TypeExprContext;
  public typeExpr(i?: number): TypeExprContext | TypeExprContext[] {
    if (i === undefined) {
      return this.getRuleContexts(TypeExprContext);
    } else {
      return this.getRuleContext(i, TypeExprContext);
    }
  }
  public GT(): TerminalNode | undefined {
    return this.getToken(intentlangParser.GT, 0);
  }
  public COMMA(): TerminalNode[];
  public COMMA(i: number): TerminalNode;
  public COMMA(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.COMMA);
    } else {
      return this.getToken(intentlangParser.COMMA, i);
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_namedType;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterNamedType) {
      listener.enterNamedType(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitNamedType) {
      listener.exitNamedType(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitNamedType) {
      return visitor.visitNamedType(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class RecordTypeContext extends ParserRuleContext {
  public LBRACE(): TerminalNode {
    return this.getToken(intentlangParser.LBRACE, 0);
  }
  public field(): FieldContext[];
  public field(i: number): FieldContext;
  public field(i?: number): FieldContext | FieldContext[] {
    if (i === undefined) {
      return this.getRuleContexts(FieldContext);
    } else {
      return this.getRuleContext(i, FieldContext);
    }
  }
  public RBRACE(): TerminalNode {
    return this.getToken(intentlangParser.RBRACE, 0);
  }
  public COMMA(): TerminalNode[];
  public COMMA(i: number): TerminalNode;
  public COMMA(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.COMMA);
    } else {
      return this.getToken(intentlangParser.COMMA, i);
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_recordType;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterRecordType) {
      listener.enterRecordType(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitRecordType) {
      listener.exitRecordType(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitRecordType) {
      return visitor.visitRecordType(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class FieldContext extends ParserRuleContext {
  public IDENT(): TerminalNode {
    return this.getToken(intentlangParser.IDENT, 0);
  }
  public COLON(): TerminalNode {
    return this.getToken(intentlangParser.COLON, 0);
  }
  public typeExpr(): TypeExprContext {
    return this.getRuleContext(0, TypeExprContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_field;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterField) {
      listener.enterField(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitField) {
      listener.exitField(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitField) {
      return visitor.visitField(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class TupleTypeContext extends ParserRuleContext {
  public LPAREN(): TerminalNode {
    return this.getToken(intentlangParser.LPAREN, 0);
  }
  public typeExpr(): TypeExprContext[];
  public typeExpr(i: number): TypeExprContext;
  public typeExpr(i?: number): TypeExprContext | TypeExprContext[] {
    if (i === undefined) {
      return this.getRuleContexts(TypeExprContext);
    } else {
      return this.getRuleContext(i, TypeExprContext);
    }
  }
  public RPAREN(): TerminalNode {
    return this.getToken(intentlangParser.RPAREN, 0);
  }
  public COMMA(): TerminalNode[];
  public COMMA(i: number): TerminalNode;
  public COMMA(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.COMMA);
    } else {
      return this.getToken(intentlangParser.COMMA, i);
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_tupleType;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterTupleType) {
      listener.enterTupleType(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitTupleType) {
      listener.exitTupleType(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitTupleType) {
      return visitor.visitTupleType(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class LiteralTypeContext extends ParserRuleContext {
  public STRING(): TerminalNode | undefined {
    return this.getToken(intentlangParser.STRING, 0);
  }
  public FLOAT(): TerminalNode | undefined {
    return this.getToken(intentlangParser.FLOAT, 0);
  }
  public INT(): TerminalNode | undefined {
    return this.getToken(intentlangParser.INT, 0);
  }
  public BOOL(): TerminalNode | undefined {
    return this.getToken(intentlangParser.BOOL, 0);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_literalType;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterLiteralType) {
      listener.enterLiteralType(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitLiteralType) {
      listener.exitLiteralType(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitLiteralType) {
      return visitor.visitLiteralType(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class ItemContext extends ParserRuleContext {
  public funcDecl(): FuncDeclContext | undefined {
    return this.tryGetRuleContext(0, FuncDeclContext);
  }
  public effectDecl(): EffectDeclContext | undefined {
    return this.tryGetRuleContext(0, EffectDeclContext);
  }
  public testDecl(): TestDeclContext | undefined {
    return this.tryGetRuleContext(0, TestDeclContext);
  }
  public stmt(): StmtContext | undefined {
    return this.tryGetRuleContext(0, StmtContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_item;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterItem) {
      listener.enterItem(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitItem) {
      listener.exitItem(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitItem) {
      return visitor.visitItem(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class FuncDeclContext extends ParserRuleContext {
  public FN(): TerminalNode {
    return this.getToken(intentlangParser.FN, 0);
  }
  public IDENT(): TerminalNode {
    return this.getToken(intentlangParser.IDENT, 0);
  }
  public LPAREN(): TerminalNode {
    return this.getToken(intentlangParser.LPAREN, 0);
  }
  public RPAREN(): TerminalNode {
    return this.getToken(intentlangParser.RPAREN, 0);
  }
  public params(): ParamsContext | undefined {
    return this.tryGetRuleContext(0, ParamsContext);
  }
  public COLON(): TerminalNode | undefined {
    return this.getToken(intentlangParser.COLON, 0);
  }
  public typeExpr(): TypeExprContext | undefined {
    return this.tryGetRuleContext(0, TypeExprContext);
  }
  public block(): BlockContext | undefined {
    return this.tryGetRuleContext(0, BlockContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_funcDecl;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterFuncDecl) {
      listener.enterFuncDecl(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitFuncDecl) {
      listener.exitFuncDecl(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitFuncDecl) {
      return visitor.visitFuncDecl(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class EffectDeclContext extends ParserRuleContext {
  public EFFECT(): TerminalNode {
    return this.getToken(intentlangParser.EFFECT, 0);
  }
  public IDENT(): TerminalNode[];
  public IDENT(i: number): TerminalNode;
  public IDENT(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.IDENT);
    } else {
      return this.getToken(intentlangParser.IDENT, i);
    }
  }
  public LPAREN(): TerminalNode {
    return this.getToken(intentlangParser.LPAREN, 0);
  }
  public RPAREN(): TerminalNode {
    return this.getToken(intentlangParser.RPAREN, 0);
  }
  public USES(): TerminalNode {
    return this.getToken(intentlangParser.USES, 0);
  }
  public params(): ParamsContext | undefined {
    return this.tryGetRuleContext(0, ParamsContext);
  }
  public COLON(): TerminalNode | undefined {
    return this.getToken(intentlangParser.COLON, 0);
  }
  public typeExpr(): TypeExprContext | undefined {
    return this.tryGetRuleContext(0, TypeExprContext);
  }
  public block(): BlockContext | undefined {
    return this.tryGetRuleContext(0, BlockContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_effectDecl;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterEffectDecl) {
      listener.enterEffectDecl(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitEffectDecl) {
      listener.exitEffectDecl(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitEffectDecl) {
      return visitor.visitEffectDecl(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class TestDeclContext extends ParserRuleContext {
  public TEST(): TerminalNode {
    return this.getToken(intentlangParser.TEST, 0);
  }
  public IDENT(): TerminalNode {
    return this.getToken(intentlangParser.IDENT, 0);
  }
  public block(): BlockContext {
    return this.getRuleContext(0, BlockContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_testDecl;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterTestDecl) {
      listener.enterTestDecl(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitTestDecl) {
      listener.exitTestDecl(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitTestDecl) {
      return visitor.visitTestDecl(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class ParamsContext extends ParserRuleContext {
  public param(): ParamContext[];
  public param(i: number): ParamContext;
  public param(i?: number): ParamContext | ParamContext[] {
    if (i === undefined) {
      return this.getRuleContexts(ParamContext);
    } else {
      return this.getRuleContext(i, ParamContext);
    }
  }
  public COMMA(): TerminalNode[];
  public COMMA(i: number): TerminalNode;
  public COMMA(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.COMMA);
    } else {
      return this.getToken(intentlangParser.COMMA, i);
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_params;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterParams) {
      listener.enterParams(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitParams) {
      listener.exitParams(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitParams) {
      return visitor.visitParams(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class ParamContext extends ParserRuleContext {
  public IDENT(): TerminalNode {
    return this.getToken(intentlangParser.IDENT, 0);
  }
  public COLON(): TerminalNode | undefined {
    return this.getToken(intentlangParser.COLON, 0);
  }
  public typeExpr(): TypeExprContext | undefined {
    return this.tryGetRuleContext(0, TypeExprContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_param;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterParam) {
      listener.enterParam(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitParam) {
      listener.exitParam(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitParam) {
      return visitor.visitParam(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class BlockContext extends ParserRuleContext {
  public LBRACE(): TerminalNode {
    return this.getToken(intentlangParser.LBRACE, 0);
  }
  public RBRACE(): TerminalNode {
    return this.getToken(intentlangParser.RBRACE, 0);
  }
  public stmt(): StmtContext[];
  public stmt(i: number): StmtContext;
  public stmt(i?: number): StmtContext | StmtContext[] {
    if (i === undefined) {
      return this.getRuleContexts(StmtContext);
    } else {
      return this.getRuleContext(i, StmtContext);
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_block;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterBlock) {
      listener.enterBlock(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitBlock) {
      listener.exitBlock(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitBlock) {
      return visitor.visitBlock(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class StmtContext extends ParserRuleContext {
  public RETURN(): TerminalNode | undefined {
    return this.getToken(intentlangParser.RETURN, 0);
  }
  public expr(): ExprContext | undefined {
    return this.tryGetRuleContext(0, ExprContext);
  }
  public SEMI(): TerminalNode | undefined {
    return this.getToken(intentlangParser.SEMI, 0);
  }
  public LET(): TerminalNode | undefined {
    return this.getToken(intentlangParser.LET, 0);
  }
  public IDENT(): TerminalNode | undefined {
    return this.getToken(intentlangParser.IDENT, 0);
  }
  public ASSIGN(): TerminalNode | undefined {
    return this.getToken(intentlangParser.ASSIGN, 0);
  }
  public block(): BlockContext | undefined {
    return this.tryGetRuleContext(0, BlockContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_stmt;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterStmt) {
      listener.enterStmt(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitStmt) {
      listener.exitStmt(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitStmt) {
      return visitor.visitStmt(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class ExprContext extends ParserRuleContext {
  public assignmentExpr(): AssignmentExprContext {
    return this.getRuleContext(0, AssignmentExprContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_expr;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterExpr) {
      listener.enterExpr(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitExpr) {
      listener.exitExpr(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitExpr) {
      return visitor.visitExpr(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class AssignmentExprContext extends ParserRuleContext {
  public orExpr(): OrExprContext {
    return this.getRuleContext(0, OrExprContext);
  }
  public ASSIGN(): TerminalNode | undefined {
    return this.getToken(intentlangParser.ASSIGN, 0);
  }
  public assignmentExpr(): AssignmentExprContext | undefined {
    return this.tryGetRuleContext(0, AssignmentExprContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_assignmentExpr;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterAssignmentExpr) {
      listener.enterAssignmentExpr(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitAssignmentExpr) {
      listener.exitAssignmentExpr(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitAssignmentExpr) {
      return visitor.visitAssignmentExpr(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class OrExprContext extends ParserRuleContext {
  public andExpr(): AndExprContext[];
  public andExpr(i: number): AndExprContext;
  public andExpr(i?: number): AndExprContext | AndExprContext[] {
    if (i === undefined) {
      return this.getRuleContexts(AndExprContext);
    } else {
      return this.getRuleContext(i, AndExprContext);
    }
  }
  public OROR(): TerminalNode[];
  public OROR(i: number): TerminalNode;
  public OROR(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.OROR);
    } else {
      return this.getToken(intentlangParser.OROR, i);
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_orExpr;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterOrExpr) {
      listener.enterOrExpr(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitOrExpr) {
      listener.exitOrExpr(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitOrExpr) {
      return visitor.visitOrExpr(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class AndExprContext extends ParserRuleContext {
  public equalityExpr(): EqualityExprContext[];
  public equalityExpr(i: number): EqualityExprContext;
  public equalityExpr(i?: number): EqualityExprContext | EqualityExprContext[] {
    if (i === undefined) {
      return this.getRuleContexts(EqualityExprContext);
    } else {
      return this.getRuleContext(i, EqualityExprContext);
    }
  }
  public ANDAND(): TerminalNode[];
  public ANDAND(i: number): TerminalNode;
  public ANDAND(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.ANDAND);
    } else {
      return this.getToken(intentlangParser.ANDAND, i);
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_andExpr;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterAndExpr) {
      listener.enterAndExpr(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitAndExpr) {
      listener.exitAndExpr(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitAndExpr) {
      return visitor.visitAndExpr(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class EqualityExprContext extends ParserRuleContext {
  public relationalExpr(): RelationalExprContext[];
  public relationalExpr(i: number): RelationalExprContext;
  public relationalExpr(
    i?: number,
  ): RelationalExprContext | RelationalExprContext[] {
    if (i === undefined) {
      return this.getRuleContexts(RelationalExprContext);
    } else {
      return this.getRuleContext(i, RelationalExprContext);
    }
  }
  public EQEQ(): TerminalNode[];
  public EQEQ(i: number): TerminalNode;
  public EQEQ(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.EQEQ);
    } else {
      return this.getToken(intentlangParser.EQEQ, i);
    }
  }
  public BANGEQ(): TerminalNode[];
  public BANGEQ(i: number): TerminalNode;
  public BANGEQ(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.BANGEQ);
    } else {
      return this.getToken(intentlangParser.BANGEQ, i);
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_equalityExpr;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterEqualityExpr) {
      listener.enterEqualityExpr(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitEqualityExpr) {
      listener.exitEqualityExpr(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitEqualityExpr) {
      return visitor.visitEqualityExpr(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class RelationalExprContext extends ParserRuleContext {
  public additiveExpr(): AdditiveExprContext[];
  public additiveExpr(i: number): AdditiveExprContext;
  public additiveExpr(i?: number): AdditiveExprContext | AdditiveExprContext[] {
    if (i === undefined) {
      return this.getRuleContexts(AdditiveExprContext);
    } else {
      return this.getRuleContext(i, AdditiveExprContext);
    }
  }
  public LT(): TerminalNode[];
  public LT(i: number): TerminalNode;
  public LT(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.LT);
    } else {
      return this.getToken(intentlangParser.LT, i);
    }
  }
  public LTE(): TerminalNode[];
  public LTE(i: number): TerminalNode;
  public LTE(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.LTE);
    } else {
      return this.getToken(intentlangParser.LTE, i);
    }
  }
  public GT(): TerminalNode[];
  public GT(i: number): TerminalNode;
  public GT(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.GT);
    } else {
      return this.getToken(intentlangParser.GT, i);
    }
  }
  public GTE(): TerminalNode[];
  public GTE(i: number): TerminalNode;
  public GTE(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.GTE);
    } else {
      return this.getToken(intentlangParser.GTE, i);
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_relationalExpr;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterRelationalExpr) {
      listener.enterRelationalExpr(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitRelationalExpr) {
      listener.exitRelationalExpr(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitRelationalExpr) {
      return visitor.visitRelationalExpr(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class AdditiveExprContext extends ParserRuleContext {
  public multiplicativeExpr(): MultiplicativeExprContext[];
  public multiplicativeExpr(i: number): MultiplicativeExprContext;
  public multiplicativeExpr(
    i?: number,
  ): MultiplicativeExprContext | MultiplicativeExprContext[] {
    if (i === undefined) {
      return this.getRuleContexts(MultiplicativeExprContext);
    } else {
      return this.getRuleContext(i, MultiplicativeExprContext);
    }
  }
  public PLUS(): TerminalNode[];
  public PLUS(i: number): TerminalNode;
  public PLUS(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.PLUS);
    } else {
      return this.getToken(intentlangParser.PLUS, i);
    }
  }
  public MINUS(): TerminalNode[];
  public MINUS(i: number): TerminalNode;
  public MINUS(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.MINUS);
    } else {
      return this.getToken(intentlangParser.MINUS, i);
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_additiveExpr;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterAdditiveExpr) {
      listener.enterAdditiveExpr(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitAdditiveExpr) {
      listener.exitAdditiveExpr(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitAdditiveExpr) {
      return visitor.visitAdditiveExpr(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class MultiplicativeExprContext extends ParserRuleContext {
  public unaryExpr(): UnaryExprContext[];
  public unaryExpr(i: number): UnaryExprContext;
  public unaryExpr(i?: number): UnaryExprContext | UnaryExprContext[] {
    if (i === undefined) {
      return this.getRuleContexts(UnaryExprContext);
    } else {
      return this.getRuleContext(i, UnaryExprContext);
    }
  }
  public STAR(): TerminalNode[];
  public STAR(i: number): TerminalNode;
  public STAR(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.STAR);
    } else {
      return this.getToken(intentlangParser.STAR, i);
    }
  }
  public SLASH(): TerminalNode[];
  public SLASH(i: number): TerminalNode;
  public SLASH(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.SLASH);
    } else {
      return this.getToken(intentlangParser.SLASH, i);
    }
  }
  public PERCENT(): TerminalNode[];
  public PERCENT(i: number): TerminalNode;
  public PERCENT(i?: number): TerminalNode | TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(intentlangParser.PERCENT);
    } else {
      return this.getToken(intentlangParser.PERCENT, i);
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_multiplicativeExpr;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterMultiplicativeExpr) {
      listener.enterMultiplicativeExpr(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitMultiplicativeExpr) {
      listener.exitMultiplicativeExpr(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitMultiplicativeExpr) {
      return visitor.visitMultiplicativeExpr(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class UnaryExprContext extends ParserRuleContext {
  public unaryExpr(): UnaryExprContext | undefined {
    return this.tryGetRuleContext(0, UnaryExprContext);
  }
  public BANG(): TerminalNode | undefined {
    return this.getToken(intentlangParser.BANG, 0);
  }
  public MINUS(): TerminalNode | undefined {
    return this.getToken(intentlangParser.MINUS, 0);
  }
  public primaryExpr(): PrimaryExprContext | undefined {
    return this.tryGetRuleContext(0, PrimaryExprContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_unaryExpr;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterUnaryExpr) {
      listener.enterUnaryExpr(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitUnaryExpr) {
      listener.exitUnaryExpr(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitUnaryExpr) {
      return visitor.visitUnaryExpr(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class PrimaryExprContext extends ParserRuleContext {
  public literal(): LiteralContext | undefined {
    return this.tryGetRuleContext(0, LiteralContext);
  }
  public IDENT(): TerminalNode | undefined {
    return this.getToken(intentlangParser.IDENT, 0);
  }
  public LPAREN(): TerminalNode | undefined {
    return this.getToken(intentlangParser.LPAREN, 0);
  }
  public expr(): ExprContext | undefined {
    return this.tryGetRuleContext(0, ExprContext);
  }
  public RPAREN(): TerminalNode | undefined {
    return this.getToken(intentlangParser.RPAREN, 0);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_primaryExpr;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterPrimaryExpr) {
      listener.enterPrimaryExpr(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitPrimaryExpr) {
      listener.exitPrimaryExpr(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitPrimaryExpr) {
      return visitor.visitPrimaryExpr(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class LiteralContext extends ParserRuleContext {
  public STRING(): TerminalNode | undefined {
    return this.getToken(intentlangParser.STRING, 0);
  }
  public FLOAT(): TerminalNode | undefined {
    return this.getToken(intentlangParser.FLOAT, 0);
  }
  public INT(): TerminalNode | undefined {
    return this.getToken(intentlangParser.INT, 0);
  }
  public BOOL(): TerminalNode | undefined {
    return this.getToken(intentlangParser.BOOL, 0);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_literal;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterLiteral) {
      listener.enterLiteral(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitLiteral) {
      listener.exitLiteral(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitLiteral) {
      return visitor.visitLiteral(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class StringLiteralContext extends ParserRuleContext {
  public STRING(): TerminalNode {
    return this.getToken(intentlangParser.STRING, 0);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  public get ruleIndex(): number {
    return intentlangParser.RULE_stringLiteral;
  }
  // @Override
  public enterRule(listener: intentlangListener): void {
    if (listener.enterStringLiteral) {
      listener.enterStringLiteral(this);
    }
  }
  // @Override
  public exitRule(listener: intentlangListener): void {
    if (listener.exitStringLiteral) {
      listener.exitStringLiteral(this);
    }
  }
  // @Override
  public accept<Result>(visitor: intentlangVisitor<Result>): Result {
    if (visitor.visitStringLiteral) {
      return visitor.visitStringLiteral(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
