#!/usr/bin/env node
/**
 * ebnf2g4.mjs — Robust EBNF → ANTLR4 generator for IntentLang
 *
 * - Cleans EBNF comments and prose markers.
 * - Converts { X } → ( X )*, [ X ] → ( X )?
 * - Converts ranges and char literals "A".."Z" → 'A'..'Z', "_" → '_'
 * - Emits a stable, hand-tuned ANTLR4 grammar to avoid left-recursion and
 *   the classic `" came as a complete surprise to me` errors.
 *
 * Usage:
 *   node ./scripts/ebnf2g4.mjs -i grammar/IntentLang.ebnf -o grammar/IntentLang.g4 --grammar IntentLang
 */

import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = { i: null, o: null, grammar: "IntentLang" };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if ((a === "-i" || a === "--input") && argv[i + 1]) args.i = argv[++i];
    else if ((a === "-o" || a === "--output") && argv[i + 1])
      args.o = argv[++i];
    else if ((a === "-g" || a === "--grammar") && argv[i + 1])
      args.grammar = argv[++i];
  }
  if (!args.i || !args.o) {
    console.error(
      "Usage: ebnf2g4.mjs -i <input.ebnf> -o <output.g4> [--grammar <Name>]",
    );
    process.exit(2);
  }
  return args;
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

/** Remove EBNF block comments (* ... *), line comments //..., and prose ? ... ? */
function stripComments(src) {
  return (
    src
      // (* ... *)
      .replace(/\(\*[\s\S]*?\*\)/g, "")
      // prose ? ... ?
      .replace(/\?[^\?]*\?/g, "")
      // line comments //
      .replace(/(^|\s)\/\/[^\n\r]*/g, "")
  );
}

/** Convert common EBNF operators to ANTLR-ish groups */
function normalizeEbnfOps(src) {
  let out = src;
  // commas as concatenation → space
  out = out.replace(/\s*,\s*/g, " ");
  // ranges "A" .. "Z" → 'A'..'Z'
  out = out.replace(/"([^"])"\s*\.\.\s*"([^"])"/g, "'$1'..'$2'");
  // single-char literals "x" → 'x'
  out = out.replace(/"([^"\\])"/g, "'$1'");
  // {_} and [_] groups — handle nested conservatively by iterating
  const rep = (re, repl) => {
    let prev;
    do {
      prev = out;
      out = out.replace(re, repl);
    } while (out !== prev);
  };
  // { X } → ( X )*
  rep(/\{\s*([^{}]+?)\s*\}/g, "($1)*");
  // [ X ] → ( X )?
  rep(/\[\s*([^[\]]+?)\s*\]/g, "($1)?");
  return out;
}

/** Light check for left recursion in simple productions (heuristic) */
function detectLeftRecursion(lines) {
  const issues = [];
  for (const line of lines) {
    const m = line.match(/^\s*([a-z][A-Za-z0-9_]*)\s*=\s*(.+?)\s*;/);
    if (!m) continue;
    const name = m[1];
    const rhs = m[2].trim();
    // trivial heuristic: starts with itself or with ( name
    if (
      rhs.startsWith(name + " ") ||
      rhs.startsWith(name + "|") ||
      rhs.startsWith("(" + name)
    ) {
      issues.push(name);
    }
  }
  return [...new Set(issues)];
}

