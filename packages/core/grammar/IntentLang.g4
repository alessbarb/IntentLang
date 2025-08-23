grammar IntentLang;

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
  : '"' ( '\\' . | ~["\\\r\n] )* '"'
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
  : '//' ~[\r\n]* -> skip
  ;

BLOCK_COMMENT
  : '/*' .*? '*/' -> skip
  ;

WS
  : [ \t\r\n]+ -> skip
  ;
