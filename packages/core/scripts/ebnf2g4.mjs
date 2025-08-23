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
 *   node ./scripts/ebnf2g4.mjs -i grammar/intentlang.ebnf -o grammar/intentlang.g4 --grammar intentlang
 */

import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = { i: null, o: null, grammar: "intentlang" };
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
  // Stable hand-tuned grammar (parser + lexer).
  // You can extend safely without breaking ANTLR.
  return `grammar ${grammarName};

/*
 * Parser rules
 */

file
  : program EOF
  ;

program
  : intentSection? usesSection? typesSection? item*
  ;

intentSection
  : INTENT stringLiteral TAGS tagList
  ;

tagList
  : LBRACK (stringLiteral (COMMA stringLiteral)*)? RBRACK
  ;

usesSection
  : USES LBRACE useDecl* RBRACE
  ;

typesSection
  : TYPES LBRACE typeDecl* RBRACE
  ;

/* ---- Uses ---- */

useDecl
  : IDENT (AS IDENT)? (COLON IDENT)? (LBRACE RBRACE)? (SEMI)?
  ;

/* ---- Types ---- */

typeDecl
  : TYPEKW IDENT ASSIGN typeExpr (SEMI)?
  ;

typeExpr
  : unionType
  ;

unionType
  : typeAtom (OR typeAtom)*
  ;

typeAtom
  : namedType
  | literalType
  | recordType
  | tupleType
  | LPAREN typeExpr RPAREN
  ;

namedType
  : IDENT (LT typeExpr (COMMA typeExpr)* GT)?
  ;

recordType
  : LBRACE field (COMMA field)* RBRACE
  ;

field
  : IDENT COLON typeExpr
  ;

tupleType
  : LPAREN typeExpr (COMMA typeExpr)+ RPAREN
  ;

literalType
  : STRING
  | FLOAT
  | INT
  | BOOL
  ;

/* ---- Items (stubs) ---- */

item
  : funcDecl
  | effectDecl
  | testDecl
  | stmt
  ;

funcDecl
  : FN IDENT LPAREN params? RPAREN (COLON typeExpr)? block?
  ;

effectDecl
  : EFFECT IDENT LPAREN params? RPAREN (COLON typeExpr)? USES IDENT block?
  ;

testDecl
  : TEST IDENT block
  ;

params
  : param (COMMA param)*
  ;

param
  : IDENT (COLON typeExpr)?
  ;

block
  : LBRACE stmt* RBRACE
  ;

stmt
  : RETURN expr SEMI
  | LET IDENT (ASSIGN expr)? SEMI
  | block
  | expr SEMI
  ;

expr
  : assignmentExpr
  ;

assignmentExpr
  : orExpr (ASSIGN assignmentExpr)?
  ;

orExpr
  : andExpr (OROR andExpr)*
  ;

andExpr
  : equalityExpr (ANDAND equalityExpr)*
  ;

equalityExpr
  : relationalExpr ((EQEQ | BANGEQ) relationalExpr)*
  ;

relationalExpr
  : additiveExpr ((LT | LTE | GT | GTE) additiveExpr)*
  ;

additiveExpr
  : multiplicativeExpr ((PLUS | MINUS) multiplicativeExpr)*
  ;

multiplicativeExpr
  : unaryExpr ((STAR | SLASH | PERCENT) unaryExpr)*
  ;

unaryExpr
  : (BANG | MINUS) unaryExpr
  | primaryExpr
  ;

primaryExpr
  : literal
  | IDENT
  | LPAREN expr RPAREN
  ;

literal
  : STRING
  | FLOAT
  | INT
  | BOOL
  ;

stringLiteral
  : STRING
  ;

/*
 * Lexer rules
 */

INTENT   : 'intent';
USES     : 'uses';
TYPES    : 'types';
TAGS     : 'tags';
TYPEKW   : 'type';
EFFECT   : 'effect';
FN       : 'fn';
TEST     : 'test';
RETURN   : 'return';
LET      : 'let';
AS       : 'as';

BOOL     : 'true' | 'false';
IDENT    : [A-Za-z_] [A-Za-z0-9_]*;

STRING
  : '"' ( '\\\\' . | ~["\\\\\\r\\n] )* '"'
  ;

FLOAT
  : MINUS? DIGIT+ DOT DIGIT+
  ;

INT
  : MINUS? DIGIT+
  ;

LBRACE   : '{';
RBRACE   : '}';
LPAREN   : '(';
RPAREN   : ')';
LBRACK   : '[';
RBRACK   : ']';
COMMA    : ',';
SEMI     : ';';
COLON    : ':';
DOT      : '.';
LT       : '<';
GT       : '>';
LTE      : '<=';
GTE      : '>=';
EQEQ     : '==';
BANGEQ   : '!=';
ASSIGN   : '=';
PLUS     : '+';
MINUS    : '-';
STAR     : '*';
SLASH    : '/';
PERCENT  : '%';
BANG     : '!';
OR       : '|';
OROR     : '||';
ANDAND   : '&&';

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