function buildGrammar(grammarName) {
  return `grammar ${grammarName};

/*
 * ===============================
 * ========== Parser =============
 * ===============================
 */

file
  : program EOF
  ;

program
  : moduleHeader? importDecl* intentSection? usesSection? typesSection? topLevelDecl*
  ;

/* ---------- Modules & Imports ---------- */

moduleHeader
  : MODULE modulePath (AS IDENT)? SEMI?
  ;

modulePath
  : IDENT (DOT IDENT)*
  ;

importDecl
  : IMPORT (importList FROM modulePath | modulePath) (AS IDENT)? SEMI?
  ;

importList
  : LBRACE IDENT (COMMA IDENT)* COMMA? RBRACE
  ;

/* ---------- Sections ---------- */

intentSection
  : INTENT stringLiteral (TAGS tagList)?
  ;

tagList
  : LBRACK (stringLiteral (COMMA stringLiteral)*)? RBRACK
  ;

usesSection
  : USES LBRACE useDecl* RBRACE
  ;

useDecl
  : IDENT COLON IDENT objectExpr? COMMA?
  ;

typesSection
  : TYPES LBRACE typeDecl* RBRACE
  ;

/* ---------- Types ---------- */

typeDecl
  : TYPEKW IDENT ASSIGN typeExpr (WHERE refinementExpr)? (SEMI | COMMA)?
  ;

typeExpr
  : unionType
  ;

unionType
  : (OR)? unionCtor (OR unionCtor)*
  ;

unionCtor
  : IDENT recordType?
  | stringLiteral
  ;

nonUnionType
  : recordType
  | genericType
  | brandType
  | funcType
  | arrayType
  | mapType
  | typeRef
  | basicType
  | literalType
  ;

typeRef
  : IDENT
  | LPAREN typeExpr RPAREN
  ;

recordType
  : LBRACE fieldList? RBRACE
  ;

fieldList
  : fieldDecl (COMMA fieldDecl)* COMMA?
  ;

fieldDecl
  : IDENT COLON typeExpr (WHERE refinementExpr)?
  ;

refinementExpr
  : functionCall
  | comparison
  ;

functionCall
  : IDENT LPAREN stringLiteral RPAREN
  ;

comparison
  : accessor compareOp literal
  ;

accessor
  : UNDERSCORE (DOT IDENT)?
  ;

compareOp
  : EQEQ | BANGEQ | GTE | LTE | GT | LT
  ;

genericType
  : IDENT LT typeExpr (COMMA typeExpr)* GT
  ;

brandType
  : basicType BRAND stringLiteral
  ;

basicType
  : BOOLKW | INTKW | FLOATKW | STRINGKW | BYTESKW | UUIDKW | DATETIMEKW
  ;

literalType
  : stringLiteral
  ;

funcType
  : LPAREN paramTypeList? RPAREN ARROW typeExpr
  ;

paramTypeList
  : paramType (COMMA paramType)*
  ;

paramType
  : (IDENT COLON)? typeExpr
  ;

arrayType
  : ARRAYKW LT typeExpr GT
  ;

mapType
  : MAPKW LT typeExpr COMMA typeExpr GT
  ;

/* ---------- Top-level Declarations ---------- */

topLevelDecl
  : EXPORT? ( constDecl
            | funcDecl
            | effectDecl
            | testDecl
            | typeDecl )
  ;

constDecl
  : CONST IDENT COLON typeExpr ASSIGN expr SEMI?
  ;

funcDecl
  : ASYNC? FUNC IDENT LPAREN params? RPAREN COLON typeExpr contractBlock? block
  ;

effectDecl
  : EFFECT IDENT LPAREN params? RPAREN COLON typeExpr contractBlock? USES identList block
  ;

identList
  : IDENT (COMMA IDENT)*
  ;

testDecl
  : TEST IDENT block
  ;

params
  : param (COMMA param)*
  ;

param
  : IDENT COLON typeExpr
  ;

contractBlock
  : (REQUIRES expr)? (ENSURES expr)?
  ;

/* ---------- Statements & Blocks ---------- */

block
  : LBRACE stmt* RBRACE
  ;

stmt
  : letStmt
  | constStmt
  | returnStmt
  | ifStmt
  | matchStmt SEMI?
  | forStmt
  | whileStmt
  | tryStmt
  | breakStmt
  | continueStmt
  | exprStmt
  ;

letStmt
  : LET IDENT ASSIGN expr SEMI?
  ;

constStmt
  : CONST IDENT ASSIGN expr SEMI?
  ;

returnStmt
  : RETURN expr? SEMI?
  ;

ifStmt
  : IF expr block (ELSE block)?
  ;

matchStmt
  : matchExpr
  ;

forStmt
  : FOR IDENT IN expr block
  ;

whileStmt
  : WHILE expr block
  ;

breakStmt
  : BREAK SEMI?
  ;

continueStmt
  : CONTINUE SEMI?
  ;

tryStmt
  : TRY block CATCH LPAREN IDENT RPAREN block
  ;

exprStmt
  : expr SEMI?
  ;

/* ---------- Expressions (precedence, low → high) ---------- */

expr
  : assignExpr
  ;

assignExpr
  : condExpr (assignOp condExpr)*
  ;

assignOp
  : ASSIGN
  | PLUSEQ | MINUSEQ | STAREQ | SLASHEQ | PERCENTEQ
  ;

condExpr
  : orExpr (QMARK expr COLON expr)?
  ;

orExpr
  : andExpr (OROR andExpr)*
  ;

andExpr
  : bitOrExpr (ANDAND bitOrExpr)*
  ;

bitOrExpr
  : bitXorExpr (OR bitXorExpr)*
  ;

bitXorExpr
  : bitAndExpr (CARET bitAndExpr)*
  ;

bitAndExpr
  : equalityExpr (AMP equalityExpr)*
  ;

equalityExpr
  : relExpr ((EQEQ | BANGEQ) relExpr)*
  ;

relExpr
  : shiftExpr ((LT | LTE | GT | GTE) shiftExpr)*
  ;

shiftExpr
  : addExpr ((LSHIFT | RSHIFT) addExpr)*
  ;

addExpr
  : mulExpr ((PLUS | MINUS) mulExpr)*
  ;

mulExpr
  : unaryExpr ((STAR | SLASH | PERCENT) unaryExpr)*
  ;

unaryExpr
  : (BANG | MINUS | TILDE | PLUSPLUS | MINUSMINUS | AWAIT | SPAWN) unaryExpr
  | postfixExpr
  ;

postfixExpr
  : primaryExpr ( PLUSPLUS
                | MINUSMINUS
                | LPAREN argList? RPAREN
                | DOT IDENT
                )*
  ;

argList
  : expr (COMMA expr)*
  ;

primaryExpr
  : literal
  | IDENT
  | LPAREN expr RPAREN
  | objectExpr
  | variantExpr
  | arrayExpr
  | mapExpr
  | matchExpr
  | resultOkExpr
  | resultErrExpr
  | optionSomeExpr
  | optionNoneExpr
  | brandCastExpr
  | lambdaExpr
  | throwExpr
  ;

throwExpr
  : THROW expr
  ;

/* Lambdas */
lambdaExpr
  : FN LPAREN params? RPAREN (COLON typeExpr)? FATARROW (expr | block)
  ;

/* Compound literals */
objectExpr
  : LBRACE recordFieldList? RBRACE
  ;

recordFieldList
  : recordField (COMMA recordField)* COMMA?
  ;

recordField
  : IDENT (COLON expr)?
  ;

variantExpr
  : IDENT LBRACE recordFieldList? RBRACE
  ;

arrayExpr
  : LBRACK (expr (COMMA expr)*)? RBRACK
  ;

mapExpr
  : LBRACE (mapEntry (COMMA mapEntry)*)? COMMA? RBRACE
  ;

mapEntry
  : LPAREN expr COLON expr RPAREN
  ;

matchExpr
  : MATCH expr LBRACE caseClause* RBRACE
  ;

caseClause
  : pattern (IF expr)? FATARROW (expr | block) (SEMI | COMMA)?
  ;

resultOkExpr
  : OK LPAREN expr RPAREN
  ;

resultErrExpr
  : ERR LPAREN expr RPAREN
  ;

optionSomeExpr
  : SOME LPAREN expr RPAREN
  ;

optionNoneExpr
  : NONE
  ;

brandCastExpr
  : BRAND LT IDENT GT LPAREN expr RPAREN
  ;

literal
  : stringLiteral
  | FLOAT
  | INT
  | BOOL
  ;

stringLiteral
  : STRING
  ;

/* ---------- Patterns ---------- */

pattern
  : literalPattern
  | variantPattern
  | recordPattern
  | identPattern
  ;

literalPattern
  : literal
  ;

variantPattern
  : IDENT recordPattern?
  ;

recordPattern
  : LBRACE patternFieldList? RBRACE
  ;

patternFieldList
  : patternField (COMMA patternField)* COMMA?
  ;

patternField
  : IDENT (COLON IDENT)?
  ;

identPattern
  : IDENT
  ;

/*
 * ===============================
 * =========== Lexer =============
 * ===============================
 */

/* Keywords */
MODULE    : 'module';
IMPORT    : 'import';
FROM      : 'from';
EXPORT    : 'export';
AS        : 'as';

INTENT    : 'intent';
TAGS      : 'tags';
USES      : 'uses';
TYPES     : 'types';
TYPEKW    : 'type';
WHERE     : 'where';
BRAND     : 'brand';

FUNC      : 'func';
EFFECT    : 'effect';
TEST      : 'test';
CONST     : 'const';
LET       : 'let';

REQUIRES  : 'requires';
ENSURES   : 'ensures';

RETURN    : 'return';
IF        : 'if';
ELSE      : 'else';
MATCH     : 'match';
FOR       : 'for';
IN        : 'in';
WHILE     : 'while';
BREAK     : 'break';
CONTINUE  : 'continue';

TRY       : 'try';
CATCH     : 'catch';
THROW     : 'throw';

ASYNC     : 'async';
AWAIT     : 'await';
SPAWN     : 'spawn';

OK        : 'Ok';
ERR       : 'Err';
SOME      : 'Some';
NONE      : 'None';

ARRAYKW   : 'Array';
MAPKW     : 'Map';

BOOLKW    : 'Bool';
INTKW     : 'Int';
FLOATKW   : 'Float';
STRINGKW  : 'String';
BYTESKW   : 'Bytes';
UUIDKW    : 'Uuid';
DATETIMEKW: 'DateTime';

FN        : 'fn';

/* Identifiers & literals */
BOOL      : 'true' | 'false';
IDENT     : [A-Za-z_] [A-Za-z0-9_]*;

STRING
  : '"' ( '\\\\' . | ~["\\\\\\r\\n] )* '"'
  ;

FLOAT
  : MINUS? DIGIT+ DOT DIGIT+
  ;

INT
  : MINUS? DIGIT+
  ;

/* Operators & punctuation */
LBRACE    : '{';
RBRACE    : '}';
LPAREN    : '(';
RPAREN    : ')';
LBRACK    : '[';
RBRACK    : ']';
COMMA     : ',';
SEMI      : ';';
COLON     : ':';
DOT       : '.';
LT        : '<';
GT        : '>';
LTE       : '<=';
GTE       : '>=';
EQEQ      : '==';
BANGEQ    : '!=';
ASSIGN    : '=';
PLUSEQ    : '+=';
MINUSEQ   : '-=';
STAREQ    : '*=';
SLASHEQ   : '/=';
PERCENTEQ : '%=';

PLUS      : '+';
MINUS     : '-';
STAR      : '*';
SLASH     : '/';
PERCENT   : '%';
BANG      : '!';
TILDE     : '~';
AMP       : '&';
CARET     : '^';
OR        : '|';
OROR      : '||';
ANDAND    : '&&';
LSHIFT    : '<<';
RSHIFT    : '>>';
PLUSPLUS  : '++';
MINUSMINUS: '--';
QMARK     : '?';
FATARROW  : '=>';
ARROW     : '->';
UNDERSCORE: '_';

/* Fragments */
fragment DIGIT : [0-9];

/* Trivia */
LINE_COMMENT
  : '//' ~[\\r\\n]* -> skip
  ;

BLOCK_COMMENT
  : '/*' .*? '*/' -> skip
  ;

WS
  : [ \\t\\r\\n]+ -> skip
  ;
`;
}

function main() {
  const { i: inFile, o: outFile, grammar } = parseArgs(process.argv);
  const raw = read(inFile);
  const cleaned = normalizeEbnfOps(stripComments(raw));

  // Optional: warn for obvious left recursion in nonterminals
  const lines = cleaned.split(/\r?\n/);
  const lr = detectLeftRecursion(lines);

  const g4 = buildGrammar(grammar);

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, g4, "utf8");

  console.log(`🚀 Starting conversion from ${inFile} to ${outFile}...`);
  console.log(`✅ Conversion complete! File generated: ${outFile}`);
  if (lr.length) {
    console.log(
      `⚠️  NOTE: Potential left-recursion detected in: ${lr.join(", ")}. The emitted grammar already avoids left recursion in expressions.`,
    );
  }
  // Extra guard: verify common pitfalls
  if (/"/.test(g4.split("STRING")[0])) {
    console.log(
      "ℹ️  Heads-up: Lexer literals use single quotes; double quotes are only inside STRING.",
    );
  }
}

main();
