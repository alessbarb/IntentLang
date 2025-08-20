# IntentLang Grammar (EBNF, v0.2)

Status: normative
Source of truth: `packages/core/grammar/intentlang.ebnf`

> This Markdown file is for human reference. The `intentlang.ebnf` file in
> `packages/core/grammar/` remains the canonical source for parsers and tests.

This document reorganizes the grammar into thematic sections to make the syntax
of IntentLang easier to scan.

## Lexical

```ebnf
UpperLetter     = ? an uppercase letter from 'A' to 'Z' ? ;
LowerLetter     = ? a lowercase letter from 'a' to 'z' ? ;
DigitChar       = ? a digit from '0' to '9' ? ;

letter          = UpperLetter | LowerLetter | "_" ;
digit           = DigitChar ;
ident           = letter , { letter | digit } ;

string          = '"' , { ? any string character, including escapes ? } , '"' ;
int             = ["-"] , digit , { digit } ;
float           = ["-"] , digit , { digit } , "." , digit , { digit } ;
bool            = "true" | "false" ;

comment         = "//" , { ? any character until end of line ? }
                | "/*" , { ? any character until "*/" ? } ;
ws              = { " " | "\t" | "\r" | "\n" | comment } ;
```

## File

```ebnf
File            = ws ,
                  [ IntentSection ] ,
                  [ UsesSection ] ,
                  [ TypesSection ] ,
                  { FuncDecl | EffectDecl | TestDecl } ,
                  ws ;
```

## Sections

```ebnf
IntentSection   = "intent" , string , "tags" , "[" , [ string , { "," , string } ] , "]" ;

UsesSection     = "uses" , "{" , ws , { UseDecl } , "}" ;
UseDecl         = ident , ":" , ident , [ RecordExpr ] , [","] ;

TypesSection    = "types" , "{" , ws , { TypeDecl } , "}" ;
TypeDecl        = "type" , ident , "=" , TypeExpr , [";" | ","] ;
```

## Type Expressions

```ebnf
TypeExpr        = UnionType | NonUnionType ;

NonUnionType    = RecordType
                | GenericType
                | BrandType
                | TypeRef
                | BasicType
                | LiteralType ;

TypeRef         = ident | "(" , TypeExpr , ")" ;

UnionType       = [ "|" ] , UnionCtor , { "|" , UnionCtor } ;
UnionCtor       = ident , [ RecordType ] | LiteralType ;

RecordType      = "{" , [ FieldList ] , "}" ;
FieldList       = FieldDecl , { "," , FieldDecl } , [ "," ] ;
FieldDecl       = ident , ":" , TypeExpr , [ "where" , RefinementExpr ] ;

RefinementExpr  = FunctionCall | Comparison ;
FunctionCall    = ident , "(" , string , ")" ;
Comparison      = Accessor , CompareOp , Literal ;
Accessor        = "_" , [ "." , ident ] ;
CompareOp       = "==" | "!=" | ">=" | "<=" | ">" | "<" ;
Literal         = number | string ;

GenericType     = ident , "<" , TypeExpr , { "," , TypeExpr } , ">" ;
BrandType       = BasicType , "brand" , string ;
BasicType       = "Bool" | "Int" | "Float" | "String" | "Bytes" | "Uuid" | "DateTime" ;
LiteralType     = string ;
```

## Declarations

```ebnf
FuncDecl        = "func" , ident , "(" , [ ParamList ] , ")" ,
                  ":" , TypeExpr ,
                  [ ContractBlock ] ,
                  Block ;

EffectDecl      = "effect" , ident , "(" , [ ParamList ] , ")" ,
                  ":" , TypeExpr ,
                  [ ContractBlock ] ,
                  "uses" , ident , { "," , ident } ,
                  Block ;

TestDecl        = "test" , ident , Block ;

ParamList       = Param , { "," , Param } ;
Param           = ident , ":" , TypeExpr ;

ContractBlock   = [ "requires" , Expr ] , [ "ensures" , Expr ] ;
```

## Statements & Blocks

```ebnf
Block           = "{" , ws , { Stmt } , "}" ;
Stmt            = LetStmt | ReturnStmt | IfStmt | MatchStmt | ExprStmt ;

LetStmt         = "let" , ident , "=" , Expr , [";"] ;
ReturnStmt      = "return" , [ Expr ] , [";"] ;
IfStmt          = "if" , Expr , Block , [ "else" , Block ] ;
MatchStmt       = MatchExpr , [";"] ;
ExprStmt        = Expr , [";"] ;
```

## Expressions (lowest → highest precedence)

```ebnf
Expr            = OrExpr ;
OrExpr          = AndExpr , { "||" , AndExpr } ;
AndExpr         = EqualityExpr , { "&&" , EqualityExpr } ;
EqualityExpr    = RelExpr , { ("==" | "!=") , RelExpr } ;
RelExpr         = AddExpr , { ("<" | "<=" | ">" | ">=") , AddExpr } ;
AddExpr         = MulExpr , { ("+" | "-") , MulExpr } ;
MulExpr         = UnaryExpr , { ("*" | "/" | "%") , UnaryExpr } ;
UnaryExpr       = ("!" | "-") , UnaryExpr | PostfixExpr ;

PostfixExpr     = Primary , { "(" , [ ArgList ] , ")" | "." , ident } ;
ArgList         = Expr , { "," , Expr } ;

Primary         = Literal
                | ident
                | "(" , Expr , ")"
                | ObjectExpr
                | VariantExpr
                | ArrayExpr
                | MatchExpr
                | ResultOkExpr
                | ResultErrExpr
                | OptionSomeExpr
                | OptionNoneExpr
                | BrandCastExpr ;

ObjectExpr      = "{" , [ RecordFieldList ] , "}" ;
VariantExpr     = ident , "{" , [ RecordFieldList ] , "}" ;
ArrayExpr       = "[" , [ Expr , { "," , Expr } ] , "]" ;
MatchExpr       = "match" , Expr , "{" , { CaseClause } , "}" ;

RecordFieldList = RecordField , { "," , RecordField } , [ "," ] ;
RecordField     = ident , [ ":" , Expr ] ;

ResultOkExpr    = "Ok" , "(" , Expr , ")" ;
ResultErrExpr   = "Err" , "(" , Expr , ")" ;
OptionSomeExpr  = "Some" , "(" , Expr , ")" ;
OptionNoneExpr  = "None" ;
BrandCastExpr   = "brand" , "<" , ident , ">" , "(" , Expr , ")" ;

CaseClause      = Pattern , "=>" , ( Expr | Block ) , [";" | ","] ;
Literal         = string | float | int | bool ;
```

## Patterns

```ebnf
Pattern         = LiteralPattern | VariantPattern ;
LiteralPattern  = Literal ;
VariantPattern  = ident , [ RecordPattern ] ;
RecordPattern   = "{" , [ PatternFieldList ] , "}" ;
PatternFieldList = PatternField , { "," , PatternField } , [ "," ] ;
PatternField     = ident , [ ":" , ident ] ;
```
