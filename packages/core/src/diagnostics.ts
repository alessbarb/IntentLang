// packages/core/src/diagnostics.ts

export type DiagnosticLevel = "error" | "warning";
export type DiagnosticDef = { level: DiagnosticLevel; message: string };

export const DIAGNOSTICS = {
  // ILC02xx: Types
  ILC0201: {
    level: "error",
    message: "Duplicate type '{type}'.",
  },
  ILC0202: {
    level: "error",
    message: "Unknown type '{type}'.",
  },
  ILC0203: {
    level: "warning",
    message:
      "Mixed literal and named constructors in union. Prefer a single style.",
  },
  ILC0204: {
    level: "error",
    message: "Duplicate constructor '{ctor}' in union.",
  },
  ILC0205: {
    level: "error",
    message: "'{kind}' must be Bool. Got {type}.",
  },
  ILC0206: {
    level: "error",
    message: "Unknown function or effect '{name}' in test.",
  },
  ILC0207: {
    level: "error",
    message: "Return type mismatch: got {got}, expected {expected}.",
  },
  ILC0208: {
    level: "error",
    message: "If condition must be Bool. Got {type}.",
  },
  ILC0209: {
    level: "error",
    message: "Unknown identifier '{name}'.",
  },
  ILC0210: {
    level: "error",
    message: "Cannot resolve call target.",
  },
  ILC0211: {
    level: "error",
    message: "'!' expects Bool. Got {type}.",
  },
  ILC0212: {
    level: "error",
    message: "Unary '-' expects Number. Got {type}.",
  },
  ILC0213: {
    level: "error",
    message: "Logical '{op}' expects Bool operands.",
  },
  ILC0214: {
    level: "error",
    message: "'{op}' requires comparable operands. Got {left} and {right}.",
  },
  ILC0215: {
    level: "error",
    message: "Relational '{op}' expects Number operands.",
  },
  ILC0216: {
    level: "error",
    message: "Arithmetic '{op}' expects Number operands.",
  },
  ILC0217: {
    level: "error",
    message: "Function '{name}' expects {expected} argument(s), got {got}.",
  },
  ILC0218: {
    level: "error",
    message:
      "Argument {index} of '{name}' mismatch: got {got}, expected {expected}.",
  },
  ILC0219: {
    level: "error",
    message: "Pattern must be a named constructor for this union.",
  },
  ILC0220: {
    level: "error",
    message: "Unknown case '{ctor}' for union. Did you mean '{suggestion}'?",
  },
  ILC0221: {
    level: "warning",
    message: "Unreachable duplicate case for constructor '{ctor}'.",
  },
  ILC0222: {
    level: "error",
    message: "Constructor '{ctor}' has no field '{field}'.",
  },
  ILC0223: {
    level: "error",
    message:
      "In a 'match' used as an expression, each case must be an expression (not a block).",
  },
  ILC0224: {
    level: "error",
    message: "Non-exhaustive match. Missing: {missing}.",
  },
  ILC0225: {
    level: "error",
    message: "Pattern must be a literal for this union.",
  },
  ILC0226: {
    level: "error",
    message: "Unknown literal case '{literal}'. Did you mean '{suggestion}'?",
  },
  ILC0227: {
    level: "warning",
    message: "Unreachable duplicate case for literal '{literal}'.",
  },
  ILC0228: {
    level: "warning",
    message: "'match' on non-union type {type} — exhaustiveness not enforced.",
  },

  ILC0229: {
    level: "error",
    message: "Match guard must be Bool. Got {type}.",
  },

  // ILC03xx: Capabilities & Effects
  ILC0301: {
    level: "error",
    message:
      "Effect '{effect}' lists undeclared capability '{cap}'. Add it to 'uses { ... }'.",
  },
  ILC0302: {
    level: "error",
    message: "Pure function '{func}' cannot use capability '{cap}'.",
  },
  ILC0303: {
    level: "error",
    message:
      "Effect '{effect}' uses capability '{cap}' but it is not listed in 'uses' for this effect.",
  },

  // ILC040x: CLI errors
  ILC0401: {
    level: "error",
    message:
      "Unknown flag or invalid combination of flags '{flags}' in 'uses' declaration.",
  },
  ILC0402: {
    level: "error",
    message: "File not found or empty pattern.",
  },
  ILC0403: {
    level: "error",
    message: "Invalid configuration file.",
  },
} as const satisfies Record<string, DiagnosticDef>;
