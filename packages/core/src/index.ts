/**
 * Public API surface for the core IntentLang library.
 */
export * as AST from "./ast.js";
export { parse } from "./parser/index.js";
export { check } from "./checker.js";
export type { Diagnostic } from "./checker.js";
export { emitTypeScript } from "./transpilers/typescript.js";
export * from "./runtime/index.js";
export { formatProgram } from "./format/pretty.js";
