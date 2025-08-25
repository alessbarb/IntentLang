/**
 * Public API surface for the core IntentLang library.
 */
export * as AST from "./ast.js";
export { check } from "./checker/checker.js";
export type { Diagnostic } from "./diagnostics.js";
export { emitTypeScript } from "./transpilers/typescript.js";
export * from "./runtime/index.js";
export { parseIL, parseToAst } from "./parser.js";
export { formatProgram, type FormatOptions } from "./format/pretty.js";
