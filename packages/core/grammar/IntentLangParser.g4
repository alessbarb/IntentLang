parser grammar IntentLangParser;

options { tokenVocab=IntentLangLexer; }

// === Reglas de parser ===
ident
  : IDENT
  ;

string
  : STRING
  ;

int
  : INT
  ;

float
  : FLOAT
  ;

bool
  : BOOL
  ;

file
  : (moduleHeader? importDecl* intentSection? usesSection? typesSection? topLevelDecl*)
  ;

topLevelDecl
  : (declModifier? (funcDecl | effectDecl | topLevelConstDecl | testDecl | typeDecl))
  ;

declModifier
  : 'export'
  ;

moduleHeader
  : ('module' modulePath (('as' ident))? '')
  ;

modulePath
  : (ident (('.' ident))*)
  ;

importDecl
  : ('import' ((importList 'from' modulePath) | modulePath) (('as' ident))? '')
  ;

importList
  : ('{' ident ((',' ident))* ','? '}')
  ;

intentSection
  : ('intent' string tagList?)
  ;

tagList
  : ('tags' '[' string ((',' string))* ']')
  ;

usesSection
  : ('uses' '{' useDecl* '}')
  ;

useDecl
  : (ident ':' ident objectExpr? ','?)
  ;

typesSection
  : ('types' '{' typeDecl* '}')
  ;

typeDecl
  : ('type' ident '=' typeExpr (('where' refinementExpr))? '')
  ;

typeExpr
  : unionType | nonUnionType
  ;

nonUnionType
  : recordType | genericType | brandType | funcType | arrayType | mapType | typeRef | basicType | literalType
  ;

typeRef
  : ident | ('(' typeExpr ')')
  ;

unionType
  : ('|'? unionCtor (('|' unionCtor))*)
  ;

unionCtor
  : (ident recordType?) | literalType
  ;

recordType
  : ('{' fieldList? '}')
  ;

fieldList
  : (fieldDecl ((',' fieldDecl))* ','?)
  ;

fieldDecl
  : (ident ':' typeExpr (('where' refinementExpr))?)
  ;

refinementExpr
  : functionCall | comparison
  ;

functionCall
  : (ident '(' string ')')
  ;

comparison
  : (accessor compareOp literal)
  ;

accessor
  : ('_' (('.' ident))?)
  ;

compareOp
  : '==' | '!=' | '>=' | '<=' | '>' | '<'
  ;

genericType
  : (ident '<' typeExpr ((',' typeExpr))* '>')
  ;

brandType
  : (basicType 'brand' string)
  ;

basicType
  : 'Bool' | 'Int' | 'Float' | 'String' | 'Bytes' | 'Uuid' | 'DateTime'
  ;

literalType
  : string
  ;

funcType
  : ('(' paramTypeList? ')' '->' typeExpr)
  ;

paramTypeList
  : (paramType ((',' paramType))*)
  ;

paramType
  : (((ident ':'))? typeExpr)
  ;

arrayType
  : ('Array' '<' typeExpr '>')
  ;

mapType
  : ('Map' '<' typeExpr ',' typeExpr '>')
  ;

topLevelConstDecl
  : ('const' ident ':' typeExpr '=' expr '')
  ;

funcDecl
  : ('func' ident '(' paramList? ')' ':' typeExpr contractBlock? block)
  ;

effectDecl
  : ('effect' ident '(' paramList? ')' ':' typeExpr contractBlock? 'uses' ident ((',' ident))* block)
  ;

testDecl
  : ('test' ident block)
  ;

paramList
  : (param ((',' param))*)
  ;

param
  : (ident ':' typeExpr)
  ;

contractBlock
  : ((('requires' expr))? (('ensures' expr))?)
  ;

block
  : ('{' stmt* '}')
  ;

stmt
  : letStmt | constStmt | assignStmt | updateStmt | returnStmt | ifStmt | matchStmt | forStmt | whileStmt | tryStmt | breakStmt | continueStmt | exprStmt
  ;

letStmt
  : ('let' ident ':' typeExpr '=' expr '')
  ;

constStmt
  : ('const' ident ':' typeExpr '=' expr '')
  ;

assignStmt
  : (lValue assignOp expr '')
  ;

