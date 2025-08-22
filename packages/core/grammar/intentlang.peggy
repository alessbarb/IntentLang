start = File

UpperLetter
  = [A-Z]

LowerLetter
  = [a-z]

DigitChar
  = [0-9]

letter
  = UpperLetter / LowerLetter / "_"

digit
  = DigitChar

ident
  = letter _ (letter / digit)*

string
  = "\"" _ (( "\\\" . / (!["\\\\"] .) ))* _ "\""

int
  = ("-")? _ digit _ (digit)*

float
  = ("-")? _ digit _ (digit)* _ "." _ digit _ (digit)*

bool
  = "true" / "false"

comment
  = "//" _ ((!"\n" .)*)* / "/*" _ ((!"*/" .)*)*

ws
  = (" " / "\t" / "\r" / "\n" / comment)*

File
  = ws _ (IntentSection)? _ (UsesSection)? _ (TypesSection)? _ (FuncDecl / EffectDecl / TestDecl)* _ ws

IntentSection
  = "intent" _ string _ "tags" _ "[" _ (string _ ("," _ string)*)? _ "]"

UsesSection
  = "uses" _ "{" _ ws _ (UseDecl)* _ "}"

UseDecl
  = ident _ ":" _ ident _ (ObjectExpr)? _ (",")?

TypesSection
  = "types" _ "{" _ ws _ (TypeDecl)* _ "}"

TypeDecl
  = "type" _ ident _ "=" _ TypeExpr _ (";" / ",")?

TypeExpr
  = UnionType / NonUnionType

NonUnionType
  = RecordType / GenericType / BrandType / TypeRef / BasicType / LiteralType

TypeRef
  = ident / "(" _ TypeExpr _ ")"

UnionType
  = ("|")? _ UnionCtor _ ("|" _ UnionCtor)*

UnionCtor
  = ident _ (RecordType)? / LiteralType

RecordType
  = "{" _ (FieldList)? _ "}"

FieldList
  = FieldDecl _ ("," _ FieldDecl)* _ (",")?

FieldDecl
  = ident _ ":" _ TypeExpr _ ("where" _ RefinementExpr)?

RefinementExpr
  = FunctionCall / Comparison

FunctionCall
  = ident _ "(" _ string _ ")"

Comparison
  = Accessor _ CompareOp _ Literal

Accessor
  = "_" _ ("." _ ident)?

CompareOp
  = "==" / "!=" / ">=" / "<=" / ">" / "<"

GenericType
  = ident _ "<" _ TypeExpr _ ("," _ TypeExpr)* _ ">"

BrandType
  = BasicType _ "brand" _ string

BasicType
  = "Bool" / "Int" / "Float" / "String" / "Bytes" / "Uuid" / "DateTime"

LiteralType
  = string

FuncDecl
  = "func" _ ident _ "(" _ (ParamList)? _ ")" _ ":" _ TypeExpr _ (ContractBlock)? _ Block

EffectDecl
  = "effect" _ ident _ "(" _ (ParamList)? _ ")" _ ":" _ TypeExpr _ (ContractBlock)? _ "uses" _ ident _ ("," _ ident)* _ Block

TestDecl
  = "test" _ ident _ Block

ParamList
  = Param _ ("," _ Param)*

Param
  = ident _ ":" _ TypeExpr

ContractBlock
  = ("requires" _ Expr)? _ ("ensures" _ Expr)?

Block
  = "{" _ ws _ (Stmt)* _ "}"

Stmt
  = LetStmt / ReturnStmt / IfStmt / MatchStmt / ForStmt / ExprStmt

LetStmt
  = "let" _ ident _ "=" _ Expr _ (";")?

ReturnStmt
  = "return" _ (Expr)? _ (";")?

IfStmt
  = "if" _ Expr _ Block _ ("else" _ Block)?

MatchStmt
  = MatchExpr _ (";")?

ForStmt
  = "for" _ ident _ "in" _ Expr _ Block

ExprStmt
  = Expr _ (";")?

Expr
  = AssignExpr

AssignExpr
  = CondExpr _ (AssignOp _ CondExpr)*

AssignOp
  = "=" / "+=" / "-=" / "*=" / "/=" / "%="

CondExpr
  = OrExpr _ ("?" _ Expr _ ":" _ Expr)?

OrExpr
  = AndExpr _ ("||" _ AndExpr)*

AndExpr
  = BitOrExpr _ ("&&" _ BitOrExpr)*

BitOrExpr
  = BitXorExpr _ ("|" _ BitXorExpr)*

BitXorExpr
  = BitAndExpr _ ("^" _ BitAndExpr)*

BitAndExpr
  = EqualityExpr _ ("&" _ EqualityExpr)*

EqualityExpr
  = RelExpr _ (("==" / "!=") _ RelExpr)*

RelExpr
  = ShiftExpr _ (("<" / "<=" / ">" / ">=") _ ShiftExpr)*

ShiftExpr
  = AddExpr _ (("<<" / ">>") _ AddExpr)*

AddExpr
  = MulExpr _ (("+" / "-") _ MulExpr)*

MulExpr
  = UnaryExpr _ (("*" / "/" / "%") _ UnaryExpr)*

UnaryExpr
  = ("!" / "-" / "~" / "++" / "--") _ UnaryExpr / PostfixExpr

PostfixExpr
  = Primary _ ("++" / "--" / "(" _ (ArgList)? _ ")" / "." _ ident)*

ArgList
  = Expr _ ("," _ Expr)*

Primary
  = Literal / ident / "(" _ Expr _ ")" / ObjectExpr / VariantExpr / ArrayExpr / MatchExpr / ResultOkExpr / ResultErrExpr / OptionSomeExpr / OptionNoneExpr / BrandCastExpr

ObjectExpr
  = "{" _ (RecordFieldList)? _ "}"

VariantExpr
  = ident _ "{" _ (RecordFieldList)? _ "}"

ArrayExpr
  = "[" _ (Expr _ ("," _ Expr)*)? _ "]"

MatchExpr
  = "match" _ Expr _ "{" _ (CaseClause)* _ "}"

RecordFieldList
  = RecordField _ ("," _ RecordField)* _ (",")?

RecordField
  = ident _ (":" _ Expr)?

ResultOkExpr
  = "Ok" _ "(" _ Expr _ ")"

ResultErrExpr
  = "Err" _ "(" _ Expr _ ")"

OptionSomeExpr
  = "Some" _ "(" _ Expr _ ")"

OptionNoneExpr
  = "None"

BrandCastExpr
  = "brand" _ "<" _ ident _ ">" _ "(" _ Expr _ ")"

CaseClause
  = Pattern _ ("if" _ Expr)? _ "=>" _ (Expr / Block) _ (";" / ",")?

Literal
  = string / float / int / bool

Pattern
  = LiteralPattern / VariantPattern

LiteralPattern
  = Literal

VariantPattern
  = ident _ (RecordPattern)?

RecordPattern
  = "{" _ (PatternFieldList)? _ "}"

PatternFieldList
  = PatternField _ ("," _ PatternField)* _ (",")?

PatternField
  = ident _ (":" _ ident)?

_ "whitespace"
  = [ \t\n\r]*
