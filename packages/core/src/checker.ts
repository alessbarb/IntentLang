import type { Program } from "./ast.js";

export function checkProgram(program: Program): void {
  const declared = new Set<string>();
  if (program.uses) {
    for (const u of program.uses.entries) declared.add(u.name);
  }
  for (const eff of program.effects) {
    for (const need of eff.uses) {
      if (!declared.has(need)) {
        throw new Error(`Effect ${eff.name} uses undeclared capability '${need}'`);
      }
    }
  }
}