updateStmt
  : (lValue ('++' | '--') '')
  ;

lValue
  : (ident (('.' ident) | ('[' expr ']'))*)
  ;

assignOp
  : '=' | '+=' | '-=' | '*=' | '/=' | '%='
  ;

returnStmt
  : ('return' expr? '')
  ;

ifStmt
  : ('if' expr block (('else' block))?)
  ;

matchStmt
  : (matchExpr '')
  ;

forStmt
  : ('for' ident 'in' expr block)
  ;

whileStmt
  : ('while' expr block)
  ;

breakStmt
  : ('break' '')
  ;

continueStmt
  : ('continue' '')
  ;

tryStmt
  : ('try' block 'catch' '(' ident ')' block)
  ;

exprStmt
  : (expr '')
  ;

expr
  : condExpr
  ;

condExpr
  : (orExpr (('?' expr ':' expr))?)
  ;

orExpr
  : (andExpr (('||' andExpr))*)
  ;

andExpr
  : (bitOrExpr (('&&' bitOrExpr))*)
  ;

bitOrExpr
  : (bitXorExpr (('|' bitXorExpr))*)
  ;

bitXorExpr
  : (bitAndExpr (('^' bitAndExpr))*)
  ;

bitAndExpr
  : (equalityExpr (('&' equalityExpr))*)
  ;

equalityExpr
  : (relExpr ((('==' | '!=') relExpr))*)
  ;

relExpr
  : (shiftExpr ((('<' | '<=' | '>' | '>=') shiftExpr))*)
  ;

shiftExpr
  : (addExpr ((('<<' | '>>') addExpr))*)
  ;

addExpr
  : (mulExpr ((('+' | '-') mulExpr))*)
  ;

mulExpr
  : (unaryExpr ((('*' | '/' | '%') unaryExpr))*)
  ;

unaryExpr
  : (('!' | '-' | '~' | 'await' | 'spawn' | 'throw') unaryExpr) | postfixExpr
  ;

postfixExpr
  : (primary (('(' argList? ')') | ('.' ident) | ('[' expr ']'))*)
  ;

argList
  : (expr ((',' expr))*)
  ;

primary
  : literal | ident | ('(' expr ')') | objectExpr | variantExpr | arrayExpr | mapExpr | matchExpr | resultOkExpr | resultErrExpr | optionSomeExpr | optionNoneExpr | brandCastExpr | lambdaExpr
  ;

lambdaExpr
  : ('fn' '(' typedParamList? ')' ((':' typeExpr))? '=>' (expr | block))
  ;

typedParamList
  : (typedParam ((',' typedParam))*)
  ;

typedParam
  : (ident ':' typeExpr)
  ;

objectExpr
  : ('{' recordFieldList? '}')
  ;

variantExpr
  : (ident '{' recordFieldList? '}')
  ;

arrayExpr
  : ('[' ((expr ((',' expr))*))? ']')
  ;

mapExpr
  : ('Map' '{' ((mapEntry ((',' mapEntry))* ','?))? '}')
  ;

mapEntry
  : ('(' expr ':' expr ')')
  ;

matchExpr
  : ('match' expr '{' caseClause* '}')
  ;

recordFieldList
  : (recordField ((',' recordField))* ','?)
  ;

recordField
  : (ident ((':' expr))?)
  ;

resultOkExpr
  : ('Ok' '(' expr ')')
  ;

resultErrExpr
  : ('Err' '(' expr ')')
  ;

optionSomeExpr
  : ('Some' '(' expr ')')
  ;

optionNoneExpr
  : 'None'
  ;

brandCastExpr
  : ('brand' '<' ident '>' '(' expr ')')
  ;

caseClause
  : (pattern (('if' expr))? '=>' (expr | block) '')
  ;

literal
  : string | float | int | bool
  ;

pattern
  : literalPattern | variantPattern | recordPattern | identPattern
  ;

literalPattern
  : literal
  ;

variantPattern
  : (ident recordPattern?)
  ;

recordPattern
  : ('{' patternFieldList? '}')
  ;

patternFieldList
  : (patternField ((',' patternField))* ','?)
  ;

patternField
  : (ident ((':' ident))?)
  ;

identPattern
  : ident
  ;
